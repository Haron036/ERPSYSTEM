import { useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, Wallet, CheckCircle2, AlertTriangle } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { KpiCard } from "@/components/kpi-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLedger, useCreateLedgerEntry, useKpis } from "@/hooks/useApi";
import { revenueSeries } from "@/lib/mock-data";

export default function AccountingPage() {
  const { data: entries = [], isLoading } = useLedger();
  const { data: kpiData }                = useKpis();
  const createEntry = useCreateLedgerEntry();

  const [journalOpen,   setJournalOpen]   = useState(false);
  const [periodOpen,    setPeriodOpen]    = useState(false);
  const [journalSuccess, setJournalSuccess] = useState(false);
  const [periodSuccess,  setPeriodSuccess]  = useState(false);
  const [journalForm, setJournalForm] = useState({
    account:"", type:"", amount:"", ref:"", memo:"",
  });

  async function submitJournal(e) {
    e.preventDefault();
    try {
      await createEntry.mutateAsync({
        entryDate:  new Date().toISOString().slice(0, 10),
        account:    journalForm.account,
        debit:      journalForm.type === "debit"  ? parseFloat(journalForm.amount) : 0,
        credit:     journalForm.type === "credit" ? parseFloat(journalForm.amount) : 0,
        reference:  journalForm.ref,
        memo:       journalForm.memo,
        entryType:  "JOURNAL",
      });
      setJournalSuccess(true);
      setTimeout(() => {
        setJournalSuccess(false);
        setJournalOpen(false);
        setJournalForm({ account:"", type:"", amount:"", ref:"", memo:"" });
      }, 1500);
    } catch (err) { alert(err.message); }
  }

  function confirmPeriodClose() {
    setPeriodSuccess(true);
    setTimeout(() => { setPeriodSuccess(false); setPeriodOpen(false); }, 1800);
  }

  // Derive KPIs from live data or fall back to static values
  const ytdRevenue  = kpiData?.ytdRevenue  ?? 2_487_320;
  const netProfit   = Number(ytdRevenue) * 0.324;  // ~32% margin approximation
  const expenses    = Number(ytdRevenue) - netProfit;

  const cols = [
    { key:"entryDate", header:"Date" },
    { key:"reference", header:"Ref",    render:(r) => <span className="font-mono text-xs">{r.reference}</span> },
    { key:"account",   header:"Account" },
    { key:"debit",     header:"Debit",  align:"right", render:(r) => Number(r.debit)  ? `$${Number(r.debit).toLocaleString()}`  : "—" },
    { key:"credit",    header:"Credit", align:"right", render:(r) => Number(r.credit) ? `$${Number(r.credit).toLocaleString()}` : "—" },
  ];

  return (
    <>
      <PageShell
        title="Accounting & Finance"
        breadcrumb="Finance & Insights"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setPeriodOpen(true)}>Close Period</Button>
            <Button size="sm" onClick={() => setJournalOpen(true)}>New Journal</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Revenue (YTD)"  value={Number(ytdRevenue)}  change={12.4} format="currency" icon={<TrendingUp className="h-4 w-4" />} />
          <KpiCard label="Expenses (YTD)" value={Math.round(expenses)} change={7.1}  format="currency" icon={<TrendingDown className="h-4 w-4" />} />
          <KpiCard label="Net Profit"     value={Math.round(netProfit)} change={18.9} format="currency" icon={<DollarSign className="h-4 w-4" />} />
          <KpiCard label="Cash on Hand"   value={1_142_800}            change={2.4}  format="currency" icon={<Wallet className="h-4 w-4" />} />
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Profit Trend</CardTitle>
            <CardDescription>Monthly net profit, fiscal 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueSeries} margin={{ left:-10, right:8 }}>
                  <defs>
                    <linearGradient id="profit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize:11 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize:11 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background:"var(--popover)", border:"1px solid var(--border)", borderRadius:6, fontSize:12 }} />
                  <Area type="monotone" dataKey="profit" stroke="var(--chart-3)" fill="url(#profit)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="ledger">
          <TabsList>
            <TabsTrigger value="ledger">General Ledger</TabsTrigger>
            <TabsTrigger value="pnl">P&amp;L</TabsTrigger>
            <TabsTrigger value="bs">Balance Sheet</TabsTrigger>
            <TabsTrigger value="exp">Expenses</TabsTrigger>
          </TabsList>
          <TabsContent value="ledger" className="mt-3">
            {isLoading
              ? <p className="py-8 text-center text-sm text-muted-foreground">Loading ledger…</p>
              : <DataTable columns={cols} rows={entries} />}
          </TabsContent>
          <TabsContent value="pnl" className="mt-3"><Card><CardContent className="p-6 text-sm text-muted-foreground">P&amp;L statement with comparative periods.</CardContent></Card></TabsContent>
          <TabsContent value="bs"  className="mt-3"><Card><CardContent className="p-6 text-sm text-muted-foreground">Assets, liabilities and equity snapshot.</CardContent></Card></TabsContent>
          <TabsContent value="exp" className="mt-3"><Card><CardContent className="p-6 text-sm text-muted-foreground">Categorized expenses and budget variance.</CardContent></Card></TabsContent>
        </Tabs>
      </PageShell>

      {/* New Journal Dialog */}
      <Dialog open={journalOpen} onOpenChange={setJournalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Journal Entry</DialogTitle></DialogHeader>
          {journalSuccess ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <p className="text-sm font-medium">Journal entry posted</p>
            </div>
          ) : (
            <form onSubmit={submitJournal} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Account</Label>
                <Select value={journalForm.account} onValueChange={(v) => setJournalForm((f) => ({ ...f, account: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select account…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1000 · Cash">1000 · Cash</SelectItem>
                    <SelectItem value="1200 · Inventory">1200 · Inventory</SelectItem>
                    <SelectItem value="2100 · Payroll Payable">2100 · Payroll Payable</SelectItem>
                    <SelectItem value="4000 · Sales Revenue">4000 · Sales Revenue</SelectItem>
                    <SelectItem value="5000 · COGS">5000 · COGS</SelectItem>
                    <SelectItem value="6100 · Payroll Expense">6100 · Payroll Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Entry Type</Label>
                  <Select value={journalForm.type} onValueChange={(v) => setJournalForm((f) => ({ ...f, type: v }))}>
                    <SelectTrigger><SelectValue placeholder="Debit / Credit" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debit">Debit</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Amount ($)</Label>
                  <Input type="number" min="0" step="0.01" placeholder="0.00"
                    value={journalForm.amount}
                    onChange={(e) => setJournalForm((f) => ({ ...f, amount: e.target.value }))} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Reference</Label>
                <Input placeholder="e.g. JE-7722" value={journalForm.ref}
                  onChange={(e) => setJournalForm((f) => ({ ...f, ref: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Memo</Label>
                <Input placeholder="Brief description…" value={journalForm.memo}
                  onChange={(e) => setJournalForm((f) => ({ ...f, memo: e.target.value }))} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setJournalOpen(false)}>Cancel</Button>
                <Button type="submit"
                  disabled={!journalForm.account || !journalForm.type || !journalForm.amount || createEntry.isPending}>
                  {createEntry.isPending ? "Posting…" : "Post Entry"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Close Period Confirmation */}
      <Dialog open={periodOpen} onOpenChange={setPeriodOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Close Accounting Period</DialogTitle></DialogHeader>
          {periodSuccess ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <p className="text-sm font-medium">Period closed successfully</p>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3 rounded-md border border-warning/30 bg-warning/10 p-3">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  This will lock all transactions for the current period. This action cannot be undone without administrator access.
                </p>
              </div>
              <DialogFooter className="mt-2">
                <Button variant="outline" onClick={() => setPeriodOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={confirmPeriodClose}>Confirm Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
