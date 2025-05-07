import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { updateUserSchema, insertLinkSchema, updateLinkSchema } from "@shared/schema";
import { setupAuth } from "./auth";

// Configure multer for profile image uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage_config,
  limits: {
    fileSize: 1024 * 1024, // 1MB max file size
  },
  fileFilter: (_req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication and session handling
  setupAuth(app);

  // Create API routes
  const apiRouter = express.Router();
  
  // Get authenticated user profile
  apiRouter.get("/profile", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = req.user!;
    return storage.getLinksByUserId(user.id).then((links) => {
      return res.status(200).json({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        profilePicture: user.profilePicture,
        links,
      });
    }).catch((error) => {
      console.error("Error fetching profile links:", error);
      return res.status(500).json({ message: "Error fetching profile" });
    });
  });
  
  // Get public profile by username
  apiRouter.get("/profile/:username", async (req, res) => {
    try {
      const { username } = req.params;
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const links = await storage.getLinksByUserId(user.id);
      
      return res.status(200).json({
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        profilePicture: user.profilePicture,
        links,
      });
    } catch (error) {
      console.error("Error fetching public profile:", error);
      return res.status(500).json({ message: "Error fetching profile" });
    }
  });
  
  // Update user profile
  apiRouter.patch("/profile", upload.single("profileImage"), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      
      // Parse and validate request body
      const updateData: Record<string, any> = {};
      
      if (req.body.displayName) updateData.displayName = req.body.displayName;
      if (req.body.username) updateData.username = req.body.username;
      if (req.body.bio) updateData.bio = req.body.bio;
      
      // Validate data
      const validatedData = updateUserSchema.parse(updateData);
      
      // Handle profile image upload
      if (req.file) {
        // Get old profile picture to delete it later
        const user = await storage.getUserById(userId);
        const oldProfileImage = user?.profilePicture;
        
        // Update with new image path
        validatedData.profilePicture = `/uploads/${req.file.filename}`;
        
        // Delete old image if it exists
        if (oldProfileImage && oldProfileImage.startsWith("/uploads/")) {
          const oldImagePath = path.join(process.cwd(), oldProfileImage);
          fs.unlink(oldImagePath, (err) => {
            if (err && !err.message.includes("ENOENT")) {
              console.error("Error deleting old profile image:", err);
            }
          });
        }
      }
      
      // Update user profile
      const updatedUser = await storage.updateUser(userId, validatedData);
      
      return res.status(200).json({
        id: updatedUser.id,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        bio: updatedUser.bio,
        profilePicture: updatedUser.profilePicture,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Error updating profile" });
    }
  });
  
  // Delete profile image
  apiRouter.delete("/profile/image", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const user = await storage.getUserById(userId);
      if (!user || !user.profilePicture) {
        return res.status(404).json({ message: "No profile image found" });
      }
      
      // Remove image file
      if (user.profilePicture.startsWith("/uploads/")) {
        const imagePath = path.join(process.cwd(), user.profilePicture);
        fs.unlink(imagePath, (err) => {
          if (err && !err.message.includes("ENOENT")) {
            console.error("Error deleting profile image:", err);
          }
        });
      }
      
      // Update user record
      const updatedUser = await storage.updateUser(userId, {
        profilePicture: null,
      });
      
      return res.status(200).json({
        id: updatedUser.id,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        bio: updatedUser.bio,
        profilePicture: updatedUser.profilePicture,
      });
    } catch (error) {
      console.error("Error deleting profile image:", error);
      return res.status(500).json({ message: "Error deleting profile image" });
    }
  });
  
  // Create new link
  apiRouter.post("/links", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      
      // Validate request body
      const validatedData = insertLinkSchema.parse(req.body);
      
      // Get current highest order
      const userLinks = await storage.getLinksByUserId(userId);
      const highestOrder = userLinks.length > 0
        ? Math.max(...userLinks.map(link => link.order || 0))
        : -1;
      
      // Create new link
      const newLink = await storage.insertLink({
        userId: userId,
        platform: validatedData.platform,
        url: validatedData.url,
        title: validatedData.title || null,
        active: validatedData.active ?? true,
        order: highestOrder + 1,
      });
      
      return res.status(201).json(newLink);
    } catch (error) {
      console.error("Error creating link:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Error creating link" });
    }
  });
  
  // Update link
  apiRouter.patch("/links/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const linkId = parseInt(req.params.id);
      if (isNaN(linkId)) {
        return res.status(400).json({ message: "Invalid link ID" });
      }
      
      // Check if link exists and belongs to the user
      const link = await storage.getLinkById(linkId);
      if (!link) {
        return res.status(404).json({ message: "Link not found" });
      }
      
      if (link.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to update this link" });
      }
      
      // Validate and update
      const validatedData = updateLinkSchema.partial().parse({
        ...req.body,
        id: linkId,
      });
      
      const updatedLink = await storage.updateLink(linkId, validatedData);
      
      return res.status(200).json(updatedLink);
    } catch (error) {
      console.error("Error updating link:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Error updating link" });
    }
  });
  
  // Delete link
  apiRouter.delete("/links/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const linkId = parseInt(req.params.id);
      if (isNaN(linkId)) {
        return res.status(400).json({ message: "Invalid link ID" });
      }
      
      // Check if link exists and belongs to the user
      const link = await storage.getLinkById(linkId);
      if (!link) {
        return res.status(404).json({ message: "Link not found" });
      }
      
      if (link.userId !== userId) {
        return res.status(403).json({ message: "You don't have permission to delete this link" });
      }
      
      // Delete link
      await storage.deleteLink(linkId);
      
      return res.status(200).json({ message: "Link deleted successfully" });
    } catch (error) {
      console.error("Error deleting link:", error);
      return res.status(500).json({ message: "Error deleting link" });
    }
  });
  
  // Serve uploaded files
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  
  // Register API routes
  app.use("/api", apiRouter);

  // Create server
  const httpServer = createServer(app);

  return httpServer;
}
