import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, User2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LeadActivity from "@/components/leads/LeadActivity";
import { Separator } from "@/components/ui/separator";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  status: string;
  created_at: string;
  updated_at?: string;
  source?: string | null;
};

const STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;

function formatDate(ts: string) {
  const d = new Date(ts);
  return d.toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" });
}

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initials = useMemo(() => {
    if (!lead?.name) return "—";
    return lead.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("");
  }, [lead?.name]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await apiFetch(`/leads/${id}`);
        setLead(data.lead);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    if (!id) return;

    try {
      setSavingStatus(newStatus);
      setError(null);

      const updated = await apiFetch(`/leads/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });

      setLead(updated);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSavingStatus(null);
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;
  if (error)
    return (
      <div className="p-6 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive">
        Error: {error}
      </div>
    );
  if (!lead) return <div className="p-6">Not found</div>;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-semibold">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">{lead.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{lead.email}</span>
                {lead.source ? (
                  <>
                    <span>•</span>
                    <span className="capitalize">{lead.source}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <Badge className="capitalize">{lead.status}</Badge>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <User2 className="w-5 h-5 text-muted-foreground" />
                Lead details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-muted/40 border border-border">
                <div className="text-xs text-muted-foreground mb-1">Email</div>
                <div className="font-medium">{lead.email}</div>
              </div>

              <div className="p-4 rounded-lg bg-muted/40 border border-border">
                <div className="text-xs text-muted-foreground mb-1">Phone</div>
                <div className="font-medium">{lead.phone || "—"}</div>
              </div>

              <div className="p-4 rounded-lg bg-muted/40 border border-border">
                <div className="text-xs text-muted-foreground mb-1">Created</div>
                <div className="font-medium">{formatDate(lead.created_at)}</div>
              </div>

              <div className="p-4 rounded-lg bg-muted/40 border border-border">
                <div className="text-xs text-muted-foreground mb-1">Updated</div>
                <div className="font-medium">
                  {lead.updated_at ? formatDate(lead.updated_at) : "—"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Message</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-muted/30 border border-border whitespace-pre-wrap">
                {lead.message}
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          {lead?.id ? <LeadActivity leadId={lead.id} /> : null}
        </div>

        {/* Right: Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {STATUSES.map((s) => {
                const active = lead.status === s;
                const busy = savingStatus === s;

                return (
                  <Button
                    key={s}
                    variant={active ? "default" : "outline"}
                    className={cn(
                      "w-full justify-start capitalize",
                      active && "shadow-sm"
                    )}
                    onClick={() => updateStatus(s)}
                    disabled={!!savingStatus}
                  >
                    {busy ? "Saving..." : s}
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full gap-2" variant="outline">
                <Mail className="w-4 h-4" />
                Send email (soon)
              </Button>
              <Button className="w-full gap-2" variant="outline">
                <Phone className="w-4 h-4" />
                Call (soon)
              </Button>

              <div className="text-xs text-muted-foreground pt-2">
                (MVP: actions coming later — automation handles the follow-up.)
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
