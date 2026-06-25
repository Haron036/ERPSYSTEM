import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  change,       
  icon,
  format = "number",
}) {
  // value may arrive as a pre-formatted string (e.g. "$117,800") or a number
  const formatted =
    typeof value === "string"
      ? value
      : format === "currency"
      ? (value ?? 0).toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        })
      : (value ?? 0).toLocaleString("en-US");

  // Only show the change row when a real number is provided
  const hasChange = typeof change === "number" && isFinite(change);
  const positive  = hasChange && change >= 0;

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </div>
            <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
              {formatted}
            </div>

            {hasChange && (
              <div
                className={cn(
                  "mt-1 inline-flex items-center gap-1 text-xs font-medium",
                  positive ? "text-success" : "text-destructive",
                )}
              >
                {positive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(change).toFixed(1)}%{" "}
                <span className="text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>

          {icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}