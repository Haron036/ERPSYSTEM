import { useState } from "react";
import { UserPlus, Download, Users, CheckCircle2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { KpiCard } from "@/components/kpi-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
// Keep your mock imports
import { employees as initialEmployees, departmentHeadcount } from "@/lib/mock-data";

const EMPTY_EMP = {
  name: "",
  role: "",
  dept: "",
  email: "",
  joined: "",
  status: "Active",
};

export default function EmployeesPage() {
  const [empOpen, setEmpOpen] = useState(false);
  const [empSuccess, setEmpSuccess] = useState(false);
  const [empForm, setEmpForm] = useState(EMPTY_EMP);
  
  // 1. Core Fix: Turn the imported array into React Component State
  const [employeeList, setEmployeeList] = useState(initialEmployees);

  function submitEmp(e) {
    e.preventDefault();
    
    // 2. Core Fix: Append the new employee to state before clearing the modal
    const newEmployee = {
      ...empForm,
      // Create a temporary mock ID. e.g., EMP-174
      id: `EMP-${Math.floor(100 + Math.random() * 900)}`, 
    };

    setEmployeeList((prevList) => [newEmployee, ...prevList]); // Prepends new employee to top of list
    
    setEmpSuccess(true);
    setTimeout(() => {
      setEmpSuccess(false);
      setEmpOpen(false);
      setEmpForm(EMPTY_EMP);
    }, 1500);
  }

  function handleExport() {
    const rows = [
      ["ID", "Name", "Role", "Department", "Email", "Status", "Joined"],
      // Use the local state instead of the static mock module import
      ...employeeList.map((e) => [
        e.id,
        e.name,
        e.role,
        e.dept,
        e.email,
        e.status,
        e.joined,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employees.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const cols = [
    { key: "id", header: "ID" },
    {
      key: "name",
      header: "Name",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-muted text-[10px]">
              {r.name
                ? r.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                : "??"}
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
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge value={r.status} />,
    },
  ];

  return (
    <>
      <PageShell
        title="Employees & HR"
        breadcrumb="Human Resources"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export
            </Button>
            <Button size="sm" onClick={() => setEmpOpen(true)}>
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              Add Employee
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Total Headcount"
            value={employeeList.length} // Dynamically reflects total count now!
            change={2.1}
            icon={<Users className="h-4 w-4" />}
          />
          <KpiCard
            label="Active Today"
            value={employeeList.filter(e => e.status === "Active").length} // Keeps status counter accurate
            change={1.4}
            icon={<Users className="h-4 w-4" />}
          />
          <KpiCard
            label="On Leave"
            value={employeeList.filter(e => e.status === "On Leave").length}
            change={-3.2}
            icon={<Users className="h-4 w-4" />}
          />
          <KpiCard
            label="Open Positions"
            value={14}
            change={6.8}
            icon={<Users className="h-4 w-4" />}
          />
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Headcount by Department</CardTitle>
            <CardDescription>Current FTE distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={departmentHeadcount}
                  margin={{ left: -10, right: 8 }}
                >
                  <CartesianGrid
                    stroke="var(--border)"
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="dept"
                    tick={{ fontSize: 11 }}
                    stroke="var(--muted-foreground)"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="var(--muted-foreground)"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--chart-1)"
                    radius={[3, 3, 0, 0]}
                  />
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
            {/* 3. Core Fix: Read directly from the dynamic state variable */}
            <DataTable columns={cols} rows={employeeList} />
          </TabsContent>
          {/* ... Rest of your tabs stay exactly the same */}
          <TabsContent value="attendance" className="mt-3">
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Attendance heatmap and check-in/out logs.
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="leave" className="mt-3">
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Leave balances, requests pending approval, and policies.
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="payroll" className="mt-3">
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Monthly payroll runs, payslips and tax filings.
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="performance" className="mt-3">
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Reviews, KPIs and 360° feedback cycles.
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageShell>

      {/* Add Employee Dialog */}
      <Dialog open={empOpen} onOpenChange={setEmpOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
          </DialogHeader>
          {empSuccess ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <p className="text-sm font-medium">Employee added successfully</p>
            </div>
          ) : (
            <form onSubmit={submitEmp} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <Label>Full Name</Label>
                  <Input
                    placeholder="e.g. Jane Smith"
                    value={empForm.name}
                    onChange={(e) =>
                      setEmpForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Role / Job Title</Label>
                  <Input
                    placeholder="e.g. QA Engineer"
                    value={empForm.role}
                    onChange={(e) =>
                      setEmpForm((f) => ({ ...f, role: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Department</Label>
                  <Select
                    value={empForm.dept}
                    onValueChange={(v) =>
                      setEmpForm((f) => ({ ...f, dept: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Logistics">Logistics</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Human Resources">Human Resources</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Procurement">Procurement</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="ICT">ICT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>Work Email</Label>
                  <Input
                    type="email"
                    placeholder="jane.s@rotech.co"
                    value={empForm.email}
                    onChange={(e) =>
                      setEmpForm((f) => ({ ...f, email: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={empForm.joined}
                    onChange={(e) =>
                      setEmpForm((f) => ({ ...f, joined: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={empForm.status}
                    onValueChange={(v) =>
                      setEmpForm((f) => ({ ...f, status: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="On Leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEmpOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !empForm.name ||
                    !empForm.role ||
                    !empForm.dept ||
                    !empForm.email ||
                    !empForm.joined
                  }
                >
                  Add Employee
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}