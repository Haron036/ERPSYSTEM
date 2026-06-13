import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { KpiCard } from "@/components/kpi-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import {
  useKpis,
  useRevenueSeries,
  useSalesByRegion,
  useInventoryStatus,
  useRecentActivities,
  useCreateLedgerEntry,
} from "@/hooks/useApi";

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const activityIcon = (type) => {
  switch (type) {
    case "approval":
      return <CheckCircle2 className="h-3.5 w-3.5 text-success" />;
    case "invoice":
      return <FileText className="h-3.5 w-3.5 text-info" />;
    case "inventory":
      return <Package className="h-3.5 w-3.5 text-warning" />;
    case "system":
      return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
    default:
      return <CheckCircle2 className="h-3.5 w-3.5 text-primary" />;
  }
};

// ── Fallback mock data (used only until backend responds) ──────────────────
const FALLBACK_REVENUE = [
  { month: "Jan", revenue: 142000, expenses: 98000, profit: 44000 },
  { month: "Feb", revenue: 168000, expenses: 102000, profit: 66000 },
  { month: "Mar", revenue: 189000, expenses: 121000, profit: 68000 },
  { month: "Apr", revenue: 205000, expenses: 128000, profit: 77000 },
  { month: "May", revenue: 221000, expenses: 134000, profit: 87000 },
  { month: "Jun", revenue: 248000, expenses: 142000, profit: 106000 },
  { month: "Jul", revenue: 267000, expenses: 155000, profit: 112000 },
  { month: "Aug", revenue: 281000, expenses: 162000, profit: 119000 },
  { month: "Sep", revenue: 298000, expenses: 171000, profit: 127000 },
  { month: "Oct", revenue: 312000, expenses: 178000, profit: 134000 },
  { month: "Nov", revenue: 334000, expenses: 189000, profit: 145000 },
  { month: "Dec", revenue: 361000, expenses: 201000, profit: 160000 },
];
const FALLBACK_REGIONS = [
  { name: "Riftvalley", value: 42 },
  { name: "Central", value: 28 },
  { name: "Eastern", value: 18 },
  { name: "Western", value: 8 },
  { name: "Coast", value: 4 },
];
const FALLBACK_INVENTORY = [
  { category: "Raw Materials", inStock: 1240, lowStock: 18, outOfStock: 3 },
  { category: "WIP", inStock: 482, lowStock: 12, outOfStock: 1 },
  { category: "Finished Goods", inStock: 2105, lowStock: 24, outOfStock: 6 },
  { category: "Packaging", inStock: 890, lowStock: 9, outOfStock: 0 },
  { category: "Spare Parts", inStock: 312, lowStock: 14, outOfStock: 2 },
];
const FALLBACK_ACTIVITIES = [
  {
    id: 1,
    user: "Sarah Chen",
    action: "approved purchase order PO-2847",
    time: "2m ago",
    type: "approval",
  },
  {
    id: 2,
    user: "Marcus Wei",
    action: "created invoice INV-10293 for Globex Corp",
    time: "12m ago",
    type: "invoice",
  },
  {
    id: 3,
    user: "Priya Nair",
    action: "received shipment SH-4421 (1,200 units)",
    time: "27m ago",
    type: "inventory",
  },
  {
    id: 4,
    user: "Daniel Ortiz",
    action: "closed support ticket #8821",
    time: "48m ago",
    type: "crm",
  },
  {
    id: 5,
    user: "System",
    action: "auto-generated payroll for November",
    time: "1h ago",
    type: "system",
  },
];

export default function Dashboard() {
  const { data: kpiData } = useKpis();
  const { data: revenueData } = useRevenueSeries();
  const { data: regionData } = useSalesByRegion();
  const { data: inventoryData } = useInventoryStatus();
  const { data: activitiesData } = useRecentActivities();
  const createEntry = useCreateLedgerEntry();

  const [txOpen, setTxOpen] = useState(false);
  const [txForm, setTxForm] = useState({
    type: "",
    account: "",
    amount: "",
    ref: "",
    note: "",
  });
  const [txSuccess, setTxSuccess] = useState(false);

  // ── Resolve live vs fallback ───────────────────────────────────────────────
  const revenueSeries = revenueData ?? FALLBACK_REVENUE;
  const salesByRegion = regionData ?? FALLBACK_REGIONS;
  const inventoryStatus = inventoryData ?? FALLBACK_INVENTORY;
  const recentActivities = activitiesData ?? FALLBACK_ACTIVITIES;

  const kpis = {
    revenue: { value: kpiData?.ytdRevenue ?? 2_487_320, change: 12.4 },
    orders: { value: kpiData?.totalOrders ?? 1_842, change: 8.1 },
    customers: { value: kpiData?.activeCustomers ?? 3_209, change: 4.7 },
    inventory: { value: kpiData?.totalInventoryUnits ?? 18_402, change: -2.3 },
    lowStock: kpiData?.lowStockCount ?? 77,
    overdue: kpiData?.overdueInvoices ?? 12,
    pending: kpiData?.pendingApprovals ?? 8,
  };

  async function handleTxSubmit(e) {
    e.preventDefault();
    try {
      await createEntry.mutateAsync({
        entryDate: new Date().toISOString().slice(0, 10),
        account: txForm.account,
        debit: txForm.type === "debit" ? parseFloat(txForm.amount) : 0,
        credit: txForm.type === "credit" ? parseFloat(txForm.amount) : 0,
        reference: txForm.ref,
        memo: txForm.note,
        entryType: txForm.type === "debit" ? "EXPENSE" : "REVENUE",
      });
      setTxSuccess(true);
      setTimeout(() => {
        setTxSuccess(false);
        setTxOpen(false);
        setTxForm({ type: "", account: "", amount: "", ref: "", note: "" });
      }, 1500);
    } catch (err) {
      alert(err.message);
    }
  }

  function handleExport() {
    const rows = [
      ["Month", "Revenue", "Expenses", "Profit"],
      ...revenueSeries.map((r) => [r.month, r.revenue, r.expenses, r.profit]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    Object.assign(document.createElement("a"), {
      href: url,
      download: "dashboard.csv",
    }).click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageShell
        title="Executive Overview"
        breadcrumb="Home"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport}>
              Export
            </Button>
            <Button size="sm" onClick={() => setTxOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Transaction
            </Button>
          </>
        }
      >
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="YTD Revenue"
            value={Number(kpis.revenue.value)}
            change={kpis.revenue.change}
            format="currency"
            icon={<DollarSign className="h-4 w-4" />}
          />
          <KpiCard
            label="Sales Orders"
            value={Number(kpis.orders.value)}
            change={kpis.orders.change}
            icon={<ShoppingBag className="h-4 w-4" />}
          />
          <KpiCard
            label="Active Customers"
            value={Number(kpis.customers.value)}
            change={kpis.customers.change}
            icon={<Users className="h-4 w-4" />}
          />
          <KpiCard
            label="Inventory Units"
            value={Number(kpis.inventory.value)}
            change={kpis.inventory.change}
            icon={<Package className="h-4 w-4" />}
          />
        </div>

        {/* Revenue vs Expenses */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Revenue vs Expenses
                  </CardTitle>
                  <CardDescription>
                    Monthly performance, fiscal year 2026
                  </CardDescription>
                </div>
                <Badge variant={revenueData ? "default" : "secondary"}>
                  {revenueData ? "Live" : "Demo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={revenueSeries}
                    margin={{ left: -10, right: 8, top: 8 }}
                  >
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="var(--chart-1)"
                          stopOpacity={0.45}
                        />
                        <stop
                          offset="100%"
                          stopColor="var(--chart-1)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="var(--chart-5)"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor="var(--chart-5)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      stroke="var(--border)"
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11 }}
                      stroke="var(--muted-foreground)"
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      stroke="var(--muted-foreground)"
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--chart-1)"
                      fill="url(#rev)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke="var(--chart-5)"
                      fill="url(#exp)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Sales by Region</CardTitle>
              <CardDescription>% of net revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesByRegion}
                      dataKey="value"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {salesByRegion.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5">
                {salesByRegion.map((r, i) => (
                  <div
                    key={r.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{ background: PIE_COLORS[i] }}
                      />
                      <span>{r.name}</span>
                    </div>
                    <span className="font-medium tabular-nums">{r.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory + Activity */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Inventory Status by Category
              </CardTitle>
              <CardDescription>Stock health across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={inventoryStatus}
                    margin={{ left: -10, right: 8, top: 8 }}
                  >
                    <CartesianGrid
                      stroke="var(--border)"
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="category"
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
                      dataKey="inStock"
                      fill="var(--chart-3)"
                      radius={[3, 3, 0, 0]}
                    />
                    <Bar
                      dataKey="lowStock"
                      fill="var(--chart-4)"
                      radius={[3, 3, 0, 0]}
                    />
                    <Bar
                      dataKey="outOfStock"
                      fill="var(--chart-5)"
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivities.map((a, idx) => (
                <div
                  key={a.id ?? `activity-${idx}`}
                  className="flex items-start gap-3 text-sm"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-muted text-[10px]">
                      {a.user
                        .split(" ")
                        .map((p) => p[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{a.user}</span>
                      {activityIcon(a.type)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {a.action}
                    </div>
                    <div className="text-[10px] text-muted-foreground/70">
                      {a.time}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Action Required */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <CardTitle className="text-base">Action Required</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-md border bg-warning/5 p-3">
                <div className="text-xs text-muted-foreground">
                  Low stock items
                </div>
                <div className="mt-1 text-xl font-semibold">
                  {kpis.lowStock}
                </div>
                <div className="text-xs text-warning-foreground/80">
                  across 5 categories
                </div>
              </div>
              <div className="rounded-md border bg-destructive/5 p-3">
                <div className="text-xs text-muted-foreground">
                  Overdue invoices
                </div>
                <div className="mt-1 text-xl font-semibold">{kpis.overdue}</div>
                <div className="text-xs text-destructive">outstanding</div>
              </div>
              <div className="rounded-md border bg-info/5 p-3">
                <div className="text-xs text-muted-foreground">
                  Pending approvals
                </div>
                <div className="mt-1 text-xl font-semibold">{kpis.pending}</div>
                <div className="text-xs text-info">PRs, time-off, journals</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageShell>

      {/* New Transaction Dialog */}
      <Dialog open={txOpen} onOpenChange={setTxOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Transaction</DialogTitle>
          </DialogHeader>
          {txSuccess ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <p className="text-sm font-medium">
                Transaction recorded successfully
              </p>
            </div>
          ) : (
            <form onSubmit={handleTxSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Entry Type</Label>
                <Select
                  value={txForm.type}
                  onValueChange={(v) => setTxForm((f) => ({ ...f, type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Debit or Credit…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debit">
                      Debit (Expense / Asset)
                    </SelectItem>
                    <SelectItem value="credit">
                      Credit (Revenue / Income)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Account</Label>
                <Select
                  value={txForm.account}
                  onValueChange={(v) =>
                    setTxForm((f) => ({ ...f, account: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1000 · Cash">1000 · Cash</SelectItem>
                    <SelectItem value="1200 · Inventory">
                      1200 · Inventory
                    </SelectItem>
                    <SelectItem value="4000 · Sales Revenue">
                      4000 · Sales Revenue
                    </SelectItem>
                    <SelectItem value="5000 · COGS">5000 · COGS</SelectItem>
                    <SelectItem value="6100 · Payroll Expense">
                      6100 · Payroll Expense
                    </SelectItem>
                    <SelectItem value="2100 · Payroll Payable">
                      2100 · Payroll Payable
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Amount ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={txForm.amount}
                    onChange={(e) =>
                      setTxForm((f) => ({ ...f, amount: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Reference</Label>
                  <Input
                    placeholder="e.g. INV-10299"
                    value={txForm.ref}
                    onChange={(e) =>
                      setTxForm((f) => ({ ...f, ref: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Note (optional)</Label>
                <Input
                  placeholder="Brief description…"
                  value={txForm.note}
                  onChange={(e) =>
                    setTxForm((f) => ({ ...f, note: e.target.value }))
                  }
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTxOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !txForm.type ||
                    !txForm.account ||
                    !txForm.amount ||
                    createEntry.isPending
                  }
                >
                  {createEntry.isPending ? "Saving…" : "Record Transaction"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
