import {
  User,
  Star,
  AlertOctagon,
  Calendar,
  Phone,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import dayjs from 'dayjs';
import type { Seller } from '@/types';
import { cn } from '@/lib/utils';

interface SellerCardProps {
  seller: Seller;
  onClick?: () => void;
  showPhone?: boolean;
  showActions?: boolean;
  className?: string;
}

function getCreditLevelInfo(level: number): {
  stars: number;
  label: string;
  color: string;
  starColor: string;
  ringColor: string;
} {
  if (level >= 5) {
    return {
      stars: 5,
      label: '金牌卖家',
      color: 'text-warning-700',
      starColor: 'text-warning-500',
      ringColor: 'ring-warning-200',
    };
  }
  if (level >= 4) {
    return {
      stars: 4,
      label: '银牌卖家',
      color: 'text-primary-600',
      starColor: 'text-primary-400',
      ringColor: 'ring-primary-200',
    };
  }
  if (level >= 3) {
    return {
      stars: 3,
      label: '铜牌卖家',
      color: 'text-warning-600',
      starColor: 'text-warning-400',
      ringColor: 'ring-warning-100',
    };
  }
  if (level >= 2) {
    return {
      stars: 2,
      label: '普通卖家',
      color: 'text-primary-500',
      starColor: 'text-primary-300',
      ringColor: 'ring-primary-100',
    };
  }
  return {
    stars: 1,
    label: '新卖家',
    color: 'text-info-600',
    starColor: 'text-info-400',
    ringColor: 'ring-info-100',
  };
}

function getViolationSeverity(count: number): {
  bg: string;
  text: string;
  iconColor: string;
} {
  if (count === 0) {
    return {
      bg: 'bg-success-50',
      text: 'text-success-700',
      iconColor: 'text-success-500',
    };
  }
  if (count <= 2) {
    return {
      bg: 'bg-info-50',
      text: 'text-info-700',
      iconColor: 'text-info-500',
    };
  }
  if (count <= 5) {
    return {
      bg: 'bg-warning-50',
      text: 'text-warning-700',
      iconColor: 'text-warning-500',
    };
  }
  return {
    bg: 'bg-danger-50',
    text: 'text-danger-700',
    iconColor: 'text-danger-500',
  };
}

function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

export function SellerCard({
  seller,
  onClick,
  showPhone = true,
  showActions = true,
  className,
}: SellerCardProps) {
  const creditInfo = getCreditLevelInfo(seller.creditLevel);
  const violationInfo = getViolationSeverity(seller.violationCount);
  const isInteractive = !!onClick;

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative bg-white rounded-lg shadow-card border border-primary-100 overflow-hidden',
        'transition-all duration-200',
        isInteractive &&
          'cursor-pointer hover:shadow-card-hover hover:border-primary-200 hover:-translate-y-0.5',
        className,
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            {seller.avatar ? (
              <img
                src={seller.avatar}
                alt={seller.name}
                className={cn(
                  'w-14 h-14 rounded-full object-cover ring-2',
                  creditInfo.ringColor,
                )}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                  const fallback = (e.currentTarget as HTMLImageElement)
                    .nextElementSibling as HTMLDivElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={cn(
                'w-14 h-14 rounded-full items-center justify-center ring-2',
                creditInfo.ringColor,
                'bg-gradient-to-br from-primary-50 to-primary-100',
                seller.avatar ? 'hidden' : 'flex',
              )}
            >
              <User size={24} className="text-primary-400" />
            </div>

            <div
              className={cn(
                'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center',
                'bg-white shadow-sm border-2 border-white',
              )}
            >
              <Star size={12} className={cn('fill-current', creditInfo.starColor)} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-primary-900 truncate">
                {seller.name}
              </h3>
              <span
                className={cn(
                  'shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded',
                  'bg-gradient-to-r',
                  seller.creditLevel >= 5
                    ? 'from-warning-100 to-warning-200 ' + creditInfo.color
                    : 'bg-primary-50 ' + creditInfo.color,
                )}
              >
                {creditInfo.label}
              </span>
            </div>

            <div className="flex items-center gap-0.5 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={cn(
                    i < creditInfo.stars
                      ? cn('fill-current', creditInfo.starColor)
                      : 'text-primary-200',
                  )}
                />
              ))}
              <span className="ml-1.5 text-xs font-medium text-primary-500">
                Lv.{seller.creditLevel}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-primary-500">
              <div className="flex items-center gap-1">
                <Calendar size={12} className="shrink-0" />
                <span>{dayjs(seller.joinDate).format('YYYY-MM-DD')}</span>
              </div>
              {showPhone && seller.phone && (
                <div className="flex items-center gap-1">
                  <Phone size={12} className="shrink-0" />
                  <span>{maskPhone(seller.phone)}</span>
                </div>
              )}
            </div>
          </div>

          {showActions && isInteractive && (
            <ChevronRight
              size={18}
              className="shrink-0 text-primary-300 mt-1 transition-transform group-hover:translate-x-0.5"
            />
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md',
              violationInfo.bg,
            )}
          >
            <div
              className={cn(
                'w-7 h-7 rounded-md flex items-center justify-center shrink-0',
                'bg-white/70',
              )}
            >
              <AlertOctagon size={14} className={violationInfo.iconColor} />
            </div>
            <div className="min-w-0">
              <p className={cn('text-xs font-medium', violationInfo.text)}>违规次数</p>
              <p className={cn('text-sm font-bold tabular-nums', violationInfo.text)}>
                {seller.violationCount}
                <span className="text-xs font-normal ml-0.5 opacity-75">次</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-info-50">
            <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-white/70">
              <CreditCard size={14} className="text-info-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-info-700">信用等级</p>
              <p className="text-sm font-bold tabular-nums text-info-700">
                {seller.creditLevel}
                <span className="text-xs font-normal ml-0.5 opacity-75">/ 5</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {seller.violationCount > 5 && (
        <div className="px-4 py-2 bg-danger-50 border-t border-danger-100">
          <div className="flex items-center gap-1.5 text-xs font-medium text-danger-700">
            <AlertOctagon size={12} />
            <span>该卖家存在多次违规记录，建议重点关注</span>
          </div>
        </div>
      )}
    </div>
  );
}
