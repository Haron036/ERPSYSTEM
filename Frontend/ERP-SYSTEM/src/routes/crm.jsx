import { useState } from "react";
import { Plus, HeartHandshake, Target, MessageSquare, TrendingUp, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { KpiCard } from "@/components/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { leads, tickets, customers } from "@/lib/mock-data";

export default function CrmPage() {
  const [leadOpen, setLeadOpen]     = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [leadSuccess, setLeadSuccess]     = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [leadForm, setLeadForm]   = useState({ name: "", source: "", stage: "", value: "", owner: "" });
  const [ticketForm, setTicketForm] = useState({ customer: "", subject: "", priority: "" });

  function submitLead(e) {
    e.preventDefault();
    setLeadSuccess(true);
    setTimeout(() => { setLeadSuccess(false); setLeadOpen(false); setLeadForm({ name: "", source: "", stage: "", value: "", owner: "" }); }, 1500);
  }

  function submitTicket(e) {
    e.preventDefault();
    setTicketSuccess(true);
    setTimeout(() => { setTicketSuccess(false); setTicketOpen(false); setTicketForm({ customer: "", subject: "", priority: "" }); }, 1500);
  }

  const leadCols = [
    { key: "id",     header: "ID" },
    { key: "name",   header: "Lead" },
    { key: "source", header: "Source" },
    { key: "stage",  header: "Stage",      render: (r) => <Badge variant="outline">{r.stage}</Badge> },
    { key: "value",  header: "Est. Value", align: "right", render: (r) => `$${r.value.toLocaleString()}` },
    { key: "owner",  header: "Owner" },
  ];

  const ticketCols = [
    { key: "id",       header: "Ticket" },
    { key: "customer", header: "Customer" },
    { key: "subject",  header: "Subject" },
    {
      key: "priority",
      header: "Priority",
      render: (r) => (
        <Badge variant="outline" className={
          r.priority === "High"   ? "border-destructive/40 text-destructive" :
          r.priority === "Medium" ? "border-warning/40 text-warning-foreground" : ""
        }>{r.priority}</Badge>
      ),
    },
    { key: "status",  header: "Status",  render: (r) => <StatusBadge value={r.status} /> },
    { key: "updated", header: "Updated" },
  ];

  return (
    <>
      <PageShell
        title="Customer Relationship Management"
        breadcrumb="Finance & Insights"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setTicketOpen(true)}>
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" />New Ticket
            </Button>
            <Button size="sm" onClick={() => setLeadOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />New Lead
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Active Leads"   value={62}      change={11.0}  icon={<Target className="h-4 w-4" />} />
          <KpiCard label="Pipeline Value" value={1842000} change={8.6}   format="currency" icon={<TrendingUp className="h-4 w-4" />} />
          <KpiCard label="Open Tickets"   value={23}      change={-12.3} icon={<MessageSquare className="h-4 w-4" />} />
          <KpiCard label="Customer NPS"   value={62}      change={4.1}   icon={<HeartHandshake className="h-4 w-4" />} />
        </div>

        <Tabs defaultValue="leads">
          <TabsList>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          </TabsList>
          <TabsContent value="leads" className="mt-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Lead Pipeline</CardTitle>
                <CardDescription>Open opportunities across stages</CardDescription>
              </CardHeader>
              <CardContent><DataTable columns={leadCols} rows={leads} /></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="accounts" className="mt-3">
            <DataTable
              columns={[
                { key: "id",       header: "ID" },
                { key: "name",     header: "Account" },
                { key: "contact",  header: "Contact" },
                { key: "country",  header: "Country" },
                { key: "lifetime", header: "LTV", align: "right", render: (r) => `$${r.lifetime.toLocaleString()}` },
                { key: "status",   header: "Status", render: (r) => <StatusBadge value={r.status} /> },
              ]}
              rows={customers}
            />
          </TabsContent>
          <TabsContent value="tickets" className="mt-3">
            <DataTable columns={ticketCols} rows={tickets} />
          </TabsContent>
        </Tabs>
      </PageShell>

      {/* New Lead Dialog */}
      <Dialog open={leadOpen} onOpenChange={setLeadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Lead</DialogTitle></DialogHeader>
          {leadSuccess ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <p className="text-sm font-medium">Lead added to pipeline</p>
            </div>
          ) : (
            <form onSubmit={submitLead} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Company / Lead Name</Label>
                <Input placeholder="e.g. Pinnacle Robotics" value={leadForm.name}
                  onChange={(e) => setLeadForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Source</Label>
                  <Select value={leadForm.source} onValueChange={(v) => setLeadForm((f) => ({ ...f, source: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inbound">Inbound</SelectItem>
                      <SelectItem value="Outbound">Outbound</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Trade Show">Trade Show</SelectItem>
                      <SelectItem value="Webinar">Webinar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Stage</Label>
                  <Select value={leadForm.stage} onValueChange={(v) => setLeadForm((f) => ({ ...f, stage: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Discovery">Discovery</SelectItem>
                      <SelectItem value="Qualified">Qualified</SelectItem>
                      <SelectItem value="Proposal">Proposal</SelectItem>
                      <SelectItem value="Negotiation">Negotiation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Est. Value ($)</Label>
                  <Input type="number" min="0" placeholder="0" value={leadForm.value}
                    onChange={(e) => setLeadForm((f) => ({ ...f, value: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Owner</Label>
                  <Input placeholder="Assigned to…" value={leadForm.owner}
                    onChange={(e) => setLeadForm((f) => ({ ...f, owner: e.target.value }))} required />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setLeadOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={!leadForm.name || !leadForm.source || !leadForm.stage || !leadForm.value || !leadForm.owner}>
                  Add Lead
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* New Ticket Dialog */}
      <Dialog open={ticketOpen} onOpenChange={setTicketOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Support Ticket</DialogTitle></DialogHeader>
          {ticketSuccess ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <p className="text-sm font-medium">Ticket created and assigned</p>
            </div>
          ) : (
            <form onSubmit={submitTicket} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Customer</Label>
                <Select value={ticketForm.customer} onValueChange={(v) => setTicketForm((f) => ({ ...f, customer: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select customer…" /></SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Input placeholder="Describe the issue…" value={ticketForm.subject}
                  onChange={(e) => setTicketForm((f) => ({ ...f, subject: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={ticketForm.priority} onValueChange={(v) => setTicketForm((f) => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select priority…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setTicketOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={!ticketForm.customer || !ticketForm.subject || !ticketForm.priority}>
                  Create Ticket
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}