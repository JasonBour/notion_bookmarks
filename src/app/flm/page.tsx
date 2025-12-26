// src/app/flm/page.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { getCategories, getWebsiteConfig } from '@/lib/notion';

// 从web搜索结果中获取的FLM内容，添加了用户提供的详细信息
const flmContent = {
  title: '自由人路线图·FLM',
  subtitle: '从职场到一人公司与财富自由的实战路径',
  author: '大熊Jason',
  introduction: '嗨，我是大熊Jason。欢迎加入《自由人路线图·FLM》！这是一个专门为寻求职业转型、提升副业收入、并规划财务自由的个体打造的深度内容与社群体系。我们不再贩卖焦虑，而是提供一套可复制、可落地的完整方法论，通过商业模式、个人 IP 影响力和 AI 应用三大核心支柱，帮助您实现财务自主，体面退役职场。',
  aboutAuthor: '大熊Jason，连续创业者，曾打造多个百万级影响力的个人IP，帮助数百名个体实现职业转型和收入提升。专注于自由职业、一人公司和财富自由领域的研究与实践，拥有丰富的实战经验和成功案例。',
  benefits: [
    '找到高潜力副业，并将其规模化。',
    '搭建高效能的一人公司商业飞轮。',
    '掌握投资增值策略，加速财富积累。',
    '最终实现财务自主，体面退役职场。'
  ],
  methodology: [
    {
      title: '商业模式设计',
      description: '从0到1构建可持续的商业模式，找到适合自己的盈利路径。',
      icon: '💼'
    },
    {
      title: '个人IP影响力',
      description: '打造个人品牌，建立影响力，实现流量变现。',
      icon: '🌟'
    },
    {
      title: 'AI应用赋能',
      description: '利用AI工具提升效率，实现一人抵千人的生产力。',
      icon: '🤖'
    },
    {
      title: '投资增值策略',
      description: '科学的投资方法，让钱为你工作，加速财富积累。',
      icon: '📈'
    }
  ],
  caseCategories: [
    {
      name: '自由职业与副业启动案例',
      audience: '职场人/新手副业探索者',
      description: '希望利用业余时间，从 0 到 1 验证并启动第一个盈利副业的人群。',
      examples: [
        '程序员副业：从写技术博客到知识付费',
        '设计师转型：打造个人设计工作室',
        '职场人副业：利用专长开展咨询服务'
      ]
    },
    {
      name: '一人公司与高效能运营案例',
      audience: '稳定营收的自由职业者',
      description: '希望将副业升级为稳定业务，实现年营收 50,000+，并寻求效率最大化和收入多样化的个体。',
      examples: [
        '内容创作者：建立自动化内容生产系统',
        '电商创业者：实现无人值守的电商运营',
        '咨询顾问：构建标准化服务流程'
      ]
    },
    {
      name: '投资与财富增值案例',
      audience: '追求财务自由的个体',
      description: '希望在主业/副业收入稳定后，通过科学的投资增值策略，加速达成退役目标的人群。',
      examples: [
        '指数基金投资：长期稳健增值策略',
        '房产投资：实现被动收入的有效途径',
        '股权众筹：早期项目投资机会'
      ]
    }
  ],
  // 新增的其他权益内容，包含详细描述
  exploreSocial: {
    title: '🎁 其他权益',
    items: [
      {
        title: '👋 社交互助：资源对接与人脉拓展',
        description: '',
        subItems: [
          {
            title: '项目资源需求墙：',
            subPoints: [
              '项目合作需求发布：会员间的商业机会对接。',
              '技能/资源互换：实现低成本的资源获取。',
              '外包需求对接：寻找可靠的合作方。',
              '投融资信息：为有发展潜力的一人公司提供支持。'
            ]
          },
          {
            title: '链接社交广场：',
            subPoints: [
              '建立真实的专业人脉连接：会员自我介绍与标签、行业兴趣小组、线下交流/聚会。'
            ]
          }
        ],
        icon: '🤝'
      },
      {
        title: '🎥 闭门直播与资源回放',
        description: '为会员提供独家的深度学习机会',
        subItems: [
          {
            title: '',
            subPoints: [
              '实战项目全程录制：拆解内部项目从启动到变现的全过程。',
              '项目复盘分享：对重大商业决策或转型节点的深度复盘与分析。',
              '嘉宾闭门交流：不定期邀请行业内成功的自由职业者/一人公司创始人进行独家分享。',
              '特别主题分享：聚焦最新技术（如 AI 前沿应用）和趋势的深度解读。'
            ]
          }
        ],
        icon: '🎥'
      }
    ]
  },
  // 新增的实战专栏与训练营内容，包含详细描述
  communityBenefits: {
    title: '🎉 实战专栏与训练营',
    items: [
      {
        title: '🤖 AI 应用技能训练营',
        description: '学习如何利用现有 AI 工具实现高效率、低成本的运营，掌握 AI 应用的核心技能。',
        icon: '🤖'
      },
      {
        title: '✍️ 个人 IP 与内容影响力训练营',
        description: '专注于打造个人品牌和影响力，实现高溢价变现，掌握内容创作和传播的核心方法。',
        icon: '✍️'
      },
      {
        title: '💼 轻资产商业模式训练营',
        description: '学习一人公司运行的底层逻辑和管理效率，掌握轻资产商业模式的构建方法。',
        icon: '�'
      }
    ]
  },
  // 新增的答疑与购买指南内容，包含详细描述
  faqPricing: {
    title: '❓ 答疑与购买指南 (FAQ & Pricing)',
    items: [
      {
        title: '会员价格和服务内容',
        description: '感谢您的认可和支持，目前 《自由人路线图·FLM》年度订阅 定价为 ¥365/年（原价 ¥YYY）。',
        subDescription: '订阅包含：所有 FLM 内容体系（案例库 + 实战专栏 + 探索世界）、社群交流与答疑、资源对接服务，以及所有内容源文件和模板资料库的学习、研究文档。',
        icon: '💰'
      },
      {
        title: '可能会问到的问题',
        icon: '🙋‍♀️'
      },
      {
        title: '会员服务',
        description: '付费订阅后，请添加您的专属微信号 [您的微信号或客服号]，并附上付费截图。我们会邀请您进入会员交流与答疑社群。如果您对订阅有任何疑问，或对项目有任何建议，欢迎随时联系我们！',
        icon: '🛎️'
      }
    ]
  },
  callToAction: '加入《自由人路线图·FLM》，开启你的财富自由之旅！',
  price: '年度订阅：¥365',
  guarantee: '30天不满意全额退款'
};

export default async function FLMPage() {
  // 获取必要的数据
  const [notionCategories, config] = await Promise.all([
    getCategories(),
    getWebsiteConfig(),
  ]);

  // 处理分类数据，只保留启用的分类，并添加subCategories属性
  const enabledCategories = new Set(notionCategories.map(cat => cat.name));
  const categoriesWithSubs = notionCategories
    .filter(category => enabledCategories.has(category.name))
    .map(category => ({ ...category, subCategories: [] }));

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
      
      {/* 页面内容 */}
      <main className="ml-0 lg:ml-[300px] pt-[24px] lg:pt-2 min-h-screen flex flex-col">
        <div className="w-full flex-1 px-4 py-8 max-w-6xl mx-auto">
          {/* 页面标题 */}
          <div className="mb-16 text-center">
            <div className="inline-block bg-primary/10 px-6 py-2 rounded-full text-primary font-medium mb-4">
              Freeman Line Map
            </div>
            <h1 className="text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              {flmContent.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">{flmContent.subtitle}</p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm text-muted-foreground">作者: {flmContent.author}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
              <span className="text-sm text-muted-foreground">年度订阅</span>
            </div>
          </div>

          {/* 英雄区域 */}
          <div className="bg-white rounded-2xl p-4 lg:p-6 mb-6 border border-border/40 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              {/* 左侧：标题和简短介绍 */}
              <div className="md:col-span-5 space-y-2">
                <div className="inline-block bg-primary/10 px-2 py-0.5 rounded-full text-primary text-xs font-medium">
                  Freeman Line Map
                </div>
                <h2 className="text-xl lg:text-2xl font-bold">
                  关于《自由人路线图·FLM》
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  嗨，我是大熊Jason。欢迎加入《自由人路线图·FLM》！这是一个专门为寻求职业转型、提升副业收入、并规划财务自由的个体打造的深度内容与社群体系。
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  我们不再贩卖焦虑，而是提供一套可复制、可落地的完整方法论，通过三大核心支柱帮助您实现财务自主，体面退役职场。
                </p>
              </div>
              
              {/* 右侧：核心方法论和核心价值合并 */}
              <div className="md:col-span-7">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 核心方法论 */}
                  <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-md p-3 border border-border/30">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <span className="text-primary">💡</span>
                      核心方法论
                    </h3>
                    <div className="space-y-2">
                      {flmContent.methodology.map((item, index) => (
                        <div key={index} className="flex items-start gap-1.5">
                          <span className="text-base flex-shrink-0">{item.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-medium text-xs">{item.title}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* 核心价值 */}
                  <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-md p-3 border border-border/30">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <span className="text-primary">🌟</span>
                      核心价值
                    </h3>
                    <div className="space-y-3">
                      {flmContent.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start gap-2.5">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <p className="text-sm font-medium">{benefit}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 作者介绍 */}
          <div className="bg-white rounded-2xl p-8 mb-12 border border-border/40 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              关于作者
            </h2>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden shadow-md border-2 border-primary/20 flex-shrink-0 relative">
                <Image 
                  src="/author-avatar.png" 
                  alt="大熊Jason头像" 
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">大熊Jason</h3>
                <p className="text-muted-foreground mb-4">{flmContent.aboutAuthor}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">连续创业者</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">IP打造专家</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">财富自由导师</span>
                </div>
              </div>
            </div>
          </div>

          {/* 案例库部分 */}
          <div id="case-studies" className="bg-white rounded-2xl p-8 mb-12 border border-border/40 shadow-sm">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              📚 案例库：真实商业案例深度拆解
            </h2>
            <p className="mb-8 text-muted-foreground">这里案例库将聚焦于&quot;自由人&quot;和&quot;一人公司&quot;所需的技能和增长路径。</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {flmContent.caseCategories.map((category, index) => (
                <div 
                  key={index} 
                  className="rounded-xl border border-border/40 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/30"
                >
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-5 border-b border-border/30">
                    <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">适用人群</p>
                    <p className="text-sm font-medium mt-1">{category.audience}</p>
                  </div>
                  <div className="p-5">
                    <h4 className="font-medium mb-3">案例示例</h4>
                    <ul className="space-y-2 mb-4">
                      {category.examples.map((example, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                          <span className="text-sm text-muted-foreground">{example}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 实战专栏与训练营部分 */}
          <div className="bg-white rounded-2xl p-8 mb-12 border border-border/40 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">{flmContent.communityBenefits.title}</h2>
            
            {/* 实战专栏与训练营内容 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {flmContent.communityBenefits.items.map((item, index) => (
                <div key={index} className="p-5 rounded-xl border border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-2xl flex-shrink-0">{item.icon}</span>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 其他权益部分 */}
          <div className="bg-white rounded-2xl p-8 mb-12 border border-border/40 shadow-sm">
            <h2 className="text-2xl font-bold mb-2">{flmContent.exploreSocial.title}</h2>
            <p className="mb-8 text-muted-foreground">会员专享权益与服务</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {flmContent.exploreSocial.items.map((item, index) => (
                <div 
                  key={index} 
                  className="rounded-xl border border-border/40 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/30"
                >
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-5 border-b border-border/30">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    {item.subItems && (
                      <div className="space-y-5">
                        {item.subItems.map((subItem, subIndex) => (
                          <div key={subIndex}>
                            <h4 className="font-medium mb-3">{subItem.title}</h4>
                            {subItem.subPoints && (
                              <ul className="space-y-2">
                                {subItem.subPoints.map((point, pointIndex) => (
                                  <li key={pointIndex} className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                                    <span className="text-sm text-muted-foreground">{point}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 答疑与购买指南部分 */}
          <div className="bg-white rounded-2xl p-8 mb-12 border border-border/40 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">{flmContent.faqPricing.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {flmContent.faqPricing.items.map((item, index) => (
                <div key={index} className="p-5 rounded-xl border border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-2xl flex-shrink-0">{item.icon}</span>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                  </div>
                  {item.description && (
                    <p className="text-muted-foreground mb-3">{item.description}</p>
                  )}
                  {item.subDescription && (
                    <p className="text-muted-foreground mb-4">{item.subDescription}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 行动召唤 */}
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-10 mb-12 border border-border/40 text-center">
            <h2 className="text-3xl font-bold mb-4">{flmContent.callToAction}</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              我们不再贩卖焦虑，而是提供一套可复制、可落地的完整方法论，通过商业模式、个人IP影响力和AI应用三大核心支柱，帮助您实现财务自主。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <span className="text-3xl font-bold">{flmContent.price}</span>
            </div>
            <Link 
              href="https://gnsj55l9zt.feishu.cn/wiki/GAMtwOuCLi4D4GkDrJNcDBMongg?from=from_copylink" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              立即订阅
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* 退款提醒 */}
          <div className="bg-yellow-50 rounded-2xl p-6 mb-12 border border-yellow-200 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-semibold text-yellow-800">重要提醒</h3>
            </div>
            <p className="text-sm text-yellow-700">
              年度会员和创始会员均为虚拟商品，不支持无理由退款。请您在购买前仔细阅读上述权益介绍，确认完全理解对应的价值，认真考虑后再做决定。
            </p>
          </div>
        </div>
        
        {/* 页脚 */}
        <Footer config={config} className="fixed left-0 right-0 bottom-0 z-30" />
      </main>
    </div>
  );
}
