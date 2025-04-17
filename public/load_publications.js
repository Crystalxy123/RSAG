// load_publications.js

document.addEventListener('DOMContentLoaded', function() {
    const publicationsUrl = 'publications.html'; // The URL of your full publications list page
    const previewList = document.getElementById('publication-preview-list');

    if (!previewList) {
        console.error('Publication preview list container (#publication-preview-list) not found.');
        return;
    }

    // Get the placeholder li elements within the preview list
    const targetListItems = previewList.querySelectorAll('li');
    const targetLi1 = targetListItems.length > 0 ? targetListItems[0] : null;
    const targetLi2 = targetListItems.length > 1 ? targetListItems[1] : null;

    if (!targetLi1) {
        console.error('Could not find the first placeholder list item.');
        return; // Stop if the basic structure isn't there
    }

    fetch(publicationsUrl)
        .then(response => {
            if (!response.ok) {
                // Handle HTTP errors (like 404 Not Found)
                throw new Error(`Failed to load publications. Status: ${response.status}`);
            }
            return response.text(); // Get the HTML content as text
        })
        .then(html => {
            // Use DOMParser to turn the HTML string into a traversable document
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // --- !!! VERY IMPORTANT: ADJUST THIS SELECTOR !!! ---
            // Find the list items on the *source* publications.html page.
            // This selector MUST match the structure of your publications.html.
            // Example: If publications are in <ol id="main-list"><li>...</li></ol>
            // Use: '#main-list li'
            const sourceSelector = '#main-publication-list li'; // **** MODIFY AS NEEDED ****
            const sourceListItems = doc.querySelectorAll(sourceSelector);

            // Reset target li classes before adding content
            targetLi1.className = 'bg-white p-4 rounded-md shadow-sm border border-gray-200'; // Reset classes
            if (targetLi2) targetLi2.className = 'bg-white p-4 rounded-md shadow-sm border border-gray-200'; // Reset classes


            if (sourceListItems.length > 0) {
                // Successfully found publications on the source page
                targetLi1.innerHTML = sourceListItems[0].innerHTML; // Copy content of the first source li

                if (sourceListItems.length > 1 && targetLi2) {
                    // If there's a second source item and a second placeholder
                    targetLi2.innerHTML = sourceListItems[1].innerHTML; // Copy content of the second source li
                } else if (targetLi2) {
                    // If there's no second source item, hide or clear the second placeholder
                    // Option 1: Hide it
                     targetLi2.style.display = 'none';
                    // Option 2: Show a message
                    // targetLi2.innerHTML = '<p class="text-gray-500">No second publication found.</p>';
                    // targetLi2.classList.remove('publication-loading'); // Remove loading class if showing message
                }
            } else {
                // Could not find any publication items using the selector on the source page
                console.warn(`Could not find elements matching selector "${sourceSelector}" in ${publicationsUrl}`);
                targetLi1.innerHTML = '<p>无法加载论文列表。</p>';
                targetLi1.classList.add('publication-error'); // Add error class
                if (targetLi2) targetLi2.style.display = 'none'; // Hide the second placeholder
            }
        })
        .catch(error => {
            // Handle network errors or other issues during fetch/parsing
            console.error('Error fetching or processing publications:', error);
            targetLi1.innerHTML = `<p>加载论文时出错: ${error.message}</p>`;
            targetLi1.classList.add('publication-error');
            targetLi1.classList.remove('publication-loading');
            if (targetLi2) {
                targetLi2.style.display = 'none'; // Hide second placeholder on error
            }
        });
});