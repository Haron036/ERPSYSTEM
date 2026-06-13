import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  CheckCircle, XCircle, Clock, ShoppingCart,
  Truck, BookOpen, CalendarDays, RefreshCw,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useApprovalsPending } from "@/hooks/useApi";

const TABS = [
  { key: "ALL",            label: "All",            icon: Clock        },
  { key: "PURCHASE_ORDER", label: "Purchase Orders", icon: Truck        },
  { key: "SALES_ORDER",    label: "Sales Orders",    icon: ShoppingCart },
  { key: "LEDGER_ENTRY",   label: "Journal Entries", icon: BookOpen     },
  { key: "LEAVE_REQUEST",  label: "Leave Requests",  icon: CalendarDays },
];

const TYPE_LABELS = {
  PURCHASE_ORDER: "PO",
  SALES_ORDER:    "SO",
  LEDGER_ENTRY:   "Journal",
  LEAVE_REQUEST:  "Leave",
};

const TYPE_COLORS = {
  PURCHASE_ORDER: "bg-blue-100 text-blue-700",
  SALES_ORDER:    "bg-violet-100 text-violet-700",
  LEDGER_ENTRY:   "bg-amber-100 text-amber-700",
  LEAVE_REQUEST:  "bg-emerald-100 text-emerald-700",
};

export default function ApprovalsPage() {
  const qc = useQueryClient();
  const [tab, setTab]           = useState("ALL");
  const [comment, setComment]   = useState("");
  const [decision, setDecision] = useState(null);

  // Use the shared hook from useApi — single source of truth
  const { data: items = [], isLoading, isError, refetch } = useApprovalsPending();

  const mutation = useMutation({
    mutationFn: ({ entityType, id, action, comment }) =>
      api.post(`/approvals/${entityType}/${id}/${action}`, { comment }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["approvals-pending"] });
      qc.invalidateQueries({ queryKey: ["kpis"] });
      toast.success(
        vars.action === "approve" ? "Approved successfully" : "Rejected",
        { description: `${vars.ref} has been ${vars.action}d.` }
      );
      setDecision(null);
      setComment("");
    },
    onError: (err) => {
      console.error("Approval action failed:", err);
      toast.error("Action failed", {
        description: "You may not have permission or the item was already actioned.",
      });
    },
  });

  function getFiltered(key) {
    if (!Array.isArray(items)) return [];
    return key === "ALL" ? items : items.filter(i => i.entityType === key);
  }

  function openDialog(item, action) {
    setDecision({ item, action });
    setComment("");
  }

  function confirmDecision() {
    if (!decision) return;
    mutation.mutate({
      entityType: decision.item.entityType,
      id:         decision.item.id,
      action:     decision.action,
      comment,
      ref:        decision.item.ref,
    });
  }

  return (
    <PageShell
      title="Approvals"
      breadcrumb="Workflow & Compliance"
      actions={
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {items.length} item{items.length !== 1 ? "s" : ""} awaiting action
          </span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>
      }
    >
      {/* Error state */}
      {isError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3
                        text-sm text-destructive mb-4">
          Failed to load approvals. Check your connection and try refreshing.
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {TABS.map(({ key, label, icon: Icon }) => {
            const count = getFiltered(key).length;
            return (
              <TabsTrigger key={key} value={key} className="gap-1.5">
                <Icon className="h-3.5 w-3.5" />
                {label}
                {count > 0 && (
                  <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5
                                   text-[10px] font-semibold text-muted-foreground">
                    {count}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {TABS.map(({ key }) => {
          const rows = getFiltered(key);
          return (
            <TabsContent key={key} value={key} className="mt-4">
              {isLoading ? (
                <div className="py-16 text-center text-muted-foreground text-sm">
                  Loading…
                </div>
              ) : rows.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground text-sm">
                  No pending approvals
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Submitted By</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((item, idx) => (
                        <TableRow key={`${item.entityType}-${item.ref}-${idx}`}>
                          <TableCell>
                            <span className={`inline-flex items-center rounded-md px-2 py-0.5
                                             text-xs font-medium ${TYPE_COLORS[item.entityType]}`}>
                              {TYPE_LABELS[item.entityType]}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-sm font-medium">
                            {item.ref}
                          </TableCell>
                          <TableCell>{item.submittedBy}</TableCell>
                          <TableCell className="max-w-xs truncate text-muted-foreground text-sm">
                            {item.description}
                          </TableCell>
                          <TableCell>
                            {item.amount != null
                              ? `KES ${Number(item.amount).toLocaleString()}`
                              : "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.date
                              ? format(new Date(item.date), "dd MMM yyyy")
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive border-destructive/40
                                           hover:bg-destructive/10"
                                onClick={() => openDialog(item, "reject")}
                                disabled={mutation.isPending}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => openDialog(item, "approve")}
                                disabled={mutation.isPending}
                              >
                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                Approve
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Confirm Dialog */}
      <Dialog open={!!decision} onOpenChange={() => setDecision(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${
              decision?.action === "approve"
                ? "text-emerald-600" : "text-destructive"
            }`}>
              {decision?.action === "approve"
                ? <CheckCircle className="h-4 w-4" />
                : <XCircle    className="h-4 w-4" />}
              {decision?.action === "approve" ? "Approve" : "Reject"}{" "}
              {decision?.item?.ref}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              {decision?.item?.description}
            </p>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Comment{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add a note for the record…"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDecision(null)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDecision}
              disabled={mutation.isPending}
              className={decision?.action === "approve"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-destructive hover:bg-destructive/90 text-white"}
            >
              {mutation.isPending
                ? "Processing…"
                : decision?.action === "approve"
                  ? "Confirm Approve"
                  : "Confirm Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}