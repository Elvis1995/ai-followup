import { Users, MessageSquare, Calendar, TrendingUp, Zap, Clock, ArrowUpRight } from 'lucide-react';
import { mockDashboardStats, mockLeads, mockMeetings } from '@/lib/mockData';
import StatCard from '@/components/dashboard/StatCard';
import LeadsTable from '@/components/dashboard/LeadsTable';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const stats = mockDashboardStats;
  const recentLeads = mockLeads.slice(0, 5);
  const upcomingMeetings = mockMeetings.filter(m => m.status === 'scheduled').slice(0, 3);

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
          value={stats.totalLeads}
          change={`+${stats.leadsThisWeek} this week`}
          changeType="positive"
          icon={Users}
          iconColor="text-primary"
        />
        <StatCard
          title="Active follow-ups"
          value={stats.activeFollowUps}
          change="Automatic"
          changeType="neutral"
          icon={MessageSquare}
          iconColor="text-accent"
        />
        <StatCard
          title="Booked meetings"
          value={stats.bookedMeetings}
          change={`+${stats.meetingsThisWeek} this week`}
          changeType="positive"
          icon={Calendar}
          iconColor="text-success"
        />
        <StatCard
          title="Conversion rate"
          value={`${stats.conversionRate}%`}
          change="+5.2% vs last month"
          changeType="positive"
          icon={TrendingUp}
          iconColor="text-warning"
        />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border border-border bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Response rate</p>
              <p className="text-2xl font-bold">{stats.responseRate}%</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            AI responds to almost all leads within seconds
          </p>
        </div>

        <div className="p-6 rounded-xl border border-border bg-gradient-to-br from-accent/5 to-accent/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Response time</p>
              <p className="text-2xl font-bold">{stats.avgResponseTime}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Average time to first contact
          </p>
        </div>

        <div className="p-6 rounded-xl border border-border bg-gradient-to-br from-success/5 to-success/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active flows</p>
              <p className="text-2xl font-bold">3</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Automating your follow-ups 24/7
          </p>
        </div>
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

        {/* Upcoming meetings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Upcoming meetings</h2>
            <Link to="/dashboard/calendar">
              <Button variant="ghost" size="sm">
                Calendar
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{meeting.leadName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(meeting.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}{' '}
                      at {meeting.time}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium capitalize">
                    {meeting.type === 'video' ? 'Video' : meeting.type === 'call' ? 'Call' : 'In-person'}
                  </span>
                </div>
              </div>
            ))}

            {upcomingMeetings.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming meetings</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
