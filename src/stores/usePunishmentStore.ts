import { create } from 'zustand';
import type {
  PunishmentRecord,
  PunishmentType,
  AppealRecord,
  AppealStatus,
  RiskType,
  OperationLog,
  DisposalTimelineEvent
} from '../mock';
import {
  punishmentRecords as mockPunishments,
  appealRecords as mockAppeals
} from '../mock';
import { useReviewStore } from './useReviewStore';

export interface PunishmentFilters {
  keyword: string;
  punishmentTypes: PunishmentType[];
  statuses: ('active' | 'expired' | 'revoked')[];
  riskTypes: RiskType[];
  operators: string[];
  sellerKeyword: string;
  dateRange: [string, string] | null;
  appealAvailableOnly: boolean;
  sortBy: 'createTime' | 'effectiveDays';
  sortOrder: 'asc' | 'desc';
}

export interface PunishmentPagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface AppealFilters {
  keyword: string;
  statuses: AppealStatus[];
  reviewers: string[];
  dateRange: [string, string] | null;
  sortBy: 'appealTime' | 'reviewTime';
  sortOrder: 'asc' | 'desc';
}

export interface AppealPagination {
  page: number;
  pageSize: number;
  total: number;
}

interface PunishmentStore {
  punishmentRecords: PunishmentRecord[];
  filteredPunishments: PunishmentRecord[];
  punishmentFilters: PunishmentFilters;
  punishmentPagination: PunishmentPagination;
  selectedPunishmentId: string | null;

  appealRecords: AppealRecord[];
  filteredAppeals: AppealRecord[];
  appealFilters: AppealFilters;
  appealPagination: AppealPagination;
  selectedAppealId: string | null;

  appealsByPunishment: Record<string, AppealRecord[]>;

  isLoading: boolean;

  setPunishmentFilters: (partial: Partial<PunishmentFilters>) => void;
  resetPunishmentFilters: () => void;
  setPunishmentPagination: (partial: Partial<PunishmentPagination>) => void;
  setPunishmentPage: (page: number) => void;
  setPunishmentPageSize: (pageSize: number) => void;
  selectPunishment: (id: string | null) => void;

  setAppealFilters: (partial: Partial<AppealFilters>) => void;
  resetAppealFilters: () => void;
  setAppealPagination: (partial: Partial<AppealPagination>) => void;
  setAppealPage: (page: number) => void;
  setAppealPageSize: (pageSize: number) => void;
  selectAppeal: (id: string | null) => void;

  setLoading: (loading: boolean) => void;

  revokePunishment: (id: string, reason?: string) => void;
  extendPunishment: (id: string, days: number) => void;

  reviewAppeal: (id: string, approved: boolean, comment: string) => void;

  applyPunishmentFilters: () => void;
  applyAppealFilters: () => void;
  getPagedPunishments: () => PunishmentRecord[];
  getPagedAppeals: () => AppealRecord[];

  getPunishmentStats: () => {
    total: number;
    activeCount: number;
    expiredCount: number;
    revokedCount: number;
    appealableCount: number;
    typeBreakdown: { type: PunishmentType; count: number }[];
    dailyDistribution: { date: string; count: number }[];
  };

  getAppealStats: () => {
    total: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    approvalRate: number;
  };

  getDisposalTimeline: (productId?: string, punishmentId?: string) => DisposalTimelineEvent[];
}

const defaultPunishmentFilters: PunishmentFilters = {
  keyword: '',
  punishmentTypes: [],
  statuses: [],
  riskTypes: [],
  operators: [],
  sellerKeyword: '',
  dateRange: null,
  appealAvailableOnly: false,
  sortBy: 'createTime',
  sortOrder: 'desc'
};

const defaultPunishmentPagination: PunishmentPagination = {
  page: 1,
  pageSize: 10,
  total: 0
};

const defaultAppealFilters: AppealFilters = {
  keyword: '',
  statuses: [],
  reviewers: [],
  dateRange: null,
  sortBy: 'appealTime',
  sortOrder: 'desc'
};

const defaultAppealPagination: AppealPagination = {
  page: 1,
  pageSize: 8,
  total: 0
};

function filterPunishments(records: PunishmentRecord[], filters: PunishmentFilters): PunishmentRecord[] {
  return records.filter(record => {
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      const inTitle = record.productTitle.toLowerCase().includes(kw);
      const inId = record.id.toLowerCase().includes(kw);
      const inPid = record.productId.toLowerCase().includes(kw);
      const inReason = record.punishmentReason.toLowerCase().includes(kw);
      if (!inTitle && !inId && !inPid && !inReason) return false;
    }

    if (filters.sellerKeyword) {
      const kw = filters.sellerKeyword.toLowerCase();
      if (!record.sellerName.toLowerCase().includes(kw) &&
          !record.sellerId.toLowerCase().includes(kw)) return false;
    }

    if (filters.punishmentTypes.length > 0 && !filters.punishmentTypes.includes(record.punishmentType)) {
      return false;
    }

    if (filters.statuses.length > 0 && !filters.statuses.includes(record.status)) {
      return false;
    }

    if (filters.riskTypes.length > 0) {
      const hasMatch = record.riskTypes.some(rt => filters.riskTypes.includes(rt));
      if (!hasMatch) return false;
    }

    if (filters.operators.length > 0 && !filters.operators.includes(record.operator)) {
      return false;
    }

    if (filters.appealAvailableOnly && !record.appealAvailable) {
      return false;
    }

    return true;
  });
}

function sortPunishments(
  records: PunishmentRecord[],
  sortBy: PunishmentFilters['sortBy'],
  sortOrder: PunishmentFilters['sortOrder']
): PunishmentRecord[] {
  const sorted = [...records];
  const multiplier = sortOrder === 'desc' ? -1 : 1;

  sorted.sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'createTime':
        comparison = new Date(a.createTime).getTime() - new Date(b.createTime).getTime();
        break;
      case 'effectiveDays':
        comparison = a.effectiveDays - b.effectiveDays;
        break;
    }
    return comparison * multiplier;
  });

  return sorted;
}

function filterAppeals(records: AppealRecord[], filters: AppealFilters): AppealRecord[] {
  return records.filter(record => {
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      const inTitle = record.productTitle.toLowerCase().includes(kw);
      const inReason = record.appealReason.toLowerCase().includes(kw);
      const inSeller = record.sellerName.toLowerCase().includes(kw);
      if (!inTitle && !inReason && !inSeller) return false;
    }

    if (filters.statuses.length > 0 && !filters.statuses.includes(record.status)) {
      return false;
    }

    if (filters.reviewers.length > 0) {
      if (!record.reviewer || !filters.reviewers.includes(record.reviewer)) return false;
    }

    return true;
  });
}

function sortAppeals(
  records: AppealRecord[],
  sortBy: AppealFilters['sortBy'],
  sortOrder: AppealFilters['sortOrder']
): AppealRecord[] {
  const sorted = [...records];
  const multiplier = sortOrder === 'desc' ? -1 : 1;

  sorted.sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'appealTime':
        comparison = new Date(a.appealTime).getTime() - new Date(b.appealTime).getTime();
        break;
      case 'reviewTime':
        const aTime = a.reviewTime ? new Date(a.reviewTime).getTime() : 0;
        const bTime = b.reviewTime ? new Date(b.reviewTime).getTime() : 0;
        comparison = aTime - bTime;
        break;
    }
    return comparison * multiplier;
  });

  return sorted;
}

function buildAppealsByPunishment(appeals: AppealRecord[]): Record<string, AppealRecord[]> {
  const map: Record<string, AppealRecord[]> = {};
  for (const appeal of appeals) {
    if (!map[appeal.punishmentId]) {
      map[appeal.punishmentId] = [];
    }
    map[appeal.punishmentId].push(appeal);
  }
  return map;
}

export const usePunishmentStore = create<PunishmentStore>((set, get) => ({
  punishmentRecords: [...mockPunishments],
  filteredPunishments: [],
  punishmentFilters: { ...defaultPunishmentFilters },
  punishmentPagination: { ...defaultPunishmentPagination, total: mockPunishments.length },
  selectedPunishmentId: null,

  appealRecords: [...mockAppeals],
  filteredAppeals: [],
  appealFilters: { ...defaultAppealFilters },
  appealPagination: { ...defaultAppealPagination, total: mockAppeals.length },
  selectedAppealId: null,

  appealsByPunishment: buildAppealsByPunishment(mockAppeals),

  isLoading: false,

  setPunishmentFilters: (partial) => {
    set(state => ({
      punishmentFilters: { ...state.punishmentFilters, ...partial }
    }));
    get().applyPunishmentFilters();
  },

  resetPunishmentFilters: () => {
    set({
      punishmentFilters: { ...defaultPunishmentFilters },
      punishmentPagination: { ...defaultPunishmentPagination }
    });
    get().applyPunishmentFilters();
  },

  setPunishmentPagination: (partial) => {
    set(state => ({
      punishmentPagination: { ...state.punishmentPagination, ...partial }
    }));
  },

  setPunishmentPage: (page) => {
    set(state => ({ punishmentPagination: { ...state.punishmentPagination, page } }));
  },

  setPunishmentPageSize: (pageSize) => {
    set(state => ({ punishmentPagination: { ...state.punishmentPagination, pageSize, page: 1 } }));
    get().applyPunishmentFilters();
  },

  selectPunishment: (id) => {
    set({ selectedPunishmentId: id });
  },

  setAppealFilters: (partial) => {
    set(state => ({
      appealFilters: { ...state.appealFilters, ...partial }
    }));
    get().applyAppealFilters();
  },

  resetAppealFilters: () => {
    set({
      appealFilters: { ...defaultAppealFilters },
      appealPagination: { ...defaultAppealPagination }
    });
    get().applyAppealFilters();
  },

  setAppealPagination: (partial) => {
    set(state => ({
      appealPagination: { ...state.appealPagination, ...partial }
    }));
  },

  setAppealPage: (page) => {
    set(state => ({ appealPagination: { ...state.appealPagination, page } }));
  },

  setAppealPageSize: (pageSize) => {
    set(state => ({ appealPagination: { ...state.appealPagination, pageSize, page: 1 } }));
    get().applyAppealFilters();
  },

  selectAppeal: (id) => {
    set({ selectedAppealId: id });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  revokePunishment: (id, reason) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const logId = `LOG_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    set(state => ({
      punishmentRecords: state.punishmentRecords.map(r =>
        r.id === id ? {
          ...r,
          status: 'revoked',
          appealAvailable: false,
          operationLogs: [
            ...r.operationLogs,
            {
              id: logId,
              action: 'revoke',
              operator: '当前审核员',
              operatorRole: '审核员',
              time: now,
              comment: reason
            } as OperationLog
          ]
        } : r
      )
    }));
    get().applyPunishmentFilters();
  },

  extendPunishment: (id, days) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const logId = `LOG_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    set(state => ({
      punishmentRecords: state.punishmentRecords.map(r =>
        r.id === id && r.effectiveDays > 0
          ? {
              ...r,
              effectiveDays: r.effectiveDays + days,
              operationLogs: [
                ...r.operationLogs,
                {
                  id: logId,
                  action: 'extend',
                  operator: '当前审核员',
                  operatorRole: '审核员',
                  time: now,
                  comment: `延期${days}天`,
                  extra: { addDays: days }
                } as OperationLog
              ]
            }
          : r
      )
    }));
    get().applyPunishmentFilters();
  },

  reviewAppeal: (id, approved, comment) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newStatus: AppealStatus = approved ? 'approved' : 'rejected';
    const logId = `LOG_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    set(state => {
      const appeal = state.appealRecords.find(a => a.id === id);
      const updatedAppeals: AppealRecord[] = state.appealRecords.map(a =>
        a.id === id ? {
          ...a,
          status: newStatus,
          reviewer: '当前审核员',
          reviewTime: now,
          reviewComment: comment
        } : a
      );

      let updatedPunishments = state.punishmentRecords;
      if (appeal) {
        updatedPunishments = state.punishmentRecords.map(p => {
          if (p.id === appeal.punishmentId) {
            const baseUpdates: Partial<PunishmentRecord> = {
              operationLogs: [
                ...p.operationLogs,
                {
                  id: logId,
                  action: approved ? 'appeal_approve' : 'appeal_reject',
                  operator: '当前审核员',
                  operatorRole: '审核员',
                  time: now,
                  comment: comment,
                  extra: { appealId: appeal.id }
                } as OperationLog
              ]
            };
            if (approved) {
              baseUpdates.status = 'revoked';
              baseUpdates.appealAvailable = false;
            }
            return { ...p, ...baseUpdates };
          }
          return p;
        });
      }

      return {
        appealRecords: updatedAppeals,
        punishmentRecords: updatedPunishments,
        appealsByPunishment: buildAppealsByPunishment(updatedAppeals)
      };
    });
    get().applyAppealFilters();
    get().applyPunishmentFilters();
  },

  applyPunishmentFilters: () => {
    const { punishmentRecords, punishmentFilters } = get();
    const filtered = filterPunishments(punishmentRecords, punishmentFilters);
    const sorted = sortPunishments(filtered, punishmentFilters.sortBy, punishmentFilters.sortOrder);

    const totalPages = Math.max(1, Math.ceil(sorted.length / get().punishmentPagination.pageSize));
    const currentPage = Math.min(get().punishmentPagination.page, totalPages);

    set({
      filteredPunishments: sorted,
      punishmentPagination: {
        ...get().punishmentPagination,
        total: sorted.length,
        page: currentPage
      }
    });
  },

  applyAppealFilters: () => {
    const { appealRecords, appealFilters } = get();
    const filtered = filterAppeals(appealRecords, appealFilters);
    const sorted = sortAppeals(filtered, appealFilters.sortBy, appealFilters.sortOrder);

    const totalPages = Math.max(1, Math.ceil(sorted.length / get().appealPagination.pageSize));
    const currentPage = Math.min(get().appealPagination.page, totalPages);

    set({
      filteredAppeals: sorted,
      appealPagination: {
        ...get().appealPagination,
        total: sorted.length,
        page: currentPage
      }
    });
  },

  getPagedPunishments: () => {
    const { filteredPunishments, punishmentPagination } = get();
    const start = (punishmentPagination.page - 1) * punishmentPagination.pageSize;
    const end = start + punishmentPagination.pageSize;
    return filteredPunishments.slice(start, end);
  },

  getPagedAppeals: () => {
    const { filteredAppeals, appealPagination } = get();
    const start = (appealPagination.page - 1) * appealPagination.pageSize;
    const end = start + appealPagination.pageSize;
    return filteredAppeals.slice(start, end);
  },

  getPunishmentStats: () => {
    const { punishmentRecords } = get();
    const activeCount = punishmentRecords.filter(r => r.status === 'active').length;
    const expiredCount = punishmentRecords.filter(r => r.status === 'expired').length;
    const revokedCount = punishmentRecords.filter(r => r.status === 'revoked').length;
    const appealableCount = punishmentRecords.filter(r => r.appealAvailable).length;

    const typeMap = new Map<PunishmentType, number>();
    (['warning', 'delist', 'restriction', 'ban_account', 'fine'] as PunishmentType[]).forEach(t => typeMap.set(t, 0));
    punishmentRecords.forEach(r => {
      typeMap.set(r.punishmentType, (typeMap.get(r.punishmentType) || 0) + 1);
    });
    const typeBreakdown = Array.from(typeMap.entries()).map(([type, count]) => ({ type, count }));

    const dailyMap = new Map<string, number>();
    punishmentRecords.forEach(r => {
      const date = r.createTime.slice(0, 10);
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    });
    const dailyDistribution = Array.from(dailyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    return {
      total: punishmentRecords.length,
      activeCount,
      expiredCount,
      revokedCount,
      appealableCount,
      typeBreakdown,
      dailyDistribution
    };
  },

  getAppealStats: () => {
    const { appealRecords } = get();
    const pendingCount = appealRecords.filter(a => a.status === 'pending').length;
    const approvedCount = appealRecords.filter(a => a.status === 'approved').length;
    const rejectedCount = appealRecords.filter(a => a.status === 'rejected').length;
    const reviewedCount = approvedCount + rejectedCount;
    const approvalRate = reviewedCount > 0 ? parseFloat(((approvedCount / reviewedCount) * 100).toFixed(1)) : 0;

    return {
      total: appealRecords.length,
      pendingCount,
      approvedCount,
      rejectedCount,
      approvalRate
    };
  },

  getDisposalTimeline: (productId, punishmentId) => {
    const { punishmentRecords, appealRecords } = get();
    const events: DisposalTimelineEvent[] = [];

    let filteredPunishments = punishmentRecords;
    if (punishmentId) {
      filteredPunishments = punishmentRecords.filter(p => p.id === punishmentId);
    } else if (productId) {
      filteredPunishments = punishmentRecords.filter(p => p.productId === productId);
    }

    for (const punishment of filteredPunishments) {
      for (const log of punishment.operationLogs) {
        events.push({
          id: `EVT_${log.id}`,
          sourceType: 'punishment',
          actionType: log.action,
          productId: punishment.productId,
          productTitle: punishment.productTitle,
          punishmentId: punishment.id,
          operator: log.operator,
          operatorRole: log.operatorRole,
          time: log.time,
          comment: log.comment,
          extra: log.extra
        });
      }
    }

    let filteredAppeals = appealRecords;
    if (punishmentId) {
      filteredAppeals = appealRecords.filter(a => a.punishmentId === punishmentId);
    } else if (productId) {
      filteredAppeals = appealRecords.filter(a => a.productId === productId);
    }

    for (const appeal of filteredAppeals) {
      events.push({
        id: `EVT_APPEAL_SUBMIT_${appeal.id}`,
        sourceType: 'appeal',
        actionType: 'appeal_submit',
        productId: appeal.productId,
        productTitle: appeal.productTitle,
        punishmentId: appeal.punishmentId,
        appealId: appeal.id,
        operator: appeal.sellerName,
        operatorRole: '申诉人',
        time: appeal.appealTime,
        comment: appeal.appealReason
      });

      if (appeal.status !== 'pending' && appeal.reviewTime) {
        events.push({
          id: `EVT_APPEAL_REVIEW_${appeal.id}`,
          sourceType: 'appeal',
          actionType: appeal.status === 'approved' ? 'appeal_approve' : 'appeal_reject',
          productId: appeal.productId,
          productTitle: appeal.productTitle,
          punishmentId: appeal.punishmentId,
          appealId: appeal.id,
          operator: appeal.reviewer || '审核员',
          operatorRole: '审核员',
          time: appeal.reviewTime,
          comment: appeal.reviewComment
        });
      }
    }

    const reviewStore = useReviewStore.getState();
    let reviewEvents: DisposalTimelineEvent[] = [];
    if (punishmentId) {
      const punishment = punishmentRecords.find(p => p.id === punishmentId);
      if (punishment) {
        reviewEvents = reviewStore.getDisposalTimeline(punishment.productId);
      }
    } else if (productId) {
      reviewEvents = reviewStore.getDisposalTimeline(productId);
    } else {
      reviewEvents = reviewStore.getDisposalTimeline();
    }
    events.push(...reviewEvents);

    events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    return events;
  }
}));
