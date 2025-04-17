// load_publications.js

document.addEventListener('DOMContentLoaded', function() {
    const publicationsUrl = 'publications.html'; // Path to the full list page
    const previewList = document.getElementById('publication-preview-list'); // The UL in index.html

    if (!previewList) {
        console.error('Publication preview list container (#publication-preview-list) not found.');
        return;
    }

    const placeholderItems = previewList.querySelectorAll('li');
    const targetLi1 = placeholderItems.length > 0 ? placeholderItems[0] : null;
    const targetLi2 = placeholderItems.length > 1 ? placeholderItems[1] : null;

    if (!targetLi1) {
        console.error('Could not find the first placeholder list item.');
        return;
    }

    fetch(publicationsUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load publications page. Status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // --- SELECTOR TARGETING THE SOURCE LIST ---
            // Targets the <li> elements within the FIRST <ol> found inside the div with class 'container'
            // This assumes the SCI list is the first <ol> in that container in publications.html
            const sourceSelector = 'div.container > ol:first-of-type > li';
            // --- END SELECTOR ---

            const sourceListItems = doc.querySelectorAll(sourceSelector);

            // Clear loading state and reset classes
            targetLi1.innerHTML = ''; // Clear loading text
            targetLi1.classList.remove('publication-loading');
            if (targetLi2) {
                targetLi2.innerHTML = ''; // Clear loading text
                targetLi2.classList.remove('publication-loading');
                targetLi2.style.display = ''; // Ensure it's visible if previously hidden
            }

            if (sourceListItems.length > 0) {
                // Found publications in the source file
                targetLi1.innerHTML = sourceListItems[0].innerHTML; // Inject content of first source item

                if (sourceListItems.length > 1 && targetLi2) {
                    // Found a second item and have a second placeholder
                    targetLi2.innerHTML = sourceListItems[1].innerHTML; // Inject content of second source item
                } else if (targetLi2) {
                    // Only one publication found, hide the second placeholder
                    targetLi2.style.display = 'none';
                    console.log('Only one publication found in source, hiding second placeholder.');
                }
            } else {
                // Selector did not find any matching items in publications.html
                console.warn(`Could not find elements matching selector "${sourceSelector}" in ${publicationsUrl}`);
                targetLi1.innerHTML = '<p>无法加载论文列表。</p>';
                targetLi1.classList.add('publication-error');
                if (targetLi2) targetLi2.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error fetching or processing publications:', error);
            targetLi1.innerHTML = `<p>加载论文时出错: ${error.message}</p>`;
            targetLi1.classList.add('publication-error');
            targetLi1.classList.remove('publication-loading');
            if (targetLi2) {
                targetLi2.style.display = 'none';
            }
        });
});