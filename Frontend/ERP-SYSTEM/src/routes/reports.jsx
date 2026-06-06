import { Download, FileSpreadsheet, FileText, BarChart3 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { revenueSeries, salesByRegion, departmentHeadcount } from "@/lib/mock-data";

const reports = [
  { title: "Monthly Sales Report",  desc: "Net bookings, AOV, top customers",       icon: BarChart3 },
  { title: "Inventory Valuation",   desc: "On-hand value by warehouse / category",  icon: BarChart3 },
  { title: "Trial Balance",         desc: "Period-end GL trial balance",             icon: FileText },
  { title: "Profit & Loss",         desc: "Comparative monthly P&L",                icon: FileText },
  { title: "Aged Receivables",      desc: "Customer balances, 0–30, 30–60, 60+",   icon: FileSpreadsheet },
  { title: "Procurement Spend",     desc: "Spend by supplier and category",         icon: BarChart3 },
];

export default function ReportsPage() {
  return (
    <PageShell
      title="Reports & Analytics"
      breadcrumb="Finance & Insights"
      actions={
        <>
          <Button variant="outline" size="sm"><FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />Excel</Button>
          <Button size="sm"><Download className="mr-1.5 h-3.5 w-3.5" />Export PDF</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue by Region</CardTitle>
            <CardDescription>Share of total revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByRegion} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" width={100} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }} />
                  <Bar dataKey="value" fill="var(--chart-2)" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quarterly Bookings</CardTitle>
            <CardDescription>Net revenue per month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueSeries} margin={{ left: -10, right: 8 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }} />
                  <Bar dataKey="revenue" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Standard Reports</CardTitle>
          <CardDescription>Generate, schedule and export</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((r) => (
              <div key={r.title} className="group flex items-start gap-3 rounded-md border bg-card p-3 transition-colors hover:bg-muted/40">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <r.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{r.title}</div>
                  <div className="text-xs text-muted-foreground">{r.desc}</div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs">PDF</Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs">Excel</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            Tip: Department headcount currently spans {departmentHeadcount.length} departments. Use custom filters to build cross-module reports.
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}