import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-[240px] flex flex-col min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
