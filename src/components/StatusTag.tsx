import {
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  FileQuestion,
  AlertTriangle,
  ArrowDownCircle,
  Lock,
  PackageX,
  UserX,
} from 'lucide-react';
import type { ProductStatus, PunishmentLevel } from '@/types';
import { cn } from '@/lib/utils';

type StatusType = 'product' | 'punishment';

interface BaseStatusTagProps {
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showDot?: boolean;
  className?: string;
}

interface ProductStatusTagProps extends BaseStatusTagProps {
  type: 'product';
  status: ProductStatus;
}

interface PunishmentStatusTagProps extends BaseStatusTagProps {
  type: 'punishment';
  status: PunishmentLevel;
}

type StatusTagProps = ProductStatusTagProps | PunishmentStatusTagProps;

const productStatusConfig = {
  pending: {
    label: '待审核',
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    text: 'text-warning-700',
    icon: Clock,
    dot: 'bg-warning-500',
  },
  approved: {
    label: '已通过',
    bg: 'bg-success-50',
    border: 'border-success-200',
    text: 'text-success-700',
    icon: CheckCircle2,
    dot: 'bg-success-500',
  },
  rejected: {
    label: '已驳回',
    bg: 'bg-danger-50',
    border: 'border-danger-200',
    text: 'text-danger-700',
    icon: XCircle,
    dot: 'bg-danger-500',
  },
  banned: {
    label: '已封禁',
    bg: 'bg-primary-50',
    border: 'border-primary-200',
    text: 'text-primary-700',
    icon: Ban,
    dot: 'bg-primary-500',
  },
  appealed: {
    label: '申诉中',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    icon: FileQuestion,
    dot: 'bg-purple-500',
  },
};

const punishmentStatusConfig = {
  warning: {
    label: '警告',
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    text: 'text-warning-700',
    icon: AlertTriangle,
    dot: 'bg-warning-500',
    severity: 1,
  },
  delist: {
    label: '下架商品',
    bg: 'bg-info-50',
    border: 'border-info-200',
    text: 'text-info-700',
    icon: ArrowDownCircle,
    dot: 'bg-info-500',
    severity: 2,
  },
  restrict: {
    label: '限制发布',
    bg: 'bg-warning-50',
    border: 'border-warning-300',
    text: 'text-warning-800',
    icon: Lock,
    dot: 'bg-warning-600',
    severity: 3,
  },
  ban_product: {
    label: '封禁商品',
    bg: 'bg-danger-50',
    border: 'border-danger-200',
    text: 'text-danger-700',
    icon: PackageX,
    dot: 'bg-danger-500',
    severity: 4,
  },
  ban_seller: {
    label: '封禁卖家',
    bg: 'bg-danger-50',
    border: 'border-danger-300',
    text: 'text-danger-800',
    icon: UserX,
    dot: 'bg-danger-600',
    severity: 5,
  },
};

const sizeConfig = {
  sm: {
    padding: 'px-1.5 py-0.5',
    fontSize: 'text-xs',
    iconSize: 12,
    gap: 'gap-1',
    dotSize: 'w-1 h-1',
  },
  md: {
    padding: 'px-2.5 py-1',
    fontSize: 'text-sm',
    iconSize: 14,
    gap: 'gap-1.5',
    dotSize: 'w-1.5 h-1.5',
  },
  lg: {
    padding: 'px-3 py-1.5',
    fontSize: 'text-base',
    iconSize: 18,
    gap: 'gap-2',
    dotSize: 'w-2 h-2',
  },
};

export function StatusTag(props: StatusTagProps) {
  const { size = 'md', showIcon = true, showDot = false, className } = props;

  const config =
    props.type === 'product'
      ? productStatusConfig[props.status]
      : punishmentStatusConfig[props.status];

  const sizeConf = sizeConfig[size];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border font-medium whitespace-nowrap',
        config.bg,
        config.border,
        config.text,
        sizeConf.padding,
        sizeConf.fontSize,
        sizeConf.gap,
        className,
      )}
    >
      {showDot && <span className={cn('rounded-full shrink-0', config.dot, sizeConf.dotSize)} />}
      {showIcon && <Icon size={sizeConf.iconSize} className="shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
}
