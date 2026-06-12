
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

    // G. Dynamic Navigation Builder
    function renderNavigation() {
        if (!LylixConfig.navigation) return;
        
        const currentPath = window.location.pathname.split('/').pop() || '/';
        const searchStr = window.location.search;
        
        document.querySelectorAll('.main-nav').forEach(navEl => {
            navEl.innerHTML = ''; // Clear existing
            
            LylixConfig.navigation.forEach(item => {
                const li = document.createElement('li');
                
                if (item.isDropdown) {
                    li.className = 'dropdown';
                    const a = document.createElement('a');
                    a.href = '#';
                    a.className = 'dropdown-toggle';
                    a.setAttribute('data-bs-toggle', 'dropdown');
                    a.innerHTML = item.title + ' <i class="fas fa-chevron-down me-1" style="font-size: 11px;"></i>';
                    
                    const ul = document.createElement('ul');
                    ul.className = 'dropdown-menu shadow-sm';
                    ul.style.cssText = 'text-align: right; border: 1px solid var(--lylix-primary, #C5A059); padding: 10px; border-radius: 8px;';
                    
                    item.items.forEach(subItem => {
                        const subLi = document.createElement('li');
                        const subA = document.createElement('a');
                        subA.className = 'dropdown-item';
                        subA.href = subItem.url;
                        subA.textContent = subItem.title;
                        subLi.appendChild(subA);
                        ul.appendChild(subLi);
                        
                        // Check active state
                        if (subItem.url.includes(currentPath) && (subItem.url.includes(searchStr) || searchStr === '')) {
                            li.classList.add('active');
                            subA.style.color = 'var(--lylix-primary)';
                        }
                    });
                    
                    li.appendChild(a);
                    li.appendChild(ul);
                } else {
                    const a = document.createElement('a');
                    a.href = item.url;
                    a.textContent = item.title.replace(/🤝|🌟|🎈|🎁|💎/g, '').trim(); // Remove emoji for text
                    
                    if (item.highlight) {
                        a.innerHTML = item.title;
                        a.style.color = 'var(--lylix-primary)';
                        a.style.fontWeight = 'bold';
                    }
                    
                    // Check active
                    if (item.url === currentPath || (item.url === '/' && currentPath === 'index.html')) {
                        li.classList.add('active');
                    }
                    
                    li.appendChild(a);
                }
                
                navEl.appendChild(li);
            });
        });
    }
    renderNavigation();

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
                    const waMessage = encodeURIComponent('مرحباً ' + LylixConfig.storeName + '، أود الاستفسار عن هذا المنتج:\n📦 ' + productName + '\n💰 السعر: ' + productPrice + '\nهل هو متوفر حالياً؟');
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


// J. Anti-Inspect Logic (Security)
document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('keydown', function(e) {
    // Prevent F12
    if (e.key === 'F12' || e.keyCode === 123) { e.preventDefault(); return false; }
    // Prevent Ctrl+Shift+I
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) { e.preventDefault(); return false; }
    // Prevent Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) { e.preventDefault(); return false; }
    // Prevent Ctrl+Shift+J
    if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) { e.preventDefault(); return false; }
    // Prevent Ctrl+U
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) { e.preventDefault(); return false; }
});
