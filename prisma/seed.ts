import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with demo Apple-style subscriptions...");

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("demo1234", 10);

  const demoUser = await prisma.user.create({
    data: {
      name: "Alex Morgan",
      email: "demo@subsmanager.app",
      password: hashedPassword,
      currency: "$",
      monthlyBudget: 150.0,
      onboarded: true,
    },
  });

  const now = new Date();

  // Create demo subscriptions
  const subscriptions = [
    {
      userId: demoUser.id,
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
      userId: demoUser.id,
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
      userId: demoUser.id,
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
      userId: demoUser.id,
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
    {
      userId: demoUser.id,
      name: "Fitness First Club",
      provider: "Fitness First",
      category: "Fitness",
      price: 49.0,
      billingCycle: "MONTHLY",
      nextRenewalDate: addDays(now, 2),
      autoRenew: true,
      status: "TO_CANCEL",
      notes: "Rarely visit since moving to home gym. Needs cancellation.",
      cancelUrl: "https://fitnessfirst.com/manage",
      cancelSteps: "1. Log into portal\n2. Navigate to Membership\n3. Click Request Cancellation 3 days prior",
      reminderDays: 3,
      flaggedLowUsage: true,
    },
    {
      userId: demoUser.id,
      name: "Duolingo Super",
      provider: "Duolingo",
      category: "Education",
      price: 59.99,
      billingCycle: "YEARLY",
      nextRenewalDate: subDays(now, 10),
      autoRenew: false,
      status: "VERIFIED_CANCELLED",
      notes: "Successfully cancelled last month.",
      canceledAt: subDays(now, 15),
      verifiedAt: subDays(now, 10),
      cancelUrl: "https://www.duolingo.com/settings/plus",
      flaggedLowUsage: false,
    },
  ];

  for (const sub of subscriptions) {
    await prisma.subscription.create({ data: sub });
  }

  // Create initial demo notification
  await prisma.notification.create({
    data: {
      userId: demoUser.id,
      title: "Trial Expiring Soon",
      message: "Midjourney Pro Trial expires in 3 days ($30.00/mo). Check Cancellation Center if you don't wish to be charged.",
      type: "TRIAL_EXPIRING",
      read: false,
      link: "/cancellation",
    },
  });

  console.log("Demo seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
