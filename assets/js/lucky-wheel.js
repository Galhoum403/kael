/* ==========================================
   🎰 Lucky Wheel / Slot Machine Logic v2
   Kael Store - Lylix Script
   ========================================== */
(function() {
    'use strict';

    var STORAGE_KEY = 'kael_wheel_spins';
    var MAX_SPINS = 3;
    var CURRENCY = 'ج.م';

    var wheelProducts = [];
    var isSpinning = false;

    // --- Default products (fallback if Firebase is empty) ---
    var defaultProducts = [
        { name: 'ساعة كلاسيكية', image: 'assets/img/product01.png', originalPrice: '350', wheelPrice: '280', weight: 15, link: '' },
        { name: 'سوار ذهبي', image: 'assets/img/product02.png', originalPrice: '120', wheelPrice: '85', weight: 25, link: '' },
        { name: 'طقم هدايا فاخر', image: 'assets/img/product03.png', originalPrice: '500', wheelPrice: '399', weight: 10, link: '' },
        { name: 'كوبون خصم 10%', image: 'assets/img/logo.png', originalPrice: '50', wheelPrice: '0', weight: 30, link: '' },
        { name: 'نظارة شمسية', image: 'assets/img/product01.png', originalPrice: '200', wheelPrice: '150', weight: 20, link: '' }
    ];

    // --- Get card width based on screen ---
    function getCardUnit() {
        var w = window.innerWidth;
        if (w <= 480) return 112; // 100 + 12 gap
        if (w <= 768) return 132; // 120 + 12 gap
        return 172; // 160 + 12 gap
    }

    // --- Spins management (localStorage) ---
    function getSpinsLeft() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return MAX_SPINS;
            var data = JSON.parse(raw);
            var today = new Date().toDateString();
            if (data.date !== today) return MAX_SPINS;
            return Math.max(0, MAX_SPINS - (data.count || 0));
        } catch(e) { return MAX_SPINS; }
    }

    function useSpin() {
        var today = new Date().toDateString();
        var data;
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            data = raw ? JSON.parse(raw) : null;
        } catch(e) { data = null; }
        if (!data || data.date !== today) {
            data = { date: today, count: 1 };
        } else {
            data.count = (data.count || 0) + 1;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function updateSpinsUI() {
        var left = getSpinsLeft();
        var badge = document.getElementById('wheel-spins-badge');
        var btn = document.getElementById('wheel-spin-btn');
        if (badge) badge.textContent = 'لديك ' + left + ' محاولات متبقية اليوم';
        if (btn) {
            if (left <= 0) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-clock"></i> انتهت محاولاتك اليوم';
            } else {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-dice"></i> لف العجلة!';
            }
        }
    }

    // --- Weighted random pick ---
    function pickWeightedRandom(products) {
        var totalWeight = 0;
        for (var i = 0; i < products.length; i++) {
            totalWeight += (parseInt(products[i].weight) || 1);
        }
        var rand = Math.random() * totalWeight;
        var cumulative = 0;
        for (var j = 0; j < products.length; j++) {
            cumulative += (parseInt(products[j].weight) || 1);
            if (rand <= cumulative) return j;
        }
        return products.length - 1;
    }

    // --- Build infinite strip ---
    function buildStrip(products) {
        var strip = document.getElementById('wheel-strip');
        if (!strip || products.length === 0) return;
        strip.innerHTML = '';

        // Create enough repetitions for smooth infinite feel (8 full sets)
        var reps = 8;
        for (var r = 0; r < reps; r++) {
            for (var i = 0; i < products.length; i++) {
                var card = document.createElement('div');
                card.className = 'wheel-card';
                card.setAttribute('data-product-index', i);

                var img = document.createElement('img');
                img.src = products[i].image || 'assets/img/logo.png';
                img.alt = products[i].name;
                img.loading = (r < 2) ? 'eager' : 'lazy';
                img.width = 90;
                img.height = 90;

                var nameEl = document.createElement('div');
                nameEl.className = 'wc-name';
                nameEl.textContent = products[i].name;

                var pricesEl = document.createElement('div');
                pricesEl.className = 'wc-prices';

                var origEl = document.createElement('span');
                origEl.className = 'wc-original';
                origEl.textContent = products[i].originalPrice + ' ' + CURRENCY;

                var wheelEl = document.createElement('span');
                wheelEl.className = 'wc-wheel';
                wheelEl.textContent = products[i].wheelPrice + ' ' + CURRENCY;

                pricesEl.appendChild(origEl);
                pricesEl.appendChild(wheelEl);

                card.appendChild(img);
                card.appendChild(nameEl);
                card.appendChild(pricesEl);
                strip.appendChild(card);
            }
        }

        // Position strip so it starts from the middle (looks infinite both ways)
        var cardUnit = getCardUnit();
        var totalCards = products.length;
        var middleSetStart = totalCards * 3 * cardUnit;
        var wrapperWidth = document.querySelector('.wheel-track-wrapper').offsetWidth;
        var offset = middleSetStart - (wrapperWidth / 2) + (cardUnit / 2);
        strip.style.transition = 'none';
        strip.style.transform = 'translateX(-' + offset + 'px)';
    }

    // --- Spin Animation ---
    function spin() {
        if (isSpinning) return;
        if (getSpinsLeft() <= 0) return;

        isSpinning = true;
        useSpin();
        updateSpinsUI();

        var btn = document.getElementById('wheel-spin-btn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري اللف...';
        }

        var strip = document.getElementById('wheel-strip');
        var products = wheelProducts.length > 0 ? wheelProducts : defaultProducts;
        var cardUnit = getCardUnit();
        var totalCards = products.length;

        // Pick winner using weighted random
        var winnerIndex = pickWeightedRandom(products);

        // Rebuild strip fresh
        buildStrip(products);

        // Calculate positions
        var wrapperWidth = document.querySelector('.wheel-track-wrapper').offsetWidth;
        var centerOffset = wrapperWidth / 2 - cardUnit / 2;

        // Current position: strip is at middle set (set index 3)
        var currentSetStart = totalCards * 3 * cardUnit;
        var currentPos = currentSetStart - centerOffset;

        // Target: travel 3 more full sets + land on winnerIndex in set 6
        var targetSetStart = totalCards * 6 * cardUnit;
        var targetPos = targetSetStart + (winnerIndex * cardUnit) - centerOffset;

        // Add slight random offset within the card for natural feel
        targetPos += (Math.random() * 30) - 15;

        // Set starting position
        strip.style.transition = 'none';
        strip.style.transform = 'translateX(-' + currentPos + 'px)';

        // Force reflow
        void strip.offsetHeight;

        // Animate
        var duration = 4000 + Math.random() * 1500;
        strip.style.transition = 'transform ' + duration + 'ms cubic-bezier(0.15, 0.6, 0.25, 1)';
        strip.style.transform = 'translateX(-' + targetPos + 'px)';

        // After animation ends
        setTimeout(function() {
            // Find the exact winner card in the DOM
            var allCards = strip.querySelectorAll('.wheel-card');
            var targetCardDomIndex = (totalCards * 6) + winnerIndex;
            if (allCards[targetCardDomIndex]) {
                allCards[targetCardDomIndex].classList.add('winner');
            }

            // Show win popup with correct product
            setTimeout(function() {
                showWinPopup(products[winnerIndex]);
                isSpinning = false;
                updateSpinsUI();
            }, 600);

        }, duration + 100);
    }

    // --- Generate unique deal code ---
    function generateDealCode() {
        var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        var code = 'KAEL-';
        for (var i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    // --- Show Win Popup ---
    function showWinPopup(product) {
        var overlay = document.getElementById('wheel-win-overlay');
        if (!overlay) return;

        // Use admin-defined promo code from Reflow, or generate fallback
        var dealCode = (product.promoCode && product.promoCode.trim()) ? product.promoCode.trim() : generateDealCode();

        var popupImg = overlay.querySelector('.wwp-img');
        var popupName = overlay.querySelector('.wwp-name');
        var popupOriginal = overlay.querySelector('.wwp-original');
        var popupDeal = overlay.querySelector('.wwp-deal');
        var popupCode = overlay.querySelector('.wwp-code-value');
        var popupWhatsapp = overlay.querySelector('.wwp-whatsapp');
        var popupHint = overlay.querySelector('.wwp-code-hint');

        if (popupImg) popupImg.src = product.image || 'assets/img/logo.png';
        if (popupName) popupName.textContent = product.name;
        if (popupOriginal) popupOriginal.textContent = product.originalPrice + ' ' + CURRENCY;
        if (popupDeal) popupDeal.textContent = product.wheelPrice + ' ' + CURRENCY;
        if (popupCode) popupCode.textContent = dealCode;

        // Show correct hint based on whether promo code is from Reflow
        if (popupHint) {
            if (product.promoCode && product.promoCode.trim()) {
                popupHint.textContent = 'استخدم هذا الكود عند إتمام الشراء للحصول على الخصم!';
            } else {
                popupHint.textContent = 'أرسل هذا الكود عبر واتساب لتفعيل العرض';
            }
        }

        // WhatsApp message
        if (popupWhatsapp) {
            var waNumber = '201234567890'; // Default, can be changed
            try {
                if (window.LylixConfig && window.LylixConfig.whatsapp) {
                    waNumber = window.LylixConfig.whatsapp.replace(/[^0-9]/g, '');
                }
            } catch(e) {}
            var msg = '🎰 مرحباً! ربحت عرض عجلة الحظ!\n\n' +
                      '📦 المنتج: ' + product.name + '\n' +
                      '💰 السعر الأصلي: ' + product.originalPrice + ' ' + CURRENCY + '\n' +
                      '🔥 سعر العرض: ' + product.wheelPrice + ' ' + CURRENCY + '\n' +
                      '🎟️ كود العرض: ' + dealCode + '\n\n' +
                      'أريد الاستفادة من هذا العرض!';
            popupWhatsapp.href = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(msg);
        }

        overlay.classList.add('active');

        // Mini confetti effect
        spawnConfetti(overlay.querySelector('.wheel-win-popup'));
    }

    // --- Close popup ---
    function closeWinPopup() {
        var overlay = document.getElementById('wheel-win-overlay');
        if (overlay) overlay.classList.remove('active');
    }

    // --- Copy deal code ---
    window.copyDealCode = function() {
        var codeEl = document.querySelector('.wwp-code-value');
        if (!codeEl) return;
        var code = codeEl.textContent;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(code);
        } else {
            var ta = document.createElement('textarea');
            ta.value = code;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        }
        var copyBtn = document.querySelector('.wwp-copy-btn');
        if (copyBtn) {
            copyBtn.innerHTML = '<i class="fas fa-check"></i> تم النسخ!';
            setTimeout(function() {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> نسخ الكود';
            }, 2000);
        }
    };

    // --- Mini confetti ---
    function spawnConfetti(container) {
        if (!container) return;
        var colors = ['#C5A059', '#FFD700', '#fff', '#d4af61', '#103C2B'];
        for (var i = 0; i < 30; i++) {
            var particle = document.createElement('div');
            particle.className = 'wheel-confetti';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 30 + '%';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.animationDelay = (Math.random() * 0.5) + 's';
            particle.style.animationDuration = (1 + Math.random()) + 's';
            container.appendChild(particle);
            setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 2500, particle);
        }
    }

    // --- Load from Firebase ---
    function loadFromFirebase() {
        import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js').then(function(firebaseApp) {
            import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js').then(function(firebaseDB) {
                var config = {
                    apiKey: "AIzaSyDuynSBIWoQYcuyRYEjXEZ8qhnbMMU0pfE",
                    databaseURL: "https://kael-85f70-default-rtdb.firebaseio.com",
                    projectId: "kael-85f70"
                };
                var app;
                try { app = firebaseApp.initializeApp(config, 'wheel-reader'); }
                catch(e) { app = firebaseApp.getApp('wheel-reader'); }
                var db = firebaseDB.getDatabase(app);
                var wheelRef = firebaseDB.ref(db, 'lucky_wheel');

                firebaseDB.onValue(wheelRef, function(snapshot) {
                    var data = snapshot.val();
                    if (data && data.length > 0) {
                        wheelProducts = data;
                    } else {
                        wheelProducts = defaultProducts;
                    }
                    buildStrip(wheelProducts);
                    updateSpinsUI();
                });
            });
        }).catch(function() {
            wheelProducts = defaultProducts;
            buildStrip(wheelProducts);
            updateSpinsUI();
        });
    }

    // --- Init ---
    function init() {
        var btn = document.getElementById('wheel-spin-btn');
        if (btn) btn.addEventListener('click', spin);

        var closeBtn = document.getElementById('wheel-win-close');
        if (closeBtn) closeBtn.addEventListener('click', closeWinPopup);

        var overlay = document.getElementById('wheel-win-overlay');
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) closeWinPopup();
            });
        }

        loadFromFirebase();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
