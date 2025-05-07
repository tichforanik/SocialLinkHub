import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("Seeding database...");
    
    // Check if demo user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(schema.users.username, "demo"),
    });
    
    // Create demo user if it doesn't exist
    let userId: number;
    
    if (!existingUser) {
      console.log("Creating demo user...");
      const [user] = await db.insert(schema.users).values({
        username: "demo",
        password: "demodemo",
        displayName: "Alex Johnson",
        bio: "Digital creator & photographer. Sharing my adventures and creative work through these links!",
        profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&h=200",
      }).returning();
      
      userId = user.id;
      console.log("Demo user created with ID:", userId);
    } else {
      userId = existingUser.id;
      console.log("Using existing demo user with ID:", userId);
    }
    
    // Check if demo user has any links
    const existingLinks = await db.query.links.findMany({
      where: eq(schema.links.userId, userId),
    });
    
    // Create demo links if none exist
    if (existingLinks.length === 0) {
      console.log("Creating demo links...");
      
      const demoLinks = [
        {
          userId,
          platform: "instagram",
          url: "https://instagram.com/alexjohnson",
          title: "Instagram",
          active: true,
          order: 0,
        },
        {
          userId,
          platform: "youtube",
          url: "https://youtube.com/@alexjohnson",
          title: "YouTube",
          active: true,
          order: 1,
        },
        {
          userId,
          platform: "twitter",
          url: "https://twitter.com/alexjohnson",
          title: "Twitter",
          active: true,
          order: 2,
        },
        {
          userId,
          platform: "store",
          url: "https://myshop.com/alexjohnson",
          title: "My Shop",
          active: true,
          order: 3,
        },
        {
          userId,
          platform: "spotify",
          url: "https://open.spotify.com/user/alexjohnson",
          title: "Spotify Playlist",
          active: true,
          order: 4,
        },
      ];
      
      await db.insert(schema.links).values(demoLinks);
      console.log("Demo links created!");
    } else {
      console.log("Demo links already exist, skipping...");
    }
    
    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
