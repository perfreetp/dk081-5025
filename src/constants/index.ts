import type {
  RiskLevel,
  RiskType,
  ProductStatus,
  PunishmentLevel,
  UserRole,
  ReviewTemplate,
  Announcement,
} from '../types';

export interface CategoryOption {
  id: string;
  name: string;
  children?: CategoryOption[];
}

export interface RiskLevelConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  scoreRange: [number, number];
  description: string;
}

export interface RiskTypeConfig {
  label: string;
  icon: string;
  description: string;
  defaultLevel: RiskLevel;
}

export interface ProductStatusConfig {
  label: string;
  color: string;
  bgColor: string;
}

export interface PunishmentLevelConfig {
  label: string;
  color: string;
  bgColor: string;
  severity: number;
  description: string;
}

export interface UserRoleConfig {
  label: string;
  description: string;
  permissions: string[];
}

export const CATEGORIES: CategoryOption[] = [
  {
    id: 'digital',
    name: '数码产品',
    children: [
      { id: 'digital-phone', name: '手机通讯' },
      { id: 'digital-computer', name: '电脑办公' },
      { id: 'digital-camera', name: '相机摄影' },
      { id: 'digital-audio', name: '影音娱乐' },
      { id: 'digital-game', name: '游戏设备' },
    ],
  },
  {
    id: 'appliance',
    name: '家用电器',
    children: [
      { id: 'appliance-large', name: '大家电' },
      { id: 'appliance-small', name: '生活电器' },
      { id: 'appliance-kitchen', name: '厨房电器' },
    ],
  },
  {
    id: 'clothing',
    name: '服饰鞋包',
    children: [
      { id: 'clothing-men', name: '男装' },
      { id: 'clothing-women', name: '女装' },
      { id: 'clothing-shoes', name: '鞋靴' },
      { id: 'clothing-bag', name: '箱包' },
      { id: 'clothing-watch', name: '珠宝钟表' },
    ],
  },
  {
    id: 'beauty',
    name: '美妆个护',
    children: [
      { id: 'beauty-skin', name: '护肤' },
      { id: 'beauty-makeup', name: '彩妆' },
      { id: 'beauty-personal', name: '个护健康' },
      { id: 'beauty-perfume', name: '香水' },
    ],
  },
  {
    id: 'baby',
    name: '母婴玩具',
    children: [
      { id: 'baby-milk', name: '奶粉辅食' },
      { id: 'baby-diaper', name: '尿裤湿巾' },
      { id: 'baby-cloth', name: '童装童鞋' },
      { id: 'baby-toy', name: '玩具' },
    ],
  },
  {
    id: 'sports',
    name: '运动户外',
    children: [
      { id: 'sports-fit', name: '健身训练' },
      { id: 'sports-outdoor', name: '户外装备' },
      { id: 'sports-bike', name: '骑行运动' },
    ],
  },
  {
    id: 'book',
    name: '图书文娱',
    children: [
      { id: 'book-text', name: '图书' },
      { id: 'book-stationery', name: '文具' },
      { id: 'book-music', name: '音乐影视' },
    ],
  },
  {
    id: 'home',
    name: '家居生活',
    children: [
      { id: 'home-furniture', name: '家具' },
      { id: 'home-decor', name: '家饰家纺' },
      { id: 'home-kitchen', name: '厨具餐具' },
    ],
  },
  {
    id: 'car',
    name: '汽车用品',
    children: [
      { id: 'car-decor', name: '车载电器' },
      { id: 'car-maintain', name: '维修保养' },
      { id: 'car-safety', name: '安全自驾' },
    ],
  },
  {
    id: 'other',
    name: '其他类目',
    children: [
      { id: 'other-food', name: '食品生鲜' },
      { id: 'other-industrial', name: '工业品' },
      { id: 'other-service', name: '生活服务' },
    ],
  },
];

export const RISK_LEVEL_MAP: Record<RiskLevel, RiskLevelConfig> = {
  high: {
    label: '高风险',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    borderColor: '#FECACA',
    dotColor: '#EF4444',
    scoreRange: [80, 100],
    description: '明确违禁内容，需立即处置',
  },
  medium: {
    label: '中风险',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
    dotColor: '#F59E0B',
    scoreRange: [50, 79],
    description: '疑似擦边内容，需人工复核',
  },
  low: {
    label: '低风险',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    dotColor: '#3B82F6',
    scoreRange: [20, 49],
    description: '轻微异常，建议关注',
  },
  safe: {
    label: '安全',
    color: '#10B981',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    dotColor: '#10B981',
    scoreRange: [0, 19],
    description: '内容合规，正常放行',
  },
};

export const RISK_TYPE_MAP: Record<RiskType, RiskTypeConfig> = {
  keyword: {
    label: '关键词命中',
    icon: 'AlertTriangle',
    description: '标题或描述中检测到风险关键词',
    defaultLevel: 'medium',
  },
  image: {
    label: '图片违规',
    icon: 'ImageOff',
    description: '商品图片中检测到敏感区域或违规内容',
    defaultLevel: 'high',
  },
  category_mismatch: {
    label: '类目错放',
    icon: 'FolderX',
    description: '商品实际内容与所选类目不匹配',
    defaultLevel: 'low',
  },
  price_abnormal: {
    label: '价格异常',
    icon: 'TrendingDown',
    description: '商品价格明显偏离正常市场区间',
    defaultLevel: 'low',
  },
  evasion: {
    label: '规避检测',
    icon: 'EyeOff',
    description: '疑似使用变体词、谐音、特殊符号等方式规避检测',
    defaultLevel: 'high',
  },
  history: {
    label: '历史违规',
    icon: 'History',
    description: '卖家存在历史违规记录，需重点关注',
    defaultLevel: 'medium',
  },
  similar: {
    label: '相似案例',
    icon: 'Copy',
    description: '与历史违规商品高度相似',
    defaultLevel: 'medium',
  },
};

export const PRODUCT_STATUS_MAP: Record<ProductStatus, ProductStatusConfig> = {
  pending: {
    label: '待审核',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
  },
  approved: {
    label: '已通过',
    color: '#10B981',
    bgColor: '#ECFDF5',
  },
  rejected: {
    label: '已打回',
    color: '#6B7280',
    bgColor: '#F3F4F6',
  },
  banned: {
    label: '已封禁',
    color: '#EF4444',
    bgColor: '#FEF2F2',
  },
  appealed: {
    label: '申诉中',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
  },
};

export const PUNISHMENT_LEVEL_MAP: Record<PunishmentLevel, PunishmentLevelConfig> = {
  warning: {
    label: '警告提醒',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    severity: 1,
    description: '发送警告通知，不影响商品展示',
  },
  delist: {
    label: '商品下架',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    severity: 2,
    description: '将商品从展示列表移除，卖家可修改后重新上架',
  },
  restrict: {
    label: '限流降权',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    severity: 3,
    description: '限制商品曝光量和搜索排名',
  },
  ban_product: {
    label: '封禁商品',
    color: '#EF4444',
    bgColor: '#FEF2F2',
    severity: 4,
    description: '永久封禁商品，不可重新上架',
  },
  ban_seller: {
    label: '封禁卖家',
    color: '#991B1B',
    bgColor: '#FEF2F2',
    severity: 5,
    description: '封禁卖家账号，限制发布权限',
  },
};

export const USER_ROLE_MAP: Record<UserRole, UserRoleConfig> = {
  reviewer: {
    label: '审核专员',
    description: '负责日常商品审核工作',
    permissions: ['queue:view', 'queue:review', 'compare:view', 'punishment:view'],
  },
  analyst: {
    label: '策略分析师',
    description: '负责风控策略配置和数据分析',
    permissions: [
      'queue:view',
      'queue:review',
      'compare:view',
      'punishment:view',
      'dashboard:view',
      'rules:manage',
      'review:view',
    ],
  },
  supervisor: {
    label: '运营主管',
    description: '负责处罚审批和团队管理',
    permissions: [
      'queue:view',
      'queue:review',
      'compare:view',
      'punishment:view',
      'punishment:approve',
      'dashboard:view',
      'rules:manage',
      'review:view',
      'review:manage',
      'announcement:publish',
    ],
  },
  admin: {
    label: '系统管理员',
    description: '拥有系统所有权限',
    permissions: ['*'],
  },
};

export const REVIEW_TEMPLATES: ReviewTemplate[] = [
  {
    id: 'tpl-001',
    name: '违禁品通用打回',
    content:
      '您好，您发布的商品涉嫌违反平台《禁止发布信息规则》，请您仔细核对商品信息，确保不包含违禁内容后重新发布。如有疑问，请联系客服咨询。',
    level: 'delist',
    category: '通用',
    useCount: 328,
  },
  {
    id: 'tpl-002',
    name: '图片违规警告',
    content:
      '您好，检测到您的商品图片存在敏感内容或违规信息，请您更换合规的商品图片。如多次违规，将采取更严厉的处罚措施。',
    level: 'warning',
    category: '图片',
    useCount: 156,
  },
  {
    id: 'tpl-003',
    name: '类目错放提醒',
    content:
      '您好，您的商品类目选择有误，请将商品重新发布至正确类目。正确的类目选择有助于提高商品曝光量和成交率。',
    level: 'warning',
    category: '类目',
    useCount: 89,
  },
  {
    id: 'tpl-004',
    name: '价格异常说明',
    content:
      '您好，您的商品价格明显偏离市场正常水平，请核实商品价格是否准确。如为引流价格，建议调整至合理区间。',
    level: 'warning',
    category: '价格',
    useCount: 67,
  },
  {
    id: 'tpl-005',
    name: '关键词违规下架',
    content:
      '您好，您的商品标题或描述中包含违规关键词，已作下架处理。请删除敏感词汇后重新发布。违规词库参考：《平台敏感词规范》。',
    level: 'delist',
    category: '关键词',
    useCount: 234,
  },
  {
    id: 'tpl-006',
    name: '规避检测封禁商品',
    content:
      '您好，检测到您通过变体词、特殊符号等方式刻意规避平台检测，该商品已被永久封禁。请严格遵守平台规则，规范发布行为。',
    level: 'ban_product',
    category: '严重违规',
    useCount: 45,
  },
  {
    id: 'tpl-007',
    name: '历史违规加重处罚',
    content:
      '您好，鉴于您近期多次违规发布商品，平台将对您采取限流降权措施。请您认真学习平台规则，规范发布行为，以免影响您的账号信用。',
    level: 'restrict',
    category: '严重违规',
    useCount: 23,
  },
  {
    id: 'tpl-008',
    name: '假货高仿封禁卖家',
    content:
      '您好，经核实，您发布的商品为假冒伪劣商品或高仿产品，严重违反平台规则。平台已对您的账号进行封禁处理，如有异议可在5个工作日内提起申诉。',
    level: 'ban_seller',
    category: '严重违规',
    useCount: 12,
  },
];

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-001',
    title: '关于加强奢侈品类目审核的通知',
    content:
      '各位同事：\n近期平台发现奢侈品类目下高仿、假货商品数量呈上升趋势。自即日起，奢侈品类目（钟表、箱包、珠宝）所有商品均需进入人工复核，且高价值商品（单价≥5000元）需由二级审核人员确认后方可放行。\n审核要点：\n1. 品牌logo清晰度检查\n2. 价格与市场行情对比\n3. 卖家资质与历史记录\n4. 图片来源可信度评估\n如有疑问，请及时联系风控组张主管。',
    type: 'policy',
    priority: 'urgent',
    authorId: 'u-001',
    authorName: '运营部-张主管',
    publishTime: '2026-06-16 09:30:00',
    readCount: 86,
  },
  {
    id: 'ann-002',
    title: '典型案例分享："内部渠道"变体词识别',
    content:
      '案例背景：\n近期系统拦截一批使用"内部渠道""海关罚没""原厂尾单"等变体词进行引流的违规商品。这些商品多集中在数码产品和美妆类目，实际销售的多为高仿或翻新商品。\n\n识别要点：\n1. 关键词变体：内部渠_道、海関罚没、原/厂尾单等符号分割\n2. 图片特征：背景模糊、遮挡品牌标识、使用实拍图非官方图\n3. 价格特征：低于市场价30%以上\n4. 卖家特征：新注册账号、信用等级低、历史违规\n\n处置建议：\n- 明确使用以上关键词的商品，直接封禁\n- 疑似情况，进入人工复核并比对相似案例\n请各位审核同事在日常工作中重点关注以上特征。',
    type: 'case',
    priority: 'important',
    authorId: 'u-002',
    authorName: '策略组-李分析师',
    publishTime: '2026-06-15 14:20:00',
    readCount: 72,
  },
  {
    id: 'ann-003',
    title: '618大促期间审核排班安排',
    content:
      '各位同事：\n618大促期间（6月17日-6月20日），商品发布量预计为日常的2.5倍，为保障审核时效，现做排班安排如下：\n\n第一班次：08:00-16:00（全员在岗）\n第二班次：14:00-22:00（值班人员：王XX、赵XX、陈XX）\n第三班次：22:00-次日08:00（值班人员：周XX、吴XX）\n\n期间审核标准：\n- 待审队列SLA：高风险≤30分钟，中风险≤2小时，低风险≤8小时\n- 大促期间新增"价格异常-虚标引流"专项审核\n- 发现异常刷单行为，及时上报风控组\n请各位同事按时到岗，确保大促期间审核工作顺利完成。',
    type: 'notice',
    priority: 'important',
    authorId: 'u-003',
    authorName: '人事组-刘主管',
    publishTime: '2026-06-14 10:00:00',
    readCount: 95,
  },
  {
    id: 'ann-004',
    title: '新版风险词库V2.3上线公告',
    content:
      '各位同事：\n新版风险词库V2.3已于今日凌晨完成升级，主要更新内容：\n\n1. 新增美妆类违禁词 128个（医美功效类、违禁成分类）\n2. 新增食品类敏感词 86个（保健功效、疾病治疗类）\n3. 优化变体词匹配算法，识别准确率提升15%\n4. 新增"白名单词"机制，减少误判\n\n注意事项：\n- 新旧词库切换期间可能出现少量审核结果波动\n- 如发现误判情况，请及时在系统中标记"误判"并反馈至策略组\n- 完整词库文档已共享至知识库，可自行查阅\n如有问题，联系策略组。',
    type: 'policy',
    priority: 'normal',
    authorId: 'u-002',
    authorName: '策略组-李分析师',
    publishTime: '2026-06-13 16:45:00',
    readCount: 68,
  },
  {
    id: 'ann-005',
    title: '关于申诉流程优化的通知',
    content:
      '为提高申诉处理效率，保障卖家权益，自6月20日起，申诉流程优化如下：\n\n原流程：卖家申诉 → 运营主管审核 → 风控组复核 → 执行结果（预计48小时）\n新流程：卖家申诉 → 系统自动校验 → 审核专员初审 → 主管终审 → 执行结果（预计24小时）\n\n优化点：\n1. 新增系统自动校验环节，对明显申诉理由不成立的直接驳回\n2. 申诉材料要求标准化，减少补充沟通时间\n3. 引入申诉SLA考核，超时自动升级\n申诉审核权限已同步调整，请相关同事知悉并按新流程执行。',
    type: 'notice',
    priority: 'normal',
    authorId: 'u-001',
    authorName: '运营部-张主管',
    publishTime: '2026-06-12 11:30:00',
    readCount: 54,
  },
  {
    id: 'ann-006',
    title: '典型案例分享：二手手机翻新机识别技巧',
    content:
      '近期接到多起买家投诉，反映在平台购买的"二手95新"手机实际为翻新机。现将识别技巧分享如下：\n\n一、标题关键词识别\n- 警惕"准新机""展示机""官换机""资源机"等模糊表述\n- 正品二手机通常会明确说明"使用时长""保修状态"\n\n二、图片特征识别\n- 翻新机图片通常背景单一、光线过度处理\n- 原装二手机多为实拍，包含细节瑕疵\n- 注意机身编码、序列号是否被遮挡/打码\n\n三、价格特征识别\n- 同款机型价格低于均价20%以上需重点关注\n- 低内存版本报高内存版本价格\n\n四、卖家特征识别\n- 短时间内上架大量同型号手机\n- 卖家信用等级低但成交量大\n以上特征命中2项以上的商品，建议进入深度复核。',
    type: 'case',
    priority: 'normal',
    authorId: 'u-004',
    authorName: '审核组-王专员',
    publishTime: '2026-06-10 15:10:00',
    readCount: 81,
  },
];

export const TIME_RANGES = [
  { label: '今天', value: 'today' },
  { label: '昨天', value: 'yesterday' },
  { label: '近7天', value: '7days' },
  { label: '近30天', value: '30days' },
  { label: '自定义', value: 'custom' },
];

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export const DEFAULT_PAGE_SIZE = 20;
