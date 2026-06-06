import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { KpiCard } from "@/components/kpi-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ledgerEntries, revenueSeries } from "@/lib/mock-data";

export default function AccountingPage() {
  const cols = [
    { key: "date", header: "Date" },
    { key: "ref", header: "Ref", render: (r) => <span className="font-mono text-xs">{r.ref}</span> },
    { key: "account", header: "Account" },
    { key: "debit",  header: "Debit",  align: "right", render: (r) => r.debit  ? `$${r.debit.toLocaleString()}`  : "—" },
    { key: "credit", header: "Credit", align: "right", render: (r) => r.credit ? `$${r.credit.toLocaleString()}` : "—" },
  ];

  return (
    <PageShell
      title="Accounting & Finance"
      breadcrumb="Finance & Insights"
      actions={
        <>
          <Button variant="outline" size="sm">Close Period</Button>
          <Button size="sm">New Journal</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Revenue (YTD)"  value={2487320} change={12.4} format="currency" icon={<TrendingUp className="h-4 w-4" />} />
        <KpiCard label="Expenses (YTD)" value={1681000} change={7.1}  format="currency" icon={<TrendingDown className="h-4 w-4" />} />
        <KpiCard label="Net Profit"     value={806320}  change={18.9} format="currency" icon={<DollarSign className="h-4 w-4" />} />
        <KpiCard label="Cash on Hand"   value={1142800} change={2.4}  format="currency" icon={<Wallet className="h-4 w-4" />} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Profit Trend</CardTitle>
          <CardDescription>Monthly net profit, fiscal 2026</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ left: -10, right: 8 }}>
                <defs>
                  <linearGradient id="profit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }} />
                <Area type="monotone" dataKey="profit" stroke="var(--chart-3)" fill="url(#profit)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="ledger">
        <TabsList>
          <TabsTrigger value="ledger">General Ledger</TabsTrigger>
          <TabsTrigger value="pnl">P&amp;L</TabsTrigger>
          <TabsTrigger value="bs">Balance Sheet</TabsTrigger>
          <TabsTrigger value="exp">Expenses</TabsTrigger>
        </TabsList>
        <TabsContent value="ledger" className="mt-3">
          <DataTable columns={cols} rows={ledgerEntries} />
        </TabsContent>
        <TabsContent value="pnl" className="mt-3">
          <Card><CardContent className="p-6 text-sm text-muted-foreground">P&amp;L statement with comparative periods.</CardContent></Card>
        </TabsContent>
        <TabsContent value="bs" className="mt-3">
          <Card><CardContent className="p-6 text-sm text-muted-foreground">Assets, liabilities and equity snapshot.</CardContent></Card>
        </TabsContent>
        <TabsContent value="exp" className="mt-3">
          <Card><CardContent className="p-6 text-sm text-muted-foreground">Categorized expenses and budget variance.</CardContent></Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}