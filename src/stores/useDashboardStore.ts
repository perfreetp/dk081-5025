import { create } from 'zustand';
import type {
  RiskWord,
  RiskLevel,
  TrendDataPoint,
  CategoryRiskItem,
  TeamPerformance,
  TopKeyword,
  DashboardSummary
} from '../mock';
import {
  riskWords as mockRiskWords,
  trendData as mockTrendData,
  categoryRiskData as mockCategoryRisk,
  teamPerformanceData as mockTeamPerformance,
  topKeywords as mockTopKeywords,
  dashboardSummary as mockDashboardSummary
} from '../mock';

export interface RiskWordFilters {
  keyword: string;
  categories: string[];
  levels: RiskLevel[];
  enabledOnly: boolean;
  sortBy: 'hitCount' | 'createTime' | 'updateTime';
  sortOrder: 'asc' | 'desc';
}

export interface RiskWordPagination {
  page: number;
  pageSize: number;
  total: number;
}

interface DashboardStore {
  summary: DashboardSummary;
  trendData: TrendDataPoint[];
  categoryRiskData: CategoryRiskItem[];
  teamPerformanceData: TeamPerformance[];
  topKeywords: TopKeyword[];
  riskWords: RiskWord[];
  filteredRiskWords: RiskWord[];

  wordFilters: RiskWordFilters;
  wordPagination: RiskWordPagination;
  isLoading: boolean;

  refreshSummary: () => void;
  refreshAll: () => void;
  setLoading: (loading: boolean) => void;

  setWordFilters: (partial: Partial<RiskWordFilters>) => void;
  resetWordFilters: () => void;
  setWordPagination: (partial: Partial<RiskWordPagination>) => void;
  setWordPage: (page: number) => void;
  setWordPageSize: (pageSize: number) => void;

  addRiskWord: (word: Omit<RiskWord, 'id' | 'hitCount' | 'createTime' | 'updateTime' | 'operator'>) => void;
  updateRiskWord: (id: string, updates: Partial<RiskWord>) => void;
  deleteRiskWord: (id: string) => void;
  toggleRiskWord: (id: string) => void;
  batchToggleRiskWords: (ids: string[], enabled: boolean) => void;
  batchDeleteRiskWords: (ids: string[]) => void;

  applyWordFilters: () => void;
  getPagedRiskWords: () => RiskWord[];
  getRiskWordStats: () => {
    total: number;
    enabledCount: number;
    disabledCount: number;
    highLevelCount: number;
    totalHits: number;
    categoryBreakdown: { category: string; count: number }[];
  };
}

const defaultWordFilters: RiskWordFilters = {
  keyword: '',
  categories: [],
  levels: [],
  enabledOnly: false,
  sortBy: 'hitCount',
  sortOrder: 'desc'
};

const defaultWordPagination: RiskWordPagination = {
  page: 1,
  pageSize: 15,
  total: 0
};

function filterRiskWords(words: RiskWord[], filters: RiskWordFilters): RiskWord[] {
  return words.filter(word => {
    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      if (!word.word.toLowerCase().includes(kw)) return false;
    }

    if (filters.categories.length > 0 && !filters.categories.includes(word.category)) {
      return false;
    }

    if (filters.levels.length > 0 && !filters.levels.includes(word.level)) {
      return false;
    }

    if (filters.enabledOnly && !word.enabled) {
      return false;
    }

    return true;
  });
}

function sortRiskWords(
  words: RiskWord[],
  sortBy: RiskWordFilters['sortBy'],
  sortOrder: RiskWordFilters['sortOrder']
): RiskWord[] {
  const sorted = [...words];
  const multiplier = sortOrder === 'desc' ? -1 : 1;

  sorted.sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'hitCount':
        comparison = a.hitCount - b.hitCount;
        break;
      case 'createTime':
        comparison = new Date(a.createTime).getTime() - new Date(b.createTime).getTime();
        break;
      case 'updateTime':
        comparison = new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime();
        break;
    }
    return comparison * multiplier;
  });

  return sorted;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  summary: { ...mockDashboardSummary },
  trendData: [...mockTrendData],
  categoryRiskData: [...mockCategoryRisk],
  teamPerformanceData: [...mockTeamPerformance],
  topKeywords: [...mockTopKeywords],
  riskWords: [...mockRiskWords],
  filteredRiskWords: [],

  wordFilters: { ...defaultWordFilters },
  wordPagination: { ...defaultWordPagination, total: mockRiskWords.length },
  isLoading: false,

  refreshSummary: () => {
    set({ isLoading: true });
    setTimeout(() => {
      set({
        summary: {
          ...mockDashboardSummary,
          todayPending: Math.floor(mockDashboardSummary.todayPending + (Math.random() - 0.5) * 50),
          todayReviewed: Math.floor(mockDashboardSummary.todayReviewed + (Math.random() - 0.5) * 100),
          pendingHighRisk: Math.floor(mockDashboardSummary.pendingHighRisk + (Math.random() - 0.5) * 15)
        },
        isLoading: false
      });
    }, 500);
  },

  refreshAll: () => {
    set({ isLoading: true });
    setTimeout(() => {
      set({ isLoading: false });
    }, 800);
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setWordFilters: (partial) => {
    set(state => ({
      wordFilters: { ...state.wordFilters, ...partial }
    }));
    get().applyWordFilters();
  },

  resetWordFilters: () => {
    set({ wordFilters: { ...defaultWordFilters }, wordPagination: { ...defaultWordPagination } });
    get().applyWordFilters();
  },

  setWordPagination: (partial) => {
    set(state => ({
      wordPagination: { ...state.wordPagination, ...partial }
    }));
  },

  setWordPage: (page) => {
    set(state => ({ wordPagination: { ...state.wordPagination, page } }));
  },

  setWordPageSize: (pageSize) => {
    set(state => ({ wordPagination: { ...state.wordPagination, pageSize, page: 1 } }));
    get().applyWordFilters();
  },

  addRiskWord: (word) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const id = `W_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    const newWord: RiskWord = {
      ...word,
      id,
      hitCount: 0,
      createTime: now,
      updateTime: now,
      operator: '当前管理员'
    };

    set(state => ({
      riskWords: [newWord, ...state.riskWords]
    }));
    get().applyWordFilters();
  },

  updateRiskWord: (id, updates) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    set(state => ({
      riskWords: state.riskWords.map(w =>
        w.id === id ? { ...w, ...updates, updateTime: now, operator: '当前管理员' } : w
      )
    }));
    get().applyWordFilters();
  },

  deleteRiskWord: (id) => {
    set(state => ({
      riskWords: state.riskWords.filter(w => w.id !== id)
    }));
    get().applyWordFilters();
  },

  toggleRiskWord: (id) => {
    const word = get().riskWords.find(w => w.id === id);
    if (word) {
      get().updateRiskWord(id, { enabled: !word.enabled });
    }
  },

  batchToggleRiskWords: (ids, enabled) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    set(state => ({
      riskWords: state.riskWords.map(w =>
        ids.includes(w.id) ? { ...w, enabled, updateTime: now, operator: '当前管理员' } : w
      )
    }));
    get().applyWordFilters();
  },

  batchDeleteRiskWords: (ids) => {
    set(state => ({
      riskWords: state.riskWords.filter(w => !ids.includes(w.id))
    }));
    get().applyWordFilters();
  },

  applyWordFilters: () => {
    const { riskWords, wordFilters } = get();
    const filtered = filterRiskWords(riskWords, wordFilters);
    const sorted = sortRiskWords(filtered, wordFilters.sortBy, wordFilters.sortOrder);

    const totalPages = Math.max(1, Math.ceil(sorted.length / get().wordPagination.pageSize));
    const currentPage = Math.min(get().wordPagination.page, totalPages);

    set({
      filteredRiskWords: sorted,
      wordPagination: {
        ...get().wordPagination,
        total: sorted.length,
        page: currentPage
      }
    });
  },

  getPagedRiskWords: () => {
    const { filteredRiskWords, wordPagination } = get();
    const start = (wordPagination.page - 1) * wordPagination.pageSize;
    const end = start + wordPagination.pageSize;
    return filteredRiskWords.slice(start, end);
  },

  getRiskWordStats: () => {
    const { riskWords } = get();
    const enabledCount = riskWords.filter(w => w.enabled).length;
    const highLevelCount = riskWords.filter(w => w.level === 'high').length;
    const totalHits = riskWords.reduce((sum, w) => sum + w.hitCount, 0);

    const categoryMap = new Map<string, number>();
    riskWords.forEach(w => {
      categoryMap.set(w.category, (categoryMap.get(w.category) || 0) + 1);
    });
    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count
    }));

    return {
      total: riskWords.length,
      enabledCount,
      disabledCount: riskWords.length - enabledCount,
      highLevelCount,
      totalHits,
      categoryBreakdown
    };
  }
}));
