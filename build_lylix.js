const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';
const assetsJsDir = path.join(dir, 'assets/js');
const assetsCssDir = path.join(dir, 'assets/css');

// 1. Create lylix-config.js
const lylixConfigJS = `
// ==========================================
// LYLIX SCRIPT CONFIGURATION
// Edit this file to customize your store!
// ==========================================

const LylixConfig = {
    // 1. General Settings
    storeName: "Lylix Store",
    storeDescription: "الوجهة الأولى للهدايا الفاخرة والساعات والإكسسوارات.",
    
    // 2. Contact Information
    phone: "0111 311 9058",
    email: "info@lylix.com",
    address: "مصر",
    whatsappNumber: "201113119058",
    
    // 3. Integrations
    reflowProjectID: "1911270116",
    web3formsAccessKey: "585d1f02-f9d1-4a09-86f9-955c5233b239",
    
    // 4. Design & Colors
    colors: {
        primary: "#C5A059",    // Gold
        secondary: "#103C2B",  // Dark Green
    }
};
`;
fs.writeFileSync(path.join(assetsJsDir, 'lylix-config.js'), lylixConfigJS, 'utf8');

// 2. Create lylix-core.js
const lylixCoreJS = `
// ==========================================
// LYLIX CORE LOGIC
// Do not edit unless you know what you are doing.
// ==========================================

document.addEventListener('DOMContentLoaded', async function() {
    // A. Apply Dynamic Theme Colors
    document.documentElement.style.setProperty('--lylix-primary', LylixConfig.colors.primary);
    document.documentElement.style.setProperty('--lylix-secondary', LylixConfig.colors.secondary);

    // B. Advanced SEO & Dynamic Content Injection
    document.title = LylixConfig.storeName;
    
    // Inject Meta Tags if they don't exist
    if(!document.querySelector('meta[name="description"]')) {
        const metaDesc = document.createElement('meta');
        metaDesc.name = "description";
        metaDesc.content = LylixConfig.storeDescription;
        document.head.appendChild(metaDesc);
    }

    // Populate data-lylix elements
    document.querySelectorAll('[data-lylix]').forEach(el => {
        const key = el.getAttribute('data-lylix');
        if (LylixConfig[key]) {
            if (el.tagName === 'A' && el.href.includes('mailto:')) el.href = 'mailto:' + LylixConfig[key];
            else if (el.tagName === 'A' && el.href.includes('tel:')) el.href = 'tel:' + LylixConfig[key];
            else el.textContent = LylixConfig[key];
        }
    });

    // C. Init AOS
    if (typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true, offset: 50 });

    // D. Sticky Header
    const header = document.getElementById('header');
    const mainNav = document.getElementById('navigation');
    if (header) {
        const headerOffset = header.offsetTop;
        window.addEventListener('scroll', () => {
            if (window.scrollY > headerOffset + 50) {
                header.classList.add('sticky-glass');
                if(mainNav) mainNav.style.display = 'none';
            } else {
                header.classList.remove('sticky-glass');
                if(mainNav && window.innerWidth >= 768) mainNav.style.display = 'block';
            }
        });
    }

    // E. Web3Forms AJAX Override
    document.querySelectorAll('form').forEach(form => {
        const isWeb3 = form.querySelector('input[name="access_key"]');
        if (isWeb3) {
            isWeb3.value = LylixConfig.web3formsAccessKey; // Force config key
            const redirectInput = form.querySelector('input[name="redirect"]');
            if(redirectInput) redirectInput.remove();

            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                const btn = form.querySelector('button[type="submit"]');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
                btn.disabled = true;

                try {
                    const response = await fetch('https://api.web3forms.com/submit', {
                        method: 'POST', body: new FormData(form)
                    });
                    const data = await response.json();
                    if (data.success) {
                        Swal.fire({ icon: 'success', title: 'تم بنجاح!', text: 'تم استلام طلبك وسنتواصل معك قريباً.', confirmButtonColor: LylixConfig.colors.primary, confirmButtonText: 'حسناً' });
                        form.reset();
                    } else throw new Error('فشل الإرسال');
                } catch (error) {
                    Swal.fire({ icon: 'error', title: 'عذراً!', text: 'حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.', confirmButtonColor: LylixConfig.colors.secondary, confirmButtonText: 'حسناً' });
                } finally {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            });
        }
    });

    // F. Dynamic Category Fetcher
    const selectEl = document.getElementById('lylix-category-select');
    if (selectEl) {
        try {
            const response = await fetch('https://api.reflowhq.com/v2/projects/' + LylixConfig.reflowProjectID + '/categories');
            const categories = await response.json();
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name === 'topsale' ? 'عروض مميزة' : cat.name;
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('category') == cat.id) option.selected = true;
                selectEl.appendChild(option);
            });
        } catch(e) { console.error('Error fetching categories:', e); }
    }

    // G. Reflow Sync Logic (Search & Category)
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    const categoryId = urlParams.get('category');
    const reflowContainer = document.querySelector('[data-reflow-type="product-list"]');
    
    if (reflowContainer) {
        if (searchQuery) {
            const shopTitle = document.getElementById('lylix-shop-title');
            const breadcrumb = document.getElementById('lylix-breadcrumb-current');
            if(shopTitle) shopTitle.textContent = 'نتائج البحث عن: ' + searchQuery;
            if(breadcrumb) breadcrumb.textContent = 'نتائج البحث';
            reflowContainer.setAttribute('data-reflow-search', searchQuery);
        }
        if (categoryId) reflowContainer.setAttribute('data-reflow-category', categoryId);
    }

    // H. Smart WhatsApp Integration
    const mainWpBtn = document.getElementById('wp');
    if (mainWpBtn) {
        mainWpBtn.href = 'https://wa.me/' + LylixConfig.whatsappNumber + '?text=' + encodeURIComponent('مرحباً، أود الاستفسار عن متجركم. أنا أتصفح هذه الصفحة: ') + encodeURIComponent(window.location.href);
    }

    const observer = new MutationObserver(function(mutations) {
        document.querySelectorAll('.ref-product').forEach(function(product) {
            if (!product.querySelector('.lylix-wa-circle-btn')) {
                const nameEl = product.querySelector('.ref-name');
                const priceEl = product.querySelector('.ref-price');
                if (nameEl) {
                    const productName = nameEl.textContent.trim();
                    const productPrice = priceEl ? priceEl.textContent.trim() : '';
                    const waMessage = encodeURIComponent('مرحباً ' + LylixConfig.storeName + '، أود الاستفسار عن هذا المنتج:\\n📦 ' + productName + '\\n💰 السعر: ' + productPrice + '\\nهل هو متوفر حالياً؟');
                    const waBtn = document.createElement('a');
                    waBtn.className = 'lylix-wa-circle-btn';
                    waBtn.href = 'https://wa.me/' + LylixConfig.whatsappNumber + '?text=' + waMessage;
                    waBtn.target = '_blank';
                    waBtn.innerHTML = '<i class="fab fa-whatsapp"></i>';
                    waBtn.title = 'استفسار عبر واتساب';
                    
                    // Set color dynamically
                    waBtn.style.backgroundColor = '#25D366'; // WhatsApp native color
                    
                    const mediaEl = product.querySelector('.ref-media');
                    if (mediaEl) mediaEl.appendChild(waBtn);
                    else product.appendChild(waBtn);
                }
            }
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
});

// I. Hide preloader on load
window.addEventListener('load', function() {
    const preloader = document.getElementById('lylix-preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.style.display = 'none', 500);
    }
});
`;
fs.writeFileSync(path.join(assetsJsDir, 'lylix-core.js'), lylixCoreJS, 'utf8');

// 3. Create lylix-core.css
const lylixCoreCSS = `
/* ==========================================
   LYLIX SCRIPT CORE STYLES
   ========================================== */

/* Preloader */
#lylix-preloader {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: var(--lylix-secondary, #103C2B); z-index: 999999;
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    transition: opacity 0.5s ease, visibility 0.5s ease;
}
#lylix-preloader img { width: 120px; margin-bottom: 20px; animation: pulse 1.5s infinite; }
.lylix-spinner {
    width: 40px; height: 40px;
    border: 3px solid rgba(197, 160, 89, 0.3);
    border-radius: 50%;
    border-top-color: var(--lylix-primary, #C5A059);
    animation: spin 1s ease-in-out infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }

/* Sticky Glass Header */
.sticky-glass {
    position: fixed !important;
    top: 0; left: 0; width: 100%;
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(10px);
    z-index: 9999 !important;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.05);
    animation: slideDown 0.4s ease forwards;
}
@keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
body.header-is-sticky { padding-top: 150px; }

/* WhatsApp Circle Button */
.lylix-wa-circle-btn {
    position: absolute !important;
    top: 55px !important;
    right: 10px !important;
    border: none !important;
    border-radius: 50% !important;
    width: 35px !important;
    height: 35px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-shadow: 0 3px 6px rgba(0,0,0,0.15) !important;
    color: #ffffff !important;
    font-size: 18px !important;
    cursor: pointer !important;
    z-index: 10 !important;
    transition: 0.3s !important;
}
.lylix-wa-circle-btn:hover {
    transform: scale(1.1) !important;
}

/* Base Primary Color Resets */
.btn, .search-btn, .active-heart, .dropdown-menu {
    border-color: var(--lylix-primary) !important;
}
`;
fs.writeFileSync(path.join(assetsCssDir, 'lylix-core.css'), lylixCoreCSS, 'utf8');

// 4. Refactor all HTML files
const htmlFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');

    // Remove inline styles injected previously
    content = content.replace(/<style>\s*\/\* Preloader \*\/[\s\S]*?<\/style>/, '');
    content = content.replace(/<style>\s*\.kael-wa-circle-btn[\s\S]*?<\/style>/, '');
    content = content.replace(/<link href="https:\/\/unpkg.com\/aos@2.3.1\/dist\/aos.css" rel="stylesheet">/, '');
    content = content.replace(/<link rel="stylesheet" href="https:\/\/cdn.jsdelivr.net\/npm\/sweetalert2@11\/dist\/sweetalert2.min.css">/, '');
    
    // Inject Lylix Core CSS and standard libraries to <head>
    if (!content.includes('lylix-core.css')) {
        content = content.replace('</head>', `
    <!-- Lylix Script Libraries -->
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">
    <link rel="stylesheet" href="assets/css/lylix-core.css">
</head>`);
    }

    // Remove old inline scripts from the bottom
    content = content.replace(/<!-- AOS JS -->[\s\S]*?<\/script>/, '');
    content = content.replace(/<!-- SweetAlert2 JS -->[\s\S]*?<\/script>/, '');
    content = content.replace(/<script>\s*document.addEventListener\('DOMContentLoaded', function\(\) \{\s*\/\/ Init AOS[\s\S]*?<\/script>/, '');
    content = content.replace(/<!-- Smart WhatsApp Integration -->[\s\S]*?<\/script>/, '');
    content = content.replace(/<!-- Dynamic Category Fetcher -->[\s\S]*?<\/script>/, '');
    content = content.replace(/<script>\s*\/\/ Sync custom search and category URL parameters[\s\S]*?<\/script>/, '');

    // Inject Lylix Core JS to the bottom
    if (!content.includes('lylix-core.js')) {
        content = content.replace('</body>', `
    <!-- Lylix Script Libraries & Logic -->
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="assets/js/lylix-config.js"></script>
    <script src="assets/js/lylix-core.js"></script>
</body>`);
    }

    // Replace kael classes/ids with lylix
    content = content.replace(/kael-preloader/g, 'lylix-preloader');
    content = content.replace(/kael-spinner/g, 'lylix-spinner');
    content = content.replace(/kael-category-select/g, 'lylix-category-select');
    content = content.replace(/kael-shop-title/g, 'lylix-shop-title');
    content = content.replace(/kael-breadcrumb-current/g, 'lylix-breadcrumb-current');
    
    // Search & Replace common brand names
    content = content.replace(/<title>.*?<\/title>/, '<title>Lylix</title>');
    // Let's add data-lylix hooks for dynamic text replacement where needed
    // Assuming the email and phone have standard patterns or we can just let buyers search and replace.
    // For now, replacing literal "Kael" with "Lylix" (except in file paths like kael-theme.css to avoid breaking)
    
    // We will leave assets/css/kael-theme.css as is or rename it. Renaming might break other things, we'll keep it as kael-theme.css for now.
    // Replace text 'Kael Logo'
    content = content.replace(/alt="Kael Logo"/g, 'alt="Lylix Logo"');
    // Replace copyright
    content = content.replace(/© 2026 Kael Store/g, '© 2026 <span data-lylix="storeName">Lylix Store</span>');

    fs.writeFileSync(path.join(dir, file), content, 'utf8');
    console.log('✅ Refactored ' + file);
});

console.log('Massive Refactoring to Lylix Script Completed!');

