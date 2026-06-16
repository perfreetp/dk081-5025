import { create } from 'zustand';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);
import type { PendingProduct, RiskLevel, RiskType, ReviewStatus } from '../mock';
import { pendingProducts as mockProducts } from '../mock';

export interface ReviewFilters {
  riskLevels: RiskLevel[];
  riskTypes: RiskType[];
  categories: string[];
  sellerCreditMin: number | null;
  sellerViolationMax: number | null;
  dateRange: [string, string] | null;
  keyword: string;
  priceRange: [number, number] | null;
}

export interface ReviewPagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface ReviewAction {
  productId: string;
  action: ReviewStatus;
  comment: string;
  operator: string;
  timestamp: string;
}

interface ReviewStore {
  products: PendingProduct[];
  filteredProducts: PendingProduct[];
  filters: ReviewFilters;
  pagination: ReviewPagination;
  selectedProductId: string | null;
  sortBy: 'priority' | 'publishTime' | 'riskScore';
  sortOrder: 'asc' | 'desc';
  reviewHistory: ReviewAction[];
  isLoading: boolean;

  setFilters: (partial: Partial<ReviewFilters>) => void;
  resetFilters: () => void;
  setPagination: (partial: Partial<ReviewPagination>) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSort: (sortBy: 'priority' | 'publishTime' | 'riskScore', sortOrder?: 'asc' | 'desc') => void;
  selectProduct: (productId: string | null) => void;
  setLoading: (loading: boolean) => void;

  reviewProduct: (productId: string, action: ReviewStatus, comment?: string) => void;
  batchReview: (productIds: string[], action: ReviewStatus, comment?: string) => void;

  applyFilters: () => void;
  getPagedProducts: () => PendingProduct[];
  getStats: () => {
    totalPending: number;
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
  };
}

const defaultFilters: ReviewFilters = {
  riskLevels: [],
  riskTypes: [],
  categories: [],
  sellerCreditMin: null,
  sellerViolationMax: null,
  dateRange: null,
  keyword: '',
  priceRange: null
};

const defaultPagination: ReviewPagination = {
  page: 1,
  pageSize: 10,
  total: 0
};

function filterProducts(products: PendingProduct[], filters: ReviewFilters): PendingProduct[] {
  return products.filter(product => {
    if (filters.riskLevels.length > 0 && !filters.riskLevels.includes(product.riskLevel)) {
      return false;
    }

    if (filters.riskTypes.length > 0) {
      const hasMatch = product.riskTypes.some(rt => filters.riskTypes.includes(rt));
      if (!hasMatch) return false;
    }

    if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
      return false;
    }

    if (filters.sellerCreditMin !== null && product.seller.creditScore < filters.sellerCreditMin) {
      return false;
    }

    if (filters.sellerViolationMax !== null && product.seller.violationCount > filters.sellerViolationMax) {
      return false;
    }

    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      const inTitle = product.title.toLowerCase().includes(kw);
      const inDesc = product.description.toLowerCase().includes(kw);
      const inSeller = product.seller.name.toLowerCase().includes(kw);
      const inHighlight = product.highlightWords.some(hw => hw.word.toLowerCase().includes(kw));
      if (!inTitle && !inDesc && !inSeller && !inHighlight) return false;
    }

    if (filters.priceRange !== null) {
      const [minPrice, maxPrice] = filters.priceRange;
      if (product.price < minPrice || product.price > maxPrice) {
        return false;
      }
    }

    if (filters.dateRange !== null) {
      const [startDate, endDate] = filters.dateRange;
      const publishTime = dayjs(product.publishTime);
      if (!publishTime.isBetween(startDate, endDate, 'day', '[]')) {
        return false;
      }
    }

    if (product.reviewStatus !== 'pending') {
      return false;
    }

    return true;
  });
}

function sortProducts(
  products: PendingProduct[],
  sortBy: 'priority' | 'publishTime' | 'riskScore',
  sortOrder: 'asc' | 'desc'
): PendingProduct[] {
  const sorted = [...products];
  const multiplier = sortOrder === 'desc' ? -1 : 1;

  sorted.sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'priority':
        comparison = a.priority - b.priority;
        break;
      case 'riskScore':
        comparison = a.riskScore - b.riskScore;
        break;
      case 'publishTime':
        comparison = new Date(a.publishTime).getTime() - new Date(b.publishTime).getTime();
        break;
    }
    return comparison * multiplier;
  });

  return sorted;
}

export const useReviewStore = create<ReviewStore>((set, get) => ({
  products: [...mockProducts],
  filteredProducts: [],
  filters: { ...defaultFilters },
  pagination: { ...defaultPagination, total: mockProducts.length },
  selectedProductId: null,
  sortBy: 'priority',
  sortOrder: 'desc',
  reviewHistory: [],
  isLoading: false,

  setFilters: (partial) => {
    set(state => {
      const newFilters = { ...state.filters, ...partial };
      return { filters: newFilters };
    });
    get().applyFilters();
  },

  resetFilters: () => {
    set({ filters: { ...defaultFilters }, pagination: { ...defaultPagination } });
    get().applyFilters();
  },

  setPagination: (partial) => {
    set(state => ({
      pagination: { ...state.pagination, ...partial }
    }));
  },

  setPage: (page) => {
    set(state => ({ pagination: { ...state.pagination, page } }));
  },

  setPageSize: (pageSize) => {
    set(state => ({ pagination: { ...state.pagination, pageSize, page: 1 } }));
  },

  setSort: (sortBy, sortOrder) => {
    const current = get();
    const order = sortOrder || (sortBy === current.sortBy ? (current.sortOrder === 'desc' ? 'asc' : 'desc') : 'desc');
    set({ sortBy, sortOrder: order });
    get().applyFilters();
  },

  selectProduct: (productId) => {
    set({ selectedProductId: productId });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  reviewProduct: (productId, action, comment = '') => {
    const actionRecord: ReviewAction = {
      productId,
      action,
      comment,
      operator: '当前审核员',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    set(state => ({
      products: state.products.map(p =>
        p.id === productId ? { ...p, reviewStatus: action } : p
      ),
      reviewHistory: [...state.reviewHistory, actionRecord]
    }));

    get().applyFilters();
  },

  batchReview: (productIds, action, comment = '') => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const actions: ReviewAction[] = productIds.map(id => ({
      productId: id,
      action,
      comment,
      operator: '当前审核员',
      timestamp
    }));

    set(state => ({
      products: state.products.map(p =>
        productIds.includes(p.id) ? { ...p, reviewStatus: action } : p
      ),
      reviewHistory: [...state.reviewHistory, ...actions]
    }));

    get().applyFilters();
  },

  applyFilters: () => {
    const { products, filters, sortBy, sortOrder } = get();
    const filtered = filterProducts(products, filters);
    const sorted = sortProducts(filtered, sortBy, sortOrder);

    const totalPages = Math.max(1, Math.ceil(sorted.length / get().pagination.pageSize));
    const currentPage = Math.min(get().pagination.page, totalPages);

    set({
      filteredProducts: sorted,
      pagination: {
        ...get().pagination,
        total: sorted.length,
        page: currentPage
      }
    });
  },

  getPagedProducts: () => {
    const { filteredProducts, pagination } = get();
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredProducts.slice(start, end);
  },

  getStats: () => {
    const pending = get().products.filter(p => p.reviewStatus === 'pending');
    return {
      totalPending: pending.length,
      highRiskCount: pending.filter(p => p.riskLevel === 'high').length,
      mediumRiskCount: pending.filter(p => p.riskLevel === 'medium').length,
      lowRiskCount: pending.filter(p => p.riskLevel === 'low').length
    };
  }
}));
