/* ==========================================
   🎰 Lucky Wheel / Slot Machine Logic
   Kael Store - Lylix Script
   ========================================== */
(function() {
    'use strict';

    const STORAGE_KEY = 'kael_wheel_spins';
    const MAX_SPINS = 3;
    const CARD_WIDTH_DESKTOP = 172; // card width + gap
    const CARD_WIDTH_MOBILE = 132;
    const CARD_WIDTH_SMALL = 112;

    let wheelProducts = [];
    let isSpinning = false;

    // --- Default products (fallback if Firebase is empty) ---
    const defaultProducts = [
        { name: 'ساعة كلاسيكية', image: 'assets/img/product01.png', originalPrice: '350', wheelPrice: '280', weight: 15, link: 'shop' },
        { name: 'سوار ذهبي', image: 'assets/img/product02.png', originalPrice: '120', wheelPrice: '85', weight: 25, link: 'shop' },
        { name: 'طقم هدايا فاخر', image: 'assets/img/product03.png', originalPrice: '500', wheelPrice: '399', weight: 10, link: 'shop' },
        { name: 'كوبون خصم 10%', image: 'assets/img/logo.png', originalPrice: '50', wheelPrice: '0', weight: 30, link: 'shop' },
        { name: 'نظارة شمسية', image: 'assets/img/product01.png', originalPrice: '200', wheelPrice: '150', weight: 20, link: 'shop' }
    ];

    // --- Get card width based on screen ---
    function getCardUnit() {
        if (window.innerWidth <= 480) return CARD_WIDTH_SMALL;
        if (window.innerWidth <= 768) return CARD_WIDTH_MOBILE;
        return CARD_WIDTH_DESKTOP;
    }

    // --- Spins management (localStorage) ---
    function getSpinsData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch(e) { return null; }
    }

    function getSpinsLeft() {
        const data = getSpinsData();
        if (!data) return MAX_SPINS;
        const today = new Date().toDateString();
        if (data.date !== today) return MAX_SPINS;
        return Math.max(0, MAX_SPINS - (data.count || 0));
    }

    function useSpin() {
        const today = new Date().toDateString();
        let data = getSpinsData();
        if (!data || data.date !== today) {
            data = { date: today, count: 1 };
        } else {
            data.count = (data.count || 0) + 1;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function updateSpinsUI() {
        const left = getSpinsLeft();
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

    // --- Build the strip of cards ---
    function buildStrip(products, repetitions) {
        var strip = document.getElementById('wheel-strip');
        if (!strip) return;
        strip.innerHTML = '';

        for (var r = 0; r < repetitions; r++) {
            for (var i = 0; i < products.length; i++) {
                var card = document.createElement('div');
                card.className = 'wheel-card';
                card.setAttribute('data-index', i);

                var img = document.createElement('img');
                img.src = products[i].image || 'assets/img/logo.png';
                img.alt = products[i].name;
                img.loading = 'lazy';
                img.width = 90;
                img.height = 90;

                var nameEl = document.createElement('div');
                nameEl.className = 'wc-name';
                nameEl.textContent = products[i].name;

                var pricesEl = document.createElement('div');
                pricesEl.className = 'wc-prices';

                var origEl = document.createElement('span');
                origEl.className = 'wc-original';
                origEl.textContent = products[i].originalPrice + ' ر.س';

                var wheelEl = document.createElement('span');
                wheelEl.className = 'wc-wheel';
                wheelEl.textContent = products[i].wheelPrice + ' ر.س';

                pricesEl.appendChild(origEl);
                pricesEl.appendChild(wheelEl);

                card.appendChild(img);
                card.appendChild(nameEl);
                card.appendChild(pricesEl);
                strip.appendChild(card);
            }
        }
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

        // Build enough cards for smooth animation (3 full cycles + winner position)
        buildStrip(products, 4);

        // Calculate target position: 3 full cycles + winner card centered
        var wrapperWidth = document.querySelector('.wheel-track-wrapper').offsetWidth;
        var centerOffset = (wrapperWidth / 2) - (cardUnit / 2);
        var targetPos = (totalCards * 3 * cardUnit) + (winnerIndex * cardUnit) - centerOffset;

        // Add slight randomness so it doesn't always land perfectly center
        targetPos += (Math.random() * 20) - 10;

        // Reset position
        strip.style.transition = 'none';
        strip.style.transform = 'translateX(0px)';

        // Force reflow
        strip.offsetHeight;

        // Animate with cubic-bezier for realistic deceleration
        var duration = 4000 + Math.random() * 1500; // 4-5.5 seconds
        strip.style.transition = 'transform ' + duration + 'ms cubic-bezier(0.15, 0.6, 0.25, 1)';
        strip.style.transform = 'translateX(-' + targetPos + 'px)';

        // After animation ends
        setTimeout(function() {
            // Find the winner card and highlight it
            var allCards = strip.querySelectorAll('.wheel-card');
            var targetCardIndex = (totalCards * 3) + winnerIndex;
            if (allCards[targetCardIndex]) {
                allCards[targetCardIndex].classList.add('winner');
            }

            // Show win popup after a short delay
            setTimeout(function() {
                showWinPopup(products[winnerIndex]);
                isSpinning = false;
                updateSpinsUI();
            }, 600);

        }, duration + 100);
    }

    // --- Show Win Popup ---
    function showWinPopup(product) {
        var overlay = document.getElementById('wheel-win-overlay');
        if (!overlay) return;

        var popupImg = overlay.querySelector('.wwp-img');
        var popupName = overlay.querySelector('.wwp-name');
        var popupOriginal = overlay.querySelector('.wwp-original');
        var popupDeal = overlay.querySelector('.wwp-deal');
        var popupCta = overlay.querySelector('.wwp-cta');

        if (popupImg) popupImg.src = product.image || 'assets/img/logo.png';
        if (popupName) popupName.textContent = product.name;
        if (popupOriginal) popupOriginal.textContent = product.originalPrice + ' ر.س';
        if (popupDeal) popupDeal.textContent = product.wheelPrice + ' ر.س';
        if (popupCta) popupCta.href = product.link || 'shop';

        overlay.classList.add('active');

        // Mini confetti effect
        spawnConfetti(overlay.querySelector('.wheel-win-popup'));
    }

    // --- Close popup ---
    function closeWinPopup() {
        var overlay = document.getElementById('wheel-win-overlay');
        if (overlay) overlay.classList.remove('active');
    }

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
            // Cleanup
            setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 2500, particle);
        }
    }

    // --- Load from Firebase ---
    function loadFromFirebase() {
        // Dynamic import to keep it lightweight
        import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js').then(function(firebaseApp) {
            import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js').then(function(firebaseDB) {
                var config = {
                    apiKey: "AIzaSyDuynSBIWoQYcuyRYEjXEZ8qhnbMMU0pfE",
                    databaseURL: "https://kael-85f70-default-rtdb.firebaseio.com",
                    projectId: "kael-85f70"
                };
                var app = firebaseApp.initializeApp(config, 'wheel-reader');
                var db = firebaseDB.getDatabase(app);
                var wheelRef = firebaseDB.ref(db, 'lucky_wheel');

                firebaseDB.onValue(wheelRef, function(snapshot) {
                    var data = snapshot.val();
                    if (data && data.length > 0) {
                        wheelProducts = data;
                    } else {
                        wheelProducts = defaultProducts;
                    }
                    // Initial build
                    buildStrip(wheelProducts, 4);
                    updateSpinsUI();
                });
            });
        }).catch(function() {
            // Fallback to defaults
            wheelProducts = defaultProducts;
            buildStrip(wheelProducts, 4);
            updateSpinsUI();
        });
    }

    // --- Init ---
    function init() {
        // Bind spin button
        var btn = document.getElementById('wheel-spin-btn');
        if (btn) btn.addEventListener('click', spin);

        // Bind close popup
        var closeBtn = document.getElementById('wheel-win-close');
        if (closeBtn) closeBtn.addEventListener('click', closeWinPopup);

        var overlay = document.getElementById('wheel-win-overlay');
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) closeWinPopup();
            });
        }

        // Load products
        loadFromFirebase();
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
