"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { onboardingSchema, registerSchema, userSettingsSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function registerUser(formData: unknown) {
  const result = registerSchema.safeParse(formData);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { name, email, password } = result.data;
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return { error: "An account with this email already exists." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      currency: "$",
      onboarded: false,
    },
  });

  return { success: true, userId: user.id };
}

export async function completeOnboarding(formData: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const result = onboardingSchema.safeParse(formData);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { currency, monthlyBudget } = result.data;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      currency,
      monthlyBudget: monthlyBudget || null,
      onboarded: true,
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function updateUserSettings(formData: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const result = userSettingsSchema.safeParse(formData);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { name, currency, monthlyBudget } = result.data;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      currency,
      monthlyBudget: monthlyBudget || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/settings");
  return { success: true };
}

export async function exportUserData() {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      subscriptions: true,
      notifications: true,
    },
  });

  if (!dbUser) return { error: "User not found" };

  const { password, ...safeUser } = dbUser;
  return { success: true, data: safeUser };
}

export async function deleteAccount() {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  await prisma.user.delete({
    where: { id: user.id },
  });

  return { success: true };
}
