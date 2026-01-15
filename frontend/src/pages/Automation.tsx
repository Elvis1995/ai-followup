import { useState } from 'react';
import { mockAutomationFlows, AutomationFlow } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Workflow,
  Mail,
  MessageSquare,
  Clock,
  Calendar,
  MoreHorizontal,
  ChevronRight,
  Zap,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const stepIcons = {
  email: Mail,
  sms: MessageSquare,
  whatsapp: MessageSquare,
  wait: Clock,
  booking: Calendar,
};

const AutomationCard = ({
  flow,
  onToggle,
}: {
  flow: AutomationFlow;
  onToggle: (id: string) => void;
}) => {
  return (
    <div
      className={cn(
        'p-6 rounded-xl border bg-card transition-all duration-300',
        flow.isActive
          ? 'border-primary/50 shadow-lg shadow-primary/5'
          : 'border-border hover:border-primary/30'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              flow.isActive
                ? 'bg-gradient-to-br from-primary/20 to-accent/20'
                : 'bg-muted'
            )}
          >
            <Workflow
              className={cn(
                'w-6 h-6',
                flow.isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            />
          </div>
          <div>
            <h3 className="font-semibold">{flow.name}</h3>
            <p className="text-sm text-muted-foreground">{flow.trigger}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch
            checked={flow.isActive}
            onCheckedChange={() => onToggle(flow.id)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Flow steps visualization */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {flow.steps.map((step, index) => {
          const Icon = stepIcons[step.type];
          return (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm',
                  flow.isActive
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border bg-muted/50'
                )}
              >
                <Icon className="w-4 h-4 text-primary" />
                <span className="whitespace-nowrap">
                  {step.type === 'wait' && step.delay
                    ? `Wait ${step.delay} ${
                        step.delayUnit === 'days'
                          ? 'days'
                          : step.delayUnit === 'hours'
                          ? 'hours'
                          : 'min'
                      }`
                    : step.type === 'email'
                    ? 'Email'
                    : step.type === 'sms'
                    ? 'SMS'
                    : step.type === 'whatsapp'
                    ? 'WhatsApp'
                    : 'Book meeting'}
                </span>
              </div>
              {index < flow.steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground mx-1 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 pt-4 border-t border-border">
        <div>
          <p className="text-sm text-muted-foreground">Leads processed</p>
          <p className="text-xl font-bold">{flow.leadsProcessed}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Conversion</p>
          <p className="text-xl font-bold text-success">
            {flow.conversionRate}%
          </p>
        </div>
      </div>
    </div>
  );
};

const Automation = () => {
  const [flows, setFlows] = useState(mockAutomationFlows);

  const handleToggle = (id: string) => {
    setFlows(
      flows.map((flow) =>
        flow.id === id ? { ...flow, isActive: !flow.isActive } : flow
      )
    );
  };

  const activeFlows = flows.filter((f) => f.isActive).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automation</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage automatic follow-up flows
          </p>
        </div>
        <Button variant="hero">
          <Plus className="w-4 h-4" />
          New flow
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Active flows</span>
          </div>
          <p className="text-3xl font-bold">
            {activeFlows}/{flows.length}
          </p>
        </div>
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-5 h-5 text-accent" />
            <span className="text-sm text-muted-foreground">
              Messages sent
            </span>
          </div>
          <p className="text-3xl font-bold">1,234</p>
        </div>
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-success" />
            <span className="text-sm text-muted-foreground">
              Meetings booked via AI
            </span>
          </div>
          <p className="text-3xl font-bold">56</p>
        </div>
      </div>

      {/* Flows grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {flows.map((flow) => (
          <AutomationCard key={flow.id} flow={flow} onToggle={handleToggle} />
        ))}
      </div>

      {/* Empty state for new flow */}
      <div className="p-8 rounded-xl border border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer group">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
            <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Create new flow</h3>
          <p className="text-muted-foreground max-w-md">
            Automate lead follow-ups with email, SMS, and WhatsApp. Choose
            triggers, timing, and templates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Automation;
