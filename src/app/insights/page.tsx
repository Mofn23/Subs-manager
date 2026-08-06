import { getCurrentUser } from "@/lib/auth";
import { ensureDatabaseReady, prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { InsightsView } from "./InsightsView";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  await ensureDatabaseReady();
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: user.id },
    orderBy: { price: "desc" },
  });

  return <InsightsView subscriptions={subscriptions} />;
}
