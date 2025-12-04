import { Client } from "@notionhq/client";
import { 
    PageObjectResponse,
    TitlePropertyItemObjectResponse,
    RichTextPropertyItemObjectResponse,
    FilesPropertyItemObjectResponse
} from "@notionhq/client/build/src/api-endpoints";
import { WebsiteConfig } from "@/types/notion";
import { cache } from "react";
import { unstable_noStore as noStore } from 'next/cache'; // 🚀 导入 noStore

// 定义获取标题文本的辅助函数
const getTitleText = (titleProperty?: TitlePropertyItemObjectResponse | null): string => {
    if (!titleProperty?.title || !ArrayOf(titleProperty.title)) return '';
    return titleProperty.title[0]?.plain_text ?? '';
};

// 定义获取富文本内容的辅助函数
const getRichText = (richTextProperty?: RichTextPropertyItemObjectResponse | null): string => {
    if (!richTextProperty?.rich_text || !ArrayOf(richTextProperty.rich_text)) return '';
    return richTextProperty.rich_text[0]?.plain_text ?? '';
};

// 定义获取文件 URL 的辅助函数
export const getFileUrl = (fileProperty?: FilesPropertyItemObjectResponse | null): string => {
    if (!fileProperty?.files || !ArrayOf(fileProperty.files) || !fileProperty.files[0]) return '';
    const file = fileProperty.files[0];
    
    // 处理外部文件
    if (file.type === 'external' && file.external) {
        return file.external.url;
    }
    // 处理内部文件
    if (file.type === 'file' && file.file) {
        return file.file.url;
    }
    return '';
};

// 定义 Notion 数据库的属性结构
interface NotionProperties {
    Name: TitlePropertyItemObjectResponse;
    Value: RichTextPropertyItemObjectResponse;
}

type NotionPage = PageObjectResponse & {
    properties: NotionProperties;
}

import { envConfig } from '@/config';

export const notion = new Client({
    auth: envConfig.NOTION_TOKEN
});

// 辅助函数，修复 Array.isArray 类型推断问题 (可选，但更安全)
const ArrayOf = Array.isArray as (arg: any) => arg is Array<any>;


// -----------------------------------------------------------------
// 获取一级分类配置 (NOTION_CATEGORIES_DB_ID)
// -----------------------------------------------------------------
export const getCategories = cache(async () => {
    noStore(); // 🚀 禁用缓存
    const databaseId = envConfig.NOTION_CATEGORIES_DB_ID;
    
    if (!databaseId) {
        return [];
    }

    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            filter: {
                property: 'Enabled',
                checkbox: {
                    equals: true
                }
            },
            sorts: [
                {
                    property: 'Order',
                    direction: 'ascending',
                },
            ],
        });

        const categories = response.results
            .filter((page): page is PageObjectResponse => 'properties' in page)
            .map((page) => {
                const pageProps = page.properties as Record<string, unknown>;
                return {
                    id: page.id,
                    name: getTitleText(pageProps.Name as TitlePropertyItemObjectResponse),
                    iconName: getRichText(pageProps.IconName as RichTextPropertyItemObjectResponse),
                    order: (pageProps.Order as { number?: number })?.number || 0,
                    enabled: (pageProps.Enabled as { checkbox?: boolean })?.checkbox || false,
                };
            });

        return categories.sort((a, b) => a.order - b.order);
    } catch (err) {
        console.error('获取一级分类配置失败:', err);
        return [];
    }
});


// -----------------------------------------------------------------
// 🚀 新增：获取一级分类 ID 到名称的映射表 (CategoryMap)
// -----------------------------------------------------------------
/**
 * 获取一级分类配置的 ID 到名称的映射表。
 * @returns { [pageId]: categoryName }
 */
export const getCategoryMap = cache(async () => {
    noStore(); // 🚀 禁用缓存
    const categories = await getCategories();
    
    const categoryMap: Record<string, string> = {};
    for (const category of categories) {
        // 使用 Page ID 作为 Key，Name 作为 Value
        categoryMap[category.id] = category.name;
    }
    
    return categoryMap;
});


// -----------------------------------------------------------------
// 🚀 新增：获取二级分类 ID 到名称的映射表 (SubCategoryMap)
// -----------------------------------------------------------------
/**
 * 获取二级分类配置的 ID 到名称的映射表。
 * ⚠️ 前提是 envConfig 中已添加 NOTION_SUB_CATEGORIES_DB_ID 变量。
 * @returns { [pageId]: subCategoryName }
 */
export const getSubCategoriesMap = cache(async () => {
    noStore(); // 🚀 禁用缓存
    const databaseId = envConfig.NOTION_SUB_CATEGORIES_DB_ID; 

    if (!databaseId) {
        console.warn("NOTION_SUB_CATEGORIES_DB_ID 未配置，跳过二级分类获取。");
        return {};
    }
    
    try {
        // 查询二级分类数据库
        const response = await notion.databases.query({
            database_id: databaseId,
            filter: {
                property: 'Enabled', // 假设二级分类也有 Enabled 属性
                checkbox: {
                    equals: true
                }
            },
            sorts: [
                {
                    property: 'Order', // 假设二级分类也有 Order 属性
                    direction: 'ascending',
                },
            ],
        });

        const subCategoryMap: Record<string, string> = {};
        
        response.results
            .filter((page): page is PageObjectResponse => 'properties' in page)
            .forEach((page) => {
                const pageProps = page.properties as Record<string, unknown>;
                const name = getTitleText(pageProps.Name as TitlePropertyItemObjectResponse);

                if (name) {
                    subCategoryMap[page.id] = name;
                }
            });
        
        return subCategoryMap;

    } catch (err) {
        console.error('获取二级分类配置失败:', err);
        return {};
    }
});


// -----------------------------------------------------------------
// 🚀 修改：获取网址链接 (getLinks) - 支持多分类关联
// -----------------------------------------------------------------
export const getLinks = cache(async () => {
    noStore(); // 🚀 禁用缓存
    const databaseId = envConfig.NOTION_LINKS_DB_ID!;
    const allLinks = [];
    let hasMore = true;
    let nextCursor: string | undefined;

    try {
        // 🚀 获取一级和二级分类的映射表
        const categoryMap = await getCategoryMap(); 
        const subCategoryMap = await getSubCategoriesMap(); 
        
        while (hasMore) {
            const response = await notion.databases.query({
                database_id: databaseId,
                start_cursor: nextCursor,
                sorts: [
                    {
                        property: 'category1',
                        direction: 'ascending',
                    },
                    {
                        property: 'category2',
                        direction: 'ascending',
                    },
                ],
            });

            response.results
                .filter((page): page is PageObjectResponse => 'properties' in page)
                .forEach((page) => {
                    const pageProps = page.properties as Record<string, unknown>;
                    
                    // 1. 解析所有关联的一级分类
                    const category1Relation = pageProps.category1 as { relation?: { id: string }[] };
                    const category1Ids = category1Relation?.relation?.map(rel => rel.id) || [];
                    
                    // 2. 解析所有关联的二级分类
                    const category2Relation = pageProps.category2 as { relation?: { id: string }[] };
                    const category2Ids = category2Relation?.relation?.map(rel => rel.id) || [];
                    
                    // 3. 获取基本链接信息
                    const baseLink = {
                        id: page.id,
                        name: getTitleText(pageProps.Name as TitlePropertyItemObjectResponse),
                        created: (pageProps.Created as { created_time?: string })?.created_time || '',
                        desc: getRichText(pageProps.desc as RichTextPropertyItemObjectResponse),
                        url: (pageProps.URL as { url?: string })?.url || '#',
                        iconfile: getFileUrl(pageProps.iconfile as FilesPropertyItemObjectResponse),
                        iconlink: (pageProps.iconlink as { url?: string })?.url || '',
                        tags: (pageProps.Tags as { multi_select?: { name: string }[] })?.multi_select?.map((tag) => tag.name) || [],
                    };
                    
                    // 4. 处理分类组合
                    // 如果没有一级分类，使用默认值
                    const category1Names = category1Ids.length > 0 
                        ? category1Ids.map(id => categoryMap[id] || '未分类').filter(Boolean)
                        : ['未分类'];
                    
                    // 如果没有二级分类，使用默认值
                    const category2Names = category2Ids.length > 0 
                        ? category2Ids.map(id => subCategoryMap[id] || '默认').filter(Boolean)
                        : ['默认'];
                    
                    // 5. 为每个一级分类和二级分类组合创建链接
                    category1Names.forEach(category1Name => {
                        category2Names.forEach(category2Name => {
                            allLinks.push({
                                ...baseLink,
                                category1: category1Name,
                                category2: category2Name,
                            });
                        });
                    });
                });

            hasMore = response.has_more;
            nextCursor = response.next_cursor || undefined;
        }

        // 对链接进行排序：先按是否置顶，再按创建时间
        allLinks.sort((a, b) => {
            // 检查是否包含"力荐👍"
            const aIsTop = a.tags.includes('力荐👍');
            const bIsTop = b.tags.includes('力荐👍');
            
            if (aIsTop !== bIsTop) {
                return aIsTop ? -1 : 1;
            }
            
            return new Date(b.created).getTime() - new Date(a.created).getTime();
        });

        return allLinks;
    } catch (error) {
        console.error('Error fetching links:', error);
        return [];
    }
});


// -----------------------------------------------------------------
// 获取网站配置 (getWebsiteConfig) - 保持不变
// -----------------------------------------------------------------
export const getWebsiteConfig = cache(async () => {
    noStore(); // 🚀 禁用缓存
    try {
        // 检查必要的环境变量
        if (!envConfig.NOTION_TOKEN || !envConfig.NOTION_WEBSITE_CONFIG_ID) {
            console.warn('Notion 配置不完整，使用默认配置');
            // 返回默认配置
            return {
                SITE_TITLE: '我的导航',
                SITE_DESCRIPTION: '个人导航网站',
                SITE_KEYWORDS: '导航,网址导航',
                SITE_AUTHOR: '',
                SITE_FOOTER: '',
                SITE_FAVICON: '/favicon.ico',
                THEME_NAME: 'simple',
                SHOW_THEME_SWITCHER: 'true',
                SOCIAL_GITHUB: '',
                SOCIAL_BLOG: '',
                SOCIAL_X: '',
                SOCIAL_JIKE: '',
                SOCIAL_WEIBO: '',
                SOCIAL_XIAOHONGSHU: '',
                CLARITY_ID: '',
                GA_ID: '',
                WIDGET_CONFIG: '',
            };
        }
        
        const response = await notion.databases.query({
            database_id: envConfig.NOTION_WEBSITE_CONFIG_ID!,
        });

        const configMap: WebsiteConfig = {};

        response.results.forEach((page) => {
            const typedPage = page as NotionPage;
            const properties = typedPage.properties;
            
            const name = getTitleText(properties.Name);
            const value = getRichText(properties.Value);

            if (name) {
                configMap[name.toUpperCase()] = value;
            }
        });

        // 获取配置数据库页面的图标作为网站图标
        const database = await notion.databases.retrieve({
            database_id: envConfig.NOTION_WEBSITE_CONFIG_ID!
        }) as { icon?: { type: string; emoji?: string; file?: { url: string }; external?: { url: string } } };
        let favicon = '/favicon.ico';

        if (database.icon) {
            if (database.icon.type === 'emoji') {
                favicon = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${database.icon.emoji}</text></svg>`;
            } else if (database.icon.type === 'file' && database.icon.file) {
                favicon = database.icon.file.url;
            } else if (database.icon.type === 'external' && database.icon.external) {
                favicon = database.icon.external.url;
            }
        }

        // 返回基础配置
        const config: WebsiteConfig = {
            SITE_TITLE: configMap.SITE_TITLE ?? '我的导航',
            SITE_DESCRIPTION: configMap.SITE_DESCRIPTION ?? '个人导航网站',
            SITE_KEYWORDS: configMap.SITE_KEYWORDS ?? '导航,网址导航',
            SITE_AUTHOR: configMap.SITE_AUTHOR ?? '',
            SITE_FOOTER: configMap.SITE_FOOTER ?? '',
            SITE_FAVICON: favicon,
            THEME_NAME: configMap.THEME_NAME ?? 'simple',
            SHOW_THEME_SWITCHER: configMap.SHOW_THEME_SWITCHER ?? 'true',
            SOCIAL_GITHUB: configMap.SOCIAL_GITHUB ?? '',
            SOCIAL_BLOG: configMap.SOCIAL_BLOG ?? '',
            SOCIAL_X: configMap.SOCIAL_X ?? '',
            SOCIAL_JIKE: configMap.SOCIAL_JIKE ?? '',
            SOCIAL_WEIBO: configMap.SOCIAL_WEIBO ?? '',
            SOCIAL_XIAOHONGSHU: configMap.SOCIAL_XIAOHONGSHU ?? '',
            CLARITY_ID: configMap.CLARITY_ID ?? '',
            GA_ID: configMap.GA_ID ?? '',
            WIDGET_CONFIG: configMap.WIDGET_CONFIG ?? '',
        };

        return config;
    } catch (error) {
        console.error('获取网站配置失败:', error);
        // 返回默认配置而不是抛出错误
        return {
            SITE_TITLE: '我的导航',
            SITE_DESCRIPTION: '个人导航网站',
            SITE_KEYWORDS: '导航,网址导航',
            SITE_AUTHOR: '',
            SITE_FOOTER: '',
            SITE_FAVICON: '/favicon.ico',
            THEME_NAME: 'simple',
            SHOW_THEME_SWITCHER: 'true',
            SOCIAL_GITHUB: '',
            SOCIAL_BLOG: '',
            SOCIAL_X: '',
            SOCIAL_JIKE: '',
            SOCIAL_WEIBO: '',
            SOCIAL_XIAOHONGSHU: '',
            CLARITY_ID: '',
            GA_ID: '',
            WIDGET_CONFIG: '',
        };
    }
});
