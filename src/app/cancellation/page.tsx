import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CancellationView } from "./CancellationView";

export const dynamic = "force-dynamic";

export default async function CancellationPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return <CancellationView subscriptions={subscriptions} />;
}
