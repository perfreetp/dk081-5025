import { useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Tags,
  DollarSign,
  ShieldOff,
  History,
  Copy,
  Info,
} from 'lucide-react';
import type { RiskTag, RiskType } from '@/types';
import { cn } from '@/lib/utils';

interface RiskTagListProps {
  tags: RiskTag[];
  maxShow?: number;
  size?: 'sm' | 'md';
  className?: string;
}

const typeConfig: Record<RiskType, { label: string; icon: typeof FileText; tooltipTitle: string }> = {
  keyword: {
    label: '关键词',
    icon: FileText,
    tooltipTitle: '关键词违规',
  },
  image: {
    label: '图片违规',
    icon: ImageIcon,
    tooltipTitle: '图片内容违规',
  },
  category_mismatch: {
    label: '类目错放',
    icon: Tags,
    tooltipTitle: '商品类目不匹配',
  },
  price_abnormal: {
    label: '价格异常',
    icon: DollarSign,
    tooltipTitle: '价格异常波动',
  },
  evasion: {
    label: '规避检测',
    icon: ShieldOff,
    tooltipTitle: '疑似规避风控检测',
  },
  history: {
    label: '历史违规',
    icon: History,
    tooltipTitle: '卖家存在历史违规记录',
  },
  similar: {
    label: '重复铺货',
    icon: Copy,
    tooltipTitle: '疑似重复发布相同商品',
  },
};

const levelColorMap = {
  high: {
    bg: 'bg-danger-50',
    border: 'border-danger-200',
    text: 'text-danger-700',
    dot: 'bg-danger-500',
  },
  medium: {
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    text: 'text-warning-700',
    dot: 'bg-warning-500',
  },
  low: {
    bg: 'bg-info-50',
    border: 'border-info-200',
    text: 'text-info-700',
    dot: 'bg-info-500',
  },
  safe: {
    bg: 'bg-success-50',
    border: 'border-success-200',
    text: 'text-success-700',
    dot: 'bg-success-500',
  },
};

export function RiskTagList({
  tags,
  maxShow,
  size = 'md',
  className,
}: RiskTagListProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  if (!tags || tags.length === 0) {
    return (
      <span className="text-sm text-primary-400 italic">暂无风险标签</span>
    );
  }

  const displayTags = maxShow ? tags.slice(0, maxShow) : tags;
  const remainingCount = maxShow ? Math.max(0, tags.length - maxShow) : 0;

  const sizeClass =
    size === 'sm'
      ? 'px-1.5 py-0.5 text-xs gap-1'
      : 'px-2 py-1 text-sm gap-1.5';

  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {displayTags.map((tag) => {
        const typeConf = typeConfig[tag.type];
        const levelColors = levelColorMap[tag.level];
        const Icon = typeConf.icon;
        const isActive = activeTooltip === tag.id;

        return (
          <div key={tag.id} className="relative">
            <button
              type="button"
              onMouseEnter={() => setActiveTooltip(tag.id)}
              onMouseLeave={() => setActiveTooltip(null)}
              className={cn(
                'inline-flex items-center rounded-md border font-medium transition-all',
                'hover:shadow-sm hover:-translate-y-0.5',
                levelColors.bg,
                levelColors.border,
                levelColors.text,
                sizeClass,
              )}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full', levelColors.dot)} />
              <Icon size={iconSize} className="shrink-0" />
              <span>{typeConf.label}</span>
            </button>

            {isActive && (
              <div
                className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64"
                role="tooltip"
              >
                <div className="bg-primary-900 text-white rounded-lg p-3 shadow-modal animate-fade-in-up">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Info size={14} className="text-info-400" />
                    <span className="font-semibold text-sm">{typeConf.tooltipTitle}</span>
                  </div>
                  <p className="text-xs text-primary-200 leading-relaxed mb-2">
                    {tag.description}
                  </p>
                  {tag.evidence && (
                    <div className="mt-2 pt-2 border-t border-primary-700">
                      <span className="text-xs text-primary-400">证据：</span>
                      <span className="text-xs text-danger-300 ml-1">
                        {tag.evidence}
                      </span>
                    </div>
                  )}
                  {tag.suggestion && (
                    <div className="mt-1.5">
                      <span className="text-xs text-primary-400">建议：</span>
                      <span className="text-xs text-warning-300 ml-1">
                        {tag.suggestion}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-3 h-3 bg-primary-900 rotate-45 -mt-1.5" />
              </div>
            )}
          </div>
        );
      })}

      {remainingCount > 0 && (
        <span
          className={cn(
            'inline-flex items-center rounded-md border border-primary-200 bg-primary-50',
            'text-primary-600 font-medium',
            sizeClass,
          )}
        >
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
