import { useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Minus,
  TrendingUp,
  Edit,
  Trash2,
  RefreshCw,
  Award,
  Target,
  Timer,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { Switch, Select, Pagination } from 'antd';
import { DataCard } from '@/components/DataCard';
import { RiskBadge } from '@/components/RiskBadge';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { cn } from '@/lib/utils';
import type { RiskLevel } from '@/mock';

const { Option } = Select;

const CATEGORY_OPTIONS = [
  '违禁品词',
  '敏感词',
  '引流词',
  '假冒词',
  '医疗词',
  '政治敏感',
  '色情低俗',
  '联系方式',
];

const LEVEL_OPTIONS: { value: RiskLevel; label: string }[] = [
  { value: 'high', label: '高风险' },
  { value: 'medium', label: '中风险' },
  { value: 'low', label: '低风险' },
];

const TREND_COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#3B82F6',
};

const CATEGORY_BAR_COLORS = [
  '#EF4444',
  '#F59E0B',
  '#3B82F6',
  '#8B5CF6',
  '#10B981',
  '#EC4899',
  '#06B6D4',
  '#F97316',
  '#84CC16',
  '#6366F1',
];

const renderTrendIcon = (trend: 'up' | 'down' | 'stable', trendValue: number) => {
  if (trend === 'up') {
    return (
      <span className="inline-flex items-center gap-0.5 text-danger-600 text-xs font-medium">
        <ChevronUp className="w-3 h-3" />
        {trendValue.toFixed(1)}%
      </span>
    );
  }
  if (trend === 'down') {
    return (
      <span className="inline-flex items-center gap-0.5 text-success-600 text-xs font-medium">
        <ChevronDown className="w-3 h-3" />
        {trendValue.toFixed(1)}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-primary-400 text-xs font-medium">
      <Minus className="w-3 h-3" />
      {trendValue.toFixed(1)}%
    </span>
  );
};

export default function Home() {
  const {
    summary,
    trendData,
    categoryRiskData,
    teamPerformanceData,
    topKeywords,
    wordFilters,
    wordPagination,
    setWordFilters,
    setWordPage,
    setWordPageSize,
    toggleRiskWord,
    deleteRiskWord,
    applyWordFilters,
    getPagedRiskWords,
    refreshSummary,
  } = useDashboardStore();

  const pagedRiskWords = getPagedRiskWords();

  useEffect(() => {
    applyWordFilters();
  }, [applyWordFilters]);

  const performanceRanking = useMemo(() => {
    return [...teamPerformanceData].sort((a, b) => b.accuracy - a.accuracy);
  }, [teamPerformanceData]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWordFilters({ keyword: e.target.value });
  };

  const handleCategoryChange = (value: string[]) => {
    setWordFilters({ categories: value });
  };

  const handleLevelChange = (value: RiskLevel[]) => {
    setWordFilters({ levels: value });
  };

  const handleToggle = (id: string) => {
    toggleRiskWord(id);
  };

  const handleDelete = (id: string) => {
    deleteRiskWord(id);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="page-header">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-info-600" />
              规则总览
            </h1>
            <p className="page-subtitle">风控审核数据概览与关键指标监控</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => refreshSummary()}
              className="btn-outline text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              刷新数据
            </button>
            <div className="flex items-center gap-2 text-sm text-primary-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="badge-dot badge-dot-success animate-pulse-slow" />
                系统运行正常
              </span>
              <span className="text-primary-300">|</span>
              <span>最后更新: 刚刚</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <DataCard
          title="待审总量"
          value={summary.todayPending}
          icon={Clock}
          gradient="warning"
          trend={8.5}
          trendLabel="较昨日"
        />
        <DataCard
          title="今日已审"
          value={summary.todayReviewed}
          icon={CheckCircle2}
          gradient="info"
          trend={12.3}
          trendLabel="较昨日"
        />
        <DataCard
          title="通过率"
          value={`${summary.passRate.toFixed(1)}%`}
          icon={Target}
          gradient="success"
          trend={2.1}
          trendLabel="较昨日"
          unit=""
        />
        <DataCard
          title="高风险数"
          value={summary.pendingHighRisk}
          icon={AlertTriangle}
          gradient="danger"
          trend={-5.7}
          trendLabel="较昨日"
        />
        <DataCard
          title="活跃规则数"
          value={summary.activeRules}
          icon={Zap}
          gradient="purple"
          trend={3.2}
          trendLabel="本周新增"
        />
      </div>

      <div className="risk-card p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-primary-900 text-base">14天风险趋势</h2>
            <p className="text-xs text-primary-400 mt-1">按风险等级统计的审核量变化趋势</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: TREND_COLORS.high }} />
              <span className="text-primary-600">高风险</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: TREND_COLORS.medium }} />
              <span className="text-primary-600">中风险</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: TREND_COLORS.low }} />
              <span className="text-primary-600">低风险</span>
            </div>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={TREND_COLORS.high} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={TREND_COLORS.high} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={TREND_COLORS.medium} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={TREND_COLORS.medium} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={TREND_COLORS.low} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={TREND_COLORS.low} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.1)',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#1E293B', fontWeight: 600, marginBottom: '4px' }}
                itemStyle={{ color: '#475569' }}
              />
              <Area
                type="monotone"
                dataKey="lowRiskCount"
                name="低风险"
                stackId="1"
                stroke={TREND_COLORS.low}
                strokeWidth={2}
                fill="url(#colorLow)"
              />
              <Area
                type="monotone"
                dataKey="mediumRiskCount"
                name="中风险"
                stackId="1"
                stroke={TREND_COLORS.medium}
                strokeWidth={2}
                fill="url(#colorMedium)"
              />
              <Area
                type="monotone"
                dataKey="highRiskCount"
                name="高风险"
                stackId="1"
                stroke={TREND_COLORS.high}
                strokeWidth={2}
                fill="url(#colorHigh)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 risk-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-primary-900 text-base">类目风险分布</h2>
              <p className="text-xs text-primary-400 mt-1">各商品类目的风险商品数量统计</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryRiskData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  tick={{ fill: '#475569', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={72}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.1)',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: '#1E293B', fontWeight: 600 }}
                  formatter={(value: number, name: string) => {
                    const nameMap: Record<string, string> = {
                      totalCount: '总量',
                      highRiskCount: '高风险',
                      mediumRiskCount: '中风险',
                      lowRiskCount: '低风险',
                    };
                    return [value.toLocaleString(), nameMap[name] || name];
                  }}
                />
                <Legend
                  iconType="square"
                  wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                  formatter={(value: string) => {
                    const nameMap: Record<string, string> = {
                      highRiskCount: '高风险',
                      mediumRiskCount: '中风险',
                      lowRiskCount: '低风险',
                    };
                    return <span className="text-primary-600">{nameMap[value] || value}</span>;
                  }}
                />
                <Bar dataKey="lowRiskCount" name="低风险" stackId="a" fill={TREND_COLORS.low} radius={[0, 0, 0, 0]} />
                <Bar dataKey="mediumRiskCount" name="中风险" stackId="a" fill={TREND_COLORS.medium} />
                <Bar
                  dataKey="highRiskCount"
                  name="高风险"
                  stackId="a"
                  fill={TREND_COLORS.high}
                  radius={[0, 4, 4, 0]}
                >
                  {categoryRiskData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_BAR_COLORS[index % CATEGORY_BAR_COLORS.length]} fillOpacity={0} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 risk-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-primary-900 text-base">Top关键词命中</h2>
              <p className="text-xs text-primary-400 mt-1">最近7天命中次数排名</p>
            </div>
            <TrendingUp className="w-4 h-4 text-primary-400" />
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin pr-1">
            {topKeywords.map((item, index) => (
              <div
                key={item.keyword}
                className="flex items-center gap-3 p-3 rounded-lg bg-primary-50/50 hover:bg-primary-50 transition-colors duration-150"
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0',
                    index === 0
                      ? 'bg-danger-500 text-white'
                      : index === 1
                      ? 'bg-warning-500 text-white'
                      : index === 2
                      ? 'bg-info-500 text-white'
                      : 'bg-primary-200 text-primary-600'
                  )}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-primary-900 truncate">{item.keyword}</span>
                    <RiskBadge level={item.level} size="sm" showText={false} />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-primary-400">
                      命中 <span className="text-primary-700 font-medium tabular-nums">{item.hitCount.toLocaleString()}</span> 次
                    </span>
                    {renderTrendIcon(item.trend, item.trendValue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="risk-card p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-primary-900 text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-warning-500" />
              团队绩效排名
            </h2>
            <p className="text-xs text-primary-400 mt-1">按审核准确率排序的团队成员表现</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-16">排名</th>
                <th>审核人员</th>
                <th className="w-28 text-right">审核总量</th>
                <th className="w-24 text-right">通过率</th>
                <th className="w-24 text-right">封禁率</th>
                <th className="w-28 text-right">平均耗时</th>
                <th className="w-28 text-right">准确率</th>
                <th className="w-32 text-right">今日进度</th>
              </tr>
            </thead>
            <tbody>
              {performanceRanking.map((member, index) => {
                const passRate = member.totalReviews > 0 ? (member.approvedCount / member.totalReviews) * 100 : 0;
                const banRate = member.totalReviews > 0 ? (member.bannedCount / member.totalReviews) * 100 : 0;
                const progress = member.dailyTarget > 0 ? Math.min((member.completedToday / member.dailyTarget) * 100, 100) : 0;
                return (
                  <tr key={member.reviewerId}>
                    <td>
                      <div
                        className={cn(
                          'w-6 h-6 rounded flex items-center justify-center text-xs font-bold',
                          index === 0
                            ? 'bg-danger-500 text-white'
                            : index === 1
                            ? 'bg-warning-500 text-white'
                            : index === 2
                            ? 'bg-info-500 text-white'
                            : 'bg-primary-100 text-primary-600'
                        )}
                      >
                        {index + 1}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <img
                          src={member.reviewerAvatar}
                          alt={member.reviewerName}
                          className="w-8 h-8 rounded-full object-cover bg-primary-100"
                        />
                        <div>
                          <p className="text-sm font-medium text-primary-900">{member.reviewerName}</p>
                          <p className="text-xs text-primary-400">ID: {member.reviewerId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-right font-mono text-primary-900">{member.totalReviews.toLocaleString()}</td>
                    <td className="text-right">
                      <span className="text-success-600 font-medium">{passRate.toFixed(1)}%</span>
                    </td>
                    <td className="text-right">
                      <span className="text-danger-600 font-medium">{banRate.toFixed(1)}%</span>
                    </td>
                    <td className="text-right">
                      <span className="inline-flex items-center gap-1 text-primary-700 font-mono">
                        <Timer className="w-3 h-3 text-primary-400" />
                        {member.avgReviewTime}s
                      </span>
                    </td>
                    <td className="text-right">
                      <span
                        className={cn(
                          'font-semibold',
                          member.accuracy >= 98
                            ? 'text-success-600'
                            : member.accuracy >= 95
                            ? 'text-info-600'
                            : member.accuracy >= 92
                            ? 'text-warning-600'
                            : 'text-danger-600'
                        )}
                      >
                        {member.accuracy.toFixed(2)}%
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 justify-end">
                        <div className="w-20 progress-bar">
                          <div
                            className={cn(
                              'progress-bar-fill',
                              progress >= 100
                                ? 'bg-success-500'
                                : progress >= 60
                                ? 'bg-info-500'
                                : 'bg-warning-500'
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-primary-500 tabular-nums w-10 text-right">
                          {member.completedToday}/{member.dailyTarget}
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

      <div className="risk-card p-5">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="font-semibold text-primary-900 text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-danger-500" />
              风险词库管理
            </h2>
            <p className="text-xs text-primary-400 mt-1">管理平台风险关键词库，支持分类筛选与状态控制</p>
          </div>
        </div>

        <div className="toolbar">
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
            <input
              type="text"
              placeholder="搜索关键词..."
              value={wordFilters.keyword}
              onChange={handleSearchChange}
              className="input-field pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary-400" />
            <Select
              mode="multiple"
              placeholder="分类筛选"
              value={wordFilters.categories}
              onChange={handleCategoryChange}
              allowClear
              style={{ minWidth: 200 }}
              size="middle"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <Option key={cat} value={cat}>
                  {cat}
                </Option>
              ))}
            </Select>
            <Select
              mode="multiple"
              placeholder="等级筛选"
              value={wordFilters.levels}
              onChange={handleLevelChange}
              allowClear
              style={{ minWidth: 160 }}
              size="middle"
            >
              {LEVEL_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </div>
          <div className="ml-auto text-xs text-primary-500">
            共 <span className="text-primary-900 font-semibold tabular-nums">{wordPagination.total}</span> 条记录
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-16">序号</th>
                <th>关键词</th>
                <th className="w-32">分类</th>
                <th className="w-32">风险等级</th>
                <th className="w-32 text-right">命中次数</th>
                <th className="w-32">最后更新</th>
                <th className="w-24">操作人</th>
                <th className="w-24">状态</th>
                <th className="w-28 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {pagedRiskWords.length > 0 ? (
                pagedRiskWords.map((word, index) => (
                  <tr key={word.id}>
                    <td>
                      <span className="text-xs text-primary-400 tabular-nums">
                        {(wordPagination.page - 1) * wordPagination.pageSize + index + 1}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm font-medium text-primary-900 font-mono">{word.word}</span>
                    </td>
                    <td>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-primary-100 text-primary-700">
                        {word.category}
                      </span>
                    </td>
                    <td>
                      <RiskBadge level={word.level} size="sm" />
                    </td>
                    <td className="text-right">
                      <span className="font-mono text-primary-900 font-medium">{word.hitCount.toLocaleString()}</span>
                    </td>
                    <td>
                      <span className="text-xs text-primary-500 tabular-nums">{word.updateTime}</span>
                    </td>
                    <td>
                      <span className="text-xs text-primary-600">{word.operator}</span>
                    </td>
                    <td>
                      <Switch
                        checked={word.enabled}
                        onChange={() => handleToggle(word.id)}
                        size="small"
                      />
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-1.5 rounded text-primary-500 hover:text-info-600 hover:bg-info-50 transition-colors"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(word.id)}
                          className="p-1.5 rounded text-primary-500 hover:text-danger-600 hover:bg-danger-50 transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-primary-400">
                    暂无匹配的风险词
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <div className="text-xs text-primary-500">
            显示第 <span className="text-primary-700 font-medium tabular-nums">
              {wordPagination.total > 0 ? (wordPagination.page - 1) * wordPagination.pageSize + 1 : 0}
            </span> - <span className="text-primary-700 font-medium tabular-nums">
              {Math.min(wordPagination.page * wordPagination.pageSize, wordPagination.total)}
            </span> 条，共 <span className="text-primary-700 font-medium tabular-nums">{wordPagination.total}</span> 条
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={wordPagination.pageSize}
              onChange={(value) => setWordPageSize(value)}
              style={{ width: 110 }}
              size="small"
            >
              <Option value={10}>10条/页</Option>
              <Option value={15}>15条/页</Option>
              <Option value={20}>20条/页</Option>
              <Option value={50}>50条/页</Option>
            </Select>
            <Pagination
              current={wordPagination.page}
              pageSize={wordPagination.pageSize}
              total={wordPagination.total}
              onChange={(page) => setWordPage(page)}
              showSizeChanger={false}
              showLessItems
              prevIcon={<ChevronLeft className="w-4 h-4" />}
              nextIcon={<ChevronRight className="w-4 h-4" />}
              size="small"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
