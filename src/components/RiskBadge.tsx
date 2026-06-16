import { AlertTriangle, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { RiskLevel } from '@/types';
import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showIcon?: boolean;
  className?: string;
}

const levelConfig = {
  high: {
    label: '高风险',
    bg: 'bg-danger-50',
    border: 'border-danger-200',
    text: 'text-danger-700',
    icon: ShieldAlert,
    iconColor: 'text-danger-500',
    pulse: true,
    pulseClass: 'animate-pulse-danger',
  },
  medium: {
    label: '中风险',
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    text: 'text-warning-700',
    icon: AlertTriangle,
    iconColor: 'text-warning-500',
    pulse: true,
    pulseClass: 'animate-pulse-warning',
  },
  low: {
    label: '低风险',
    bg: 'bg-info-50',
    border: 'border-info-200',
    text: 'text-info-700',
    icon: Shield,
    iconColor: 'text-info-500',
    pulse: false,
    pulseClass: '',
  },
  safe: {
    label: '安全',
    bg: 'bg-success-50',
    border: 'border-success-200',
    text: 'text-success-700',
    icon: ShieldCheck,
    iconColor: 'text-success-500',
    pulse: false,
    pulseClass: '',
  },
};

const sizeConfig = {
  sm: {
    padding: 'px-2 py-0.5',
    fontSize: 'text-xs',
    iconSize: 12,
    gap: 'gap-1',
  },
  md: {
    padding: 'px-2.5 py-1',
    fontSize: 'text-sm',
    iconSize: 14,
    gap: 'gap-1.5',
  },
  lg: {
    padding: 'px-3 py-1.5',
    fontSize: 'text-base',
    iconSize: 18,
    gap: 'gap-2',
  },
};

export function RiskBadge({
  level,
  size = 'md',
  showText = true,
  showIcon = true,
  className,
}: RiskBadgeProps) {
  const config = levelConfig[level];
  const sizeConf = sizeConfig[size];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border font-medium',
        config.bg,
        config.border,
        config.text,
        sizeConf.padding,
        sizeConf.fontSize,
        sizeConf.gap,
        config.pulse && config.pulseClass,
        className,
      )}
    >
      {showIcon && <Icon size={sizeConf.iconSize} className={config.iconColor} />}
      {showText && <span>{config.label}</span>}
    </span>
  );
}
