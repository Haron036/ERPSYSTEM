import {
  Bell,
  Search,
  Moon,
  Sun,
  ChevronDown,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { notifications } from "@/lib/mock-data";

export function AppHeader({
  title,
  breadcrumb,
  user,
}) {
  const navigate = useNavigate();

  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Generate initials dynamically
  const getInitials = (name) => {
    if (!name) return "GU";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  // Logout handler
  const handleLogout = () => {
    // Remove token later when Spring Boot JWT is connected
    localStorage.removeItem("token");

    // Redirect to login page
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />

      <Separator
        orientation="vertical"
        className="h-5"
      />

      <div className="flex flex-col">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {breadcrumb ?? "Home"}
        </span>

        <h1 className="text-sm font-semibold leading-tight">
          {title}
        </h1>
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

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDark((prev) => !prev)}
          aria-label="Toggle theme"
        >
          {dark ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
            >
              <Bell className="h-4 w-4" />

              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-80"
          >
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>

              <Badge variant="secondary">
                {notifications.length}
              </Badge>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex-col items-start gap-0.5 py-2"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-medium">
                    {notification.title}
                  </span>

                  <span
                    className={
                      "h-1.5 w-1.5 rounded-full " +
                      (notification.severity === "destructive"
                        ? "bg-destructive"
                        : notification.severity === "warning"
                        ? "bg-warning"
                        : "bg-info")
                    }
                  />
                </div>

                <span className="text-xs text-muted-foreground">
                  {notification.body}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 gap-2 px-2"
            >
              <Avatar className="h-7 w-7">

                {/* Real profile image later */}
                <AvatarImage
                  src={user?.avatar}
                  alt={user?.name}
                />

                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>

              <div className="hidden text-left leading-tight md:block">
                <div className="text-xs font-semibold">
                  {user?.name || "Guest User"}
                </div>

                <div className="text-[10px] text-muted-foreground">
                  {user?.role || "User"}
                </div>
              </div>

              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">

            <DropdownMenuLabel>
              My Account
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => navigate("/profile")}
            >
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate("/preferences")}
            >
              Preferences
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate("/audit-log")}
            >
              Audit log
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-destructive"
              onClick={handleLogout}
            >
              Sign out
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

