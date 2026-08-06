import { getCurrentUser } from "@/lib/auth";
import { ensureDatabaseReady, prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsView } from "./SettingsView";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await ensureDatabaseReady();
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) redirect("/login");

  return <SettingsView initialUser={dbUser} />;
}
