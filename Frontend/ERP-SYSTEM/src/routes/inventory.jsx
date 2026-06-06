import { createFileRoute } from "@tanstack/react-router";
import { Plus, ScanBarcode, Warehouse, AlertTriangle, Package } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { KpiCard } from "@/components/kpi-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { products } from "@/lib/mock-data";

export const Route = createFileRoute("/inventory")({
  head: () => ({ meta: [{ title: "Inventory · NorthForge ERP" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const cols = [
    { key: "sku", header: "SKU", render: (r) => <span className="font-mono text-xs">{r.sku}</span> },
    { key: "name", header: "Product" },
    { key: "category", header: "Category" },
    { key: "supplier", header: "Supplier" },
    {
      key: "stock",
      header: "Stock Level",
      render: (r) => {
        const pct = Math.min(100, (r.stock / Math.max(r.reorder * 4, 1)) * 100);
        const low = r.stock < r.reorder;
        return (
          <div className="min-w-[160px]">
            <div className="flex items-center justify-between text-xs">
              <span className="tabular-nums font-medium">{r.stock.toLocaleString()}</span>
              {low && <Badge variant="outline" className="border-warning/40 bg-warning/15 text-warning-foreground">Low</Badge>}
            </div>
            <Progress value={pct} className="mt-1 h-1.5" />
          </div>
        );
      },
    },
    { key: "reorder", header: "Reorder At", align: "right" },
    { key: "price", header: "Unit Price", align: "right", render: (r) => `$${r.price.toFixed(2)}` },
  ];

  return (
    <PageShell
      title="Inventory & Warehousing"
      breadcrumb="Operations"
      actions={
        <>
          <Button variant="outline" size="sm"><ScanBarcode className="mr-1.5 h-3.5 w-3.5" />Scan Barcode</Button>
          <Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" />New Product</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="SKUs Tracked" value={1284} change={3.2} icon={<Package className="h-4 w-4" />} />
        <KpiCard label="Warehouses" value={4} change={0} icon={<Warehouse className="h-4 w-4" />} />
        <KpiCard label="Low Stock Alerts" value={77} change={14.2} icon={<AlertTriangle className="h-4 w-4" />} />
        <KpiCard label="Inventory Value" value={1842300} change={-1.8} format="currency" icon={<Package className="h-4 w-4" />} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Stock Catalog</CardTitle>
          <CardDescription>All tracked SKUs across warehouses</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={cols} rows={products} />
        </CardContent>
      </Card>
    </PageShell>
  );
}
export default InventoryPage;