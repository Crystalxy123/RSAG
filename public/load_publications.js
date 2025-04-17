// load_publications.js

document.addEventListener('DOMContentLoaded', function() {
    const publicationsUrl = 'publications.html';
    const previewList = document.getElementById('publication-preview-list');

    if (!previewList) {
        console.error('错误：未能找到 ID 为 "publication-preview-list" 的预览列表容器。');
        return;
    }

    const placeholderItems = previewList.querySelectorAll('li');
    const targetLi1 = placeholderItems.length > 0 ? placeholderItems[0] : null;
    const targetLi2 = placeholderItems.length > 1 ? placeholderItems[1] : null;

    if (!targetLi1) {
        console.error('错误：未能找到第一个占位符列表项。');
        return;
    }

    // --- 期望的最终样式类 (用于恢复或设置) ---
    // 注意：这里的类应该与 index.html 中 li 的目标样式一致
    const targetLiClasses = 'bg-white p-4 rounded-md shadow-sm border border-gray-200';
    // ---

    fetch(publicationsUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`加载论文页面失败。状态码: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // --- 定位源文件(publications.html)中论文列表项的选择器 ---
            const sourceSelector = 'div.container > ol:first-of-type > li';
            // --- 选择器结束 ---

            const sourceListItems = doc.querySelectorAll(sourceSelector);

            // --- 处理第一个占位符 ---
            targetLi1.classList.remove('publication-loading'); // 移除加载状态
            targetLi1.classList.add(...targetLiClasses.split(' ')); // 确保基础样式存在

            if (sourceListItems.length > 0) {
                // 找到了论文，注入内容
                // 重要：我们假设 sourceListItems[0].innerHTML 包含了你需要的 <p> 等结构
                // 如果 publications.html 的 li 内部没有 p 标签，你可能需要在这里手动添加：
                // targetLi1.innerHTML = `<p class="text-gray-700">${sourceListItems[0].innerHTML}</p>`;
                // 但根据你之前的 publications.html 结构，直接复制 innerHTML 应该可以
                targetLi1.innerHTML = sourceListItems[0].innerHTML;
            } else {
                // 未找到论文
                console.warn(`警告：在 ${publicationsUrl} 中未能找到匹配选择器 "${sourceSelector}" 的元素。`);
                targetLi1.innerHTML = '<p class="content-placeholder text-gray-700">无法加载论文列表。</p>'; // 显示错误信息
                targetLi1.classList.add('publication-error'); // 添加错误状态类
            }

            // --- 处理第二个占位符 ---
            if (targetLi2) {
                targetLi2.classList.remove('publication-loading'); // 移除加载状态
                targetLi2.classList.add(...targetLiClasses.split(' ')); // 确保基础样式

                if (sourceListItems.length > 1) {
                    // 找到了第二篇论文
                    targetLi2.innerHTML = sourceListItems[1].innerHTML;
                    targetLi2.style.display = ''; // 确保可见
                } else {
                    // 没有第二篇论文，隐藏第二个占位符
                    targetLi2.style.display = 'none';
                    console.log('信息：源文件中只找到一篇论文，已隐藏第二个预览占位符。');
                }
            }

        })
        .catch(error => {
            console.error('错误：获取或处理论文时出错:', error);

            // --- 处理第一个占位符的出错状态 ---
            targetLi1.classList.remove('publication-loading');
            targetLi1.classList.add(...targetLiClasses.split(' ')); // 可能保留基础样式
            targetLi1.classList.add('publication-error');
            targetLi1.innerHTML = `<p class="content-placeholder text-gray-700">加载论文时出错: ${error.message}</p>`;

            // --- 隐藏第二个占位符 ---
            if (targetLi2) {
                targetLi2.style.display = 'none';
            }
        });
});