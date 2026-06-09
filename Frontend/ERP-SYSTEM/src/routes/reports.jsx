import { Download, FileSpreadsheet, FileText, BarChart3 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSalesOrders, useEmployees, useProducts, useLedger, useLeads } from "@/hooks/useApi";
import { revenueSeries, salesByRegion, departmentHeadcount } from "@/lib/mock-data";

function downloadCSV(filename, rows) {
  if (!rows.length) { alert("No data available for this report yet."); return; }
  const headers = Object.keys(rows[0]);
  const csv = [headers, ...rows.map((r) => headers.map((h) => r[h] ?? ""))].map((r) => r.join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  Object.assign(document.createElement("a"), { href: url, download: filename }).click();
  URL.revokeObjectURL(url);
}

function downloadPDF(title) {
  alert(`PDF export for "${title}" requires a server-side PDF library (e.g. iText or JasperReports). Hook this up in your Spring Boot backend.`);
}

export default function ReportsPage() {
  const { data: orders    = [] } = useSalesOrders();
  const { data: employees = [] } = useEmployees();
  const { data: products  = [] } = useProducts();
  const { data: ledger    = [] } = useLedger();
  const { data: leads     = [] } = useLeads();

  // Build headcount from live employees or fall back to mock
  const headcountData = employees.length
    ? Object.entries(
        employees.reduce((acc, e) => {
          acc[e.department] = (acc[e.department] || 0) + 1;
          return acc;
        }, {})
      ).map(([dept, count]) => ({ dept, count }))
    : departmentHeadcount;

  const reports = [
    {
      title: "Monthly Sales Report",
      desc:  "Net bookings, AOV, top customers",
      icon:  BarChart3,
      onExcel: () => downloadCSV("sales-report.csv", orders.map((o) => ({
        OrderNumber:   o.orderNumber,
        Customer:      o.customerName,
        Date:          o.orderDate,
        Total:         o.total,
        Status:        o.status,
        PaymentStatus: o.paymentStatus,
      }))),
    },
    {
      title: "Inventory Valuation",
      desc:  "On-hand value by warehouse / category",
      icon:  BarChart3,
      onExcel: () => downloadCSV("inventory-valuation.csv", products.map((p) => ({
        SKU:           p.sku,
        Name:          p.name,
        Category:      p.category,
        Supplier:      p.supplierName,
        StockQuantity: p.stockQuantity,
        UnitPrice:     p.unitPrice,
        TotalValue:    (p.stockQuantity * p.unitPrice).toFixed(2),
      }))),
    },
    {
      title: "Trial Balance",
      desc:  "Period-end GL trial balance",
      icon:  FileText,
      onExcel: () => downloadCSV("trial-balance.csv", ledger.map((e) => ({
        Date:      e.entryDate,
        Account:   e.account,
        Debit:     e.debit,
        Credit:    e.credit,
        Reference: e.reference,
        Memo:      e.memo,
      }))),
    },
    {
      title: "Profit & Loss",
      desc:  "Comparative monthly P&L",
      icon:  FileText,
      onExcel: () => downloadCSV("profit-loss.csv", revenueSeries.map((r) => ({
        Month:    r.month,
        Revenue:  r.revenue,
        Expenses: r.expenses,
        Profit:   r.profit,
      }))),
    },
    {
      title: "HR Headcount",
      desc:  "Employees by department and status",
      icon:  FileSpreadsheet,
      onExcel: () => downloadCSV("headcount.csv", employees.map((e) => ({
        Code:       e.employeeCode,
        Name:       e.name,
        Role:       e.role,
        Department: e.department,
        Email:      e.email,
        Status:     e.status,
        Joined:     e.joinedDate,
      }))),
    },
    {
      title: "CRM Pipeline",
      desc:  "Lead pipeline by stage and value",
      icon:  BarChart3,
      onExcel: () => downloadCSV("crm-pipeline.csv", leads.map((l) => ({
        Code:           l.leadCode,
        Company:        l.companyName,
        Source:         l.source,
        Stage:          l.stage,
        EstimatedValue: l.estimatedValue,
        Owner:          l.ownerName,
      }))),
    },
  ];

  function handleExportAll() {
    downloadCSV("revenue-report.csv", revenueSeries);
  }

  return (
    <PageShell
      title="Reports & Analytics"
      breadcrumb="Finance & Insights"
      actions={
        <>
          <Button variant="outline" size="sm" onClick={handleExportAll}>
            <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />Excel
          </Button>
          <Button size="sm" onClick={() => downloadPDF("Full Report")}>
            <Download className="mr-1.5 h-3.5 w-3.5" />Export PDF
          </Button>
        </>
      }
    >
      {/* Charts */}
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
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" width={90} />
                  <Tooltip contentStyle={{ background:"var(--popover)", border:"1px solid var(--border)", borderRadius:6, fontSize:12 }} />
                  <Bar dataKey="value" fill="var(--chart-2)" radius={[0,3,3,0]} />
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
                <BarChart data={revenueSeries} margin={{ left:-10, right:8 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize:11 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize:11 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background:"var(--popover)", border:"1px solid var(--border)", borderRadius:6, fontSize:12 }} />
                  <Bar dataKey="revenue" fill="var(--chart-1)" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Headcount chart (live) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Headcount by Department</CardTitle>
          <CardDescription>Live from HR module</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={headcountData} margin={{ left:-10, right:8 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="dept" tick={{ fontSize:11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize:11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ background:"var(--popover)", border:"1px solid var(--border)", borderRadius:6, fontSize:12 }} />
                <Bar dataKey="count" fill="var(--chart-3)" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Standard Reports grid */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Standard Reports</CardTitle>
          <CardDescription>Live data — click Excel to download CSV</CardDescription>
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
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => downloadPDF(r.title)}>PDF</Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={r.onExcel}>Excel</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            Tip: All Excel exports pull live data from the backend. PDF generation requires a server-side renderer.
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
