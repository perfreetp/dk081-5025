import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  GitCompare,
  BookOpen,
  Gavel,
  FileText,
  Calendar,
  Clock,
  User,
  CreditCard,
  AlertTriangle,
  ShieldAlert,
  Shield,
  TrendingUp,
  Eye,
  Image as ImageIcon,
  Type,
  LayoutGrid,
  Users,
  CheckCircle2,
  XCircle,
  Hash,
} from 'lucide-react';
import { RiskBadge } from '@/components/RiskBadge';
import { HighlightText } from '@/components/HighlightText';
import { ImageMarker } from '@/components/ImageMarker';
import type { RiskLevel, RiskType, SensitiveArea } from '@/types';
import { cn } from '@/lib/utils';
import { RISK_TYPE_MAP, RISK_LEVEL_MAP } from '@/constants';

interface SimilarProduct {
  id: string;
  title: string;
  thumbnail: string;
  images: string[];
  description: string;
  riskLevel: RiskLevel;
  riskTypes: RiskType[];
  similarity: number;
  sellerName: string;
  sellerCredit: number;
  sellerViolations: number;
  publishTime: string;
  highlightWords: { word: string; level: RiskLevel }[];
  sensitiveAreas: SensitiveArea[];
  price: number;
  category: string;
}

interface StandardCase {
  id: string;
  title: string;
  caseType: 'typical' | 'boundary' | 'policy';
  riskLevel: RiskLevel;
  riskTypes: RiskType[];
  verdict: string;
  verdictBasis: string[];
  historyResults: {
    date: string;
    action: string;
    count: number;
  }[];
  thumbnail: string;
  keywords: string[];
}

const mockSimilarProducts: SimilarProduct[] = [
  {
    id: 'SIM-001',
    title: '【加v看货】高端奢侈品女包 原版1:1复刻 原厂皮料',
    thumbnail: 'https://picsum.photos/seed/sim1/400/400',
    images: [
      'https://picsum.photos/seed/sim1a/600/600',
      'https://picsum.photos/seed/sim1b/600/600',
    ],
    description: '工厂尾单处理，数量有限，先到先得。支持七天无理由退换，保证品质，如假包退。加v看更多实拍图和视频，微信号看主页简介。',
    riskLevel: 'high',
    riskTypes: ['keyword', 'image', 'similar', 'evasion'],
    similarity: 96.5,
    sellerName: '奢侈品鉴定师',
    sellerCredit: 42,
    sellerViolations: 6,
    publishTime: '2026-06-16 14:32:18',
    highlightWords: [
      { word: '加v', level: 'high' },
      { word: '复刻', level: 'high' },
      { word: '1:1', level: 'high' },
      { word: '尾单', level: 'medium' },
    ],
    sensitiveAreas: [
      { id: 's1', x: 20, y: 15, width: 35, height: 25, type: 'logo', confidence: 0.94 },
      { id: 's2', x: 55, y: 60, width: 25, height: 20, type: 'text', confidence: 0.88 },
    ],
    price: 1299,
    category: '服饰鞋包',
  },
  {
    id: 'SIM-002',
    title: '【私聊优惠】品牌运动鞋 工厂尾单 支持专柜验货',
    thumbnail: 'https://picsum.photos/seed/sim2/400/400',
    images: [
      'https://picsum.photos/seed/sim2a/600/600',
    ],
    description: '正品保证，支持任何方式验货，假一赔十。私聊获取更多优惠信息和款式，个人闲置转让，99新。',
    riskLevel: 'medium',
    riskTypes: ['keyword', 'category_mismatch'],
    similarity: 89.2,
    sellerName: '运动装备控',
    sellerCredit: 68,
    sellerViolations: 2,
    publishTime: '2026-06-15 09:15:42',
    highlightWords: [
      { word: '私聊', level: 'medium' },
      { word: '尾单', level: 'medium' },
    ],
    sensitiveAreas: [
      { id: 's3', x: 10, y: 20, width: 30, height: 30, type: 'logo', confidence: 0.82 },
    ],
    price: 599,
    category: '运动户外',
  },
  {
    id: 'SIM-003',
    title: '原装进口保健品 增强免疫 治疗糖尿病高血压',
    thumbnail: 'https://picsum.photos/seed/sim3/400/400',
    images: [
      'https://picsum.photos/seed/sim3a/600/600',
      'https://picsum.photos/seed/sim3b/600/600',
    ],
    description: '渠道货源，价格优势明显。增强免疫，根治糖尿病，特效治疗高血压。量大从优，支持批量拿货。',
    riskLevel: 'high',
    riskTypes: ['keyword', 'price_abnormal'],
    similarity: 87.8,
    sellerName: '美妆博主Lily',
    sellerCredit: 55,
    sellerViolations: 3,
    publishTime: '2026-06-14 20:08:55',
    highlightWords: [
      { word: '治疗', level: 'high' },
      { word: '根治', level: 'high' },
      { word: '特效', level: 'high' },
      { word: '渠道', level: 'medium' },
    ],
    sensitiveAreas: [],
    price: 888,
    category: '食品保健',
  },
  {
    id: 'SIM-004',
    title: '【加微信选款】专柜同款女装 原单尾货 一件代发',
    thumbnail: 'https://picsum.photos/seed/sim4/400/400',
    images: [
      'https://picsum.photos/seed/sim4a/600/600',
    ],
    description: '加微信选款，原厂原单尾货，支持一件代发。长期合作客户有优惠，欢迎微商代理加盟。微信号在个人主页。',
    riskLevel: 'high',
    riskTypes: ['keyword', 'evasion', 'similar'],
    similarity: 93.1,
    sellerName: '工厂尾单王',
    sellerCredit: 38,
    sellerViolations: 5,
    publishTime: '2026-06-16 11:22:33',
    highlightWords: [
      { word: '加微信', level: 'high' },
      { word: '原单', level: 'medium' },
      { word: '尾货', level: 'medium' },
      { word: '代理', level: 'medium' },
    ],
    sensitiveAreas: [
      { id: 's4', x: 30, y: 40, width: 40, height: 35, type: 'logo', confidence: 0.91 },
    ],
    price: 299,
    category: '服装鞋包',
  },
  {
    id: 'SIM-005',
    title: '【看简介】欧美大牌香水 渠道货 支持扫码验货',
    thumbnail: 'https://picsum.photos/seed/sim5/400/400',
    images: [
      'https://picsum.photos/seed/sim5a/600/600',
    ],
    description: '看简介加联系方式，特殊渠道货源，不对外公开销售。支持扫码验货，如假包退，数量有限。',
    riskLevel: 'high',
    riskTypes: ['keyword', 'evasion', 'history'],
    similarity: 91.4,
    sellerName: '闲置物品处理',
    sellerCredit: 31,
    sellerViolations: 7,
    publishTime: '2026-06-13 16:45:12',
    highlightWords: [
      { word: '看简介', level: 'medium' },
      { word: '渠道货', level: 'medium' },
      { word: '特殊渠道', level: 'high' },
    ],
    sensitiveAreas: [
      { id: 's5', x: 15, y: 25, width: 28, height: 40, type: 'logo', confidence: 0.87 },
      { id: 's6', x: 60, y: 50, width: 20, height: 15, type: 'text', confidence: 0.76 },
    ],
    price: 459,
    category: '美妆护肤',
  },
  {
    id: 'SIM-006',
    title: '华为Mate60 Pro 512G 雅川青 激活三天 保修一年',
    thumbnail: 'https://picsum.photos/seed/sim6/400/400',
    images: [
      'https://picsum.photos/seed/sim6a/600/600',
    ],
    description: '个人自用，激活三天，全套配件齐全，有发票，保修一年。因换手机低价出，当面验货，非诚勿扰。',
    riskLevel: 'low',
    riskTypes: ['price_abnormal'],
    similarity: 65.3,
    sellerName: '数码达人小王',
    sellerCredit: 92,
    sellerViolations: 0,
    publishTime: '2026-06-16 08:30:00',
    highlightWords: [],
    sensitiveAreas: [],
    price: 5999,
    category: '数码3C',
  },
  {
    id: 'SIM-007',
    title: '【加qq详聊】二手笔记本电脑 i9处理器 显卡4090',
    thumbnail: 'https://picsum.photos/seed/sim7/400/400',
    images: [
      'https://picsum.photos/seed/sim7a/600/600',
    ],
    description: '加qq详聊配置细节，个人自用游戏本，99新，性能强劲。因为工作调动低价处理，可小刀。',
    riskLevel: 'medium',
    riskTypes: ['keyword', 'price_abnormal'],
    similarity: 78.6,
    sellerName: '二手玩家9527',
    sellerCredit: 71,
    sellerViolations: 1,
    publishTime: '2026-06-15 22:10:45',
    highlightWords: [
      { word: '加qq', level: 'high' },
    ],
    sensitiveAreas: [],
    price: 6800,
    category: '数码3C',
  },
];

const mockStandardCases: StandardCase[] = [
  {
    id: 'CASE-001',
    title: '奢侈品高仿类违规判定标准案例',
    caseType: 'typical',
    riskLevel: 'high',
    riskTypes: ['keyword', 'image', 'similar'],
    verdict: '封禁商品 + 卖家限流7天',
    verdictBasis: [
      '标题/描述中明确使用"复刻""1:1""原单""尾单"等假冒暗示词汇',
      '商品图片检测到疑似品牌logo侵权，置信度>85%',
      '与历史违规商品相似度>90%',
      '卖家历史违规记录≥3次，信用分<60',
    ],
    historyResults: [
      { date: '2026-06-10', action: '封禁商品', count: 47 },
      { date: '2026-06-11', action: '封禁商品+限流', count: 32 },
      { date: '2026-06-12', action: '封禁商品+限流', count: 28 },
      { date: '2026-06-13', action: '封禁卖家', count: 8 },
      { date: '2026-06-14', action: '封禁商品+限流', count: 35 },
    ],
    thumbnail: 'https://picsum.photos/seed/case1/300/300',
    keywords: ['复刻', '1:1', '原单', '尾单', '高仿'],
  },
  {
    id: 'CASE-002',
    title: '医疗功效类宣传违规判定边界案例',
    caseType: 'boundary',
    riskLevel: 'medium',
    riskTypes: ['keyword'],
    verdict: '商品下架 + 警告通知',
    verdictBasis: [
      '描述中使用"治疗""根治""特效"等医疗功效词汇，属于明确违规',
      '"增强免疫""调理身体"等保健类词汇需结合类目判断',
      '食品/保健品类目：禁止出现疾病治疗相关描述',
      '普通商品类目：出现医疗词汇需人工判定是否为误用词',
    ],
    historyResults: [
      { date: '2026-06-10', action: '下架商品', count: 89 },
      { date: '2026-06-11', action: '下架商品', count: 76 },
      { date: '2026-06-12', action: '警告通知', count: 45 },
      { date: '2026-06-13', action: '下架商品', count: 82 },
      { date: '2026-06-14', action: '下架+限流', count: 15 },
    ],
    thumbnail: 'https://picsum.photos/seed/case2/300/300',
    keywords: ['治疗', '根治', '特效', '包治百病', '偏方'],
  },
  {
    id: 'CASE-003',
    title: '联系方式引流类违规处置政策',
    caseType: 'policy',
    riskLevel: 'high',
    riskTypes: ['keyword', 'evasion'],
    verdict: '根据违规次数阶梯处置',
    verdictBasis: [
      '首次违规：商品下架 + 警告通知',
      '累计2-3次：商品封禁 + 卖家限流3-7天',
      '累计4次以上：封禁卖家账号',
      '使用变体词（加v/加微信/看简介）规避检测，从严处理',
    ],
    historyResults: [
      { date: '2026-06-10', action: '下架+警告', count: 156 },
      { date: '2026-06-11', action: '封禁商品', count: 98 },
      { date: '2026-06-12', action: '封禁+限流', count: 67 },
      { date: '2026-06-13', action: '封禁卖家', count: 23 },
      { date: '2026-06-14', action: '封禁+限流', count: 89 },
    ],
    thumbnail: 'https://picsum.photos/seed/case3/300/300',
    keywords: ['加微信', '加v', '私聊', '看简介', '加qq'],
  },
  {
    id: 'CASE-004',
    title: '价格异常类欺诈判定标准',
    caseType: 'typical',
    riskLevel: 'medium',
    riskTypes: ['price_abnormal', 'category_mismatch'],
    verdict: '商品下架 + 人工复核',
    verdictBasis: [
      '价格低于同类目均价30%以上，需人工核实',
      '低内存版本标高价/高内存版本标低价需重点关注',
      '个人闲置且有合理解释的，可酌情放行',
      '配合引流关键词的价格异常，从严处置',
    ],
    historyResults: [
      { date: '2026-06-10', action: '下架待核', count: 234 },
      { date: '2026-06-11', action: '通过放行', count: 167 },
      { date: '2026-06-12', action: '下架商品', count: 89 },
      { date: '2026-06-13', action: '下架待核', count: 198 },
      { date: '2026-06-14', action: '封禁商品', count: 34 },
    ],
    thumbnail: 'https://picsum.photos/seed/case4/300/300',
    keywords: ['低价出', '急出', '清仓', '内部价'],
  },
];

const RISK_TYPE_OPTIONS: { value: RiskType; label: string }[] = [
  { value: 'keyword', label: '关键词命中' },
  { value: 'image', label: '图片违规' },
  { value: 'category_mismatch', label: '类目错放' },
  { value: 'price_abnormal', label: '价格异常' },
  { value: 'evasion', label: '规避检测' },
  { value: 'history', label: '历史违规' },
  { value: 'similar', label: '相似案例' },
];

const RISK_LEVEL_OPTIONS: { value: RiskLevel; label: string }[] = [
  { value: 'high', label: '高风险' },
  { value: 'medium', label: '中风险' },
  { value: 'low', label: '低风险' },
  { value: 'safe', label: '安全' },
];

const TIME_RANGE_OPTIONS = [
  { value: 'today', label: '今天' },
  { value: '7days', label: '近7天' },
  { value: '30days', label: '近30天' },
  { value: 'all', label: '全部' },
];

const CASE_TAB_OPTIONS = [
  { value: 'typical', label: '典型违规案例', icon: AlertTriangle },
  { value: 'boundary', label: '边界判定案例', icon: FileText },
  { value: 'policy', label: '处理政策参考', icon: Gavel },
];

type CompareTabKey = 'image' | 'text' | 'risk' | 'seller';

export default function Compare() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRiskTypes, setSelectedRiskTypes] = useState<RiskType[]>([]);
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<RiskLevel[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7days');
  const [showFilters, setShowFilters] = useState(true);

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [filterExpanded, setFilterExpanded] = useState<Record<string, boolean>>({
    riskType: true,
    riskLevel: true,
    timeRange: true,
  });

  const [activeCaseTab, setActiveCaseTab] = useState<string>('typical');
  const [activeCompareTab, setActiveCompareTab] = useState<CompareTabKey>('image');

  const [detailModal, setDetailModal] = useState<{
    visible: boolean;
    productId: string | null;
  }>({ visible: false, productId: null });

  const [caseDetailModal, setCaseDetailModal] = useState<{
    visible: boolean;
    caseId: string | null;
  }>({ visible: false, caseId: null });

  const filteredProducts = useMemo(() => {
    return mockSimilarProducts.filter((p) => {
      if (searchKeyword) {
        const kw = searchKeyword.toLowerCase();
        if (
          !p.title.toLowerCase().includes(kw) &&
          !p.sellerName.toLowerCase().includes(kw) &&
          !p.category.toLowerCase().includes(kw)
        ) {
          return false;
        }
      }
      if (selectedRiskTypes.length > 0) {
        const hasMatch = p.riskTypes.some((rt) => selectedRiskTypes.includes(rt));
        if (!hasMatch) return false;
      }
      if (selectedRiskLevels.length > 0) {
        if (!selectedRiskLevels.includes(p.riskLevel)) return false;
      }
      return true;
    });
  }, [searchKeyword, selectedRiskTypes, selectedRiskLevels, selectedTimeRange]);

  const selectedProducts = useMemo(() => {
    return mockSimilarProducts.filter((p) => selectedProductIds.includes(p.id));
  }, [selectedProductIds]);

  const filteredCases = useMemo(() => {
    return mockStandardCases.filter((c) => c.caseType === activeCaseTab);
  }, [activeCaseTab]);

  const toggleProductSelect = (id: string) => {
    setSelectedProductIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((pid) => pid !== id);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const clearAllSelected = () => {
    setSelectedProductIds([]);
  };

  const toggleRiskType = (type: RiskType) => {
    setSelectedRiskTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const toggleRiskLevel = (level: RiskLevel) => {
    setSelectedRiskLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level],
    );
  };

  const resetFilters = () => {
    setSelectedRiskTypes([]);
    setSelectedRiskLevels([]);
    setSelectedTimeRange('7days');
    setSearchKeyword('');
  };

  const currentDetailProduct = detailModal.productId
    ? mockSimilarProducts.find((p) => p.id === detailModal.productId)
    : null;

  const currentDetailCase = caseDetailModal.caseId
    ? mockStandardCases.find((c) => c.id === caseDetailModal.caseId)
    : null;

  const renderCompareTab = () => {
    if (selectedProducts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-80 text-primary-400">
          <GitCompare size={64} className="mb-4 opacity-30" />
          <p className="text-lg font-medium">请从左侧选择商品进行对比</p>
          <p className="text-sm mt-2">最多可同时选择 4 个商品进行并列对比</p>
        </div>
      );
    }

    const gridCols =
      selectedProducts.length === 1
        ? 'grid-cols-1'
        : selectedProducts.length === 2
        ? 'grid-cols-2'
        : selectedProducts.length === 3
        ? 'grid-cols-3'
        : 'grid-cols-4';

    return (
      <div className={cn('grid gap-4', gridCols)}>
        {selectedProducts.map((product) => (
          <div key={product.id} className="flex flex-col">
            <div className="flex items-center justify-between mb-3 p-3 bg-primary-50 rounded-lg border border-primary-100">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0',
                    product.riskLevel === 'high'
                      ? 'bg-danger-500'
                      : product.riskLevel === 'medium'
                      ? 'bg-warning-500'
                      : product.riskLevel === 'low'
                      ? 'bg-info-500'
                      : 'bg-success-500',
                  )}
                >
                  {selectedProductIds.indexOf(product.id) + 1}
                </div>
                <span className="text-sm font-medium text-primary-700 line-clamp-1">
                  {product.title}
                </span>
              </div>
              <button
                onClick={() => toggleProductSelect(product.id)}
                className="p-1 rounded text-primary-400 hover:text-danger-500 hover:bg-danger-50 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {activeCompareTab === 'image' && (
              <div className="flex-1">
                <ImageMarker
                  src={product.images[0]}
                  alt={product.title}
                  sensitiveAreas={product.sensitiveAreas}
                  maxHeight="280px"
                />
                <div className="mt-2 flex flex-wrap gap-1">
                  {product.sensitiveAreas.length === 0 ? (
                    <span className="text-xs text-primary-400">未检测到敏感区域</span>
                  ) : (
                    product.sensitiveAreas.map((area) => (
                      <span
                        key={area.id}
                        className="risk-tag risk-tag-danger text-[10px]"
                      >
                        {area.type} {Math.round(area.confidence * 100)}%
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeCompareTab === 'text' && (
              <div className="flex-1 p-4 bg-primary-50 rounded-lg border border-primary-100 min-h-[280px]">
                <div className="mb-3">
                  <h4 className="text-xs font-semibold text-primary-500 uppercase mb-1">商品标题</h4>
                  <HighlightText
                    text={product.title}
                    words={product.highlightWords.map((w) => ({
                      word: w.word,
                      level: w.level,
                    }))}
                    size="base"
                  />
                </div>
                <div className="divider" />
                <div>
                  <h4 className="text-xs font-semibold text-primary-500 uppercase mb-1">商品描述</h4>
                  <HighlightText
                    text={product.description}
                    words={product.highlightWords.map((w) => ({
                      word: w.word,
                      level: w.level,
                    }))}
                    size="base"
                  />
                </div>
                <div className="divider" />
                <div>
                  <h4 className="text-xs font-semibold text-primary-500 uppercase mb-2">命中关键词</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {product.highlightWords.length === 0 ? (
                      <span className="text-xs text-primary-400">无命中关键词</span>
                    ) : (
                      product.highlightWords.map((w, idx) => (
                        <span
                          key={idx}
                          className={cn(
                            'risk-tag',
                            w.level === 'high'
                              ? 'risk-tag-danger'
                              : w.level === 'medium'
                              ? 'risk-tag-warning'
                              : 'risk-tag-info',
                          )}
                        >
                          {w.word}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeCompareTab === 'risk' && (
              <div className="flex-1 p-4 rounded-lg border border-primary-100 min-h-[280px]">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary-700">综合风险等级</span>
                    <RiskBadge level={product.riskLevel} size="sm" />
                  </div>
                  <div className="progress-bar">
                    <div
                      className={cn(
                        'progress-bar-fill',
                        product.riskLevel === 'high'
                          ? 'bg-danger-500'
                          : product.riskLevel === 'medium'
                          ? 'bg-warning-500'
                          : product.riskLevel === 'low'
                          ? 'bg-info-500'
                          : 'bg-success-500',
                      )}
                      style={{ width: `${product.similarity}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-primary-400 mt-1">
                    <span>相似度: {product.similarity}%</span>
                    <span>价格: ¥{product.price}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {RISK_TYPE_OPTIONS.map((opt) => {
                    const hasRisk = product.riskTypes.includes(opt.value);
                    return (
                      <div
                        key={opt.value}
                        className={cn(
                          'flex items-center justify-between p-2 rounded-md text-sm',
                          hasRisk ? 'bg-danger-50 border border-danger-100' : 'bg-primary-50',
                        )}
                      >
                        <span className={hasRisk ? 'text-danger-700 font-medium' : 'text-primary-400'}>
                          {opt.label}
                        </span>
                        {hasRisk ? (
                          <CheckCircle2 size={16} className="text-danger-500" />
                        ) : (
                          <XCircle size={16} className="text-primary-300" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeCompareTab === 'seller' && (
              <div className="flex-1 p-4 rounded-lg border border-primary-100 min-h-[280px]">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-primary-100">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <User size={24} className="text-primary-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-primary-800 line-clamp-1">{product.sellerName}</p>
                    <p className="text-xs text-primary-400 mt-0.5 flex items-center gap-1">
                      <Clock size={12} />
                      发布于 {product.publishTime.slice(0, 10)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-primary-600 flex items-center gap-1.5">
                        <CreditCard size={14} />
                        卖家信用分
                      </span>
                      <span
                        className={cn(
                          'text-sm font-bold',
                          product.sellerCredit >= 80
                            ? 'text-success-600'
                            : product.sellerCredit >= 60
                            ? 'text-warning-600'
                            : 'text-danger-600',
                        )}
                      >
                        {product.sellerCredit}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={cn(
                          'progress-bar-fill',
                          product.sellerCredit >= 80
                            ? 'bg-success-500'
                            : product.sellerCredit >= 60
                            ? 'bg-warning-500'
                            : 'bg-danger-500',
                        )}
                        style={{ width: `${product.sellerCredit}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-primary-400 mt-1">
                      <span>差 0</span>
                      <span>优 100</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-primary-600 flex items-center gap-1.5">
                        <AlertTriangle size={14} />
                        历史违规次数
                      </span>
                      <span
                        className={cn(
                          'text-sm font-bold',
                          product.sellerViolations === 0
                            ? 'text-success-600'
                            : product.sellerViolations <= 2
                            ? 'text-warning-600'
                            : 'text-danger-600',
                        )}
                      >
                        {product.sellerViolations} 次
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            'h-2 flex-1 rounded-full',
                            i < product.sellerViolations ? 'bg-danger-400' : 'bg-primary-100',
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-primary-100 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-primary-500">所属类目</span>
                      <span className="text-primary-700 font-medium">{product.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-primary-500">风险类型数</span>
                      <span className="text-primary-700 font-medium">{product.riskTypes.length} 项</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <GitCompare className="w-6 h-6 text-purple-600" />
              案例比对
            </h1>
            <p className="page-subtitle">多维度对比相似案例，辅助审核决策参考</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedProductIds.length > 0 && (
              <button
                onClick={clearAllSelected}
                className="btn-outline text-xs"
              >
                <X size={14} />
                清除选择 ({selectedProductIds.length}/4)
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
          <input
            type="text"
            placeholder="搜索商品标题、卖家名称、类目..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="input-field pl-9"
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'btn-outline text-xs',
            showFilters && 'bg-info-50 border-info-200 text-info-700',
          )}
        >
          <Filter size={14} />
          筛选条件
          <ChevronDown size={14} className={cn(showFilters && 'rotate-180 transition-transform')} />
        </button>

        <button onClick={resetFilters} className="btn-outline text-xs">
          重置筛选
        </button>

        <div className="flex-1" />

        <span className="text-xs text-primary-500">
          共 <span className="font-semibold text-primary-700">{filteredProducts.length}</span> 条相似案例
        </span>
      </div>

      {showFilters && (
        <div className="risk-card p-4 mb-4 animate-fade-in-down">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <button
                onClick={() => setFilterExpanded((p) => ({ ...p, riskType: !p.riskType }))}
                className="w-full flex items-center justify-between text-sm font-medium text-primary-700 mb-2"
              >
                <span className="flex items-center gap-1.5">
                  <Hash size={14} />
                  风险类型
                  {selectedRiskTypes.length > 0 && (
                    <span className="chip bg-info-100 text-info-700">{selectedRiskTypes.length}</span>
                  )}
                </span>
                {filterExpanded.riskType ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {filterExpanded.riskType && (
                <div className="flex flex-wrap gap-1.5">
                  {RISK_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => toggleRiskType(opt.value)}
                      className={cn(
                        'px-2.5 py-1 rounded text-xs font-medium transition-all border',
                        selectedRiskTypes.includes(opt.value)
                          ? 'bg-info-500 text-white border-info-500'
                          : 'bg-white text-primary-600 border-primary-200 hover:border-info-300 hover:text-info-600',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => setFilterExpanded((p) => ({ ...p, riskLevel: !p.riskLevel }))}
                className="w-full flex items-center justify-between text-sm font-medium text-primary-700 mb-2"
              >
                <span className="flex items-center gap-1.5">
                  <ShieldAlert size={14} />
                  风险等级
                  {selectedRiskLevels.length > 0 && (
                    <span className="chip bg-danger-100 text-danger-700">{selectedRiskLevels.length}</span>
                  )}
                </span>
                {filterExpanded.riskLevel ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {filterExpanded.riskLevel && (
                <div className="flex flex-wrap gap-1.5">
                  {RISK_LEVEL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => toggleRiskLevel(opt.value)}
                      className={cn(
                        'px-2.5 py-1 rounded text-xs font-medium transition-all border',
                        selectedRiskLevels.includes(opt.value)
                          ? opt.value === 'high'
                            ? 'bg-danger-500 text-white border-danger-500'
                            : opt.value === 'medium'
                            ? 'bg-warning-500 text-white border-warning-500'
                            : opt.value === 'low'
                            ? 'bg-info-500 text-white border-info-500'
                            : 'bg-success-500 text-white border-success-500'
                          : 'bg-white text-primary-600 border-primary-200 hover:border-primary-300',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => setFilterExpanded((p) => ({ ...p, timeRange: !p.timeRange }))}
                className="w-full flex items-center justify-between text-sm font-medium text-primary-700 mb-2"
              >
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  时间范围
                </span>
                {filterExpanded.timeRange ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {filterExpanded.timeRange && (
                <div className="flex flex-wrap gap-1.5">
                  {TIME_RANGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedTimeRange(opt.value)}
                      className={cn(
                        'px-2.5 py-1 rounded text-xs font-medium transition-all border',
                        selectedTimeRange === opt.value
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-primary-600 border-primary-200 hover:border-primary-300',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="risk-card overflow-hidden sticky top-4">
            <div className="px-4 py-3 border-b border-primary-100 bg-primary-50/50 flex items-center justify-between">
              <h3 className="font-semibold text-primary-800 flex items-center gap-2">
                <TrendingUp size={16} className="text-purple-500" />
                相似商品列表
              </h3>
              <span className="chip">{filteredProducts.length} 项</span>
            </div>
            <div className="p-3 space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin">
              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center text-primary-400">
                  <Search size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">暂无匹配的相似商品</p>
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const isSelected = selectedProductIds.includes(product.id);
                  const isDisabled = !isSelected && selectedProductIds.length >= 4;
                  return (
                    <div
                      key={product.id}
                      onClick={() => !isDisabled && toggleProductSelect(product.id)}
                      className={cn(
                        'relative p-3 rounded-lg border-2 cursor-pointer transition-all group',
                        isSelected
                          ? 'border-info-500 bg-info-50/50 shadow-sm'
                          : isDisabled
                          ? 'border-primary-100 bg-primary-50/50 opacity-60 cursor-not-allowed'
                          : 'border-primary-100 hover:border-primary-300 hover:shadow-sm bg-white',
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-info-500 text-white flex items-center justify-center text-xs font-bold z-10">
                          {selectedProductIds.indexOf(product.id) + 1}
                        </div>
                      )}
                      {isDisabled && (
                        <div className="absolute top-2 right-2 chip bg-primary-100 text-primary-600 z-10">
                          已达上限
                        </div>
                      )}
                      <div className="flex gap-3">
                        <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-primary-100">
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                          {product.sensitiveAreas.length > 0 && (
                            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-danger-500/90 text-white text-[10px] font-semibold">
                              {product.sensitiveAreas.length}处
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-primary-800 line-clamp-2 group-hover:text-info-700 transition-colors">
                            {product.title}
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {product.riskTypes.slice(0, 2).map((rt) => (
                              <span
                                key={rt}
                                className={cn(
                                  'risk-tag text-[10px] py-0',
                                  product.riskLevel === 'high'
                                    ? 'risk-tag-danger'
                                    : product.riskLevel === 'medium'
                                    ? 'risk-tag-warning'
                                    : 'risk-tag-info',
                                )}
                              >
                                {RISK_TYPE_MAP[rt]?.label || rt}
                              </span>
                            ))}
                            {product.riskTypes.length > 2 && (
                              <span className="risk-tag risk-tag-primary text-[10px] py-0">
                                +{product.riskTypes.length - 2}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <RiskBadge level={product.riskLevel} size="sm" showIcon={false} />
                            <span
                              className={cn(
                                'text-sm font-bold text-number',
                                product.similarity >= 90
                                  ? 'text-danger-600'
                                  : product.similarity >= 75
                                  ? 'text-warning-600'
                                  : 'text-info-600',
                              )}
                            >
                              {product.similarity}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-primary-100/50 flex items-center justify-between text-xs text-primary-500">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {product.sellerName}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailModal({ visible: true, productId: product.id });
                          }}
                          className="flex items-center gap-1 text-info-600 hover:text-info-700 font-medium"
                        >
                          <Eye size={12} />
                          详情
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          <div className="risk-card overflow-hidden">
            <div className="px-4 py-3 border-b border-primary-100 bg-primary-50/50 flex items-center justify-between">
              <h3 className="font-semibold text-primary-800 flex items-center gap-2">
                <GitCompare size={16} className="text-info-500" />
                对比分析视图
              </h3>
              <div className="flex items-center gap-1 bg-white rounded-lg border border-primary-200 p-1">
                {[
                  { key: 'image' as CompareTabKey, label: '图片对比', icon: ImageIcon },
                  { key: 'text' as CompareTabKey, label: '文本对比', icon: Type },
                  { key: 'risk' as CompareTabKey, label: '风险矩阵', icon: LayoutGrid },
                  { key: 'seller' as CompareTabKey, label: '卖家信用', icon: Users },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveCompareTab(tab.key)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5',
                      activeCompareTab === tab.key
                        ? 'bg-info-500 text-white shadow-sm'
                        : 'text-primary-600 hover:bg-primary-50',
                    )}
                  >
                    <tab.icon size={13} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-5">{renderCompareTab()}</div>
          </div>

          <div className="risk-card overflow-hidden">
            <div className="px-4 py-3 border-b border-primary-100 bg-primary-50/50">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="font-semibold text-primary-800 flex items-center gap-2">
                  <BookOpen size={16} className="text-warning-500" />
                  标准案例库
                </h3>
                <div className="flex items-center gap-1 bg-white rounded-lg border border-primary-200 p-1">
                  {CASE_TAB_OPTIONS.map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setActiveCaseTab(tab.value)}
                      className={cn(
                        'px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5',
                        activeCaseTab === tab.value
                          ? 'bg-warning-500 text-white shadow-sm'
                          : 'text-primary-600 hover:bg-primary-50',
                      )}
                    >
                      <tab.icon size={13} />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4">
              {filteredCases.length === 0 ? (
                <div className="py-12 text-center text-primary-400">
                  <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">该分类下暂无案例</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCases.map((caseItem) => (
                    <div
                      key={caseItem.id}
                      className="p-4 rounded-lg border border-primary-100 bg-white hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group"
                      onClick={() => setCaseDetailModal({ visible: true, caseId: caseItem.id })}
                    >
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-primary-100">
                          <img
                            src={caseItem.thumbnail}
                            alt={caseItem.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-primary-800 line-clamp-2 group-hover:text-info-700 transition-colors text-sm">
                              {caseItem.title}
                            </h4>
                            <RiskBadge level={caseItem.riskLevel} size="sm" showText={false} />
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {caseItem.keywords.slice(0, 4).map((kw) => (
                              <span key={kw} className="risk-tag risk-tag-warning text-[10px] py-0">
                                #{kw}
                              </span>
                            ))}
                          </div>
                          <div className="mt-2 flex items-center gap-2 text-xs">
                            <span className="flex items-center gap-1 text-primary-500">
                              <Gavel size={11} />
                              判定：
                            </span>
                            <span className="text-danger-600 font-medium line-clamp-1">
                              {caseItem.verdict}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-primary-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {caseItem.riskTypes.slice(0, 3).map((rt) => (
                            <span
                              key={rt}
                              className="risk-tag risk-tag-primary text-[10px] py-0"
                            >
                              {RISK_TYPE_MAP[rt]?.label || rt}
                            </span>
                          ))}
                        </div>
                        <button className="flex items-center gap-1 text-xs text-info-600 hover:text-info-700 font-medium">
                          查看详情
                          <ChevronDown size={12} className="-rotate-90" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {detailModal.visible && currentDetailProduct && (
        <div
          className="modal-overlay"
          onClick={() => setDetailModal({ visible: false, productId: null })}
        >
          <div
            className="modal-content max-w-2xl max-h-[85vh] flex flex-col animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-primary-100 flex items-center justify-between">
              <h3 className="font-semibold text-primary-800 flex items-center gap-2">
                <Eye size={18} className="text-info-500" />
                商品详情
              </h3>
              <button
                onClick={() => setDetailModal({ visible: false, productId: null })}
                className="p-1.5 rounded-md hover:bg-primary-100 text-primary-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-primary-700 mb-2">商品标题</h4>
                <HighlightText
                  text={currentDetailProduct.title}
                  words={currentDetailProduct.highlightWords.map((w) => ({
                    word: w.word,
                    level: w.level,
                  }))}
                  size="base"
                  className="p-3 bg-primary-50 rounded-lg block"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-primary-700 mb-2">商品图片</h4>
                  <ImageMarker
                    src={currentDetailProduct.images[0]}
                    alt={currentDetailProduct.title}
                    sensitiveAreas={currentDetailProduct.sensitiveAreas}
                    maxHeight="220px"
                  />
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-primary-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-primary-500">风险等级</span>
                      <RiskBadge level={currentDetailProduct.riskLevel} />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-primary-500">相似度</span>
                      <span className="text-sm font-bold text-danger-600">
                        {currentDetailProduct.similarity}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-primary-500">价格</span>
                      <span className="text-sm font-bold text-primary-700">
                        ¥{currentDetailProduct.price}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary-500">类目</span>
                      <span className="text-sm text-primary-700">{currentDetailProduct.category}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-primary-50 rounded-lg">
                    <h5 className="text-xs font-semibold text-primary-600 mb-2">卖家信息</h5>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-primary-500">卖家</span>
                      <span className="text-sm text-primary-700">{currentDetailProduct.sellerName}</span>
                    </div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-primary-500">信用分</span>
                      <span className="text-sm font-medium text-warning-600">
                        {currentDetailProduct.sellerCredit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-primary-500">历史违规</span>
                      <span className="text-sm font-medium text-danger-600">
                        {currentDetailProduct.sellerViolations} 次
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-primary-700 mb-2">命中风险类型</h4>
                <div className="flex flex-wrap gap-2">
                  {currentDetailProduct.riskTypes.map((rt) => (
                    <span key={rt} className="risk-tag risk-tag-danger">
                      {RISK_TYPE_MAP[rt]?.label || rt}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-primary-700 mb-2">商品描述</h4>
                <HighlightText
                  text={currentDetailProduct.description}
                  words={currentDetailProduct.highlightWords.map((w) => ({
                    word: w.word,
                    level: w.level,
                  }))}
                  size="base"
                  className="p-3 bg-primary-50 rounded-lg block leading-relaxed"
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-primary-100 flex justify-end gap-2">
              <button
                onClick={() => {
                  toggleProductSelect(currentDetailProduct.id);
                  setDetailModal({ visible: false, productId: null });
                }}
                className={cn(
                  'btn-primary text-sm',
                  selectedProductIds.includes(currentDetailProduct.id) && 'btn-outline',
                )}
              >
                {selectedProductIds.includes(currentDetailProduct.id) ? (
                  <>
                    <X size={14} />
                    取消对比
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    加入对比
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {caseDetailModal.visible && currentDetailCase && (
        <div
          className="modal-overlay"
          onClick={() => setCaseDetailModal({ visible: false, caseId: null })}
        >
          <div
            className="modal-content max-w-3xl max-h-[85vh] flex flex-col animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-primary-100 flex items-center justify-between">
              <h3 className="font-semibold text-primary-800 flex items-center gap-2">
                <Gavel size={18} className="text-warning-500" />
                {currentDetailCase.title}
              </h3>
              <button
                onClick={() => setCaseDetailModal({ visible: false, caseId: null })}
                className="p-1.5 rounded-md hover:bg-primary-100 text-primary-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              <div className="flex items-center gap-3 flex-wrap">
                <RiskBadge level={currentDetailCase.riskLevel} />
                {currentDetailCase.riskTypes.map((rt) => (
                  <span key={rt} className="risk-tag risk-tag-info">
                    {RISK_TYPE_MAP[rt]?.label || rt}
                  </span>
                ))}
                <div className="chip bg-warning-50 text-warning-700">
                  {currentDetailCase.caseType === 'typical'
                    ? '典型案例'
                    : currentDetailCase.caseType === 'boundary'
                    ? '边界案例'
                    : '政策参考'}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-danger-50 border border-danger-100">
                <h4 className="text-sm font-semibold text-danger-700 mb-2 flex items-center gap-1.5">
                  <ShieldAlert size={15} />
                  标准处置结果
                </h4>
                <p className="text-danger-800 font-medium">{currentDetailCase.verdict}</p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-primary-700 mb-3 flex items-center gap-1.5">
                  <FileText size={15} />
                  判定依据
                </h4>
                <div className="space-y-2">
                  {currentDetailCase.verdictBasis.map((basis, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 p-3 rounded-lg bg-primary-50 border border-primary-100"
                    >
                      <div className="w-5 h-5 rounded-full bg-info-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-primary-700">{basis}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-primary-700 mb-3 flex items-center gap-1.5">
                  <TrendingUp size={15} />
                  近5日历史处理结果参考
                </h4>
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>日期</th>
                        <th>处置方式</th>
                        <th>处理数量</th>
                        <th>占比</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentDetailCase.historyResults.map((item, idx) => {
                        const total = currentDetailCase.historyResults.reduce(
                          (sum, r) => sum + r.count,
                          0,
                        );
                        const pct = ((item.count / total) * 100).toFixed(1);
                        return (
                          <tr key={idx}>
                            <td>{item.date}</td>
                            <td>
                              <span className="risk-tag risk-tag-warning">{item.action}</span>
                            </td>
                            <td className="font-semibold text-primary-700 text-number">{item.count}</td>
                            <td>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-primary-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-info-500 rounded-full"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-xs text-primary-600 text-number w-12">
                                  {pct}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-primary-700 mb-3 flex items-center gap-1.5">
                  <Hash size={15} />
                  相关关键词
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentDetailCase.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="px-3 py-1.5 rounded-lg bg-warning-50 text-warning-700 border border-warning-200 text-sm font-medium"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-primary-100 flex justify-end gap-2">
              <button
                onClick={() => setCaseDetailModal({ visible: false, caseId: null })}
                className="btn-outline text-sm"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
