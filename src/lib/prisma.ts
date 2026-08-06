import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  initialized: boolean | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Ensures database tables exist and demo seed is inserted automatically
 * when running in serverless environments (like Vercel /tmp).
 */
export async function ensureDatabaseReady() {
  if (globalForPrisma.initialized) return;

  try {
    await prisma.user.count();
    globalForPrisma.initialized = true;
  } catch (error: any) {
    console.log("Database tables missing. Automatically initializing schema & seed data...");
    try {
      execSync("npx prisma db push --skip-generate", { stdio: "ignore" });
      execSync("node prisma/seed.js", { stdio: "ignore" });
      globalForPrisma.initialized = true;
    } catch (initErr) {
      console.error("Database auto-initialization error:", initErr);
    }
  }
}
