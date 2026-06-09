import { useState } from "react";
import { UserPlus, Download, Users, CheckCircle2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { KpiCard } from "@/components/kpi-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useEmployees, useCreateEmployee } from "@/hooks/useApi";
import { departmentHeadcount } from "@/lib/mock-data";

const EMPTY = { name:"", role:"", department:"", email:"", status:"ACTIVE", joinedDate:"" };

// Map backend status → display
const statusLabel = (s) => s === "ON_LEAVE" ? "On Leave" : s === "TERMINATED" ? "Terminated" : "Active";

export default function EmployeesPage() {
  const { data: employees = [], isLoading } = useEmployees();
  const createEmployee = useCreateEmployee();

  const [empOpen, setEmpOpen]       = useState(false);
  const [empSuccess, setEmpSuccess] = useState(false);
  const [empForm, setEmpForm]       = useState(EMPTY);

  async function submitEmp(e) {
    e.preventDefault();
    try {
      await createEmployee.mutateAsync(empForm);
      setEmpSuccess(true);
      setTimeout(() => { setEmpSuccess(false); setEmpOpen(false); setEmpForm(EMPTY); }, 1500);
    } catch (err) {
      alert(err.message);
    }
  }

  function handleExport() {
    const rows = [["Code","Name","Role","Department","Email","Status","Joined"],
      ...employees.map((e) => [e.employeeCode, e.name, e.role, e.department, e.email, e.status, e.joinedDate])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type:"text/csv" }));
    Object.assign(document.createElement("a"), { href:url, download:"employees.csv" }).click();
    URL.revokeObjectURL(url);
  }

  // Build headcount from live data, fall back to mock
  const headcount = employees.length
    ? Object.entries(
        employees.reduce((acc, e) => {
          acc[e.department] = (acc[e.department] || 0) + 1;
          return acc;
        }, {})
      ).map(([dept, count]) => ({ dept, count }))
    : departmentHeadcount;

  const cols = [
    { key:"employeeCode", header:"ID" },
    {
      key:"name", header:"Name",
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
    { key:"role",       header:"Role" },
    { key:"department", header:"Department" },
    { key:"joinedDate", header:"Joined" },
    { key:"status",     header:"Status", render:(r) => <StatusBadge value={statusLabel(r.status)} /> },
  ];

  const active   = employees.filter((e) => e.status === "ACTIVE").length;
  const onLeave  = employees.filter((e) => e.status === "ON_LEAVE").length;

  return (
    <>
      <PageShell
        title="Employees & HR"
        breadcrumb="Human Resources"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-1.5 h-3.5 w-3.5" />Export
            </Button>
            <Button size="sm" onClick={() => setEmpOpen(true)}>
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />Add Employee
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Total Headcount" value={employees.length || 302} change={2.1}  icon={<Users className="h-4 w-4" />} />
          <KpiCard label="Active Today"    value={active || 284}           change={1.4}  icon={<Users className="h-4 w-4" />} />
          <KpiCard label="On Leave"        value={onLeave || 11}           change={-3.2} icon={<Users className="h-4 w-4" />} />
          <KpiCard label="Open Positions"  value={14}                      change={6.8}  icon={<Users className="h-4 w-4" />} />
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Headcount by Department</CardTitle>
            <CardDescription>Current FTE distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={headcount} margin={{ left:-10, right:8 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="dept" tick={{ fontSize:11 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize:11 }} stroke="var(--muted-foreground)" />
                  <Tooltip contentStyle={{ background:"var(--popover)", border:"1px solid var(--border)", borderRadius:6, fontSize:12 }} />
                  <Bar dataKey="count" fill="var(--chart-1)" radius={[3,3,0,0]} />
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
            {isLoading
              ? <p className="py-8 text-center text-sm text-muted-foreground">Loading employees…</p>
              : <DataTable columns={cols} rows={employees} />}
          </TabsContent>
          <TabsContent value="attendance"  className="mt-3"><Card><CardContent className="p-6 text-sm text-muted-foreground">Attendance heatmap and check-in/out logs.</CardContent></Card></TabsContent>
          <TabsContent value="leave"       className="mt-3"><Card><CardContent className="p-6 text-sm text-muted-foreground">Leave balances, requests pending approval, and policies.</CardContent></Card></TabsContent>
          <TabsContent value="payroll"     className="mt-3"><Card><CardContent className="p-6 text-sm text-muted-foreground">Monthly payroll runs, payslips and tax filings.</CardContent></Card></TabsContent>
          <TabsContent value="performance" className="mt-3"><Card><CardContent className="p-6 text-sm text-muted-foreground">Reviews, KPIs and 360° feedback cycles.</CardContent></Card></TabsContent>
        </Tabs>
      </PageShell>

      <Dialog open={empOpen} onOpenChange={setEmpOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Employee</DialogTitle></DialogHeader>
          {empSuccess ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <p className="text-sm font-medium">Employee added successfully</p>
            </div>
          ) : (
            <form onSubmit={submitEmp} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label>Full Name</Label>
                  <Input placeholder="e.g. Jane Smith" value={empForm.name}
                    onChange={(e) => setEmpForm((f) => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Role / Job Title</Label>
                  <Input placeholder="e.g. QA Engineer" value={empForm.role}
                    onChange={(e) => setEmpForm((f) => ({ ...f, role: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Department</Label>
                  <Select value={empForm.department} onValueChange={(v) => setEmpForm((f) => ({ ...f, department: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      {["Manufacturing","Logistics","Sales","Finance","Human Resources","Engineering","Procurement","Operations","ICT"].map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Work Email</Label>
                  <Input type="email" placeholder="jane.s@rotech.co" value={empForm.email}
                    onChange={(e) => setEmpForm((f) => ({ ...f, email: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Start Date</Label>
                  <Input type="date" value={empForm.joinedDate}
                    onChange={(e) => setEmpForm((f) => ({ ...f, joinedDate: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={empForm.status} onValueChange={(v) => setEmpForm((f) => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEmpOpen(false)}>Cancel</Button>
                <Button type="submit"
                  disabled={!empForm.name || !empForm.role || !empForm.department || !empForm.email || !empForm.joinedDate || createEmployee.isPending}>
                  {createEmployee.isPending ? "Saving…" : "Add Employee"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
