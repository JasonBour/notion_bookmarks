// src/app/page.tsx
import LinkContainer from '@/components/layout/LinkContainer';
import Navigation from '@/components/layout/Navigation';
import { getLinks, getCategories, getWebsiteConfig } from '@/lib/notion';
import Footer from '@/components/layout/Footer';
import { preloadIcons } from '@/lib/iconCache';

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

	// 处理链接数据，只保留启用分类中的链接
	const enabledCategories = new Set(notionCategories.map(cat => cat.name));
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

	// 移除服务器端预加载，先确保图标能正常显示
	// 后续再优化缓存机制

	return (
		<div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
			{/* 移动端顶部导航 */}
			<nav className="fixed top-0 left-0 right-0 z-30 bg-white border-b lg:hidden">
				<Navigation categories={categoriesWithSubs} config={config} />
			</nav>
			{/* PC端侧边栏导航 */}
			<aside className="fixed left-0 top-0 w-[300px] h-screen z-20  hidden lg:block pb-24">
				<Navigation categories={categoriesWithSubs} config={config} />
			</aside>
			<main className="ml-0 lg:ml-[300px] pt-[24px] lg:pt-2 min-h-screen flex flex-col">
				{/* 个人介绍和二维码区域 */}
				<div className="w-full mb-4 px-4">
					<div className="flex flex-col lg:flex-row gap-4">
						{/* 左边：个人介绍 */}
						<div className="bg-white p-4 rounded-lg shadow-sm border border-border/40 flex-1">
							<h2 className="text-lg font-bold mb-2">个人介绍</h2>
							<div className="space-y-3">
							<div className="flex items-start">
								<span className="font-medium text-sm w-24">昵称：</span>
								<span className="text-sm">Jason</span>
							</div>
							<div className="flex items-start">
								<span className="font-medium text-sm w-24">简介：</span>
								<div className="space-y-2">
									<div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground/90">
										<span>专注Ai</span>
										<span className="text-muted-foreground/50">·</span>
										<span>创业</span>
										<span className="text-muted-foreground/50">·</span>
										<span>自媒体</span>
									</div>
									<div className="text-sm text-muted-foreground/90 leading-relaxed">
										7年创业经验 · 自媒体公司创始人 · 做了上百亿的流量 · 操盘过10位以上的商业IP实现了千万营收
									</div>
								</div>
							</div>
							<div className="flex items-start">
								<span className="font-medium text-sm w-24 whitespace-nowrap">详细了解我：</span>
								<span className="text-sm">
									<a href="https://gnsj55l9zt.feishu.cn/wiki/Z7lewA2pXi6ABTk2e52cpr7dnXh?pre_pathname=%2Fdrive%2Fhome%2F" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
										飞书个人主页
									</a>
								</span>
							</div>
						</div>
						</div>
						
						{/* 右边：二维码 */}
						<div className="flex gap-4">
							{/* 微信二维码 */}
							<div className="bg-white p-4 rounded-lg shadow-sm border border-border/40 text-center flex flex-col items-center">
								<h3 className="text-sm font-medium mb-2 w-full text-center">微信二维码</h3>
								<div className="w-32 h-32 rounded flex items-center justify-center">
									<img src="/your-wechat-qr-code.png" alt="微信二维码" className="w-full h-full object-contain rounded" />
								</div>
							</div>
							
							{/* 公众号二维码 */}
							<div className="bg-white p-4 rounded-lg shadow-sm border border-border/40 text-center flex flex-col items-center">
								<h3 className="text-sm font-medium mb-2 w-full text-center">公众号二维码</h3>
								<div className="w-32 h-32 rounded flex items-center justify-center">
									<img src="/your-official-account-qr-code.png" alt="公众号二维码" className="w-full h-full object-contain rounded" />
								</div>
							</div>
						</div>
					</div>
				</div>
				
				<div className="flex-1 w-full min-w-0 overflow-x-hidden px-4 py-2 lg:pt-0 pb-24">
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