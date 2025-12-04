// src/lib/iconCache.ts

/**
 * 图标缓存机制
 * 用于缓存已加载的图标，减少重复请求，提升性能
 */

// 图标缓存接口
export interface IconCacheItem {
  url: string;       // 图标URL
  blobUrl?: string;  // 本地Blob URL（用于持久化缓存）
  loaded: boolean;   // 是否已加载
  error: boolean;    // 是否加载失败
}

// 图标缓存类
class IconCache {
  private cache: Map<string, IconCacheItem>;
  private memoryCacheLimit: number;
  private localStorageKey: string;

  constructor() {
    this.cache = new Map();
    this.memoryCacheLimit = 100; // 内存缓存限制
    this.localStorageKey = 'notion_bookmarks_icon_cache';
    
    // 初始化时从localStorage加载缓存
    this.loadFromLocalStorage();
  }

  // 从localStorage加载缓存
  private loadFromLocalStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(this.localStorageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          // 只恢复未过期的缓存（7天有效期）
          const now = Date.now();
          Object.entries(parsed).forEach(([url, item]: [string, any]) => {
            if (item.timestamp && (now - item.timestamp < 7 * 24 * 60 * 60 * 1000)) {
              this.cache.set(url, {
                url: item.url,
                blobUrl: item.blobUrl,
                loaded: item.loaded,
                error: item.error
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to load icon cache from localStorage:', error);
    }
  }

  // 保存缓存到localStorage
  private saveToLocalStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const cacheToSave: Record<string, any> = {};
        this.cache.forEach((item, url) => {
          cacheToSave[url] = {
            ...item,
            timestamp: Date.now() // 添加时间戳，用于过期判断
          };
        });
        localStorage.setItem(this.localStorageKey, JSON.stringify(cacheToSave));
      }
    } catch (error) {
      console.error('Failed to save icon cache to localStorage:', error);
    }
  }

  // 获取缓存项
  get(url: string): IconCacheItem | undefined {
    return this.cache.get(url);
  }

  // 设置缓存项
  set(url: string, item: IconCacheItem): void {
    // 如果缓存已满，删除最旧的项
    if (this.cache.size >= this.memoryCacheLimit) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    this.cache.set(url, item);
    this.saveToLocalStorage();
  }

  // 预加载图标
  async preload(url: string): Promise<IconCacheItem> {
    // 如果已有缓存且加载成功，直接返回
    const existing = this.get(url);
    if (existing) {
      if (existing.loaded && !existing.error) {
        return existing;
      }
      // 如果之前加载失败，尝试重新加载
    }

    // 创建缓存项
    const cacheItem: IconCacheItem = {
      url,
      loaded: false,
      error: false
    };

    this.set(url, cacheItem);

    try {
      const response = await fetch(url, {
        cache: 'force-cache', // 使用浏览器缓存
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch icon: ${response.status}`);
      }

      // 对于图片资源，创建Blob URL用于localStorage缓存
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      cacheItem.loaded = true;
      cacheItem.error = false;
      cacheItem.blobUrl = blobUrl;

      this.set(url, cacheItem);
      return cacheItem;
    } catch (error) {
      console.error(`Failed to preload icon ${url}:`, error);
      
      cacheItem.loaded = true;
      cacheItem.error = true;
      this.set(url, cacheItem);
      return cacheItem;
    }
  }

  // 批量预加载图标
  async preloadBatch(urls: string[]): Promise<void> {
    const promises = urls.map(url => this.preload(url));
    await Promise.all(promises);
  }

  // 清理缓存
  clear(): void {
    this.cache.clear();
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(this.localStorageKey);
      }
    } catch (error) {
      console.error('Failed to clear icon cache from localStorage:', error);
    }
  }
}

// 导出单例实例
export const iconCache = new IconCache();

// 预加载图标的工具函数
export const preloadIcons = async (urls: string[]): Promise<void> => {
  await iconCache.preloadBatch(urls);
};

// 获取图标的工具函数
export const getCachedIconUrl = async (url: string): Promise<string> => {
  const cacheItem = await iconCache.preload(url);
  return cacheItem.blobUrl || cacheItem.url;
};
