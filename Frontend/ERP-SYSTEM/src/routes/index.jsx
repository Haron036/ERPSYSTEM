import { useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  DollarSign, ShoppingBag, Users, Package, AlertTriangle,
  CheckCircle2, Clock, FileText, X, Plus,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { kpis, revenueSeries, salesByRegion, recentActivities, inventoryStatus } from "@/lib/mock-data";

const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

const activityIcon = (type) => {
  switch (type) {
    case "approval":  return <CheckCircle2 className="h-3.5 w-3.5 text-success" />;
    case "invoice":   return <FileText className="h-3.5 w-3.5 text-info" />;
    case "inventory": return <Package className="h-3.5 w-3.5 text-warning" />;
    case "system":    return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
    default:          return <CheckCircle2 className="h-3.5 w-3.5 text-primary" />;
  }
};

export default function Dashboard() {
  const [txOpen, setTxOpen] = useState(false);
  const [txForm, setTxForm] = useState({ type: "", account: "", amount: "", ref: "", note: "" });
  const [txSuccess, setTxSuccess] = useState(false);

  function handleTxSubmit(e) {
    e.preventDefault();
    setTxSuccess(true);
    setTimeout(() => {
      setTxSuccess(false);
      setTxOpen(false);
      setTxForm({ type: "", account: "", amount: "", ref: "", note: "" });
    }, 1500);
  }

  function handleExport() {
    const rows = [
      ["Month", "Revenue", "Expenses", "Profit"],
      ...revenueSeries.map((r) => [r.month, r.revenue, r.expenses, r.profit]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dashboard-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageShell
        title="Executive Overview"
        breadcrumb="Home"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={handleExport}>Export</Button>
            <Button size="sm" onClick={() => setTxOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />New Transaction
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="YTD Revenue"      value={kpis.revenue.value}   change={kpis.revenue.change}   format="currency" icon={<DollarSign className="h-4 w-4" />} />
          <KpiCard label="Sales Orders"     value={kpis.orders.value}    change={kpis.orders.change}    icon={<ShoppingBag className="h-4 w-4" />} />
          <KpiCard label="Active Customers" value={kpis.customers.value} change={kpis.customers.change} icon={<Users className="h-4 w-4" />} />
          <KpiCard label="Inventory Units"  value={kpis.inventory.value} change={kpis.inventory.change} icon={<Package className="h-4 w-4" />} />
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Revenue vs Expenses</CardTitle>
                  <CardDescription>Monthly performance, fiscal year 2026</CardDescription>
                </div>
                <Badge variant="secondary">Live</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueSeries} margin={{ left: -10, right: 8, top: 8 }}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-5)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--chart-5)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }} />
                    <Area type="monotone" dataKey="revenue"  stroke="var(--chart-1)" fill="url(#rev)" strokeWidth={2} />
                    <Area type="monotone" dataKey="expenses" stroke="var(--chart-5)" fill="url(#exp)" strokeWidth={2} />
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
                    <Pie data={salesByRegion} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={2}>
                      {salesByRegion.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5">
                {salesByRegion.map((r, i) => (
                  <div key={r.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: PIE_COLORS[i] }} />
                      <span>{r.name}</span>
                    </div>
                    <span className="font-medium tabular-nums">{r.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Inventory Status by Category</CardTitle>
              <CardDescription>Stock health across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryStatus} margin={{ left: -10, right: 8, top: 8 }}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }} />
                    <Bar dataKey="inStock"    fill="var(--chart-3)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="lowStock"   fill="var(--chart-4)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="outOfStock" fill="var(--chart-5)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs">View all</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivities.map((a) => (
                <div key={a.id} className="flex items-start gap-3 text-sm">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-muted text-[10px]">
                      {a.user.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{a.user}</span>
                      {activityIcon(a.type)}
                    </div>
                    <div className="text-xs text-muted-foreground">{a.action}</div>
                    <div className="text-[10px] text-muted-foreground/70">{a.time}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

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
                <div className="text-xs text-muted-foreground">Low stock items</div>
                <div className="mt-1 text-xl font-semibold">77</div>
                <div className="text-xs text-warning-foreground/80">across 5 categories</div>
              </div>
              <div className="rounded-md border bg-destructive/5 p-3">
                <div className="text-xs text-muted-foreground">Overdue invoices</div>
                <div className="mt-1 text-xl font-semibold">12</div>
                <div className="text-xs text-destructive">$184,200 outstanding</div>
              </div>
              <div className="rounded-md border bg-info/5 p-3">
                <div className="text-xs text-muted-foreground">Pending approvals</div>
                <div className="mt-1 text-xl font-semibold">8</div>
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
              <p className="text-sm font-medium">Transaction recorded successfully</p>
            </div>
          ) : (
            <form onSubmit={handleTxSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Transaction Type</Label>
                <Select value={txForm.type} onValueChange={(v) => setTxForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="journal">Journal Entry</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Account</Label>
                <Select value={txForm.account} onValueChange={(v) => setTxForm((f) => ({ ...f, account: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select account…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1000">1000 · Cash</SelectItem>
                    <SelectItem value="4000">4000 · Sales Revenue</SelectItem>
                    <SelectItem value="5000">5000 · COGS</SelectItem>
                    <SelectItem value="6100">6100 · Payroll Expense</SelectItem>
                    <SelectItem value="1200">1200 · Inventory</SelectItem>
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
                    onChange={(e) => setTxForm((f) => ({ ...f, amount: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Reference</Label>
                  <Input
                    placeholder="e.g. INV-10299"
                    value={txForm.ref}
                    onChange={(e) => setTxForm((f) => ({ ...f, ref: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Note (optional)</Label>
                <Input
                  placeholder="Brief description…"
                  value={txForm.note}
                  onChange={(e) => setTxForm((f) => ({ ...f, note: e.target.value }))}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setTxOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={!txForm.type || !txForm.account || !txForm.amount}>
                  Record Transaction
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}