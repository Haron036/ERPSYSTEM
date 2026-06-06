import { Plus, FileText, DollarSign, ShoppingBag, Receipt } from "lucide-react";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { KpiCard } from "@/components/kpi-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { customers, salesOrders, revenueSeries } from "@/lib/mock-data";

export default function SalesPage() {
  const orderCols = [
    { key: "id", header: "Order #", render: (r) => <span className="font-mono text-xs">{r.id}</span> },
    { key: "customer", header: "Customer" },
    { key: "date", header: "Date" },
    { key: "total", header: "Total", align: "right", render: (r) => `$${r.total.toLocaleString()}` },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
    { key: "payment", header: "Payment", render: (r) => <StatusBadge value={r.payment} /> },
  ];

  const customerCols = [
    { key: "id", header: "ID" },
    { key: "name", header: "Account" },
    { key: "contact", header: "Primary Contact" },
    { key: "country", header: "Country" },
    { key: "lifetime", header: "Lifetime Value", align: "right", render: (r) => `$${r.lifetime.toLocaleString()}` },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <PageShell
      title="Sales Management"
      breadcrumb="Operations"
      actions={
        <>
          <Button variant="outline" size="sm"><FileText className="mr-1.5 h-3.5 w-3.5" />New Quote</Button>
          <Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" />New Order</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="MTD Sales"       value={361000} change={9.2}  format="currency" icon={<DollarSign className="h-4 w-4" />} />
        <KpiCard label="Open Orders"     value={184}    change={5.1}  icon={<ShoppingBag className="h-4 w-4" />} />
        <KpiCard label="Invoices Out"    value={92}     change={-2.0} icon={<Receipt className="h-4 w-4" />} />
        <KpiCard label="Avg Order Value" value={1962}   change={3.8}  format="currency" icon={<DollarSign className="h-4 w-4" />} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Sales Trend</CardTitle>
          <CardDescription>Net booked revenue per month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueSeries} margin={{ left: -10, right: 8 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="profit"  stroke="var(--chart-3)" strokeWidth={2}   dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Sales Orders</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="quotes">Quotations</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="mt-3">
          <DataTable columns={orderCols} rows={salesOrders} />
        </TabsContent>
        <TabsContent value="customers" className="mt-3">
          <DataTable columns={customerCols} rows={customers} />
        </TabsContent>
        <TabsContent value="quotes" className="mt-3">
          <Card><CardContent className="p-6 text-sm text-muted-foreground">Outstanding quotations and conversion funnel.</CardContent></Card>
        </TabsContent>
        <TabsContent value="invoices" className="mt-3">
          <Card><CardContent className="p-6 text-sm text-muted-foreground">Issued invoices with payment status and aging.</CardContent></Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}