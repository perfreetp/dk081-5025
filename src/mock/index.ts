export type RiskLevel = 'high' | 'medium' | 'low';
export type RiskType = 'prohibited_words' | 'sensitive_image' | 'price_anomaly' | 'category_mismatch' | 'suspicious_seller' | 'contact_info' | 'copyright' | 'weapon_drug';
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'banned';
export type PunishmentType = 'warning' | 'delist' | 'restriction' | 'ban_account' | 'fine';
export type AppealStatus = 'pending' | 'approved' | 'rejected';

export interface SensitiveArea {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
}

export interface SellerInfo {
  id: string;
  name: string;
  avatar: string;
  creditScore: number;
  violationCount: number;
  registerDate: string;
  phone: string;
}

export interface PendingProduct {
  id: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  originalPrice?: number;
  category: string;
  riskLevel: RiskLevel;
  riskTypes: RiskType[];
  riskScore: number;
  sensitiveAreas: SensitiveArea[];
  highlightWords: { word: string; position: number }[];
  seller: SellerInfo;
  publishTime: string;
  priority: number;
  reviewStatus: ReviewStatus;
}

export interface RiskWord {
  id: string;
  word: string;
  category: string;
  level: RiskLevel;
  hitCount: number;
  enabled: boolean;
  createTime: string;
  updateTime: string;
  operator: string;
}

export interface OperationLog {
  id: string;
  action: 'create' | 'revoke' | 'extend' | 'appeal_submit' | 'appeal_approve' | 'appeal_reject';
  operator: string;
  operatorRole?: string;
  time: string;
  comment?: string;
  extra?: Record<string, any>;
}

export interface PunishmentRecord {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  sellerId: string;
  sellerName: string;
  punishmentType: PunishmentType;
  punishmentReason: string;
  riskTypes: RiskType[];
  operator: string;
  createTime: string;
  effectiveDays: number;
  status: 'active' | 'expired' | 'revoked';
  appealAvailable: boolean;
  operationLogs: OperationLog[];
}

export interface AppealRecord {
  id: string;
  punishmentId: string;
  productId: string;
  productTitle: string;
  productImage: string;
  sellerId: string;
  sellerName: string;
  sellerContact: string;
  appealReason: string;
  appealEvidence: string[];
  appealTime: string;
  status: AppealStatus;
  reviewer?: string;
  reviewTime?: string;
  reviewComment?: string;
}

export interface DisposalTimelineEvent {
  id: string;
  sourceType: 'review' | 'punishment' | 'appeal';
  actionType: string;
  productId: string;
  productTitle?: string;
  punishmentId?: string;
  appealId?: string;
  operator: string;
  operatorRole?: string;
  time: string;
  comment?: string;
  extra?: Record<string, any>;
}

export interface TrendDataPoint {
  date: string;
  totalReviews: number;
  approvedCount: number;
  rejectedCount: number;
  bannedCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

export interface CategoryRiskItem {
  category: string;
  totalCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  riskRate: number;
}

export interface TeamPerformance {
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  totalReviews: number;
  approvedCount: number;
  rejectedCount: number;
  bannedCount: number;
  avgReviewTime: number;
  accuracy: number;
  dailyTarget: number;
  completedToday: number;
}

export interface TopKeyword {
  keyword: string;
  hitCount: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  level: RiskLevel;
}

const categories = [
  '数码3C', '服装鞋包', '家居家具', '美妆护肤', '母婴用品',
  '运动户外', '图书音像', '食品保健', '汽车用品', '珠宝首饰'
];

const riskWordCategories = [
  '违禁品词', '敏感词', '引流词', '假冒词', '医疗词', '政治敏感', '色情低俗', '联系方式'
];

const productTitles = [
  '全新苹果iPhone 15 Pro Max 256G 钛金属 未拆封 低价转让',
  '【加v看货】高端奢侈品女包 原版1:1复刻 原厂皮料',
  '个人闲置索尼A7M4相机 快门500次 送大三元镜头',
  '【私聊优惠】品牌运动鞋 工厂尾单 支持专柜验货',
  '原装进口保健品 增强免疫 治疗糖尿病高血压',
  '二手戴森吹风机HD15 九成新 配件齐全 低价出',
  '【加微信选款】专柜同款女装 原单尾货 一件代发',
  '限量版AJ1高帮篮球鞋 全新带盒 识货得物验证',
  '华为Mate60 Pro 512G 雅川青 激活三天 保修一年',
  '【特殊渠道】大牌护肤品套装 内部员工价 不对外',
  '大疆Mini4 Pro无人机 畅飞套装 飞行时间5小时',
  '【看简介】欧美大牌香水 渠道货 支持扫码验货',
  'LV老花邮差包 99新 专柜购入 有小票 可验货',
  '儿童益智玩具 智能早教机器人 包邮送课程',
  '【加qq详聊】二手笔记本电脑 i9处理器 显卡4090'
];

const productDescriptions = [
  '个人闲置转让，99新，包装盒配件齐全，无划痕，当面验货，外地顺丰到付，非诚勿扰。加v看更多实拍图和视频，微信号看主页简介。',
  '工厂尾单处理，数量有限，先到先得。支持七天无理由退换，保证品质，如假包退。私聊获取更多优惠信息和款式。',
  '正品保证，支持任何方式验货，假一赔十。因个人原因低价转让，有缘人带走。可以小刀，屠龙刀勿扰。',
  '自用物品，保养很好，无任何质量问题。因搬家带不走，低价处理。欢迎当面自提，也可以邮寄。',
  '渠道货源，价格优势明显。量大从优，支持批量拿货。长期合作客户有优惠，欢迎微商代理加盟。'
];

const operatorNames = ['张伟', '李娜', '王芳', '刘强', '陈静', '杨帆', '赵敏', '黄磊', '周杰', '吴婷'];
const sellerNames = ['数码达人小王', '奢侈品鉴定师', '摄影爱好者阿明', '运动装备控', '美妆博主Lily',
  '母婴用品店主', '户外背包客', '图书收藏家', '二手车贩子小李', '珠宝爱好者张姐',
  '二手玩家9527', '个人卖家小雅', '工厂尾单王', '微商货源总代', '闲置物品处理'];

const punishmentReasons = [
  '涉嫌发布假冒伪劣商品，侵犯知识产权',
  '商品描述中包含违规引流联系方式',
  '商品图片包含敏感低俗内容',
  '发布违禁品/管制类商品信息',
  '价格异常偏低，涉嫌欺诈交易',
  '商品类目错放，恶意规避审核',
  '卖家存在多次违规记录，从严处理',
  '商品描述涉及虚假宣传/夸大功效'
];

const appealReasons = [
  '商品为个人正规渠道购入，有发票和购物凭证，并非假冒商品',
  '图片是正常商品展示，没有低俗敏感内容，属于误判',
  '描述中的联系方式是便于买家沟通，并非恶意引流',
  '价格低是因为个人闲置急于出手，不存在欺诈行为',
  '商品类目选择正确，审核标准存在歧义',
  '商品为正规授权产品，有品牌方授权书可提供'
];

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function generateDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(randomInt(0, 23), randomInt(0, 59), randomInt(0, 59));
  return date.toISOString().replace('T', ' ').slice(0, 19);
}

function generatePhone(): string {
  return `1${randomInt(3, 9)}${randomInt(1000, 9999)}${randomInt(1000, 9999)}`;
}

const riskWordsList = [
  { word: '复刻', category: '假冒词', level: 'high' as RiskLevel },
  { word: '高仿', category: '假冒词', level: 'high' as RiskLevel },
  { word: '原单', category: '假冒词', level: 'medium' as RiskLevel },
  { word: '尾单', category: '假冒词', level: 'medium' as RiskLevel },
  { word: '1:1', category: '假冒词', level: 'high' as RiskLevel },
  { word: '渠道货', category: '假冒词', level: 'medium' as RiskLevel },
  { word: '加微信', category: '联系方式', level: 'high' as RiskLevel },
  { word: '加v', category: '联系方式', level: 'high' as RiskLevel },
  { word: '私聊', category: '联系方式', level: 'medium' as RiskLevel },
  { word: '看简介', category: '联系方式', level: 'medium' as RiskLevel },
  { word: '加qq', category: '联系方式', level: 'high' as RiskLevel },
  { word: '微信号', category: '联系方式', level: 'high' as RiskLevel },
  { word: '包治百病', category: '医疗词', level: 'high' as RiskLevel },
  { word: '治疗', category: '医疗词', level: 'high' as RiskLevel },
  { word: '特效', category: '医疗词', level: 'high' as RiskLevel },
  { word: '根治', category: '医疗词', level: 'high' as RiskLevel },
  { word: '壮阳', category: '色情低俗', level: 'high' as RiskLevel },
  { word: '情趣', category: '色情低俗', level: 'medium' as RiskLevel },
  { word: '原味', category: '色情低俗', level: 'high' as RiskLevel },
  { word: '迷药', category: '违禁品词', level: 'high' as RiskLevel },
  { word: '催情', category: '违禁品词', level: 'high' as RiskLevel },
  { word: '枪支', category: '违禁品词', level: 'high' as RiskLevel },
  { word: '管制刀具', category: '违禁品词', level: 'high' as RiskLevel },
  { word: '毒品', category: '违禁品词', level: 'high' as RiskLevel },
  { word: '假币', category: '违禁品词', level: 'high' as RiskLevel },
  { word: '发票', category: '敏感词', level: 'medium' as RiskLevel },
  { word: '代开', category: '敏感词', level: 'high' as RiskLevel },
  { word: '套现', category: '敏感词', level: 'high' as RiskLevel },
  { word: '刷单', category: '敏感词', level: 'high' as RiskLevel },
  { word: '走私', category: '敏感词', level: 'high' as RiskLevel }
];

const sensitiveLabels = ['疑似logo侵权', '敏感文字区域', '低俗暴露区域', '疑似违禁品', '二维码/联系方式'];

function generateSensitiveAreas(count: number): SensitiveArea[] {
  const areas: SensitiveArea[] = [];
  for (let i = 0; i < count; i++) {
    areas.push({
      x: randomInt(5, 80),
      y: randomInt(5, 80),
      width: randomInt(10, 40),
      height: randomInt(10, 40),
      label: randomPick(sensitiveLabels),
      confidence: randomFloat(0.75, 0.99)
    });
  }
  return areas;
}

export const pendingProducts: PendingProduct[] = productTitles.map((title, index) => {
  const riskLevelRandom = Math.random();
  let riskLevel: RiskLevel;
  if (riskLevelRandom < 0.3) riskLevel = 'high';
  else if (riskLevelRandom < 0.7) riskLevel = 'medium';
  else riskLevel = 'low';

  const allRiskTypes: RiskType[] = ['prohibited_words', 'sensitive_image', 'price_anomaly', 'category_mismatch', 'suspicious_seller', 'contact_info', 'copyright', 'weapon_drug'];
  const riskTypeCount = randomInt(1, 3);
  const riskTypes: RiskType[] = [];
  const shuffled = [...allRiskTypes].sort(() => Math.random() - 0.5);
  for (let i = 0; i < riskTypeCount; i++) {
    riskTypes.push(shuffled[i]);
  }

  const price = randomFloat(50, 9999);
  const hasOriginal = Math.random() > 0.5;

  const imageCount = randomInt(2, 5);
  const images: string[] = [];
  for (let i = 0; i < imageCount; i++) {
    images.push(`https://picsum.photos/seed/product${index}${i}/600/600`);
  }

  const sensitiveCount = riskLevel === 'high' ? randomInt(2, 4) : riskLevel === 'medium' ? randomInt(1, 2) : 0;
  const sensitiveAreas = generateSensitiveAreas(sensitiveCount);

  const matchedWords = riskWordsList.filter(() => Math.random() > 0.6).slice(0, randomInt(2, 5));
  const highlightWords = matchedWords.map(w => ({
    word: w.word,
    position: randomInt(0, title.length - w.word.length)
  }));

  const sellerViolationCount = riskLevel === 'high' ? randomInt(3, 8) : riskLevel === 'medium' ? randomInt(1, 3) : randomInt(0, 1);

  return {
    id: generateId('PDT'),
    title,
    description: productDescriptions[index % productDescriptions.length],
    images,
    price,
    originalPrice: hasOriginal ? parseFloat((price * randomFloat(1.3, 2.5)).toFixed(2)) : undefined,
    category: randomPick(categories),
    riskLevel,
    riskTypes,
    riskScore: riskLevel === 'high' ? randomFloat(80, 99) : riskLevel === 'medium' ? randomFloat(50, 79) : randomFloat(20, 49),
    sensitiveAreas,
    highlightWords,
    seller: {
      id: generateId('USR'),
      name: sellerNames[index % sellerNames.length],
      avatar: `https://picsum.photos/seed/seller${index}/100/100`,
      creditScore: sellerViolationCount > 4 ? randomInt(30, 60) : sellerViolationCount > 1 ? randomInt(60, 85) : randomInt(85, 98),
      violationCount: sellerViolationCount,
      registerDate: generateDate(randomInt(30, 720)),
      phone: generatePhone()
    },
    publishTime: generateDate(randomInt(0, 5)),
    priority: riskLevel === 'high' ? randomInt(80, 100) : riskLevel === 'medium' ? randomInt(40, 79) : randomInt(1, 39),
    reviewStatus: 'pending'
  };
});

export const riskWords: RiskWord[] = riskWordsList.map((item, index) => ({
  id: generateId('W'),
  word: item.word,
  category: item.category,
  level: item.level,
  hitCount: item.level === 'high' ? randomInt(500, 3000) : item.level === 'medium' ? randomInt(100, 1000) : randomInt(10, 200),
  enabled: Math.random() > 0.1,
  createTime: generateDate(randomInt(50, 200)),
  updateTime: generateDate(randomInt(0, 30)),
  operator: randomPick(operatorNames)
}));

export const punishmentRecords: PunishmentRecord[] = Array.from({ length: 20 }, (_, index) => {
  const types: PunishmentType[] = ['warning', 'delist', 'restriction', 'ban_account', 'fine'];
  const type = randomPick(types);
  const statusRandom = Math.random();
  let status: 'active' | 'expired' | 'revoked';
  if (statusRandom < 0.6) status = 'active';
  else if (statusRandom < 0.9) status = 'expired';
  else status = 'revoked';

  const recordOperator = randomPick(operatorNames);
  const recordCreateTime = generateDate(randomInt(0, 30));
  const recordId = generateId('PUN');

  const operationLogs: OperationLog[] = [
    {
      id: generateId('LOG'),
      action: 'create',
      operator: recordOperator,
      operatorRole: '审核员',
      time: recordCreateTime,
      comment: `创建处罚记录，执行${type === 'warning' ? '警告' : type === 'delist' ? '下架商品' : type === 'restriction' ? '限制发布' : type === 'ban_account' ? '封禁账号' : '罚款'}操作`
    }
  ];

  if (status === 'revoked') {
    operationLogs.push({
      id: generateId('LOG'),
      action: 'revoke',
      operator: randomPick(operatorNames),
      operatorRole: '审核员',
      time: generateDate(randomInt(0, 10)),
      comment: '经复核后撤销处罚'
    });
  }

  return {
    id: recordId,
    productId: generateId('PDT'),
    productTitle: productTitles[index % productTitles.length],
    productImage: `https://picsum.photos/seed/punish${index}/200/200`,
    sellerId: generateId('USR'),
    sellerName: sellerNames[index % sellerNames.length],
    punishmentType: type,
    punishmentReason: randomPick(punishmentReasons),
    riskTypes: (['prohibited_words', 'sensitive_image', 'price_anomaly', 'category_mismatch', 'suspicious_seller', 'contact_info', 'copyright', 'weapon_drug'] as RiskType[])
      .sort(() => Math.random() - 0.5)
      .slice(0, randomInt(1, 3)),
    operator: recordOperator,
    createTime: recordCreateTime,
    effectiveDays: type === 'ban_account' ? -1 : type === 'warning' ? randomInt(3, 7) : randomInt(7, 90),
    status,
    appealAvailable: status === 'active' && Math.random() > 0.4,
    operationLogs
  };
});

export const appealRecords: AppealRecord[] = (() => {
  const results: AppealRecord[] = [];
  const appealablePunishments = punishmentRecords.filter(p => p.appealAvailable || p.status === 'revoked');
  const count = Math.min(8, appealablePunishments.length);

  for (let index = 0; index < count; index++) {
    const punishment = appealablePunishments[index % appealablePunishments.length];
    const statusRandom = Math.random();
    let status: AppealStatus;
    if (statusRandom < 0.4) status = 'pending';
    else if (statusRandom < 0.7) status = 'approved';
    else status = 'rejected';

    const evidenceCount = randomInt(1, 4);
    const appealEvidence: string[] = [];
    for (let i = 0; i < evidenceCount; i++) {
      appealEvidence.push(`https://picsum.photos/seed/appeal${index}${i}/800/600`);
    }

    results.push({
      id: generateId('APL'),
      punishmentId: punishment.id,
      productId: punishment.productId,
      productTitle: punishment.productTitle,
      productImage: punishment.productImage,
      sellerId: punishment.sellerId,
      sellerName: punishment.sellerName,
      sellerContact: generatePhone(),
      appealReason: appealReasons[index % appealReasons.length],
      appealEvidence,
      appealTime: generateDate(randomInt(0, 10)),
      status,
      reviewer: status !== 'pending' ? randomPick(operatorNames) : undefined,
      reviewTime: status !== 'pending' ? generateDate(randomInt(0, 2)) : undefined,
      reviewComment: status === 'approved' ? '申诉成立，已撤销处罚，恢复商品及卖家权益' :
                     status === 'rejected' ? '申诉证据不足，维持原处罚决定，如有疑问可联系客服' : undefined
    });
  }
  return results;
})();

export const trendData: TrendDataPoint[] = Array.from({ length: 14 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (13 - i));
  const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

  const totalReviews = randomInt(800, 2000);
  const highRiskRatio = randomFloat(0.08, 0.18);
  const mediumRiskRatio = randomFloat(0.25, 0.40);
  const lowRiskRatio = 1 - highRiskRatio - mediumRiskRatio;

  const highRiskCount = Math.round(totalReviews * highRiskRatio);
  const mediumRiskCount = Math.round(totalReviews * mediumRiskRatio);
  const lowRiskCount = totalReviews - highRiskCount - mediumRiskCount;

  const bannedCount = Math.round(highRiskCount * randomFloat(0.55, 0.75));
  const rejectedCount = Math.round(mediumRiskCount * randomFloat(0.50, 0.70));
  const approvedCount = totalReviews - bannedCount - rejectedCount;

  return {
    date: dateStr,
    totalReviews,
    approvedCount,
    rejectedCount,
    bannedCount,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount
  };
});

export const categoryRiskData: CategoryRiskItem[] = categories.map(cat => {
  const totalCount = randomInt(500, 3500);
  const riskRate = randomFloat(0.1, 0.45);
  const totalRiskCount = Math.round(totalCount * riskRate);
  const highRatio = randomFloat(0.15, 0.35);
  const mediumRatio = randomFloat(0.40, 0.60);
  const highRiskCount = Math.round(totalRiskCount * highRatio);
  const mediumRiskCount = Math.round(totalRiskCount * mediumRatio);
  const lowRiskCount = totalRiskCount - highRiskCount - mediumRiskCount;

  return {
    category: cat,
    totalCount,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    riskRate
  };
}).sort((a, b) => b.totalCount - a.totalCount);

export const teamPerformanceData: TeamPerformance[] = operatorNames.map((name, index) => {
  const totalReviews = randomInt(800, 3500);
  const accuracy = randomFloat(92, 99.5);
  const bannedRatio = randomFloat(0.10, 0.20);
  const rejectedRatio = randomFloat(0.20, 0.35);
  const bannedCount = Math.round(totalReviews * bannedRatio);
  const rejectedCount = Math.round(totalReviews * rejectedRatio);
  const approvedCount = totalReviews - bannedCount - rejectedCount;
  const dailyTarget = randomInt(80, 150);
  const completedToday = randomInt(40, dailyTarget + 10);

  return {
    reviewerId: generateId('EMP'),
    reviewerName: name,
    reviewerAvatar: `https://picsum.photos/seed/emp${index}/100/100`,
    totalReviews,
    approvedCount,
    rejectedCount,
    bannedCount,
    avgReviewTime: randomInt(25, 90),
    accuracy,
    dailyTarget,
    completedToday
  };
});

export const topKeywords: TopKeyword[] = riskWordsList
  .sort((a, b) => b.level === 'high' ? -1 : a.level === 'high' ? 1 : 0)
  .slice(0, 12)
  .map((item, index) => {
    const trendRandom = Math.random();
    let trend: 'up' | 'down' | 'stable';
    if (trendRandom < 0.4) trend = 'up';
    else if (trendRandom < 0.7) trend = 'down';
    else trend = 'stable';

    return {
      keyword: item.word,
      hitCount: randomInt(200, 3000) - index * 150,
      trend,
      trendValue: trend === 'stable' ? randomFloat(0, 5) : randomFloat(5, 35),
      level: item.level
    };
  })
  .sort((a, b) => b.hitCount - a.hitCount);

export interface DashboardSummary {
  todayPending: number;
  todayReviewed: number;
  pendingHighRisk: number;
  passRate: number;
  activeRules: number;
  totalPunishments: number;
  pendingAppeals: number;
  avgReviewTime: number;
}

export const dashboardSummary: DashboardSummary = {
  todayPending: randomInt(150, 400),
  todayReviewed: randomInt(600, 1200),
  pendingHighRisk: randomInt(30, 80),
  passRate: randomFloat(62, 78),
  activeRules: 284,
  totalPunishments: randomInt(1200, 2500),
  pendingAppeals: 23,
  avgReviewTime: 52
};
