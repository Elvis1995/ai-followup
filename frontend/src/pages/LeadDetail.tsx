import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3001/leads/${id}`)
      .then(res => res.json())
      .then(data => {
        setLead(data);
        setLoading(false);
      });
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    const res = await fetch(`http://localhost:3001/leads/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });

    const updated = await res.json();
    setLead(updated);
  };

  if (loading) return <div>Loading...</div>;
  if (!lead) return <div>Not found</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top bar */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to leads
        </Button>
        <h1 className="text-3xl font-bold">{lead.name}</h1>
        <Badge>{lead.status}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Info */}
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact info</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div><b>Email:</b> {lead.email}</div>
              <div><b>Phone:</b> {lead.phone || "—"}</div>
              <div><b>Created:</b> {new Date(lead.created_at).toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{lead.message}</p>
            </CardContent>
          </Card>
        </div>

        {/* Right: Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {["new", "contacted", "qualified", "won", "lost"].map(s => (
                <Button
                  key={s}
                  variant={lead.status === s ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => updateStatus(s)}
                >
                  {s.toUpperCase()}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full">Send email</Button>
              <Button variant="outline" className="w-full">Call</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
