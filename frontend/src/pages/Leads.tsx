import { useEffect, useState } from "react";
import LeadsTable from "@/components/dashboard/LeadsTable";
import { API_BASE } from "@/lib/api";
import { Lead } from "@/types/Lead";

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/leads`)
      .then(res => res.json())
      .then(data => {
        setLeads(data.leads || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading leads...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Leads</h1>
      <LeadsTable leads={leads} />
    </div>
  );
};

export default Leads;
