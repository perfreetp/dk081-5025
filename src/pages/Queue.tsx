import { useMemo, useState, useEffect } from 'react';
import {
  Table,
  Drawer,
  Slider,
  Checkbox,
  Select,
  Button,
  Input,
  DatePicker,
  Space,
  Tooltip,
  Tag,
  Avatar,
  Carousel,
  Badge,
  Divider,
  Progress,
  App,
  Popconfirm,
  Radio,
} from 'antd';
import type { TableProps, SelectProps } from 'antd';
import {
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Ban,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ChevronUp,
  ChevronDown,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Image as ImageIcon,
  Tags,
  TrendingDown,
  ShieldOff,
  History,
  Copy,
  FileText,
  Info,
  User,
  Star,
  CreditCard,
  Calendar,
  Phone,
  AlertOctagon,
  Lightbulb,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  List,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

import { useReviewStore } from '@/stores/useReviewStore';
import type { PendingProduct, RiskLevel, RiskType, ReviewStatus } from '@/mock';
import { CATEGORIES, REVIEW_TEMPLATES, PAGE_SIZE_OPTIONS } from '@/constants';
import { cn } from '@/lib/utils';
import { ImageMarker } from '@/components/ImageMarker';
import { HighlightText } from '@/components/HighlightText';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const RISK_LEVEL_OPTIONS: { label: string; value: RiskLevel; color: string; bgColor: string }[] = [
  { label: '高风险', value: 'high', color: '#EF4444', bgColor: '#FEF2F2' },
  { label: '中风险', value: 'medium', color: '#F59E0B', bgColor: '#FFFBEB' },
  { label: '低风险', value: 'low', color: '#3B82F6', bgColor: '#EFF6FF' },
];

const RISK_TYPE_OPTIONS: { label: string; value: RiskType; icon: typeof FileText; desc: string }[] = [
  { label: '违禁词', value: 'prohibited_words', icon: FileText, desc: '标题描述含违禁词' },
  { label: '图片违规', value: 'sensitive_image', icon: ImageIcon, desc: '图片含敏感内容' },
  { label: '价格异常', value: 'price_anomaly', icon: TrendingDown, desc: '价格偏离市场' },
  { label: '类目错放', value: 'category_mismatch', icon: Tags, desc: '类目不匹配' },
  { label: '可疑卖家', value: 'suspicious_seller', icon: ShieldOff, desc: '卖家异常行为' },
  { label: '联系方式', value: 'contact_info', icon: Phone, desc: '含引流联系方式' },
  { label: '侵权盗版', value: 'copyright', icon: Copy, desc: '涉嫌侵犯版权' },
  { label: '武器毒品', value: 'weapon_drug', icon: AlertOctagon, desc: '违禁品严重违规' },
];

const SORT_OPTIONS = [
  { label: '优先级排序', value: 'priority' as const },
  { label: '发布时间', value: 'publishTime' as const },
  { label: '风险分值', value: 'riskScore' as const },
];

function getRiskLevelStyle(level: RiskLevel) {
  switch (level) {
    case 'high':
      return { color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', label: '高风险', dot: 'bg-danger-500' };
    case 'medium':
      return { color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', label: '中风险', dot: 'bg-warning-500' };
    case 'low':
    default:
      return { color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', label: '低风险', dot: 'bg-info-500' };
  }
}

function RiskLevelBadge({ level, score }: { level: RiskLevel; score?: number }) {
  const s = getRiskLevelStyle(level);
  const Icon = level === 'high' ? ShieldAlert : level === 'medium' ? AlertTriangle : Info;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-semibold',
        level === 'high' && 'animate-pulse-danger'
      )}
      style={{ backgroundColor: s.bg, borderColor: s.border, color: s.color }}
    >
      <Icon size={12} />
      <span>{s.label}</span>
      {score !== undefined && <span className="opacity-75 ml-0.5">{score.toFixed(0)}</span>}
    </span>
  );
}

function RiskTypeTag({ type }: { type: RiskType }) {
  const opt = RISK_TYPE_OPTIONS.find((o) => o.value === type);
  if (!opt) return null;
  const Icon = opt.icon;
  return (
    <Tooltip title={opt.desc}>
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-primary-200 bg-primary-50 text-primary-600 text-xs font-medium hover:bg-primary-100 transition-colors">
        <Icon size={11} />
        <span>{opt.label}</span>
      </span>
    </Tooltip>
  );
}

function getPriceRangeChange(p: PendingProduct) {
  if (!p.originalPrice) return { diff: 0, pct: 0, trend: 'flat' as const };
  const diff = p.price - p.originalPrice;
  const pct = (diff / p.originalPrice) * 100;
  const trend = pct > 5 ? 'up' : pct < -5 ? 'down' : 'flat';
  return { diff, pct, trend };
}

interface PriceDisplayProps {
  product: PendingProduct;
}

function PriceDisplay({ product }: PriceDisplayProps) {
  const { diff, pct, trend } = getPriceRangeChange(product);
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;
  const trendColor = trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#6B7280';

  return (
    <div className="space-y-0.5">
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-bold text-primary-900 tabular-nums">¥{product.price.toFixed(2)}</span>
        {product.originalPrice && (
          <span className="text-xs text-primary-400 line-through tabular-nums">¥{product.originalPrice.toFixed(2)}</span>
        )}
      </div>
      {product.originalPrice && (
        <div className="flex items-center gap-0.5" style={{ color: trendColor }}>
          <TrendIcon size={11} />
          <span className="text-xs font-medium tabular-nums">
            {pct > 0 ? '+' : ''}
            {pct.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}

interface SellerMiniCardProps {
  seller: PendingProduct['seller'];
}

function SellerMiniCard({ seller }: SellerMiniCardProps) {
  const levelStars = Math.max(1, Math.ceil((seller.creditScore / 100) * 5));
  const levelLabel =
    seller.creditScore >= 90 ? '金牌' : seller.creditScore >= 75 ? '银牌' : seller.creditScore >= 60 ? '铜牌' : '普通';
  const levelColor = seller.creditScore >= 90 ? '#F59E0B' : seller.creditScore >= 75 ? '#6B7280' : '#D97706';
  const violationSeverity =
    seller.violationCount === 0
      ? { color: '#10B981', label: '清白' }
      : seller.violationCount <= 2
      ? { color: '#3B82F6', label: '轻微' }
      : seller.violationCount <= 5
      ? { color: '#F59E0B', label: '警告' }
      : { color: '#EF4444', label: '危险' };

  return (
    <div className="flex items-center gap-2">
      <div className="relative shrink-0">
        {seller.avatar ? (
          <Avatar
            src={seller.avatar}
            size={32}
            onError={() => false}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
            <User size={16} className="text-primary-400" />
          </div>
        )}
        <div
          className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-white flex items-center justify-center"
        >
          <Star size={8} className="fill-current" style={{ color: levelColor }} />
        </div>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-primary-800 truncate max-w-[100px]">{seller.name}</span>
          <Tag
            style={{ fontSize: 10, padding: '0 4px', margin: 0, lineHeight: '16px', color: levelColor, borderColor: levelColor, backgroundColor: `${levelColor}15` }}
          >
            {levelLabel}
          </Tag>
        </div>
        <div className="flex items-center gap-2 text-xs mt-0.5">
          <div className="flex items-center gap-0.5">
            <CreditCard size={10} className="text-primary-400" />
            <span className="text-primary-500 tabular-nums font-medium">{seller.creditScore}</span>
          </div>
          <div className="flex items-center gap-0.5">
            <AlertOctagon size={10} style={{ color: violationSeverity.color }} />
            <span className="tabular-nums font-medium" style={{ color: violationSeverity.color }}>
              {seller.violationCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DetailDrawerProps {
  open: boolean;
  product: PendingProduct | null;
  onClose: () => void;
}

function DetailDrawer({ open, product, onClose }: DetailDrawerProps) {
  const { reviewProduct } = useReviewStore();
  const { message } = App.useApp();
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [templateId, setTemplateId] = useState<string>();
  const [opinion, setOpinion] = useState('');
  const [submitting, setSubmitting] = useState<'approved' | 'rejected' | 'banned' | null>(null);

  useEffect(() => {
    if (open) {
      setCarouselIdx(0);
      setTemplateId(undefined);
      setOpinion('');
      setSubmitting(null);
    }
  }, [open, product?.id]);

  const handleTemplateChange = (id: string) => {
    setTemplateId(id);
    const tpl = REVIEW_TEMPLATES.find((t: { id: string; content: string }) => t.id === id);
    if (tpl) {
      setOpinion(tpl.content);
    }
  };

  const handleAction = async (action: ReviewStatus) => {
    if (!product) return;
    if (action !== 'pending') {
      setSubmitting(action);
    }
    await new Promise((r) => setTimeout(r, 500));
    reviewProduct(product.id, action, opinion);
    setSubmitting(null);
    const label = action === 'approved' ? '通过' : action === 'rejected' ? '打回' : '封禁';
    message.success(`已${label}：${product.title.slice(0, 20)}...`);
    onClose();
  };

  if (!product) return null;

  const { diff, pct, trend } = getPriceRangeChange(product);
  const sellerLevelStars = Math.max(1, Math.ceil((product.seller.creditScore / 100) * 5));
  const categoryMatchScore = product.riskTypes.includes('category_mismatch') ? 35 + Math.random() * 30 : 70 + Math.random() * 25;
  const priceAnomalyScore = product.riskTypes.includes('price_anomaly') ? 60 + Math.random() * 35 : 15 + Math.random() * 30;
  const historyViolationScore = product.seller.violationCount > 4 ? 70 + Math.random() * 25 : product.seller.violationCount > 1 ? 35 + Math.random() * 30 : 10 + Math.random() * 25;

  return (
    <Drawer
      title={
        <div className="flex items-center justify-between pr-4">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-primary-900">商品审核详情</span>
            <RiskLevelBadge level={product.riskLevel} score={product.riskScore} />
          </div>
          <span className="text-xs text-primary-400 font-mono">#{product.id}</span>
        </div>
      }
      open={open}
      onClose={onClose}
      width={960}
      destroyOnClose
      bodyStyle={{ padding: 0 }}
      extra={
        <Space>
          <Button icon={<XCircle size={14} />} onClick={onClose}>
            关闭
          </Button>
        </Space>
      }
    >
      <div className="flex flex-col h-[calc(100vh-140px)]">
        <div className="flex-1 overflow-y-auto">
          <div className="flex h-full">
            <div className="w-[55%] border-r border-primary-100 px-5 py-4 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <Carousel
                    dotPosition="bottom"
                    beforeChange={setCarouselIdx}
                    autoplay={false}
                  >
                    {product.images.map((img: string, idx: number) => (
                      <div key={idx}>
                        <div className="px-1">
                          <ImageMarker
                            src={img}
                            alt={`${product.title} - 图${idx + 1}`}
                            sensitiveAreas={
                              idx === 0
                                ? product.sensitiveAreas.map((sa: { label: string; x: number; y: number; width: number; height: number; confidence: number }) => ({
                                    id: `${idx}-${sa.label}-${sa.x}`,
                                    x: sa.x,
                                    y: sa.y,
                                    width: sa.width,
                                    height: sa.height,
                                    type:
                                      sa.label.includes('logo')
                                        ? 'logo'
                                        : sa.label.includes('文字') || sa.label.includes('联系方式') || sa.label.includes('二维码')
                                        ? 'text'
                                        : sa.label.includes('低俗') || sa.label.includes('暴露')
                                        ? 'adult'
                                        : sa.label.includes('违禁')
                                        ? 'violence'
                                        : 'default',
                                    confidence: sa.confidence,
                                  }))
                                : []
                            }
                            maxHeight="360px"
                          />
                        </div>
                      </div>
                    ))}
                  </Carousel>
                  <div className="mt-2 flex items-center justify-center gap-1 text-xs text-primary-400">
                    <span>
                      {carouselIdx + 1} / {product.images.length}
                    </span>
                    {product.sensitiveAreas.length > 0 && carouselIdx === 0 && (
                      <Tag color="error" style={{ marginLeft: 8 }}>
                        {product.sensitiveAreas.length} 处敏感区域
                      </Tag>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-primary-500 mb-1.5 flex items-center gap-1">
                      <FileText size={12} />
                      商品标题
                    </div>
                    <h2 className="text-lg font-semibold text-primary-900 leading-snug">
                      <HighlightText
                        text={product.title}
                        words={product.highlightWords.map((hw: { word: string }) => ({
                          word: hw.word,
                          level: product.riskLevel,
                        }))}
                      />
                    </h2>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-primary-500 mb-1.5 flex items-center gap-1">
                      <BookOpen size={12} />
                      商品描述
                    </div>
                    <p className="text-sm text-primary-700 leading-relaxed whitespace-pre-wrap">
                      <HighlightText
                        text={product.description}
                        words={product.highlightWords.map((hw: { word: string }) => ({
                          word: hw.word,
                          level: product.riskLevel,
                        }))}
                      />
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <div className="text-xs text-primary-400">类目</div>
                      <div className="text-sm font-medium text-primary-800 flex items-center gap-1">
                        <Tags size={13} className="text-primary-400" />
                        {product.category}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-primary-400">发布时间</div>
                      <div className="text-sm font-medium text-primary-800 flex items-center gap-1">
                        <Clock size={13} className="text-primary-400" />
                        {dayjs(product.publishTime).format('YYYY-MM-DD HH:mm')}
                      </div>
                    </div>
                  </div>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                <div>
                  <div className="text-xs font-semibold text-primary-500 mb-2.5 flex items-center gap-1">
                    <User size={12} />
                    卖家信息
                  </div>
                  <div className="bg-primary-50/60 rounded-lg p-3 border border-primary-100">
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        {product.seller.avatar ? (
                          <Avatar src={product.seller.avatar} size={48} />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary-200 flex items-center justify-center">
                            <User size={22} className="text-primary-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-primary-900 truncate">{product.seller.name}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-1.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={cn(
                                i < sellerLevelStars ? 'fill-warning-400 text-warning-400' : 'text-primary-200'
                              )}
                            />
                          ))}
                          <span className="ml-1 text-xs text-primary-500 font-medium">
                            信用分 {product.seller.creditScore}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-primary-500">
                          <div className="flex items-center gap-1">
                            <Calendar size={10} />
                            <span>{dayjs(product.seller.registerDate).format('YYYY-MM-DD')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone size={10} />
                            <span>
                              {product.seller.phone.slice(0, 3)}****{product.seller.phone.slice(-4)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold',
                          product.seller.violationCount === 0
                            ? 'bg-success-50 text-success-700'
                            : product.seller.violationCount <= 2
                            ? 'bg-info-50 text-info-700'
                            : product.seller.violationCount <= 5
                            ? 'bg-warning-50 text-warning-700'
                            : 'bg-danger-50 text-danger-700'
                        )}
                      >
                        <AlertOctagon size={11} />
                        <span>违规 {product.seller.violationCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 px-5 py-4 overflow-y-auto bg-primary-50/30">
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-primary-500 mb-2.5 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    风险详情
                  </div>
                  <div className="space-y-2">
                    {product.riskTypes.map((rt: RiskType) => {
                      const opt = RISK_TYPE_OPTIONS.find((o) => o.value === rt);
                      if (!opt) return null;
                      const Icon = opt.icon;
                      const severity: RiskLevel =
                        rt === 'weapon_drug' || rt === 'copyright'
                          ? 'high'
                          : rt === 'prohibited_words' || rt === 'sensitive_image' || rt === 'contact_info'
                          ? product.riskLevel
                          : 'low';
                      const sevStyle = getRiskLevelStyle(severity);
                      return (
                        <div
                          key={rt}
                          className="bg-white rounded-lg border border-primary-100 p-3 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start gap-2">
                            <div
                              className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                              style={{ backgroundColor: sevStyle.bg, color: sevStyle.color }}
                            >
                              <Icon size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm font-semibold text-primary-800">{opt.label}</span>
                                <span
                                  className="text-[10px] px-1.5 py-px rounded font-semibold"
                                  style={{ backgroundColor: sevStyle.bg, color: sevStyle.color }}
                                >
                                  {sevStyle.label}
                                </span>
                              </div>
                              <p className="text-xs text-primary-500 leading-relaxed">{opt.desc}</p>
                              <p className="text-xs text-primary-400 mt-1.5 italic">
                                证据：命中关键词 {product.highlightWords.length} 项，图片敏感区 {product.sensitiveAreas.length} 处
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-primary-500 mb-2.5 flex items-center gap-1">
                    <Lightbulb size={12} />
                    多维风险分析
                  </div>
                  <div className="grid grid-cols-1 gap-2.5">
                    <div className="bg-white rounded-lg border border-primary-100 p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-primary-600 flex items-center gap-1">
                          <Tags size={11} className="text-primary-400" />
                          类目匹配度
                        </span>
                        <span
                          className="text-xs font-bold tabular-nums"
                          style={{ color: categoryMatchScore < 50 ? '#EF4444' : categoryMatchScore < 75 ? '#F59E0B' : '#10B981' }}
                        >
                          {categoryMatchScore.toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        percent={categoryMatchScore}
                        size="small"
                        showInfo={false}
                        strokeColor={categoryMatchScore < 50 ? '#EF4444' : categoryMatchScore < 75 ? '#F59E0B' : '#10B981'}
                        trailColor="#F3F4F6"
                      />
                      <p className="text-[11px] text-primary-400 mt-1.5">
                        {categoryMatchScore < 50
                          ? '严重错放，建议打回修改类目'
                          : categoryMatchScore < 75
                          ? '匹配度偏低，建议人工确认'
                          : '类目匹配正常'}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg border border-primary-100 p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-primary-600 flex items-center gap-1">
                          <TrendingDown size={11} className="text-primary-400" />
                          价格异常分析
                        </span>
                        <span
                          className="text-xs font-bold tabular-nums"
                          style={{ color: priceAnomalyScore >= 60 ? '#EF4444' : priceAnomalyScore >= 35 ? '#F59E0B' : '#10B981' }}
                        >
                          {priceAnomalyScore.toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        percent={priceAnomalyScore}
                        size="small"
                        showInfo={false}
                        strokeColor={priceAnomalyScore >= 60 ? '#EF4444' : priceAnomalyScore >= 35 ? '#F59E0B' : '#10B981'}
                        trailColor="#F3F4F6"
                      />
                      <p className="text-[11px] text-primary-400 mt-1.5">
                        {product.originalPrice
                          ? `现价较原价${trend === 'down' ? '下跌' : trend === 'up' ? '上涨' : '持平'} ${Math.abs(pct).toFixed(1)}%`
                          : '无原价对比，已匹配同类目均价'}
                        {priceAnomalyScore >= 60 && ' —— 明显偏离市场价格'}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg border border-primary-100 p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-primary-600 flex items-center gap-1">
                          <History size={11} className="text-primary-400" />
                          历史违规关联
                        </span>
                        <span
                          className="text-xs font-bold tabular-nums"
                          style={{ color: historyViolationScore >= 60 ? '#EF4444' : historyViolationScore >= 35 ? '#F59E0B' : '#10B981' }}
                        >
                          {historyViolationScore.toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        percent={historyViolationScore}
                        size="small"
                        showInfo={false}
                        strokeColor={historyViolationScore >= 60 ? '#EF4444' : historyViolationScore >= 35 ? '#F59E0B' : '#10B981'}
                        trailColor="#F3F4F6"
                      />
                      <p className="text-[11px] text-primary-400 mt-1.5">
                        {product.seller.violationCount === 0
                          ? '卖家无违规记录，信誉良好'
                          : `卖家历史违规 ${product.seller.violationCount} 次，${
                              product.seller.violationCount > 4 ? '需从严处置' : '请结合本次情况综合判断'
                            }`}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-primary-500 mb-2.5 flex items-center gap-1">
                    <Lightbulb size={12} />
                    AI 处置建议
                  </div>
                  <div
                    className={cn(
                      'rounded-lg border p-3',
                      product.riskLevel === 'high'
                        ? 'bg-danger-50 border-danger-200'
                        : product.riskLevel === 'medium'
                        ? 'bg-warning-50 border-warning-200'
                        : 'bg-info-50 border-info-200'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <Lightbulb
                        size={16}
                        className={cn(
                          'mt-0.5 shrink-0',
                          product.riskLevel === 'high'
                            ? 'text-danger-500'
                            : product.riskLevel === 'medium'
                            ? 'text-warning-500'
                            : 'text-info-500'
                        )}
                      />
                      <div className="text-xs leading-relaxed">
                        <p
                          className={cn(
                            'font-semibold mb-1',
                            product.riskLevel === 'high'
                              ? 'text-danger-700'
                              : product.riskLevel === 'medium'
                              ? 'text-warning-700'
                              : 'text-info-700'
                          )}
                        >
                          建议动作：
                          {product.riskLevel === 'high'
                            ? product.seller.violationCount > 3 || product.riskTypes.includes('weapon_drug')
                              ? '封禁商品'
                              : '打回下架'
                            : product.riskLevel === 'medium'
                            ? '打回修改'
                            : '通过放行'}
                        </p>
                        <p className="text-primary-600">
                          综合风险评分 {product.riskScore.toFixed(0)}，命中 {product.riskTypes.length} 类风险。
                          {product.riskLevel === 'high'
                            ? '涉及明确违规内容，不建议通过。'
                            : product.riskLevel === 'medium'
                            ? '存在疑似违规风险，建议根据卖家信誉及商品详情综合判断。'
                            : '风险较低，无明显违规倾向。'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-primary-500 mb-2.5 flex items-center gap-1">
                    <FileText size={12} />
                    审核意见
                  </div>
                  <div className="space-y-2.5">
                    <Select
                      placeholder="选择意见模板（选填）"
                      size="small"
                      allowClear
                      value={templateId}
                      onChange={handleTemplateChange}
                      options={REVIEW_TEMPLATES.map((t: { level: string; name: string; useCount: number; id: string }) => ({
                        label: `[${t.level === 'warning' ? '警告' : t.level === 'delist' ? '下架' : t.level === 'restrict' ? '限流' : t.level === 'ban_product' ? '封禁商品' : '封禁卖家'}] ${t.name} · 已用${t.useCount}次`,
                        value: t.id,
                      }))}
                    />
                    <TextArea
                      rows={3}
                      placeholder="请输入审核意见（必填，将作为通知发送给卖家）"
                      value={opinion}
                      onChange={(e) => setOpinion(e.target.value)}
                      maxLength={500}
                      showCount
                      style={{ fontSize: 13 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-100 bg-white px-5 py-3">
          <div className="flex items-center justify-between">
            <div className="text-xs text-primary-400">
              <span className="mr-3">优先级：<span className="font-semibold text-primary-600 tabular-nums">{product.priority}</span></span>
              <span>审核次数：<span className="font-semibold text-primary-600 tabular-nums">{product.reviewStatus === 'pending' ? 0 : 1}</span></span>
            </div>
            <Space>
              <Popconfirm
                title="确认打回该商品？"
                description="打回后卖家可修改后重新提交"
                onConfirm={() => handleAction('rejected')}
                okText="确认打回"
                cancelText="取消"
                okButtonProps={{ danger: true, loading: submitting === 'rejected' }}
              >
                <Button
                  size="large"
                  icon={<ThumbsDown size={15} />}
                  loading={submitting === 'rejected'}
                >
                  打回修改
                </Button>
              </Popconfirm>
              <Popconfirm
                title="确认封禁该商品？"
                description="封禁后商品将不可上架，请谨慎操作"
                onConfirm={() => handleAction('banned')}
                okText="确认封禁"
                cancelText="取消"
                okButtonProps={{ danger: true, loading: submitting === 'banned' }}
              >
                <Button
                  size="large"
                  danger
                  icon={<Ban size={15} />}
                  loading={submitting === 'banned'}
                >
                  封禁商品
                </Button>
              </Popconfirm>
              <Popconfirm
                title="确认通过该商品？"
                description="通过后商品将正常上架展示"
                onConfirm={() => handleAction('approved')}
                okText="确认通过"
                cancelText="取消"
                okButtonProps={{ loading: submitting === 'approved' }}
              >
                <Button
                  size="large"
                  type="primary"
                  icon={<ThumbsUp size={15} />}
                  loading={submitting === 'approved'}
                  style={{ backgroundColor: '#10B981', borderColor: '#10B981' }}
                >
                  通过放行
                </Button>
              </Popconfirm>
            </Space>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

interface WorkbenchViewProps {
  products: PendingProduct[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  recentTemplates: string[];
  setRecentTemplates: (templates: string[]) => void;
  onBackToList: () => void;
}

function WorkbenchView({
  products,
  currentIndex,
  setCurrentIndex,
  recentTemplates,
  setRecentTemplates,
  onBackToList,
}: WorkbenchViewProps) {
  const { reviewProduct } = useReviewStore();
  const { message } = App.useApp();
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [templateId, setTemplateId] = useState<string>();
  const [opinion, setOpinion] = useState('');
  const [submitting, setSubmitting] = useState<'approved' | 'rejected' | 'banned' | null>(null);

  const currentProduct = products[currentIndex];

  useEffect(() => {
    setCarouselIdx(0);
    setTemplateId(undefined);
    setOpinion('');
    setSubmitting(null);
  }, [currentProduct?.id]);

  const handleTemplateChange = (id: string) => {
    setTemplateId(id);
    const tpl = REVIEW_TEMPLATES.find((t: { id: string; content: string }) => t.id === id);
    if (tpl) {
      setOpinion(tpl.content);
    }
  };

  const addRecentTemplate = (id?: string) => {
    if (!id) return;
    const updated = [id, ...recentTemplates.filter((t) => t !== id)].slice(0, 5);
    setRecentTemplates(updated);
  };

  const handleAction = async (action: 'approved' | 'rejected' | 'banned') => {
    if (!currentProduct) return;
    setSubmitting(action);
    await new Promise((r) => setTimeout(r, 500));
    reviewProduct(currentProduct.id, action, opinion);
    addRecentTemplate(templateId);
    setSubmitting(null);

    const label = action === 'approved' ? '通过' : action === 'rejected' ? '打回' : '封禁';
    message.success(`已${label}：${currentProduct.title.slice(0, 20)}...`);

    if (currentIndex + 1 < products.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      message.success('所有待处理商品已完成');
      onBackToList();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < products.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const templateOptions = useMemo(() => {
    const options: SelectProps['options'] = [];

    if (recentTemplates.length > 0) {
      recentTemplates.forEach((tid) => {
        const tpl = REVIEW_TEMPLATES.find((t: { id: string }) => t.id === tid);
        if (tpl) {
          options.push({
            label: `[最近使用] [${tpl.level === 'warning' ? '警告' : tpl.level === 'delist' ? '下架' : tpl.level === 'restrict' ? '限流' : tpl.level === 'ban_product' ? '封禁商品' : '封禁卖家'}] ${tpl.name}`,
            value: tpl.id,
          });
        }
      });
      options.push({ type: 'divider' } as any);
    }

    REVIEW_TEMPLATES.forEach((t: { id: string; level: string; name: string; useCount: number }) => {
      if (!recentTemplates.includes(t.id)) {
        options.push({
          label: `[${t.level === 'warning' ? '警告' : t.level === 'delist' ? '下架' : t.level === 'restrict' ? '限流' : t.level === 'ban_product' ? '封禁商品' : '封禁卖家'}] ${t.name} · 已用${t.useCount}次`,
          value: t.id,
        });
      }
    });

    return options;
  }, [recentTemplates]);

  if (products.length === 0) {
    return (
      <div className="flex-1 bg-white rounded-xl border border-primary-100 shadow-sm min-h-0 overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">🎉</div>
          <div className="text-sm font-semibold text-primary-700 mb-1">太棒了！</div>
          <div className="text-xs text-primary-400 mb-4">当前没有待处理的商品</div>
          <Button type="primary" onClick={onBackToList}>
            返回列表
          </Button>
        </div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="flex-1 bg-white rounded-xl border border-primary-100 shadow-sm min-h-0 overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="text-xs text-primary-400 mb-4">没有更多待处理商品</div>
          <Button type="primary" onClick={onBackToList}>
            返回列表
          </Button>
        </div>
      </div>
    );
  }

  const { diff, pct, trend } = getPriceRangeChange(currentProduct);
  const sellerLevelStars = Math.max(1, Math.ceil((currentProduct.seller.creditScore / 100) * 5));
  const categoryMatchScore = currentProduct.riskTypes.includes('category_mismatch') ? 35 + Math.random() * 30 : 70 + Math.random() * 25;
  const priceAnomalyScore = currentProduct.riskTypes.includes('price_anomaly') ? 60 + Math.random() * 35 : 15 + Math.random() * 30;
  const historyViolationScore = currentProduct.seller.violationCount > 4 ? 70 + Math.random() * 25 : currentProduct.seller.violationCount > 1 ? 35 + Math.random() * 30 : 10 + Math.random() * 25;

  return (
    <div className="flex-1 bg-white rounded-xl border border-primary-100 shadow-sm min-h-0 overflow-hidden flex flex-col">
      <div className="flex flex-1 min-h-0">
        <div className="w-80 shrink-0 border-r border-primary-100 flex flex-col">
          <div className="px-4 py-3 border-b border-primary-100 bg-primary-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary-800">待处理队列</span>
              <Badge count={products.length} size="small" />
            </div>
            <span className="text-xs text-primary-400">按优先级排序</span>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {products.map((p, idx) => (
              <div
                key={p.id}
                className={cn(
                  'mx-2 mb-1.5 p-2 rounded-lg cursor-pointer border transition-all',
                  idx === currentIndex
                    ? 'bg-primary-50 border-primary-300 ring-1 ring-primary-200'
                    : 'bg-white border-transparent hover:bg-primary-50/60 hover:border-primary-100'
                )}
                onClick={() => setCurrentIndex(idx)}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md border border-primary-100 overflow-hidden shrink-0 bg-primary-50">
                    {p.images[0] && (
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-primary-800 truncate leading-tight">
                      {p.title}
                    </div>
                    <div className="mt-0.5">
                      <RiskLevelBadge level={p.riskLevel} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-3 py-2.5 border-t border-primary-100 bg-white flex items-center justify-between">
            <Button
              size="small"
              icon={<ChevronLeft size={14} />}
              disabled={currentIndex === 0}
              onClick={handlePrev}
            >
              上一条
            </Button>
            <span className="text-xs text-primary-500 tabular-nums font-medium">
              {currentIndex + 1} / {products.length}
            </span>
            <Button
              size="small"
              icon={<ChevronRight size={14} />}
              disabled={currentIndex >= products.length - 1}
              onClick={handleNext}
            >
              下一条
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-5 py-3 border-b border-primary-100 bg-primary-50/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-primary-800">
                第 <span className="tabular-nums">{currentIndex + 1}</span> / {products.length} 条
              </span>
              <Progress
                percent={Math.round(((currentIndex + 1) / products.length) * 100)}
                size="small"
                showInfo={false}
                strokeColor="#10B981"
                trailColor="#E5E7EB"
                style={{ width: 200 }}
              />
            </div>
            <div className="text-xs text-primary-500">
              剩余 <span className="font-semibold text-primary-700 tabular-nums">{products.length - currentIndex - 1}</span> 条
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="flex h-full">
              <div className="w-[55%] border-r border-primary-100 px-5 py-4 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <Carousel
                      dotPosition="bottom"
                      beforeChange={setCarouselIdx}
                      autoplay={false}
                    >
                      {currentProduct.images.map((img: string, idx: number) => (
                        <div key={idx}>
                          <div className="px-1">
                            <ImageMarker
                              src={img}
                              alt={`${currentProduct.title} - 图${idx + 1}`}
                              sensitiveAreas={
                                idx === 0
                                  ? currentProduct.sensitiveAreas.map((sa: { label: string; x: number; y: number; width: number; height: number; confidence: number }) => ({
                                      id: `${idx}-${sa.label}-${sa.x}`,
                                      x: sa.x,
                                      y: sa.y,
                                      width: sa.width,
                                      height: sa.height,
                                      type:
                                        sa.label.includes('logo')
                                          ? 'logo'
                                          : sa.label.includes('文字') || sa.label.includes('联系方式') || sa.label.includes('二维码')
                                          ? 'text'
                                          : sa.label.includes('低俗') || sa.label.includes('暴露')
                                          ? 'adult'
                                          : sa.label.includes('违禁')
                                          ? 'violence'
                                          : 'default',
                                      confidence: sa.confidence,
                                    }))
                                  : []
                              }
                              maxHeight="320px"
                            />
                          </div>
                        </div>
                      ))}
                    </Carousel>
                    <div className="mt-2 flex items-center justify-center gap-1 text-xs text-primary-400">
                      <span>
                        {carouselIdx + 1} / {currentProduct.images.length}
                      </span>
                      {currentProduct.sensitiveAreas.length > 0 && carouselIdx === 0 && (
                        <Tag color="error" style={{ marginLeft: 8 }}>
                          {currentProduct.sensitiveAreas.length} 处敏感区域
                        </Tag>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-semibold text-primary-500 mb-1.5 flex items-center gap-1">
                        <FileText size={12} />
                        商品标题
                      </div>
                      <h2 className="text-lg font-semibold text-primary-900 leading-snug">
                        <HighlightText
                          text={currentProduct.title}
                          words={currentProduct.highlightWords.map((hw: { word: string }) => ({
                            word: hw.word,
                            level: currentProduct.riskLevel,
                          }))}
                        />
                      </h2>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-primary-500 mb-1.5 flex items-center gap-1">
                        <BookOpen size={12} />
                        商品描述
                      </div>
                      <p className="text-sm text-primary-700 leading-relaxed whitespace-pre-wrap">
                        <HighlightText
                          text={currentProduct.description}
                          words={currentProduct.highlightWords.map((hw: { word: string }) => ({
                            word: hw.word,
                            level: currentProduct.riskLevel,
                          }))}
                        />
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1">
                        <div className="text-xs text-primary-400">类目</div>
                        <div className="text-sm font-medium text-primary-800 flex items-center gap-1">
                          <Tags size={13} className="text-primary-400" />
                          {currentProduct.category}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-primary-400">发布时间</div>
                        <div className="text-sm font-medium text-primary-800 flex items-center gap-1">
                          <Clock size={13} className="text-primary-400" />
                          {dayjs(currentProduct.publishTime).format('YYYY-MM-DD HH:mm')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Divider style={{ margin: '16px 0' }} />

                  <div>
                    <div className="text-xs font-semibold text-primary-500 mb-2.5 flex items-center gap-1">
                      <User size={12} />
                      卖家信息
                    </div>
                    <div className="bg-primary-50/60 rounded-lg p-3 border border-primary-100">
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0">
                          {currentProduct.seller.avatar ? (
                            <Avatar src={currentProduct.seller.avatar} size={48} />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary-200 flex items-center justify-center">
                              <User size={22} className="text-primary-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-primary-900 truncate">{currentProduct.seller.name}</span>
                          </div>
                          <div className="flex items-center gap-1 mb-1.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={cn(
                                  i < sellerLevelStars ? 'fill-warning-400 text-warning-400' : 'text-primary-200'
                                )}
                              />
                            ))}
                            <span className="ml-1 text-xs text-primary-500 font-medium">
                              信用分 {currentProduct.seller.creditScore}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-primary-500">
                            <div className="flex items-center gap-1">
                              <Calendar size={10} />
                              <span>{dayjs(currentProduct.seller.registerDate).format('YYYY-MM-DD')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone size={10} />
                              <span>
                                {currentProduct.seller.phone.slice(0, 3)}****{currentProduct.seller.phone.slice(-4)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div
                          className={cn(
                            'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold',
                            currentProduct.seller.violationCount === 0
                              ? 'bg-success-50 text-success-700'
                              : currentProduct.seller.violationCount <= 2
                              ? 'bg-info-50 text-info-700'
                              : currentProduct.seller.violationCount <= 5
                              ? 'bg-warning-50 text-warning-700'
                              : 'bg-danger-50 text-danger-700'
                          )}
                        >
                          <AlertOctagon size={11} />
                          <span>违规 {currentProduct.seller.violationCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 px-5 py-4 overflow-y-auto bg-primary-50/30">
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-primary-500 mb-2.5 flex items-center gap-1">
                      <AlertTriangle size={12} />
                      风险详情
                    </div>
                    <div className="space-y-2">
                      {currentProduct.riskTypes.map((rt: RiskType) => {
                        const opt = RISK_TYPE_OPTIONS.find((o) => o.value === rt);
                        if (!opt) return null;
                        const Icon = opt.icon;
                        const severity: RiskLevel =
                          rt === 'weapon_drug' || rt === 'copyright'
                            ? 'high'
                            : rt === 'prohibited_words' || rt === 'sensitive_image' || rt === 'contact_info'
                            ? currentProduct.riskLevel
                            : 'low';
                        const sevStyle = getRiskLevelStyle(severity);
                        return (
                          <div
                            key={rt}
                            className="bg-white rounded-lg border border-primary-100 p-3 hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-start gap-2">
                              <div
                                className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                                style={{ backgroundColor: sevStyle.bg, color: sevStyle.color }}
                              >
                                <Icon size={14} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-sm font-semibold text-primary-800">{opt.label}</span>
                                  <span
                                    className="text-[10px] px-1.5 py-px rounded font-semibold"
                                    style={{ backgroundColor: sevStyle.bg, color: sevStyle.color }}
                                  >
                                    {sevStyle.label}
                                  </span>
                                </div>
                                <p className="text-xs text-primary-500 leading-relaxed">{opt.desc}</p>
                                <p className="text-xs text-primary-400 mt-1.5 italic">
                                  证据：命中关键词 {currentProduct.highlightWords.length} 项，图片敏感区 {currentProduct.sensitiveAreas.length} 处
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-primary-500 mb-2.5 flex items-center gap-1">
                      <Lightbulb size={12} />
                      多维风险分析
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      <div className="bg-white rounded-lg border border-primary-100 p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-primary-600 flex items-center gap-1">
                            <Tags size={11} className="text-primary-400" />
                            类目匹配度
                          </span>
                          <span
                            className="text-xs font-bold tabular-nums"
                            style={{ color: categoryMatchScore < 50 ? '#EF4444' : categoryMatchScore < 75 ? '#F59E0B' : '#10B981' }}
                          >
                            {categoryMatchScore.toFixed(0)}%
                          </span>
                        </div>
                        <Progress
                          percent={categoryMatchScore}
                          size="small"
                          showInfo={false}
                          strokeColor={categoryMatchScore < 50 ? '#EF4444' : categoryMatchScore < 75 ? '#F59E0B' : '#10B981'}
                          trailColor="#F3F4F6"
                        />
                        <p className="text-[11px] text-primary-400 mt-1.5">
                          {categoryMatchScore < 50
                            ? '严重错放，建议打回修改类目'
                            : categoryMatchScore < 75
                            ? '匹配度偏低，建议人工确认'
                            : '类目匹配正常'}
                        </p>
                      </div>

                      <div className="bg-white rounded-lg border border-primary-100 p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-primary-600 flex items-center gap-1">
                            <TrendingDown size={11} className="text-primary-400" />
                            价格异常分析
                          </span>
                          <span
                            className="text-xs font-bold tabular-nums"
                            style={{ color: priceAnomalyScore >= 60 ? '#EF4444' : priceAnomalyScore >= 35 ? '#F59E0B' : '#10B981' }}
                          >
                            {priceAnomalyScore.toFixed(0)}%
                          </span>
                        </div>
                        <Progress
                          percent={priceAnomalyScore}
                          size="small"
                          showInfo={false}
                          strokeColor={priceAnomalyScore >= 60 ? '#EF4444' : priceAnomalyScore >= 35 ? '#F59E0B' : '#10B981'}
                          trailColor="#F3F4F6"
                        />
                        <p className="text-[11px] text-primary-400 mt-1.5">
                          {currentProduct.originalPrice
                            ? `现价较原价${trend === 'down' ? '下跌' : trend === 'up' ? '上涨' : '持平'} ${Math.abs(pct).toFixed(1)}%`
                            : '无原价对比，已匹配同类目均价'}
                          {priceAnomalyScore >= 60 && ' —— 明显偏离市场价格'}
                        </p>
                      </div>

                      <div className="bg-white rounded-lg border border-primary-100 p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-primary-600 flex items-center gap-1">
                            <History size={11} className="text-primary-400" />
                            历史违规关联
                          </span>
                          <span
                            className="text-xs font-bold tabular-nums"
                            style={{ color: historyViolationScore >= 60 ? '#EF4444' : historyViolationScore >= 35 ? '#F59E0B' : '#10B981' }}
                          >
                            {historyViolationScore.toFixed(0)}%
                          </span>
                        </div>
                        <Progress
                          percent={historyViolationScore}
                          size="small"
                          showInfo={false}
                          strokeColor={historyViolationScore >= 60 ? '#EF4444' : historyViolationScore >= 35 ? '#F59E0B' : '#10B981'}
                          trailColor="#F3F4F6"
                        />
                        <p className="text-[11px] text-primary-400 mt-1.5">
                          {currentProduct.seller.violationCount === 0
                            ? '卖家无违规记录，信誉良好'
                            : `卖家历史违规 ${currentProduct.seller.violationCount} 次，${
                                currentProduct.seller.violationCount > 4 ? '需从严处置' : '请结合本次情况综合判断'
                              }`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-primary-500 mb-2.5 flex items-center gap-1">
                      <Lightbulb size={12} />
                      AI 处置建议
                    </div>
                    <div
                      className={cn(
                        'rounded-lg border p-3',
                        currentProduct.riskLevel === 'high'
                          ? 'bg-danger-50 border-danger-200'
                          : currentProduct.riskLevel === 'medium'
                          ? 'bg-warning-50 border-warning-200'
                          : 'bg-info-50 border-info-200'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <Lightbulb
                          size={16}
                          className={cn(
                            'mt-0.5 shrink-0',
                            currentProduct.riskLevel === 'high'
                              ? 'text-danger-500'
                              : currentProduct.riskLevel === 'medium'
                              ? 'text-warning-500'
                              : 'text-info-500'
                          )}
                        />
                        <div className="text-xs leading-relaxed">
                          <p
                            className={cn(
                              'font-semibold mb-1',
                              currentProduct.riskLevel === 'high'
                                ? 'text-danger-700'
                                : currentProduct.riskLevel === 'medium'
                                ? 'text-warning-700'
                                : 'text-info-700'
                            )}
                          >
                            建议动作：
                            {currentProduct.riskLevel === 'high'
                              ? currentProduct.seller.violationCount > 3 || currentProduct.riskTypes.includes('weapon_drug')
                                ? '封禁商品'
                                : '打回下架'
                              : currentProduct.riskLevel === 'medium'
                              ? '打回修改'
                              : '通过放行'}
                          </p>
                          <p className="text-primary-600">
                            综合风险评分 {currentProduct.riskScore.toFixed(0)}，命中 {currentProduct.riskTypes.length} 类风险。
                            {currentProduct.riskLevel === 'high'
                              ? '涉及明确违规内容，不建议通过。'
                              : currentProduct.riskLevel === 'medium'
                              ? '存在疑似违规风险，建议根据卖家信誉及商品详情综合判断。'
                              : '风险较低，无明显违规倾向。'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-primary-500 mb-2.5 flex items-center gap-1">
                      <FileText size={12} />
                      审核意见
                    </div>
                    <div className="space-y-2.5">
                      <Select
                        placeholder="选择意见模板（选填）"
                        size="small"
                        allowClear
                        value={templateId}
                        onChange={handleTemplateChange}
                        options={templateOptions}
                      />
                      <TextArea
                        rows={3}
                        placeholder="请输入审核意见（必填，将作为通知发送给卖家）"
                        value={opinion}
                        onChange={(e) => setOpinion(e.target.value)}
                        maxLength={500}
                        showCount
                        style={{ fontSize: 13 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-primary-100 bg-white px-5 py-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-primary-400">
                <span className="mr-3">优先级：<span className="font-semibold text-primary-600 tabular-nums">{currentProduct.priority}</span></span>
                <span>审核次数：<span className="font-semibold text-primary-600 tabular-nums">{currentProduct.reviewStatus === 'pending' ? 0 : 1}</span></span>
              </div>
              <Space>
                <Button
                  size="large"
                  icon={<ChevronLeft size={15} />}
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                >
                  上一条
                </Button>
                <Popconfirm
                  title="确认打回该商品？"
                  description="打回后卖家可修改后重新提交，将自动跳到下一条"
                  onConfirm={() => handleAction('rejected')}
                  okText="确认打回并下一条"
                  cancelText="取消"
                  okButtonProps={{ danger: true, loading: submitting === 'rejected' }}
                >
                  <Button
                    size="large"
                    icon={<ThumbsDown size={15} />}
                    loading={submitting === 'rejected'}
                  >
                    打回并下一条
                  </Button>
                </Popconfirm>
                <Popconfirm
                  title="确认封禁该商品？"
                  description="封禁后商品将不可上架，请谨慎操作，将自动跳到下一条"
                  onConfirm={() => handleAction('banned')}
                  okText="确认封禁并下一条"
                  cancelText="取消"
                  okButtonProps={{ danger: true, loading: submitting === 'banned' }}
                >
                  <Button
                    size="large"
                    danger
                    icon={<Ban size={15} />}
                    loading={submitting === 'banned'}
                  >
                    封禁并下一条
                  </Button>
                </Popconfirm>
                <Popconfirm
                  title="确认通过该商品？"
                  description="通过后商品将正常上架展示，将自动跳到下一条"
                  onConfirm={() => handleAction('approved')}
                  okText="确认通过并下一条"
                  cancelText="取消"
                  okButtonProps={{ loading: submitting === 'approved' }}
                >
                  <Button
                    size="large"
                    type="primary"
                    icon={<ThumbsUp size={15} />}
                    loading={submitting === 'approved'}
                    style={{ backgroundColor: '#10B981', borderColor: '#10B981' }}
                  >
                    通过并下一条
                  </Button>
                </Popconfirm>
              </Space>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Queue() {
  const { message, modal } = App.useApp();

  const {
    filters,
    pagination,
    sortBy,
    sortOrder,
    setFilters,
    resetFilters,
    setPage,
    setPageSize,
    setSort,
    selectProduct,
    reviewProduct,
    batchReview,
    getPagedProducts,
    getStats,
    applyFilters,
  } = useReviewStore();

  const stats = getStats();
  const pagedProducts = getPagedProducts();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [drawerProduct, setDrawerProduct] = useState<PendingProduct | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [localKeyword, setLocalKeyword] = useState(filters.keyword);
  const [localPriceRange, setLocalPriceRange] = useState<[number, number] | null>(null);
  const [localDateRange, setLocalDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [localCreditMin, setLocalCreditMin] = useState<number | null>(null);
  const [localViolationMax, setLocalViolationMax] = useState<number | null>(null);

  const [viewMode, setViewMode] = useState<'list' | 'workbench'>('list');
  const [workbenchCurrentIndex, setWorkbenchCurrentIndex] = useState(0);
  const [recentTemplates, setRecentTemplates] = useState<string[]>([]);

  useEffect(() => {
    applyFilters();
  }, []);

  const flattenCategories = useMemo<SelectProps['options']>(() => {
    const result: { label: string; value: string }[] = [];
    CATEGORIES.forEach((cat: { name: string; children?: { name: string }[] }) => {
      result.push({ label: cat.name, value: cat.name });
      cat.children?.forEach((sub: { name: string }) => {
        result.push({ label: `  ${sub.name}`, value: sub.name });
      });
    });
    return result;
  }, []);

  const handleApplyFilters = () => {
    setFilters({
      keyword: localKeyword,
      sellerCreditMin: localCreditMin,
      sellerViolationMax: localViolationMax,
      categories: filters.categories,
      riskLevels: filters.riskLevels,
      riskTypes: filters.riskTypes,
      dateRange: localDateRange
        ? [localDateRange[0].format('YYYY-MM-DD'), localDateRange[1].format('YYYY-MM-DD')]
        : null,
      priceRange: localPriceRange,
    });
    const { pagination } = useReviewStore.getState();
    message.success(`筛选条件已应用，共找到 ${pagination.total} 条结果`);
  };

  const handleResetFilters = () => {
    setLocalKeyword('');
    setLocalPriceRange(null);
    setLocalDateRange(null);
    setLocalCreditMin(null);
    setLocalViolationMax(null);
    resetFilters();
    message.info('已重置所有筛选条件');
  };

  const handleBatchAction = (action: ReviewStatus) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要操作的商品');
      return;
    }
    const ids = selectedRowKeys.map((k) => String(k));
    const count = ids.length;
    const label = action === 'approved' ? '通过' : '打回';
    modal.confirm({
      title: `确认批量${label}`,
      content: `将对已选中的 ${count} 个商品执行「${label}」操作，是否继续？`,
      okText: `确认${label}`,
      cancelText: '取消',
      okButtonProps: { danger: action !== 'approved' },
      onOk: () => {
        batchReview(ids, action, `批量${label}操作`);
        setSelectedRowKeys([]);
        message.success(`已成功${label} ${count} 个商品`);
      },
    });
  };

  const handleQuickAction = (product: PendingProduct, action: ReviewStatus) => {
    const label = action === 'approved' ? '通过' : '打回';
    reviewProduct(product.id, action, `快捷${label}操作`);
    message.success(`已${label}：${product.title.slice(0, 20)}...`);
  };

  const handleSortChange = (val: typeof SORT_OPTIONS[number]['value']) => {
    setSort(val);
  };

  const toggleSortOrder = () => {
    setSort(sortBy, sortOrder === 'desc' ? 'asc' : 'desc');
  };

  const columns: TableProps<PendingProduct>['columns'] = [
    {
      title: '商品',
      dataIndex: 'title',
      key: 'product',
      width: 320,
      fixed: 'left',
      render: (_, record) => (
        <div className="flex items-start gap-3">
          <div
            className="w-16 h-16 rounded-md border border-primary-100 overflow-hidden shrink-0 bg-primary-50 cursor-pointer hover:opacity-90 transition-opacity relative group"
            onClick={() => {
              setDrawerProduct(record);
              setDrawerOpen(true);
              selectProduct(record.id);
            }}
          >
            {record.images[0] && (
              <img
                src={record.images[0]}
                alt={record.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}
            {record.sensitiveAreas.length > 0 && (
              <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded bg-danger-500/90 flex items-center justify-center text-white text-[9px] font-bold">
                {record.sensitiveAreas.length}
              </div>
            )}
            <div className="absolute inset-0 bg-primary-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Eye size={14} className="text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-sm font-medium text-primary-800 leading-snug line-clamp-2 cursor-pointer hover:text-primary-600 transition-colors"
              onClick={() => {
                setDrawerProduct(record);
                setDrawerOpen(true);
                selectProduct(record.id);
              }}
              title={record.title}
            >
              <HighlightText
                text={record.title}
                words={record.highlightWords.map((hw: { word: string }) => ({
                  word: hw.word,
                  level: record.riskLevel,
                }))}
                size="sm"
              />
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <RiskLevelBadge level={record.riskLevel} />
              <div className="flex flex-wrap gap-1">
                {record.riskTypes.slice(0, 3).map((rt: RiskType) => (
                  <RiskTypeTag key={rt} type={rt} />
                ))}
                {record.riskTypes.length > 3 && (
                  <Tag style={{ fontSize: 10, padding: '0 4px', lineHeight: '18px' }}>+{record.riskTypes.length - 3}</Tag>
                )}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '类目',
      dataIndex: 'category',
      key: 'category',
      width: 110,
      render: (val: string) => (
        <div className="flex items-center gap-1">
          <Tags size={12} className="text-primary-400 shrink-0" />
          <span className="text-sm text-primary-700 truncate">{val}</span>
        </div>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      render: (_, record) => <PriceDisplay product={record} />,
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      key: 'publishTime',
      width: 135,
      render: (val: string) => (
        <div className="space-y-0.5">
          <div className="text-sm text-primary-700 tabular-nums flex items-center gap-1">
            <Calendar size={11} className="text-primary-400 shrink-0" />
            {dayjs(val).format('YYYY-MM-DD')}
          </div>
          <div className="text-xs text-primary-400 tabular-nums pl-3">
            {dayjs(val).format('HH:mm')}
          </div>
        </div>
      ),
    },
    {
      title: '卖家信息',
      key: 'seller',
      width: 200,
      render: (_, record) => <SellerMiniCard seller={record.seller} />,
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size={6}>
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<Eye size={14} />}
              onClick={() => {
                setDrawerProduct(record);
                setDrawerOpen(true);
                selectProduct(record.id);
              }}
            >
              详情
            </Button>
          </Tooltip>
          <Popconfirm
            title="快捷通过？"
            description="将直接通过该商品审核"
            onConfirm={() => handleQuickAction(record, 'approved')}
            okText="确认通过"
            cancelText="取消"
          >
            <Button
              type="text"
              size="small"
              icon={<CheckCircle2 size={14} />}
              style={{ color: '#10B981' }}
            >
              通过
            </Button>
          </Popconfirm>
          <Popconfirm
            title="快捷打回？"
            description="将打回该商品，卖家可修改后重新提交"
            onConfirm={() => handleQuickAction(record, 'rejected')}
            okText="确认打回"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<XCircle size={14} />}
            >
              打回
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection: TableProps<PendingProduct>['rowSelection'] = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    columnWidth: 48,
  };

  const filterActiveCount =
    filters.riskLevels.length +
    filters.riskTypes.length +
    filters.categories.length +
    (filters.keyword ? 1 : 0) +
    (filters.sellerCreditMin !== null ? 1 : 0) +
    (filters.sellerViolationMax !== null ? 1 : 0) +
    (filters.dateRange ? 1 : 0);

  return (
    <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between page-header !mb-0">
        <div>
          <h1 className="page-title">待审队列</h1>
          <p className="page-subtitle">
            共 <span className="font-semibold text-primary-700 tabular-nums">{stats.totalPending}</span> 条待审核，
            高风险 <span className="font-semibold text-danger-600 tabular-nums">{stats.highRiskCount}</span>、
            中风险 <span className="font-semibold text-warning-600 tabular-nums">{stats.mediumRiskCount}</span>、
            低风险 <span className="font-semibold text-info-600 tabular-nums">{stats.lowRiskCount}</span>
          </p>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <div className="w-72 shrink-0 bg-white rounded-xl border border-primary-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-primary-100 flex items-center justify-between bg-primary-50/50">
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-primary-500" />
              <span className="text-sm font-semibold text-primary-800">筛选条件</span>
              {filterActiveCount > 0 && (
                <Badge count={filterActiveCount} size="small" offset={[0, 0]} />
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-primary-600 flex items-center gap-1">
                  <AlertTriangle size={11} className="text-warning-500" />
                  风险等级
                </label>
              </div>
              <Checkbox.Group
                value={filters.riskLevels}
                onChange={(vals) => setFilters({ riskLevels: vals as RiskLevel[] })}
                className="space-y-2 w-full"
              >
                {RISK_LEVEL_OPTIONS.map((opt) => (
                  <div key={opt.value} className="flex items-center">
                    <Checkbox value={opt.value}>
                      <span
                        className="inline-flex items-center gap-1.5 text-sm"
                        style={{ color: opt.color }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: opt.color }}
                        />
                        {opt.label}
                      </span>
                    </Checkbox>
                  </div>
                ))}
              </Checkbox.Group>
            </div>

            <Divider style={{ margin: 0 }} />

            <div>
              <label className="text-xs font-semibold text-primary-600 mb-2 block flex items-center gap-1">
                <ShieldAlert size={11} className="text-danger-500" />
                风险类型
              </label>
              <Checkbox.Group
                value={filters.riskTypes}
                onChange={(vals) => setFilters({ riskTypes: vals as RiskType[] })}
                className="grid grid-cols-2 gap-y-2 w-full"
              >
                {RISK_TYPE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <Checkbox key={opt.value} value={opt.value}>
                      <span className="inline-flex items-center gap-1 text-xs text-primary-700">
                        <Icon size={11} className="text-primary-400" />
                        {opt.label}
                      </span>
                    </Checkbox>
                  );
                })}
              </Checkbox.Group>
            </div>

            <Divider style={{ margin: 0 }} />

            <div>
              <label className="text-xs font-semibold text-primary-600 mb-2 block flex items-center gap-1">
                <Tags size={11} className="text-info-500" />
                商品类目
              </label>
              <Select
                mode="multiple"
                size="small"
                placeholder="选择类目"
                allowClear
                maxTagCount={3}
                value={filters.categories}
                onChange={(vals) => setFilters({ categories: vals as string[] })}
                options={flattenCategories}
                style={{ width: '100%' }}
              />
            </div>

            <Divider style={{ margin: 0 }} />

            <div>
              <label className="text-xs font-semibold text-primary-600 mb-2 block flex items-center gap-1">
                <TrendingDown size={11} className="text-success-500" />
                价格区间
              </label>
              <div className="px-2">
                <Slider
                  range
                  min={0}
                  max={10000}
                  step={50}
                  value={localPriceRange ?? [0, 10000]}
                  onChange={(v) => setLocalPriceRange(v as [number, number])}
                  tooltip={{ formatter: (v) => `¥${v}` }}
                />
                <div className="flex items-center justify-between text-xs text-primary-400 mt-1 tabular-nums">
                  <span>¥{(localPriceRange ?? [0, 10000])[0]}</span>
                  <span>¥{(localPriceRange ?? [0, 10000])[1]}</span>
                </div>
              </div>
            </div>

            <Divider style={{ margin: 0 }} />

            <div>
              <label className="text-xs font-semibold text-primary-600 mb-2 block flex items-center gap-1">
                <Star size={11} className="text-warning-500" />
                卖家信用分 ≥ {localCreditMin ?? filters.sellerCreditMin ?? 0}
              </label>
              <div className="px-2">
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={localCreditMin ?? filters.sellerCreditMin ?? 0}
                  onChange={(v) => setLocalCreditMin(v as number)}
                  marks={{ 0: '0', 50: '50', 100: '100' }}
                />
              </div>
            </div>

            <Divider style={{ margin: 0 }} />

            <div>
              <label className="text-xs font-semibold text-primary-600 mb-2 block flex items-center gap-1">
                <AlertOctagon size={11} className="text-danger-500" />
                卖家违规次数 ≤ {localViolationMax ?? filters.sellerViolationMax ?? 10}
              </label>
              <div className="px-2">
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={localViolationMax ?? filters.sellerViolationMax ?? 10}
                  onChange={(v) => setLocalViolationMax(v as number)}
                  marks={{ 0: '0', 5: '5', 10: '10+' }}
                />
              </div>
            </div>

            <Divider style={{ margin: 0 }} />

            <div>
              <label className="text-xs font-semibold text-primary-600 mb-2 block flex items-center gap-1">
                <Clock size={11} className="text-primary-500" />
                发布时间
              </label>
              <RangePicker
                size="small"
                value={localDateRange}
                onChange={(v) => setLocalDateRange(v as [Dayjs, Dayjs] | null)}
                style={{ width: '100%' }}
              />
              <Radio.Group
                size="small"
                className="mt-2 w-full grid grid-cols-2 gap-1"
                buttonStyle="outline"
                onChange={(e) => {
                  const val = e.target.value;
                  const now = dayjs();
                  let start: Dayjs;
                  switch (val) {
                    case 'today':
                      start = now.startOf('day');
                      break;
                    case 'yesterday':
                      start = now.subtract(1, 'day').startOf('day');
                      setLocalDateRange([start, now.subtract(1, 'day').endOf('day')]);
                      return;
                    case '7days':
                      start = now.subtract(7, 'day');
                      break;
                    case '30days':
                      start = now.subtract(30, 'day');
                      break;
                    default:
                      return;
                  }
                  setLocalDateRange([start, now]);
                }}
              >
                <Radio.Button value="today" className="text-center text-xs h-7 leading-6 px-2">今天</Radio.Button>
                <Radio.Button value="yesterday" className="text-center text-xs h-7 leading-6 px-2">昨天</Radio.Button>
                <Radio.Button value="7days" className="text-center text-xs h-7 leading-6 px-2">近7天</Radio.Button>
                <Radio.Button value="30days" className="text-center text-xs h-7 leading-6 px-2">近30天</Radio.Button>
              </Radio.Group>
            </div>

            <Divider style={{ margin: 0 }} />

            <div>
              <label className="text-xs font-semibold text-primary-600 mb-2 block flex items-center gap-1">
                <Search size={11} className="text-primary-500" />
                关键词搜索
              </label>
              <Input
                size="small"
                placeholder="搜索标题/描述/卖家"
                prefix={<Search size={13} className="text-primary-400" />}
                value={localKeyword}
                onChange={(e) => setLocalKeyword(e.target.value)}
                onPressEnter={handleApplyFilters}
                allowClear
              />
            </div>
          </div>

          <div className="border-t border-primary-100 p-3 bg-primary-50/40">
            <div className="grid grid-cols-2 gap-2">
              <Button
                icon={<RefreshCw size={13} />}
                onClick={handleResetFilters}
                size="middle"
              >
                重置
              </Button>
              <Button
                type="primary"
                icon={<Filter size={13} />}
                onClick={handleApplyFilters}
                size="middle"
              >
                应用筛选
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="bg-white rounded-xl border border-primary-100 shadow-sm px-4 py-3 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                <Button
                  size="small"
                  type={viewMode === 'list' ? 'primary' : undefined}
                  icon={<List size={14} />}
                  onClick={() => setViewMode('list')}
                  className={viewMode !== 'list' ? '!border-primary-200' : ''}
                >
                  列表视图
                </Button>
                <Button
                  size="small"
                  type={viewMode === 'workbench' ? 'primary' : undefined}
                  icon={<LayoutGrid size={14} />}
                  onClick={() => {
                    setViewMode('workbench');
                    setWorkbenchCurrentIndex(0);
                  }}
                  className={viewMode !== 'workbench' ? '!border-primary-200' : ''}
                >
                  工作台视图
                </Button>
              </div>

              <Divider type="vertical" className="h-5" />

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-primary-500 whitespace-nowrap">排序方式</span>
                <Select
                  size="small"
                  value={sortBy}
                  onChange={handleSortChange}
                  style={{ width: 130 }}
                  options={SORT_OPTIONS}
                />
                <Tooltip title={sortOrder === 'desc' ? '降序，点击切换升序' : '升序，点击切换降序'}>
                  <Button
                    type="text"
                    size="small"
                    icon={
                      sortOrder === 'desc' ? (
                        <ChevronDown size={15} />
                      ) : (
                        <ChevronUp size={15} />
                      )
                    }
                    onClick={toggleSortOrder}
                    className="ml-0.5"
                  />
                </Tooltip>
              </div>

              <Divider type="vertical" className="h-5" />

              <div className="flex items-center gap-1.5">
                {selectedRowKeys.length > 0 && (
                  <span className="text-xs text-primary-500">
                    已选 <span className="font-semibold text-primary-700 tabular-nums">{selectedRowKeys.length}</span> 项
                  </span>
                )}
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckCircle2 size={13} />}
                  disabled={selectedRowKeys.length === 0}
                  onClick={() => handleBatchAction('approved')}
                  style={{ backgroundColor: '#10B981', borderColor: '#10B981' }}
                >
                  批量通过
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<XCircle size={13} />}
                  disabled={selectedRowKeys.length === 0}
                  onClick={() => handleBatchAction('rejected')}
                >
                  批量打回
                </Button>
                {selectedRowKeys.length > 0 && (
                  <Button
                    size="small"
                    type="text"
                    onClick={() => setSelectedRowKeys([])}
                  >
                    <span className="text-xs text-primary-400">清空</span>
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-primary-400 whitespace-nowrap">每页</span>
                <Select
                  size="small"
                  value={pagination.pageSize}
                  onChange={setPageSize}
                  style={{ width: 80 }}
                  options={PAGE_SIZE_OPTIONS.map((n: number) => ({ label: `${n} 条`, value: n }))}
                />
              </div>
              <div className="text-xs text-primary-500 whitespace-nowrap">
                共 <span className="font-semibold text-primary-700 tabular-nums">{pagination.total}</span> 条结果
              </div>
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="flex-1 bg-white rounded-xl border border-primary-100 shadow-sm min-h-0 overflow-hidden flex flex-col">
              <Table<PendingProduct>
                rowSelection={rowSelection}
                columns={columns}
                dataSource={pagedProducts}
                rowKey="id"
                size="middle"
                scroll={{ x: 1200, y: 'calc(100vh - 420px)' }}
                pagination={{
                  current: pagination.page,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  showSizeChanger: false,
                  showQuickJumper: true,
                  showTotal: (total, range) => (
                    <span className="text-xs text-primary-500">
                      第 {range[0]}-{range[1]} 条，共 {total} 条
                    </span>
                  ),
                  onChange: setPage,
                  size: 'small',
                  className: 'px-4',
                }}
                className="flex-1"
              />
            </div>
          ) : (
            <WorkbenchView
              products={pagedProducts}
              currentIndex={workbenchCurrentIndex}
              setCurrentIndex={setWorkbenchCurrentIndex}
              recentTemplates={recentTemplates}
              setRecentTemplates={setRecentTemplates}
              onBackToList={() => setViewMode('list')}
            />
          )}
        </div>
      </div>

      <DetailDrawer
        open={drawerOpen}
        product={drawerProduct}
        onClose={() => {
          setDrawerOpen(false);
          selectProduct(null);
        }}
      />
    </div>
  );
}
