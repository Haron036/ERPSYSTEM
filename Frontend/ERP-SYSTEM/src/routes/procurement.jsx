import { useState, useMemo } from "react";
import {
  Plus, Truck, FileCheck, CheckCircle2, Trash2, MoreHorizontal,
  AlertCircle, Search,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { KpiCard } from "@/components/kpi-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  usePurchaseOrders,
  useSuppliers,
  useCreatePurchaseOrder,
  useUpdatePurchaseOrderStatus,
  useDeletePurchaseOrder,
} from "@/hooks/useApi";
import { token } from "@/lib/api";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

// ── constants ─────────────────────────────────────────────────────────────────

const PO_STATUSES = [
  { value: "PENDING_APPROVAL", label: "Pending Approval" },
  { value: "APPROVED",         label: "Approved"         },
  { value: "IN_TRANSIT",       label: "In Transit"       },
  { value: "RECEIVED",         label: "Received"         },
  { value: "CANCELLED",        label: "Cancelled"        },
];

const poStatusLabel = (s) =>
  PO_STATUSES.find((x) => x.value === s)?.label ?? s;

const EMPTY_PO  = { supplierId: "", orderDate: "", total: "", notes: "" };
const EMPTY_REQ = { item: "", qty: "", dept: "", reason: "" };

// ── helpers ───────────────────────────────────────────────────────────────────

function isMtd(dateStr) {
  if (!dateStr) return false;
  const d   = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function canMutate(role) {
  return role === "ADMIN" || role === "MANAGER";
}

// ── sub-components ────────────────────────────────────────────────────────────

function ErrorBanner({ message }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <AlertCircle className="h-4 w-4 shrink-0" />
      {message ?? "Failed to load data. Please refresh."}
    </div>
  );
}

function PoActions({ po, onStatusChange, onDelete, disabled }) {
  const nextStatuses = PO_STATUSES.filter((s) => s.value !== po.status);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7" disabled={disabled}>
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {nextStatuses.map((s) => (
          <DropdownMenuItem key={s.value} onClick={() => onStatusChange(po.id, s.value)}>
            → {s.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onDelete(po)}
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Delete PO
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function ProcurementPage() {
  const {
    data: pos = [],
    isLoading: posLoading,
    isError: posError,
  } = usePurchaseOrders();

  const {
    data: suppliers = [],
    isLoading: suppliersLoading,
    isError: suppliersError,
  } = useSuppliers();

  const createPo       = useCreatePurchaseOrder();
  const updateStatus   = useUpdatePurchaseOrderStatus();
  const deletePo       = useDeletePurchaseOrder();

  // Role check — ADMIN/MANAGER can mutate
  const userRole   = token.user()?.role ?? "";
  const canEdit    = canMutate(userRole);
  const anyPending = updateStatus.isPending || deletePo.isPending;

  // Dialog state
  const [poOpen,      setPoOpen]      = useState(false);
  const [reqOpen,     setReqOpen]     = useState(false);
  const [poSuccess,   setPoSuccess]   = useState(false);
  const [reqSuccess,  setReqSuccess]  = useState(false);
  const [poForm,      setPoForm]      = useState(EMPTY_PO);
  const [reqForm,     setReqForm]     = useState(EMPTY_REQ);

  // Delete confirm dialog
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Supplier search
  const [supplierSearch, setSupplierSearch] = useState("");

  // ── KPI derivations ──────────────────────────────────────────────────────

  const { pending, openPos, mtdSpend } = useMemo(() => {
    const pending  = pos.filter((p) => p.status === "PENDING_APPROVAL").length;
    const openPos  = pos.filter((p) => !["RECEIVED", "CANCELLED"].includes(p.status)).length;
    const mtdSpend = pos
      .filter((p) => isMtd(p.orderDate))
      .reduce((s, p) => s + Number(p.total), 0);
    return { pending, openPos, mtdSpend };
  }, [pos]);

  const filteredSuppliers = useMemo(() => {
    const q = supplierSearch.trim().toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.country?.toLowerCase().includes(q) ||
        s.contactPerson?.toLowerCase().includes(q),
    );
  }, [suppliers, supplierSearch]);

  // ── handlers ─────────────────────────────────────────────────────────────

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
      setTimeout(() => {
        setPoSuccess(false);
        setPoOpen(false);
        setPoForm(EMPTY_PO);
      }, 1500);
    } catch (err) {
      toast.error("Failed to create PO", { description: err?.message });
    }
  }

  async function handleStatusChange(id, status) {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success(`PO updated to ${poStatusLabel(status)}`);
    } catch (err) {
      toast.error("Status update failed", { description: err?.message });
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    try {
      await deletePo.mutateAsync(deleteTarget.id);
      toast.success(`${deleteTarget.poNumber} deleted`);
    } catch (err) {
      toast.error("Delete failed", { description: err?.message });
    } finally {
      setDeleteTarget(null);
    }
  }

  function submitReq(e) {
    e.preventDefault();
    setReqSuccess(true);
    setTimeout(() => {
      setReqSuccess(false);
      setReqOpen(false);
      setReqForm(EMPTY_REQ);
    }, 1500);
  }

  // ── table columns ─────────────────────────────────────────────────────────

  const supplierCols = [
    { key: "supplierCode",  header: "ID"          },
    { key: "name",          header: "Supplier"     },
    { key: "contactPerson", header: "Contact"      },
    { key: "country",       header: "Country"      },
    {
      key: "rating", header: "Rating", align: "right",
      render: (r) => `${Number(r.rating).toFixed(1)} ★`,
    },
    { key: "leadTime", header: "Lead Time" },
  ];

  const poCols = [
    {
      key: "poNumber", header: "PO #",
      render: (r) => <span className="font-mono text-xs">{r.poNumber}</span>,
    },
    { key: "supplierName", header: "Supplier"  },
    { key: "orderDate",    header: "Date"      },
    {
      key: "total", header: "Total", align: "right",
      render: (r) => `$${Number(r.total).toLocaleString()}`,
    },
    {
      key: "status", header: "Status",
      render: (r) => <StatusBadge value={poStatusLabel(r.status)} />,
    },
    ...(canEdit
      ? [
          {
            key: "_actions", header: "",
            render: (r) => (
              <PoActions
                po={r}
                onStatusChange={handleStatusChange}
                onDelete={setDeleteTarget}
                disabled={anyPending}
              />
            ),
          },
        ]
      : []),
  ];

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <>
      <PageShell
        title="Procurement"
        breadcrumb="Operations"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setReqOpen(true)}>
              <FileCheck className="mr-1.5 h-3.5 w-3.5" />
              Requisitions
            </Button>
            {canEdit && (
              <Button size="sm" onClick={() => setPoOpen(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                New PO
              </Button>
            )}
          </>
        }
      >
        {/* KPIs */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Active Suppliers" value={suppliers.length} />
          <KpiCard label="Open POs"         value={openPos} />
          <KpiCard label="Pending Approval" value={pending} />
          <KpiCard label="MTD Spend"        value={`$${Math.round(mtdSpend).toLocaleString()}`} />
        </div>

        {posError && <ErrorBanner message="Could not load purchase orders." />}

        {/* Tabs */}
        <Tabs defaultValue="po">
          <TabsList>
            <TabsTrigger value="po">Purchase Orders</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="requisitions">Requisitions</TabsTrigger>
            <TabsTrigger value="receiving">Goods Receiving</TabsTrigger>
          </TabsList>

          {/* Purchase Orders */}
          <TabsContent value="po" className="mt-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Purchase Orders</CardTitle>
                <CardDescription>All open and recently closed POs</CardDescription>
              </CardHeader>
              <CardContent>
                {posLoading ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
                ) : pos.length === 0 ? (
                  <div className="py-10 text-center">
                    <Truck className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">No purchase orders yet.</p>
                    {canEdit && (
                      <Button size="sm" className="mt-3" onClick={() => setPoOpen(true)}>
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Create first PO
                      </Button>
                    )}
                  </div>
                ) : (
                  <DataTable columns={poCols} rows={pos} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suppliers */}
          <TabsContent value="suppliers" className="mt-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Suppliers</CardTitle>
                <CardDescription>Vendor directory</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    className="pl-8 h-8 text-sm"
                    placeholder="Search suppliers…"
                    value={supplierSearch}
                    onChange={(e) => setSupplierSearch(e.target.value)}
                  />
                </div>
                {suppliersError ? (
                  <ErrorBanner message="Could not load suppliers." />
                ) : suppliersLoading ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
                ) : filteredSuppliers.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No suppliers match "{supplierSearch}".
                  </p>
                ) : (
                  <DataTable columns={supplierCols} rows={filteredSuppliers} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requisitions — local only, no backend endpoint yet */}
          <TabsContent value="requisitions" className="mt-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Purchase Requisitions</CardTitle>
                <CardDescription>Internal requests awaiting approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-10 text-center">
                  <FileCheck className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No requisitions submitted yet.</p>
                  <Button size="sm" className="mt-3" onClick={() => setReqOpen(true)}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    New Requisition
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goods Receiving */}
          <TabsContent value="receiving" className="mt-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Goods Receiving</CardTitle>
                <CardDescription>
                  Inspect and put away inbound shipments against approved POs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {posLoading ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
                ) : (
                  <>
                    {pos.filter((p) => p.status === "IN_TRANSIT").length === 0 ? (
                      <div className="py-10 text-center">
                        <Truck className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No shipments currently in transit.
                        </p>
                      </div>
                    ) : (
                      <DataTable
                        columns={[
                          {
                            key: "poNumber", header: "PO #",
                            render: (r) => <span className="font-mono text-xs">{r.poNumber}</span>,
                          },
                          { key: "supplierName", header: "Supplier"  },
                          { key: "orderDate",    header: "Order Date" },
                          {
                            key: "total", header: "Value", align: "right",
                            render: (r) => `$${Number(r.total).toLocaleString()}`,
                          },
                          ...(canEdit
                            ? [
                                {
                                  key: "_receive", header: "",
                                  render: (r) => (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={anyPending}
                                      onClick={() => handleStatusChange(r.id, "RECEIVED")}
                                    >
                                      Mark received
                                    </Button>
                                  ),
                                },
                              ]
                            : []),
                        ]}
                        rows={pos.filter((p) => p.status === "IN_TRANSIT")}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageShell>

      {/* ── New PO dialog ──────────────────────────────────────────────────── */}
      <Dialog open={poOpen} onOpenChange={setPoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Purchase Order</DialogTitle>
          </DialogHeader>
          {poSuccess ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <p className="text-sm font-medium">Purchase order created</p>
            </div>
          ) : (
            <form onSubmit={submitPo} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Supplier</Label>
                <Select
                  value={poForm.supplierId}
                  onValueChange={(v) => setPoForm((f) => ({ ...f, supplierId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier…" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={poForm.orderDate}
                    onChange={(e) => setPoForm((f) => ({ ...f, orderDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Total ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={poForm.total}
                    onChange={(e) => setPoForm((f) => ({ ...f, total: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Input
                  placeholder="e.g. Urgent — line 3 shutdown"
                  value={poForm.notes}
                  onChange={(e) => setPoForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPoOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!poForm.supplierId || !poForm.orderDate || !poForm.total || createPo.isPending}
                >
                  {createPo.isPending ? "Saving…" : "Create PO"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Requisition dialog ─────────────────────────────────────────────── */}
      <Dialog open={reqOpen} onOpenChange={setReqOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Purchase Requisition</DialogTitle>
          </DialogHeader>
          {reqSuccess ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <p className="text-sm font-medium">Requisition submitted</p>
            </div>
          ) : (
            <form onSubmit={submitReq} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Item / Description</Label>
                <Input
                  placeholder="What do you need?"
                  value={reqForm.item}
                  onChange={(e) => setReqForm((f) => ({ ...f, item: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={reqForm.qty}
                    onChange={(e) => setReqForm((f) => ({ ...f, qty: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Department</Label>
                  <Select
                    value={reqForm.dept}
                    onValueChange={(v) => setReqForm((f) => ({ ...f, dept: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Manufacturing", "Logistics", "Engineering", "Finance", "HR", "ICT"].map(
                        (d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Business Reason</Label>
                <Input
                  placeholder="Why is this needed?"
                  value={reqForm.reason}
                  onChange={(e) => setReqForm((f) => ({ ...f, reason: e.target.value }))}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setReqOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!reqForm.item || !reqForm.qty || !reqForm.dept || !reqForm.reason}
                >
                  Submit Requisition
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.poNumber}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the purchase order. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={deletePo.isPending}
            >
              {deletePo.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </>
  );
}