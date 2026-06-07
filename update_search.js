const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

// The new search form with the select dropdown
const newSearchForm = `
                        <form action="/shop" method="GET" class="d-flex w-100 kael-search-form">
                            <select name="category" id="kael-category-select" class="input-select" dir="rtl" style="border-radius: 0 20px 20px 0; border: 1px solid #E4E7ED; padding: 0 15px; background: #fff;">
                                <option value="">كل الأقسام</option>
                            </select>
                            <input type="text" name="search" class="input text-end flex-grow-1" placeholder="ابحث عن منتج..." dir="rtl" style="border-radius: 0; border-right: none; border-left: none;">
                            <button type="submit" class="search-btn" style="border-radius: 20px 0 0 20px; padding: 0 20px;">بحث</button>
                        </form>
`;

// Script to fetch categories dynamically and populate the select
const categoryFetchScript = `
    <!-- Dynamic Category Fetcher -->
    <script>
        document.addEventListener('DOMContentLoaded', async function() {
            const projectID = "1911270116";
            const selectEl = document.getElementById('kael-category-select');
            
            if (selectEl) {
                try {
                    const response = await fetch('https://api.reflowhq.com/v2/projects/' + projectID + '/categories');
                    const categories = await response.json();
                    
                    categories.forEach(cat => {
                        const option = document.createElement('option');
                        option.value = cat.id;
                        option.textContent = cat.name === 'topsale' ? 'عروض مميزة' : cat.name;
                        
                        // If we are on shop page and URL has this category selected, mark it
                        const urlParams = new URLSearchParams(window.location.search);
                        if (urlParams.get('category') == cat.id) {
                            option.selected = true;
                        }
                        
                        selectEl.appendChild(option);
                    });
                } catch(e) {
                    console.error('Error fetching categories:', e);
                }
            }
        });
    </script>
`;

// Updated shop.html logic to handle both search AND category filtering
const newSearchSyncScript = `
    <script>
        // Sync custom search and category URL parameters with Reflow
        document.addEventListener('DOMContentLoaded', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const searchQuery = urlParams.get('search');
            const categoryId = urlParams.get('category');
            
            const reflowContainer = document.querySelector('[data-reflow-type="product-list"]');
            
            if (reflowContainer) {
                if (searchQuery) {
                    document.getElementById('kael-shop-title').textContent = 'نتائج البحث عن: ' + searchQuery;
                    document.getElementById('kael-breadcrumb-current').textContent = 'نتائج البحث';
                    reflowContainer.setAttribute('data-reflow-search', searchQuery);
                }
                
                if (categoryId) {
                    reflowContainer.setAttribute('data-reflow-category', categoryId);
                }
            }
        });
    </script>
`;

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');

    // 1. Replace existing search form (regex to match the old injected form)
    const oldFormRegex = /<form action="\/shop" method="GET" class="d-flex w-100">[\s\S]*?<\/form>/;
    if (oldFormRegex.test(content)) {
        content = content.replace(oldFormRegex, newSearchForm);
    }

    // 2. Inject Dynamic Category Fetcher before </body>
    if (!content.includes('Dynamic Category Fetcher')) {
        content = content.replace('</body>', categoryFetchScript + '\n</body>');
    }
    
    // 3. If shop.html, replace the old sync script with the new one
    if (file === 'shop.html') {
        const syncRegex = /<script>[\s\S]*?Sync custom search URL parameter with Reflow[\s\S]*?<\/script>/;
        if (syncRegex.test(content)) {
            content = content.replace(syncRegex, newSearchSyncScript);
        }
    }

    fs.writeFileSync(path.join(dir, file), content, 'utf8');
    console.log('✅ Updated Search Form in ' + file);
});

console.log('Done mapping categories!');
