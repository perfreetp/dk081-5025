import { useState, useMemo } from 'react';
import {
  Megaphone,
  Search,
  Plus,
  User,
  Calendar,
  Eye,
  FileText,
  AlertCircle,
  Star,
  Info,
  ChevronRight,
  Paperclip,
  X,
  Tag,
  Clock,
  Filter,
  Bell,
  CheckCircle2,
  CircleDot,
  Download,
  BookmarkPlus,
} from 'lucide-react';
import {
  Modal,
  Form,
  Select,
  message,
  Input,
  Tag as AntTag,
  Segmented,
  Empty,
} from 'antd';
import { ANNOUNCEMENTS } from '@/constants';
import type { Announcement } from '@/types';

const { Option } = Select;
const { TextArea } = Input;

const TYPE_OPTIONS = [
  { value: 'all', label: '全部类型' },
  { value: 'policy', label: '政策规则' },
  { value: 'case', label: '典型案例' },
  { value: 'notice', label: '通知公告' },
];

const TYPE_LABEL_MAP: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  policy: { label: '政策规则', color: '#3B82F6', bgColor: '#EFF6FF', borderColor: '#BFDBFE' },
  case: { label: '典型案例', color: '#8B5CF6', bgColor: '#F5F3FF', borderColor: '#DDD6FE' },
  notice: { label: '通知公告', color: '#10B981', bgColor: '#ECFDF5', borderColor: '#A7F3D0' },
};

const PRIORITY_LABEL_MAP: Record<string, { label: string; color: string; bgColor: string; borderColor: string; icon: typeof AlertCircle }> = {
  urgent: { label: '紧急', color: '#EF4444', bgColor: '#FEF2F2', borderColor: '#FECACA', icon: AlertCircle },
  important: { label: '重要', color: '#F59E0B', bgColor: '#FFFBEB', borderColor: '#FDE68A', icon: Star },
  normal: { label: '普通', color: '#64748B', bgColor: '#F1F5F9', borderColor: '#E2E8F0', icon: Info },
};

const PRIORITY_ORDER = ['urgent', 'important', 'normal'] as const;

const ATTACHMENTS: { name: string; size: string; type: string }[] = [
  { name: '奢侈品审核标准细则V3.2.pdf', size: '2.4 MB', type: 'pdf' },
  { name: '变体词识别案例截图.zip', size: '5.8 MB', type: 'zip' },
  { name: '618审核排班表.xlsx', size: '45 KB', type: 'xlsx' },
  { name: '风险词库V2.3对照表.csv', size: '189 KB', type: 'csv' },
];

function renderMarkdown(content: string) {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let inList = false;
  let listItems: JSX.Element[] = [];

  const flushList = (idx: number) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${idx}`} className="list-disc list-inside space-y-1 text-primary-700 mb-3">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList(idx);
      elements.push(<div key={`empty-${idx}`} className="h-2" />);
      return;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      inList = true;
      const text = trimmed.replace(/^\d+\.\s/, '');
      listItems.push(<li key={`li-${idx}`} className="text-sm text-primary-700">{renderInline(text)}</li>);
      return;
    }

    flushList(idx);

    if (/^一、|^二、|^三、|^四、|^五、|^六、|^七、|^八、|^九、|^十、/.test(trimmed)) {
      elements.push(
        <h3 key={`h3-${idx}`} className="text-base font-semibold text-primary-900 mt-4 mb-2 flex items-start gap-2">
          <span className="w-1 h-5 bg-info-500 rounded mt-0.5" />
          {trimmed}
        </h3>
      );
      return;
    }

    elements.push(
      <p key={`p-${idx}`} className="text-sm text-primary-700 leading-relaxed mb-2">
        {renderInline(trimmed)}
      </p>
    );
  });

  flushList(lines.length);

  return elements;
}

function renderInline(text: string) {
  const parts: (string | JSX.Element)[] = [];
  let remaining = text;
  const boldRegex = /"([^"]+)"/g;
  let match;
  let lastIndex = 0;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <span key={`bold-${match.index}`} className="font-semibold text-primary-900">
      「{match[1]}」
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : remaining;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(ANNOUNCEMENTS);
  const [selectedId, setSelectedId] = useState<string>(ANNOUNCEMENTS[0]?.id || '');
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [readIds, setReadIds] = useState<Set<string>>(new Set([ANNOUNCEMENTS[0]?.id || '']));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const sortedAndFiltered = useMemo(() => {
    let result = [...announcements];

    if (typeFilter !== 'all') {
      result = result.filter((a) => a.type === typeFilter);
    }

    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(keyword) ||
          a.content.toLowerCase().includes(keyword) ||
          a.authorName.toLowerCase().includes(keyword)
      );
    }

    result.sort((a, b) => {
      const priorityA = PRIORITY_ORDER.indexOf(a.priority as typeof PRIORITY_ORDER[number]);
      const priorityB = PRIORITY_ORDER.indexOf(b.priority as typeof PRIORITY_ORDER[number]);
      if (priorityA !== priorityB) return priorityA - priorityB;
      return new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime();
    });

    return result;
  }, [announcements, searchText, typeFilter]);

  const selectedAnnouncement = sortedAndFiltered.find((a) => a.id === selectedId) || sortedAndFiltered[0];

  const handleSelectAnnouncement = (id: string) => {
    setSelectedId(id);
    setReadIds((prev) => new Set(prev).add(id));
  };

  const handleFormSubmit = () => {
    form.validateFields().then((values) => {
      const newAnnouncement: Announcement = {
        id: `ann-${String(Date.now()).slice(-6)}`,
        title: values.title,
        content: values.content,
        type: values.type,
        priority: values.priority,
        authorId: 'u-current',
        authorName: '当前用户',
        publishTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        readCount: 0,
      };
      setAnnouncements((prev) => [newAnnouncement, ...prev]);
      setIsModalOpen(false);
      form.resetFields();
      message.success('公告发布成功');
    });
  };

  const getUnreadCount = () => {
    return sortedAndFiltered.filter((a) => !readIds.has(a.id)).length;
  };

  const urgentCount = sortedAndFiltered.filter((a) => a.priority === 'urgent').length;
  const importantCount = sortedAndFiltered.filter((a) => a.priority === 'important').length;
  const normalCount = sortedAndFiltered.filter((a) => a.priority === 'normal').length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="page-header">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-warning-600" />
              口径公告
            </h1>
            <p className="page-subtitle">审核规则、标准与政策公告发布中心</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-primary-500">
              <span className="inline-flex items-center gap-1.5">
                <Bell className="w-4 h-4" />
                共 <span className="font-semibold text-primary-900">{sortedAndFiltered.length}</span> 条公告
              </span>
              {getUnreadCount() > 0 && (
                <>
                  <span className="text-primary-300">|</span>
                  <span className="inline-flex items-center gap-1.5 text-warning-600">
                    <CircleDot className="w-4 h-4" />
                    <span className="font-semibold">{getUnreadCount()}</span> 条未读
                  </span>
                </>
              )}
            </div>
            <button
              onClick={() => {
                form.resetFields();
                form.setFieldsValue({ type: 'policy', priority: 'normal' });
                setIsModalOpen(true);
              }}
              className="btn-primary text-sm"
            >
              <Plus className="w-4 h-4" />
              新增公告
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-0">
        <div className="flex items-center justify-between p-4 rounded-lg border border-danger-200 bg-danger-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-danger-100 text-danger-600">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-danger-700 font-medium">紧急公告</p>
              <p className="text-2xl font-bold text-danger-600 text-number">{urgentCount}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setTypeFilter('all');
            }}
            className="text-xs text-danger-600 hover:text-danger-700"
          >
            查看全部 <ChevronRight className="w-3 h-3 inline" />
          </button>
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg border border-warning-200 bg-warning-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-warning-100 text-warning-600">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-warning-700 font-medium">重要公告</p>
              <p className="text-2xl font-bold text-warning-600 text-number">{importantCount}</p>
            </div>
          </div>
          <button className="text-xs text-warning-600 hover:text-warning-700">
            查看全部 <ChevronRight className="w-3 h-3 inline" />
          </button>
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg border border-primary-200 bg-primary-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary-100 text-primary-600">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-primary-700 font-medium">普通公告</p>
              <p className="text-2xl font-bold text-primary-600 text-number">{normalCount}</p>
            </div>
          </div>
          <button className="text-xs text-primary-600 hover:text-primary-700">
            查看全部 <ChevronRight className="w-3 h-3 inline" />
          </button>
        </div>
      </div>

      <div className="risk-card overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-5 border-b border-primary-100 p-4 lg:border-b-0 lg:border-r">
          <div className="lg:col-span-2 border-b lg:border-b-0 lg:border-r border-primary-100 p-4 -m-4 lg:m-0 lg:p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="搜索公告标题、内容..."
                  className="input-field pl-9 text-sm"
                />
              </div>
              <div className="flex items-center gap-1 text-primary-400">
                <Filter className="w-4 h-4" />
              </div>
            </div>

            <Segmented
              size="small"
              options={TYPE_OPTIONS.map((t) => ({ label: t.label, value: t.value }))}
              value={typeFilter}
              onChange={setTypeFilter}
              block
            />

            <div className="space-y-2 max-h-[700px] overflow-y-auto scrollbar-thin pr-1 -mr-4 lg:mr-0 lg:pr-1">
              {sortedAndFiltered.length > 0 ? (
                sortedAndFiltered.map((announcement) => {
                  const typeConfig = TYPE_LABEL_MAP[announcement.type];
                  const priorityConfig = PRIORITY_LABEL_MAP[announcement.priority];
                  const PriorityIcon = priorityConfig.icon;
                  const isSelected = selectedAnnouncement?.id === announcement.id;
                  const isRead = readIds.has(announcement.id);
                  return (
                    <div
                      key={announcement.id}
                      onClick={() => handleSelectAnnouncement(announcement.id)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'bg-info-50 border-info-200 shadow-sm'
                          : 'bg-white border-primary-100 hover:border-primary-200 hover:bg-primary-50/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            announcement.priority === 'urgent'
                              ? 'bg-danger-100 text-danger-600 animate-pulse-slow'
                              : announcement.priority === 'important'
                              ? 'bg-warning-100 text-warning-600'
                              : 'bg-primary-100 text-primary-600'
                          }`}
                        >
                          <PriorityIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                              style={{
                                backgroundColor: priorityConfig.bgColor,
                                color: priorityConfig.color,
                                border: `1px solid ${priorityConfig.borderColor}`,
                              }}
                            >
                              {priorityConfig.label}
                            </span>
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                              style={{
                                backgroundColor: typeConfig.bgColor,
                                color: typeConfig.color,
                                border: `1px solid ${typeConfig.borderColor}`,
                              }}
                            >
                              {typeConfig.label}
                            </span>
                            {!isRead && (
                              <span className="inline-flex items-center justify-center w-1.5 h-1.5 rounded-full bg-danger-500" />
                            )}
                          </div>
                          <h3
                            className={`text-sm font-medium leading-snug line-clamp-2 ${
                              isRead ? 'text-primary-700' : 'text-primary-900 font-semibold'
                            }`}
                          >
                            {announcement.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-2 text-xs text-primary-400">
                            <span className="inline-flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {announcement.authorName.split('-')[1] || announcement.authorName}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {announcement.publishTime.slice(5, 16)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-16">
                  <Empty description="暂无匹配的公告" />
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 p-4 lg:m-0 lg:p-6 -m-4 mt-4 lg:mt-0 lg:pt-6 lg:border-t-0 border-t border-primary-100">
            {selectedAnnouncement ? (
              <div className="space-y-5">
                <div>
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {(() => {
                        const priorityConfig = PRIORITY_LABEL_MAP[selectedAnnouncement.priority];
                        const PriorityIcon = priorityConfig.icon;
                        return (
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold"
                            style={{
                              backgroundColor: priorityConfig.bgColor,
                              color: priorityConfig.color,
                              border: `1px solid ${priorityConfig.borderColor}`,
                            }}
                          >
                            <PriorityIcon className="w-3.5 h-3.5" />
                            {priorityConfig.label}
                          </span>
                        );
                      })()}
                      {(() => {
                        const typeConfig = TYPE_LABEL_MAP[selectedAnnouncement.type];
                        return (
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold"
                            style={{
                              backgroundColor: typeConfig.bgColor,
                              color: typeConfig.color,
                              border: `1px solid ${typeConfig.borderColor}`,
                            }}
                          >
                            <Tag className="w-3.5 h-3.5" />
                            {typeConfig.label}
                          </span>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg border border-primary-200 text-primary-500 hover:text-info-600 hover:border-info-200 hover:bg-info-50 transition-all">
                        <BookmarkPlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-primary-900 leading-relaxed">
                    {selectedAnnouncement.title}
                  </h2>
                </div>

                <div className="flex items-center gap-4 flex-wrap pb-4 border-b border-primary-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-info-100 flex items-center justify-center text-info-600 font-semibold text-sm">
                      {selectedAnnouncement.authorName.slice(-2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary-900">{selectedAnnouncement.authorName}</p>
                      <p className="text-xs text-primary-400 inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {selectedAnnouncement.publishTime}
                      </p>
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-4 text-sm">
                    <span className="inline-flex items-center gap-1.5 text-primary-500">
                      <Eye className="w-4 h-4" />
                      阅读量 <span className="font-semibold text-primary-700">{selectedAnnouncement.readCount}</span>
                    </span>
                  </div>
                </div>

                <div className="prose max-w-none py-2">
                  {renderMarkdown(selectedAnnouncement.content)}
                </div>

                {selectedAnnouncement.id === 'ann-001' ||
                selectedAnnouncement.id === 'ann-002' ? (
                  <div className="mt-6 p-4 rounded-lg bg-primary-50/50 border border-primary-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Paperclip className="w-4 h-4 text-primary-500" />
                      <span className="text-sm font-semibold text-primary-700">
                        案例附件 ({ATTACHMENTS.length})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {ATTACHMENTS.map((att, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-lg bg-white border border-primary-100 hover:border-info-200 hover:bg-info-50/30 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-info-50 flex items-center justify-center text-info-600">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-primary-900">{att.name}</p>
                              <p className="text-xs text-primary-400">{att.size}</p>
                            </div>
                          </div>
                          <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-info-600 hover:bg-info-100 transition-all">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-primary-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success-500" />
                    <span className="text-xs text-success-600">
                      我已阅读并理解以上公告内容
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AntTag color="blue">已确认阅读</AntTag>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-24">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="请选择左侧公告查看详情"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        title={
          <span className="flex items-center gap-2 text-base font-semibold">
            <Megaphone className="w-5 h-5 text-warning-600" />
            发布新公告
          </span>
        }
        open={isModalOpen}
        onOk={handleFormSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText="发布公告"
        cancelText="取消"
        width={680}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="title"
            label="公告标题"
            rules={[{ required: true, message: '请输入公告标题' }]}
          >
            <input type="text" placeholder="请输入公告标题，建议简明扼要" className="input-field" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="type"
              label="公告类型"
              rules={[{ required: true, message: '请选择公告类型' }]}
            >
              <Select size="middle" placeholder="请选择公告类型">
                <Option value="policy">政策规则</Option>
                <Option value="case">典型案例</Option>
                <Option value="notice">通知公告</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="priority"
              label="优先级"
              rules={[{ required: true, message: '请选择优先级' }]}
            >
              <Select size="middle" placeholder="请选择优先级">
                <Option value="urgent">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-danger-500" />
                    紧急
                  </span>
                </Option>
                <Option value="important">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-warning-500" />
                    重要
                  </span>
                </Option>
                <Option value="normal">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary-400" />
                    普通
                  </span>
                </Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="content"
            label="公告内容"
            rules={[{ required: true, message: '请输入公告内容' }]}
            extra="支持文本格式，可使用序号自动识别列表"
          >
            <TextArea
              rows={8}
              placeholder="请输入公告正文内容..."
              style={{ resize: 'none' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
