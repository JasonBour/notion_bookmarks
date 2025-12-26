'use client';
import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminLayout from '@/components/admin/AdminLayout';

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

const AdminInvestment: React.FC = () => {
  // 从localStorage加载数据，或使用默认数据
  const loadData = (): InvestmentData => {
    const savedData = localStorage.getItem('investmentData');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) {
        console.error('Failed to parse saved investment data:', error);
      }
    }
    return {
      monthlyData: [...mockData.monthlyData],
      assetAllocation: [...mockData.assetAllocation],
      investmentTypes: [...mockData.investmentTypes]
    };
  };

  // 将mockData转换为状态，以便编辑
  const [investmentData, setInvestmentData] = React.useState<InvestmentData>(loadData);

  // 保存数据到localStorage
  React.useEffect(() => {
    localStorage.setItem('investmentData', JSON.stringify(investmentData));
  }, [investmentData]);

  // 编辑状态管理
  const [editingCell, setEditingCell] = React.useState<{
    rowIndex: number;
    column: keyof MonthlyData;
    value: string;
  } | null>(null);

  // 计算年度汇总数据 - 使用useMemo缓存结果
  const calculateAnnualSummary = () => {
    const totalInvestment = investmentData.monthlyData.reduce((sum, item) => sum + item.investment, 0);
    const totalIncome = investmentData.monthlyData.reduce((sum, item) => sum + item.income, 0);
    const totalExpenses = investmentData.monthlyData.reduce((sum, item) => sum + item.expenses, 0);
    const totalReturn = investmentData.monthlyData.reduce((sum, item) => sum + item.return, 0);
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
  const annualSummary = React.useMemo(() => calculateAnnualSummary(), [investmentData]);
  
  // 缓存图表数据，避免每次渲染重新创建对象
  const chartData = React.useMemo(() => ({
    monthlyData: investmentData.monthlyData,
    assetAllocation: investmentData.assetAllocation,
    investmentTypes: investmentData.investmentTypes
  }), [investmentData]);

  // 处理单元格点击，进入编辑模式
  const handleCellClick = (rowIndex: number, column: keyof MonthlyData, value: number) => {
    // 月份列不可编辑
    if (column === 'month') return;
    setEditingCell({
      rowIndex,
      column,
      value: value.toString()
    });
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingCell) {
      setEditingCell(prev => prev ? {
        ...prev,
        value: e.target.value
      } : null);
    }
  };

  // 处理保存编辑
  const handleSaveEdit = () => {
    if (editingCell) {
      const { rowIndex, column, value } = editingCell;
      const numValue = parseFloat(value) || 0;
      
      // 更新数据
      setInvestmentData(prev => {
        const newMonthlyData = [...prev.monthlyData];
        newMonthlyData[rowIndex] = {
          ...newMonthlyData[rowIndex],
          [column]: numValue
        };
        return {
          ...prev,
          monthlyData: newMonthlyData
        };
      });
      
      // 退出编辑模式
      setEditingCell(null);
    }
  };

  // 处理取消编辑
  const handleCancelEdit = () => {
    setEditingCell(null);
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 年度汇总卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                {investmentData.monthlyData.map((monthData, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{monthData.month}</td>
                    {/* 投资金额 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {editingCell && editingCell.rowIndex === rowIndex && editingCell.column === 'investment' ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={editingCell.value}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            className="w-24 px-2 py-1 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveEdit}
                            className="text-green-600 hover:text-green-800"
                            title="保存"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-800"
                            title="取消"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span
                          className="text-gray-500 cursor-pointer hover:underline"
                          onClick={() => handleCellClick(rowIndex, 'investment', monthData.investment)}
                        >
                          ¥{monthData.investment.toLocaleString()}
                        </span>
                      )}
                    </td>
                    {/* 收入 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {editingCell && editingCell.rowIndex === rowIndex && editingCell.column === 'income' ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={editingCell.value}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            className="w-24 px-2 py-1 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveEdit}
                            className="text-green-600 hover:text-green-800"
                            title="保存"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-800"
                            title="取消"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span
                          className="text-gray-500 cursor-pointer hover:underline"
                          onClick={() => handleCellClick(rowIndex, 'income', monthData.income)}
                        >
                          ¥{monthData.income.toLocaleString()}
                        </span>
                      )}
                    </td>
                    {/* 支出 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {editingCell && editingCell.rowIndex === rowIndex && editingCell.column === 'expenses' ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={editingCell.value}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            className="w-24 px-2 py-1 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveEdit}
                            className="text-green-600 hover:text-green-800"
                            title="保存"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-800"
                            title="取消"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span
                          className="text-gray-500 cursor-pointer hover:underline"
                          onClick={() => handleCellClick(rowIndex, 'expenses', monthData.expenses)}
                        >
                          ¥{monthData.expenses.toLocaleString()}
                        </span>
                      )}
                    </td>
                    {/* 投资收益 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {editingCell && editingCell.rowIndex === rowIndex && editingCell.column === 'return' ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={editingCell.value}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            className="w-24 px-2 py-1 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveEdit}
                            className="text-green-600 hover:text-green-800"
                            title="保存"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-800"
                            title="取消"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span
                          className="text-green-600 cursor-pointer hover:underline"
                          onClick={() => handleCellClick(rowIndex, 'return', monthData.return)}
                        >
                          ¥{monthData.return.toLocaleString()}
                        </span>
                      )}
                    </td>
                    {/* 月度结余 */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ¥{(monthData.income + monthData.return - monthData.expenses).toLocaleString()}
                    </td>
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
      </div>
    </AdminLayout>
  );
};

export default AdminInvestment;
