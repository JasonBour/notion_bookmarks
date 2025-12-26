'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminRootLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // 检查localStorage中是否有认证状态
  useEffect(() => {
    const storedAuth = localStorage.getItem('adminAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 这里可以替换为更安全的密码验证逻辑
    if (password === 'your-secret-password') {
      setIsAuthenticated(true);
      setError('');
      // 将认证状态存储在localStorage中
      localStorage.setItem('adminAuthenticated', 'true');
    } else {
      setError('密码错误，请重试');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    setIsAuthenticated(false);
    setPassword('');
    router.push('/admin');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">后台管理系统</h1>
          <p className="text-center text-gray-600 mb-8">请输入密码访问后台</p>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                placeholder="请输入访问密码"
                autoFocus
              />
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium"
            >
              登录
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      {/* 全局退出按钮，可在需要时显示 */}
      <button
        onClick={handleLogout}
        className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 text-sm shadow-lg"
      >
        退出登录
      </button>
    </>
  );
};

export default AdminRootLayout;
