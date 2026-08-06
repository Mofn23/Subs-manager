import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const subscriptionSchema = z.object({
  name: z.string().min(1, "Subscription name is required"),
  provider: z.string().min(1, "Provider/Brand is required"),
  category: z.string().default("Other"),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  billingCycle: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY", "CUSTOM"]).default("MONTHLY"),
  customIntervalMonths: z.coerce.number().optional().nullable(),
  nextRenewalDate: z.string().min(1, "Next renewal date is required"),
  trialEndDate: z.string().optional().nullable(),
  autoRenew: z.boolean().default(true),
  status: z
    .enum(["ACTIVE", "PAUSED", "TO_CANCEL", "CANCELLED", "VERIFIED_CANCELLED", "TRIAL", "EXPIRED"])
    .default("ACTIVE"),
  notes: z.string().optional().nullable(),
  cancelUrl: z.string().optional().nullable(),
  cancelSteps: z.string().optional().nullable(),
  reminderDays: z.coerce.number().default(3),
  flaggedLowUsage: z.boolean().default(false),
});

export const onboardingSchema = z.object({
  currency: z.string().min(1, "Currency is required"),
  monthlyBudget: z.coerce.number().optional().nullable(),
});

export const userSettingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  currency: z.string().min(1, "Currency is required"),
  monthlyBudget: z.coerce.number().optional().nullable(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type UserSettingsInput = z.infer<typeof userSettingsSchema>;
