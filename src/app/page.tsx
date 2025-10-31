// src/app/page.tsx
import LinkContainer from '@/components/layout/LinkContainer';
import Navigation from '@/components/layout/Navigation';
import { getLinks, getCategories, getWebsiteConfig } from '@/lib/notion';
import Footer from '@/components/layout/Footer';
import { SimpleTime, AnalogClock, Weather, IPInfo, HotNews } from '@/components/widgets';
import WidgetsContainer from '@/components/layout/WidgetsContainer';
import React from 'react';

// 保持此文件干净，不设置 revalidate。
// 实时刷新逻辑已在 lib/notion.ts 中通过 noStore() 彻底实现。

export default async function HomePage() {
  // 获取数据
  const [notionCategories, links, config] = await Promise.all([
    getCategories(),
    getLinks(),
    getWebsiteConfig(),
  ]);


  // 获取启用的分类名称集合
  const enabledCategories = new Set(notionCategories.map(cat => cat.name));

  // 处理链接数据，只保留启用分类中的链接
  const processedLinks = links
    .map(link => ({
      ...link,
      category1: link.category1 || '未分类',
      category2: link.category2 || '默认'
    }))
    .filter(link => enabledCategories.has(link.category1));

  // 获取有链接的分类集合
  const categoriesWithLinks = new Set(processedLinks.map(link => link.category1));

  // 过滤掉没有链接的分类
  const activeCategories = notionCategories.filter(category => 
    categoriesWithLinks.has(category.name)
  );

  // 为 Notion 分类添加子分类信息
  const categoriesWithSubs = activeCategories.map(category => {
    const subCategories = new Set(
      processedLinks
        .filter(link => link.category1 === category.name)
        .map(link => link.category2)
    );

    return {
      ...category,
      subCategories: Array.from(subCategories).map(subCat => ({
        id: subCat.toLowerCase().replace(/\s+/g, '-'),
        name: subCat
      }))
    };
  });

  const widgetMap: Record<string, React.ReactNode> = {
    '简易时钟': <SimpleTime />,
    '圆形时钟': <AnalogClock />,
    '天气': <Weather />,
    'IP信息': <IPInfo />,
    '热搜': <HotNews />,
    // 你可以继续扩展更多组件
  };
  const widgetConfig = config.WIDGET_CONFIG?.split(',').map(s => s.trim()).filter(Boolean) ?? [];
  const widgets = widgetConfig
    .map((name, idx) => {
      const Comp = widgetMap[name];
      if (!Comp) return null;
      return <React.Fragment key={name + '-' + idx}>{Comp}</React.Fragment>;
    })
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* 移动端顶部导航 */}
      <nav className="fixed top-0 left-0 right-0 z-30 bg-white border-b lg:hidden">
        <Navigation categories={categoriesWithSubs} config={config} />
      </nav>
      {/* PC端侧边栏导航 */}
      <aside className="fixed left-0 top-0 w-[300px] h-screen z-20  hidden lg:block pb-24">
        <Navigation categories={categoriesWithSubs} config={config} />
      </aside>
      <main className="ml-0 lg:ml-[300px] pt-[56px] lg:pt-4 min-h-screen flex flex-col">
        {widgets.length > 0 && (
          <div className="w-full">
            <WidgetsContainer>
              {widgets}
            </WidgetsContainer>
          </div>
        )}
        <div className="flex-1 w-full min-w-0 overflow-x-hidden px-4 py-4 lg:pt-0 pb-24 pt-16">
          <LinkContainer 
            initialLinks={processedLinks} 
            enabledCategories={enabledCategories}
            categories={activeCategories}
          />
        </div>
      </main>
      <Footer config={config} className="fixed left-0 right-0 bottom-0 z-30" />
    </div>
  );
}
