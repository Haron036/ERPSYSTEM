import { useState, useMemo } from "react";
import {
  UserPlus,
  Download,
  Users,
  CheckCircle2,
  Plus,
  CalendarDays,
  XCircle,
  AlertCircle,
  Clock,
  KeyRound,
} from "lucide-react";
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
import PayrollTab from "../Components/Payroll-tab ";

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useEmployees,
  useCreateEmployee,
  useLeaveRequests,
  useCreateLeaveRequest,
  useCancelLeaveRequest,
} from "@/hooks/useApi";
import { departmentHeadcount } from "@/lib/mock-data";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import AttendanceTab from "../routes/attendance-tab";
import SettingsTab from "../Components/settings-tab";
// ── constants ─────────────────────────────────────────────────────────────────

const EMPTY_EMP = {
  name: "",
  role: "",
  department: "",
  email: "",
  status: "ACTIVE",
  joinedDate: "",
};

const EMPTY_LEAVE = {
  employeeId: "",
  leaveType: "ANNUAL",
  startDate: "",
  endDate: "",
  reason: "",
};

const LEAVE_TYPES = [
  { value: "ANNUAL", label: "Annual Leave" },
  { value: "SICK", label: "Sick Leave" },
  { value: "MATERNITY", label: "Maternity Leave" },
  { value: "PATERNITY", label: "Paternity Leave" },
  { value: "UNPAID", label: "Unpaid Leave" },
];

const LEAVE_STATUS_COLORS = {
  PENDING_APPROVAL: "bg-amber-100  text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100    text-red-700",
  CANCELLED: "bg-gray-100   text-gray-500",
};

const leaveTypeLabel = (v) =>
  LEAVE_TYPES.find((t) => t.value === v)?.label ?? v;
const statusLabel = (s) =>
  s === "ON_LEAVE" ? "On Leave" : s === "TERMINATED" ? "Terminated" : "Active";

// ── helpers ───────────────────────────────────────────────────────────────────

function LeaveStatusPill({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium
                      ${LEAVE_STATUS_COLORS[status] ?? "bg-gray-100 text-gray-500"}`}
    >
      {status?.replace(/_/g, " ")}
    </span>
  );
}

function daysBetween(start, end) {
  if (!start || !end) return 0;
  const diff = new Date(end) - new Date(start);
  return Math.max(0, Math.round(diff / 86_400_000) + 1);
}

// ── main component ────────────────────────────────────────────────────────────

export default function EmployeesPage() {
  const { data: employees = [], isLoading: empLoading } = useEmployees();
  const {
    data: leaveRequests = [],
    isLoading: leaveLoading,
    isError: leaveError,
  } = useLeaveRequests();

  const createEmployee = useCreateEmployee();
  const createLeaveReq = useCreateLeaveRequest();
  const cancelLeaveReq = useCancelLeaveRequest();

  // Employee form state
  const [empOpen, setEmpOpen] = useState(false);
  const [empSuccess, setEmpSuccess] = useState(false);
  const [empForm, setEmpForm] = useState(EMPTY_EMP);
  const [createdEmp, setCreatedEmp] = useState(null); // holds the created employee for success screen

  // Leave form state
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveSuccess, setLeaveSuccess] = useState(false);
  const [leaveForm, setLeaveForm] = useState(EMPTY_LEAVE);

  // Cancel confirm state
  const [cancelTarget, setCancelTarget] = useState(null);

  // ── derived data ────────────────────────────────────────────────────────────

  const headcount = useMemo(
    () =>
      employees.length
        ? Object.entries(
            employees.reduce((acc, e) => {
              acc[e.department] = (acc[e.department] || 0) + 1;
              return acc;
            }, {}),
          ).map(([dept, count]) => ({ dept, count }))
        : departmentHeadcount,
    [employees],
  );

  const active = employees.filter((e) => e.status === "ACTIVE").length;
  const onLeave = employees.filter((e) => e.status === "ON_LEAVE").length;
  const pendingLeave = leaveRequests.filter(
    (l) => l.status === "PENDING_APPROVAL",
  ).length;
  const approvedLeave = leaveRequests.filter(
    (l) => l.status === "APPROVED",
  ).length;
  const previewDays = daysBetween(leaveForm.startDate, leaveForm.endDate);

  // ── handlers ────────────────────────────────────────────────────────────────

  async function submitEmp(e) {
    e.preventDefault();
    try {
      const created = await createEmployee.mutateAsync(empForm);
      setCreatedEmp(created);
      setEmpSuccess(true);
      // Longer timeout so admin can read and note the default password
      setTimeout(() => {
        setEmpSuccess(false);
        setEmpOpen(false);
        setEmpForm(EMPTY_EMP);
        setCreatedEmp(null);
      }, 10_000);
    } catch (err) {
      toast.error("Failed to add employee", { description: err?.message });
    }
  }

  async function submitLeave(e) {
    e.preventDefault();
    if (previewDays < 1) {
      toast.error("End date must be on or after start date.");
      return;
    }
    try {
      await createLeaveReq.mutateAsync({
        employeeId: parseInt(leaveForm.employeeId),
        leaveType: leaveForm.leaveType,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        reason: leaveForm.reason,
      });
      setLeaveSuccess(true);
      setTimeout(() => {
        setLeaveSuccess(false);
        setLeaveOpen(false);
        setLeaveForm(EMPTY_LEAVE);
      }, 1800);
    } catch (err) {
      toast.error("Failed to submit leave request", {
        description: err?.message,
      });
    }
  }

  async function handleCancelConfirm() {
    if (!cancelTarget) return;
    try {
      await cancelLeaveReq.mutateAsync(cancelTarget.id);
      toast.success(`${cancelTarget.leaveNumber} cancelled`);
    } catch (err) {
      toast.error("Cancel failed", { description: err?.message });
    } finally {
      setCancelTarget(null);
    }
  }

  function handleExport() {
    const rows = [
      ["Code", "Name", "Role", "Department", "Email", "Status", "Joined"],
      ...employees.map((e) => [
        e.employeeCode,
        e.name,
        e.role,
        e.department,
        e.email,
        e.status,
        e.joinedDate,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    Object.assign(document.createElement("a"), {
      href: url,
      download: "employees.csv",
    }).click();
    URL.revokeObjectURL(url);
  }

  // ── table columns ─────────────────────────────────────────────────────────

  const empCols = [
    { key: "employeeCode", header: "ID" },
    {
      key: "name",
      header: "Name",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-muted text-[10px]">
              {r.name
                .split(" ")
                .map((p) => p[0])
                .join("")}
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
    { key: "department", header: "Department" },
    { key: "joinedDate", header: "Joined" },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge value={statusLabel(r.status)} />,
    },
  ];

  const leaveCols = [
    {
      key: "leaveNumber",
      header: "Ref",
      render: (r) => <span className="font-mono text-xs">{r.leaveNumber}</span>,
    },
    { key: "employeeName", header: "Employee" },
    { key: "department", header: "Department" },
    {
      key: "leaveType",
      header: "Type",
      render: (r) => leaveTypeLabel(r.leaveType),
    },
    {
      key: "startDate",
      header: "Period",
      render: (r) => (
        <span className="text-xs">
          {r.startDate} → {r.endDate}
          <span className="ml-1 text-muted-foreground">
            ({r.daysRequested}d)
          </span>
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <LeaveStatusPill status={r.status} />,
    },
    {
      key: "_actions",
      header: "",
      render: (r) =>
        r.status === "PENDING_APPROVAL" ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-destructive hover:text-destructive"
            onClick={() => setCancelTarget(r)}
            disabled={cancelLeaveReq.isPending}
          >
            <XCircle className="mr-1 h-3 w-3" />
            Cancel
          </Button>
        ) : null,
    },
  ];

  // ── render ────────────────────────────────────────────────────────────────

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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLeaveOpen(true)}
            >
              <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
              Request Leave
            </Button>
            <Button size="sm" onClick={() => setEmpOpen(true)}>
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              Add Employee
            </Button>
          </>
        }
      >
        {/* KPIs */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Total Headcount"
            value={employees.length || 0}
            change={2.1}
            icon={<Users className="h-4 w-4" />}
          />
          <KpiCard
            label="Active Today"
            value={active}
            change={1.4}
            icon={<Users className="h-4 w-4" />}
          />
          <KpiCard
            label="On Leave"
            value={onLeave}
            change={-3.2}
            icon={<CalendarDays className="h-4 w-4" />}
          />
          <KpiCard
            label="Pending Leave"
            value={pendingLeave}
            icon={<Clock className="h-4 w-4" />}
          />
        </div>

        {/* Headcount chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Headcount by Department</CardTitle>
            <CardDescription>Current FTE distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={headcount} margin={{ left: -10, right: 8 }}>
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

        {/* Tabs */}
        <Tabs defaultValue="directory">
          <TabsList>
            <TabsTrigger value="directory">Directory</TabsTrigger>
            <TabsTrigger value="leave">
              Leave
              {pendingLeave > 0 && (
                <span
                  className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5
                                 text-[10px] font-semibold text-amber-700"
                >
                  {pendingLeave}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Directory */}
          <TabsContent value="directory" className="mt-3">
            {empLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Loading employees…
              </p>
            ) : (
              <DataTable columns={empCols} rows={employees} />
            )}
          </TabsContent>

          {/* Leave */}
          <TabsContent value="leave" className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Total requests", value: leaveRequests.length },
                {
                  label: "Pending",
                  value: pendingLeave,
                  cls: "text-amber-600",
                },
                {
                  label: "Approved",
                  value: approvedLeave,
                  cls: "text-emerald-600",
                },
                {
                  label: "This month",
                  value: leaveRequests.filter((l) => {
                    const m = new Date(l.startDate);
                    const n = new Date();
                    return (
                      m.getFullYear() === n.getFullYear() &&
                      m.getMonth() === n.getMonth()
                    );
                  }).length,
                },
              ].map(({ label, value, cls }) => (
                <Card key={label}>
                  <CardContent className="p-3">
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {label}
                    </p>
                    <p
                      className={`text-2xl font-semibold tabular-nums mt-0.5 ${cls ?? ""}`}
                    >
                      {value}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Leave Requests</CardTitle>
                  <CardDescription>
                    All requests — approved via the Approvals page
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => setLeaveOpen(true)}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  New Request
                </Button>
              </CardHeader>
              <CardContent>
                {leaveError ? (
                  <div
                    className="flex items-center gap-2 rounded-md border border-destructive/30
                                  bg-destructive/10 px-4 py-3 text-sm text-destructive"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    Could not load leave requests. Please refresh.
                  </div>
                ) : leaveLoading ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Loading…
                  </p>
                ) : leaveRequests.length === 0 ? (
                  <div className="py-10 text-center">
                    <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No leave requests yet.
                    </p>
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={() => setLeaveOpen(true)}
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Submit first request
                    </Button>
                  </div>
                ) : (
                  <DataTable columns={leaveCols} rows={leaveRequests} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Placeholders */}
          <TabsContent value="attendance" className="mt-3">
            <AttendanceTab />
          </TabsContent>

          <TabsContent value="payroll" className="mt-3">
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Monthly payroll runs, payslips and tax filings.
              </CardContent>
            </Card>
            <PayrollTab />

          </TabsContent>
          <TabsContent value="performance" className="mt-3">
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Reviews, KPIs and 360° feedback cycles.
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="settings" className="mt-3">
            <SettingsTab />
          </TabsContent>
          
        </Tabs>
      </PageShell>

      {/* ── Leave request dialog ───────────────────────────────────────────── */}
      <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              New Leave Request
            </DialogTitle>
          </DialogHeader>

          {leaveSuccess ? (
            <div className="flex flex-col items-center gap-2 py-8">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <p className="text-sm font-medium">Request submitted</p>
              <p className="text-xs text-muted-foreground text-center">
                An approver has been notified and will action it shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={submitLeave} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Employee</Label>
                <Select
                  value={leaveForm.employeeId}
                  onValueChange={(v) =>
                    setLeaveForm((f) => ({ ...f, employeeId: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee…" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter((e) => e.status !== "TERMINATED")
                      .map((e) => (
                        <SelectItem key={e.id} value={String(e.id)}>
                          {e.name}
                          <span className="ml-1 text-muted-foreground text-xs">
                            ({e.department})
                          </span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Leave Type</Label>
                <Select
                  value={leaveForm.leaveType}
                  onValueChange={(v) =>
                    setLeaveForm((f) => ({ ...f, leaveType: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAVE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={leaveForm.startDate}
                    onChange={(e) =>
                      setLeaveForm((f) => ({ ...f, startDate: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={leaveForm.endDate}
                    min={leaveForm.startDate}
                    onChange={(e) =>
                      setLeaveForm((f) => ({ ...f, endDate: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              {previewDays > 0 && (
                <p className="text-xs text-muted-foreground">
                  Duration:{" "}
                  <span className="font-medium text-foreground">
                    {previewDays} working day{previewDays !== 1 ? "s" : ""}
                  </span>
                </p>
              )}

              <div className="space-y-1.5">
                <Label>
                  Reason{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  placeholder="Brief reason for the request…"
                  value={leaveForm.reason}
                  onChange={(e) =>
                    setLeaveForm((f) => ({ ...f, reason: e.target.value }))
                  }
                />
              </div>

              <p className="text-xs text-muted-foreground rounded-md bg-muted px-3 py-2">
                After submission this goes to the{" "}
                <span className="font-medium text-foreground">Approvals</span>{" "}
                queue. The employee will receive a notification once a decision
                is made.
              </p>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLeaveOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !leaveForm.employeeId ||
                    !leaveForm.startDate ||
                    !leaveForm.endDate ||
                    createLeaveReq.isPending
                  }
                >
                  {createLeaveReq.isPending ? "Submitting…" : "Submit Request"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Add employee dialog ────────────────────────────────────────────── */}
      <Dialog
        open={empOpen}
        onOpenChange={(open) => {
          // Reset fully when admin closes the dialog manually
          if (!open) {
            setEmpOpen(false);
            setEmpSuccess(false);
            setEmpForm(EMPTY_EMP);
            setCreatedEmp(null);
          } else {
            setEmpOpen(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
          </DialogHeader>

          {empSuccess ? (
            // ── Success screen — shows default credentials ──────────────────
            <div className="flex flex-col items-center gap-4 py-4">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <p className="text-sm font-medium">Employee added successfully</p>

              <div className="w-full rounded-md border bg-muted/50 px-4 py-3 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <KeyRound className="h-3.5 w-3.5" />
                  Login credentials to share with the employee
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-mono font-medium">
                      {createdEmp?.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Password</span>
                    <span className="font-mono font-medium">
                      rotech@{createdEmp?.employeeCode?.toLowerCase()}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground pt-1 border-t">
                  The employee should change this password after their first
                  login.
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setEmpSuccess(false);
                  setEmpOpen(false);
                  setEmpForm(EMPTY_EMP);
                  setCreatedEmp(null);
                }}
              >
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={submitEmp} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
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
                    value={empForm.department}
                    onValueChange={(v) =>
                      setEmpForm((f) => ({ ...f, department: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Manufacturing",
                        "Logistics",
                        "Sales",
                        "Finance",
                        "Human Resources",
                        "Engineering",
                        "Procurement",
                        "Operations",
                        "ICT",
                      ].map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1.5">
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
                    value={empForm.joinedDate}
                    onChange={(e) =>
                      setEmpForm((f) => ({ ...f, joinedDate: e.target.value }))
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
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <p className="text-xs text-muted-foreground rounded-md bg-muted px-3 py-2">
                A login account will be automatically created for this employee
                with a default password they can change after first login.
              </p>

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
                    !empForm.department ||
                    !empForm.email ||
                    !empForm.joinedDate ||
                    createEmployee.isPending
                  }
                >
                  {createEmployee.isPending ? "Saving…" : "Add Employee"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Cancel leave confirmation ──────────────────────────────────────── */}
      <AlertDialog
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Cancel {cancelTarget?.leaveNumber}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will withdraw the leave request.
              {cancelTarget?.employeeName && (
                <>
                  {" "}
                  <span className="font-medium">
                    {cancelTarget.employeeName}
                  </span>
                  's status will remain unchanged.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleCancelConfirm}
              disabled={cancelLeaveReq.isPending}
            >
              {cancelLeaveReq.isPending ? "Cancelling…" : "Cancel Request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </>
  );
}
