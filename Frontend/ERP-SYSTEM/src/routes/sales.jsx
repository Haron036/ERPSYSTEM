import { useState } from "react";
import {
  Plus, FileText, DollarSign, ShoppingBag, Receipt,
  CheckCircle2, Pencil, Trash2, AlertCircle,
} from "lucide-react";
import {
  Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { PageShell }         from "@/components/page-shell";
import { Button }            from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable }         from "@/components/data-table";
import { StatusBadge }       from "@/components/status-badge";
import { KpiCard }           from "@/components/kpi-card";
import { Badge }             from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input }             from "@/components/ui/input";
import { Label }             from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  useSalesOrders,
  useCustomers,
  useCreateSalesOrder,
  useUpdateSalesOrderStatus,
  useDeleteSalesOrder,
  useRevenueSeries,
} from "@/hooks/useApi";

// ── Label helpers ─────────────────────────────────────────────────────────────
const STATUS_LABEL  = { PROCESSING:"Processing", PICKING:"Picking", FULFILLED:"Fulfilled", QUOTED:"Quoted", CANCELLED:"Cancelled" };
const PAYMENT_LABEL = { PENDING:"Pending", PARTIAL:"Partial", PAID:"Paid" };

const FALLBACK_TREND = [
  { month:"Jan",revenue:142000,profit:44000 },{ month:"Feb",revenue:168000,profit:66000 },
  { month:"Mar",revenue:189000,profit:68000 },{ month:"Apr",revenue:205000,profit:77000 },
  { month:"May",revenue:221000,profit:87000 },{ month:"Jun",revenue:248000,profit:106000 },
  { month:"Jul",revenue:267000,profit:112000 },{ month:"Aug",revenue:281000,profit:119000 },
  { month:"Sep",revenue:298000,profit:127000 },{ month:"Oct",revenue:312000,profit:134000 },
  { month:"Nov",revenue:334000,profit:145000 },{ month:"Dec",revenue:361000,profit:160000 },
];

// ── Order form shared fields ───────────────────────────────────────────────────
function OrderFormFields({ form, setForm, customers }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Customer</Label>
        <Select value={form.customerId} onValueChange={(v) => setForm((f) => ({ ...f, customerId: v }))}>
          <SelectTrigger><SelectValue placeholder="Select customer…" /></SelectTrigger>
          <SelectContent>
            {customers.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Date</Label>
          <Input type="date" value={form.orderDate}
            onChange={(e) => setForm((f) => ({ ...f, orderDate: e.target.value }))} required />
        </div>
        <div className="space-y-1.5">
          <Label>Total ($)</Label>
          <Input type="number" min="0" step="0.01" placeholder="0.00"
            value={form.total}
            onChange={(e) => setForm((f) => ({ ...f, total: e.target.value }))} required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Notes (optional)</Label>
        <Input placeholder="Internal notes…" value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
      </div>
    </div>
  );
}

const EMPTY_FORM = { customerId:"", orderDate:"", total:"", notes:"" };

export default function SalesPage() {
  // ── Data ───────────────────────────────────────────────────────────────────
  const { data: orders    = [], isLoading: loadingOrders } = useSalesOrders();
  const { data: customers = [] }                           = useCustomers();
  const { data: trendData }                                = useRevenueSeries();
  const trendSeries = trendData ?? FALLBACK_TREND;

  const createOrder       = useCreateSalesOrder();
  const updateOrderStatus = useUpdateSalesOrderStatus();
  const deleteOrder       = useDeleteSalesOrder();

  // ── Dialog state ───────────────────────────────────────────────────────────
  const [orderOpen,   setOrderOpen]   = useState(false);
  const [quoteOpen,   setQuoteOpen]   = useState(false);
  const [statusOpen,  setStatusOpen]  = useState(false);
  const [deleteOpen,  setDeleteOpen]  = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);
  const [orderForm,   setOrderForm]   = useState(EMPTY_FORM);
  const [quoteForm,   setQuoteForm]   = useState(EMPTY_FORM);
  const [selected,    setSelected]    = useState(null);   // order being acted on
  const [newStatus,   setNewStatus]   = useState("");

  // ── Derived KPIs from live orders ─────────────────────────────────────────
  const fulfilledOrders = orders.filter((o) => o.status === "FULFILLED");
  const openOrders      = orders.filter((o) => ["PROCESSING","PICKING","QUOTED"].includes(o.status));
  const quotes          = orders.filter((o) => o.status === "QUOTED");
  const invoices        = orders.filter((o) => ["FULFILLED","PROCESSING","PICKING"].includes(o.status));
  const mtdSales        = fulfilledOrders.reduce((s, o) => s + Number(o.total), 0);
  const avgOrderValue   = orders.length ? Math.round(orders.reduce((s,o) => s + Number(o.total), 0) / orders.length) : 0;

  // ── Handlers ───────────────────────────────────────────────────────────────
  async function handleOrder(e) {
    e.preventDefault();
    try {
      await createOrder.mutateAsync({
        customerId: parseInt(orderForm.customerId),
        orderDate:  orderForm.orderDate,
        total:      parseFloat(orderForm.total),
        notes:      orderForm.notes,
        status:     "PROCESSING",
      });
      setOrderSuccess(true);
      setTimeout(() => { setOrderSuccess(false); setOrderOpen(false); setOrderForm(EMPTY_FORM); }, 1500);
    } catch (err) { alert(err.message); }
  }

  async function handleQuote(e) {
    e.preventDefault();
    try {
      await createOrder.mutateAsync({
        customerId: parseInt(quoteForm.customerId),
        orderDate:  quoteForm.orderDate,
        total:      parseFloat(quoteForm.total),
        notes:      quoteForm.notes,
        status:     "QUOTED",
      });
      setQuoteSuccess(true);
      setTimeout(() => { setQuoteSuccess(false); setQuoteOpen(false); setQuoteForm(EMPTY_FORM); }, 1500);
    } catch (err) { alert(err.message); }
  }

  async function handleStatusUpdate() {
    if (!selected || !newStatus) return;
    try {
      await updateOrderStatus.mutateAsync({ id: selected.id, status: newStatus });
      setStatusOpen(false); setSelected(null); setNewStatus("");
    } catch (err) { alert(err.message); }
  }

  async function handleDelete() {
    if (!selected) return;
    try {
      await deleteOrder.mutateAsync(selected.id);
      setDeleteOpen(false); setSelected(null);
    } catch (err) { alert(err.message); }
  }

  // ── Table columns ─────────────────────────────────────────────────────────
  const actionCell = (row) => (
    <div className="flex items-center gap-1.5">
      <Button variant="ghost" size="icon" className="h-7 w-7"
        onClick={() => { setSelected(row); setNewStatus(row.status); setStatusOpen(true); }}>
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
        onClick={() => { setSelected(row); setDeleteOpen(true); }}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  const orderCols = [
    { key:"orderNumber",  header:"Order #",  render:(r) => <span className="font-mono text-xs">{r.orderNumber}</span> },
    { key:"customerName", header:"Customer" },
    { key:"orderDate",    header:"Date" },
    { key:"total",        header:"Total", align:"right", render:(r) => `$${Number(r.total).toLocaleString()}` },
    { key:"status",       header:"Status",  render:(r) => <StatusBadge value={STATUS_LABEL[r.status]  ?? r.status} /> },
    { key:"paymentStatus",header:"Payment", render:(r) => <StatusBadge value={PAYMENT_LABEL[r.paymentStatus] ?? r.paymentStatus} /> },
    { key:"actions",      header:"",        render: actionCell },
  ];

  const quoteCols = [
    { key:"orderNumber",  header:"Quote #",  render:(r) => <span className="font-mono text-xs">{r.orderNumber}</span> },
    { key:"customerName", header:"Customer" },
    { key:"orderDate",    header:"Date" },
    { key:"total",        header:"Value", align:"right", render:(r) => `$${Number(r.total).toLocaleString()}` },
    { key:"status",       header:"Status", render:(r) => <StatusBadge value={STATUS_LABEL[r.status] ?? r.status} /> },
    { key:"actions",      header:"",       render: actionCell },
  ];

  const invoiceCols = [
    { key:"orderNumber",  header:"Invoice #", render:(r) => <span className="font-mono text-xs">{r.orderNumber}</span> },
    { key:"customerName", header:"Customer" },
    { key:"orderDate",    header:"Date" },
    { key:"total",        header:"Amount", align:"right", render:(r) => `$${Number(r.total).toLocaleString()}` },
    { key:"paymentStatus",header:"Payment", render:(r) => <StatusBadge value={PAYMENT_LABEL[r.paymentStatus] ?? r.paymentStatus} /> },
    { key:"status",       header:"Order Status", render:(r) => <StatusBadge value={STATUS_LABEL[r.status] ?? r.status} /> },
  ];

  const customerCols = [
    { key:"customerCode",  header:"ID" },
    { key:"name",          header:"Account" },
    { key:"contactPerson", header:"Primary Contact" },
    { key:"country",       header:"Country" },
    { key:"lifetimeValue", header:"Lifetime Value", align:"right",
      render:(r) => `$${Number(r.lifetimeValue).toLocaleString()}` },
    { key:"status",        header:"Status",
      render:(r) => <StatusBadge value={r.status === "OVERDUE" ? "Overdue" : "Active"} /> },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <PageShell title="Sales Management" breadcrumb="Operations"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setQuoteOpen(true)}>
              <FileText className="mr-1.5 h-3.5 w-3.5" />New Quote
            </Button>
            <Button size="sm" onClick={() => setOrderOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />New Order
            </Button>
          </>
        }
      >
        {/* KPIs — all derived from live orders */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Fulfilled Sales"  value={Math.round(mtdSales)}  change={9.2}  format="currency" icon={<DollarSign  className="h-4 w-4" />} />
          <KpiCard label="Open Orders"      value={openOrders.length}     change={5.1}  icon={<ShoppingBag className="h-4 w-4" />} />
          <KpiCard label="Invoices Out"     value={invoices.length}       change={-2.0} icon={<Receipt     className="h-4 w-4" />} />
          <KpiCard label="Avg Order Value"  value={avgOrderValue}         change={3.8}  format="currency" icon={<DollarSign  className="h-4 w-4" />} />
        </div>

        {/* Sales Trend — live from /dashboard/revenue-series */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Sales Trend</CardTitle>
                <CardDescription>Net booked revenue per month</CardDescription>
              </div>
              <Badge variant={trendData ? "default" : "secondary"}>
                {trendData ? "Live" : "Demo"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendSeries} margin={{ left:-10, right:8 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize:11 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize:11 }} stroke="var(--muted-foreground)"
                    tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background:"var(--popover)", border:"1px solid var(--border)", borderRadius:6, fontSize:12 }} />
                  <Line type="monotone" dataKey="revenue" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="profit"  stroke="var(--chart-3)" strokeWidth={2}   dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tabs — all live */}
        <Tabs defaultValue="orders">
          <TabsList>
            <TabsTrigger value="orders">
              Sales Orders
              {openOrders.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                  {openOrders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="quotes">
              Quotations
              {quotes.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px]">
                  {quotes.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-3">
            {loadingOrders
              ? <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
              : <DataTable columns={orderCols} rows={orders} />}
          </TabsContent>

          <TabsContent value="customers" className="mt-3">
            <DataTable columns={customerCols} rows={customers} />
          </TabsContent>

          <TabsContent value="quotes" className="mt-3">
            {quotes.length === 0
              ? <Card><CardContent className="p-6 text-sm text-muted-foreground">No open quotations.</CardContent></Card>
              : <DataTable columns={quoteCols} rows={quotes} />}
          </TabsContent>

          <TabsContent value="invoices" className="mt-3">
            {invoices.length === 0
              ? <Card><CardContent className="p-6 text-sm text-muted-foreground">No invoices found.</CardContent></Card>
              : <DataTable columns={invoiceCols} rows={invoices} />}
          </TabsContent>
        </Tabs>
      </PageShell>

      {/* ── New Order Dialog ───────────────────────────────────────────────── */}
      <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Sales Order</DialogTitle></DialogHeader>
          {orderSuccess ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <p className="text-sm font-medium">Order created successfully</p>
            </div>
          ) : (
            <form onSubmit={handleOrder} className="space-y-4">
              <OrderFormFields form={orderForm} setForm={setOrderForm} customers={customers} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOrderOpen(false)}>Cancel</Button>
                <Button type="submit"
                  disabled={!orderForm.customerId || !orderForm.orderDate || !orderForm.total || createOrder.isPending}>
                  {createOrder.isPending ? "Saving…" : "Create Order"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── New Quote Dialog ───────────────────────────────────────────────── */}
      <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Quotation</DialogTitle></DialogHeader>
          {quoteSuccess ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <p className="text-sm font-medium">Quote created successfully</p>
            </div>
          ) : (
            <form onSubmit={handleQuote} className="space-y-4">
              <OrderFormFields form={quoteForm} setForm={setQuoteForm} customers={customers} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setQuoteOpen(false)}>Cancel</Button>
                <Button type="submit"
                  disabled={!quoteForm.customerId || !quoteForm.orderDate || !quoteForm.total || createOrder.isPending}>
                  {createOrder.isPending ? "Saving…" : "Create Quote"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Update Status Dialog ───────────────────────────────────────────── */}
      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader><DialogTitle>Update Order Status</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Order <span className="font-mono font-medium">{selected?.orderNumber}</span>
            </p>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["QUOTED","PROCESSING","PICKING","FULFILLED","CANCELLED"].map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusOpen(false)}>Cancel</Button>
            <Button onClick={handleStatusUpdate} disabled={updateOrderStatus.isPending}>
              {updateOrderStatus.isPending ? "Saving…" : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ──────────────────────────────────────────── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader><DialogTitle>Delete Order</DialogTitle></DialogHeader>
          <div className="flex items-start gap-3 py-2">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <p className="text-sm text-muted-foreground">
              Permanently delete order{" "}
              <span className="font-mono font-medium">{selected?.orderNumber}</span>?
              This cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteOrder.isPending}>
              {deleteOrder.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}