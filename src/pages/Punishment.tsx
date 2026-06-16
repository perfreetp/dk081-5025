import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  FileText,
  Calendar,
  User,
  UserCheck,
  Eye,
  Undo2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Gavel,
  MessageSquare,
  Image as ImageIcon,
  Hash,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Package,
  AlertTriangle,
  ArrowUpRight,
  GitBranch,
} from 'lucide-react';
import { message } from 'antd';
import { StatusTag } from '@/components/StatusTag';
import { HighlightText } from '@/components/HighlightText';
import { ImageMarker } from '@/components/ImageMarker';
import { usePunishmentStore } from '@/stores/usePunishmentStore';
import type { PunishmentType, AppealStatus, RiskType, OperationLog, DisposalTimelineEvent, AppealRecord } from '@/mock';
import { cn } from '@/lib/utils';

const PUNISHMENT_TYPE_OPTIONS: { value: PunishmentType; label: string }[] = [
  { value: 'warning', label: '警告' },
  { value: 'delist', label: '下架商品' },
  { value: 'restriction', label: '限制发布' },
  { value: 'ban_account', label: '封禁账号' },
  { value: 'fine', label: '罚款' },
];

const PUNISHMENT_STATUS_OPTIONS: {
  value: 'active' | 'expired' | 'revoked';
  label: string;
  color: string;
}[] = [
  { value: 'active', label: '生效中', color: 'danger' },
  { value: 'expired', label: '已到期', color: 'info' },
  { value: 'revoked', label: '已撤销', color: 'primary' },
];

const APPEAL_STATUS_OPTIONS: {
  value: AppealStatus;
  label: string;
  color: string;
}[] = [
  { value: 'pending', label: '待处理', color: 'warning' },
  { value: 'approved', label: '申诉通过', color: 'success' },
  { value: 'rejected', label: '申诉驳回', color: 'danger' },
];

const OPERATOR_OPTIONS = [
  '张伟', '李娜', '王芳', '刘强', '陈静', '杨帆', '赵敏', '黄磊', '周杰', '吴婷',
];

const TIME_RANGE_OPTIONS = [
  { value: 'today', label: '今天' },
  { value: 'yesterday', label: '昨天' },
  { value: '7days', label: '近7天' },
  { value: '30days', label: '近30天' },
  { value: 'all', label: '全部' },
];

const OPERATION_LOG_CONFIG: Record<OperationLog['action'], { label: string; icon: typeof Gavel; color: string }> = {
  create: { label: '创建处罚', icon: Gavel, color: 'text-primary-600 bg-primary-100' },
  revoke: { label: '撤销处罚', icon: Undo2, color: 'text-info-600 bg-info-100' },
  extend: { label: '延期处罚', icon: Clock, color: 'text-warning-600 bg-warning-100' },
  appeal_approve: { label: '申诉通过', icon: CheckCircle2, color: 'text-success-600 bg-success-100' },
  appeal_reject: { label: '申诉驳回', icon: XCircle, color: 'text-danger-600 bg-danger-100' },
  appeal_submit: { label: '提交申诉', icon: MessageSquare, color: 'text-purple-600 bg-purple-100' },
};

const DISPOSAL_TIMELINE_CONFIG: Record<string, { label: string; icon: typeof Gavel; color: string; sourceLabel: string }> = {
  create: { label: '创建处罚', icon: Gavel, color: 'text-danger-600 bg-danger-100', sourceLabel: '处罚' },
  revoke: { label: '撤销处罚', icon: Undo2, color: 'text-info-600 bg-info-100', sourceLabel: '处罚' },
  extend: { label: '延期处罚', icon: Clock, color: 'text-warning-600 bg-warning-100', sourceLabel: '处罚' },
  appeal_submit: { label: '提交申诉', icon: MessageSquare, color: 'text-warning-600 bg-warning-100', sourceLabel: '申诉' },
  appeal_approve: { label: '申诉通过', icon: CheckCircle2, color: 'text-success-600 bg-success-100', sourceLabel: '申诉' },
  appeal_reject: { label: '申诉驳回', icon: XCircle, color: 'text-danger-600 bg-danger-100', sourceLabel: '申诉' },
  review_approve: { label: '审核通过', icon: CheckCircle2, color: 'text-info-600 bg-info-100', sourceLabel: '审核' },
  review_reject: { label: '审核拒绝', icon: XCircle, color: 'text-primary-600 bg-primary-100', sourceLabel: '审核' },
  review_ban: { label: '审核封禁', icon: ShieldAlert, color: 'text-danger-600 bg-danger-100', sourceLabel: '审核' },
  assign: { label: '分配审核', icon: UserCheck, color: 'text-primary-600 bg-primary-100', sourceLabel: '审核' },
  mark_review: { label: '标记复核', icon: Eye, color: 'text-info-600 bg-info-100', sourceLabel: '审核' },
};

type TabKey = 'punishment' | 'appeal';
type DetailTabKey = 'basic' | 'timeline';

interface PunishmentDetailModal {
  visible: boolean;
  id: string | null;
}

interface RevokeModal {
  visible: boolean;
  id: string | null;
}

interface ExtendModal {
  visible: boolean;
  id: string | null;
}

interface AppealReviewModal {
  visible: boolean;
  id: string | null;
  action: 'approve' | 'reject' | null;
}

const getPunishmentTypeColor = (type: PunishmentType) => {
  const map: Record<PunishmentType, string> = {
    warning: 'bg-warning-50 text-warning-700 border-warning-200',
    delist: 'bg-info-50 text-info-700 border-info-200',
    restriction: 'bg-purple-50 text-purple-700 border-purple-200',
    ban_account: 'bg-danger-50 text-danger-700 border-danger-200',
    fine: 'bg-primary-50 text-primary-700 border-primary-200',
  };
  return map[type];
};

const getPunishmentTypeLabel = (type: PunishmentType) => {
  const map: Record<PunishmentType, string> = {
    warning: '警告',
    delist: '下架商品',
    restriction: '限制发布',
    ban_account: '封禁账号',
    fine: '罚款',
  };
  return map[type];
};

const getAppealStatusColor = (status: AppealStatus) => {
  const map: Record<AppealStatus, string> = {
    pending: 'bg-warning-50 text-warning-700 border-warning-200',
    approved: 'bg-success-50 text-success-700 border-success-200',
    rejected: 'bg-danger-50 text-danger-700 border-danger-200',
  };
  return map[status];
};

const getAppealStatusLabel = (status: AppealStatus) => {
  const map: Record<AppealStatus, string> = {
    pending: '待处理',
    approved: '申诉通过',
    rejected: '申诉驳回',
  };
  return map[status];
};

const getPunishmentStatusColor = (status: 'active' | 'expired' | 'revoked') => {
  const map = {
    active: 'bg-danger-50 text-danger-700 border-danger-200',
    expired: 'bg-info-50 text-info-700 border-info-200',
    revoked: 'bg-primary-50 text-primary-700 border-primary-200',
  };
  return map[status];
};

const getPunishmentStatusLabel = (status: 'active' | 'expired' | 'revoked') => {
  const map = {
    active: '生效中',
    expired: '已到期',
    revoked: '已撤销',
  };
  return map[status];
};

export default function Punishment() {
  const [activeTab, setActiveTab] = useState<TabKey>('punishment');
  const [detailTab, setDetailTab] = useState<DetailTabKey>('basic');

  const {
    punishmentFilters,
    setPunishmentFilters,
    resetPunishmentFilters,
    appealFilters,
    setAppealFilters,
    resetAppealFilters,
    applyPunishmentFilters,
    applyAppealFilters,
    getPagedPunishments,
    getPagedAppeals,
    punishmentPagination,
    appealPagination,
    setPunishmentPage,
    setAppealPage,
    setPunishmentPageSize,
    setAppealPageSize,
    revokePunishment,
    extendPunishment,
    reviewAppeal,
    getPunishmentStats,
    getAppealStats,
    punishmentRecords,
    appealRecords,
    appealsByPunishment,
    getDisposalTimeline,
  } = usePunishmentStore();

  const [showFilters, setShowFilters] = useState(true);

  const [punishmentDetailModal, setPunishmentDetailModal] = useState<PunishmentDetailModal>({
    visible: false,
    id: null,
  });
  const [revokeModal, setRevokeModal] = useState<RevokeModal>({ visible: false, id: null });
  const [extendModal, setExtendModal] = useState<ExtendModal>({ visible: false, id: null });
  const [appealReviewModal, setAppealReviewModal] = useState<AppealReviewModal>({
    visible: false,
    id: null,
    action: null,
  });

  const [revokeReason, setRevokeReason] = useState('');
  const [extendDays, setExtendDays] = useState(7);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    applyPunishmentFilters();
    applyAppealFilters();
  }, [applyPunishmentFilters, applyAppealFilters]);

  const pagedPunishments = getPagedPunishments();
  const pagedAppeals = getPagedAppeals();
  const punishmentStats = getPunishmentStats();
  const appealStats = getAppealStats();

  const currentPunishmentDetail = punishmentDetailModal.id
    ? punishmentRecords.find((p) => p.id === punishmentDetailModal.id)
    : null;

  const currentAppeal = appealReviewModal.id
    ? appealRecords.find((a) => a.id === appealReviewModal.id)
    : null;

  const togglePunishmentType = (type: PunishmentType) => {
    const current = punishmentFilters.punishmentTypes;
    setPunishmentFilters({
      punishmentTypes: current.includes(type) ? current.filter((t) => t !== type) : [...current, type],
    });
  };

  const togglePunishmentStatus = (status: 'active' | 'expired' | 'revoked') => {
    const current = punishmentFilters.statuses;
    setPunishmentFilters({
      statuses: current.includes(status) ? current.filter((s) => s !== status) : [...current, status],
    });
  };

  const toggleAppealStatus = (status: AppealStatus) => {
    const current = appealFilters.statuses;
    setAppealFilters({
      statuses: current.includes(status) ? current.filter((s) => s !== status) : [...current, status],
    });
  };

  const handleRevoke = () => {
    if (revokeModal.id) {
      revokePunishment(revokeModal.id, revokeReason);
      message.success('处罚已撤销');
    }
    setRevokeModal({ visible: false, id: null });
    setRevokeReason('');
  };

  const handleExtend = () => {
    if (extendModal.id) {
      extendPunishment(extendModal.id, extendDays);
      message.success(`处罚已延期 ${extendDays} 天`);
    }
    setExtendModal({ visible: false, id: null });
    setExtendDays(7);
  };

  const handleAppealReview = () => {
    if (appealReviewModal.id && appealReviewModal.action) {
      reviewAppeal(
        appealReviewModal.id,
        appealReviewModal.action === 'approve',
        reviewComment || (appealReviewModal.action === 'approve' ? '申诉成立，已撤销处罚' : '申诉证据不足，维持原处罚'),
      );
      message.success(appealReviewModal.action === 'approve' ? '申诉已通过，处罚已撤销' : '申诉已驳回');
    }
    setAppealReviewModal({ visible: false, id: null, action: null });
    setReviewComment('');
  };

  const totalPunishmentPages = Math.max(
    1,
    Math.ceil(punishmentPagination.total / punishmentPagination.pageSize),
  );
  const totalAppealPages = Math.max(
    1,
    Math.ceil(appealPagination.total / appealPagination.pageSize),
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Gavel className="w-6 h-6 text-danger-600" />
              处罚台账
            </h1>
            <p className="page-subtitle">查看和管理所有处罚记录与申诉审核</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-outline text-xs">
              <Download size={14} />
              导出数据
            </button>
            <button className="btn-outline text-xs">
              <RefreshCw size={14} />
              刷新
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'punishment' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-primary-500">处罚总数</p>
                <p className="text-2xl font-semibold text-primary-900 mt-2 text-number">
                  {punishmentStats.total}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                <FileText size={24} />
              </div>
            </div>
          </div>
          <div className="stat-card danger">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-primary-500">生效中</p>
                <p className="text-2xl font-semibold text-danger-700 mt-2 text-number">
                  {punishmentStats.activeCount}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-danger-50 text-danger-600 flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-primary-500">可申诉</p>
                <p className="text-2xl font-semibold text-warning-700 mt-2 text-number">
                  {punishmentStats.appealableCount}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-warning-50 text-warning-600 flex items-center justify-center">
                <MessageSquare size={24} />
              </div>
            </div>
          </div>
          <div className="stat-card success">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-primary-500">已撤销</p>
                <p className="text-2xl font-semibold text-success-700 mt-2 text-number">
                  {punishmentStats.revokedCount}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-success-50 text-success-600 flex items-center justify-center">
                <Undo2 size={22} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-primary-500">申诉总数</p>
                <p className="text-2xl font-semibold text-primary-900 mt-2 text-number">
                  {appealStats.total}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                <MessageSquare size={24} />
              </div>
            </div>
          </div>
          <div className="stat-card warning">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-primary-500">待处理</p>
                <p className="text-2xl font-semibold text-warning-700 mt-2 text-number">
                  {appealStats.pendingCount}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-warning-50 text-warning-600 flex items-center justify-center">
                <Clock size={24} />
              </div>
            </div>
          </div>
          <div className="stat-card success">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-primary-500">申诉通过率</p>
                <p className="text-2xl font-semibold text-success-700 mt-2 text-number">
                  {appealStats.approvalRate}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-success-50 text-success-600 flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
            </div>
          </div>
          <div className="stat-card danger">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-primary-500">已驳回</p>
                <p className="text-2xl font-semibold text-danger-700 mt-2 text-number">
                  {appealStats.rejectedCount}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-danger-50 text-danger-600 flex items-center justify-center">
                <XCircle size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 bg-white rounded-lg border border-primary-200 p-1.5 w-fit shadow-sm">
        <button
          onClick={() => setActiveTab('punishment')}
          className={cn(
            'px-5 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2',
            activeTab === 'punishment'
              ? 'bg-danger-500 text-white shadow-sm'
              : 'text-primary-600 hover:bg-primary-50',
          )}
        >
          <ShieldAlert size={16} />
          处罚记录
        </button>
        <button
          onClick={() => setActiveTab('appeal')}
          className={cn(
            'px-5 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2',
            activeTab === 'appeal'
              ? 'bg-warning-500 text-white shadow-sm'
              : 'text-primary-600 hover:bg-primary-50',
          )}
        >
          <MessageSquare size={16} />
          申诉管理
          {appealStats.pendingCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-xs font-bold">
              {appealStats.pendingCount}
            </span>
          )}
        </button>
      </div>

      <div className="toolbar">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
          <input
            type="text"
            placeholder={activeTab === 'punishment' ? '搜索商品标题、处罚ID、商品ID...' : '搜索商品标题、申诉原因、卖家名称...'}
            value={activeTab === 'punishment' ? punishmentFilters.keyword : appealFilters.keyword}
            onChange={(e) =>
              activeTab === 'punishment'
                ? setPunishmentFilters({ keyword: e.target.value })
                : setAppealFilters({ keyword: e.target.value })
            }
            className="input-field pl-9"
          />
        </div>

        {activeTab === 'punishment' && (
          <div className="relative min-w-[200px] max-w-xs">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
            <input
              type="text"
              placeholder="搜索卖家名称/ID..."
              value={punishmentFilters.sellerKeyword}
              onChange={(e) => setPunishmentFilters({ sellerKeyword: e.target.value })}
              className="input-field pl-9"
            />
          </div>
        )}

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'btn-outline text-xs',
            showFilters && 'bg-info-50 border-info-200 text-info-700',
          )}
        >
          <Filter size={14} />
          高级筛选
          <ChevronDown size={14} className={cn(showFilters && 'rotate-180 transition-transform')} />
        </button>

        <button
          onClick={() => activeTab === 'punishment' ? resetPunishmentFilters() : resetAppealFilters()}
          className="btn-outline text-xs"
        >
          重置
        </button>

        <div className="flex-1" />

        <span className="text-xs text-primary-500">
          共{' '}
          <span className="font-semibold text-primary-700">
            {activeTab === 'punishment' ? punishmentPagination.total : appealPagination.total}
          </span>{' '}
          条记录
        </span>
      </div>

      {showFilters && (
        <div className="risk-card p-4 mb-4 animate-fade-in-down">
          {activeTab === 'punishment' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <h5 className="text-xs font-semibold text-primary-600 uppercase mb-2 flex items-center gap-1.5">
                  <Gavel size={12} />
                  处置等级
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {PUNISHMENT_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => togglePunishmentType(opt.value)}
                      className={cn(
                        'px-2.5 py-1 rounded text-xs font-medium transition-all border',
                        punishmentFilters.punishmentTypes.includes(opt.value)
                          ? 'bg-danger-500 text-white border-danger-500'
                          : 'bg-white text-primary-600 border-primary-200 hover:border-danger-300 hover:text-danger-600',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-primary-600 uppercase mb-2 flex items-center gap-1.5">
                  <AlertCircle size={12} />
                  状态
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {PUNISHMENT_STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => togglePunishmentStatus(opt.value)}
                      className={cn(
                        'px-2.5 py-1 rounded text-xs font-medium transition-all border',
                        punishmentFilters.statuses.includes(opt.value)
                          ? opt.color === 'danger'
                            ? 'bg-danger-500 text-white border-danger-500'
                            : opt.color === 'info'
                            ? 'bg-info-500 text-white border-info-500'
                            : 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white text-primary-600 border-primary-200 hover:border-primary-300',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-primary-600 uppercase mb-2 flex items-center gap-1.5">
                  <Calendar size={12} />
                  时间范围
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {TIME_RANGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setPunishmentFilters({ sortBy: 'createTime', sortOrder: 'desc' })}
                      className="px-2.5 py-1 rounded text-xs font-medium transition-all border bg-white text-primary-600 border-primary-200 hover:border-primary-300"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-primary-600 uppercase mb-2 flex items-center gap-1.5">
                  <UserCheck size={12} />
                  操作人
                </h5>
                <select
                  className="input-field text-xs"
                  value={punishmentFilters.operators[0] || ''}
                  onChange={(e) =>
                    setPunishmentFilters({
                      operators: e.target.value ? [e.target.value] : [],
                    })
                  }
                >
                  <option value="">全部操作人</option>
                  {OPERATOR_OPTIONS.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <h5 className="text-xs font-semibold text-primary-600 uppercase mb-2 flex items-center gap-1.5">
                  <AlertCircle size={12} />
                  申诉状态
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {APPEAL_STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => toggleAppealStatus(opt.value)}
                      className={cn(
                        'px-2.5 py-1 rounded text-xs font-medium transition-all border',
                        appealFilters.statuses.includes(opt.value)
                          ? opt.color === 'warning'
                            ? 'bg-warning-500 text-white border-warning-500'
                            : opt.color === 'success'
                            ? 'bg-success-500 text-white border-success-500'
                            : 'bg-danger-500 text-white border-danger-500'
                          : 'bg-white text-primary-600 border-primary-200 hover:border-primary-300',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-primary-600 uppercase mb-2 flex items-center gap-1.5">
                  <Calendar size={12} />
                  提交时间
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {TIME_RANGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAppealFilters({ sortBy: 'appealTime', sortOrder: 'desc' })}
                      className="px-2.5 py-1 rounded text-xs font-medium transition-all border bg-white text-primary-600 border-primary-200 hover:border-primary-300"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="text-xs font-semibold text-primary-600 uppercase mb-2 flex items-center gap-1.5">
                  <UserCheck size={12} />
                  审核人
                </h5>
                <select
                  className="input-field text-xs"
                  value={appealFilters.reviewers[0] || ''}
                  onChange={(e) =>
                    setAppealFilters({
                      reviewers: e.target.value ? [e.target.value] : [],
                    })
                  }
                >
                  <option value="">全部审核人</option>
                  {OPERATOR_OPTIONS.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'punishment' ? (
        <div className="data-table-wrapper">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-40">商品</th>
                  <th className="w-28">卖家</th>
                  <th className="w-24">处置等级</th>
                  <th>处罚原因</th>
                  <th className="w-24">操作人</th>
                  <th className="w-40">时间</th>
                  <th className="w-20">状态</th>
                  <th className="w-44">操作</th>
                </tr>
              </thead>
              <tbody>
                {pagedPunishments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-primary-400">
                      <Search size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">暂无匹配的处罚记录</p>
                    </td>
                  </tr>
                ) : (
                  pagedPunishments.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-primary-100">
                            <img
                              src={record.productImage}
                              alt={record.productTitle}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-primary-800 line-clamp-1">
                              {record.productTitle}
                            </p>
                            <p className="text-xs text-primary-400 mt-0.5">{record.productId}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <User size={14} className="text-primary-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-primary-700 line-clamp-1">{record.sellerName}</p>
                            <p className="text-xs text-primary-400 line-clamp-1">{record.sellerId}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={cn(
                            'risk-tag',
                            getPunishmentTypeColor(record.punishmentType),
                          )}
                        >
                          {getPunishmentTypeLabel(record.punishmentType)}
                        </span>
                      </td>
                      <td>
                        <p className="text-sm text-primary-700 line-clamp-2 max-w-md">
                          {record.punishmentReason}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {record.riskTypes.slice(0, 3).map((rt) => (
                            <span key={rt} className="risk-tag risk-tag-primary text-[10px] py-0">
                              {rt}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-primary-700">{record.operator}</span>
                      </td>
                      <td>
                        <p className="text-sm text-primary-600">{record.createTime.slice(0, 10)}</p>
                        <p className="text-xs text-primary-400 mt-0.5">{record.createTime.slice(11, 16)}</p>
                      </td>
                      <td>
                        <span
                          className={cn(
                            'risk-tag',
                            getPunishmentStatusColor(record.status),
                          )}
                        >
                          {getPunishmentStatusLabel(record.status)}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setDetailTab('basic');
                              setPunishmentDetailModal({ visible: true, id: record.id });
                            }}
                            className="px-2 py-1 rounded text-xs text-info-600 hover:bg-info-50 transition-colors flex items-center gap-1"
                            title="查看详情"
                          >
                            <Eye size={12} />
                            详情
                          </button>
                          {record.status === 'active' && (
                            <>
                              <button
                                onClick={() =>
                                  setRevokeModal({ visible: true, id: record.id })
                                }
                                className="px-2 py-1 rounded text-xs text-primary-600 hover:bg-primary-50 transition-colors flex items-center gap-1"
                                title="撤销处罚"
                              >
                                <Undo2 size={12} />
                                撤销
                              </button>
                              {record.effectiveDays > 0 && (
                                <button
                                  onClick={() =>
                                    setExtendModal({ visible: true, id: record.id })
                                  }
                                  className="px-2 py-1 rounded text-xs text-warning-600 hover:bg-warning-50 transition-colors flex items-center gap-1"
                                  title="延期处罚"
                                >
                                  <Clock size={12} />
                                  延期
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {punishmentPagination.total > 0 && (
            <div className="px-4 py-3 border-t border-primary-100 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 text-xs text-primary-500">
                <span>每页显示</span>
                <select
                  className="input-field !py-1 !px-2 w-auto"
                  value={punishmentPagination.pageSize}
                  onChange={(e) => setPunishmentPageSize(Number(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>条</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPunishmentPage(punishmentPagination.page - 1)}
                  disabled={punishmentPagination.page === 1}
                  className="p-1.5 rounded text-primary-600 hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs text-primary-600 px-3">
                  第 <span className="font-semibold">{punishmentPagination.page}</span> / {totalPunishmentPages} 页
                </span>
                <button
                  onClick={() => setPunishmentPage(punishmentPagination.page + 1)}
                  disabled={punishmentPagination.page === totalPunishmentPages}
                  className="p-1.5 rounded text-primary-600 hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="data-table-wrapper">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-28">卖家</th>
                  <th className="w-40">商品</th>
                  <th>申诉原因</th>
                  <th className="w-32">证据</th>
                  <th className="w-20">状态</th>
                  <th className="w-40">提交时间</th>
                  <th className="w-44">操作</th>
                </tr>
              </thead>
              <tbody>
                {pagedAppeals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-primary-400">
                      <Search size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">暂无匹配的申诉记录</p>
                    </td>
                  </tr>
                ) : (
                  pagedAppeals.map((appeal) => (
                    <tr key={appeal.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <User size={16} className="text-primary-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-primary-800 line-clamp-1">
                              {appeal.sellerName}
                            </p>
                            <p className="text-xs text-primary-400 line-clamp-1">
                              {appeal.sellerContact}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-primary-100">
                            <img
                              src={appeal.productImage}
                              alt={appeal.productTitle}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-primary-700 line-clamp-1">
                              {appeal.productTitle}
                            </p>
                            <p className="text-xs text-primary-400 mt-0.5">
                              {appeal.productId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="text-sm text-primary-700 line-clamp-2 max-w-lg">
                          {appeal.appealReason}
                        </p>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <ImageIcon size={14} className="text-primary-400" />
                          <span className="text-sm text-primary-600">
                            {appeal.appealEvidence.length} 张凭证
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={cn(
                            'risk-tag',
                            getAppealStatusColor(appeal.status),
                          )}
                        >
                          {getAppealStatusLabel(appeal.status)}
                        </span>
                      </td>
                      <td>
                        <p className="text-sm text-primary-600">{appeal.appealTime.slice(0, 10)}</p>
                        <p className="text-xs text-primary-400 mt-0.5">{appeal.appealTime.slice(11, 16)}</p>
                        {appeal.status !== 'pending' && appeal.reviewTime && (
                          <p className="text-xs text-info-500 mt-0.5">
                            审核: {appeal.reviewTime.slice(5, 10)}
                          </p>
                        )}
                      </td>
                      <td>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => {
                              setActiveTab('punishment');
                              setPunishmentFilters({ keyword: appeal.punishmentId });
                            }}
                            className="px-2 py-1 rounded text-xs text-info-600 hover:bg-info-50 transition-colors flex items-center gap-1 self-start"
                            title="查看对应处罚"
                          >
                            <ArrowUpRight size={12} />
                            查看处罚
                          </button>
                          {appeal.status === 'pending' ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setAppealReviewModal({
                                    visible: true,
                                    id: appeal.id,
                                    action: 'approve',
                                  });
                                  setReviewComment('');
                                }}
                                className="px-2.5 py-1 rounded text-xs bg-success-500 text-white hover:bg-success-600 transition-colors flex items-center gap-1"
                              >
                                <CheckCircle2 size={12} />
                                通过
                              </button>
                              <button
                                onClick={() => {
                                  setAppealReviewModal({
                                    visible: true,
                                    id: appeal.id,
                                    action: 'reject',
                                  });
                                  setReviewComment('');
                                }}
                                className="px-2.5 py-1 rounded text-xs bg-danger-500 text-white hover:bg-danger-600 transition-colors flex items-center gap-1"
                              >
                                <XCircle size={12} />
                                驳回
                              </button>
                            </div>
                          ) : (
                            <div className="text-xs text-primary-500">
                              <p>审核人: {appeal.reviewer || '-'}</p>
                              <p className="mt-0.5 line-clamp-1 text-primary-400">
                                {appeal.reviewComment || '无审核意见'}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {appealPagination.total > 0 && (
            <div className="px-4 py-3 border-t border-primary-100 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 text-xs text-primary-500">
                <span>每页显示</span>
                <select
                  className="input-field !py-1 !px-2 w-auto"
                  value={appealPagination.pageSize}
                  onChange={(e) => setAppealPageSize(Number(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={8}>8</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>条</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setAppealPage(appealPagination.page - 1)}
                  disabled={appealPagination.page === 1}
                  className="p-1.5 rounded text-primary-600 hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs text-primary-600 px-3">
                  第 <span className="font-semibold">{appealPagination.page}</span> / {totalAppealPages} 页
                </span>
                <button
                  onClick={() => setAppealPage(appealPagination.page + 1)}
                  disabled={appealPagination.page === totalAppealPages}
                  className="p-1.5 rounded text-primary-600 hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {punishmentDetailModal.visible && currentPunishmentDetail && (
        <div
          className="modal-overlay"
          onClick={() => setPunishmentDetailModal({ visible: false, id: null })}
        >
          <div
            className="modal-content max-w-3xl max-h-[85vh] flex flex-col animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-primary-100 flex items-center justify-between">
              <h3 className="font-semibold text-primary-800 flex items-center gap-2">
                <FileText size={18} className="text-info-500" />
                处罚详情
              </h3>
              <button
                onClick={() => setPunishmentDetailModal({ visible: false, id: null })}
                className="p-1.5 rounded-md hover:bg-primary-100 text-primary-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 pt-3 border-b border-primary-100">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setDetailTab('basic')}
                  className={cn(
                    'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                    detailTab === 'basic'
                      ? 'border-danger-500 text-danger-600'
                      : 'border-transparent text-primary-500 hover:text-primary-700'
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <FileText size={14} />
                    基本信息
                  </div>
                </button>
                <button
                  onClick={() => setDetailTab('timeline')}
                  className={cn(
                    'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                    detailTab === 'timeline'
                      ? 'border-danger-500 text-danger-600'
                      : 'border-transparent text-primary-500 hover:text-primary-700'
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <GitBranch size={14} />
                    处置链路
                  </div>
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              {detailTab === 'basic' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs font-semibold text-primary-500 uppercase mb-2">商品信息</h5>
                      <div className="p-3 bg-primary-50 rounded-lg space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-white border border-primary-200">
                            <img
                              src={currentPunishmentDetail.productImage}
                              alt={currentPunishmentDetail.productTitle}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-primary-800 line-clamp-2">
                              {currentPunishmentDetail.productTitle}
                            </p>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-primary-100 space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-primary-500">商品ID</span>
                            <span className="text-primary-700 font-mono">
                              {currentPunishmentDetail.productId}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-primary-500">处罚ID</span>
                            <span className="text-primary-700 font-mono">
                              {currentPunishmentDetail.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-primary-500 uppercase mb-2">卖家信息</h5>
                      <div className="p-3 bg-primary-50 rounded-lg space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-white border border-primary-200 flex items-center justify-center">
                            <User size={20} className="text-primary-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-primary-800">
                              {currentPunishmentDetail.sellerName}
                            </p>
                            <p className="text-xs text-primary-500 font-mono">
                              {currentPunishmentDetail.sellerId}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-danger-50 border border-danger-100">
                      <p className="text-xs text-danger-600 mb-1">处置等级</p>
                      <p className="text-sm font-semibold text-danger-700">
                        {getPunishmentTypeLabel(currentPunishmentDetail.punishmentType)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-primary-50 border border-primary-100">
                      <p className="text-xs text-primary-600 mb-1">状态</p>
                      <p className="text-sm font-semibold text-primary-700">
                        {getPunishmentStatusLabel(currentPunishmentDetail.status)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-info-50 border border-info-100">
                      <p className="text-xs text-info-600 mb-1">有效时长</p>
                      <p className="text-sm font-semibold text-info-700">
                        {currentPunishmentDetail.effectiveDays === -1
                          ? '永久'
                          : `${currentPunishmentDetail.effectiveDays} 天`}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-warning-50 border border-warning-100">
                      <p className="text-xs text-warning-600 mb-1">可申诉</p>
                      <p className="text-sm font-semibold text-warning-700">
                        {currentPunishmentDetail.appealAvailable ? '是' : '否'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-primary-500 uppercase mb-2">处罚原因</h5>
                    <div className="p-3 bg-danger-50/50 rounded-lg border border-danger-100">
                      <p className="text-sm text-primary-700 leading-relaxed">
                        {currentPunishmentDetail.punishmentReason}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-primary-500 uppercase mb-2">命中风险类型</h5>
                    <div className="flex flex-wrap gap-2">
                      {currentPunishmentDetail.riskTypes.map((rt) => (
                        <span key={rt} className="risk-tag risk-tag-danger">
                          <Hash size={10} />
                          {rt}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-primary-100 pt-4">
                    <h5 className="text-xs font-semibold text-primary-500 uppercase mb-3 flex items-center gap-1.5">
                      <MessageSquare size={12} />
                      关联申诉
                    </h5>
                    {appealsByPunishment[currentPunishmentDetail.id] && appealsByPunishment[currentPunishmentDetail.id].length > 0 ? (
                      <div className="space-y-3">
                        {appealsByPunishment[currentPunishmentDetail.id].map((appeal: AppealRecord) => (
                          <div
                            key={appeal.id}
                            className="bg-warning-50 border border-warning-100 rounded-lg p-3"
                          >
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    'risk-tag',
                                    getAppealStatusColor(appeal.status)
                                  )}
                                >
                                  {getAppealStatusLabel(appeal.status)}
                                </span>
                                <span className="text-xs text-primary-400 font-mono">
                                  {appeal.appealTime}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-primary-700 mt-2 leading-relaxed">
                              {appeal.appealReason}
                            </p>
                            {appeal.status !== 'pending' && (
                              <div className="mt-2 pt-2 border-t border-warning-200/60 space-y-1">
                                {appeal.reviewer && (
                                  <p className="text-xs text-primary-500">
                                    审核人：<span className="text-primary-700">{appeal.reviewer}</span>
                                  </p>
                                )}
                                {appeal.reviewComment && (
                                  <p className="text-xs text-primary-500 leading-relaxed">
                                    审核意见：<span className="text-primary-700">{appeal.reviewComment}</span>
                                  </p>
                                )}
                              </div>
                            )}
                            <div className="mt-3">
                              <button
                                onClick={() => {
                                  setPunishmentDetailModal({ visible: false, id: null });
                                  setActiveTab('appeal');
                                }}
                                className="px-3 py-1.5 rounded text-xs bg-warning-500 text-white hover:bg-warning-600 transition-colors flex items-center gap-1"
                              >
                                <Eye size={12} />
                                查看申诉详情
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-primary-400 italic">暂无申诉记录</p>
                    )}
                  </div>

                  <div className="border-t border-primary-100 pt-4">
                    <h5 className="text-xs font-semibold text-primary-500 uppercase mb-3 flex items-center gap-1.5">
                      <FileText size={12} />
                      操作流水
                    </h5>
                    <div className="relative pl-6">
                      <div className="absolute left-2.5 top-2 bottom-2 w-px bg-primary-200" />
                      <div className="space-y-4">
                        {[...currentPunishmentDetail.operationLogs]
                          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                          .map((log) => {
                            const config = OPERATION_LOG_CONFIG[log.action];
                            const IconComp = config.icon;
                            return (
                              <div key={log.id} className="relative">
                                <div
                                  className={cn(
                                    'absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center',
                                    config.color
                                  )}
                                >
                                  <IconComp size={12} />
                                </div>
                                <div className="bg-primary-50 rounded-lg p-3">
                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-semibold text-primary-800">
                                        {config.label}
                                      </span>
                                      <span className="text-xs text-primary-500">
                                        {log.operator}
                                        {log.operatorRole ? `（${log.operatorRole}）` : ''}
                                      </span>
                                    </div>
                                    <span className="text-xs text-primary-400 font-mono">
                                      {log.time}
                                    </span>
                                  </div>
                                  {log.comment && (
                                    <p className="text-xs text-primary-600 mt-1.5 leading-relaxed">
                                      {log.comment}
                                    </p>
                                  )}
                                  {log.extra && Object.keys(log.extra).length > 0 && (
                                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                                      {Object.entries(log.extra).map(([key, value]) => (
                                        <span
                                          key={key}
                                          className="px-1.5 py-0.5 rounded bg-white border border-primary-200 text-[10px] text-primary-600"
                                        >
                                          {key}: {String(value)}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <h5 className="text-xs font-semibold text-primary-500 uppercase mb-3 flex items-center gap-1.5">
                    <GitBranch size={12} />
                    处置链路时间线
                  </h5>
                  <div className="relative pl-6">
                    <div className="absolute left-2.5 top-2 bottom-2 w-px bg-primary-200" />
                    <div className="space-y-4">
                      {getDisposalTimeline(undefined, currentPunishmentDetail.id).map((event: DisposalTimelineEvent) => {
                        const config = DISPOSAL_TIMELINE_CONFIG[event.actionType] || {
                          label: event.actionType,
                          icon: FileText,
                          color: 'text-primary-600 bg-primary-100',
                          sourceLabel: event.sourceType,
                        };
                        const IconComp = config.icon;
                        const sourceColor =
                          event.sourceType === 'review'
                            ? 'bg-info-50 text-info-700 border-info-200'
                            : event.sourceType === 'punishment'
                            ? 'bg-danger-50 text-danger-700 border-danger-200'
                            : 'bg-warning-50 text-warning-700 border-warning-200';
                        return (
                          <div key={event.id} className="relative">
                            <div
                              className={cn(
                                'absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center',
                                config.color
                              )}
                            >
                              <IconComp size={12} />
                            </div>
                            <div className="bg-primary-50 rounded-lg p-3">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <span className={cn('risk-tag text-[10px] py-0', sourceColor)}>
                                    {config.sourceLabel}
                                  </span>
                                  <span className="text-sm font-semibold text-primary-800">
                                    {config.label}
                                  </span>
                                  <span className="text-xs text-primary-500">
                                    {event.operator}
                                    {event.operatorRole ? `（${event.operatorRole}）` : ''}
                                  </span>
                                </div>
                                <span className="text-xs text-primary-400 font-mono">
                                  {event.time}
                                </span>
                              </div>
                              {event.comment && (
                                <p className="text-xs text-primary-600 mt-1.5 leading-relaxed">
                                  {event.comment}
                                </p>
                              )}
                              {event.extra && Object.keys(event.extra).length > 0 && (
                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                  {Object.entries(event.extra).map(([key, value]) => (
                                    <span
                                      key={key}
                                      className="px-1.5 py-0.5 rounded bg-white border border-primary-200 text-[10px] text-primary-600"
                                    >
                                      {key}: {String(value)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="px-5 py-4 border-t border-primary-100 flex justify-end gap-2">
              {currentPunishmentDetail.status === 'active' && (
                <>
                  <button
                    onClick={() => {
                      setPunishmentDetailModal({ visible: false, id: null });
                      setRevokeModal({ visible: true, id: currentPunishmentDetail.id });
                    }}
                    className="btn-outline text-sm"
                  >
                    <Undo2 size={14} />
                    撤销处罚
                  </button>
                  {currentPunishmentDetail.effectiveDays > 0 && (
                    <button
                      onClick={() => {
                        setPunishmentDetailModal({ visible: false, id: null });
                        setExtendModal({ visible: true, id: currentPunishmentDetail.id });
                      }}
                      className="btn-warning text-sm"
                    >
                      <Clock size={14} />
                      延期处罚
                    </button>
                  )}
                </>
              )}
              <button
                onClick={() => setPunishmentDetailModal({ visible: false, id: null })}
                className="btn-primary text-sm"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {revokeModal.visible && (
        <div
          className="modal-overlay"
          onClick={() => setRevokeModal({ visible: false, id: null })}
        >
          <div
            className="modal-content max-w-md animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-primary-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                <Undo2 size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-primary-800">撤销处罚</h3>
                <p className="text-xs text-primary-500 mt-0.5">撤销后该处罚将不再生效</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 rounded-lg bg-warning-50 border border-warning-100">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-warning-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-warning-700">
                    撤销处罚操作将恢复商品及卖家的相关权益，此操作不可恢复。请确认是否继续？
                  </p>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-primary-600 uppercase block mb-2">
                  撤销原因（可选）
                </label>
                <textarea
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="请输入撤销处罚的原因..."
                  className="input-field min-h-[100px] resize-none"
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-primary-100 flex justify-end gap-2">
              <button
                onClick={() => {
                  setRevokeModal({ visible: false, id: null });
                  setRevokeReason('');
                }}
                className="btn-outline text-sm"
              >
                取消
              </button>
              <button
                onClick={handleRevoke}
                className="btn-danger text-sm"
              >
                <CheckCircle2 size={14} />
                确认撤销
              </button>
            </div>
          </div>
        </div>
      )}

      {extendModal.visible && (
        <div
          className="modal-overlay"
          onClick={() => setExtendModal({ visible: false, id: null })}
        >
          <div
            className="modal-content max-w-md animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-primary-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning-50 text-warning-600 flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-primary-800">延期处罚</h3>
                <p className="text-xs text-primary-500 mt-0.5">延长处罚的有效时长</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-primary-600 uppercase block mb-2">
                  延期天数
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={extendDays}
                    onChange={(e) => setExtendDays(Math.max(1, Math.min(365, Number(e.target.value) || 1)))}
                    className="input-field w-32"
                  />
                  <span className="text-sm text-primary-600">天</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[3, 7, 14, 30, 60, 90].map((day) => (
                    <button
                      key={day}
                      onClick={() => setExtendDays(day)}
                      className={cn(
                        'px-2.5 py-1 rounded text-xs font-medium transition-all border',
                        extendDays === day
                          ? 'bg-warning-500 text-white border-warning-500'
                          : 'bg-white text-primary-600 border-primary-200 hover:border-warning-300',
                      )}
                    >
                      {day}天
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-info-50 border border-info-100">
                <p className="text-sm text-info-700">
                  <span className="font-medium">提示：</span>
                  延期后处罚有效时长将增加所选天数。
                </p>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-primary-100 flex justify-end gap-2">
              <button
                onClick={() => {
                  setExtendModal({ visible: false, id: null });
                  setExtendDays(7);
                }}
                className="btn-outline text-sm"
              >
                取消
              </button>
              <button
                onClick={handleExtend}
                className="btn-warning text-sm"
              >
                <CheckCircle2 size={14} />
                确认延期
              </button>
            </div>
          </div>
        </div>
      )}

      {appealReviewModal.visible && currentAppeal && (
        <div
          className="modal-overlay"
          onClick={() => setAppealReviewModal({ visible: false, id: null, action: null })}
        >
          <div
            className="modal-content max-w-2xl max-h-[85vh] flex flex-col animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-primary-100 flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  appealReviewModal.action === 'approve'
                    ? 'bg-success-50 text-success-600'
                    : 'bg-danger-50 text-danger-600',
                )}
              >
                {appealReviewModal.action === 'approve' ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <XCircle size={20} />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-primary-800">
                  申诉{appealReviewModal.action === 'approve' ? '通过' : '驳回'}审核
                </h3>
                <p className="text-xs text-primary-500 mt-0.5">
                  {appealReviewModal.action === 'approve'
                    ? '通过后将撤销原处罚并恢复卖家权益'
                    : '驳回后将维持原处罚决定'}
                </p>
              </div>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-primary-50 rounded-lg">
                  <p className="text-xs text-primary-500 mb-1">申诉卖家</p>
                  <p className="text-sm font-medium text-primary-800">{currentAppeal.sellerName}</p>
                  <p className="text-xs text-primary-500 mt-0.5">{currentAppeal.sellerContact}</p>
                </div>
                <div className="p-3 bg-primary-50 rounded-lg">
                  <p className="text-xs text-primary-500 mb-1">涉事商品</p>
                  <p className="text-sm font-medium text-primary-800 line-clamp-1">
                    {currentAppeal.productTitle}
                  </p>
                  <p className="text-xs text-primary-500 mt-0.5 font-mono">
                    {currentAppeal.productId}
                  </p>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-primary-500 uppercase mb-2 flex items-center gap-1.5">
                  <MessageSquare size={12} />
                  申诉原因
                </h5>
                <div className="p-3 bg-info-50 rounded-lg border border-info-100">
                  <p className="text-sm text-primary-700 leading-relaxed">
                    {currentAppeal.appealReason}
                  </p>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-primary-500 uppercase mb-2 flex items-center gap-1.5">
                  <ImageIcon size={12} />
                  申诉凭证（{currentAppeal.appealEvidence.length}张）
                </h5>
                <div className="grid grid-cols-4 gap-2">
                  {currentAppeal.appealEvidence.map((ev, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-md overflow-hidden bg-primary-100 border border-primary-200"
                    >
                      <img
                        src={ev}
                        alt={`凭证${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-primary-600 uppercase block mb-2">
                  审核意见
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={
                    appealReviewModal.action === 'approve'
                      ? '请输入申诉通过的说明（默认：申诉成立，已撤销处罚）'
                      : '请输入申诉驳回的理由（默认：申诉证据不足，维持原处罚）'
                  }
                  className="input-field min-h-[100px] resize-none"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {appealReviewModal.action === 'approve' ? (
                    [
                      '申诉成立，已撤销处罚，恢复商品及卖家权益',
                      '材料充分，撤销原处罚决定',
                      '经核实属于误判，已解除处罚',
                    ].map((tpl) => (
                      <button
                        key={tpl}
                        onClick={() => setReviewComment(tpl)}
                        className="px-2 py-1 rounded text-[11px] bg-success-50 text-success-700 border border-success-200 hover:bg-success-100 transition-colors"
                      >
                        {tpl}
                      </button>
                    ))
                  ) : (
                    [
                      '申诉证据不足，维持原处罚决定',
                      '材料不充分，请补充有效凭证后重新申诉',
                      '经核实违规事实清楚，申诉不成立',
                      '处罚依据充分，驳回申诉',
                    ].map((tpl) => (
                      <button
                        key={tpl}
                        onClick={() => setReviewComment(tpl)}
                        className="px-2 py-1 rounded text-[11px] bg-danger-50 text-danger-700 border border-danger-200 hover:bg-danger-100 transition-colors"
                      >
                        {tpl}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-primary-100 flex justify-end gap-2">
              <button
                onClick={() => {
                  setAppealReviewModal({ visible: false, id: null, action: null });
                  setReviewComment('');
                }}
                className="btn-outline text-sm"
              >
                取消
              </button>
              <button
                onClick={handleAppealReview}
                className={cn(
                  'text-sm',
                  appealReviewModal.action === 'approve' ? 'btn-success' : 'btn-danger',
                )}
              >
                <CheckCircle2 size={14} />
                确认{appealReviewModal.action === 'approve' ? '通过' : '驳回'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}