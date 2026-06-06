/**
 * Kael Wishlist System v2
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
        return getWishlist().some(function(item) { return item.id === productId; });
    }

    function addToWishlist(product) {
        var list = getWishlist();
        if (!list.some(function(item) { return item.id === product.id; })) {
            list.push(product);
            saveWishlist(list);
        }
        updateHeaderCount();
    }

    function removeFromWishlist(productId) {
        var list = getWishlist().filter(function(item) { return item.id !== productId; });
        saveWishlist(list);
        updateHeaderCount();
    }

    function toggleWishlist(product) {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
            return false;
        } else {
            addToWishlist(product);
            return true;
        }
    }

    // ==================== Header Badge ====================

    function updateHeaderCount() {
        var count = getWishlist().length;
        var els = document.querySelectorAll('.kael-wishlist-count');
        for (var i = 0; i < els.length; i++) {
            els[i].textContent = count;
        }
    }

    // ==================== Extract Product Data from Reflow Card ====================

    function extractProductData(card) {
        // Reflow v2: card is usually <a class="ref-product" href="...">
        // Inside it: <img class="ref-image">, <div class="ref-product-data"> > <h5 class="ref-name">, <span class="ref-price">

        var productId = '';
        var productUrl = '';
        var productName = 'منتج';
        var productPrice = '';
        var productImage = '';

        // 1. URL & ID
        // The card itself might be an <a> tag
        if (card.tagName === 'A' && card.href) {
            productUrl = card.getAttribute('href') || '';
        } else {
            var linkEl = card.querySelector('a[href]');
            if (linkEl) productUrl = linkEl.getAttribute('href') || '';
        }

        // Extract product ID from URL
        if (productUrl) {
            var match = productUrl.match(/product=([^&]+)/);
            if (match) {
                productId = match[1];
            } else {
                var match2 = productUrl.match(/id=([^&]+)/);
                if (match2) productId = match2[1];
            }
        }

        // 2. Name - try multiple selectors
        var nameEl = card.querySelector('.ref-name') ||
                     card.querySelector('.ref-product-name') ||
                     card.querySelector('h5') ||
                     card.querySelector('h4') ||
                     card.querySelector('h3');
        if (nameEl && nameEl.textContent) {
            productName = nameEl.textContent.trim();
        }

        // Fallback ID from name
        if (!productId && productName !== 'منتج') {
            productId = productName.replace(/\s+/g, '_').substring(0, 30);
        }
        if (!productId) {
            productId = 'prod_' + Math.random().toString(36).substr(2, 8);
        }

        // 3. Price
        var priceEl = card.querySelector('.ref-price') ||
                      card.querySelector('.ref-product-price') ||
                      card.querySelector('[class*="price"]');
        if (priceEl && priceEl.textContent) {
            productPrice = priceEl.textContent.trim();
        }

        // 4. Image
        var imgEl = card.querySelector('.ref-image') ||
                    card.querySelector('img');
        if (imgEl && imgEl.src) {
            productImage = imgEl.src;
        }

        return {
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            url: productUrl
        };
    }

    // ==================== Inject Hearts onto Reflow Cards ====================

    function injectHeartButtons() {
        var cards = document.querySelectorAll('.ref-product');
        if (!cards.length) return;

        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];

            // Don't inject twice
            if (card.querySelector('.kael-heart-btn')) continue;

            var product = extractProductData(card);

            // Create heart button
            var heartBtn = document.createElement('button');
            heartBtn.className = 'kael-heart-btn';
            heartBtn.setAttribute('aria-label', 'إضافة للمفضلة');

            if (isInWishlist(product.id)) {
                heartBtn.innerHTML = '<i class="fas fa-heart"></i>';
                heartBtn.classList.add('active');
            } else {
                heartBtn.innerHTML = '<i class="far fa-heart"></i>';
            }

            // Store product data on the button
            heartBtn.setAttribute('data-product', JSON.stringify(product));

            heartBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                var prod = JSON.parse(this.getAttribute('data-product'));
                var added = toggleWishlist(prod);

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

            // Position the card container
            card.style.position = 'relative';
            card.appendChild(heartBtn);
        }
    }

    // ==================== Toast Notification ====================

    function showToast(message) {
        var existing = document.getElementById('kael-toast');
        if (existing) existing.remove();

        var toast = document.createElement('div');
        toast.id = 'kael-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(function() {
            toast.classList.add('show');
        });

        setTimeout(function() {
            toast.classList.remove('show');
            setTimeout(function() { toast.remove(); }, 400);
        }, 2000);
    }

    // ==================== Favorites Page Renderer ====================

    function renderFavoritesPage() {
        var container = document.getElementById('kael-favorites-grid');
        if (!container) return;

        var list = getWishlist();
        var emptyState = document.getElementById('kael-favorites-empty');

        if (!list.length) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        var html = '';
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            var name = item.name || 'منتج';
            var price = item.price || '';
            var image = item.image || 'assets/img/logo.png';
            var url = item.url || 'shop.html';
            var id = item.id || '';

            html += '<div class="col-6 col-md-4 col-lg-3 mb-4 kael-fav-item" data-id="' + id + '">';
            html += '  <div class="kael-fav-card">';
            html += '    <div class="kael-fav-img-wrap">';
            html += '      <a href="' + url + '">';
            html += '        <img src="' + image + '" alt="' + name + '" onerror="this.src=\'assets/img/logo.png\'">';
            html += '      </a>';
            html += '      <button class="kael-fav-remove" data-id="' + id + '" aria-label="إزالة من المفضلة">';
            html += '        <i class="fas fa-trash-alt"></i>';
            html += '      </button>';
            html += '    </div>';
            html += '    <div class="kael-fav-info">';
            html += '      <a href="' + url + '" class="kael-fav-name">' + name + '</a>';
            if (price) {
                html += '      <span class="kael-fav-price">' + price + '</span>';
            }
            html += '    </div>';
            html += '  </div>';
            html += '</div>';
        }

        container.innerHTML = html;

        // Attach remove listeners
        var removeBtns = container.querySelectorAll('.kael-fav-remove');
        for (var j = 0; j < removeBtns.length; j++) {
            removeBtns[j].addEventListener('click', function (e) {
                e.preventDefault();
                var id = this.getAttribute('data-id');
                removeFromWishlist(id);
                var card = this.closest('.kael-fav-item');
                card.style.transition = 'all 0.4s ease';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(function() {
                    card.remove();
                    if (getWishlist().length === 0 && emptyState) {
                        emptyState.style.display = 'block';
                    }
                }, 400);
                showToast('تمت الإزالة من المفضلة');
            });
        }
    }

    // ==================== CSS Injection ====================

    function injectStyles() {
        if (document.getElementById('kael-wishlist-css')) return;

        var css = document.createElement('style');
        css.id = 'kael-wishlist-css';
        css.textContent = [
            '/* Heart Button on Product Cards */',
            '.kael-heart-btn {',
            '    position: absolute;',
            '    top: 10px;',
            '    left: 10px;',
            '    z-index: 10;',
            '    background: rgba(255,255,255,0.92);',
            '    border: none;',
            '    border-radius: 50%;',
            '    width: 38px;',
            '    height: 38px;',
            '    display: flex;',
            '    align-items: center;',
            '    justify-content: center;',
            '    cursor: pointer;',
            '    font-size: 17px;',
            '    color: #ccc;',
            '    box-shadow: 0 2px 10px rgba(0,0,0,0.12);',
            '    transition: all 0.3s ease;',
            '}',
            '.kael-heart-btn:hover {',
            '    transform: scale(1.15);',
            '    box-shadow: 0 4px 16px rgba(0,0,0,0.2);',
            '}',
            '.kael-heart-btn.active,',
            '.kael-heart-btn.active i {',
            '    color: #e74c3c;',
            '}',
            '.kael-heart-btn i {',
            '    transition: color 0.3s, transform 0.3s;',
            '    pointer-events: none;',
            '}',
            '.kael-heart-btn.active i {',
            '    animation: kael-heart-pop 0.4s ease;',
            '}',
            '@keyframes kael-heart-pop {',
            '    0% { transform: scale(1); }',
            '    50% { transform: scale(1.4); }',
            '    100% { transform: scale(1); }',
            '}',
            '',
            '/* Toast Notification */',
            '#kael-toast {',
            '    position: fixed;',
            '    bottom: 30px;',
            '    left: 50%;',
            '    transform: translateX(-50%) translateY(80px);',
            '    background: linear-gradient(135deg, #103C2B 0%, #1a5a3f 100%);',
            '    color: #fff;',
            '    padding: 14px 30px;',
            '    border-radius: 30px;',
            '    font-size: 15px;',
            '    font-weight: bold;',
            '    z-index: 99999;',
            '    box-shadow: 0 8px 25px rgba(0,0,0,0.25);',
            '    opacity: 0;',
            '    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);',
            '    pointer-events: none;',
            '    border: 1px solid rgba(197,160,89,0.3);',
            '    white-space: nowrap;',
            '}',
            '#kael-toast.show {',
            '    opacity: 1;',
            '    transform: translateX(-50%) translateY(0);',
            '}',
            '',
            '/* Favorites Page Cards */',
            '.kael-fav-card {',
            '    background: #fff;',
            '    border-radius: 15px;',
            '    overflow: hidden;',
            '    border: 1px solid #eee;',
            '    transition: all 0.3s ease;',
            '    box-shadow: 0 2px 10px rgba(0,0,0,0.06);',
            '}',
            '.kael-fav-card:hover {',
            '    transform: translateY(-5px);',
            '    box-shadow: 0 8px 25px rgba(0,0,0,0.12);',
            '    border-color: #C5A059;',
            '}',
            '.kael-fav-img-wrap {',
            '    position: relative;',
            '    overflow: hidden;',
            '    background: #f9f6f0;',
            '}',
            '.kael-fav-img-wrap img {',
            '    width: 100%;',
            '    height: 220px;',
            '    object-fit: contain;',
            '    padding: 15px;',
            '    transition: transform 0.3s;',
            '}',
            '.kael-fav-card:hover .kael-fav-img-wrap img {',
            '    transform: scale(1.05);',
            '}',
            '.kael-fav-remove {',
            '    position: absolute;',
            '    top: 10px;',
            '    left: 10px;',
            '    background: rgba(231,76,60,0.9);',
            '    border: none;',
            '    border-radius: 50%;',
            '    width: 34px;',
            '    height: 34px;',
            '    display: flex;',
            '    align-items: center;',
            '    justify-content: center;',
            '    color: #fff;',
            '    font-size: 14px;',
            '    cursor: pointer;',
            '    opacity: 0;',
            '    transition: all 0.3s;',
            '    box-shadow: 0 2px 8px rgba(231,76,60,0.3);',
            '}',
            '.kael-fav-card:hover .kael-fav-remove {',
            '    opacity: 1;',
            '}',
            '.kael-fav-remove:hover {',
            '    background: #c0392b;',
            '    transform: scale(1.1);',
            '}',
            '.kael-fav-info {',
            '    padding: 15px;',
            '    text-align: right;',
            '}',
            '.kael-fav-name {',
            '    display: block;',
            '    font-weight: bold;',
            '    color: #103C2B;',
            '    font-size: 14px;',
            '    margin-bottom: 8px;',
            '    text-decoration: none;',
            '    overflow: hidden;',
            '    text-overflow: ellipsis;',
            '    white-space: nowrap;',
            '}',
            '.kael-fav-name:hover {',
            '    color: #C5A059;',
            '}',
            '.kael-fav-price {',
            '    color: #C5A059;',
            '    font-weight: bold;',
            '    font-size: 16px;',
            '}',
            '',
            '/* Favorites Empty State */',
            '.kael-fav-empty-state {',
            '    text-align: center;',
            '    padding: 60px 20px;',
            '}',
            '.kael-fav-empty-icon {',
            '    font-size: 70px;',
            '    color: #ddd;',
            '    margin-bottom: 20px;',
            '    animation: kael-float 3s ease-in-out infinite;',
            '}',
            '@keyframes kael-float {',
            '    0%, 100% { transform: translateY(0); }',
            '    50% { transform: translateY(-10px); }',
            '}',
            '',
            '/* Header Wishlist Icon */',
            '.kael-header-wish a {',
            '    position: relative;',
            '}',
            '.kael-header-wish .kael-wish-badge {',
            '    position: absolute;',
            '    top: -8px;',
            '    right: -8px;',
            '    background: #e74c3c;',
            '    color: #fff;',
            '    font-size: 10px;',
            '    width: 18px;',
            '    height: 18px;',
            '    border-radius: 50%;',
            '    display: flex;',
            '    align-items: center;',
            '    justify-content: center;',
            '    font-weight: bold;',
            '}',
            '',
            '@media (max-width: 768px) {',
            '    .kael-fav-img-wrap img {',
            '        height: 160px;',
            '    }',
            '}'
        ].join('\n');
        document.head.appendChild(css);
    }

    // ==================== MutationObserver for Reflow ====================

    function observeReflow() {
        var targets = document.querySelectorAll('[data-reflow-type="product-list"], [data-reflow-type="product-grid"], [data-reflow-type="product"]');
        if (!targets.length) return;

        for (var t = 0; t < targets.length; t++) {
            var observer = new MutationObserver(function() {
                injectHeartButtons();
            });
            observer.observe(targets[t], { childList: true, subtree: true });
        }

        // Retry multiple times since Reflow loads async
        setTimeout(injectHeartButtons, 1500);
        setTimeout(injectHeartButtons, 3000);
        setTimeout(injectHeartButtons, 5000);
        setTimeout(injectHeartButtons, 8000);
    }

    // ==================== Clean corrupted data ====================

    function cleanWishlist() {
        var list = getWishlist();
        var cleaned = list.filter(function(item) {
            return item && item.id && item.name && item.name !== 'undefined';
        });
        if (cleaned.length !== list.length) {
            saveWishlist(cleaned);
        }
    }

    // ==================== Init ====================

    function init() {
        injectStyles();
        cleanWishlist();
        updateHeaderCount();
        observeReflow();
        renderFavoritesPage();
    }

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
        count: function() { return getWishlist().length; },
        render: renderFavoritesPage,
        clear: function() { saveWishlist([]); updateHeaderCount(); renderFavoritesPage(); }
    };

})();
