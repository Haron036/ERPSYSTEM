import { createFileRoute } from "@tanstack/react-router";
import { Plus, HeartHandshake, Target, MessageSquare, TrendingUp } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { KpiCard } from "@/components/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { leads, tickets, customers } from "@/lib/mock-data";

export const Route = createFileRoute("/crm")({
  head: () => ({ meta: [{ title: "CRM · NorthForge ERP" }] }),
  component: CrmPage,
});

function CrmPage() {
  const leadCols = [
    { key: "id", header: "ID" },
    { key: "name", header: "Lead" },
    { key: "source", header: "Source" },
    { key: "stage", header: "Stage", render: (r) => <Badge variant="outline">{r.stage}</Badge> },
    { key: "value", header: "Est. Value", align: "right", render: (r) => `$${r.value.toLocaleString()}` },
    { key: "owner", header: "Owner" },
  ];

  const ticketCols = [
    { key: "id", header: "Ticket" },
    { key: "customer", header: "Customer" },
    { key: "subject", header: "Subject" },
    {
      key: "priority",
      header: "Priority",
      render: (r) => (
        <Badge
          variant="outline"
          className={
            r.priority === "High"
              ? "border-destructive/40 text-destructive"
              : r.priority === "Medium"
                ? "border-warning/40 text-warning-foreground"
                : ""
          }
        >
          {r.priority}
        </Badge>
      ),
    },
    { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
    { key: "updated", header: "Updated" },
  ];

  return (
    <PageShell
      title="Customer Relationship Management"
      breadcrumb="Finance & Insights"
      actions={
        <>
          <Button variant="outline" size="sm">
            <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
            New Ticket
          </Button>
          <Button size="sm">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Lead
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Active Leads" value={62} change={11.0} icon={<Target className="h-4 w-4" />} />
        <KpiCard label="Pipeline Value" value={1842000} change={8.6} format="currency" icon={<TrendingUp className="h-4 w-4" />} />
        <KpiCard label="Open Tickets" value={23} change={-12.3} icon={<MessageSquare className="h-4 w-4" />} />
        <KpiCard label="Customer NPS" value={62} change={4.1} icon={<HeartHandshake className="h-4 w-4" />} />
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
            <CardContent>
              <DataTable columns={leadCols} rows={leads} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="accounts" className="mt-3">
          <DataTable
            columns={[
              { key: "id", header: "ID" },
              { key: "name", header: "Account" },
              { key: "contact", header: "Contact" },
              { key: "country", header: "Country" },
              { key: "lifetime", header: "LTV", align: "right", render: (r) => `$${r.lifetime.toLocaleString()}` },
              { key: "status", header: "Status", render: (r) => <StatusBadge value={r.status} /> },
            ]}
            rows={customers}
          />
        </TabsContent>
        <TabsContent value="tickets" className="mt-3">
          <DataTable columns={ticketCols} rows={tickets} />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
export default CrmPage