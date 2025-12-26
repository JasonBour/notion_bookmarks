'use client';

import { useEffect } from 'react';

// 访问统计组件，用于记录页面访问次数
const VisitCounter = () => {
  useEffect(() => {
    // 调用API记录访问次数
    const recordVisit = async () => {
      try {
        await fetch('/api/visit-count', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('记录访问次数失败:', error);
      }
    };

    recordVisit();
  }, []);

  // 这个组件不渲染任何内容，只在后台执行API调用
  return null;
};

export default VisitCounter;