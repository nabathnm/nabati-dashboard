import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import Header from "@/components/common/header";
import AuthGuard from "@/components/auth-guard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto">{children}</div>
          <MobileBottomNav />
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
