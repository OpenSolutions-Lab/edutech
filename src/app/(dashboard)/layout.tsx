import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col pl-[260px] transition-all duration-300">
        <Header />
        <div className="px-6 py-4">
          <Breadcrumbs />
        </div>
        <main className="flex-1 px-6 pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
