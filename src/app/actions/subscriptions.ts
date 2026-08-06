"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subscriptionSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createSubscription(formData: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const result = subscriptionSchema.safeParse(formData);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const data = result.data;

  const subscription = await prisma.subscription.create({
    data: {
      userId: user.id,
      name: data.name,
      provider: data.provider,
      category: data.category,
      price: data.price,
      billingCycle: data.billingCycle,
      customIntervalMonths: data.customIntervalMonths || null,
      nextRenewalDate: new Date(data.nextRenewalDate),
      trialEndDate: data.trialEndDate ? new Date(data.trialEndDate) : null,
      autoRenew: data.autoRenew,
      status: data.status,
      notes: data.notes || null,
      cancelUrl: data.cancelUrl || null,
      cancelSteps: data.cancelSteps || null,
      reminderDays: data.reminderDays,
      flaggedLowUsage: data.flaggedLowUsage,
    },
  });

  revalidatePath("/");
  revalidatePath("/timeline");
  revalidatePath("/insights");
  revalidatePath("/cancellation");
  return { success: true, subscription };
}

export async function updateSubscription(id: string, formData: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const existing = await prisma.subscription.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) return { error: "Subscription not found" };

  const result = subscriptionSchema.safeParse(formData);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const data = result.data;

  const subscription = await prisma.subscription.update({
    where: { id },
    data: {
      name: data.name,
      provider: data.provider,
      category: data.category,
      price: data.price,
      billingCycle: data.billingCycle,
      customIntervalMonths: data.customIntervalMonths || null,
      nextRenewalDate: new Date(data.nextRenewalDate),
      trialEndDate: data.trialEndDate ? new Date(data.trialEndDate) : null,
      autoRenew: data.autoRenew,
      status: data.status,
      notes: data.notes || null,
      cancelUrl: data.cancelUrl || null,
      cancelSteps: data.cancelSteps || null,
      reminderDays: data.reminderDays,
      flaggedLowUsage: data.flaggedLowUsage,
    },
  });

  revalidatePath("/");
  revalidatePath("/timeline");
  revalidatePath("/insights");
  revalidatePath("/cancellation");
  return { success: true, subscription };
}

export async function toggleLowUsageFlag(id: string, flagged: boolean) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  await prisma.subscription.updateMany({
    where: { id, userId: user.id },
    data: { flaggedLowUsage: flagged },
  });

  revalidatePath("/");
  revalidatePath("/insights");
  return { success: true };
}

export async function updateSubscriptionStatus(id: string, status: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const isCanceling = status === "TO_CANCEL" || status === "CANCELLED";
  const isVerified = status === "VERIFIED_CANCELLED";

  await prisma.subscription.updateMany({
    where: { id, userId: user.id },
    data: {
      status,
      canceledAt: isCanceling ? new Date() : undefined,
      verifiedAt: isVerified ? new Date() : undefined,
    },
  });

  revalidatePath("/");
  revalidatePath("/cancellation");
  revalidatePath("/timeline");
  revalidatePath("/insights");
  return { success: true };
}

export async function deleteSubscription(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  await prisma.subscription.deleteMany({
    where: { id, userId: user.id },
  });

  revalidatePath("/");
  revalidatePath("/timeline");
  revalidatePath("/insights");
  revalidatePath("/cancellation");
  return { success: true };
}
