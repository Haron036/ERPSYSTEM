import { useState } from "react";
import { Plus, ScanBarcode, Warehouse, AlertTriangle, Package, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { KpiCard } from "@/components/kpi-card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { products } from "@/lib/mock-data";

export default function InventoryPage() {
  const [productOpen, setProductOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanValue, setScanValue] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [productSuccess, setProductSuccess] = useState(false);
  const [productForm, setProductForm] = useState({
    sku: "", name: "", category: "", supplier: "", stock: "", reorder: "", price: "",
  });

  function handleProductSubmit(e) {
    e.preventDefault();
    setProductSuccess(true);
    setTimeout(() => {
      setProductSuccess(false);
      setProductOpen(false);
      setProductForm({ sku: "", name: "", category: "", supplier: "", stock: "", reorder: "", price: "" });
    }, 1500);
  }

  function handleScan(e) {
    e.preventDefault();
    const found = products.find(
      (p) => p.sku.toLowerCase() === scanValue.toLowerCase() ||
             p.name.toLowerCase().includes(scanValue.toLowerCase())
    );
    setScanResult(found || null);
  }

  const cols = [
    { key: "sku",      header: "SKU",      render: (r) => <span className="font-mono text-xs">{r.sku}</span> },
    { key: "name",     header: "Product" },
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
    { key: "price",   header: "Unit Price", align: "right", render: (r) => `$${r.price.toFixed(2)}` },
  ];

  return (
    <>
      <PageShell
        title="Inventory & Warehousing"
        breadcrumb="Operations"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => { setScanValue(""); setScanResult(null); setScanOpen(true); }}>
              <ScanBarcode className="mr-1.5 h-3.5 w-3.5" />Scan Barcode
            </Button>
            <Button size="sm" onClick={() => setProductOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />New Product
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="SKUs Tracked"     value={1284}    change={3.2}  icon={<Package className="h-4 w-4" />} />
          <KpiCard label="Warehouses"       value={4}       change={0}    icon={<Warehouse className="h-4 w-4" />} />
          <KpiCard label="Low Stock Alerts" value={77}      change={14.2} icon={<AlertTriangle className="h-4 w-4" />} />
          <KpiCard label="Inventory Value"  value={1842300} change={-1.8} format="currency" icon={<Package className="h-4 w-4" />} />
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

      {/* Scan Barcode Dialog */}
      <Dialog open={scanOpen} onOpenChange={setScanOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Scan Barcode / Search SKU</DialogTitle></DialogHeader>
          <form onSubmit={handleScan} className="space-y-3">
            <div className="space-y-1.5">
              <Label>SKU or Product Name</Label>
              <Input
                placeholder="e.g. A-2204 or Bearing"
                value={scanValue}
                onChange={(e) => { setScanValue(e.target.value); setScanResult(null); }}
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full">Look Up</Button>
          </form>
          {scanResult === null && scanValue && (
            <p className="text-sm text-destructive">No product found for "{scanValue}".</p>
          )}
          {scanResult && (
            <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1">
              <div className="font-medium">{scanResult.name}</div>
              <div className="text-xs text-muted-foreground">SKU: {scanResult.sku} · {scanResult.category}</div>
              <div className="text-xs">Stock: <span className="font-medium">{scanResult.stock.toLocaleString()}</span> · Reorder at {scanResult.reorder}</div>
              <div className="text-xs">Supplier: {scanResult.supplier} · Unit price: ${scanResult.price.toFixed(2)}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Product Dialog */}
      <Dialog open={productOpen} onOpenChange={setProductOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Product</DialogTitle></DialogHeader>
          {productSuccess ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <p className="text-sm font-medium">Product added successfully</p>
            </div>
          ) : (
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>SKU</Label>
                  <Input placeholder="e.g. A-2210" value={productForm.sku}
                    onChange={(e) => setProductForm((f) => ({ ...f, sku: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={productForm.category} onValueChange={(v) => setProductForm((f) => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fasteners">Fasteners</SelectItem>
                      <SelectItem value="Bearings">Bearings</SelectItem>
                      <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Consumables">Consumables</SelectItem>
                      <SelectItem value="Packaging">Packaging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Product Name</Label>
                <Input placeholder="Full product name" value={productForm.name}
                  onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Supplier</Label>
                <Select value={productForm.supplier} onValueChange={(v) => setProductForm((f) => ({ ...f, supplier: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select supplier…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Apex Components">Apex Components</SelectItem>
                    <SelectItem value="TorqueWorks">TorqueWorks</SelectItem>
                    <SelectItem value="MetalCore">MetalCore</SelectItem>
                    <SelectItem value="Volt&Co">Volt&Co</SelectItem>
                    <SelectItem value="ChemPlus">ChemPlus</SelectItem>
                    <SelectItem value="BoxLine">BoxLine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Stock</Label>
                  <Input type="number" min="0" placeholder="0" value={productForm.stock}
                    onChange={(e) => setProductForm((f) => ({ ...f, stock: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Reorder At</Label>
                  <Input type="number" min="0" placeholder="0" value={productForm.reorder}
                    onChange={(e) => setProductForm((f) => ({ ...f, reorder: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Unit Price ($)</Label>
                  <Input type="number" min="0" step="0.01" placeholder="0.00" value={productForm.price}
                    onChange={(e) => setProductForm((f) => ({ ...f, price: e.target.value }))} required />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setProductOpen(false)}>Cancel</Button>
                <Button type="submit">Add Product</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}