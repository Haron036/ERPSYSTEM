import { useRouterState } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";

export function PageShell({ title, breadcrumb, actions, children }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Login page renders without sidebar
  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col">
          <AppHeader title={title} breadcrumb={breadcrumb} />
          <main className="flex-1 space-y-4 p-4 md:p-6">
            {actions && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div />
                <div className="flex items-center gap-2">{actions}</div>
              </div>
            )}
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
