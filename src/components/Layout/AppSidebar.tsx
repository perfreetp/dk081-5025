import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ListTodo,
  GitCompare,
  ShieldAlert,
  FileSearch,
  ClipboardCheck,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  Shield,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { path: string; label: string }[];
}

const menuItems: MenuItem[] = [
  {
    path: "/dashboard",
    label: "规则总览",
    icon: LayoutDashboard,
  },
  {
    path: "/queue",
    label: "待审队列",
    icon: ListTodo,
  },
  {
    path: "/compare",
    label: "案例比对",
    icon: GitCompare,
  },
  {
    path: "/punishment",
    label: "处罚台账",
    icon: ShieldAlert,
  },
  {
    path: "/review",
    label: "策略复盘",
    icon: FileSearch,
    children: [
      { path: "/review/inspection", label: "巡检中心" },
      { path: "/review/announcements", label: "口径公告" },
    ],
  },
];

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>("/review");
  const location = useLocation();

  const toggleExpand = (path: string) => {
    if (collapsed) return;
    setExpandedMenu((prev) => (prev === path ? null : path));
  };

  const isParentActive = (item: MenuItem) => {
    if (location.pathname === item.path) return true;
    if (item.children) {
      return item.children.some((child) => location.pathname === child.path);
    }
    return false;
  };

  const isChildActive = (childPath: string) => {
    return location.pathname === childPath;
  };

  return (
    <aside
      className={cn(
        "app-sidebar h-screen flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-info-500 to-purple-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-white font-semibold text-sm leading-tight">
                风控审核中台
              </span>
              <span className="text-primary-400 text-[11px] leading-tight mt-0.5">
                Risk Control System
              </span>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenu === item.path;
            const parentActive = isParentActive(item);

            return (
              <li key={item.path}>
                {hasChildren ? (
                  <div>
                    <button
                      onClick={() => toggleExpand(item.path)}
                      className={cn(
                        "sidebar-item w-full",
                        parentActive && !collapsed && "active",
                        collapsed && "justify-center px-0"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className={cn("w-5 h-5 flex-shrink-0")} />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left text-sm">
                            {item.label}
                          </span>
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform duration-200",
                              isExpanded && "rotate-180"
                            )}
                          />
                        </>
                      )}
                    </button>
                    {!collapsed && isExpanded && (
                      <ul className="mt-1 ml-6 pl-3 border-l border-sidebar-border space-y-1 animate-fade-in-down">
                        {item.children!.map((child) => {
                          const ChildIcon =
                            child.path === "/review/inspection"
                              ? ClipboardCheck
                              : Megaphone;
                          return (
                            <li key={child.path}>
                              <NavLink
                                to={child.path}
                                className={({ isActive }) =>
                                  cn(
                                    "sidebar-item !py-2",
                                    isActive && "active",
                                    "!px-3"
                                  )
                                }
                              >
                                <ChildIcon className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm">{child.label}</span>
                              </NavLink>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "sidebar-item",
                        isActive && "active",
                        collapsed && "justify-center px-0"
                      )
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <span className="text-sm">{item.label}</span>
                    )}
                  </NavLink>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-item w-full justify-center"
          title={collapsed ? "展开侧边栏" : "折叠侧边栏"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">收起菜单</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
