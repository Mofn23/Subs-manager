"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subscriptionSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createSubscription(formData: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return { error: "Session expired. Please log in again." };
    }

    let dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser && user.email) {
      dbUser = await prisma.user.findUnique({
        where: { email: user.email.toLowerCase() },
      });
    }

    if (!dbUser) {
      const hashedPassword = await bcrypt.hash("demo1234", 10);
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          name: user.name || "User",
          email: (user.email || "user@subsmanager.app").toLowerCase(),
          password: hashedPassword,
          currency: user.currency || "$",
          monthlyBudget: user.monthlyBudget || 150.0,
          onboarded: true,
        },
      });
    }

    const result = subscriptionSchema.safeParse(formData);
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    const data = result.data;

    const subscription = await prisma.subscription.create({
      data: {
        userId: dbUser.id,
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
        icon: data.icon || null,
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
  } catch (err: any) {
    console.error("Error creating subscription:", err);
    return { error: err?.message || "Failed to create subscription" };
  }
}

export async function updateSubscription(id: string, formData: unknown) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return { error: "Session expired. Please log in again." };
    }

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
        icon: data.icon || null,
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
  } catch (err: any) {
    console.error("Error updating subscription:", err);
    return { error: err?.message || "Failed to update subscription" };
  }
}

export async function deleteSubscription(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) return { error: "Unauthorized" };

    await prisma.subscription.deleteMany({
      where: { id, userId: user.id },
    });

    revalidatePath("/");
    revalidatePath("/timeline");
    revalidatePath("/insights");
    revalidatePath("/cancellation");
    return { success: true };
  } catch (err: any) {
    console.error("Error deleting subscription:", err);
    return { error: err?.message || "Failed to delete subscription" };
  }
}

export async function toggleLowUsageFlag(id: string, flagged: boolean) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) return { error: "Unauthorized" };

    await prisma.subscription.updateMany({
      where: { id, userId: user.id },
      data: { flaggedLowUsage: flagged },
    });

    revalidatePath("/");
    revalidatePath("/insights");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Failed to toggle flag" };
  }
}

export async function updateSubscriptionStatus(
  id: string,
  status: string,
  verified: boolean = false
) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) return { error: "Unauthorized" };

    const updateData: any = { status };
    if (status === "CANCELLED" || status === "VERIFIED_CANCELLED") {
      updateData.canceledAt = new Date();
      if (verified) updateData.verifiedAt = new Date();
    }

    await prisma.subscription.updateMany({
      where: { id, userId: user.id },
      data: updateData,
    });

    revalidatePath("/");
    revalidatePath("/cancellation");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Failed to update status" };
  }
}
