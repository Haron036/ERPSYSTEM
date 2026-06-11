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
import { usePurchaseOrders, useSuppliers, useCreatePurchaseOrder } from "@/hooks/useApi";

const poStatusLabel = (s) => ({
  PENDING_APPROVAL: "Pending Approval",
  APPROVED: "Approved",
  IN_TRANSIT: "In Transit",
  RECEIVED: "Received",
  CANCELLED: "Cancelled",
}[s] ?? s);

const EMPTY_PO  = { supplierId:"", orderDate:"", total:"", notes:"" };
const EMPTY_REQ = { item:"", qty:"", dept:"", reason:"" };

export default function ProcurementPage() {
  const { data: pos = [],       isLoading } = usePurchaseOrders();
  const { data: suppliers = [] }            = useSuppliers();
  const createPo = useCreatePurchaseOrder();

  const [poOpen,  setPoOpen]    = useState(false);
  const [reqOpen, setReqOpen]   = useState(false);
  const [poSuccess,  setPoSuccess]  = useState(false);
  const [reqSuccess, setReqSuccess] = useState(false);
  const [poForm,  setPoForm]    = useState(EMPTY_PO);
  const [reqForm, setReqForm]   = useState(EMPTY_REQ);

  async function submitPo(e) {
    e.preventDefault();
    try {
      await createPo.mutateAsync({
        supplierId: parseInt(poForm.supplierId),
        orderDate:  poForm.orderDate,
        total:      parseFloat(poForm.total),
        notes:      poForm.notes,
      });
      setPoSuccess(true);
      setTimeout(() => { setPoSuccess(false); setPoOpen(false); setPoForm(EMPTY_PO); }, 1500);
    } catch (err) { alert(err.message); }
  }

  function submitReq(e) {
    e.preventDefault();
    // Requisitions are local-only for now (no dedicated backend endpoint)
    setReqSuccess(true);
    setTimeout(() => { setReqSuccess(false); setReqOpen(false); setReqForm(EMPTY_REQ); }, 1500);
  }

  const pending  = pos.filter((p) => p.status === "PENDING_APPROVAL").length;
  const openPos  = pos.filter((p) => !["RECEIVED","CANCELLED"].includes(p.status)).length;
  const mtdSpend = pos.reduce((s, p) => s + Number(p.total), 0);

  const supplierCols = [
    { key:"supplierCode",  header:"ID" },
    { key:"name",          header:"Supplier" },
    { key:"contactPerson", header:"Contact" },
    { key:"country",       header:"Country" },
    { key:"rating",        header:"Rating", align:"right", render:(r) => `${Number(r.rating).toFixed(1)} ★` },
    { key:"leadTime",      header:"Lead Time" },
  ];

  const poCols = [
    { key:"poNumber",     header:"PO #",    render:(r) => <span className="font-mono text-xs">{r.poNumber}</span> },
    { key:"supplierName", header:"Supplier" },
    { key:"orderDate",    header:"Date" },
    { key:"total",        header:"Total", align:"right", render:(r) => `$${Number(r.total).toLocaleString()}` },
    { key:"status",       header:"Status", render:(r) => <StatusBadge value={poStatusLabel(r.status)} /> },
  ];

  return (
    <>
      <PageShell title="Procurement" breadcrumb="Operations"
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
<KpiCard label="Active Suppliers" value={suppliers.length}/>
<KpiCard label="Open POs"         value={openPos}/>
<KpiCard label="Pending Approval" value={pending} />
<KpiCard label="MTD Spend"        value={Math.round(mtdSpend)}   />
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
              <CardContent>{isLoading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p> : <DataTable columns={poCols} rows={pos} />}</CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="suppliers"    className="mt-3"><DataTable columns={supplierCols} rows={suppliers} /></TabsContent>
          <TabsContent value="requisitions" className="mt-3"><Card><CardContent className="p-6 text-sm text-muted-foreground">Internal purchase requisitions awaiting approval.</CardContent></Card></TabsContent>
          <TabsContent value="receiving"    className="mt-3"><Card><CardContent className="p-6 text-sm text-muted-foreground">Goods receiving notes, QC and putaway.</CardContent></Card></TabsContent>
        </Tabs>
      </PageShell>

      {/* New PO */}
      <Dialog open={poOpen} onOpenChange={setPoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Purchase Order</DialogTitle></DialogHeader>
          {poSuccess ? (
            <div className="flex flex-col items-center gap-2 py-6"><CheckCircle2 className="h-10 w-10 text-success" /><p className="text-sm font-medium">Purchase order created</p></div>
          ) : (
            <form onSubmit={submitPo} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Supplier</Label>
                <Select value={poForm.supplierId} onValueChange={(v) => setPoForm((f) => ({ ...f, supplierId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select supplier…" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input type="date" value={poForm.orderDate} onChange={(e) => setPoForm((f) => ({ ...f, orderDate: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Total ($)</Label>
                  <Input type="number" min="0" step="0.01" placeholder="0.00" value={poForm.total}
                    onChange={(e) => setPoForm((f) => ({ ...f, total: e.target.value }))} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Input placeholder="e.g. Urgent — line 3 shutdown" value={poForm.notes}
                  onChange={(e) => setPoForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPoOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={!poForm.supplierId || !poForm.orderDate || !poForm.total || createPo.isPending}>
                  {createPo.isPending ? "Saving…" : "Create PO"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Requisition */}
      <Dialog open={reqOpen} onOpenChange={setReqOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Purchase Requisition</DialogTitle></DialogHeader>
          {reqSuccess ? (
            <div className="flex flex-col items-center gap-2 py-6"><CheckCircle2 className="h-10 w-10 text-success" /><p className="text-sm font-medium">Requisition submitted</p></div>
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
                      {["Manufacturing","Logistics","Engineering","Finance","HR","ICT"].map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
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
