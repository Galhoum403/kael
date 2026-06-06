const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const globalCSS = `
    <!-- AOS CSS -->
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    <!-- SweetAlert2 CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">
    
    <style>
        /* Preloader */
        #kael-preloader {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: #103C2B; z-index: 999999;
            display: flex; flex-direction: column; justify-content: center; align-items: center;
            transition: opacity 0.5s ease, visibility 0.5s ease;
        }
        #kael-preloader img { width: 120px; margin-bottom: 20px; animation: pulse 1.5s infinite; }
        .kael-spinner {
            width: 40px; height: 40px;
            border: 3px solid rgba(197, 160, 89, 0.3);
            border-radius: 50%;
            border-top-color: #C5A059;
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
        body.header-is-sticky { padding-top: 150px; /* prevent layout jump */ }
    </style>
`;

const preloaderHTML = `
    <!-- Preloader -->
    <div id="kael-preloader">
        <img src="assets/img/logo.png" alt="Kael Logo">
        <div class="kael-spinner"></div>
    </div>
`;

const globalJS = `
    <!-- AOS JS -->
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <!-- SweetAlert2 JS -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Init AOS
            AOS.init({ duration: 800, once: true, offset: 50 });

            // Sticky Header
            const header = document.getElementById('header');
            const topHeader = document.getElementById('top-header');
            const mainNav = document.getElementById('navigation');
            if (header) {
                const headerOffset = header.offsetTop;
                window.addEventListener('scroll', () => {
                    if (window.scrollY > headerOffset + 50) {
                        header.classList.add('sticky-glass');
                        if(mainNav) mainNav.style.display = 'none'; // Optional: simplify nav on scroll
                    } else {
                        header.classList.remove('sticky-glass');
                        if(mainNav && window.innerWidth >= 768) mainNav.style.display = 'block';
                    }
                });
            }

            // Web3Forms AJAX Override
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                const isWeb3 = form.querySelector('input[name="access_key"]');
                if (isWeb3) {
                    // Remove standard redirect to stop page reload
                    const redirectInput = form.querySelector('input[name="redirect"]');
                    if(redirectInput) redirectInput.remove();

                    form.addEventListener('submit', async function(e) {
                        e.preventDefault();
                        const btn = form.querySelector('button[type="submit"]');
                        const originalText = btn.innerHTML;
                        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
                        btn.disabled = true;

                        const formData = new FormData(form);
                        try {
                            const response = await fetch('https://api.web3forms.com/submit', {
                                method: 'POST',
                                body: formData
                            });
                            const data = await response.json();
                            if (data.success) {
                                Swal.fire({
                                    icon: 'success',
                                    title: 'تم بنجاح!',
                                    text: 'تم استلام طلبك وسنتواصل معك قريباً.',
                                    confirmButtonColor: '#C5A059',
                                    confirmButtonText: 'حسناً'
                                });
                                form.reset();
                            } else {
                                throw new Error('فشل الإرسال');
                            }
                        } catch (error) {
                            Swal.fire({
                                icon: 'error',
                                title: 'عذراً!',
                                text: 'حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.',
                                confirmButtonColor: '#103C2B',
                                confirmButtonText: 'حسناً'
                            });
                        } finally {
                            btn.innerHTML = originalText;
                            btn.disabled = false;
                        }
                    });
                }
            });
        });

        // Hide preloader on load
        window.addEventListener('load', function() {
            const preloader = document.getElementById('kael-preloader');
            if (preloader) {
                preloader.style.opacity = '0';
                setTimeout(() => preloader.style.display = 'none', 500);
            }
        });
    </script>
`;

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');

    // 1. Inject CSS
    if (!content.includes('aos.css')) {
        content = content.replace('</head>', globalCSS + '\n</head>');
    }

    // 2. Inject Preloader
    if (!content.includes('kael-preloader')) {
        content = content.replace(/<body>/i, '<body>\n' + preloaderHTML);
    }

    // 3. Inject JS
    if (!content.includes('aos.js')) {
        content = content.replace('</body>', globalJS + '\n</body>');
    }

    // 4. Update Search Form
    const oldSearchForm = /<form><select class="input-select" dir="rtl">[\s\S]*?<option value="0">كل الأقسام<\/option>[\s\S]*?<option value="1">هدايا<\/option>[\s\S]*?<\/select><input class="input text-end" placeholder="ابحث عن منتج\.\.\." dir="rtl"><button class="search-btn">بحث<\/button><\/form>/;
    
    const newSearchForm = `
                        <form action="shop.html" method="GET" class="d-flex w-100">
                            <input type="text" name="search" class="input text-end flex-grow-1" placeholder="ابحث عن منتج..." dir="rtl" required style="border-radius: 0 20px 20px 0;">
                            <button type="submit" class="search-btn" style="border-radius: 20px 0 0 20px; padding: 0 20px;">بحث</button>
                        </form>
    `;
    if (oldSearchForm.test(content)) {
        content = content.replace(oldSearchForm, newSearchForm);
    } else {
        // Fallback for simple replace if regex fails
        const searchFallback = '<form><select class="input-select" dir="rtl">';
        if (content.includes(searchFallback)) {
            let start = content.indexOf(searchFallback);
            let end = content.indexOf('</form>', start) + 7;
            content = content.substring(0, start) + newSearchForm + content.substring(end);
        }
    }

    // 5. Add AOS attributes to general sections
    content = content.replace(/<div class="section"(.*?)>/g, '<div class="section"$1 data-aos="fade-up">');
    // For specific shop HTML elements if present
    content = content.replace(/<div class="aside"/g, '<div class="aside" data-aos="fade-left"');
    
    fs.writeFileSync(path.join(dir, file), content, 'utf8');
    console.log(`✅ Applied UX improvements to ${file}`);
});

// Now handle shop.html specifically for Reflow search
let shopContent = fs.readFileSync(path.join(dir, 'shop.html'), 'utf8');
const searchSyncScript = `
    <script>
        // Sync custom search URL parameter with Reflow
        document.addEventListener('DOMContentLoaded', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const searchQuery = urlParams.get('search');
            if (searchQuery) {
                // Update title
                document.getElementById('kael-shop-title').textContent = 'نتائج البحث عن: ' + searchQuery;
                document.getElementById('kael-breadcrumb-current').textContent = 'نتائج البحث';
                
                // Tell Reflow to filter by this search query
                const reflowContainer = document.querySelector('[data-reflow-type="product-list"]');
                if (reflowContainer) {
                    reflowContainer.setAttribute('data-reflow-search', searchQuery);
                }
            }
        });
    </script>
`;
if (!shopContent.includes('Sync custom search URL parameter with Reflow')) {
    shopContent = shopContent.replace('</body>', searchSyncScript + '\\n</body>');
    fs.writeFileSync(path.join(dir, 'shop.html'), shopContent, 'utf8');
}

console.log('✅ All done!');
