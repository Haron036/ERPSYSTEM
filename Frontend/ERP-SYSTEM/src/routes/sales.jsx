// ─────────────────────────────────────────────────────────────────────────────
//  SALES  —  src/routes/sales.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { Plus, FileText, DollarSign, ShoppingBag, Receipt, CheckCircle2 } from "lucide-react";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
import { useSalesOrders, useCustomers, useCreateSalesOrder } from "@/hooks/useApi";
import { revenueSeries } from "@/lib/mock-data";

const statusLabel = (s) => ({ PROCESSING:"Processing", PICKING:"Picking", FULFILLED:"Fulfilled", QUOTED:"Quoted", CANCELLED:"Cancelled" }[s] ?? s);
const payLabel    = (s) => ({ PENDING:"Pending", PARTIAL:"Partial", PAID:"Paid" }[s] ?? s);

export default function SalesPage() {
  const { data: orders    = [], isLoading: loadingOrders } = useSalesOrders();
  const { data: customers = [] }                           = useCustomers();
  const createOrder = useCreateSalesOrder();

  const [orderOpen, setOrderOpen]     = useState(false);
  const [quoteOpen, setQuoteOpen]     = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);
  const [orderForm, setOrderForm]     = useState({ customerId:"", orderDate:"", total:"", notes:"" });
  const [quoteForm, setQuoteForm]     = useState({ customerId:"", orderDate:"", total:"", notes:"" });

  async function submitForm(form, isQuote) {
    await createOrder.mutateAsync({
      customerId: parseInt(form.customerId),
      orderDate:  form.orderDate,
      total:      parseFloat(form.total),
      notes:      form.notes,
      status:     isQuote ? "QUOTED" : "PROCESSING",
    });
  }

  async function handleOrder(e) {
    e.preventDefault();
    try {
      await submitForm(orderForm, false);
      setOrderSuccess(true);
      setTimeout(() => { setOrderSuccess(false); setOrderOpen(false); setOrderForm({ customerId:"", orderDate:"", total:"", notes:"" }); }, 1500);
    } catch (err) { alert(err.message); }
  }

  async function handleQuote(e) {
    e.preventDefault();
    try {
      await submitForm(quoteForm, true);
      setQuoteSuccess(true);
      setTimeout(() => { setQuoteSuccess(false); setQuoteOpen(false); setQuoteForm({ customerId:"", orderDate:"", total:"", notes:"" }); }, 1500);
    } catch (err) { alert(err.message); }
  }

  const orderCols = [
    { key:"orderNumber", header:"Order #",  render:(r) => <span className="font-mono text-xs">{r.orderNumber}</span> },
    { key:"customerName",header:"Customer" },
    { key:"orderDate",   header:"Date" },
    { key:"total",       header:"Total", align:"right", render:(r) => `$${Number(r.total).toLocaleString()}` },
    { key:"status",      header:"Status",  render:(r) => <StatusBadge value={statusLabel(r.status)} /> },
    { key:"paymentStatus",header:"Payment", render:(r) => <StatusBadge value={payLabel(r.paymentStatus)} /> },
  ];

  const customerCols = [
    { key:"customerCode",  header:"ID" },
    { key:"name",          header:"Account" },
    { key:"contactPerson", header:"Primary Contact" },
    { key:"country",       header:"Country" },
    { key:"lifetimeValue", header:"Lifetime Value", align:"right", render:(r) => `$${Number(r.lifetimeValue).toLocaleString()}` },
    { key:"status",        header:"Status", render:(r) => <StatusBadge value={r.status === "OVERDUE" ? "Overdue" : "Active"} /> },
  ];

  const mtdSales  = orders.reduce((s, o) => s + Number(o.total), 0);
  const openCount = orders.filter((o) => ["PROCESSING","PICKING","QUOTED"].includes(o.status)).length;

  const formFields = (form, setForm) => (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Customer</Label>
        <Select value={form.customerId} onValueChange={(v) => setForm((f) => ({ ...f, customerId: v }))}>
          <SelectTrigger><SelectValue placeholder="Select customer…" /></SelectTrigger>
          <SelectContent>
            {customers.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Date</Label>
          <Input type="date" value={form.orderDate} onChange={(e) => setForm((f) => ({ ...f, orderDate: e.target.value }))} required />
        </div>
        <div className="space-y-1.5">
          <Label>Total ($)</Label>
          <Input type="number" min="0" step="0.01" placeholder="0.00" value={form.total}
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="MTD Sales"       value={Math.round(mtdSales) || 361000} change={9.2}  format="currency" icon={<DollarSign className="h-4 w-4" />} />
          <KpiCard label="Open Orders"     value={openCount || 184}               change={5.1}  icon={<ShoppingBag className="h-4 w-4" />} />
          <KpiCard label="Invoices Out"    value={92}                             change={-2.0} icon={<Receipt className="h-4 w-4" />} />
          <KpiCard label="Avg Order Value" value={orders.length ? Math.round(mtdSales / orders.length) : 1962} change={3.8} format="currency" icon={<DollarSign className="h-4 w-4" />} />
        </div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sales Trend</CardTitle>
            <CardDescription>Net booked revenue per month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueSeries} margin={{ left:-10, right:8 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize:11 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize:11 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background:"var(--popover)", border:"1px solid var(--border)", borderRadius:6, fontSize:12 }} />
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
            {loadingOrders ? <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p> : <DataTable columns={orderCols} rows={orders} />}
          </TabsContent>
          <TabsContent value="customers" className="mt-3"><DataTable columns={customerCols} rows={customers} /></TabsContent>
          <TabsContent value="quotes"    className="mt-3"><Card><CardContent className="p-6 text-sm text-muted-foreground">Outstanding quotations.</CardContent></Card></TabsContent>
          <TabsContent value="invoices"  className="mt-3"><Card><CardContent className="p-6 text-sm text-muted-foreground">Issued invoices with payment status.</CardContent></Card></TabsContent>
        </Tabs>
      </PageShell>

      <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Sales Order</DialogTitle></DialogHeader>
          {orderSuccess ? (
            <div className="flex flex-col items-center gap-2 py-6"><CheckCircle2 className="h-10 w-10 text-success" /><p className="text-sm font-medium">Order created</p></div>
          ) : (
            <form onSubmit={handleOrder}>
              {formFields(orderForm, setOrderForm)}
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setOrderOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={!orderForm.customerId || !orderForm.orderDate || !orderForm.total || createOrder.isPending}>
                  {createOrder.isPending ? "Saving…" : "Create Order"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Quotation</DialogTitle></DialogHeader>
          {quoteSuccess ? (
            <div className="flex flex-col items-center gap-2 py-6"><CheckCircle2 className="h-10 w-10 text-success" /><p className="text-sm font-medium">Quote created</p></div>
          ) : (
            <form onSubmit={handleQuote}>
              {formFields(quoteForm, setQuoteForm)}
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setQuoteOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={!quoteForm.customerId || !quoteForm.orderDate || !quoteForm.total || createOrder.isPending}>
                  {createOrder.isPending ? "Saving…" : "Create Quote"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
