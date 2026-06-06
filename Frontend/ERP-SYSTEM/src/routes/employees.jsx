import { createFileRoute } from "@tanstack/react-router";
import { UserPlus, Download, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { KpiCard } from "@/components/kpi-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { employees, departmentHeadcount } from "@/lib/mock-data";

export const Route = createFileRoute("/employees")({
  head: () => ({ meta: [{ title: "Employees · NorthForge ERP" }] }),
  component: EmployeesPage,
});

function EmployeesPage() {
  const cols = [
    { key: "id", header: "ID" },
    {
      key: "name",
      header: "Name",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-muted text-[10px]">
              {r.name.split(" ").map((p) => p[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{r.name}</div>
            <div className="text-xs text-muted-foreground">{r.email}</div>
          </div>
        </div>
      ),
    },
    { key: "role", header: "Role" },
    { key: "dept", header: "Department" },
    { key: "joined", header: "Joined" },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <PageShell
      title="Employees & HR"
      breadcrumb="Human Resources"
      actions={
        <>
          <Button variant="outline" size="sm"><Download className="mr-1.5 h-3.5 w-3.5" />Export</Button>
          <Button size="sm"><UserPlus className="mr-1.5 h-3.5 w-3.5" />Add Employee</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Headcount" value={302} change={2.1} icon={<Users className="h-4 w-4" />} />
        <KpiCard label="Active Today" value={284} change={1.4} icon={<Users className="h-4 w-4" />} />
        <KpiCard label="On Leave" value={11} change={-3.2} icon={<Users className="h-4 w-4" />} />
        <KpiCard label="Open Positions" value={14} change={6.8} icon={<Users className="h-4 w-4" />} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Headcount by Department</CardTitle>
          <CardDescription>Current FTE distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentHeadcount} margin={{ left: -10, right: 8 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="dept" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }} />
                <Bar dataKey="count" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="directory">
        <TabsList>
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        <TabsContent value="directory" className="mt-3">
          <DataTable columns={cols} rows={employees} />
        </TabsContent>
        <TabsContent value="attendance" className="mt-3">
          <Card><CardContent className="p-6 text-sm text-muted-foreground">Attendance heatmap and check-in/out logs go here.</CardContent></Card>
        </TabsContent>
        <TabsContent value="leave" className="mt-3">
          <Card><CardContent className="p-6 text-sm text-muted-foreground">Leave balances, requests pending approval, and policies.</CardContent></Card>
        </TabsContent>
        <TabsContent value="payroll" className="mt-3">
          <Card><CardContent className="p-6 text-sm text-muted-foreground">Monthly payroll runs, payslips and tax filings.</CardContent></Card>
        </TabsContent>
        <TabsContent value="performance" className="mt-3">
          <Card><CardContent className="p-6 text-sm text-muted-foreground">Reviews, KPIs and 360° feedback cycles.</CardContent></Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
export default EmployeesPage;