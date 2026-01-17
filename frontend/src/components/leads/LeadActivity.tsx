import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
  PlusCircle,
  RefreshCw,
} from "lucide-react";

type ActivityEvent = {
  id: string;
  customer_id: string;
  lead_id: string;
  job_id: string | null;
  step_id: string | null;
  event_type: string;
  message: string | null;
  meta: any;
  created_at: string;
};

type JobRow = {
  id: string;
  status: "pending" | "done" | "failed";
  run_at: string;
  step_type?: string;
  step_order?: number;
  flow_id?: string;
  step_id?: string;
};

function formatTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleString("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function eventIcon(type: string) {
  if (type === "job_created") return PlusCircle;
  if (type === "email_sent") return Mail;
  if (type === "job_done") return CheckCircle2;
  if (type === "job_failed") return XCircle;
  return Clock;
}

function eventBadge(type: string) {
  switch (type) {
    case "job_created":
      return { label: "Job created", cls: "bg-primary/10 text-primary" };
    case "email_sent":
      return { label: "Email sent", cls: "bg-accent/10 text-accent" };
    case "job_done":
      return { label: "Done", cls: "bg-success/10 text-success" };
    case "job_failed":
      return { label: "Failed", cls: "bg-destructive/10 text-destructive" };
    default:
      return { label: type, cls: "bg-muted text-muted-foreground" };
  }
}

export default function LeadActivity({ leadId }: { leadId: string }) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // För att undvika att gamla async calls skriver över nyare state
  const requestIdRef = useRef(0);

  async function load(mode: "initial" | "refresh" | "poll" = "refresh") {
    if (!leadId) return;

    const myReqId = ++requestIdRef.current;

    try {
      if (mode === "initial") setLoading(true);
      if (mode === "refresh") setRefreshing(true);
      setError(null);

      const data = await apiFetch(`/leads/${leadId}/activity`);

      // ignorera om detta inte är senaste requesten
      if (myReqId !== requestIdRef.current) return;

      setEvents(data.events || []);
      setJobs(data.jobs || []);
      setLastUpdated(new Date());
    } catch (e: any) {
      if (myReqId !== requestIdRef.current) return;
      setError(e.message);
    } finally {
      if (myReqId !== requestIdRef.current) return;
      setLoading(false);
      setRefreshing(false);
    }
  }

  // ✅ Smart polling:
  // - pollar var 5s
  // - men bara om användaren är nära toppen (scrollY < 300)
  // - och bara om tabben är aktiv (document.hidden === false)
  useEffect(() => {
    if (!leadId) return;

    let timer: any;

    const tick = async () => {
      const nearTop = (window.scrollY || 0) < 300;
      const tabActive = !document.hidden;

      if (nearTop && tabActive) {
        await load("poll");
      }

      timer = setTimeout(tick, 5000);
    };

    load("initial");
    timer = setTimeout(tick, 5000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  const jobSummary = useMemo(() => {
    const pending = jobs.filter((j) => j.status === "pending").length;
    const done = jobs.filter((j) => j.status === "done").length;
    const failed = jobs.filter((j) => j.status === "failed").length;
    return { pending, done, failed, total: jobs.length };
  }, [jobs]);

  if (loading) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card">
        Loading activity…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl border border-destructive/30 bg-destructive/5">
        <div className="text-destructive font-medium mb-2">
          Activity error: {error}
        </div>
        <Button variant="outline" onClick={() => load("refresh")}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-6 border-b border-border flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Activity</h3>
          <p className="text-sm text-muted-foreground">
            Automation events and scheduled jobs
          </p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              Updated{" "}
              {lastUpdated.toLocaleTimeString("sv-SE", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Badge variant="secondary" className="bg-muted">
            Jobs: {jobSummary.total}
          </Badge>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Pending: {jobSummary.pending}
          </Badge>
          <Badge variant="secondary" className="bg-success/10 text-success">
            Done: {jobSummary.done}
          </Badge>
          <Badge
            variant="secondary"
            className="bg-destructive/10 text-destructive"
          >
            Failed: {jobSummary.failed}
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={() => load("refresh")}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="p-6">
        {/* Timeline */}
        {events.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No activity yet. When a flow creates jobs or sends messages, it will
            show up here.
          </div>
        ) : (
          <ol className="relative border-l border-border pl-6 space-y-5">
            {events.map((ev) => {
              const Icon = eventIcon(ev.event_type);
              const b = eventBadge(ev.event_type);

              return (
                <li key={ev.id} className="relative">
                  <span className="absolute -left-[14px] top-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center border border-border">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </span>

                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full",
                            b.cls
                          )}
                        >
                          {b.label}
                        </span>

                        {ev.meta?.step_type && (
                          <span className="text-xs text-muted-foreground">
                            step: {ev.meta.step_type}
                          </span>
                        )}
                        {ev.meta?.flow_name && (
                          <span className="text-xs text-muted-foreground">
                            flow: {ev.meta.flow_name}
                          </span>
                        )}
                      </div>

                      <div className="text-sm">
                        {ev.message || ev.event_type}
                      </div>

                      {ev.meta?.to && (
                        <div className="text-xs text-muted-foreground">
                          to: {ev.meta.to}
                        </div>
                      )}
                      {ev.meta?.subject && (
                        <div className="text-xs text-muted-foreground">
                          subject: {ev.meta.subject}
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTime(ev.created_at)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {/* Jobs */}
        <div className="mt-8">
          <h4 className="font-semibold mb-3">Scheduled jobs</h4>

          {jobs.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No jobs scheduled for this lead.
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="grid grid-cols-4 bg-muted/50 text-xs font-medium text-muted-foreground px-4 py-2">
                <div>Step</div>
                <div>Status</div>
                <div>Run at</div>
                <div>Job ID</div>
              </div>

              {jobs.map((j) => (
                <div
                  key={j.id}
                  className="grid grid-cols-4 px-4 py-3 text-sm border-t border-border"
                >
                  <div className="capitalize">
                    {j.step_type || "—"}{" "}
                    {typeof j.step_order === "number" ? `(#${j.step_order})` : ""}
                  </div>

                  <div>
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        j.status === "pending" && "bg-primary/10 text-primary",
                        j.status === "done" && "bg-success/10 text-success",
                        j.status === "failed" &&
                          "bg-destructive/10 text-destructive"
                      )}
                    >
                      {j.status}
                    </span>
                  </div>

                  <div className="text-muted-foreground">
                    {formatTime(j.run_at)}
                  </div>

                  <div className="text-muted-foreground truncate">{j.id}</div>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-3">
            Auto-refresh runs only when you are near the top of the page and the
            tab is active. Use “Refresh” if you’re scrolling down.
          </p>
        </div>
      </div>
    </div>
  );
}
