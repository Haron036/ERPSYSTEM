import { useState } from "react";
import { Plus, FolderKanban, CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/status-badge";
import { KpiCard } from "@/components/kpi-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { projects } from "@/lib/mock-data";

const LEADS = ["Sarah Chen", "Marcus Wei", "Priya Nair", "Daniel Ortiz", "Hana Suzuki", "Liam O'Brien", "Aisha Khan"];

export default function ProjectsPage() {
  const [projOpen, setProjOpen]     = useState(false);
  const [projSuccess, setProjSuccess] = useState(false);
  const [projForm, setProjForm]     = useState({ name: "", lead: "", deadline: "", status: "On Track" });

  function submitProj(e) {
    e.preventDefault();
    setProjSuccess(true);
    setTimeout(() => { setProjSuccess(false); setProjOpen(false); setProjForm({ name: "", lead: "", deadline: "", status: "On Track" }); }, 1500);
  }

  return (
    <>
      <PageShell
        title="Project Management"
        breadcrumb="Finance & Insights"
        actions={
          <Button size="sm" onClick={() => setProjOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />New Project
          </Button>
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

      <Dialog open={projOpen} onOpenChange={setProjOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Project</DialogTitle></DialogHeader>
          {projSuccess ? (
            <div className="flex flex-col items-center gap-2 py-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
              <p className="text-sm font-medium">Project created successfully</p>
            </div>
          ) : (
            <form onSubmit={submitProj} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Project Name</Label>
                <Input placeholder="e.g. Line 4 Upgrade" value={projForm.name}
                  onChange={(e) => setProjForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Project Lead</Label>
                  <Select value={projForm.lead} onValueChange={(v) => setProjForm((f) => ({ ...f, lead: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      {LEADS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Deadline</Label>
                  <Input type="date" value={projForm.deadline}
                    onChange={(e) => setProjForm((f) => ({ ...f, deadline: e.target.value }))} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Initial Status</Label>
                <Select value={projForm.status} onValueChange={(v) => setProjForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="On Track">On Track</SelectItem>
                    <SelectItem value="At Risk">At Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setProjOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={!projForm.name || !projForm.lead || !projForm.deadline}>
                  Create Project
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}