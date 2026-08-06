import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

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
 * Ensures database tables exist and demo user is created
 * seamlessly in serverless runtime (Vercel /tmp SQLite).
 */
export async function ensureDatabaseReady() {
  if (globalForPrisma.initialized) return;

  try {
    // 1. Create tables directly via raw SQL if they don't exist
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "name" TEXT,
        "email" TEXT UNIQUE NOT NULL,
        "password" TEXT NOT NULL,
        "currency" TEXT NOT NULL DEFAULT '$',
        "monthlyBudget" REAL,
        "onboarded" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Subscription" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "userId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "category" TEXT NOT NULL DEFAULT 'Other',
        "price" REAL NOT NULL,
        "billingCycle" TEXT NOT NULL DEFAULT 'MONTHLY',
        "customIntervalMonths" INTEGER DEFAULT 1,
        "nextRenewalDate" DATETIME NOT NULL,
        "trialEndDate" DATETIME,
        "autoRenew" INTEGER NOT NULL DEFAULT 1,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "notes" TEXT,
        "cancelUrl" TEXT,
        "cancelSteps" TEXT,
        "reminderDays" INTEGER NOT NULL DEFAULT 3,
        "flaggedLowUsage" INTEGER NOT NULL DEFAULT 0,
        "canceledAt" DATETIME,
        "verifiedAt" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Notification" (
        "id" TEXT PRIMARY KEY NOT NULL,
        "userId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'INFO',
        "read" INTEGER NOT NULL DEFAULT 0,
        "link" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
      );
    `);

    // 2. Check if demo user exists, if not seed it
    const demoUserExists = await prisma.user.findUnique({
      where: { email: "demo@subsmanager.app" },
    });

    if (!demoUserExists) {
      const hashedPassword = await bcrypt.hash("demo1234", 10);
      const user = await prisma.user.create({
        data: {
          id: "demo-user-id-1234",
          name: "Alex Morgan",
          email: "demo@subsmanager.app",
          password: hashedPassword,
          currency: "$",
          monthlyBudget: 150.0,
          onboarded: true,
        },
      });

      const now = new Date();
      const addDays = (d: Date, days: number) => {
        const r = new Date(d);
        r.setDate(r.getDate() + days);
        return r;
      };

      await prisma.subscription.createMany({
        data: [
          {
            userId: user.id,
            name: "Netflix Premium 4K",
            provider: "Netflix Inc.",
            category: "Streaming",
            price: 22.99,
            billingCycle: "MONTHLY",
            nextRenewalDate: addDays(now, 5),
            autoRenew: true,
            status: "ACTIVE",
            notes: "Shared with family household.",
            cancelUrl: "https://www.netflix.com/youraccount",
            reminderDays: 3,
            flaggedLowUsage: false,
          },
          {
            userId: user.id,
            name: "ChatGPT Plus",
            provider: "OpenAI",
            category: "AI & Tech",
            price: 20.0,
            billingCycle: "MONTHLY",
            nextRenewalDate: addDays(now, 14),
            autoRenew: true,
            status: "ACTIVE",
            notes: "AI research and daily coding assistance.",
            cancelUrl: "https://chat.openai.com/#settings",
            reminderDays: 3,
            flaggedLowUsage: false,
          },
          {
            userId: user.id,
            name: "Midjourney Pro Trial",
            provider: "Midjourney",
            category: "AI & Tech",
            price: 30.0,
            billingCycle: "MONTHLY",
            nextRenewalDate: addDays(now, 3),
            trialEndDate: addDays(now, 3),
            autoRenew: true,
            status: "TRIAL",
            notes: "Cancel before trial converts to paid plan!",
            cancelUrl: "https://www.midjourney.com/account",
            reminderDays: 1,
            flaggedLowUsage: true,
          },
          {
            userId: user.id,
            name: "iCloud+ 2TB",
            provider: "Apple",
            category: "Utilities",
            price: 119.99,
            billingCycle: "YEARLY",
            nextRenewalDate: addDays(now, 120),
            autoRenew: true,
            status: "ACTIVE",
            notes: "Photo backup & Family Storage.",
            cancelUrl: "https://appleid.apple.com/",
            reminderDays: 7,
            flaggedLowUsage: false,
          },
        ],
      });
    }

    globalForPrisma.initialized = true;
  } catch (error) {
    console.error("Native raw SQL db initialization error:", error);
  }
}
