import { db } from "@db";
import { users, links, User, InsertUser, Link, UpdateUser } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export const storage = {
  // User operations
  async getUserById(id: number): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return result;
  },

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.query.users.findFirst({
      where: eq(users.username, username),
    });
    return result;
  },

  async insertUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  },

  async updateUser(id: number, data: Partial<UpdateUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  },

  // Link operations
  async getLinkById(id: number): Promise<Link | undefined> {
    const result = await db.query.links.findFirst({
      where: eq(links.id, id),
    });
    return result;
  },

  async getLinksByUserId(userId: number): Promise<Link[]> {
    const results = await db.query.links.findMany({
      where: eq(links.userId, userId),
      orderBy: (links, { asc }) => [asc(links.order)],
    });
    return results;
  },

  async insertLink(
    linkData: Omit<Link, "id" | "createdAt" | "updatedAt" | "icon">
  ): Promise<Link> {
    const [newLink] = await db.insert(links).values(linkData).returning();
    return newLink;
  },

  async updateLink(
    id: number,
    data: Partial<Omit<Link, "id" | "userId" | "createdAt" | "updatedAt">>
  ): Promise<Link> {
    const [updatedLink] = await db
      .update(links)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(links.id, id))
      .returning();
    return updatedLink;
  },

  async deleteLink(id: number): Promise<void> {
    await db.delete(links).where(eq(links.id, id));
  },
};
