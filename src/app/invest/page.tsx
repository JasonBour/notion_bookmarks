'use client';
import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 数据类型定义
interface MonthlyData {
  month: string;
  investment: number;
  income: number;
  expenses: number;
  return: number;
}

interface InvestmentData {
  monthlyData: MonthlyData[];
  assetAllocation: { name: string; value: number }[];
  investmentTypes: { name: string; value: number }[];
}

// 模拟数据
const mockData: InvestmentData = {
  monthlyData: [
    { month: '1月', investment: 5000, income: 1200, expenses: 800, return: 400 },
    { month: '2月', investment: 5000, income: 1300, expenses: 900, return: 400 },
    { month: '3月', investment: 5000, income: 1500, expenses: 1000, return: 500 },
    { month: '4月', investment: 5000, income: 1400, expenses: 950, return: 450 },
    { month: '5月', investment: 5000, income: 1600, expenses: 1100, return: 500 },
    { month: '6月', investment: 5000, income: 1700, expenses: 1150, return: 550 },
    { month: '7月', investment: 5000, income: 1800, expenses: 1200, return: 600 },
    { month: '8月', investment: 5000, income: 1900, expenses: 1250, return: 650 },
    { month: '9月', investment: 5000, income: 2000, expenses: 1300, return: 700 },
    { month: '10月', investment: 5000, income: 2100, expenses: 1350, return: 750 },
    { month: '11月', investment: 5000, income: 2200, expenses: 1400, return: 800 },
    { month: '12月', investment: 5000, income: 2300, expenses: 1450, return: 850 },
  ],
  assetAllocation: [
    { name: '股票', value: 40 },
    { name: '基金', value: 30 },
    { name: '债券', value: 20 },
    { name: '现金', value: 10 },
  ],
  investmentTypes: [
    { name: '长期投资', value: 60 },
    { name: '短期投资', value: 25 },
    { name: '投机', value: 15 },
  ],
};

// 颜色配置
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// 密码保护组件
const PasswordProtectedPage: React.FC = () => {
  const [password, setPassword] = React.useState('');
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [error, setError] = React.useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 这里可以替换为更安全的密码验证逻辑
    if (password === 'your-secret-password') {
      setIsAuthenticated(true);
      setError('');
      // 可以将认证状态存储在localStorage中，以便在页面刷新后保持登录状态
      localStorage.setItem('isAuthenticated', 'true');
    } else {
      setError('密码错误，请重试');
    }
  };

  // 检查localStorage中是否有认证状态
  React.useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">投资理财仪表盘</h1>
          <p className="text-center text-gray-600 mb-8">请输入密码访问您的投资数据</p>
          
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

  // 计算年度汇总数据
  const calculateAnnualSummary = () => {
    const totalInvestment = mockData.monthlyData.reduce((sum, item) => sum + item.investment, 0);
    const totalIncome = mockData.monthlyData.reduce((sum, item) => sum + item.income, 0);
    const totalExpenses = mockData.monthlyData.reduce((sum, item) => sum + item.expenses, 0);
    const totalReturn = mockData.monthlyData.reduce((sum, item) => sum + item.return, 0);
    const netProfit = totalReturn + totalIncome - totalExpenses;
    const roi = totalInvestment > 0 ? ((netProfit / totalInvestment) * 100).toFixed(2) : '0';

    return {
      totalInvestment,
      totalIncome,
      totalExpenses,
      totalReturn,
      netProfit,
      roi,
    };
  };

  // 使用useMemo缓存计算结果，避免每次渲染重新计算
  const annualSummary = React.useMemo(() => calculateAnnualSummary(), []);
  
  // 缓存图表数据，避免每次渲染重新创建对象
  const chartData = React.useMemo(() => ({
    monthlyData: mockData.monthlyData,
    assetAllocation: mockData.assetAllocation,
    investmentTypes: mockData.investmentTypes
  }), []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">投资理财仪表盘</h1>
            <button
              onClick={() => {
                localStorage.removeItem('isAuthenticated');
                setIsAuthenticated(false);
                setPassword('');
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 text-sm"
            >
              退出登录
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">2025年度投资数据统计</p>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 年度汇总卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">总投资金额</p>
                <h3 className="text-3xl font-bold text-gray-800">¥{annualSummary.totalInvestment.toLocaleString()}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">年度净收益</p>
                <h3 className="text-3xl font-bold text-green-600">¥{annualSummary.netProfit.toLocaleString()}</h3>
                <p className="text-sm text-gray-500 mt-1">收益率: {annualSummary.roi}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">资产总值</p>
                <h3 className="text-3xl font-bold text-purple-600">¥{(annualSummary.totalInvestment + annualSummary.netProfit).toLocaleString()}</h3>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 月度投资趋势图 */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">月度投资趋势</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="investment" name="投资金额" fill="#0088FE" />
                  <Bar dataKey="return" name="投资收益" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 月度收益趋势图 */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">月度收益趋势</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="income" name="收入" stroke="#0088FE" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" name="支出" stroke="#FF8042" strokeWidth={2} />
                  <Line type="monotone" dataKey="return" name="投资收益" stroke="#00C49F" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 饼图区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 资产配置 */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">资产配置</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.assetAllocation}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}    
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.assetAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 投资类型占比 */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">投资类型占比</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.investmentTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}    
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.investmentTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 月度数据表格 */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">月度数据明细</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">月份</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">投资金额</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">收入</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">支出</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">投资收益</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">月度结余</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chartData.monthlyData.map((monthData, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{monthData.month}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">¥{monthData.investment.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">¥{monthData.income.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">¥{monthData.expenses.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">¥{monthData.return.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">¥{(monthData.income + monthData.return - monthData.expenses).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <th scope="row" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">总计</th>
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">¥{annualSummary.totalInvestment.toLocaleString()}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">¥{annualSummary.totalIncome.toLocaleString()}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">¥{annualSummary.totalExpenses.toLocaleString()}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-green-600">¥{annualSummary.totalReturn.toLocaleString()}</td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">¥{annualSummary.netProfit.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PasswordProtectedPage;