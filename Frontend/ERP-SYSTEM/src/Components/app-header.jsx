import { Bell, Search, Moon, Sun, ChevronDown, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/useApi";

export function AppHeader({ title, breadcrumb }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: notifications = [] } = useNotifications();
  
  // 1. Initialize state from localStorage or DOM class inspection
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    }
    return "light";
  });

  // 2. Synchronize DOM changes when state updates
  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    localStorage.setItem("erp_theme", nextTheme);
    
    setTheme(nextTheme); // This updates React state and triggers a re-render
  }

  function handleLogout() {
    logout();
    navigate({ to: "/login" });
  }

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />
      <div className="flex flex-col">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {breadcrumb ?? "Home"}
        </span>
        <h1 className="text-sm font-semibold leading-tight">{title}</h1>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders, SKUs, customers…"
            className="h-9 w-72 pl-8 text-sm"
          />
        </div>

        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {/* 3. Render conditionally using the monitored React state */}
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <Badge variant="secondary">{notifications.length}</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="flex-col items-start gap-0.5 py-2"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-medium">{n.title}</span>
                  <span
                    className={
                      "h-1.5 w-1.5 rounded-full " +
                      (n.severity === "destructive"
                        ? "bg-destructive"
                        : n.severity === "warning"
                          ? "bg-warning"
                          : "bg-info")
                    }
                  />
                </div>
                <span className="text-xs text-muted-foreground">{n.body}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left leading-tight md:block">
                <div className="text-xs font-semibold">
                  {user?.fullName ?? "User"}
                </div>
                <div className="text-[10px] text-muted-foreground capitalize">
                  {user?.role?.toLowerCase() ?? "viewer"}
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuItem>Audit log</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}