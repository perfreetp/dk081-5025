import { useState } from 'react';
import {
  ClipboardCheck,
  Activity,
  Target,
  Zap,
  Clock,
  Calendar as CalendarIcon,
  Settings,
  Play,
  Plus,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Download,
  History,
} from 'lucide-react';
import {
  Segmented,
  Select,
  Slider,
  Table,
  Switch,
  Modal,
  Form,
  TimePicker,
  Checkbox,
  message,
  Tag,
  Button,
  Progress,
  Space,
} from 'antd';
import { CATEGORIES } from '@/constants';
import type { CategoryOption } from '@/constants';
import dayjs from 'dayjs';

const { RangePicker } = TimePicker;
const { Option } = Select;

interface ScheduledTask {
  key: string;
  id: string;
  name: string;
  timeSlot: string;
  categories: string[];
  frequency: string;
  status: 'running' | 'stopped';
  lastRun: string;
  nextRun: string;
  threshold: number;
}

interface InspectionRecord {
  key: string;
  id: string;
  taskName: string;
  startTime: string;
  endTime: string;
  duration: string;
  scannedCount: number;
  problemCount: number;
  status: 'success' | 'failed' | 'running';
  operator: string;
}

const scheduledTasks: ScheduledTask[] = [
  {
    key: '1',
    id: 'TASK-001',
    name: '奢侈品日常巡检',
    timeSlot: '工作日 09:00-18:00',
    categories: ['服饰鞋包/箱包', '服饰鞋包/珠宝钟表'],
    frequency: '每2小时',
    status: 'running',
    lastRun: '2026-06-17 14:00:00',
    nextRun: '2026-06-17 16:00:00',
    threshold: 60,
  },
  {
    key: '2',
    id: 'TASK-002',
    name: '数码产品夜间巡检',
    timeSlot: '每日 22:00-次日06:00',
    categories: ['数码产品/手机通讯', '数码产品/相机摄影'],
    frequency: '每4小时',
    status: 'running',
    lastRun: '2026-06-17 02:00:00',
    nextRun: '2026-06-17 22:00:00',
    threshold: 50,
  },
  {
    key: '3',
    id: 'TASK-003',
    name: '美妆类目专项巡检',
    timeSlot: '周末 全天',
    categories: ['美妆个护/护肤', '美妆个护/彩妆'],
    frequency: '每6小时',
    status: 'stopped',
    lastRun: '2026-06-15 18:00:00',
    nextRun: '已暂停',
    threshold: 70,
  },
  {
    key: '4',
    id: 'TASK-004',
    name: '大促全量巡检',
    timeSlot: '自定义 6月17日-6月20日',
    categories: ['全部类目'],
    frequency: '每1小时',
    status: 'running',
    lastRun: '2026-06-17 15:00:00',
    nextRun: '2026-06-17 16:00:00',
    threshold: 45,
  },
];

const inspectionRecords: InspectionRecord[] = [
  {
    key: '1',
    id: 'INS-20260617-004',
    taskName: '奢侈品日常巡检',
    startTime: '2026-06-17 14:00:00',
    endTime: '2026-06-17 14:23:18',
    duration: '23分18秒',
    scannedCount: 8562,
    problemCount: 23,
    status: 'success',
    operator: '系统定时',
  },
  {
    key: '2',
    id: 'INS-20260617-003',
    taskName: '大促全量巡检',
    startTime: '2026-06-17 15:00:00',
    endTime: '2026-06-17 15:42:05',
    duration: '42分05秒',
    scannedCount: 32180,
    problemCount: 156,
    status: 'success',
    operator: '系统定时',
  },
  {
    key: '3',
    id: 'INS-20260617-002',
    taskName: '数码产品夜间巡检',
    startTime: '2026-06-17 02:00:00',
    endTime: '2026-06-17 02:18:42',
    duration: '18分42秒',
    scannedCount: 5423,
    problemCount: 12,
    status: 'success',
    operator: '系统定时',
  },
  {
    key: '4',
    id: 'INS-20260617-001',
    taskName: '手动全量巡检',
    startTime: '2026-06-17 10:15:30',
    endTime: '2026-06-17 11:08:56',
    duration: '53分26秒',
    scannedCount: 45672,
    problemCount: 287,
    status: 'success',
    operator: '张主管',
  },
  {
    key: '5',
    id: 'INS-20260616-005',
    taskName: '美妆类目专项巡检',
    startTime: '2026-06-16 18:00:00',
    endTime: '-',
    duration: '-',
    scannedCount: 3241,
    problemCount: 0,
    status: 'failed',
    operator: '系统定时',
  },
];

const TIME_SLOT_OPTIONS = [
  { label: '工作日 (周一至周五)', value: 'workday' },
  { label: '周末 (周六至周日)', value: 'weekend' },
  { label: '每日', value: 'daily' },
  { label: '自定义时间段', value: 'custom' },
];

const FREQUENCY_OPTIONS = [
  { label: '每30分钟', value: 30 },
  { label: '每1小时', value: 60 },
  { label: '每2小时', value: 120 },
  { label: '每4小时', value: 240 },
  { label: '每6小时', value: 360 },
  { label: '每8小时', value: 480 },
  { label: '每日一次', value: 1440 },
];

function flattenCategories(cats: CategoryOption[], prefix = ''): { label: string; value: string }[] {
  const result: { label: string; value: string }[] = [];
  cats.forEach((cat) => {
    const path = prefix ? `${prefix}/${cat.name}` : cat.name;
    result.push({ label: path, value: path });
    if (cat.children) {
      result.push(...flattenCategories(cat.children, path));
    }
  });
  return result;
}

const categoryOptions = flattenCategories(CATEGORIES);

export default function Inspection() {
  const [timeSlot, setTimeSlot] = useState<string>('workday');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [threshold, setThreshold] = useState<number>(60);
  const [frequency, setFrequency] = useState<number>(120);
  const [tasks, setTasks] = useState<ScheduledTask[]>(scheduledTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectionProgress, setInspectionProgress] = useState(0);
  const [records] = useState<InspectionRecord[]>(inspectionRecords);
  const [form] = Form.useForm();

  const stats = [
    { label: '今日巡检次数', value: '12', icon: Activity, color: 'info', delta: '+3' },
    { label: '累计扫描商品', value: '98,623', icon: Target, color: 'purple', delta: '+15.2%' },
    { label: '发现问题数', value: '478', icon: AlertCircle, color: 'warning', delta: '+23' },
    { label: '策略优化建议', value: '24', icon: Zap, color: 'success', delta: '+7' },
  ];

  const taskColumns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (v: string, record: ScheduledTask) => (
        <div>
          <p className="text-sm font-medium text-primary-900">{v}</p>
          <p className="text-xs text-primary-400 mt-0.5">{record.id}</p>
        </div>
      ),
    },
    {
      title: '巡检时段',
      dataIndex: 'timeSlot',
      key: 'timeSlot',
      width: 180,
      render: (v: string) => (
        <span className="text-sm text-primary-700 inline-flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-primary-400" />
          {v}
        </span>
      ),
    },
    {
      title: '覆盖类目',
      dataIndex: 'categories',
      key: 'categories',
      width: 220,
      render: (v: string[]) => (
        <div className="flex flex-wrap gap-1">
          {v.length > 2 ? (
            <>
              {v.slice(0, 2).map((cat) => (
                <Tag key={cat} className="text-xs" color="blue">{cat}</Tag>
              ))}
              <Tag className="text-xs">+{v.length - 2}</Tag>
            </>
          ) : (
            v.map((cat) => (
              <Tag key={cat} className="text-xs" color="blue">{cat}</Tag>
            ))
          )}
        </div>
      ),
    },
    {
      title: '扫描频率',
      dataIndex: 'frequency',
      key: 'frequency',
      width: 100,
      render: (v: string) => <span className="text-sm text-primary-700">{v}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: ScheduledTask['status']) => (
        v === 'running' ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-success-50 text-success-700 text-xs font-medium border border-success-200">
            <span className="badge-dot badge-dot-success animate-pulse-slow" />
            运行中
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary-50 text-primary-600 text-xs font-medium border border-primary-200">
            <span className="badge-dot badge-dot-info" />
            已暂停
          </span>
        )
      ),
    },
    {
      title: '上次执行',
      dataIndex: 'lastRun',
      key: 'lastRun',
      width: 160,
      render: (v: string) => <span className="text-xs text-primary-500">{v}</span>,
    },
    {
      title: '下次执行',
      dataIndex: 'nextRun',
      key: 'nextRun',
      width: 160,
      render: (v: string, record: ScheduledTask) => (
        <span className={`text-xs ${record.status === 'running' ? 'text-primary-500' : 'text-primary-400'}`}>
          {v}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right' as const,
      render: (_: unknown, record: ScheduledTask) => (
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 rounded text-primary-500 hover:text-info-600 hover:bg-info-50 transition-colors"
            title="编辑"
            onClick={() => handleEditTask(record)}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            className={`p-1.5 rounded transition-colors ${
              record.status === 'running'
                ? 'text-primary-500 hover:text-warning-600 hover:bg-warning-50'
                : 'text-primary-500 hover:text-success-600 hover:bg-success-50'
            }`}
            title={record.status === 'running' ? '暂停' : '启动'}
            onClick={() => handleToggleTask(record.key)}
          >
            {record.status === 'running' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
          </button>
          <button
            className="p-1.5 rounded text-primary-500 hover:text-danger-600 hover:bg-danger-50 transition-colors"
            title="删除"
            onClick={() => handleDeleteTask(record.key)}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const recordColumns = [
    {
      title: '记录编号',
      dataIndex: 'id',
      key: 'id',
      width: 160,
      render: (v: string) => <span className="font-mono text-xs text-primary-600">{v}</span>,
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
      width: 160,
      render: (v: string) => <span className="text-sm font-medium text-primary-900">{v}</span>,
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 160,
      render: (v: string) => <span className="text-xs text-primary-500">{v}</span>,
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 160,
      render: (v: string) => <span className="text-xs text-primary-500">{v}</span>,
    },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (v: string) => <span className="text-sm text-primary-700">{v}</span>,
    },
    {
      title: '扫描商品数',
      dataIndex: 'scannedCount',
      key: 'scannedCount',
      width: 120,
      render: (v: number) => <span className="text-sm text-primary-900 font-medium text-number">{v.toLocaleString()}</span>,
    },
    {
      title: '发现问题',
      dataIndex: 'problemCount',
      key: 'problemCount',
      width: 100,
      render: (v: number) => (
        <span className={`text-sm font-semibold text-number ${v > 0 ? 'text-warning-600' : 'text-success-600'}`}>
          {v > 0 ? v : '-'}
        </span>
      ),
    },
    {
      title: '执行状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v: InspectionRecord['status']) => {
        const config = {
          success: { icon: CheckCircle2, text: '成功', cls: 'text-success-600' },
          failed: { icon: XCircle, text: '失败', cls: 'text-danger-600' },
          running: { icon: RefreshCw, text: '执行中', cls: 'text-info-600 animate-spin' },
        }[v];
        const Icon = config.icon;
        return (
          <span className={`inline-flex items-center gap-1 text-sm ${config.cls} font-medium`}>
            <Icon className="w-4 h-4" />
            {config.text}
          </span>
        );
      },
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
      render: (v: string) => <span className="text-sm text-primary-600">{v}</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: unknown, record: InspectionRecord) => (
        <div className="flex items-center gap-1">
          <button className="text-xs text-info-600 hover:text-info-700 inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-info-50 transition-colors">
            <Search className="w-3 h-3" />查看报告
          </button>
          {record.status === 'success' && (
            <button className="text-xs text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-primary-50 transition-colors">
              <Download className="w-3 h-3" />导出
            </button>
          )}
        </div>
      ),
    },
  ];

  const handleToggleTask = (key: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.key === key) {
          const newStatus = t.status === 'running' ? 'stopped' : 'running';
          message.success(newStatus === 'running' ? `任务「${t.name}」已启动` : `任务「${t.name}」已暂停`);
          return {
            ...t,
            status: newStatus,
            nextRun: newStatus === 'running' ? dayjs().add(2, 'hour').format('YYYY-MM-DD HH:mm:ss') : '已暂停',
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (key: string) => {
    Modal.confirm({
      title: '确认删除巡检任务',
      content: '删除后该任务将停止执行，相关配置不可恢复，是否继续？',
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        setTasks((prev) => prev.filter((t) => t.key !== key));
        message.success('任务已删除');
      },
    });
  };

  const getTimeSlotValue = (timeSlotStr: string): string => {
    if (timeSlotStr.includes('工作日')) return 'workday';
    if (timeSlotStr.includes('周末')) return 'weekend';
    if (timeSlotStr.includes('每日')) return 'daily';
    return 'custom';
  };

  const getFrequencyValue = (frequencyStr: string): number => {
    const opt = FREQUENCY_OPTIONS.find((o) => o.label === frequencyStr);
    return opt ? opt.value : 120;
  };

  const handleEditTask = (record: ScheduledTask) => {
    setEditingTask(record);
    form.setFieldsValue({
      name: record.name,
      timeSlot: getTimeSlotValue(record.timeSlot),
      categories: record.categories,
      frequency: getFrequencyValue(record.frequency),
      threshold: record.threshold,
    });
    setIsModalOpen(true);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    form.resetFields();
    form.setFieldsValue({
      timeSlot: 'workday',
      frequency: 120,
      threshold: 60,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = () => {
    form.validateFields().then((values) => {
      const timeSlotLabel = TIME_SLOT_OPTIONS.find((t) => t.value === values.timeSlot)?.label || '自定义';
      const frequencyLabel = FREQUENCY_OPTIONS.find((f) => f.value === values.frequency)?.label || '每2小时';

      if (editingTask) {
        setTasks((prev) =>
          prev.map((t) => {
            if (t.key === editingTask.key) {
              return {
                ...t,
                name: values.name,
                timeSlot: timeSlotLabel,
                categories: values.categories || ['全部类目'],
                frequency: frequencyLabel,
                threshold: values.threshold,
              };
            }
            return t;
          })
        );
        setIsModalOpen(false);
        message.success('任务已更新');
      } else {
        const newTask: ScheduledTask = {
          key: String(tasks.length + 1),
          id: `TASK-${String(tasks.length + 1).padStart(3, '0')}`,
          name: values.name,
          timeSlot: timeSlotLabel,
          categories: values.categories || ['全部类目'],
          frequency: frequencyLabel,
          status: 'running',
          lastRun: '-',
          nextRun: dayjs().add(values.frequency, 'minute').format('YYYY-MM-DD HH:mm:ss'),
          threshold: values.threshold,
        };
        setTasks((prev) => [newTask, ...prev]);
        setIsModalOpen(false);
        message.success('任务创建成功');
      }
    });
  };

  const handleStartInspection = () => {
    setIsInspecting(true);
    setInspectionProgress(0);
    message.info('开始执行全量巡检...');
    const timer = setInterval(() => {
      setInspectionProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsInspecting(false);
          message.success('巡检完成！共发现 187 个问题商品');
          return 100;
        }
        return prev + Math.random() * 8 + 2;
      });
    }, 500);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="page-header">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-success-600" />
              巡检中心
            </h1>
            <p className="page-subtitle">风控策略效果巡检、问题发现与定时任务管理</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="badge-dot badge-dot-success animate-pulse-slow" />
              {tasks.filter((t) => t.status === 'running').length} 个任务运行中
            </span>
            <span className="text-primary-300">|</span>
            <span>最后更新: {dayjs().format('HH:mm:ss')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`stat-card ${stat.color}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-500">{stat.label}</p>
                  <div className="flex items-end gap-2 mt-2">
                    <p className="text-2xl font-semibold text-primary-900 text-number">
                      {stat.value}
                    </p>
                    <span className="text-xs font-medium text-success-600 mb-1">{stat.delta}</span>
                  </div>
                </div>
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    stat.color === 'warning'
                      ? 'bg-warning-50 text-warning-600'
                      : stat.color === 'success'
                      ? 'bg-success-50 text-success-600'
                      : stat.color === 'purple'
                      ? 'bg-purple-50 text-purple-600'
                      : 'bg-info-50 text-info-600'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 risk-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-primary-900 text-base flex items-center gap-2">
                <Settings className="w-4 h-4 text-info-600" />
                巡检配置面板
              </h2>
              <p className="text-xs text-primary-400 mt-1">配置巡检规则，保存后可立即执行或创建定时任务</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                <CalendarIcon className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                重点时段选择
              </label>
              <Segmented
                options={TIME_SLOT_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
                value={timeSlot}
                onChange={setTimeSlot}
                size="middle"
              />
              {timeSlot === 'custom' && (
                <div className="mt-3 p-3 bg-primary-50/50 rounded-lg border border-primary-100">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-primary-600">时间范围：</span>
                      <RangePicker
                        format="HH:mm"
                        className="!w-auto"
                        size="small"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-primary-600">日期范围：</span>
                      <Checkbox className="!text-sm">周一</Checkbox>
                      <Checkbox className="!text-sm">周二</Checkbox>
                      <Checkbox className="!text-sm">周三</Checkbox>
                      <Checkbox className="!text-sm">周四</Checkbox>
                      <Checkbox className="!text-sm">周五</Checkbox>
                      <Checkbox className="!text-sm">周六</Checkbox>
                      <Checkbox className="!text-sm">周日</Checkbox>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                重点类目选择
                <span className="text-xs text-primary-400 ml-2">(已选 {selectedCategories.length} 个类目)</span>
              </label>
              <Select
                mode="multiple"
                placeholder="选择需要巡检的商品类目，不选则覆盖全部"
                value={selectedCategories}
                onChange={setSelectedCategories}
                allowClear
                size="middle"
                className="!w-full"
                maxTagCount={3}
                maxTagTextLength={10}
              >
                {categoryOptions.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-primary-700">
                  <AlertCircle className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  风险阈值设置
                </label>
                <span className="text-sm font-semibold text-number" style={{ color: threshold >= 70 ? '#EF4444' : threshold >= 50 ? '#F59E0B' : '#10B981' }}>
                  {threshold} 分以上触发告警
                </span>
              </div>
              <Slider
                min={0}
                max={100}
                value={threshold}
                onChange={setThreshold}
                marks={{
                  0: '0',
                  20: '低风险',
                  50: '中风险',
                  80: '高风险',
                  100: '100',
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                <RefreshCw className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                扫描频率
              </label>
              <Select
                value={frequency}
                onChange={setFrequency}
                size="middle"
                className="!w-full"
              >
                {FREQUENCY_OPTIONS.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-primary-100">
              <Button
                type="primary"
                size="large"
                icon={<Play className="w-4 h-4" />}
                onClick={handleStartInspection}
                loading={isInspecting}
                className="!h-10 !px-6 !font-medium"
              >
                一键立即巡检
              </Button>
              <Button
                size="large"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleCreateTask}
                className="!h-10 !px-6"
              >
                保存为定时任务
              </Button>
              {isInspecting && (
                <div className="flex-1 min-w-[200px]">
                  <Progress
                    percent={Math.min(Math.round(inspectionProgress), 100)}
                    size="small"
                    status={inspectionProgress >= 100 ? 'success' : 'active'}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 risk-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-primary-900 text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-500" />
                实时巡检状态
              </h2>
              <p className="text-xs text-primary-400 mt-1">当前巡检任务执行进度</p>
            </div>
          </div>
          <div className="space-y-4">
            {tasks.filter((t) => t.status === 'running').map((task) => (
              <div key={task.key} className="p-3 rounded-lg bg-primary-50/50 border border-primary-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-primary-900">{task.name}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-success-600">
                    <span className="badge-dot badge-dot-success animate-pulse-slow" />运行中
                  </span>
                </div>
                <Progress
                  percent={Math.floor(Math.random() * 30 + 40)}
                  size="small"
                  strokeColor="#10B981"
                  className="!mb-2"
                />
                <div className="flex items-center justify-between text-xs text-primary-400">
                  <span>下次执行: {task.nextRun}</span>
                  <span>阈值: {task.threshold}分</span>
                </div>
              </div>
            ))}
            {tasks.filter((t) => t.status === 'running').length === 0 && (
              <div className="text-center py-8 text-primary-400">
                <Activity className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">暂无运行中的任务</p>
              </div>
            )}
            <div className="pt-4 mt-4 border-t border-primary-100">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-lg bg-info-50">
                  <p className="text-xs text-primary-500 mb-1">今日巡检商品</p>
                  <p className="text-xl font-semibold text-info-700 text-number">98,623</p>
                </div>
                <div className="p-3 rounded-lg bg-warning-50">
                  <p className="text-xs text-primary-500 mb-1">告警触发</p>
                  <p className="text-xl font-semibold text-warning-700 text-number">478</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="risk-card p-5">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="font-semibold text-primary-900 text-base flex items-center gap-2">
              <ChevronDown className="w-4 h-4 text-info-600" />
              已配置定时任务
            </h2>
            <p className="text-xs text-primary-400 mt-1">管理所有自动巡检定时任务</p>
          </div>
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleCreateTask}
          >
            新增任务
          </Button>
        </div>
        <Table
          columns={taskColumns}
          dataSource={tasks}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
            showTotal: (total) => `共 ${total} 个任务`,
          }}
          size="middle"
        />
      </div>

      <div className="risk-card p-5">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="font-semibold text-primary-900 text-base flex items-center gap-2">
              <History className="w-5 h-5 text-primary-500" />
              最近巡检记录
            </h2>
            <p className="text-xs text-primary-400 mt-1">历史巡检执行日志与结果追溯</p>
          </div>
          <Space>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
              <input
                type="text"
                placeholder="搜索任务/编号..."
                className="input-field pl-9 text-sm w-56"
              />
            </div>
            <button className="btn-outline text-sm">
              <Download className="w-4 h-4" />
              导出记录
            </button>
          </Space>
        </div>
        <Table
          columns={recordColumns}
          dataSource={records}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
            showTotal: (total) => `共 ${total} 条巡检记录`,
          }}
          size="middle"
          rowClassName={(record) =>
            record.status === 'failed' ? 'bg-danger-50/30' : 'hover:bg-primary-50/50'
          }
        />
      </div>

      <Modal
        title={
          <span className="flex items-center gap-2 text-base font-semibold">
            <Settings className="w-5 h-5 text-info-600" />
            {editingTask ? '编辑巡检任务' : '新增巡检任务'}
          </span>
        }
        open={isModalOpen}
        onOk={handleFormSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText={editingTask ? '保存修改' : '创建任务'}
        cancelText="取消"
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <input type="text" placeholder="给巡检任务起一个便于识别的名称" className="input-field" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="timeSlot"
              label="巡检时段"
              rules={[{ required: true, message: '请选择巡检时段' }]}
            >
              <Select size="middle" placeholder="选择巡检时段">
                {TIME_SLOT_OPTIONS.map((opt) => (
                  <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="frequency"
              label="扫描频率"
              rules={[{ required: true, message: '请选择扫描频率' }]}
            >
              <Select size="middle" placeholder="选择扫描频率">
                {FREQUENCY_OPTIONS.map((opt) => (
                  <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="categories"
            label="覆盖类目"
            extra="不选择则覆盖全部类目"
          >
            <Select
              mode="multiple"
              placeholder="选择需要巡检的商品类目"
              size="middle"
              maxTagCount={4}
              maxTagTextLength={10}
              allowClear
            >
              {categoryOptions.map((opt) => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="threshold"
            label="风险阈值"
            extra="风险分数超过此值的商品将被标记为问题商品"
          >
            <Slider
              min={0}
              max={100}
              marks={{
                0: '0',
                50: '中风险',
                80: '高风险',
                100: '100',
              }}
            />
          </Form.Item>

          <Form.Item
            name="enabled"
            valuePropName="checked"
            initialValue={true}
            label="立即启用"
          >
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
