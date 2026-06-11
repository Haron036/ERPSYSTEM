import { useState } from "react";
import {
  Plus,
  HeartHandshake,
  Target,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { KpiCard } from "@/components/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useLeads,
  useCreateLead,
  useTickets,
  useCreateTicket,
  useCustomers,
} from "@/hooks/useApi";

const stageLabel = (s) =>
  ({
    DISCOVERY: "Discovery",
    QUALIFIED: "Qualified",
    PROPOSAL: "Proposal",
    NEGOTIATION: "Negotiation",
    CLOSED_WON: "Closed Won",
    CLOSED_LOST: "Closed Lost",
  })[s] ?? s;
const sourceLabel = (s) =>
  ({
    INBOUND: "Inbound",
    OUTBOUND: "Outbound",
    REFERRAL: "Referral",
    TRADE_SHOW: "Trade Show",
    WEBINAR: "Webinar",
  })[s] ?? s;
const ticketStatusLabel = (s) =>
  ({
    OPEN: "Open",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
    CLOSED: "Closed",
  })[s] ?? s;
const priorityLabel = (s) =>
  ({ LOW: "Low", MEDIUM: "Medium", HIGH: "High" })[s] ?? s;

const EMPTY_LEAD = {
  companyName: "",
  source: "",
  stage: "",
  estimatedValue: "",
  ownerName: "",
};
const EMPTY_TICKET = { customerId: "", subject: "", priority: "" };

export default function CrmPage() {
  const {
    data: leads = [],
    isLoading: loadingLeads,
    isError: leadsError,
  } = useLeads();
  const {
    data: tickets = [],
    isLoading: loadingTickets,
    isError: ticketsError,
  } = useTickets();
  const { data: customers = [] } = useCustomers();
  const createLead = useCreateLead();
  const createTicket = useCreateTicket();

  const [leadOpen, setLeadOpen] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [leadForm, setLeadForm] = useState(EMPTY_LEAD);
  const [ticketForm, setTicketForm] = useState(EMPTY_TICKET);

  async function submitLead(e) {
    e.preventDefault();
    try {
      await createLead.mutateAsync({
        companyName: leadForm.companyName,
        source: leadForm.source,
        stage: leadForm.stage,
        estimatedValue: parseFloat(leadForm.estimatedValue),
        ownerName: leadForm.ownerName,
      });
      setLeadSuccess(true);
      setTimeout(() => {
        setLeadSuccess(false);
        setLeadOpen(false);
        setLeadForm(EMPTY_LEAD);
      }, 1500);
    } catch (err) {
      alert(err.message);
    }
  }

  async function submitTicket(e) {
    e.preventDefault();
    try {
      await createTicket.mutateAsync({
        customerId: parseInt(ticketForm.customerId),
        subject: ticketForm.subject,
        priority: ticketForm.priority,
      });
      setTicketSuccess(true);
      setTimeout(() => {
        setTicketSuccess(false);
        setTicketOpen(false);
        setTicketForm(EMPTY_TICKET);
      }, 1500);
    } catch (err) {
      alert(err.message);
    }
  }

  // KPI totals
  const pipelineValue = leads.reduce(
    (s, l) => s + Number(l.estimatedValue ?? 0),
    0,
  );
  const openTickets = tickets.filter((t) =>
    ["OPEN", "IN_PROGRESS"].includes(t.status),
  ).length;

  const leadCols = [
    { key: "leadCode", header: "ID" },
    { key: "companyName", header: "Lead" },
    { key: "source", header: "Source", render: (r) => sourceLabel(r.source) },
    {
      key: "stage",
      header: "Stage",
      render: (r) => <Badge variant="outline">{stageLabel(r.stage)}</Badge>,
    },
    {
      key: "estimatedValue",
      header: "Est. Value",
      align: "right",
      render: (r) => `$${Number(r.estimatedValue).toLocaleString()}`,
    },
    { key: "ownerName", header: "Owner" },
  ];

  const ticketCols = [
    { key: "ticketNumber", header: "Ticket" },
    { key: "customerName", header: "Customer" },
    { key: "subject", header: "Subject" },
    {
      key: "priority",
      header: "Priority",
      render: (r) => (
        <Badge
          variant="outline"
          className={
            r.priority === "HIGH"
              ? "border-destructive/40 text-destructive"
              : r.priority === "MEDIUM"
                ? "border-warning/40 text-warning-foreground"
                : ""
          }
        >
          {priorityLabel(r.priority)}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge value={ticketStatusLabel(r.status)} />,
    },
    {
      key: "updatedAt",
      header: "Updated",
      render: (r) =>
        r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : "—",
    },
  ];

  const customerCols = [
    { key: "customerCode", header: "ID" },
    { key: "name", header: "Account" },
    { key: "contactPerson", header: "Contact" },
    { key: "country", header: "Country" },
    {
      key: "lifetimeValue",
      header: "LTV",
      align: "right",
      render: (r) => `$${Number(r.lifetimeValue).toLocaleString()}`,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <StatusBadge value={r.status === "OVERDUE" ? "Overdue" : "Active"} />
      ),
    },
  ];

  return (
    <>
      <PageShell
        title="Customer Relationship Management"
        breadcrumb="Finance & Insights"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTicketOpen(true)}
            >
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
              New Ticket
            </Button>
            <Button size="sm" onClick={() => setLeadOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Lead
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Active Leads" value={leads.length} />
          <KpiCard label="Pipeline Value" value={Math.round(pipelineValue)} />
          <KpiCard label="Open Tickets" value={openTickets} />
          <KpiCard
            label="Customer NPS"
            value={62}
            change={4.1}
            icon={<HeartHandshake className="h-4 w-4" />}
          />
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
                <CardDescription>
                  Open opportunities across stages
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingLeads ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Loading leads…
                  </p>
                ) : (
                  <DataTable columns={leadCols} rows={leads} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="mt-3">
            <DataTable columns={customerCols} rows={customers} />
          </TabsContent>

          <TabsContent value="tickets" className="mt-3">
            {loadingTickets ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Loading tickets…
              </p>
            ) : (
              <DataTable columns={ticketCols} rows={tickets} />
            )}
          </TabsContent>
        </Tabs>
      </PageShell>

      {/* New Lead Dialog */}
      <Dialog open={leadOpen} onOpenChange={setLeadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Lead</DialogTitle>
          </DialogHeader>
          {leadSuccess ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <p className="text-sm font-medium">Lead added to pipeline</p>
            </div>
          ) : (
            <form onSubmit={submitLead} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Company / Lead Name</Label>
                <Input
                  placeholder="e.g. Pinnacle Robotics"
                  value={leadForm.companyName}
                  onChange={(e) =>
                    setLeadForm((f) => ({ ...f, companyName: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Source</Label>
                  <Select
                    value={leadForm.source}
                    onValueChange={(v) =>
                      setLeadForm((f) => ({ ...f, source: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INBOUND">Inbound</SelectItem>
                      <SelectItem value="OUTBOUND">Outbound</SelectItem>
                      <SelectItem value="REFERRAL">Referral</SelectItem>
                      <SelectItem value="TRADE_SHOW">Trade Show</SelectItem>
                      <SelectItem value="WEBINAR">Webinar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Stage</Label>
                  <Select
                    value={leadForm.stage}
                    onValueChange={(v) =>
                      setLeadForm((f) => ({ ...f, stage: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DISCOVERY">Discovery</SelectItem>
                      <SelectItem value="QUALIFIED">Qualified</SelectItem>
                      <SelectItem value="PROPOSAL">Proposal</SelectItem>
                      <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Est. Value ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={leadForm.estimatedValue}
                    onChange={(e) =>
                      setLeadForm((f) => ({
                        ...f,
                        estimatedValue: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Owner</Label>
                  <Input
                    placeholder="Assigned to…"
                    value={leadForm.ownerName}
                    onChange={(e) =>
                      setLeadForm((f) => ({ ...f, ownerName: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLeadOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !leadForm.companyName ||
                    !leadForm.source ||
                    !leadForm.stage ||
                    !leadForm.estimatedValue ||
                    !leadForm.ownerName ||
                    createLead.isPending
                  }
                >
                  {createLead.isPending ? "Saving…" : "Add Lead"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
{/* New Ticket Dialog */}
<Dialog open={ticketOpen} onOpenChange={setTicketOpen}>
  <DialogContent className="sm:max-w-lg">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        New Support Ticket
      </DialogTitle>
    </DialogHeader>

    {ticketSuccess ? (
      <div className="flex flex-col items-center gap-2 py-8">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <p className="font-medium">Ticket created and assigned</p>
        <p className="text-sm text-muted-foreground">
          The customer will be notified
        </p>
      </div>
    ) : (
      <form onSubmit={submitTicket} className="space-y-5">

        {/* Customer selector + preview */}
        <div className="space-y-1.5">
          <Label>Customer Account</Label>
          <Select
            value={ticketForm.customerId}
            onValueChange={(v) =>
              setTicketForm((f) => ({ ...f, customerId: v }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Search or select a customer…" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  <span className="font-medium">{c.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {c.customerCode}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Customer preview card */}
          {ticketForm.customerId && (() => {
            const c = customers.find((x) => String(x.id) === ticketForm.customerId);
            return c ? (
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
                <span>{c.contactPerson || "—"}</span>
                <span>{c.email || "—"}</span>
                <span>{c.country || "—"}</span>
                <Badge
                  variant="outline"
                  className={c.status === "OVERDUE"
                    ? "border-destructive/40 text-destructive text-[10px]"
                    : "text-[10px]"}
                >
                  {c.status}
                </Badge>
              </div>
            ) : null;
          })()}
        </div>

        {/* Subject with character counter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label>Subject</Label>
            <span className={`text-xs ${ticketForm.subject.length > 100
              ? "text-destructive" : "text-muted-foreground"}`}>
              {ticketForm.subject.length}/120
            </span>
          </div>
          <Input
            placeholder="Briefly describe the issue…"
            maxLength={120}
            value={ticketForm.subject}
            onChange={(e) =>
              setTicketForm((f) => ({ ...f, subject: e.target.value }))
            }
            required
          />
        </div>

        {/* Priority as visual cards */}
        <div className="space-y-1.5">
          <Label>Priority</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                value: "LOW",
                label: "Low",
                desc: "Non-urgent",
                cls: "border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-400 dark:bg-green-950/30",
                activeCls: "ring-2 ring-green-500",
              },
              {
                value: "MEDIUM",
                label: "Medium",
                desc: "Needs attention",
                cls: "border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:bg-amber-950/30",
                activeCls: "ring-2 ring-amber-500",
              },
              {
                value: "HIGH",
                label: "High",
                desc: "Urgent",
                cls: "border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-400 dark:bg-red-950/30",
                activeCls: "ring-2 ring-red-500",
              },
            ].map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() =>
                  setTicketForm((f) => ({ ...f, priority: p.value }))
                }
                className={`rounded-md border px-3 py-2.5 text-left transition-all
                  ${p.cls}
                  ${ticketForm.priority === p.value ? p.activeCls : "opacity-70 hover:opacity-100"}`}
              >
                <p className="text-sm font-semibold">{p.label}</p>
                <p className="text-[11px] opacity-80">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => { setTicketOpen(false); setTicketForm(EMPTY_TICKET); }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              !ticketForm.customerId ||
              !ticketForm.subject ||
              !ticketForm.priority ||
              createTicket.isPending
            }
          >
            {createTicket.isPending ? "Creating…" : "Create Ticket"}
          </Button>
        </DialogFooter>
      </form>
    )}
  </DialogContent>
</Dialog>
    </>
  );
}
