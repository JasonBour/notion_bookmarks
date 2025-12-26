'use client';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';

// 侧边栏菜单项类型定义
interface SidebarItem {
  id: string;
  name: string;
  icon: string;
  path: string;
  children?: SidebarItem[];
}

// 侧边栏菜单项
const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    name: '仪表盘',
    icon: '📊',
    path: '/admin'
  },
  {
    id: 'investment',
    name: '投资管理',
    icon: '💰',
    path: '/admin/investment'
  },
  {
    id: 'content',
    name: '内容管理',
    icon: '📝',
    path: '/admin/content'
  },
  {
    id: 'twitter',
    name: 'Twitter项目',
    icon: '🐦',
    path: '/twitter/index.html'
  },
  {
    id: 'settings',
    name: '系统设置',
    icon: '⚙️',
    path: '/admin/settings'
  }
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  // 检查当前路径是否匹配菜单项或其子项
  const isActive = (item: SidebarItem) => {
    if (item.path === pathname) return true;
    if (item.children) {
      return item.children.some(child => child.path === pathname);
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 侧边栏 */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r transition-all duration-300 ease-in-out flex flex-col h-screen fixed left-0 top-0 z-30`}
      >
        {/* 侧边栏头部 */}
        <div className="p-4 border-b flex items-center justify-between">
          {isSidebarOpen && (
            <h1 className="text-xl font-bold text-gray-800">后台管理</h1>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
            </svg>
          </button>
        </div>

        {/* 侧边栏菜单 */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    if (item.path.startsWith('D:/') || item.path.startsWith('file://')) {
                      window.open(item.path, '_blank');
                    } else {
                      window.location.href = item.path;
                    }
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive(item) ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {isSidebarOpen && <span>{item.name}</span>}
                </button>
                {/* 如果有子菜单，显示子菜单 */}
                {isSidebarOpen && item.children && item.children.length > 0 && (
                  <ul className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <button
                          onClick={() => {
                            if (child.path.startsWith('D:/') || child.path.startsWith('file://')) {
                              window.open(child.path, '_blank');
                            } else {
                              window.location.href = child.path;
                            }
                          }}
                          className={`flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${pathname === child.path ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-gray-100 text-gray-600'}`}
                        >
                          <span className="text-lg">{child.icon}</span>
                          <span>{child.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* 侧边栏底部 */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
            <span className="text-xl">👤</span>
            {isSidebarOpen && (
              <div>
                <p className="text-sm font-medium text-gray-800">管理员</p>
                <p className="text-xs text-gray-500">admin@example.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 主内容区域 */}
      <main className={`${isSidebarOpen ? 'ml-64' : 'ml-20'} flex-1 transition-all duration-300 ease-in-out`}>
        {/* 顶部导航栏 */}
        <header className="bg-white border-b h-16 flex items-center justify-between px-6 fixed top-0 right-0 left-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {sidebarItems.find(item => isActive(item))?.name || '后台管理'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-800">AD</span>
            </div>
          </div>
        </header>

        {/* 内容区域 */}
        <div className="pt-20 px-6 pb-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
