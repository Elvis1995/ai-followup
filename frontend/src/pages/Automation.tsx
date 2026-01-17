// src/pages/Automation.tsx
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import {
  Plus,
  Workflow,
  Mail,
  Clock,
  Calendar,
  MoreHorizontal,
  ChevronRight,
  Zap,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DbStep = {
  id: string;
  flow_id: string;
  step_order: number;
  type: "wait" | "email";
  delay_minutes: number;
  config: any; // { subject, body }
};

type DbFlow = {
  id: string;
  customer_id: string;
  name: string;
  trigger: string;
  is_active: boolean;
  created_at: string;
  steps: DbStep[];
};

function safeJson(val: any) {
  if (val == null) return {};
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return {};
  }
}

function minutesLabel(n: number) {
  const m = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  if (m === 0) return "0 min";
  if (m === 1) return "1 min";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r === 0 ? `${h} h` : `${h} h ${r} min`;
}

const stepIcons: Record<string, any> = {
  email: Mail,
  wait: Clock,
  booking: Calendar,
};

function StepPill({
  isActive,
  step,
}: {
  isActive: boolean;
  step: DbStep;
}) {
  const Icon = stepIcons[step.type] || Clock;

  const label =
    step.type === "wait"
      ? `Wait ${minutesLabel(Number(step.delay_minutes || 0))}`
      : step.type === "email"
      ? "Email"
      : step.type;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm",
        isActive ? "border-primary/30 bg-primary/5" : "border-border bg-muted/50"
      )}
    >
      <Icon className="w-4 h-4 text-primary" />
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
}

function AutomationCard({
  flow,
  onToggle,
  onEdit,
  onDelete,
}: {
  flow: DbFlow;
  onToggle: (flow: DbFlow) => void;
  onEdit: (flow: DbFlow) => void;
  onDelete: (flow: DbFlow) => void;
}) {
  const isActive = !!flow.is_active;
  const steps = (flow.steps || []).slice().sort((a, b) => (a.step_order ?? 0) - (b.step_order ?? 0));

  return (
    <div
      className={cn(
        "p-6 rounded-xl border bg-card transition-all duration-300",
        isActive ? "border-primary/50 shadow-lg shadow-primary/5" : "border-border hover:border-primary/30"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              isActive ? "bg-gradient-to-br from-primary/20 to-accent/20" : "bg-muted"
            )}
          >
            <Workflow className={cn("w-6 h-6", isActive ? "text-primary" : "text-muted-foreground")} />
          </div>

          <div>
            <h3 className="font-semibold">{flow.name}</h3>
            <p className="text-sm text-muted-foreground">{flow.trigger}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={isActive} onCheckedChange={() => onToggle(flow)} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(flow)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(flow)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Flow steps visualization */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {steps.length === 0 ? (
          <div className="text-sm text-muted-foreground">No steps yet</div>
        ) : (
          steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <StepPill isActive={isActive} step={step} />
              {index < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground mx-1 flex-shrink-0" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Stats (MVP placeholders like Loveable) */}
      <div className="flex items-center gap-6 pt-4 border-t border-border">
        <div>
          <p className="text-sm text-muted-foreground">Leads processed</p>
          <p className="text-xl font-bold">—</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Conversion</p>
          <p className="text-xl font-bold text-success">—</p>
        </div>
      </div>
    </div>
  );
}

export default function AutomationPage() {
  const [flows, setFlows] = useState<DbFlow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // New flow dialog
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newActive, setNewActive] = useState(true);

  // Builder dialog (Loveable-ish layout)
  const [builderOpen, setBuilderOpen] = useState(false);
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);

  const activeFlow = useMemo(
    () => flows.find((f) => f.id === activeFlowId) || null,
    [flows, activeFlowId]
  );

  // Local editable steps in builder
  const [localSteps, setLocalSteps] = useState<DbStep[]>([]);
  const [builderBusy, setBuilderBusy] = useState(false);

  async function loadFlows() {
    setLoading(true);
    setErr(null);
    try {
      const data = await apiFetch("/automation/flows");
      const next = (data?.flows || []).map((f: any) => ({
        ...f,
        steps: (f.steps || []).map((s: any) => ({ ...s, config: safeJson(s.config) })),
      }));
      setFlows(next);
    } catch (e: any) {
      console.error(e);
      setErr(e?.message || "Failed to load flows");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFlows();
  }, []);

  useEffect(() => {
    if (!builderOpen) return;
    if (!activeFlow) return;
    setLocalSteps(
      [...(activeFlow.steps || [])]
        .sort((a, b) => (a.step_order ?? 0) - (b.step_order ?? 0))
        .map((s) => ({ ...s, config: safeJson(s.config) }))
    );
  }, [builderOpen, activeFlow]);

  async function createFlow() {
    const name = newName.trim();
    if (!name) {
      setErr("Flow name is required");
      return;
    }
    setErr(null);

    try {
      await apiFetch("/automation/flows", {
        method: "POST",
        body: JSON.stringify({ name, trigger: "new_lead", is_active: newActive }),
      });
      setNewOpen(false);
      setNewName("");
      setNewActive(true);
      await loadFlows();
    } catch (e: any) {
      console.error(e);
      setErr(e?.message || "Failed to create flow");
    }
  }

  async function toggleFlow(flow: DbFlow) {
    const next = !flow.is_active;
    setErr(null);

    // optimistic
    setFlows((prev) => prev.map((f) => (f.id === flow.id ? { ...f, is_active: next } : f)));

    try {
      await apiFetch(`/automation/flows/${flow.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: next }),
      });
    } catch (e: any) {
      console.error(e);
      setErr(e?.message || "Failed to update flow");
      // rollback
      setFlows((prev) => prev.map((f) => (f.id === flow.id ? { ...f, is_active: !next } : f)));
    }
  }

  async function deleteFlow(flow: DbFlow) {
    const ok = window.confirm(`Delete flow "${flow.name}"? This will remove its steps.`);
    if (!ok) return;

    setErr(null);
    try {
      await apiFetch(`/automation/flows/${flow.id}`, { method: "DELETE" });
      if (activeFlowId === flow.id) {
        setBuilderOpen(false);
        setActiveFlowId(null);
        setLocalSteps([]);
      }
      await loadFlows();
    } catch (e: any) {
      console.error(e);
      setErr(e?.message || "Failed to delete flow");
    }
  }

  function openBuilder(flow: DbFlow) {
    setActiveFlowId(flow.id);
    setBuilderOpen(true);
  }

  async function updateFlowName(flowId: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;

    setErr(null);
    setFlows((prev) => prev.map((f) => (f.id === flowId ? { ...f, name: trimmed } : f)));

    try {
      await apiFetch(`/automation/flows/${flowId}`, {
        method: "PUT",
        body: JSON.stringify({ name: trimmed }),
      });
    } catch (e: any) {
      console.error(e);
      setErr(e?.message || "Failed to update flow name");
      await loadFlows();
    }
  }

  async function addWaitStep(flowId: string) {
    setBuilderBusy(true);
    setErr(null);
    try {
      await apiFetch(`/automation/flows/${flowId}/steps`, {
        method: "POST",
        body: JSON.stringify({ type: "wait", delay_minutes: 10, config: {} }),
      });
      await loadFlows();
    } catch (e: any) {
      console.error(e);
      setErr(e?.message || "Failed to add wait step");
    } finally {
      setBuilderBusy(false);
    }
  }

  async function addEmailStep(flowId: string) {
    setBuilderBusy(true);
    setErr(null);
    try {
      await apiFetch(`/automation/flows/${flowId}/steps`, {
        method: "POST",
        body: JSON.stringify({
          type: "email",
          delay_minutes: 0,
          config: {
            subject: "Thanks {{name}}!",
            body: "Hi {{name}},\n\nThanks for reaching out — we’ll get back to you shortly.\n\n/Team",
          },
        }),
      });
      await loadFlows();
    } catch (e: any) {
      console.error(e);
      setErr(e?.message || "Failed to add email step");
    } finally {
      setBuilderBusy(false);
    }
  }

  async function deleteStep(stepId: string) {
    const ok = window.confirm("Delete this step?");
    if (!ok) return;

    setBuilderBusy(true);
    setErr(null);
    try {
      await apiFetch(`/automation/steps/${stepId}`, { method: "DELETE" });
      await loadFlows();
    } catch (e: any) {
      console.error(e);
      setErr(e?.message || "Failed to delete step");
    } finally {
      setBuilderBusy(false);
    }
  }

  async function persistStep(step: DbStep) {
    setBuilderBusy(true);
    setErr(null);
    try {
      await apiFetch(`/automation/steps/${step.id}`, {
        method: "PUT",
        body: JSON.stringify({
          type: step.type,
          delay_minutes: Number(step.delay_minutes || 0),
          config: step.config || {},
        }),
      });
      await loadFlows();
    } catch (e: any) {
      console.error(e);
      setErr(e?.message || "Failed to update step");
      await loadFlows();
    } finally {
      setBuilderBusy(false);
    }
  }

  async function reorder(flowId: string, nextSteps: DbStep[]) {
    // update local immediately
    setLocalSteps(nextSteps.map((s, idx) => ({ ...s, step_order: idx + 1 })));
    setBuilderBusy(true);
    setErr(null);
    try {
      await apiFetch(`/automation/flows/${flowId}/steps/reorder`, {
        method: "POST",
        body: JSON.stringify({ orderedStepIds: nextSteps.map((s) => s.id) }),
      });
      await loadFlows();
    } catch (e: any) {
      console.error(e);
      setErr(e?.message || "Failed to reorder steps");
      await loadFlows();
    } finally {
      setBuilderBusy(false);
    }
  }

  function moveStep(flowId: string, index: number, dir: "up" | "down") {
    const steps = [...localSteps].sort((a, b) => (a.step_order ?? 0) - (b.step_order ?? 0));
    const targetIndex = dir === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const swapped = [...steps];
    const tmp = swapped[index];
    swapped[index] = swapped[targetIndex];
    swapped[targetIndex] = tmp;

    reorder(flowId, swapped);
  }

  const activeFlowsCount = flows.filter((f) => f.is_active).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automation</h1>
          <p className="text-muted-foreground mt-1">Create and manage automatic follow-up flows</p>
        </div>
        <Button variant="hero" onClick={() => setNewOpen(true)}>
          <Plus className="w-4 h-4" />
          New flow
        </Button>
      </div>

      {err && (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-sm text-destructive">
          {err}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Active flows</span>
          </div>
          <p className="text-3xl font-bold">
            {activeFlowsCount}/{flows.length}
          </p>
        </div>
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-5 h-5 text-accent" />
            <span className="text-sm text-muted-foreground">Messages sent</span>
          </div>
          <p className="text-3xl font-bold">—</p>
        </div>
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-success" />
            <span className="text-sm text-muted-foreground">Meetings booked via AI</span>
          </div>
          <p className="text-3xl font-bold">—</p>
        </div>
      </div>

      {/* Flows grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="p-8 rounded-xl border border-border bg-card flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading flows…
          </div>
        ) : flows.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-border hover:border-primary/50 transition-colors">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Create new flow</h3>
              <p className="text-muted-foreground max-w-md">
                Automate lead follow-ups with email. Choose triggers, timing, and templates.
              </p>
              <div className="mt-4">
                <Button variant="hero" onClick={() => setNewOpen(true)}>
                  <Plus className="w-4 h-4" />
                  New flow
                </Button>
              </div>
            </div>
          </div>
        ) : (
          flows.map((flow) => (
            <AutomationCard
              key={flow.id}
              flow={flow}
              onToggle={toggleFlow}
              onEdit={openBuilder}
              onDelete={deleteFlow}
            />
          ))
        )}
      </div>

      {/* Empty state card (always show like Loveable) */}
      <div
        className="p-8 rounded-xl border border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer group"
        onClick={() => setNewOpen(true)}
        role="button"
        tabIndex={0}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
            <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Create new flow</h3>
          <p className="text-muted-foreground max-w-md">
            Automate lead follow-ups with email. Choose triggers, timing, and templates.
          </p>
        </div>
      </div>

      {/* New Flow Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>New automation flow</DialogTitle>
            <DialogDescription>Create a flow triggered by a new lead.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="flowName">Name</Label>
              <Input
                id="flowName"
                placeholder="e.g. Website follow-up"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Active</div>
                  <div className="text-xs text-muted-foreground">Start running this flow immediately</div>
                </div>
                <Switch checked={newActive} onCheckedChange={setNewActive} />
              </div>

              <div className="mt-3 text-xs text-muted-foreground">
                Trigger is currently fixed to <span className="font-medium">new_lead</span> (MVP).
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
            <Button variant="hero" onClick={createFlow}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flow Builder Dialog */}
      <Dialog
        open={builderOpen}
        onOpenChange={(open) => {
          setBuilderOpen(open);
          if (!open) {
            setActiveFlowId(null);
            setLocalSteps([]);
          }
        }}
      >
        <DialogContent className="sm:max-w-[980px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Flow builder</DialogTitle>
            <DialogDescription>
              {activeFlow ? (
                <span>
                  Edit steps for <span className="font-medium">{activeFlow.name}</span>
                </span>
              ) : (
                "Loading…"
              )}
            </DialogDescription>
          </DialogHeader>

          {!activeFlow ? (
            <div className="p-6 rounded-xl border border-border bg-card flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading…
            </div>
          ) : (
            <div className="space-y-4">
              {/* Flow header - Loveable style */}
              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="w-full">
                    <Label>Flow name</Label>
                    <Input
                      className="mt-2"
                      defaultValue={activeFlow.name}
                      onBlur={(e) => updateFlowName(activeFlow.id, e.target.value)}
                    />
                    <div className="text-sm text-muted-foreground mt-2">
                      Trigger: <span className="font-medium">{activeFlow.trigger}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-7">
                    <span className="text-sm text-muted-foreground">Active</span>
                    <Switch checked={activeFlow.is_active} onCheckedChange={() => toggleFlow(activeFlow)} />
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Steps</div>
                  <div className="text-xs text-muted-foreground">
                    {builderBusy ? "Saving…" : "Changes save on blur + reorder immediately"}
                  </div>
                </div>

                {localSteps.length === 0 ? (
                  <div className="p-6 rounded-xl border border-border bg-card flex items-center justify-between gap-3">
                    <div className="text-sm text-muted-foreground">No steps yet.</div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => addWaitStep(activeFlow.id)} disabled={builderBusy}>
                        <Clock className="w-4 h-4 mr-2" />
                        Wait
                      </Button>
                      <Button variant="hero" onClick={() => addEmailStep(activeFlow.id)} disabled={builderBusy}>
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                    </div>
                  </div>
                ) : (
                  localSteps
                    .slice()
                    .sort((a, b) => (a.step_order ?? 0) - (b.step_order ?? 0))
                    .map((step, idx, arr) => {
                      const cfg = safeJson(step.config);
                      const isEmail = step.type === "email";
                      const isWait = step.type === "wait";
                      const Icon = stepIcons[step.type] || Clock;

                      return (
                        <div key={step.id} className="p-6 rounded-xl border border-border bg-card">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", "bg-muted")}>
                                <Icon className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <div className="font-semibold">{isEmail ? "Email" : "Wait"}</div>
                                  <div className="text-sm text-muted-foreground">Step {idx + 1}</div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {isWait ? `Delay: ${minutesLabel(Number(step.delay_minutes || 0))}` : "Sends an email (supports {{name}} etc.)"}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => moveStep(activeFlow.id, idx, "up")}
                                disabled={builderBusy || idx === 0}
                              >
                                ↑
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => moveStep(activeFlow.id, idx, "down")}
                                disabled={builderBusy || idx === arr.length - 1}
                              >
                                ↓
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteStep(step.id)}
                                disabled={builderBusy}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>

                          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Delay minutes</Label>
                              <Input
                                type="number"
                                min={0}
                                value={String(step.delay_minutes ?? 0)}
                                onChange={(e) => {
                                  const v = Number(e.target.value || 0);
                                  setLocalSteps((prev) => prev.map((s) => (s.id === step.id ? { ...s, delay_minutes: v } : s)));
                                }}
                                onBlur={() => persistStep({ ...step, delay_minutes: Number(step.delay_minutes || 0), config: cfg })}
                              />
                              <div className="text-xs text-muted-foreground">
                                This step runs after waiting this long since the previous step.
                              </div>
                            </div>

                            {isEmail ? (
                              <div className="md:col-span-2 space-y-4">
                                <div className="space-y-2">
                                  <Label>Subject</Label>
                                  <Input
                                    value={cfg.subject || ""}
                                    placeholder="Subject"
                                    onChange={(e) => {
                                      const subject = e.target.value;
                                      setLocalSteps((prev) =>
                                        prev.map((s) => (s.id === step.id ? { ...s, config: { ...safeJson(s.config), subject } } : s))
                                      );
                                    }}
                                    onBlur={() => {
                                      const current = localSteps.find((s) => s.id === step.id);
                                      const nextCfg = safeJson(current?.config);
                                      persistStep({ ...step, delay_minutes: Number(step.delay_minutes || 0), config: nextCfg });
                                    }}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Body</Label>
                                  <Textarea
                                    rows={6}
                                    value={cfg.body || ""}
                                    placeholder="Email body"
                                    onChange={(e) => {
                                      const body = e.target.value;
                                      setLocalSteps((prev) =>
                                        prev.map((s) => (s.id === step.id ? { ...s, config: { ...safeJson(s.config), body } } : s))
                                      );
                                    }}
                                    onBlur={() => {
                                      const current = localSteps.find((s) => s.id === step.id);
                                      const nextCfg = safeJson(current?.config);
                                      persistStep({ ...step, delay_minutes: Number(step.delay_minutes || 0), config: nextCfg });
                                    }}
                                  />
                                  <div className="text-xs text-muted-foreground">
                                    Variables: <span className="font-medium">{"{{name}}"}</span>,{" "}
                                    <span className="font-medium">{"{{email}}"}</span>,{" "}
                                    <span className="font-medium">{"{{phone}}"}</span>,{" "}
                                    <span className="font-medium">{"{{message}}"}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="md:col-span-2 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                                Wait step: this step simply delays the next step. If you want to send something, add an email step.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                )}

                {/* Add step buttons */}
                {activeFlow && (
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <div className="text-xs text-muted-foreground">Steps run in order. Reorder with ↑/↓.</div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => addWaitStep(activeFlow.id)} disabled={builderBusy}>
                        <Clock className="w-4 h-4 mr-2" />
                        Wait
                      </Button>
                      <Button variant="hero" onClick={() => addEmailStep(activeFlow.id)} disabled={builderBusy}>
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setBuilderOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
