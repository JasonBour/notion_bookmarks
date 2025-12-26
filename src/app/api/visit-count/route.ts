import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// 定义访问统计数据类型
interface VisitData {
  total: number;
  monthly: Record<string, number>;
}

// 获取访问数据文件路径
const getVisitDataPath = () => {
  return path.join(process.cwd(), 'data', 'visit-count.json');
};

// 初始化或获取访问数据
const getVisitData = async (): Promise<VisitData> => {
  const dataPath = getVisitDataPath();
  
  try {
    // 确保data目录存在
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    
    // 尝试读取现有数据
    const data = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(data) as VisitData;
  } catch (error) {
    // 如果文件不存在，返回初始数据
    return {
      total: 0,
      monthly: {}
    };
  }
};

// 保存访问数据
const saveVisitData = async (data: VisitData) => {
  const dataPath = getVisitDataPath();
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8');
};

// 记录访问
const recordVisit = async () => {
  const visitData = await getVisitData();
  
  // 增加总访问量
  visitData.total += 1;
  
  // 获取当前月份 (YYYY-MM 格式)
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  // 增加当月访问量
  if (!visitData.monthly[currentMonth]) {
    visitData.monthly[currentMonth] = 0;
  }
  visitData.monthly[currentMonth] += 1;
  
  // 保存数据
  await saveVisitData(visitData);
  
  return visitData;
};

// 获取上月访问量
const getLastMonthVisits = (monthlyData: Record<string, number>): number => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = lastMonth.toISOString().slice(0, 7);
  return monthlyData[lastMonthKey] || 0;
};

// 获取当月访问量
const getCurrentMonthVisits = (monthlyData: Record<string, number>): number => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  return monthlyData[currentMonth] || 0;
};

// GET 请求：获取访问统计数据
export async function GET() {
  const visitData = await getVisitData();
  const lastMonthVisits = getLastMonthVisits(visitData.monthly);
  const currentMonthVisits = getCurrentMonthVisits(visitData.monthly);
  
  // 计算增长率
  const growthRate = lastMonthVisits > 0 
    ? ((currentMonthVisits - lastMonthVisits) / lastMonthVisits * 100).toFixed(1)
    : '100.0';
  
  return NextResponse.json({
    total: visitData.total,
    monthly: {
      current: currentMonthVisits,
      last: lastMonthVisits,
      growthRate: parseFloat(growthRate)
    }
  });
}

// POST 请求：记录访问
export async function POST(request: NextRequest) {
  const visitData = await recordVisit();
  const lastMonthVisits = getLastMonthVisits(visitData.monthly);
  const currentMonthVisits = getCurrentMonthVisits(visitData.monthly);
  
  // 计算增长率
  const growthRate = lastMonthVisits > 0 
    ? ((currentMonthVisits - lastMonthVisits) / lastMonthVisits * 100).toFixed(1)
    : '100.0';
  
  return NextResponse.json({
    total: visitData.total,
    monthly: {
      current: currentMonthVisits,
      last: lastMonthVisits,
      growthRate: parseFloat(growthRate)
    }
  });
}