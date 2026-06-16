import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronRight,
  User,
  Settings,
  LogOut,
  HelpCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const routeTitles: Record<string, string> = {
  "/dashboard": "规则总览",
  "/queue": "待审队列",
  "/compare": "案例比对",
  "/punishment": "处罚台账",
  "/review": "策略复盘",
  "/review/inspection": "巡检中心",
  "/review/announcements": "口径公告",
};

interface Notification {
  id: number;
  title: string;
  desc: string;
  time: string;
  type: "info" | "warning" | "danger";
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    title: "高风险订单预警",
    desc: "检测到5笔异常交易需要人工审核",
    time: "5分钟前",
    type: "danger",
    read: false,
  },
  {
    id: 2,
    title: "策略规则更新",
    desc: "欺诈检测规则v2.3已发布",
    time: "1小时前",
    type: "info",
    read: false,
  },
  {
    id: 3,
    title: "待处理案件提醒",
    desc: "您有12个案件超过24小时未处理",
    time: "2小时前",
    type: "warning",
    read: true,
  },
  {
    id: 4,
    title: "系统公告",
    desc: "本周六凌晨2:00-4:00系统维护",
    time: "昨天",
    type: "info",
    read: true,
  },
];

export default function AppHeader() {
  const location = useLocation();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const crumbs: { label: string; path?: string }[] = [
      { label: "首页", path: "/dashboard" },
    ];

    if (path === "/dashboard") {
      crumbs.push({ label: "规则总览" });
    } else if (path.startsWith("/review")) {
      crumbs.push({ label: "策略复盘", path: "/review" });
      const sub = path.split("/")[2];
      if (sub === "inspection") {
        crumbs.push({ label: "巡检中心" });
      } else if (sub === "announcements") {
        crumbs.push({ label: "口径公告" });
      }
    } else {
      const title = routeTitles[path];
      if (title) crumbs.push({ label: title });
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getNotifColor = (type: Notification["type"]) => {
    switch (type) {
      case "danger":
        return "bg-danger-500";
      case "warning":
        return "bg-warning-500";
      default:
        return "bg-info-500";
    }
  };

  return (
    <header className="h-16 bg-white border-b border-primary-100 flex items-center px-6 sticky top-0 z-40">
      <nav className="breadcrumb mr-8 flex-shrink-0">
        {breadcrumbs.map((crumb, idx) => (
          <span key={idx} className="flex items-center gap-2">
            {idx > 0 && <ChevronRight className="w-4 h-4 breadcrumb-separator" />}
            {crumb.path && idx < breadcrumbs.length - 1 ? (
              <Link to={crumb.path} className="breadcrumb-item">
                {crumb.label}
              </Link>
            ) : (
              <span
                className={cn(
                  idx === breadcrumbs.length - 1
                    ? "text-primary-900 font-medium"
                    : ""
                )}
              >
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex-1 max-w-md mx-auto">
        <div
          className={cn(
            "relative transition-all duration-200",
            searchFocused && "max-w-lg"
          )}
        >
          <Search
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
              searchFocused ? "text-info-500" : "text-primary-400"
            )}
          />
          <input
            type="text"
            placeholder="搜索订单号、用户ID、规则名称..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={cn(
              "w-full pl-10 pr-10 py-2 bg-primary-50 border rounded text-sm transition-all duration-200",
              searchFocused
                ? "border-info-400 bg-white outline-none shadow-info-glow"
                : "border-primary-200 hover:border-primary-300"
            )}
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-8">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className={cn(
              "relative p-2 rounded-lg transition-colors duration-150",
              showNotifications
                ? "bg-primary-100 text-primary-900"
                : "text-primary-500 hover:text-primary-900 hover:bg-primary-50"
            )}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-danger-500 text-white text-[11px] font-medium rounded-full flex items-center justify-center animate-pulse-slow">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="dropdown-menu absolute right-0 top-full mt-2 w-[380px] animate-fade-in-down">
              <div className="flex items-center justify-between px-4 py-3 border-b border-primary-100">
                <h3 className="font-semibold text-primary-900 text-sm">
                  通知中心
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-info-600 hover:text-info-700 font-medium"
                  >
                    全部已读
                  </button>
                )}
              </div>
              <div className="max-h-[360px] overflow-y-auto scrollbar-thin">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      "px-4 py-3 border-b border-primary-50 hover:bg-primary-50 cursor-pointer transition-colors last:border-b-0",
                      !notif.read && "bg-info-50/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                          getNotifColor(notif.type),
                          notif.read && "opacity-40"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={cn(
                              "text-sm font-medium truncate",
                              notif.read
                                ? "text-primary-600"
                                : "text-primary-900"
                            )}
                          >
                            {notif.title}
                          </p>
                          <span className="text-xs text-primary-400 flex-shrink-0">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-xs text-primary-500 mt-1 line-clamp-2">
                          {notif.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/review"
                className="block px-4 py-2.5 text-center text-sm text-info-600 hover:text-info-700 hover:bg-info-50 border-t border-primary-100 font-medium"
              >
                查看全部通知
              </Link>
            </div>
          )}
        </div>

        <div className="relative" ref={userRef}>
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className={cn(
              "flex items-center gap-3 p-1.5 pr-3 rounded-lg transition-colors duration-150",
              showUserMenu
                ? "bg-primary-100"
                : "hover:bg-primary-50"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-info-500 to-purple-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-primary-900 leading-tight">
                张审核
              </p>
              <p className="text-xs text-primary-500 leading-tight mt-0.5">
                风控审核员
              </p>
            </div>
          </button>

          {showUserMenu && (
            <div className="dropdown-menu absolute right-0 top-full mt-2 w-[200px] animate-fade-in-down">
              <div className="px-4 py-3 border-b border-primary-100">
                <p className="text-sm font-semibold text-primary-900">张审核</p>
                <p className="text-xs text-primary-500 mt-0.5">
                  zhang.shenhe@company.com
                </p>
              </div>
              <div className="py-1">
                <button className="dropdown-item w-full">
                  <User className="w-4 h-4" />
                  个人中心
                </button>
                <button className="dropdown-item w-full">
                  <Settings className="w-4 h-4" />
                  系统设置
                </button>
                <button className="dropdown-item w-full">
                  <HelpCircle className="w-4 h-4" />
                  帮助中心
                </button>
              </div>
              <div className="border-t border-primary-100 py-1">
                <button className="dropdown-item w-full text-danger-600 hover:!bg-danger-50 hover:!text-danger-700">
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
