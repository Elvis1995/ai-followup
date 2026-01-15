import { useEffect, useState } from "react";
import { Users, MessageSquare, Calendar, TrendingUp, Zap, Clock, ArrowUpRight } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import LeadsTable from '@/components/dashboard/LeadsTable';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Lead } from '@/types/Lead';

interface Stats {
  total: number;
  today: number;
  last7Days: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
  fetch("http://localhost:3001/stats")
    .then(res => res.json())
    .then(data => setStats(data));

  fetch("http://localhost:3001/leads")
    .then(res => res.json())
    .then(data => {
      const mapped = data.leads.map((l: any) => ({
        id: l.id,
        name: l.name,
        email: l.email,
        company: "—",
        source: "Website",
        status: l.status,
        value: 0,
        phone: l.phone,
        lastContact: l.created_at,
      }));
      setLeads(mapped);
    });
}, []);


  const recentLeads = leads.slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your leads and follow-ups
          </p>
        </div>
        <Button variant="hero">
          <Zap className="w-4 h-4" />
          Create new flow
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total leads"
          value={stats ? stats.total : "..."}
          change={`+${stats ? stats.last7Days : "..."} last 7 days`}
          changeType="positive"
          icon={Users}
          iconColor="text-primary"
        />
        <StatCard
          title="Leads today"
          value={stats ? stats.today : "..."}
          change="Today"
          changeType="neutral"
          icon={MessageSquare}
          iconColor="text-accent"
        />
        <StatCard
          title="Last 7 days"
          value={stats ? stats.last7Days : "..."}
          change="New leads"
          changeType="positive"
          icon={Calendar}
          iconColor="text-success"
        />
        <StatCard
          title="Conversion rate"
          value="—"
          change="Coming soon"
          changeType="neutral"
          icon={TrendingUp}
          iconColor="text-warning"
        />
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent leads */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent leads</h2>
            <Link to="/dashboard/leads">
              <Button variant="ghost" size="sm">
                View all
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <LeadsTable leads={recentLeads} compact />
        </div>

        {/* Right column placeholder */}
        <div className="space-y-4">
          <div className="p-6 rounded-xl border border-border text-center text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Meetings & automation coming next 🚀</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;