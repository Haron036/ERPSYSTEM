import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const map = {
  // generic
  Active: "bg-success/15 text-success border-success/30",
  "On Leave": "bg-warning/15 text-warning-foreground border-warning/40",
  Overdue: "bg-destructive/15 text-destructive border-destructive/30",
  // orders
  Fulfilled: "bg-success/15 text-success border-success/30",
  Processing: "bg-info/15 text-info border-info/30",
  Picking: "bg-info/15 text-info border-info/30",
  Quoted: "bg-muted text-muted-foreground border-border",
  Paid: "bg-success/15 text-success border-success/30",
  Pending: "bg-warning/15 text-warning-foreground border-warning/40",
  Partial: "bg-warning/15 text-warning-foreground border-warning/40",
  // PO
  Approved: "bg-success/15 text-success border-success/30",
  "Pending Approval": "bg-warning/15 text-warning-foreground border-warning/40",
  Received: "bg-success/15 text-success border-success/30",
  "In Transit": "bg-info/15 text-info border-info/30",
  // projects
  "On Track": "bg-success/15 text-success border-success/30",
  "At Risk": "bg-warning/15 text-warning-foreground border-warning/40",
  // tickets
  Open: "bg-info/15 text-info border-info/30",
  "In Progress": "bg-warning/15 text-warning-foreground border-warning/40",
  Resolved: "bg-success/15 text-success border-success/30",
};

export function StatusBadge({ value }) {
  const cls = map[value] ?? "bg-muted text-muted-foreground border-border";
  return (
    <Badge variant="outline" className={cn("font-medium", cls)}>
      {value}
    </Badge>
  );
}