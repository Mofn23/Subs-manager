import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardView } from "./DashboardView";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: user.id },
    orderBy: { nextRenewalDate: "asc" },
  });

  return <DashboardView initialSubscriptions={subscriptions} />;
}
