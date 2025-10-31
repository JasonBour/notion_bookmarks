'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher'
import * as Icons from 'lucide-react' // 仍然需要导入 Icons，但仅用于类型检查和回退
import { WebsiteConfig } from '@/types/notion'
import { useTheme } from 'next-themes'
import dynamic from 'next/dynamic' // 引入 next/dynamic
import React, { ComponentType } from 'react'; // 确保导入 React 和 ComponentType

interface Category {
  id: string
  name: string
  iconName?: string
  subCategories: {
    id: string
    name: string
  }[]
}

interface NavigationProps {
  categories: Category[]
  config: WebsiteConfig
}

const defaultConfig: WebsiteConfig = {
  SOCIAL_GITHUB: '',
  SOCIAL_BLOG: '',
  SOCIAL_X: '',
  SOCIAL_JIKE: '',
  SOCIAL_WEIBO: ''
}

// ----------------------------------------------------
// ✅ 新增：动态图标渲染组件
// ----------------------------------------------------
interface IconRendererProps {
    iconName: string | undefined;
    className: string;
}

// 定义 LucideIcon 最终将解析到的组件类型，以供类型断言使用。
// 它是一个 React.FC，接受 LucideProps（但移除了 ref）和 className。
type LucideIconComponent = React.FC<Omit<Icons.LucideProps, 'ref'> & { className: string }>;


const IconRenderer: React.FC<IconRendererProps> = ({ iconName, className }) => {
    // 默认图标：如果没有提供 iconName，或者加载失败，使用 Globe
    const DefaultIcon = Icons.Globe; 

    if (!iconName) {
        return <DefaultIcon className={className} />;
    }

    // 动态导入 Lucide 图标
    // ⚠️ 最终修复：移除 dynamic 的泛型参数，并在 dynamic 调用的结果上使用类型断言。
    const LucideIcon = dynamic(() =>
        // 尝试从 lucide-react 模块中获取对应名称的组件
        import('lucide-react').then((mod) => {
            // 获取组件。将组件强制转换为 ComponentType<any> 以避免 LucideProps 的复杂类型干扰
            const Component = (mod[iconName as keyof typeof mod] as ComponentType<any>) || DefaultIcon;

            // 返回模块结构
            return { default: Component }; 
        }),
        { 
            loading: () => <Icons.Loader className={cn("animate-spin", className)} />, // 加载时的占位符
            ssr: false // 强制在客户端渲染
        }
    ) as LucideIconComponent; // <-- 对最终组件进行类型断言，以满足 JSX 属性检查

    // LucideIcon 已经是动态导入的结果，并且被类型断言为接受 className prop 的组件
    return <LucideIcon className={className} />;
};
// ----------------------------------------------------


export default function Navigation({ categories, config = defaultConfig }: NavigationProps) {
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const { theme } = useTheme(); // Get current theme

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  // 处理导航点击
  const handleNavClick = (categoryId: string, subCategoryId?: string) => {
    setActiveCategory(categoryId);
    
    // 确保在客户端环境中执行DOM操作
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    const elementId = subCategoryId ? `${categoryId}-${subCategoryId}` : categoryId;
    const element = document.getElementById(elementId);
    
    if (element) {
      // 获取元素的位置
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // 滚动到元素位置，减去顶部导航栏的高度（根据实际高度调整）
      window.scrollTo({
        top: rect.top + scrollTop - 100,
        behavior: 'smooth'
      });
    }
  };

  // Set default active category on mount
  useEffect(() => {
    if (categories.length > 0 && activeCategory === '') {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  return (
    <>
      {/* 移动端顶部导航 */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-20 bg-background border-b">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center space-x-2">
            <Icons.Rocket className="w-5 h-5 text-foreground" />
            <span className="neon-title">{config.SITE_TITLE}</span>
          </div>
          {config.SHOW_THEME_SWITCHER !== 'false' && <ThemeSwitcher />}
        </div>
        <div className="overflow-x-auto flex items-center h-12 border-t scrollbar-none">
          <div className="flex px-4 min-w-full">
            <div className="flex space-x-2 mx-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleNavClick(category.id)}
                  className={cn(
                    "whitespace-nowrap px-3 py-1.5 text-sm rounded-full transition-colors shrink-0",
                    activeCategory === category.id
                      ? theme === 'simple-dark'
                        ? "bg-primary text-primary-foreground font-medium"
                        : "bg-primary text-white font-medium"
                      : theme === 'simple-dark'
                        ? "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* 桌面端边导航 */}
      <nav className="hidden lg:block w-[280px] flex-shrink-0 h-screen sticky top-0 p-4 overflow-y-auto border-r">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Icons.Rocket className="w-5 h-5 text-foreground" />
            <span className="neon-title">{config.SITE_TITLE}</span>
          </div>
          {config.SHOW_THEME_SWITCHER !== 'false' && <ThemeSwitcher />}
        </div>
        <ul className="space-y-1 pb-24">
          {categories.map((category) => {
            // ⚠️ 移除旧的运行时检查和赋值逻辑，改用 IconRenderer 组件
            // const IconComponent = category.iconName && (category.iconName in Icons)
            //   ? (Icons[category.iconName as keyof typeof Icons] as React.ComponentType)
            //   : Icons.Globe;

            return (
              <li key={category.id}>
                <div className="flex flex-col">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors",
                      expandedCategories.has(category.id)
                        ? "bg-accent"
                        : "hover:bg-accent/50"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      {/* ✅ 替换为新的 IconRenderer 组件 */}
                      <IconRenderer iconName={category.iconName} className="w-4 h-4" />
                      <span>{category.name}</span>
                    </div>
                    <Icons.ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform",
                        expandedCategories.has(category.id) ? "rotate-180" : ""
                      )}
                    />
                  </button>
                  {expandedCategories.has(category.id) && (
                    <ul className="mt-1 ml-4 space-y-1">
                      {category.subCategories.map((subCategory) => (
                        <li key={subCategory.id}>
                          <button
                            onClick={() => handleNavClick(category.id, subCategory.id)}
                            className={cn(
                              "w-full text-left px-4 py-2 rounded-lg transition-colors text-sm",
                              activeCategory === `${category.id}-${subCategory.id}`
                                ? "bg-primary text-white font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            )}
                          >
                            {subCategory.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
