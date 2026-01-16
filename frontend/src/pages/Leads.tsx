import { useEffect, useState } from "react";
import LeadsTable from "@/components/dashboard/LeadsTable";
import { apiFetch } from "@/lib/api";
import { Lead } from "@/types/Lead";

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await apiFetch("/leads");
        setLeads(data.leads || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading leads...</div>;
  if (error) return <div className="text-destructive">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Leads</h1>
      <LeadsTable leads={leads} />
    </div>
  );
};

export default Leads;
