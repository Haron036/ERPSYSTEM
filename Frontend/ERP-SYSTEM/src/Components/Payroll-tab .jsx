import { useState } from "react";
import {
  ChevronLeft, ChevronRight, Play, CheckCircle2, AlertCircle,
  Printer, Users, Banknote, TrendingDown, Building2, X,
} from "lucide-react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  useAllSalaries, usePayrollRun, useSetSalary,
  useRunPayroll, useApprovePayroll, useEmployees,
} from "@/hooks/useApi";
import { toast } from "sonner";

// ── helpers ───────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function fmt(val) {
  if (val == null) return "KES 0.00";
  return "KES " + Number(val).toLocaleString("en-KE", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
}

function StatusPill({ status }) {
  const cls = {
    DRAFT:    "bg-amber-100 text-amber-700",
    APPROVED: "bg-emerald-100 text-emerald-700",
    PAID:     "bg-blue-100 text-blue-700",
  }[status] ?? "bg-muted text-muted-foreground";
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

// ── Payslip modal ─────────────────────────────────────────────────────────────

function PayslipModal({ payslip, onClose }) {
  if (!payslip) return null;

  function handlePrint() {
    window.print();
  }

  return (
    <Dialog open={!!payslip} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg print:shadow-none">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Payslip — {payslip.monthLabel}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 print:hidden"
                    onClick={handlePrint}>
              <Printer className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {/* Employee info */}
          <div className="rounded-lg bg-muted/50 px-4 py-3 grid grid-cols-2 gap-y-1">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Employee</p>
              <p className="font-semibold">{payslip.employeeName}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">ID</p>
              <p className="font-mono">{payslip.employeeCode}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Department</p>
              <p>{payslip.department}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Role</p>
              <p>{payslip.role}</p>
            </div>
          </div>

          {/* Earnings */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Earnings
            </p>
            <div className="space-y-1.5">
              {[
                ["Basic Salary",         payslip.basicSalary],
                ["House Allowance",      payslip.houseAllowance],
                ["Transport Allowance",  payslip.transportAllowance],
                ["Other Allowances",     payslip.otherAllowances],
              ].map(([label, val]) =>
                Number(val) > 0 && (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="tabular-nums">{fmt(val)}</span>
                  </div>
                )
              )}
              <div className="flex justify-between font-semibold border-t pt-1.5">
                <span>Gross Salary</span>
                <span className="tabular-nums text-emerald-600">{fmt(payslip.grossSalary)}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Deductions
            </p>
            <div className="space-y-1.5">
              {[
                ["NSSF (Employee)",    payslip.nssfEmployee],
                ["NHIF / SHIF",        payslip.nhif],
                ["PAYE Tax",           payslip.payeTax],
                ["Housing Levy",       payslip.housingLevy],
                ["HELB",               payslip.helbDeduction],
                ["Other Deductions",   payslip.otherDeductions],
              ].map(([label, val]) =>
                Number(val) > 0 && (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="tabular-nums text-red-500">({fmt(val)})</span>
                  </div>
                )
              )}
              <div className="flex justify-between font-semibold border-t pt-1.5">
                <span>Total Deductions</span>
                <span className="tabular-nums text-red-500">({fmt(payslip.totalDeductions)})</span>
              </div>
            </div>
          </div>

          {/* Net pay */}
          <div className="rounded-lg border-2 border-primary/20 bg-primary/5 px-4 py-3
                          flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">Net Pay</p>
              <p className="text-2xl font-bold tabular-nums">{fmt(payslip.netPay)}</p>
            </div>
            <StatusPill status={payslip.status} />
          </div>

          {/* Employer cost note */}
          <p className="text-[11px] text-muted-foreground text-center border-t pt-2">
            Total employer cost (incl. NSSF + Housing Levy employer share):{" "}
            <span className="font-medium">{fmt(payslip.totalEmployerCost)}</span>
          </p>
        </div>

        <DialogFooter className="print:hidden">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1.5" />
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Salary setup dialog ───────────────────────────────────────────────────────

const EMPTY_SALARY = {
  basicSalary: "", houseAllowance: "", transportAllowance: "",
  otherAllowances: "", helbDeduction: "", otherDeductions: "",
};

function SalaryDialog({ employee, existing, onClose }) {
  const setSalary = useSetSalary();
  const [form, setForm] = useState({
    basicSalary:        existing?.basicSalary        ?? "",
    houseAllowance:     existing?.houseAllowance      ?? "",
    transportAllowance: existing?.transportAllowance  ?? "",
    otherAllowances:    existing?.otherAllowances     ?? "",
    helbDeduction:      existing?.helbDeduction       ?? "",
    otherDeductions:    existing?.otherDeductions     ?? "",
  });

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await setSalary.mutateAsync({
        employeeId:         employee.id,
        basicSalary:        Number(form.basicSalary),
        houseAllowance:     Number(form.houseAllowance)     || 0,
        transportAllowance: Number(form.transportAllowance) || 0,
        otherAllowances:    Number(form.otherAllowances)    || 0,
        helbDeduction:      Number(form.helbDeduction)      || 0,
        otherDeductions:    Number(form.otherDeductions)    || 0,
      });
      toast.success(`Salary saved for ${employee.name}`);
      onClose();
    } catch (err) {
      toast.error("Failed to save salary", { description: err?.message });
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Salary Structure — {employee.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Earnings (KES / month)
            </p>
            {[
              { key: "basicSalary",        label: "Basic Salary",         required: true  },
              { key: "houseAllowance",      label: "House Allowance",      required: false },
              { key: "transportAllowance",  label: "Transport Allowance",  required: false },
              { key: "otherAllowances",     label: "Other Allowances",     required: false },
            ].map(({ key, label, required }) => (
              <div key={key} className="grid grid-cols-2 items-center gap-3">
                <Label className="text-right text-xs">{label}</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required={required}
                  {...field(key)}
                />
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-2 border-t">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fixed Deductions (KES / month)
            </p>
            {[
              { key: "helbDeduction",  label: "HELB Repayment" },
              { key: "otherDeductions", label: "Other Deductions" },
            ].map(({ key, label }) => (
              <div key={key} className="grid grid-cols-2 items-center gap-3">
                <Label className="text-right text-xs">{label}</Label>
                <Input
                  type="number" min="0" step="0.01" placeholder="0.00"
                  {...field(key)}
                />
              </div>
            ))}
          </div>

          <p className="text-[11px] text-muted-foreground rounded-md bg-muted px-3 py-2">
            NSSF, NHIF, PAYE, and Housing Levy are computed automatically
            using current Kenya statutory rates when payroll is run.
          </p>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={setSalary.isPending}>
              {setSalary.isPending ? "Saving…" : "Save Salary"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main PayrollTab ───────────────────────────────────────────────────────────

export default function PayrollTab() {
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [selectedPayslip,  setSelectedPayslip]  = useState(null);
  const [salaryTarget,     setSalaryTarget]     = useState(null); // { employee, existing }
  const [activeTab,        setActiveTab]        = useState("runs"); // "runs" | "salaries"

  const { data: employees = [] }       = useEmployees();
  const { data: salaries = [] }        = useAllSalaries();
  const { data: runData, isError: runError } = usePayrollRun(year, month);

  const runPayroll    = useRunPayroll();
  const approveRun    = useApprovePayroll();

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    const n = new Date();
    if (year === n.getFullYear() && month === n.getMonth() + 1) return;
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  async function handleRunPayroll() {
    try {
      await runPayroll.mutateAsync({ year, month });
      toast.success(`Payroll run for ${MONTH_NAMES[month - 1]} ${year} completed`);
    } catch (err) {
      toast.error("Payroll run failed", { description: err?.message });
    }
  }

  async function handleApprove() {
    try {
      await approveRun.mutateAsync({ year, month });
      toast.success("Payroll approved");
    } catch (err) {
      toast.error("Approval failed", { description: err?.message });
    }
  }

  const salaryMap = Object.fromEntries(salaries.map((s) => [s.employeeId, s]));
  const payslips  = runData?.payslips ?? [];
  const allApproved = payslips.length > 0 &&
    payslips.every((p) => p.status === "APPROVED" || p.status === "PAID");

  return (
    <div className="space-y-4">

      {/* ── Period navigator + actions ─────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={prevMonth}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-sm font-semibold w-36 text-center">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <Button variant="outline" size="icon" className="h-7 w-7"
                  onClick={nextMonth} disabled={isCurrentMonth}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab toggle */}
          <div className="flex rounded-md border overflow-hidden text-xs">
            {["runs", "salaries"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3 py-1.5 capitalize transition-colors
                            ${activeTab === t
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"}`}
              >
                {t === "runs" ? "Payroll Runs" : "Salary Setup"}
              </button>
            ))}
          </div>

          {activeTab === "runs" && (
            <>
              {!allApproved && payslips.length > 0 && (
                <Button size="sm" variant="outline"
                        onClick={handleApprove} disabled={approveRun.isPending}>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  {approveRun.isPending ? "Approving…" : "Approve All"}
                </Button>
              )}
              <Button size="sm" onClick={handleRunPayroll}
                      disabled={runPayroll.isPending}>
                <Play className="h-3.5 w-3.5 mr-1.5" />
                {runPayroll.isPending
                  ? "Running…"
                  : payslips.length > 0 ? "Re-run Payroll" : "Run Payroll"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Summary KPIs (only when run data exists) ──────────────────────── */}
      {runData && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Employees Paid", value: runData.employeeCount,
              icon: <Users className="h-4 w-4" />, fmt: false },
            { label: "Total Gross",    value: runData.totalGross,
              icon: <Banknote className="h-4 w-4" />, fmt: true },
            { label: "Total Tax (PAYE)", value: runData.totalPaye,
              icon: <TrendingDown className="h-4 w-4" />, fmt: true },
            { label: "Employer Cost",  value: runData.totalEmployerCost,
              icon: <Building2 className="h-4 w-4" />, fmt: true },
          ].map(({ label, value, icon, fmt: doFmt }) => (
            <Card key={label}>
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  {icon}
                  <p className="text-[11px] uppercase tracking-wider">{label}</p>
                </div>
                <p className="text-lg font-semibold tabular-nums">
                  {doFmt ? fmt(value) : value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Payroll Runs tab ───────────────────────────────────────────────── */}
      {activeTab === "runs" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Payroll — {MONTH_NAMES[month - 1]} {year}
            </CardTitle>
            <CardDescription>
              {payslips.length > 0
                ? `${payslips.length} payslips generated. Click a row to view.`
                : "No payroll run for this period yet. Click Run Payroll to generate."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payslips.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Banknote className="mx-auto h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  No payroll run for {MONTH_NAMES[month - 1]} {year}.
                </p>
                <Button size="sm" onClick={handleRunPayroll}
                        disabled={runPayroll.isPending}>
                  <Play className="h-3.5 w-3.5 mr-1.5" />
                  {runPayroll.isPending ? "Running…" : "Run Payroll Now"}
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Gross</TableHead>
                      <TableHead className="text-right">NSSF</TableHead>
                      <TableHead className="text-right">NHIF</TableHead>
                      <TableHead className="text-right">PAYE</TableHead>
                      <TableHead className="text-right">Net Pay</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payslips.map((p) => (
                      <TableRow
                        key={p.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedPayslip(p)}
                      >
                        <TableCell>
                          <div className="font-medium text-sm">{p.employeeName}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {p.employeeCode}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {p.department}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm">
                          {fmt(p.grossSalary)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                          {fmt(p.nssfEmployee)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                          {fmt(p.nhif)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                          {fmt(p.payeTax)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm font-semibold">
                          {fmt(p.netPay)}
                        </TableCell>
                        <TableCell>
                          <StatusPill status={p.status} />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost" size="sm"
                            className="h-7 text-xs"
                            onClick={(e) => { e.stopPropagation(); setSelectedPayslip(p); }}
                          >
                            <Printer className="h-3 w-3 mr-1" />
                            Slip
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Salary Setup tab ──────────────────────────────────────────────── */}
      {activeTab === "salaries" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Salary Structures</CardTitle>
            <CardDescription>
              Set basic salary and allowances per employee. Statutory deductions
              are calculated automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead className="text-right">Basic</TableHead>
                    <TableHead className="text-right">House</TableHead>
                    <TableHead className="text-right">Transport</TableHead>
                    <TableHead className="text-right">Other Allow.</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees
                    .filter((e) => e.status !== "TERMINATED")
                    .map((emp) => {
                      const sal = salaryMap[emp.id];
                      return (
                        <TableRow key={emp.id}>
                          <TableCell>
                            <div className="font-medium text-sm">{emp.name}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {emp.department}
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-sm">
                            {sal ? fmt(sal.basicSalary) : "—"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                            {sal ? fmt(sal.houseAllowance) : "—"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                            {sal ? fmt(sal.transportAllowance) : "—"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                            {sal ? fmt(sal.otherAllowances) : "—"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-sm font-semibold">
                            {sal ? fmt(sal.grossSalary) : "—"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline" size="sm" className="h-7 text-xs"
                              onClick={() => setSalaryTarget({ employee: emp, existing: sal })}
                            >
                              {sal ? "Edit" : "Set Salary"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Payslip modal ─────────────────────────────────────────────────── */}
      {selectedPayslip && (
        <PayslipModal
          payslip={selectedPayslip}
          onClose={() => setSelectedPayslip(null)}
        />
      )}

      {/* ── Salary setup dialog ────────────────────────────────────────────── */}
      {salaryTarget && (
        <SalaryDialog
          employee={salaryTarget.employee}
          existing={salaryTarget.existing}
          onClose={() => setSalaryTarget(null)}
        />
      )}
    </div>
  );
}