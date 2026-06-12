import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query"; // 👈 Added missing Hook import
import { api } from "@/lib/api"; // 👈 Added missing api import

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
  Bell,
  Palette,
  User,
  ClipboardCheck, // 👈 Added this missing icon import
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { token } from "@/lib/api";

import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

const operational = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Employees (HR)", url: "/employees", icon: Users },
  { title: "Inventory", url: "/inventory", icon: Boxes },
  { title: "Sales", url: "/sales", icon: ShoppingCart },
  { title: "Procurement", url: "/procurement", icon: Truck },
];

const financial = [
  { title: "Accounting", url: "/accounting", icon: Calculator }, 
  { title: "Approvals", url: "/approvals", icon: ClipboardCheck },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "CRM", url: "/crm", icon: HeartHandshake },
  { title: "Reports", url: "/reports", icon: BarChart3 },
];

// ── Theme helpers ─────────────────────────────────────────────────────────────
function getTheme() {
  return localStorage.getItem("erp_theme") ?? "system";
}
function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  }
  if (theme === "light") {
    root.classList.remove("dark");
    root.classList.add("light");
  }
  if (theme === "system") {
    root.classList.remove("dark", "light");
    if (window.matchMedia("(prefers-color-scheme: dark)").matches)
      root.classList.add("dark");
  }
  localStorage.setItem("erp_theme", theme);
}

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url) => pathname === url;

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState(getTheme);

  // 🛠️ Moved inside the component context so React can handle the state & data lifecycle correctly
  const { data: pending = [] } = useQuery({
    queryKey: ["approvals-pending"],
    queryFn: () => api.get("/approvals/pending").then(r => r.data),
    refetchInterval: 30_000,
  });
  const pendingCount = pending.length;

  // Profile — pre-fill from stored user if available
  const storedUser = token.user() ?? {};
  const [profile, setProfile] = useState({
    fullName: storedUser.fullName ?? "",
    email: storedUser.email ?? "",
    role: storedUser.role ?? "",
  });

  // Notifications
  const [notifs, setNotifs] = useState({
    lowStock: true,
    overdueInvoice: true,
    newTicket: true,
    approvalNeeded: true,
    systemAlerts: false,
  });

  function handleThemeChange(val) {
    setTheme(val);
    applyTheme(val);
  }
  function handleSave() {
    localStorage.setItem("erp_theme", theme);
    setSettingsOpen(false);
    toast.success("Settings saved", {
      description: "Your changes have been applied.",
      duration: 3000,
    });
  }

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
                <Link to={item.url} className="flex items-center gap-2 w-full">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                  {item.url === "/approvals" && pendingCount > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center
                                     rounded-full bg-destructive text-destructive-foreground
                                     text-[10px] font-semibold px-1">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2 px-2 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <Factory className="h-4 w-4" />
            </div>
            <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold text-sidebar-foreground">
                ROTECH ERP
              </span>
              <span className="text-[10px] text-sidebar-foreground/60">
                Manufacturing Suite v4.2
              </span>
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
              <SidebarMenuButton
                className="text-sidebar-foreground/80"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              Settings
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="profile" className="mt-1">
            <TabsList className="w-full">
              <TabsTrigger value="profile" className="flex-1 gap-1.5">
                <User className="h-3.5 w-3.5" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex-1 gap-1.5">
                <Bell className="h-3.5 w-3.5" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="theme" className="flex-1 gap-1.5">
                <Palette className="h-3.5 w-3.5" />
                Theme
              </TabsTrigger>
            </TabsList>

            {/* Profile tab */}
            <TabsContent value="profile" className="mt-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-semibold select-none">
                  {profile.fullName
                    ? profile.fullName
                        .split(" ")
                        .map((p) => p[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "?"}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {profile.fullName || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {profile.role || "—"}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input
                  value={profile.fullName}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, fullName: e.target.value }))
                  }
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  value={profile.email}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="your@email.com"
                  type="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Input value={profile.role} disabled className="opacity-60" />
                <p className="text-[11px] text-muted-foreground">
                  Role is managed by your administrator.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label>Change Password</Label>
                <Input type="password" placeholder="New password…" />
              </div>
            </TabsContent>

            {/* Notifications tab */}
            <TabsContent value="notifications" className="mt-4 space-y-1">
              {[
                {
                  key: "lowStock",
                  label: "Low stock alerts",
                  desc: "Notify when SKUs fall below reorder point",
                },
                {
                  key: "overdueInvoice",
                  label: "Overdue invoice alerts",
                  desc: "Flag invoices past due date",
                },
                {
                  key: "newTicket",
                  label: "New support tickets",
                  desc: "Alert on incoming CRM tickets",
                },
                {
                  key: "approvalNeeded",
                  label: "Approval requests",
                  desc: "POs and journals awaiting sign-off",
                },
                {
                  key: "systemAlerts",
                  label: "System notifications",
                  desc: "Maintenance windows and updates",
                },
              ].map(({ key, label, desc }) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-md px-1 py-2.5 hover:bg-muted/40 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={notifs[key]}
                    onCheckedChange={(v) =>
                      setNotifs((n) => ({ ...n, [key]: v }))
                    }
                  />
                </div>
              ))}
            </TabsContent>

            {/* Theme tab */}
            <TabsContent value="theme" className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label>Appearance</Label>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System default</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Changes apply immediately across the entire app.
                </p>
              </div>

              {/* Visual preview cards */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    val: "light",
                    label: "Light",
                    bg: "bg-white",
                    border: "border-2",
                    preview: "bg-gray-100",
                  },
                  {
                    val: "dark",
                    label: "Dark",
                    bg: "bg-zinc-900",
                    border: "border-2",
                    preview: "bg-zinc-700",
                  },
                  {
                    val: "system",
                    label: "System",
                    bg: "bg-gradient-to-br from-white to-zinc-800",
                    border: "border",
                    preview: "bg-gray-400",
                  },
                ].map(({ val, label, bg, border, preview }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleThemeChange(val)}
                    className={`rounded-lg ${border} p-2 text-left transition-all
                      ${theme === val ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
                  >
                    <div
                      className={`${bg} rounded-md h-12 w-full mb-1.5 flex flex-col gap-1 p-1.5`}
                    >
                      <div className={`${preview} h-2 rounded w-3/4`} />
                      <div
                        className={`${preview} h-2 rounded w-1/2 opacity-60`}
                      />
                    </div>
                    <p className="text-xs font-medium text-center">{label}</p>
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t pt-3 mt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettingsOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  );
}