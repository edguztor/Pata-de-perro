import { redirect } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { getSession } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <MainLayout
      user={{ name: session.name, username: session.username, role: session.role }}
    >
      {children}
    </MainLayout>
  );
}
