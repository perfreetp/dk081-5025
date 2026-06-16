export type RiskLevel = 'high' | 'medium' | 'low' | 'safe';

export type RiskType =
  | 'keyword'
  | 'image'
  | 'category_mismatch'
  | 'price_abnormal'
  | 'evasion'
  | 'history'
  | 'similar';

export type ProductStatus = 'pending' | 'approved' | 'rejected' | 'banned' | 'appealed';

export type PunishmentLevel = 'warning' | 'delist' | 'restrict' | 'ban_product' | 'ban_seller';

export type UserRole = 'reviewer' | 'analyst' | 'supervisor' | 'admin';

export interface ProductImage {
  id: string;
  url: string;
  sensitiveAreas: SensitiveArea[];
}

export interface SensitiveArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  confidence: number;
}

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  creditLevel: number;
  violationCount: number;
  joinDate: string;
  phone: string;
}

export interface RiskTag {
  id: string;
  type: RiskType;
  level: RiskLevel;
  description: string;
  evidence?: string;
  suggestion?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryId: string;
  price: number;
  originalPrice?: number;
  images: ProductImage[];
  seller: Seller;
  publishTime: string;
  riskLevel: RiskLevel;
  riskScore: number;
  riskTags: RiskTag[];
  status: ProductStatus;
  reviewCount: number;
}

export interface RiskKeyword {
  id: string;
  word: string;
  category: string;
  level: RiskLevel;
  weight: number;
  hitCount: number;
  enabled: boolean;
  createTime: string;
  effectiveCategories: string[];
}

export interface ReviewRecord {
  id: string;
  productId: string;
  productTitle: string;
  reviewerId: string;
  reviewerName: string;
  action: PunishmentLevel;
  opinion: string;
  templateId?: string;
  createTime: string;
}

export interface Punishment {
  id: string;
  productId: string;
  productTitle: string;
  sellerId: string;
  sellerName: string;
  level: PunishmentLevel;
  reason: string;
  operatorId: string;
  operatorName: string;
  createTime: string;
  status: 'active' | 'appealed' | 'revoked' | 'expired';
  appealDeadline?: string;
}

export interface Appeal {
  id: string;
  punishmentId: string;
  sellerName: string;
  reason: string;
  evidence: string[];
  status: 'pending' | 'approved' | 'rejected';
  submitTime: string;
  handlerId?: string;
  handlerName?: string;
  handleTime?: string;
  handleOpinion?: string;
}

export interface ReviewTemplate {
  id: string;
  name: string;
  content: string;
  level: PunishmentLevel;
  category: string;
  useCount: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'policy' | 'case' | 'notice';
  priority: 'normal' | 'important' | 'urgent';
  authorId: string;
  authorName: string;
  publishTime: string;
  readCount: number;
}

export interface TrendItem {
  date: string;
  count: number;
  high: number;
  medium: number;
  low: number;
}

export interface CategoryRiskItem {
  category: string;
  count: number;
  percentage: number;
}

export interface KeywordHitItem {
  keyword: string;
  count: number;
  trend: number;
}

export interface TeamPerformanceItem {
  userId: string;
  userName: string;
  reviewed: number;
  accuracy: number;
  avgTime: number;
}

export interface DashboardStats {
  totalPending: number;
  totalReviewedToday: number;
  approvalRate: number;
  highRiskCount: number;
  averageReviewTime: number;
  violationTrend: TrendItem[];
  categoryRisk: CategoryRiskItem[];
  topKeywords: KeywordHitItem[];
  teamPerformance: TeamPerformanceItem[];
}
