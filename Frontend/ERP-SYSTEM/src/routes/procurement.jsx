import { useState } from "react";
import { Plus, Truck, Building2, FileCheck, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { KpiCard } from "@/components/kpi-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { suppliers, purchaseOrders } from "@/lib/mock-data";

export default function ProcurementPage() {
  const [poOpen, setPoOpen]   = useState(false);
  const [reqOpen, setReqOpen] = useState(false);
  const [poSuccess, setPoSuccess]   = useState(false);
  const [reqSuccess, setReqSuccess] = useState(false);
  const [poForm,  setPoForm]  = useState({ supplier: "", date: "", total: "", notes: "" });
  const [reqForm, setReqForm] = useState({ item: "", qty: "", dept: "", reason: "" });

  function submitPo(e) {
    e.preventDefault();
    setPoSuccess(true);
    setTimeout(() => { setPoSuccess(false); setPoOpen(false); setPoForm({ supplier: "", date: "", total: "", notes: "" }); }, 1500);
  }

  function submitReq(e) {
    e.preventDefault();
    setReqSuccess(true);
    setTimeout(() => { setReqSuccess(false); setReqOpen(false); setReqForm({ item: "", qty: "", dept: "", reason: "" }); }, 1500);
  }

  const supplierCols = [
    { key: "id",       header: "ID" },
    { key: "name",     header: "Supplier" },
    { key: "contact",  header: "Contact" },
    { key: "country",  header: "Country" },
    { key: "rating",   header: "Rating", align: "right", render: (r) => `${r.rating.toFixed(1)} ★` },
    { key: "leadTime", header: "Lead Time" },
  ];

  const poCols = [
    { key: "id",       header: "PO #",     render: (r) => <span className="font-mono text-xs">{r.id}</span> },
    { key: "supplier", header: "Supplier" },
    { key: "date",     header: "Date" },
    { key: "total",    header: "Total",   align: "right", render: (r) => `$${r.total.toLocaleString()}` },
    { key: "status",   header: "Status",  render: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <>
      <PageShell
        title="Procurement"
        breadcrumb="Operations"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setReqOpen(true)}>
              <FileCheck className="mr-1.5 h-3.5 w-3.5" />Requisitions
            </Button>
            <Button size="sm" onClick={() => setPoOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />New PO
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Active Suppliers" value={68}     change={1.2}  icon={<Building2 className="h-4 w-4" />} />
          <KpiCard label="Open POs"         value={42}     change={-4.4} icon={<Truck className="h-4 w-4" />} />
          <KpiCard label="Pending Approval" value={8}      change={12.5} icon={<FileCheck className="h-4 w-4" />} />
          <KpiCard label="MTD Spend"        value={284100} change={6.7}  format="currency" icon={<Truck className="h-4 w-4" />} />
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
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Purchase Orders</CardTitle>
                <CardDescription>All open and recently closed POs</CardDescription>
              </CardHeader>
              <CardContent><DataTable columns={poCols} rows={purchaseOrders} /></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="suppliers"    className="mt-3"><DataTable columns={supplierCols} rows={suppliers} /></TabsContent>
          <TabsContent value="requisitions" className="mt-3"><Card><CardContent className="p-6 text-sm text-muted-foreground">Internal purchase requisitions awaiting approval.</CardContent></Card></TabsContent>
          <TabsContent value="receiving"    className="mt-3"><Card><CardContent className="p-6 text-sm text-muted-foreground">Goods receiving notes, QC and putaway.</CardContent></Card></TabsContent>
        </Tabs>
      </PageShell>

      {/* New PO Dialog */}
      <Dialog open={poOpen} onOpenChange={setPoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Purchase Order</DialogTitle></DialogHeader>
          {poSuccess ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <p className="text-sm font-medium">Purchase order created</p>
            </div>
          ) : (
            <form onSubmit={submitPo} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Supplier</Label>
                <Select value={poForm.supplier} onValueChange={(v) => setPoForm((f) => ({ ...f, supplier: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select supplier…" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input type="date" value={poForm.date}
                    onChange={(e) => setPoForm((f) => ({ ...f, date: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Total ($)</Label>
                  <Input type="number" min="0" step="0.01" placeholder="0.00" value={poForm.total}
                    onChange={(e) => setPoForm((f) => ({ ...f, total: e.target.value }))} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Notes (optional)</Label>
                <Input placeholder="e.g. Urgent — line 3 shutdown" value={poForm.notes}
                  onChange={(e) => setPoForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPoOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={!poForm.supplier || !poForm.date || !poForm.total}>Create PO</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Requisition Dialog */}
      <Dialog open={reqOpen} onOpenChange={setReqOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Purchase Requisition</DialogTitle></DialogHeader>
          {reqSuccess ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <p className="text-sm font-medium">Requisition submitted for approval</p>
            </div>
          ) : (
            <form onSubmit={submitReq} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Item / Description</Label>
                <Input placeholder="What do you need?" value={reqForm.item}
                  onChange={(e) => setReqForm((f) => ({ ...f, item: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Quantity</Label>
                  <Input type="number" min="1" placeholder="1" value={reqForm.qty}
                    onChange={(e) => setReqForm((f) => ({ ...f, qty: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Department</Label>
                  <Select value={reqForm.dept} onValueChange={(v) => setReqForm((f) => ({ ...f, dept: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="Logistics">Logistics</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Business Reason</Label>
                <Input placeholder="Why is this needed?" value={reqForm.reason}
                  onChange={(e) => setReqForm((f) => ({ ...f, reason: e.target.value }))} required />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setReqOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={!reqForm.item || !reqForm.qty || !reqForm.dept || !reqForm.reason}>Submit Requisition</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}