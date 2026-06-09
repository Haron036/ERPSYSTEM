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
import { useProjects, useCreateProject, useUpdateProject } from "@/hooks/useApi";

const statusLabel = (s) => ({
  ON_TRACK: "On Track",
  AT_RISK:  "At Risk",
  DELAYED:  "Delayed",
  COMPLETED:"Completed",
}[s] ?? s);

const LEADS_LIST = [
  "Sarah Chen","Marcus Wei","Priya Nair","Daniel Ortiz",
  "Hana Suzuki","Liam O'Brien","Aisha Khan","Tomás García",
];

const EMPTY_PROJ = { name:"", leadName:"", deadline:"", status:"ON_TRACK", progressPercent: 0 };

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const [projOpen,    setProjOpen]    = useState(false);
  const [projSuccess, setProjSuccess] = useState(false);
  const [projForm,    setProjForm]    = useState(EMPTY_PROJ);

  // Inline progress editing
  const [editingId,  setEditingId]  = useState(null);
  const [editProgress, setEditProgress] = useState(0);

  async function submitProj(e) {
    e.preventDefault();
    try {
      await createProject.mutateAsync({
        name:            projForm.name,
        leadName:        projForm.leadName,
        deadline:        projForm.deadline,
        status:          projForm.status,
        progressPercent: parseInt(projForm.progressPercent) || 0,
      });
      setProjSuccess(true);
      setTimeout(() => { setProjSuccess(false); setProjOpen(false); setProjForm(EMPTY_PROJ); }, 1500);
    } catch (err) { alert(err.message); }
  }

  async function saveProgress(project) {
    try {
      await updateProject.mutateAsync({
        id:              project.id,
        name:            project.name,
        leadName:        project.leadName,
        deadline:        project.deadline,
        status:          project.status,
        progressPercent: editProgress,
      });
      setEditingId(null);
    } catch (err) { alert(err.message); }
  }

  const onTrack   = projects.filter((p) => p.status === "ON_TRACK").length;
  const atRisk    = projects.filter((p) => p.status === "AT_RISK").length;
  const avgProgress = projects.length
    ? Math.round(projects.reduce((s, p) => s + (p.progressPercent ?? 0), 0) / projects.length)
    : 62;

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
          <KpiCard label="Active Projects" value={projects.length || 18} change={5.0}  icon={<FolderKanban className="h-4 w-4" />} />
          <KpiCard label="On Track"        value={onTrack || 14}         change={2.1}  icon={<FolderKanban className="h-4 w-4" />} />
          <KpiCard label="At Risk"         value={atRisk  || 3}          change={50.0} icon={<FolderKanban className="h-4 w-4" />} />
          <KpiCard label="Avg Progress"    value={avgProgress}           change={3.4}  icon={<FolderKanban className="h-4 w-4" />} />
        </div>

        {isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading projects…</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {projects.map((p) => (
              <Card key={p.id}>
                <div className="flex items-start justify-between gap-2 p-6 pb-2">
                  <div>
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-mono">{p.projectCode}</span> · Lead: {p.leadName} · Due {p.deadline}
                    </p>
                  </div>
                  <StatusBadge value={statusLabel(p.status)} />
                </div>
                <CardContent>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    {editingId === p.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number" min="0" max="100"
                          className="h-6 w-16 text-xs"
                          value={editProgress}
                          onChange={(e) => setEditProgress(Number(e.target.value))}
                        />
                        <Button size="sm" className="h-6 text-xs px-2" onClick={() => saveProgress(p)}
                          disabled={updateProject.isPending}>Save</Button>
                        <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => setEditingId(null)}>✕</Button>
                      </div>
                    ) : (
                      <span
                        className="font-medium tabular-nums cursor-pointer hover:text-primary"
                        title="Click to edit progress"
                        onClick={() => { setEditingId(p.id); setEditProgress(p.progressPercent ?? 0); }}
                      >
                        {p.progressPercent ?? 0}%
                      </span>
                    )}
                  </div>
                  <Progress value={p.progressPercent ?? 0} className="mt-1.5 h-2" />
                  <div className="mt-3 flex gap-2 text-[11px]">
                    <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">12 tasks</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">5 milestones</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">7 members</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </PageShell>

      {/* New Project Dialog */}
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
                  <Select value={projForm.leadName} onValueChange={(v) => setProjForm((f) => ({ ...f, leadName: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      {LEADS_LIST.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Deadline</Label>
                  <Input type="date" value={projForm.deadline}
                    onChange={(e) => setProjForm((f) => ({ ...f, deadline: e.target.value }))} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Initial Status</Label>
                  <Select value={projForm.status} onValueChange={(v) => setProjForm((f) => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ON_TRACK">On Track</SelectItem>
                      <SelectItem value="AT_RISK">At Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Initial Progress (%)</Label>
                  <Input type="number" min="0" max="100" placeholder="0" value={projForm.progressPercent}
                    onChange={(e) => setProjForm((f) => ({ ...f, progressPercent: e.target.value }))} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setProjOpen(false)}>Cancel</Button>
                <Button type="submit"
                  disabled={!projForm.name || !projForm.leadName || !projForm.deadline || createProject.isPending}>
                  {createProject.isPending ? "Saving…" : "Create Project"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
