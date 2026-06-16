import { useState } from 'react';
import {
  BarChart3,
  ClipboardCheck,
  Megaphone,
  AlertTriangle,
  ChevronRight,
  Filter,
  Clock,
  User,
  Layers,
  ExternalLink,
  Eye,
  Search,
} from 'lucide-react';
import {
  FunnelChart,
  Funnel,
  LabelList,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Link } from 'react-router-dom';
import { Segmented, Table, Tag } from 'antd';
import { PUNISHMENT_LEVEL_MAP, RISK_LEVEL_MAP } from '@/constants';
import type { PunishmentLevel } from '@/types';

const TIME_RANGES = [
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本季度', value: 'quarter' },
];

const FUNNEL_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

const PIE_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EF4444',
  '#06B6D4',
  '#EC4899',
  '#84CC16',
  '#F97316',
  '#6366F1',
];

const funnelDataMap: Record<string, { name: string; value: number; rate: string }[]> = {
  week: [
    { name: '待审核', value: 12580, rate: '100%' },
    { name: '进入审核', value: 10820, rate: '86.0%' },
    { name: '审核通过', value: 7320, rate: '67.7%' },
    { name: '审核打回', value: 2180, rate: '20.1%' },
    { name: '封禁处置', value: 1320, rate: '12.2%' },
  ],
  month: [
    { name: '待审核', value: 52340, rate: '100%' },
    { name: '进入审核', value: 46890, rate: '89.6%' },
    { name: '审核通过', value: 31560, rate: '67.3%' },
    { name: '审核打回', value: 9820, rate: '20.9%' },
    { name: '封禁处置', value: 5510, rate: '11.8%' },
  ],
  quarter: [
    { name: '待审核', value: 156820, rate: '100%' },
    { name: '进入审核', value: 142380, rate: '90.8%' },
    { name: '审核通过', value: 96840, rate: '68.0%' },
    { name: '审核打回', value: 30120, rate: '21.2%' },
    { name: '封禁处置', value: 15420, rate: '10.8%' },
  ],
};

const workloadData = [
  { name: '张审核', value: 1286 },
  { name: '李审核', value: 1154 },
  { name: '王审核', value: 987 },
  { name: '赵审核', value: 876 },
  { name: '陈审核', value: 765 },
  { name: '刘审核', value: 654 },
  { name: '周审核', value: 543 },
  { name: '吴审核', value: 432 },
];

const punishmentLevelData = [
  { level: '警告提醒', warning: 3420, delist: 0, restrict: 0, ban_product: 0, ban_seller: 0 },
  { level: '商品下架', warning: 0, delist: 2180, restrict: 0, ban_product: 0, ban_seller: 0 },
  { level: '限流降权', warning: 0, delist: 0, restrict: 986, ban_product: 0, ban_seller: 0 },
  { level: '封禁商品', warning: 0, delist: 0, restrict: 0, ban_product: 732, ban_seller: 0 },
  { level: '封禁卖家', warning: 0, delist: 0, restrict: 0, ban_product: 0, ban_seller: 245 },
];

const missedRiskData = [
  {
    key: '1',
    productId: 'P-20260616-00123',
    title: '【准新机】iPhone 15 Pro Max 256G 原封未激活',
    category: '数码产品/手机通讯',
    seller: '优品数码商城',
    riskLevel: 'high' as const,
    riskType: '规避检测',
    missedReason: '变体词"原/封未激&活"未识别',
    publishTime: '2026-06-16 14:23',
    discoveredTime: '2026-06-16 18:45',
  },
  {
    key: '2',
    productId: 'P-20260616-00456',
    title: '香奈儿经典款鱼子酱皮链条包 99新',
    category: '服饰鞋包/箱包',
    seller: '奢侈品工坊',
    riskLevel: 'high' as const,
    riskType: '图片违规',
    missedReason: '背景遮挡导致仿品特征未检出',
    publishTime: '2026-06-16 11:08',
    discoveredTime: '2026-06-16 17:22',
  },
  {
    key: '3',
    productId: 'P-20260615-00789',
    title: '大牌同款 DW手表 原厂尾单 支持验货',
    category: '服饰鞋包/珠宝钟表',
    seller: '时间之廊',
    riskLevel: 'medium' as const,
    riskType: '关键词命中',
    missedReason: '"原厂尾单"白名单误判',
    publishTime: '2026-06-15 20:15',
    discoveredTime: '2026-06-16 09:30',
  },
  {
    key: '4',
    productId: 'P-20260615-00321',
    title: 'SK-II神仙水230ml 内部渠道 海关罚没',
    category: '美妆个护/护肤',
    seller: '美妆小铺888',
    riskLevel: 'high' as const,
    riskType: '规避检测',
    missedReason: '敏感词拆分排列未识别',
    publishTime: '2026-06-15 16:42',
    discoveredTime: '2026-06-16 10:15',
  },
  {
    key: '5',
    productId: 'P-20260614-00654',
    title: '索尼A7M4全画幅相机 展示机 官换机',
    category: '数码产品/相机摄影',
    seller: '影像器材汇',
    riskLevel: 'medium' as const,
    riskType: '价格异常',
    missedReason: '价格低于均价25%未触发高风险',
    publishTime: '2026-06-14 09:18',
    discoveredTime: '2026-06-15 14:50',
  },
];

export default function Review() {
  const [timeRange, setTimeRange] = useState<string>('week');

  const funnelData = funnelDataMap[timeRange] || funnelDataMap.week;
  const totalReview = workloadData.reduce((sum, item) => sum + item.value, 0);

  const missedRiskColumns = [
    {
      title: '商品编号',
      dataIndex: 'productId',
      key: 'productId',
      width: 160,
      render: (v: string) => (
        <span className="font-mono text-xs text-primary-600">{v}</span>
      ),
    },
    {
      title: '商品标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (v: string) => (
        <span className="text-sm text-primary-900 font-medium">{v}</span>
      ),
    },
    {
      title: '类目',
      dataIndex: 'category',
      key: 'category',
      width: 160,
      render: (v: string) => <span className="text-xs text-primary-500">{v}</span>,
    },
    {
      title: '卖家',
      dataIndex: 'seller',
      key: 'seller',
      width: 120,
      render: (v: string) => <span className="text-sm text-primary-700">{v}</span>,
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      width: 100,
      render: (level: keyof typeof RISK_LEVEL_MAP) => {
        const config = RISK_LEVEL_MAP[level];
        return (
          <Tag color={config.color} style={{ backgroundColor: config.bgColor, borderColor: config.borderColor, color: config.color, margin: 0 }}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: '风险类型',
      dataIndex: 'riskType',
      key: 'riskType',
      width: 110,
      render: (v: string) => <span className="text-sm text-primary-600">{v}</span>,
    },
    {
      title: '漏判原因',
      dataIndex: 'missedReason',
      key: 'missedReason',
      width: 200,
      render: (v: string) => <span className="text-sm text-danger-600">{v}</span>,
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      key: 'publishTime',
      width: 140,
      render: (v: string) => <span className="text-xs text-primary-400">{v}</span>,
    },
    {
      title: '发现时间',
      dataIndex: 'discoveredTime',
      key: 'discoveredTime',
      width: 140,
      render: (v: string) => <span className="text-xs text-primary-400">{v}</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right' as const,
      render: () => (
        <button className="text-xs text-info-600 hover:text-info-700 inline-flex items-center gap-1">
          <Eye className="w-3 h-3" />详情
        </button>
      ),
    },
  ];

  const punishmentBarColors: Record<string, string> = {
    warning: '#3B82F6',
    delist: '#F59E0B',
    restrict: '#8B5CF6',
    ban_product: '#EF4444',
    ban_seller: '#991B1B',
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="page-header">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-info-600" />
              策略复盘
            </h1>
            <p className="page-subtitle">多维度策略效果分析与审核数据洞察</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/review" className="stat-card hover:shadow-card-hover transition-all duration-200 block">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-info-50 text-info-600">
              <BarChart3 className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-primary-900">数据报表</h3>
              </div>
              <p className="text-sm text-primary-500 mt-1">审核漏斗与绩效分析</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-info-600">
                <span>查看详情</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </Link>

        <Link to="/review/inspection" className="stat-card hover:shadow-card-hover transition-all duration-200 block">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-success-50 text-success-600">
              <ClipboardCheck className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-primary-900">巡检中心</h3>
              <p className="text-sm text-primary-500 mt-1">策略效果巡检与问题发现</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-success-600">
                <span>立即前往</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </Link>

        <Link to="/review/announcements" className="stat-card hover:shadow-card-hover transition-all duration-200 block">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-warning-50 text-warning-600">
              <Megaphone className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-primary-900">口径公告</h3>
              <p className="text-sm text-primary-500 mt-1">审核规则与政策公告发布</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-warning-600">
                <span>查看公告</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </Link>

        <div className="stat-card hover:shadow-card-hover transition-all duration-200 cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-danger-50 text-danger-600">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-primary-900">漏判分析</h3>
              <p className="text-sm text-primary-500 mt-1">高风险未检出商品追踪</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-danger-600">
                <span className="inline-flex items-center gap-1">
                  待处理 <span className="font-bold">{missedRiskData.length}</span> 条
                </span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 risk-card p-5">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="font-semibold text-primary-900 text-base flex items-center gap-2">
                <Filter className="w-4 h-4 text-info-600" />
                审核漏斗分析
              </h2>
              <p className="text-xs text-primary-400 mt-1">各阶段审核转化与流失情况</p>
            </div>
            <Segmented
              options={TIME_RANGES.map((r) => ({ label: r.label, value: r.value }))}
              value={timeRange}
              onChange={setTimeRange}
              size="small"
            />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.1)',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, name: string) => [value.toLocaleString(), name]}
                />
                <Funnel
                  dataKey="value"
                  data={funnelData}
                  isAnimationActive
                >
                  <LabelList
                    position="right"
                    fill="#475569"
                    stroke="none"
                    dataKey="name"
                    fontSize={12}
                  />
                  <LabelList
                    position="left"
                    fill="#1E293B"
                    stroke="none"
                    dataKey="rate"
                    fontSize={12}
                    fontWeight={600}
                  />
                  {funnelData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} fillOpacity={0.85} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-5 gap-3 mt-4 pt-4 border-t border-primary-100">
            {funnelData.map((item, index) => (
              <div key={item.name} className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: FUNNEL_COLORS[index] }}
                  />
                  <span className="text-xs text-primary-500">{item.name}</span>
                </div>
                <p className="text-lg font-semibold text-primary-900 text-number">
                  {item.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 risk-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-primary-900 text-base flex items-center gap-2">
                <User className="w-4 h-4 text-purple-500" />
                团队工作量分布
              </h2>
              <p className="text-xs text-primary-400 mt-1">成员审核量占比</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workloadData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  <LabelList
                    type="inner"
                    dataKey="value"
                    fill="#FFFFFF"
                    fontSize={10}
                    fontWeight={600}
                  />
                  {workloadData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.1)',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, name: string) => [
                    `${value.toLocaleString()} (${((value / totalReview) * 100).toFixed(1)}%)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2 max-h-32 overflow-y-auto scrollbar-thin pr-1">
            {workloadData.slice(0, 5).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: PIE_COLORS[index] }}
                  />
                  <span className="text-primary-600 truncate w-16">{item.name}</span>
                </div>
                <span className="text-primary-900 font-medium text-number">
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-primary-100 flex items-center justify-between">
            <span className="text-xs text-primary-500">总审核量</span>
            <span className="text-base font-semibold text-primary-900 text-number">
              {totalReview.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="risk-card p-5">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="font-semibold text-primary-900 text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-warning-500" />
              各处置等级分布
            </h2>
            <p className="text-xs text-primary-400 mt-1">按处罚类型统计的处置数量分布</p>
          </div>
          <Segmented
            options={TIME_RANGES.map((r) => ({ label: r.label, value: r.value }))}
            value={timeRange}
            onChange={setTimeRange}
            size="small"
          />
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={punishmentLevelData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="level"
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
                formatter={(value: number) => [value.toLocaleString(), '数量']}
              />
              <Legend
                iconType="square"
                wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                formatter={(value: string) => {
                  const map: Record<string, string> = {
                    warning: '警告提醒',
                    delist: '商品下架',
                    restrict: '限流降权',
                    ban_product: '封禁商品',
                    ban_seller: '封禁卖家',
                  };
                  return <span className="text-primary-600">{map[value] || value}</span>;
                }}
              />
              {(Object.keys(punishmentBarColors) as PunishmentLevel[]).map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="a"
                  fill={punishmentBarColors[key]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-5 gap-4 mt-4 pt-4 border-t border-primary-100">
          {(Object.keys(PUNISHMENT_LEVEL_MAP) as PunishmentLevel[]).map((key) => {
            const config = PUNISHMENT_LEVEL_MAP[key];
            const total = punishmentLevelData.reduce((sum, item) => sum + (item[key] || 0), 0);
            return (
              <div key={key} className="text-center">
                <div
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium mb-1"
                  style={{ backgroundColor: config.bgColor, color: config.color }}
                >
                  {config.label}
                </div>
                <p className="text-lg font-semibold text-primary-900 text-number">
                  {total.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="risk-card p-5">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="font-semibold text-primary-900 text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-danger-500" />
              漏判分析 · 高风险未检出
            </h2>
            <p className="text-xs text-primary-400 mt-1">巡检发现的策略漏判商品，需及时优化规则</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
              <input
                type="text"
                placeholder="搜索商品/卖家..."
                className="input-field pl-9 text-sm w-56"
              />
            </div>
            <button className="btn-outline text-sm">
              <ExternalLink className="w-4 h-4" />
              导出报告
            </button>
          </div>
        </div>
        <Table
          columns={missedRiskColumns}
          dataSource={missedRiskData}
          scroll={{ x: 1300 }}
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
            showTotal: (total) => `共 ${total} 条漏判记录`,
          }}
          size="middle"
          rowClassName={() => 'hover:bg-primary-50/50'}
        />
      </div>
    </div>
  );
}
