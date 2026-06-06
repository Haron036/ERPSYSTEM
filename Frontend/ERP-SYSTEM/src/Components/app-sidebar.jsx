import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Boxes,
  ShoppingCart,
  Truck,
  Calculator,
  FolderKanban,
  HeartHandshake,
  BarChart3,
  Settings,
  Factory,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const operational = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Employees (HR)", url: "/employees", icon: Users },
  { title: "Inventory", url: "/inventory", icon: Boxes },
  { title: "Sales", url: "/sales", icon: ShoppingCart },
  { title: "Procurement", url: "/procurement", icon: Truck },
];

const financial = [
  { title: "Accounting", url: "/accounting", icon: Calculator },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "CRM", url: "/crm", icon: HeartHandshake },
  { title: "Reports", url: "/reports", icon: BarChart3 },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url) => pathname === url;

  const renderGroup = (label, items) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.url)}
                className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
              >
                <Link to={item.url} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <Factory className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-foreground">ROTECH ERP</span>
            <span className="text-[10px] text-sidebar-foreground/60">Manufacturing Suite v4.2</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {renderGroup("Operations", operational)}
        {renderGroup("Finance & Insights", financial)}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/80">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}