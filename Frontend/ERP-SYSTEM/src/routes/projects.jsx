import { Plus, FolderKanban } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/status-badge";
import { KpiCard } from "@/components/kpi-card";
import { projects } from "@/lib/mock-data";

export default function ProjectsPage() {
  return (
    <PageShell
      title="Project Management"
      breadcrumb="Finance & Insights"
      actions={
        <Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" />New Project</Button>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Active Projects" value={18} change={5.0}  icon={<FolderKanban className="h-4 w-4" />} />
        <KpiCard label="On Track"        value={14} change={2.1}  icon={<FolderKanban className="h-4 w-4" />} />
        <KpiCard label="At Risk"         value={3}  change={50.0} icon={<FolderKanban className="h-4 w-4" />} />
        <KpiCard label="Avg Progress"    value={62} change={3.4}  icon={<FolderKanban className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {projects.map((p) => (
          <Card key={p.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-semibold">{p.name}</CardTitle>
                  <CardDescription className="text-xs">
                    <span className="font-mono">{p.id}</span> · Lead: {p.lead} · Due {p.deadline}
                  </CardDescription>
                </div>
                <StatusBadge value={p.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium tabular-nums">{p.progress}%</span>
              </div>
              <Progress value={p.progress} className="mt-1.5 h-2" />
              <div className="mt-3 flex gap-2 text-[11px]">
                <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">12 tasks</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">5 milestones</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">7 members</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}