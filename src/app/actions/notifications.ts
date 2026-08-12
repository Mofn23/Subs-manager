import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getUserNotifications() {
  const user = await getCurrentUser();
  if (!user) return [];

  return await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function markNotificationAsRead(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  await prisma.notification.updateMany({
    where: { id, userId: user.id },
    data: { read: true },
  });

  revalidatePath("/");
  return { success: true };
}

export async function clearAllNotifications() {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  await prisma.notification.deleteMany({
    where: { userId: user.id },
  });

  revalidatePath("/");
  return { success: true };
}
