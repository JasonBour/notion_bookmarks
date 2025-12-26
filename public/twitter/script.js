// 全局状态
let currentUserInfo = {
    username: '大熊Jason',
    handle: '@JasonCharlie12',
    avatar: 'avatar.jpg',
    verified: true
};

// 推文数据全局状态
let currentTweetData = {
    postTime: '下午12:48 · 2025/11/26',
    views: '11万',
    comments: '3',
    retweets: '4',
    likes: '21',
    bookmarks: '1.3K'
};

// 自动生成合理的推文数据（默认前3小时）
function autoGenerateTweetData() {
    generateTweetData(false);
}

// 生成随机当天时间和数据
function generateRandomTweetData() {
    generateTweetData(true);
}

// 核心生成函数
function generateTweetData(randomTime) {
    // 设置推文时间
    const now = new Date();
    let tweetTime;
    
    if (randomTime) {
        // 生成当天的随机时间（00:00 - 当前时间）
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const randomMs = Math.random() * (now - startOfDay);
        tweetTime = new Date(startOfDay.getTime() + randomMs);
    } else {
        // 默认：当前时间的前3小时
        tweetTime = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    }
    
    // 格式化时间为 "下午12:48 · 2025/11/26" 格式
    const hours = tweetTime.getHours();
    const minutes = tweetTime.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? '下午' : '上午';
    const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
    const year = tweetTime.getFullYear();
    const month = (tweetTime.getMonth() + 1).toString().padStart(2, '0');
    const day = tweetTime.getDate().toString().padStart(2, '0');
    
    const formattedTime = `${period}${formattedHours}:${minutes} · ${year}/${month}/${day}`;
    
    // 生成合理的互动数据（基于正态分布，模拟真实推文数据）
    // 查看数：1万 - 50万
    const views = Math.floor(Math.random() * 490000) + 10000;
    const formattedViews = views >= 10000 ? `${(views / 10000).toFixed(1)}万` : views.toString();
    
    // 评论数：查看数的 0.1% - 1%
    const commentRate = Math.random() * 0.009 + 0.001;
    const comments = Math.floor(views * commentRate);
    
    // 转发数：评论数的 50% - 200%
    const retweetRate = Math.random() * 1.5 + 0.5;
    const retweets = Math.floor(comments * retweetRate);
    
    // 点赞数：评论数的 5 - 20 倍
    const likeRate = Math.random() * 15 + 5;
    const likes = Math.floor(comments * likeRate);
    
    // 收藏数：点赞数的 10% - 30%
    const bookmarkRate = Math.random() * 0.2 + 0.1;
    const bookmarks = Math.floor(likes * bookmarkRate);
    const formattedBookmarks = bookmarks >= 1000 ? `${(bookmarks / 1000).toFixed(1)}K` : bookmarks.toString();
    
    // 更新全局状态
    currentTweetData = {
        postTime: formattedTime,
        views: formattedViews,
        comments: comments.toString(),
        retweets: retweets.toString(),
        likes: likes.toString(),
        bookmarks: formattedBookmarks
    };
    
    // 保存到本地存储
    saveTweetData();
    
    // 更新编辑面板
    updateDataEditor();
    
    // 同步到所有卡片
    syncTweetDataToAllCards();
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadTweetData();
    setupGlobalListeners();
    setupSourceEditor();
    setupDataEditorListeners();
    
    // 页面加载时自动生成推文数据
    autoGenerateTweetData();
    
    // 初始渲染一次（如果有保存的内容）
    // const savedContent = localStorage.getItem('sourceContent');
    // if (savedContent) {
    //     document.getElementById('sourceEditor').innerHTML = savedContent;
    //     autoLayout();
    // }
});

// 设置全局监听器（用于同步用户信息和推文数据）
function setupGlobalListeners() {
    // 监听所有卡片的用户信息变化
    document.getElementById('previewPanel').addEventListener('input', (e) => {
        const target = e.target;
        if (target.classList.contains('username')) {
            updateUserInfo('username', target.innerText);
        } else if (target.classList.contains('handle')) {
            updateUserInfo('handle', target.innerText);
        }
    });

    // 头像上传
    document.getElementById('avatarInput').addEventListener('change', handleAvatarUpload);

    // 点击任意头像触发上传
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('avatar')) {
            document.getElementById('avatarInput').click();
        }
    });
}

// 设置数据编辑器监听器
function setupDataEditorListeners() {
    // 可以在这里添加实时更新逻辑
    // 例如：当输入框内容变化时自动更新所有卡片
}

// 更新单个推文数据并同步到所有卡片
function updateTweetData(key, value) {
    currentTweetData[key] = value;
    saveTweetData();
    syncTweetDataToAllCards();
}

// 更新所有推文数据（从编辑面板获取）
function updateAllTweetData() {
    // 从编辑面板获取所有数据
    currentTweetData.postTime = document.getElementById('editPostTime').value;
    currentTweetData.views = document.getElementById('editViews').value;
    currentTweetData.comments = document.getElementById('editComments').value;
    currentTweetData.retweets = document.getElementById('editRetweets').value;
    currentTweetData.likes = document.getElementById('editLikes').value;
    currentTweetData.bookmarks = document.getElementById('editBookmarks').value;
    
    saveTweetData();
    syncTweetDataToAllCards();
}

// 同步推文数据到所有卡片
function syncTweetDataToAllCards() {
    const cards = document.querySelectorAll('.phone-container');
    cards.forEach(card => {
        // 更新时间
        const postTime = card.querySelector('.post-time');
        if (postTime) postTime.innerText = currentTweetData.postTime;
        
        // 更新查看数
        const views = card.querySelector('.views');
        if (views) views.innerText = currentTweetData.views;
        
        // 更新评论数
        const commentCount = card.querySelector('.comment-item .count');
        if (commentCount) commentCount.innerText = currentTweetData.comments;
        
        // 更新转发数
        const retweetCount = card.querySelector('.retweet-item .count');
        if (retweetCount) retweetCount.innerText = currentTweetData.retweets;
        
        // 更新点赞数
        const likeCount = card.querySelector('.like-item .count');
        if (likeCount) likeCount.innerText = currentTweetData.likes;
        
        // 更新收藏数
        const bookmarkCount = card.querySelector('.bookmark-item .count');
        if (bookmarkCount) bookmarkCount.innerText = currentTweetData.bookmarks;
    });
}

// 保存推文数据到localStorage
function saveTweetData() {
    localStorage.setItem('twitterTweetData', JSON.stringify(currentTweetData));
}

// 从localStorage加载推文数据
function loadTweetData() {
    const saved = localStorage.getItem('twitterTweetData');
    if (saved) {
        currentTweetData = JSON.parse(saved);
    }
    
    // 更新编辑面板
    updateDataEditor();
    
    // 同步到现有卡片
    syncTweetDataToAllCards();
}

// 更新数据编辑器面板
function updateDataEditor() {
    document.getElementById('editPostTime').value = currentTweetData.postTime;
    document.getElementById('editViews').value = currentTweetData.views;
    document.getElementById('editComments').value = currentTweetData.comments;
    document.getElementById('editRetweets').value = currentTweetData.retweets;
    document.getElementById('editLikes').value = currentTweetData.likes;
    document.getElementById('editBookmarks').value = currentTweetData.bookmarks;
}

// 更新用户信息并同步到所有卡片
function updateUserInfo(key, value) {
    currentUserInfo[key] = value;
    saveUserInfo();

    // 同步到所有卡片
    const cards = document.querySelectorAll('.phone-container');
    cards.forEach(card => {
        const el = card.querySelector(`.${key}`);
        if (el && el.innerText !== value) {
            el.innerText = value;
        }
    });
}

// 处理头像上传
function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const newAvatar = event.target.result;
            currentUserInfo.avatar = newAvatar;
            saveUserInfo();

            // 更新所有头像
            document.querySelectorAll('.avatar').forEach(img => {
                img.src = newAvatar;
            });
        };
        reader.readAsDataURL(file);
    }
}

// 保存/加载用户信息
function saveUserInfo() {
    localStorage.setItem('twitterUserInfo', JSON.stringify(currentUserInfo));
}

function loadUserInfo() {
    const saved = localStorage.getItem('twitterUserInfo');
    if (saved) {
        currentUserInfo = JSON.parse(saved);
        // 更新现有卡片（如果有）
        updateCardUserInfo(document.querySelector('.phone-container'));
    }
}

function updateCardUserInfo(card) {
    if (!card) return;
    card.querySelector('.username').innerText = currentUserInfo.username;
    card.querySelector('.handle').innerText = currentUserInfo.handle;
    const avatar = card.querySelector('.avatar');
    if (avatar) avatar.src = currentUserInfo.avatar;
}

// 更新单个卡片的推文数据
function updateCardTweetData(card) {
    if (!card) return;
    
    // 更新时间
    const postTime = card.querySelector('.post-time');
    if (postTime) postTime.innerText = currentTweetData.postTime;
    
    // 更新查看数
    const views = card.querySelector('.views');
    if (views) views.innerText = currentTweetData.views;
    
    // 更新评论数
    const commentCount = card.querySelector('.comment-item .count');
    if (commentCount) commentCount.innerText = currentTweetData.comments;
    
    // 更新转发数
    const retweetCount = card.querySelector('.retweet-item .count');
    if (retweetCount) retweetCount.innerText = currentTweetData.retweets;
    
    // 更新点赞数
    const likeCount = card.querySelector('.like-item .count');
    if (likeCount) likeCount.innerText = currentTweetData.likes;
    
    // 更新收藏数
    const bookmarkCount = card.querySelector('.bookmark-item .count');
    if (bookmarkCount) bookmarkCount.innerText = currentTweetData.bookmarks;
}

// 设置源编辑器
function setupSourceEditor() {
    const editor = document.getElementById('sourceEditor');
    const maxCharsInput = document.getElementById('maxChars');
    let timeout;

    const triggerLayout = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            // 简化流程：只清理样式，直接生成卡片，不进行自动排版
            cleanEditorStyles(editor);
            autoLayout();
        }, 100); // 减少延迟时间，提高响应速度
    };

    // 监听多种事件，确保各种操作都能触发更新
    editor.addEventListener('input', triggerLayout);
    editor.addEventListener('keydown', (e) => {
        // 监听回车键，确保手动换行时触发更新
        if (e.key === 'Enter') {
            setTimeout(() => {
                cleanEditorStyles(editor);
                autoLayout();
            }, 0);
        }
    });
    maxCharsInput.addEventListener('input', triggerLayout);

    // 处理粘贴（只清理样式，直接生成卡片）
    editor.addEventListener('paste', (e) => {
        setTimeout(() => {
            cleanEditorStyles(editor);
            autoLayout();
        }, 0);
    });
    
    // 添加Mutation Observer监听内容变化，确保所有修改都被捕获
    const observer = new MutationObserver(() => {
        triggerLayout();
    });
    
    observer.observe(editor, {
        childList: true,
        subtree: true,
        characterData: true,
        characterDataOldValue: true
    });
}

function cleanEditorStyles(editor) {
    // 简单清理：移除所有 style 属性
    const elements = editor.querySelectorAll('*');
    elements.forEach(el => {
        el.removeAttribute('style');
    });
}

// 自动排版内容，处理换行和段落，保留图片
function autoFormatContent(editor) {
    // 获取编辑器内容
    const content = editor.innerHTML;
    
    // 创建一个临时容器来处理内容
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = content;
    
    // 处理所有文本节点，保留图片等媒体元素
    const processNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            let text = node.textContent;
            
            // 去除多余空格
            text = text.replace(/\s+/g, ' ').trim();
            
            if (text) {
                // 处理句子：在句号、问号、感叹号后添加适当的换行
                text = text.replace(/([。！？\.!\?])([^\s])/g, '$1\n$2');
                
                // 处理长句子：仅在句子长度超过120字符时，在逗号、分号后添加换行
                if (text.length > 120) {
                    text = text.replace(/([，,；;])([^\s])/g, '$1\n$2');
                }
                
                // 去除多余的空行（只保留最多1个连续换行）
                text = text.replace(/\n{2,}/g, '\n');
                
                // 创建新的文本节点和br标签
                const parts = text.split('\n');
                const parent = node.parentNode;
                let currentNode = node;
                
                parts.forEach((part, index) => {
                    if (part) {
                        // 替换当前文本节点
                        const newTextNode = document.createTextNode(part);
                        if (currentNode === node) {
                            parent.replaceChild(newTextNode, currentNode);
                        } else {
                            parent.insertBefore(newTextNode, currentNode);
                        }
                    }
                    
                    // 添加br标签（除了最后一个部分）
                    if (index < parts.length - 1) {
                        const br = document.createElement('br');
                        parent.insertBefore(br, currentNode);
                    }
                });
                
                // 如果原节点被完全替换，移除它
                if (currentNode === node && !parent.contains(node)) {
                    // 节点已被替换
                }
            } else {
                // 移除空文本节点
                node.parentNode.removeChild(node);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // 递归处理子节点
            Array.from(node.childNodes).forEach(child => processNode(child));
            
            // 移除空的容器节点
            if (node.tagName !== 'IMG' && node.innerHTML.trim() === '') {
                node.parentNode.removeChild(node);
            }
        }
    };
    
    // 处理所有子节点
    Array.from(tempContainer.childNodes).forEach(node => processNode(node));
    
    // 确保没有连续的br标签
    let current = tempContainer.firstChild;
    while (current && current.nextSibling) {
        if (current.nodeName === 'BR' && current.nextSibling.nodeName === 'BR') {
            const next = current.nextSibling;
            current.parentNode.removeChild(next);
        } else {
            current = current.nextSibling;
        }
    }
    
    // 更新编辑器内容
    editor.innerHTML = tempContainer.innerHTML;
    
    // 触发自动排版
    autoLayout();
}

// 核心功能：自动排版
function autoLayout() {
    const editor = document.getElementById('sourceEditor');
    const previewPanel = document.getElementById('previewPanel');
    const template = document.getElementById('cardTemplate');

    // 获取内容节点
    const nodes = Array.from(editor.childNodes);
    if (nodes.length === 0 && editor.innerText.trim() === '') return;

    // 分割内容
    const pages = splitContent(nodes);

    // 清空预览区
    previewPanel.innerHTML = '';

    // 渲染页面
    pages.forEach((pageContent, index) => {
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.phone-container');

        // 设置ID方便调试
        card.id = `card-${index}`;

        // 填充用户信息
        updateCardUserInfo(card);
        
        // 填充推文数据
        updateCardTweetData(card);

        // 填充内容
        const contentArea = card.querySelector('.post-content');
        contentArea.innerHTML = pageContent;

        previewPanel.appendChild(card);
    });
}

// 内容分割逻辑 - 重写版本，确保正确处理手动换行
function splitContent(nodes) {
    const pages = [];
    const maxCharsInput = document.getElementById('maxChars');
    const MAX_CHARS = parseInt(maxCharsInput.value) || 200;
    
    console.log('当前设置的每页字数:', MAX_CHARS);
    
    // 创建一个临时容器来保存当前页的内容
    let currentPage = document.createElement('div');
    let currentLength = 0;
    
    // 辅助函数：检查当前页是否已满
    const isPageFull = () => currentLength >= MAX_CHARS;
    
    // 辅助函数：添加内容到当前页
    const addToPage = (content) => {
        if (content.nodeType === Node.TEXT_NODE) {
            // 添加文本节点
            currentPage.appendChild(content.cloneNode(true));
            currentLength += content.textContent.length;
        } else if (content.nodeType === Node.ELEMENT_NODE) {
            // 添加元素节点
            const clone = content.cloneNode(true);
            currentPage.appendChild(clone);
            
            // 计算元素占用的字符数
            if (content.tagName === 'BR') {
                // 换行符占用10个虚拟字符
                currentLength += 10;
            } else if (content.tagName === 'IMG') {
                // 图片占用30个虚拟字符
                currentLength += 30;
            } else {
                // 其他元素按文本长度计算
                currentLength += content.textContent.length;
            }
        }
    };
    
    // 辅助函数：结束当前页，开始新页
    const finishPage = () => {
        if (currentPage.innerHTML.trim()) {
            pages.push(currentPage.innerHTML);
            currentPage = document.createElement('div');
            currentLength = 0;
        }
    };
    
    // 处理所有节点
    nodes.forEach(node => {
        // 如果当前页已满，先结束当前页
        if (isPageFull()) {
            finishPage();
        }
        
        // 添加节点到当前页
        addToPage(node);
        
        // 如果添加后页面已满，结束当前页
        if (isPageFull()) {
            finishPage();
        }
    });
    
    // 处理最后一页
    finishPage();
    
    console.log('生成的页数:', pages.length);
    return pages;
}

// 导出功能
async function exportAllImages() {
    const cards = document.querySelectorAll('.phone-container');
    if (cards.length === 0) {
        alert('没有可导出的内容');
        return;
    }

    // 安全检查：如果在 file:// 协议下且使用默认头像（非 Base64），提示用户
    const isLocalFile = window.location.protocol === 'file:';
    const isDefaultAvatar = !currentUserInfo.avatar.startsWith('data:');

    if (isLocalFile && isDefaultAvatar) {
        const proceed = confirm('⚠️ 提示：\n检测到你正在直接运行 HTML 文件，且使用的是默认头像。\n\n浏览器的安全策略可能会阻止导出图片。\n\n建议：\n👉 点击头像上传一张本地图片（即使是同一张）\n👉 或者使用 VS Code "Live Server" 插件运行\n\n是否仍要尝试导出？');
        if (!proceed) return;
    } else if (!confirm(`准备导出 ${cards.length} 张图片，是否继续？`)) {
        return;
    }

    let successCount = 0;
    let failCount = 0;

    try {
        // 加载库
        if (typeof domtoimage === 'undefined') {
            await loadDomToImage();
        }

        for (let i = 0; i < cards.length; i++) {
            const success = await exportSingleCard(cards[i], i + 1);
            if (success) {
                successCount++;
            } else {
                failCount++;
            }
            // 稍微暂停
            await new Promise(r => setTimeout(r, 500));
        }

        if (successCount === 0) {
            alert('导出失败！\n请尝试手动上传一张头像后再试。');
        } else {
            alert(`导出完成！\n成功: ${successCount}\n失败: ${failCount}`);
        }

    } catch (error) {
        console.error('导出过程出错:', error);
        alert('导出过程发生错误，请检查控制台。');
    }
}

async function exportSingleCard(element, index) {
    try {
        // 准备截图
        const originalOutline = element.style.outline;
        element.style.outline = 'none';

        // 处理 contenteditable
        const editables = element.querySelectorAll('[contenteditable]');
        editables.forEach(el => el.setAttribute('contenteditable', 'false'));
        
        // 隐藏滚动条
        const contentElement = element.querySelector('.content');
        const originalOverflow = contentElement.style.overflow;
        contentElement.style.overflow = 'hidden';
        
        // 确保内容完全渲染
        await new Promise(resolve => setTimeout(resolve, 100));

        // 使用 dom-to-image 导出（高清晰度）
        const scale = 3; // 3倍分辨率，提高清晰度
        const width = element.offsetWidth * scale;
        const height = element.offsetHeight * scale;

        const dataUrl = await domtoimage.toPng(element, {
            bgcolor: '#ffffff',
            quality: 1.0,
            width: width,
            height: height,
            style: {
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: element.offsetWidth + 'px',
                height: element.offsetHeight + 'px'
            }
        });

        // 恢复
        element.style.outline = originalOutline;
        editables.forEach(el => el.setAttribute('contenteditable', 'true'));
        
        // 恢复滚动条
        contentElement.style.overflow = originalOverflow;

        // 下载
        const link = document.createElement('a');
        link.download = `twitter-post-${index}-${new Date().getTime()}.png`;
        link.href = dataUrl;
        link.click();

        return true;

    } catch (e) {
        console.error(`导出第 ${index} 张失败:`, e);
        // 尝试恢复
        const editables = element.querySelectorAll('[contenteditable]');
        editables.forEach(el => el.setAttribute('contenteditable', 'true'));
        return false;
    }
}

// 加载 dom-to-image 库
function loadDomToImage() {
    return new Promise((resolve, reject) => {
        if (window.domtoimage) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/dom-to-image/2.6.0/dom-to-image.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// 重置内容
function resetContent() {
    if (confirm('确定要清空所有内容吗？')) {
        document.getElementById('sourceEditor').innerHTML = '';
        document.getElementById('previewPanel').innerHTML = '';
        // 恢复默认卡片
        autoLayout();
    }
}

console.log('Twitter 自动排版编辑器已加载');
