/**
 * Kael Wishlist System
 * نظام مفضلة مستقل بالكامل - يعمل مع منتجات Reflow عبر localStorage
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'kael_wishlist';

    // ==================== Core Functions ====================

    function getWishlist() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveWishlist(list) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    function isInWishlist(productId) {
        return getWishlist().some(item => item.id === productId);
    }

    function addToWishlist(product) {
        let list = getWishlist();
        if (!list.some(item => item.id === product.id)) {
            list.push(product);
            saveWishlist(list);
        }
        updateHeaderCount();
    }

    function removeFromWishlist(productId) {
        let list = getWishlist().filter(item => item.id !== productId);
        saveWishlist(list);
        updateHeaderCount();
    }

    function toggleWishlist(product) {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
            return false; // removed
        } else {
            addToWishlist(product);
            return true; // added
        }
    }

    // ==================== Header Badge ====================

    function updateHeaderCount() {
        const count = getWishlist().length;
        document.querySelectorAll('.kael-wishlist-count').forEach(el => {
            el.textContent = count;
        });
    }

    // ==================== Inject Hearts onto Reflow Cards ====================

    function injectHeartButtons() {
        // Reflow product cards use .ref-product as their container
        const cards = document.querySelectorAll('.ref-product');
        if (!cards.length) return;

        cards.forEach(card => {
            // Don't inject twice
            if (card.querySelector('.kael-heart-btn')) return;

            // Extract product data from the card
            const linkEl = card.querySelector('a[href]');
            const imgEl = card.querySelector('img');
            const nameEl = card.querySelector('.ref-name') || card.querySelector('.ref-product-name');
            const priceEl = card.querySelector('.ref-price') || card.querySelector('.ref-product-price');

            let productId = '';
            let productUrl = '';
            if (linkEl) {
                productUrl = linkEl.getAttribute('href') || '';
                // Extract product ID from URL (product.html?product=XXXXX)
                const match = productUrl.match(/product=([^&]+)/);
                productId = match ? match[1] : productUrl;
            }

            if (!productId) {
                // Fallback: use name as ID
                productId = nameEl ? nameEl.textContent.trim() : Math.random().toString(36).substr(2, 8);
            }

            const product = {
                id: productId,
                name: nameEl ? nameEl.textContent.trim() : 'منتج',
                price: priceEl ? priceEl.textContent.trim() : '',
                image: imgEl ? imgEl.src : '',
                url: productUrl
            };

            // Create heart button
            const heartBtn = document.createElement('button');
            heartBtn.className = 'kael-heart-btn';
            heartBtn.setAttribute('aria-label', 'إضافة للمفضلة');
            heartBtn.innerHTML = isInWishlist(productId)
                ? '<i class="fas fa-heart"></i>'
                : '<i class="far fa-heart"></i>';

            if (isInWishlist(productId)) {
                heartBtn.classList.add('active');
            }

            heartBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                const added = toggleWishlist(product);
                if (added) {
                    this.innerHTML = '<i class="fas fa-heart"></i>';
                    this.classList.add('active');
                    showToast('تمت الإضافة للمفضلة ❤️');
                } else {
                    this.innerHTML = '<i class="far fa-heart"></i>';
                    this.classList.remove('active');
                    showToast('تمت الإزالة من المفضلة');
                }
            });

            // Position the card relatively so the heart is absolute inside it
            const imageContainer = card.querySelector('.ref-media') || card.querySelector('.ref-image') || card;
            imageContainer.style.position = 'relative';
            imageContainer.appendChild(heartBtn);
        });
    }

    // ==================== Toast Notification ====================

    function showToast(message) {
        // Remove existing toast
        const existing = document.getElementById('kael-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'kael-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 2000);
    }

    // ==================== Favorites Page Renderer ====================

    function renderFavoritesPage() {
        const container = document.getElementById('kael-favorites-grid');
        if (!container) return;

        const list = getWishlist();
        const emptyState = document.getElementById('kael-favorites-empty');

        if (list.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        container.innerHTML = list.map(item => `
            <div class="col-6 col-md-4 col-lg-3 mb-4 kael-fav-item" data-id="${item.id}">
                <div class="kael-fav-card">
                    <div class="kael-fav-img-wrap">
                        <a href="${item.url || '#'}">
                            <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/img/logo.png'">
                        </a>
                        <button class="kael-fav-remove" data-id="${item.id}" aria-label="إزالة من المفضلة">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                    <div class="kael-fav-info">
                        <a href="${item.url || '#'}" class="kael-fav-name">${item.name}</a>
                        <span class="kael-fav-price">${item.price}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Attach remove listeners
        container.querySelectorAll('.kael-fav-remove').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                const id = this.getAttribute('data-id');
                removeFromWishlist(id);
                const card = this.closest('.kael-fav-item');
                card.style.transition = 'all 0.4s ease';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    card.remove();
                    // Check if empty
                    if (getWishlist().length === 0 && emptyState) {
                        emptyState.style.display = 'block';
                    }
                }, 400);
                showToast('تمت الإزالة من المفضلة');
            });
        });
    }

    // ==================== CSS Injection ====================

    function injectStyles() {
        if (document.getElementById('kael-wishlist-css')) return;

        const css = document.createElement('style');
        css.id = 'kael-wishlist-css';
        css.textContent = `
            /* ===== Heart Button on Product Cards ===== */
            .kael-heart-btn {
                position: absolute;
                top: 10px;
                left: 10px;
                z-index: 10;
                background: rgba(255,255,255,0.9);
                border: none;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 16px;
                color: #ccc;
                box-shadow: 0 2px 8px rgba(0,0,0,0.12);
                transition: all 0.3s ease;
            }
            .kael-heart-btn:hover {
                transform: scale(1.15);
                box-shadow: 0 4px 14px rgba(0,0,0,0.18);
            }
            .kael-heart-btn.active,
            .kael-heart-btn.active i {
                color: #e74c3c;
            }
            .kael-heart-btn i {
                transition: color 0.3s, transform 0.3s;
            }
            .kael-heart-btn.active i {
                animation: kael-heart-pop 0.4s ease;
            }
            @keyframes kael-heart-pop {
                0% { transform: scale(1); }
                50% { transform: scale(1.35); }
                100% { transform: scale(1); }
            }

            /* ===== Toast Notification ===== */
            #kael-toast {
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%) translateY(80px);
                background: linear-gradient(135deg, #103C2B 0%, #1a5a3f 100%);
                color: #fff;
                padding: 14px 30px;
                border-radius: 30px;
                font-size: 15px;
                font-weight: bold;
                z-index: 99999;
                box-shadow: 0 8px 25px rgba(0,0,0,0.25);
                opacity: 0;
                transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                pointer-events: none;
                border: 1px solid rgba(197,160,89,0.3);
            }
            #kael-toast.show {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }

            /* ===== Favorites Page Cards ===== */
            .kael-fav-card {
                background: #fff;
                border-radius: 15px;
                overflow: hidden;
                border: 1px solid #eee;
                transition: all 0.3s ease;
                box-shadow: 0 2px 10px rgba(0,0,0,0.06);
            }
            .kael-fav-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 25px rgba(0,0,0,0.12);
                border-color: #C5A059;
            }
            .kael-fav-img-wrap {
                position: relative;
                overflow: hidden;
                background: #f9f6f0;
            }
            .kael-fav-img-wrap img {
                width: 100%;
                height: 220px;
                object-fit: contain;
                padding: 15px;
                transition: transform 0.3s;
            }
            .kael-fav-card:hover .kael-fav-img-wrap img {
                transform: scale(1.05);
            }
            .kael-fav-remove {
                position: absolute;
                top: 10px;
                left: 10px;
                background: rgba(231,76,60,0.9);
                border: none;
                border-radius: 50%;
                width: 34px;
                height: 34px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-size: 14px;
                cursor: pointer;
                opacity: 0;
                transition: all 0.3s;
                box-shadow: 0 2px 8px rgba(231,76,60,0.3);
            }
            .kael-fav-card:hover .kael-fav-remove {
                opacity: 1;
            }
            .kael-fav-remove:hover {
                background: #c0392b;
                transform: scale(1.1);
            }
            .kael-fav-info {
                padding: 15px;
                text-align: right;
            }
            .kael-fav-name {
                display: block;
                font-weight: bold;
                color: #103C2B;
                font-size: 14px;
                margin-bottom: 8px;
                text-decoration: none;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .kael-fav-name:hover {
                color: #C5A059;
            }
            .kael-fav-price {
                color: #C5A059;
                font-weight: bold;
                font-size: 16px;
            }

            /* ===== Favorites Empty State ===== */
            .kael-fav-empty-state {
                text-align: center;
                padding: 60px 20px;
            }
            .kael-fav-empty-icon {
                font-size: 70px;
                color: #ddd;
                margin-bottom: 20px;
                animation: kael-float 3s ease-in-out infinite;
            }
            @keyframes kael-float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }

            /* ===== Header Wishlist Icon ===== */
            .kael-header-wish a {
                position: relative;
            }
            .kael-header-wish .kael-wish-badge {
                position: absolute;
                top: -8px;
                right: -8px;
                background: #e74c3c;
                color: #fff;
                font-size: 10px;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            }

            @media (max-width: 768px) {
                .kael-fav-img-wrap img {
                    height: 160px;
                }
            }
        `;
        document.head.appendChild(css);
    }

    // ==================== MutationObserver for Reflow ====================
    // Reflow loads products asynchronously, so we observe DOM changes

    function observeReflow() {
        const target = document.querySelector('[data-reflow-type="product-list"]') ||
                       document.querySelector('[data-reflow-type="product-grid"]');
        if (!target) return;

        const observer = new MutationObserver((mutations) => {
            injectHeartButtons();
        });

        observer.observe(target, { childList: true, subtree: true });

        // Also try immediately in case already loaded
        setTimeout(injectHeartButtons, 1000);
        setTimeout(injectHeartButtons, 2500);
        setTimeout(injectHeartButtons, 5000);
    }

    // ==================== Init ====================

    function init() {
        injectStyles();
        updateHeaderCount();
        observeReflow();
        renderFavoritesPage();

        // Also inject on product detail pages
        setTimeout(() => {
            const detailPage = document.querySelector('[data-reflow-type="product"]');
            if (detailPage) {
                const observer = new MutationObserver(() => injectHeartButtons());
                observer.observe(detailPage, { childList: true, subtree: true });
                setTimeout(injectHeartButtons, 1500);
            }
        }, 500);
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose API globally
    window.KaelWishlist = {
        getAll: getWishlist,
        add: addToWishlist,
        remove: removeFromWishlist,
        toggle: toggleWishlist,
        isIn: isInWishlist,
        count: () => getWishlist().length,
        render: renderFavoritesPage
    };

})();
