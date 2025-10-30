import { Client } from "@notionhq/client";
import { 
    PageObjectResponse,
    TitlePropertyItemObjectResponse,
    RichTextPropertyItemObjectResponse,
    FilesPropertyItemObjectResponse
} from "@notionhq/client/build/src/api-endpoints";
import { WebsiteConfig } from "@/types/notion";
import { cache } from "react";

// 定义获取标题文本的辅助函数
const getTitleText = (titleProperty?: TitlePropertyItemObjectResponse | null): string => {
    if (!titleProperty?.title || !Array.isArray(titleProperty.title)) return '';
    return titleProperty.title[0]?.plain_text ?? '';
};

// 定义获取富文本内容的辅助函数
const getRichText = (richTextProperty?: RichTextPropertyItemObjectResponse | null): string => {
    if (!richTextProperty?.rich_text || !Array.isArray(richTextProperty.rich_text)) return '';
    return richTextProperty.rich_text[0]?.plain_text ?? '';
};

// 定义获取文件 URL 的辅助函数
export const getFileUrl = (fileProperty?: FilesPropertyItemObjectResponse | null): string => {
    if (!fileProperty?.files || !Array.isArray(fileProperty.files) || !fileProperty.files[0]) return '';
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


// -----------------------------------------------------------------
// 获取分类（未修改，但它是 getCategoryMap 的依赖）
// -----------------------------------------------------------------
export const getCategories = cache(async () => {
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
        console.error('获取分类失败:', err);
        return [];
    }
});


// -----------------------------------------------------------------
// 🚀 新增：获取分类 ID 到名称的映射表（用于高效查找）
// -----------------------------------------------------------------
/**
 * 获取分类配置的 ID 到名称的映射表。
 * @returns { [pageId]: categoryName }
 */
export const getCategoryMap = cache(async () => {
    const categories = await getCategories();
    
    const categoryMap: Record<string, string> = {};
    for (const category of categories) {
        // 使用 Page ID 作为 Key，Name 作为 Value
        categoryMap[category.id] = category.name;
    }
    
    return categoryMap;
});


// -----------------------------------------------------------------
// 🚀 修改：获取网址链接（已适配 Relation 属性）
// -----------------------------------------------------------------
export const getLinks = cache(async () => {
    const databaseId = envConfig.NOTION_LINKS_DB_ID!;
    const allLinks = [];
    let hasMore = true;
    let nextCursor: string | undefined;

    try {
        // 🚀 修改点 1: 在开始查询前获取分类映射表
        const categoryMap = await getCategoryMap(); 
        
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

            const links = response.results
                .filter((page): page is PageObjectResponse => 'properties' in page)
                .map((page) => {
                    const pageProps = page.properties as Record<string, unknown>;
                    
                    // 🚀 修改点 2: 解析 Relation 属性
                    // 1. 获取关联属性对象
                    const category1Relation = pageProps.category1 as { relation?: { id: string }[] };
                    const category2Relation = pageProps.category2 as { relation?: { id: string }[] };
                    
                    // 2. 提取关联页面的 ID (Relation 属性返回一个数组，取第一个)
                    const category1Id = category1Relation?.relation?.[0]?.id;
                    const category2Id = category2Relation?.relation?.[0]?.id;

                    // 3. 使用 categoryMap 查找 ID 对应的名称
                    const category1Name = category1Id ? categoryMap[category1Id] : '未分类';
                    const category2Name = category2Id ? categoryMap[category2Id] : '默认';

                    return {
                        id: page.id,
                        name: getTitleText(pageProps.Name as TitlePropertyItemObjectResponse),
                        created: (pageProps.Created as { created_time?: string })?.created_time || '',
                        desc: getRichText(pageProps.desc as RichTextPropertyItemObjectResponse),
                        url: (pageProps.URL as { url?: string })?.url || '#',
                        
                        // 🚀 修改点 3: 使用新解析的名称
                        category1: category1Name,
                        category2: category2Name,
                        
                        iconfile: getFileUrl(pageProps.iconfile as FilesPropertyItemObjectResponse),
                        iconlink: (pageProps.iconlink as { url?: string })?.url || '',
                        tags: (pageProps.Tags as { multi_select?: { name: string }[] })?.multi_select?.map((tag) => tag.name) || [],
                    };
                });

            allLinks.push(...links);
            hasMore = response.has_more;
            nextCursor = response.next_cursor || undefined;
        }

        // 对链接进行排序：先按是否置顶，再按创建时间
        allLinks.sort((a, b) => {
            // 检查是否包含"力荐👍"
            const aIsTop = a
