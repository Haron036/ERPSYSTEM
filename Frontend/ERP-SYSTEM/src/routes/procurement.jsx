import { createFileRoute } from "@tanstack/react-router";
import { Plus, Truck, Building2, FileCheck } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { KpiCard } from "@/components/kpi-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { suppliers, purchaseOrders } from "@/lib/mock-data";

export const Route = createFileRoute("/procurement")({
  head: () => ({ meta: [{ title: "Procurement · NorthForge ERP" }] }),
  component: ProcurementPage,
});

function ProcurementPage() {
  const supplierCols = [
    { key: "id", header: "ID" },
    { key: "name", header: "Supplier" },
    { key: "contact", header: "Contact" },
    { key: "country", header: "Country" },
    { key: "rating", header: "Rating", align: "right", render: (r) => `${r.rating.toFixed(1)} ★` },
    { key: "leadTime", header: "Lead Time" },
  ];

  const poCols = [
    { key: "id", header: "PO #", render: (r) => <span className="font-mono text-xs">{r.id}</span> },
    { key: "supplier", header: "Supplier" },
    { key: "date", header: "Date" },
    { key: "total", header: "Total", align: "right", render: (r) => `$${r.total.toLocaleString()}` },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <PageShell
      title="Procurement"
      breadcrumb="Operations"
      actions={
        <>
          <Button variant="outline" size="sm"><FileCheck className="mr-1.5 h-3.5 w-3.5" />Requisitions</Button>
          <Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" />New PO</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Active Suppliers" value={68} change={1.2} icon={<Building2 className="h-4 w-4" />} />
        <KpiCard label="Open POs" value={42} change={-4.4} icon={<Truck className="h-4 w-4" />} />
        <KpiCard label="Pending Approval" value={8} change={12.5} icon={<FileCheck className="h-4 w-4" />} />
        <KpiCard label="MTD Spend" value={284100} change={6.7} format="currency" icon={<Truck className="h-4 w-4" />} />
      </div>

      <Tabs defaultValue="po">
        <TabsList>
          <TabsTrigger value="po">Purchase Orders</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="requisitions">Requisitions</TabsTrigger>
          <TabsTrigger value="receiving">Goods Receiving</TabsTrigger>
        </TabsList>
        <TabsContent value="po" className="mt-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Purchase Orders</CardTitle><CardDescription>All open and recently closed POs</CardDescription></CardHeader>
            <CardContent><DataTable columns={poCols} rows={purchaseOrders} /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="suppliers" className="mt-3">
          <DataTable columns={supplierCols} rows={suppliers} />
        </TabsContent>
        <TabsContent value="requisitions" className="mt-3">
          <Card><CardContent className="p-6 text-sm text-muted-foreground">Internal purchase requisitions awaiting approval.</CardContent></Card>
        </TabsContent>
        <TabsContent value="receiving" className="mt-3">
          <Card><CardContent className="p-6 text-sm text-muted-foreground">Goods receiving notes, QC and putaway.</CardContent></Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
export default ProcurementPage;