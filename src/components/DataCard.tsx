import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

type GradientType =
  | 'primary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'purple';

interface DataCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient?: GradientType;
  trend?: number;
  trendLabel?: string;
  unit?: string;
  onClick?: () => void;
  className?: string;
}

const gradientConfig: Record<GradientType, string> = {
  primary: 'from-primary-500 to-primary-700',
  success: 'from-success-400 to-success-600',
  danger: 'from-danger-400 to-danger-600',
  warning: 'from-warning-400 to-warning-600',
  info: 'from-info-400 to-info-600',
  purple: 'from-purple-400 to-purple-600',
};

const iconBgConfig: Record<GradientType, string> = {
  primary: 'bg-primary-50 text-primary-600',
  success: 'bg-success-50 text-success-600',
  danger: 'bg-danger-50 text-danger-600',
  warning: 'bg-warning-50 text-warning-600',
  info: 'bg-info-50 text-info-600',
  purple: 'bg-purple-50 text-purple-600',
};

export function DataCard({
  title,
  value,
  icon: Icon,
  gradient = 'primary',
  trend,
  trendLabel,
  unit,
  onClick,
  className,
}: DataCardProps) {
  const isInteractive = !!onClick;

  const getTrendDisplay = () => {
    if (trend === undefined || trend === null) return null;

    const rounded = Math.abs(Math.round(trend * 100) / 100);

    if (trend > 0) {
      return {
        icon: TrendingUp,
        text: `+${rounded}%`,
        color: 'text-success-600 bg-success-50',
      };
    }
    if (trend < 0) {
      return {
        icon: TrendingDown,
        text: `-${rounded}%`,
        color: 'text-danger-600 bg-danger-50',
      };
    }
    return {
      icon: Minus,
      text: '0%',
      color: 'text-primary-500 bg-primary-50',
    };
  };

  const trendDisplay = getTrendDisplay();

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative bg-white rounded-lg shadow-card overflow-hidden',
        'transition-all duration-200',
        isInteractive && 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5',
        className,
      )}
    >
      <div
        className={cn(
          'h-1 w-full bg-gradient-to-r',
          gradientConfig[gradient],
        )}
      />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary-500 truncate">{title}</p>
          </div>
          <div
            className={cn(
              'shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
              'transition-transform duration-200',
              isInteractive && 'group-hover:scale-110',
              iconBgConfig[gradient],
            )}
          >
            <Icon size={20} />
          </div>
        </div>

        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-2xl font-bold text-primary-900 tracking-tight tabular-nums">
            {value.toLocaleString()}
          </span>
          {unit && (
            <span className="text-sm text-primary-500 font-medium">{unit}</span>
          )}
        </div>

        {trendDisplay && (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold',
                trendDisplay.color,
              )}
            >
              <trendDisplay.icon size={12} />
              {trendDisplay.text}
            </span>
            {trendLabel && (
              <span className="text-xs text-primary-400">{trendLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
