import { useEffect, useState } from "react";

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "new" | "contacted" | "closed";
  created_at: string;
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);

  const fetchLeads = async () => {
    const res = await fetch("http://localhost:3001/leads");
    const data = await res.json();
    if (data.success) setLeads(data.leads);
  };

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 5000); // auto-refresh var 5:e sekund
    return () => clearInterval(interval);
  }, []);

  const statusColor = (status: Lead["status"]) => {
    switch (status) {
      case "new": return "bg-blue-200 text-blue-800";
      case "contacted": return "bg-yellow-200 text-yellow-800";
      case "closed": return "bg-green-200 text-green-800";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">Totala leads: {leads.length}</div>
        <div className="bg-white p-4 rounded shadow">Nya leads: {leads.filter(l => l.status === "new").length}</div>
        <div className="bg-white p-4 rounded shadow">Closed leads: {leads.filter(l => l.status === "closed").length}</div>
      </div>

      {/* Lead Table */}
      <div className="bg-white rounded shadow overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">ID</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Namn</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Email</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Telefon</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Meddelande</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Skickad</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map(lead => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{lead.id}</td>
                <td className="px-4 py-2">{lead.name}</td>
                <td className="px-4 py-2">{lead.email}</td>
                <td className="px-4 py-2">{lead.phone}</td>
                <td className="px-4 py-2">{lead.message}</td>
                <td className={`px-4 py-2 font-semibold rounded-full text-xs text-center ${statusColor(lead.status)}`}>
                  {lead.status}
                </td>
                <td className="px-4 py-2">{new Date(lead.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
