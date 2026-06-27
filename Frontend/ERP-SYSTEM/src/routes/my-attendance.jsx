import { Factory, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import SettingsTab from "@/components/settings-tab";
import AttendanceTab from "../routes/attendance-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";

export default function MyAttendancePage() {
  const { user, logout } = useAuth();

  // ── Edge case: logged-in user has no linked employee record ──────────────────
  if (!user?.employeeId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-sm">
          <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
            <CalendarDays className="h-10 w-10 text-muted-foreground/40" />
            <div>
              <p className="text-sm font-medium">No employee record linked</p>
              <p className="text-xs text-muted-foreground mt-1">
                Ask your administrator to link your account to an employee record
                before you can record attendance.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              Sign out
            </Button>
          </CardContent>
        </Card>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Minimal header — no sidebar for employees ───────────────────────── */}
      <header className="border-b bg-card px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg
                          bg-primary text-primary-foreground shrink-0">
            <Factory className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">ROTECH ERP</p>
            <p className="text-[10px] text-muted-foreground">Employee Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block leading-tight">
            <p className="text-sm font-medium">{user.fullName}</p>
            <p className="text-[10px] text-muted-foreground">{user.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            Sign out
          </Button>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-1">
        <div className="mb-4">
          <h1 className="text-xl font-semibold">My Attendance</h1>
          <p className="text-sm text-muted-foreground">
            Clock in when you arrive and clock out when you leave.
          </p>
        </div>

        
        <Tabs defaultValue="attendance">
  <TabsList>
    <TabsTrigger value="attendance">Attendance</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="attendance" className="mt-4">
    <AttendanceTab viewerMode />
  </TabsContent>
  <TabsContent value="settings" className="mt-4">
    <SettingsTab />
  </TabsContent>
</Tabs>

      </main>

      <Toaster />
    </div>
  );
}