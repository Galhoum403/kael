/* ==========================================
   🎰 Lucky Wheel / Slot Machine Logic v3
   Casino-style roulette with sound
   Kael Store - Lylix Script
   ========================================== */
(function() {
    'use strict';

    var STORAGE_KEY = 'kael_wheel_spins';
    var MAX_SPINS = 3;
    var CURRENCY = 'ج.م';

    var wheelProducts = [];
    var isSpinning = false;
    var audioCtx = null;

    // --- Default products ---
    var defaultProducts = [
        { name: 'ساعة كلاسيكية', image: 'assets/img/product01.png', originalPrice: '350', wheelPrice: '280', weight: 15, promoCode: '' },
        { name: 'سوار ذهبي', image: 'assets/img/product02.png', originalPrice: '120', wheelPrice: '85', weight: 25, promoCode: '' },
        { name: 'طقم هدايا فاخر', image: 'assets/img/product03.png', originalPrice: '500', wheelPrice: '399', weight: 10, promoCode: '' },
        { name: 'كوبون خصم 10%', image: 'assets/img/logo.png', originalPrice: '50', wheelPrice: '0', weight: 30, promoCode: '' },
        { name: 'نظارة شمسية', image: 'assets/img/product01.png', originalPrice: '200', wheelPrice: '150', weight: 20, promoCode: '' }
    ];

    // ==========================================
    //  SOUND ENGINE (Web Audio API - no files!)
    // ==========================================
    function initAudio() {
        if (audioCtx) return;
        try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch(e) { audioCtx = null; }
    }

    // Short tick/click sound - like roulette ball hitting pegs
    function playTick(volume) {
        if (!audioCtx) return;
        try {
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.value = 1800 + Math.random() * 400; // slight pitch variation
            gain.gain.setValueAtTime(Math.min(volume || 0.15, 0.3), audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.06);
        } catch(e) {}
    }

    // Win jingle - ascending notes
    function playWinSound() {
        if (!audioCtx) return;
        try {
            var notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
            for (var i = 0; i < notes.length; i++) {
                (function(freq, delay) {
                    var osc = audioCtx.createOscillator();
                    var gain = audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.type = 'sine';
                    osc.frequency.value = freq;
                    gain.gain.setValueAtTime(0.2, audioCtx.currentTime + delay);
                    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + 0.3);
                    osc.start(audioCtx.currentTime + delay);
                    osc.stop(audioCtx.currentTime + delay + 0.3);
                })(notes[i], i * 0.12);
            }
        } catch(e) {}
    }

    // ==========================================
    //  CARD UNIT
    // ==========================================
    function getCardUnit() {
        var w = window.innerWidth;
        if (w <= 480) return 112;
        if (w <= 768) return 132;
        return 172;
    }

    // ==========================================
    //  SPINS (localStorage)
    // ==========================================
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
        try { var raw = localStorage.getItem(STORAGE_KEY); data = raw ? JSON.parse(raw) : null; }
        catch(e) { data = null; }
        if (!data || data.date !== today) data = { date: today, count: 1 };
        else data.count = (data.count || 0) + 1;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    function updateSpinsUI() {
        var left = getSpinsLeft();
        var badge = document.getElementById('wheel-spins-badge');
        var btn = document.getElementById('wheel-spin-btn');
        if (badge) badge.textContent = 'لديك ' + left + ' محاولات متبقية اليوم';
        if (btn) {
            if (left <= 0) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-clock"></i> انتهت محاولاتك اليوم'; }
            else { btn.disabled = false; btn.innerHTML = '<i class="fas fa-dice"></i> لف العجلة!'; }
        }
    }

    // ==========================================
    //  WEIGHTED RANDOM
    // ==========================================
    function pickWeightedRandom(products) {
        var totalWeight = 0;
        for (var i = 0; i < products.length; i++) totalWeight += (parseInt(products[i].weight) || 1);
        var rand = Math.random() * totalWeight;
        var cumulative = 0;
        for (var j = 0; j < products.length; j++) {
            cumulative += (parseInt(products[j].weight) || 1);
            if (rand <= cumulative) return j;
        }
        return products.length - 1;
    }

    // ==========================================
    //  SHUFFLE
    // ==========================================
    function shuffleArray(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
        }
        return a;
    }

    // ==========================================
    //  CARD BUILDER
    // ==========================================
    function makeCard(product, origIndex) {
        var card = document.createElement('div');
        card.className = 'wheel-card';
        card.setAttribute('data-product-index', origIndex);

        var img = document.createElement('img');
        img.src = product.image || 'assets/img/logo.png';
        img.alt = product.name;
        img.loading = 'eager';
        img.width = 90; img.height = 90;

        var nameEl = document.createElement('div');
        nameEl.className = 'wc-name';
        nameEl.textContent = product.name;

        var pricesEl = document.createElement('div');
        pricesEl.className = 'wc-prices';
        var origEl = document.createElement('span');
        origEl.className = 'wc-original';
        origEl.textContent = product.originalPrice + ' ' + CURRENCY;
        var wheelEl = document.createElement('span');
        wheelEl.className = 'wc-wheel';
        wheelEl.textContent = product.wheelPrice + ' ' + CURRENCY;

        pricesEl.appendChild(origEl);
        pricesEl.appendChild(wheelEl);
        card.appendChild(img);
        card.appendChild(nameEl);
        card.appendChild(pricesEl);
        return card;
    }

    // ==========================================
    //  BUILD STRIP (shuffled, with winner planted)
    // ==========================================
    var winnerDomIndex = -1;

    function buildSpinStrip(products, winnerIdx) {
        var strip = document.getElementById('wheel-strip');
        if (!strip || !products.length) return;
        strip.innerHTML = '';
        winnerDomIndex = -1;

        // 14 shuffled sets = tons of cards for long smooth spin
        var totalSets = 14;
        var winnerSet = 10; // plant winner in set 10

        for (var s = 0; s < totalSets; s++) {
            var indices = [];
            for (var n = 0; n < products.length; n++) indices.push(n);
            indices = shuffleArray(indices);
            for (var k = 0; k < indices.length; k++) {
                var idx = indices[k];
                var card = makeCard(products[idx], idx);
                strip.appendChild(card);
            }
        }

        // Plant the winner card at a specific position in winnerSet
        var allCards = strip.querySelectorAll('.wheel-card');
        var setSize = products.length;
        var slotInSet = Math.floor(Math.random() * setSize);
        var targetDomIdx = winnerSet * setSize + slotInSet;

        if (allCards[targetDomIdx]) {
            var winCard = makeCard(products[winnerIdx], winnerIdx);
            winCard.setAttribute('data-winner', '1');
            strip.replaceChild(winCard, allCards[targetDomIdx]);
            winnerDomIndex = targetDomIdx;
        }

        return strip;
    }

    function buildIdleStrip(products) {
        var strip = document.getElementById('wheel-strip');
        if (!strip || !products.length) return;
        strip.innerHTML = '';
        for (var r = 0; r < 6; r++) {
            var shuffled = shuffleArray(products);
            for (var i = 0; i < shuffled.length; i++) {
                strip.appendChild(makeCard(shuffled[i], i));
            }
        }
        var cardUnit = getCardUnit();
        var ww = (document.querySelector('.wheel-track-wrapper') || {}).offsetWidth || 400;
        var off = products.length * 2 * cardUnit - ww / 2 + cardUnit / 2;
        strip.style.transition = 'none';
        strip.style.transform = 'translateX(-' + Math.max(0, off) + 'px)';
    }

    // ==========================================
    //  🎰 CASINO SPIN (requestAnimationFrame)
    // ==========================================
    function spin() {
        if (isSpinning) return;
        if (getSpinsLeft() <= 0) return;

        initAudio(); // init on user gesture
        isSpinning = true;
        useSpin();
        updateSpinsUI();

        var btn = document.getElementById('wheel-spin-btn');
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري اللف...'; }

        var products = wheelProducts.length > 0 ? wheelProducts : defaultProducts;
        var cardUnit = getCardUnit();
        var winnerIdx = pickWeightedRandom(products);

        // Build strip with winner planted
        buildSpinStrip(products, winnerIdx);

        var strip = document.getElementById('wheel-strip');
        var ww = (document.querySelector('.wheel-track-wrapper') || {}).offsetWidth || 400;
        var centerOffset = ww / 2 - cardUnit / 2;

        // Start position (from set 1)
        var startPos = products.length * 1 * cardUnit - centerOffset;
        startPos = Math.max(0, startPos);

        // Target: center the winner card
        var targetPos = winnerDomIndex * cardUnit - centerOffset;
        targetPos = Math.max(0, targetPos);

        // Total travel distance
        var totalDistance = targetPos - startPos;
        if (totalDistance < 0) totalDistance += products.length * 14 * cardUnit;

        // Physics parameters
        var currentPos = startPos;
        var velocity = 45 + Math.random() * 10;   // initial speed (px per frame ~60fps)
        var friction = 0.985;                       // gradual slowdown
        var minVelocity = 0.3;                      // when to stop

        // Track ticks for sound
        var lastCardIndex = Math.floor(currentPos / cardUnit);

        // Start animation
        strip.style.transition = 'none';
        strip.style.transform = 'translateX(-' + currentPos + 'px)';

        var distanceTraveled = 0;
        var targetReached = false;

        function animate() {
            if (targetReached) return;

            // Move
            currentPos += velocity;
            distanceTraveled += velocity;

            // Apply friction - start slowing down after traveling 60% of total distance
            if (distanceTraveled > totalDistance * 0.55) {
                friction = 0.978; // stronger friction
            }
            if (distanceTraveled > totalDistance * 0.80) {
                friction = 0.965; // even stronger near the end
            }
            if (distanceTraveled > totalDistance * 0.92) {
                friction = 0.950; // dramatic final slowdown
            }

            velocity *= friction;

            // Tick sound when passing card boundaries
            var currentCardIdx = Math.floor(currentPos / cardUnit);
            if (currentCardIdx !== lastCardIndex) {
                lastCardIndex = currentCardIdx;
                var vol = Math.min(velocity / 30, 0.25);
                playTick(vol);
            }

            // Apply position
            strip.style.transform = 'translateX(-' + currentPos + 'px)';

            // Check if we should stop
            if (velocity < minVelocity && distanceTraveled >= totalDistance * 0.9) {
                // Snap exactly to winner
                targetReached = true;
                var snapDist = targetPos - currentPos;

                // Smooth final snap
                strip.style.transition = 'transform 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                strip.style.transform = 'translateX(-' + targetPos + 'px)';

                setTimeout(function() {
                    strip.style.transition = 'none';
                    // Highlight winner
                    var allCards = strip.querySelectorAll('.wheel-card');
                    if (winnerDomIndex >= 0 && allCards[winnerDomIndex]) {
                        allCards[winnerDomIndex].classList.add('winner');
                    }
                    playWinSound();
                    setTimeout(function() {
                        showWinPopup(products[winnerIdx]);
                        isSpinning = false;
                        updateSpinsUI();
                    }, 800);
                }, 650);

                return;
            }

            // Safety: if traveled way too far, force stop
            if (distanceTraveled > totalDistance * 1.5) {
                velocity = minVelocity * 0.5;
            }

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }

    // ==========================================
    //  DEAL CODE
    // ==========================================
    function generateDealCode() {
        var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        var code = 'KAEL-';
        for (var i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        return code;
    }

    // ==========================================
    //  WIN POPUP
    // ==========================================
    function showWinPopup(product) {
        var overlay = document.getElementById('wheel-win-overlay');
        if (!overlay) return;

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

        if (popupHint) {
            if (product.promoCode && product.promoCode.trim()) {
                popupHint.textContent = 'استخدم هذا الكود عند إتمام الشراء للحصول على الخصم!';
            } else {
                popupHint.textContent = 'أرسل هذا الكود عبر واتساب لتفعيل العرض';
            }
        }

        if (popupWhatsapp) {
            var waNumber = '201234567890';
            try { if (window.LylixConfig && window.LylixConfig.whatsapp) waNumber = window.LylixConfig.whatsapp.replace(/[^0-9]/g, ''); } catch(e) {}
            var msg = '🎰 مرحباً! ربحت عرض عجلة الحظ!\n\n' +
                      '📦 المنتج: ' + product.name + '\n' +
                      '💰 السعر الأصلي: ' + product.originalPrice + ' ' + CURRENCY + '\n' +
                      '🔥 سعر العرض: ' + product.wheelPrice + ' ' + CURRENCY + '\n' +
                      '🎟️ كود العرض: ' + dealCode + '\n\n' +
                      'أريد الاستفادة من هذا العرض!';
            popupWhatsapp.href = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(msg);
        }

        overlay.classList.add('active');
        spawnConfetti(overlay.querySelector('.wheel-win-popup'));
    }

    function closeWinPopup() {
        var overlay = document.getElementById('wheel-win-overlay');
        if (overlay) overlay.classList.remove('active');
    }

    window.copyDealCode = function() {
        var codeEl = document.querySelector('.wwp-code-value');
        if (!codeEl) return;
        var code = codeEl.textContent;
        if (navigator.clipboard) navigator.clipboard.writeText(code);
        else { var ta = document.createElement('textarea'); ta.value = code; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); }
        var copyBtn = document.querySelector('.wwp-copy-btn');
        if (copyBtn) { copyBtn.innerHTML = '<i class="fas fa-check"></i> تم النسخ!'; setTimeout(function() { copyBtn.innerHTML = '<i class="fas fa-copy"></i> نسخ الكود'; }, 2000); }
    };

    function spawnConfetti(container) {
        if (!container) return;
        var colors = ['#C5A059', '#FFD700', '#fff', '#d4af61', '#103C2B'];
        for (var i = 0; i < 30; i++) {
            var p = document.createElement('div');
            p.className = 'wheel-confetti';
            p.style.left = Math.random() * 100 + '%';
            p.style.top = Math.random() * 30 + '%';
            p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            p.style.animationDelay = (Math.random() * 0.5) + 's';
            p.style.animationDuration = (1 + Math.random()) + 's';
            container.appendChild(p);
            setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 2500, p);
        }
    }

    // ==========================================
    //  FIREBASE LOAD
    // ==========================================
    function loadFromFirebase() {
        import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js').then(function(firebaseApp) {
            import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js').then(function(firebaseDB) {
                var config = { apiKey: "AIzaSyDuynSBIWoQYcuyRYEjXEZ8qhnbMMU0pfE", databaseURL: "https://kael-85f70-default-rtdb.firebaseio.com", projectId: "kael-85f70" };
                var app;
                try { app = firebaseApp.initializeApp(config, 'wheel-reader'); }
                catch(e) { app = firebaseApp.getApp('wheel-reader'); }
                var db = firebaseDB.getDatabase(app);
                var wheelRef = firebaseDB.ref(db, 'lucky_wheel');
                firebaseDB.onValue(wheelRef, function(snapshot) {
                    var data = snapshot.val();
                    wheelProducts = (data && data.length > 0) ? data : defaultProducts;
                    buildIdleStrip(wheelProducts);
                    updateSpinsUI();
                });
            });
        }).catch(function() {
            wheelProducts = defaultProducts;
            buildIdleStrip(wheelProducts);
            updateSpinsUI();
        });
    }

    // ==========================================
    //  INIT
    // ==========================================
    function init() {
        var btn = document.getElementById('wheel-spin-btn');
        if (btn) btn.addEventListener('click', spin);

        var closeBtn = document.getElementById('wheel-win-close');
        if (closeBtn) closeBtn.addEventListener('click', closeWinPopup);

        var overlay = document.getElementById('wheel-win-overlay');
        if (overlay) overlay.addEventListener('click', function(e) { if (e.target === overlay) closeWinPopup(); });

        loadFromFirebase();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
