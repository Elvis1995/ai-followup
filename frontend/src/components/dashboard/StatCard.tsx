import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
}

const StatCard = ({
  title,
  value,
  change,
  changeType = 'positive',
  icon: Icon,
  iconColor = 'text-primary',
}: StatCardProps) => {
  return (
    <div className="stat-card border border-border">
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center', iconColor)}>
          <Icon className="w-6 h-6" />
        </div>
        {change && (
          <span
            className={cn(
              'text-sm font-medium px-2 py-0.5 rounded-full',
              changeType === 'positive' && 'bg-success/10 text-success',
              changeType === 'negative' && 'bg-destructive/10 text-destructive',
              changeType === 'neutral' && 'bg-muted text-muted-foreground'
            )}
          >
            {change}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

export default StatCard;
