/* ==========================================
   🎰 Lucky Wheel v4 - BULLETPROOF
   Single CSS transition, zero glitch
   ========================================== */
(function() {
    'use strict';

    var STORAGE_KEY = 'kael_wheel_spins';
    var MAX_SPINS = 3;
    var CURRENCY = 'ج.م';
    var wheelProducts = [];
    var isSpinning = false;
    var audioCtx = null;

    var defaultProducts = [
        { name: 'ساعة كلاسيكية', image: 'assets/img/product01.png', originalPrice: '350', wheelPrice: '280', weight: 15, promoCode: '' },
        { name: 'سوار ذهبي', image: 'assets/img/product02.png', originalPrice: '120', wheelPrice: '85', weight: 25, promoCode: '' },
        { name: 'طقم هدايا فاخر', image: 'assets/img/product03.png', originalPrice: '500', wheelPrice: '399', weight: 10, promoCode: '' },
        { name: 'كوبون خصم 10%', image: 'assets/img/logo.png', originalPrice: '50', wheelPrice: '0', weight: 30, promoCode: '' },
        { name: 'نظارة شمسية', image: 'assets/img/product01.png', originalPrice: '200', wheelPrice: '150', weight: 20, promoCode: '' }
    ];

    /* ---- SOUND ---- */
    function initAudio() {
        if (audioCtx) return;
        try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    }
    function playTick() {
        if (!audioCtx) return;
        try {
            var osc = audioCtx.createOscillator();
            var g = audioCtx.createGain();
            osc.connect(g); g.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.value = 1600 + Math.random() * 500;
            g.gain.setValueAtTime(0.12, audioCtx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.05);
        } catch(e) {}
    }
    function playWin() {
        if (!audioCtx) return;
        try {
            [523,659,784,1047].forEach(function(f,i) {
                var o = audioCtx.createOscillator(), g = audioCtx.createGain();
                o.connect(g); g.connect(audioCtx.destination);
                o.type = 'sine'; o.frequency.value = f;
                g.gain.setValueAtTime(0.15, audioCtx.currentTime + i*0.12);
                g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i*0.12 + 0.25);
                o.start(audioCtx.currentTime + i*0.12);
                o.stop(audioCtx.currentTime + i*0.12 + 0.25);
            });
        } catch(e) {}
    }

    /* ---- HELPERS ---- */
    function getCardUnit() {
        var w = window.innerWidth;
        if (w <= 480) return 112;
        if (w <= 768) return 132;
        return 172;
    }
    function getSpinsLeft() {
        try {
            var d = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (!d || d.date !== new Date().toDateString()) return MAX_SPINS;
            return Math.max(0, MAX_SPINS - (d.count || 0));
        } catch(e) { return MAX_SPINS; }
    }
    function useSpin() {
        var today = new Date().toDateString(), d;
        try { d = JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch(e) { d = null; }
        if (!d || d.date !== today) d = { date: today, count: 1 };
        else d.count = (d.count || 0) + 1;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    }
    function updateSpinsUI() {
        var left = getSpinsLeft();
        var badge = document.getElementById('wheel-spins-badge');
        var btn = document.getElementById('wheel-spin-btn');
        if (badge) badge.textContent = 'لديك ' + left + ' محاولات متبقية اليوم';
        if (btn) {
            btn.disabled = left <= 0;
            btn.innerHTML = left <= 0 ? '<i class="fas fa-clock"></i> انتهت محاولاتك اليوم' : '<i class="fas fa-dice"></i> لف العجلة!';
        }
    }
    function pickWeightedRandom(products) {
        var tw = 0, i;
        for (i = 0; i < products.length; i++) tw += (parseInt(products[i].weight) || 1);
        var r = Math.random() * tw, c = 0;
        for (i = 0; i < products.length; i++) { c += (parseInt(products[i].weight) || 1); if (r <= c) return i; }
        return products.length - 1;
    }
    function shuffle(arr) {
        var a = arr.slice(), i, j, t;
        for (i = a.length - 1; i > 0; i--) { j = Math.floor(Math.random()*(i+1)); t=a[i]; a[i]=a[j]; a[j]=t; }
        return a;
    }

    /* ---- CARD ---- */
    function makeCard(p, idx) {
        var c = document.createElement('div'); c.className = 'wheel-card'; c.dataset.idx = idx;
        var img = document.createElement('img');
        img.src = p.image || 'assets/img/logo.png'; img.alt = p.name; img.width = 90; img.height = 90;
        var n = document.createElement('div'); n.className = 'wc-name'; n.textContent = p.name;
        var pr = document.createElement('div'); pr.className = 'wc-prices';
        var o = document.createElement('span'); o.className = 'wc-original'; o.textContent = p.originalPrice + ' ' + CURRENCY;
        var w = document.createElement('span'); w.className = 'wc-wheel'; w.textContent = p.wheelPrice + ' ' + CURRENCY;
        pr.appendChild(o); pr.appendChild(w);
        c.appendChild(img); c.appendChild(n); c.appendChild(pr);
        return c;
    }

    /* ---- IDLE STRIP ---- */
    function buildIdleStrip(products) {
        var strip = document.getElementById('wheel-strip');
        if (!strip || !products.length) return;
        strip.innerHTML = '';
        for (var r = 0; r < 6; r++) {
            var s = shuffle(products);
            for (var i = 0; i < s.length; i++) strip.appendChild(makeCard(s[i], i));
        }
        var cu = getCardUnit();
        var ww = (document.querySelector('.wheel-track-wrapper') || {}).offsetWidth || 400;
        strip.style.transition = 'none';
        strip.style.transform = 'translateX(-' + Math.max(0, products.length * 2 * cu - ww/2 + cu/2) + 'px)';
    }

    /* ======================================
       🎰 SPIN - SINGLE CSS TRANSITION
       No phases, no requestAnimationFrame,
       no glitches. One move, one stop.
       ====================================== */
    function spin() {
        if (isSpinning || getSpinsLeft() <= 0) return;
        initAudio();
        isSpinning = true;
        useSpin();
        updateSpinsUI();

        var btn = document.getElementById('wheel-spin-btn');
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري اللف...'; }

        var products = wheelProducts.length > 0 ? wheelProducts : defaultProducts;
        var cu = getCardUnit();
        var winIdx = pickWeightedRandom(products);
        var strip = document.getElementById('wheel-strip');
        var ww = (document.querySelector('.wheel-track-wrapper') || {}).offsetWidth || 400;

        // ---- Build strip: lots of shuffled cards, winner planted once ----
        strip.innerHTML = '';
        var winnerDomIdx = -1;
        var totalCards = 0;
        var winnerPlanted = false;
        var plantAtSet = 9; // plant winner in set 9 (far enough for long spin)

        for (var s = 0; s < 12; s++) {
            var indices = shuffle(Array.from({length: products.length}, function(_,i){return i;}));
            for (var k = 0; k < indices.length; k++) {
                // At plantAtSet, replace one card with the winner
                if (s === plantAtSet && !winnerPlanted && k === Math.floor(indices.length / 2)) {
                    strip.appendChild(makeCard(products[winIdx], winIdx));
                    winnerDomIdx = totalCards;
                    winnerPlanted = true;
                } else {
                    strip.appendChild(makeCard(products[indices[k]], indices[k]));
                }
                totalCards++;
            }
        }

        // ---- Calculate positions ----
        var centerOffset = ww / 2 - cu / 2;
        var startX = products.length * 1.5 * cu - centerOffset; // start from set ~1.5
        var endX = winnerDomIdx * cu - centerOffset;            // end at winner

        // Ensure we travel forward (endX must be > startX)
        if (endX <= startX) endX += products.length * 5 * cu;

        // ---- Set starting position (no transition) ----
        strip.style.transition = 'none';
        strip.style.transform = 'translateX(-' + startX + 'px)';
        void strip.offsetHeight; // force reflow

        // ---- Tick sound during spin ----
        var lastTickCard = Math.floor(startX / cu);
        var tickInterval = setInterval(function() {
            // Read current position from computed style
            var cs = window.getComputedStyle(strip);
            var matrix = cs.transform || cs.webkitTransform;
            if (!matrix || matrix === 'none') return;
            var vals = matrix.match(/matrix.*\((.+)\)/);
            if (!vals) return;
            var parts = vals[1].split(',');
            var currentX = Math.abs(parseFloat(parts[4]) || 0);
            var cardNow = Math.floor(currentX / cu);
            if (cardNow !== lastTickCard) {
                lastTickCard = cardNow;
                playTick();
            }
        }, 30);

        // ---- SINGLE transition: start → winner ----
        var duration = 7000; // 7 seconds total
        strip.style.transition = 'transform ' + duration + 'ms cubic-bezier(0.12, 0.8, 0.08, 1)';
        strip.style.transform = 'translateX(-' + endX + 'px)';

        // ---- When done ----
        var onDone = function() {
            clearInterval(tickInterval);
            strip.removeEventListener('transitionend', onDone);

            // Highlight winner
            var cards = strip.querySelectorAll('.wheel-card');
            if (winnerDomIdx >= 0 && cards[winnerDomIdx]) {
                cards[winnerDomIdx].classList.add('winner');
            }

            playWin();

            setTimeout(function() {
                showWinPopup(products[winIdx]);
                isSpinning = false;
                updateSpinsUI();
            }, 700);
        };

        strip.addEventListener('transitionend', onDone);

        // Safety timeout in case transitionend doesn't fire
        setTimeout(function() {
            if (isSpinning) onDone();
        }, duration + 500);
    }

    /* ---- DEAL CODE ---- */
    function generateDealCode() {
        var ch = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', c = 'KAEL-';
        for (var i = 0; i < 6; i++) c += ch.charAt(Math.floor(Math.random() * ch.length));
        return c;
    }

    /* ---- WIN POPUP ---- */
    function showWinPopup(product) {
        var ov = document.getElementById('wheel-win-overlay');
        if (!ov) return;
        var code = (product.promoCode && product.promoCode.trim()) ? product.promoCode.trim() : generateDealCode();

        var img = ov.querySelector('.wwp-img');
        var name = ov.querySelector('.wwp-name');
        var orig = ov.querySelector('.wwp-original');
        var deal = ov.querySelector('.wwp-deal');
        var codeEl = ov.querySelector('.wwp-code-value');
        var hint = ov.querySelector('.wwp-code-hint');
        var wa = ov.querySelector('.wwp-whatsapp');

        if (img) img.src = product.image || 'assets/img/logo.png';
        if (name) name.textContent = product.name;
        if (orig) orig.textContent = product.originalPrice + ' ' + CURRENCY;
        if (deal) deal.textContent = product.wheelPrice + ' ' + CURRENCY;
        if (codeEl) codeEl.textContent = code;
        if (hint) hint.textContent = (product.promoCode && product.promoCode.trim()) ? 'استخدم هذا الكود عند إتمام الشراء للحصول على الخصم!' : 'أرسل هذا الكود عبر واتساب لتفعيل العرض';

        if (wa) {
            var num = '201234567890';
            try { if (window.LylixConfig && window.LylixConfig.whatsapp) num = window.LylixConfig.whatsapp.replace(/[^0-9]/g,''); } catch(e){}
            wa.href = 'https://wa.me/' + num + '?text=' + encodeURIComponent(
                '🎰 مرحباً! ربحت عرض عجلة الحظ!\n\n📦 المنتج: ' + product.name +
                '\n💰 السعر الأصلي: ' + product.originalPrice + ' ' + CURRENCY +
                '\n🔥 سعر العرض: ' + product.wheelPrice + ' ' + CURRENCY +
                '\n🎟️ كود العرض: ' + code + '\n\nأريد الاستفادة من هذا العرض!'
            );
        }
        ov.classList.add('active');
        spawnConfetti(ov.querySelector('.wheel-win-popup'));
    }

    function closeWinPopup() { var ov = document.getElementById('wheel-win-overlay'); if (ov) ov.classList.remove('active'); }

    window.copyDealCode = function() {
        var el = document.querySelector('.wwp-code-value'); if (!el) return;
        if (navigator.clipboard) navigator.clipboard.writeText(el.textContent);
        else { var t=document.createElement('textarea'); t.value=el.textContent; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); }
        var b = document.querySelector('.wwp-copy-btn');
        if (b) { b.innerHTML='<i class="fas fa-check"></i> تم النسخ!'; setTimeout(function(){b.innerHTML='<i class="fas fa-copy"></i> نسخ الكود';},2000); }
    };

    function spawnConfetti(c) {
        if (!c) return;
        var cols = ['#C5A059','#FFD700','#fff','#d4af61','#103C2B'];
        for (var i=0;i<30;i++) {
            var p=document.createElement('div'); p.className='wheel-confetti';
            p.style.left=Math.random()*100+'%'; p.style.top=Math.random()*30+'%';
            p.style.backgroundColor=cols[Math.floor(Math.random()*cols.length)];
            p.style.animationDelay=(Math.random()*0.5)+'s'; p.style.animationDuration=(1+Math.random())+'s';
            c.appendChild(p); setTimeout(function(el){if(el.parentNode)el.parentNode.removeChild(el);},2500,p);
        }
    }

    /* ---- FIREBASE ---- */
    function loadFromFirebase() {
        import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js').then(function(fa) {
            import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js').then(function(fd) {
                var cfg = { apiKey:"AIzaSyDuynSBIWoQYcuyRYEjXEZ8qhnbMMU0pfE", databaseURL:"https://kael-85f70-default-rtdb.firebaseio.com", projectId:"kael-85f70" };
                var app; try{app=fa.initializeApp(cfg,'wheel-reader');}catch(e){app=fa.getApp('wheel-reader');}
                fd.onValue(fd.ref(fd.getDatabase(app),'lucky_wheel'), function(snap) {
                    var d = snap.val();
                    wheelProducts = (d && d.length > 0) ? d : defaultProducts;
                    buildIdleStrip(wheelProducts);
                    updateSpinsUI();
                });
            });
        }).catch(function() { wheelProducts=defaultProducts; buildIdleStrip(wheelProducts); updateSpinsUI(); });
    }

    /* ---- INIT ---- */
    function init() {
        var btn = document.getElementById('wheel-spin-btn');
        if (btn) btn.addEventListener('click', spin);
        var cl = document.getElementById('wheel-win-close');
        if (cl) cl.addEventListener('click', closeWinPopup);
        var ov = document.getElementById('wheel-win-overlay');
        if (ov) ov.addEventListener('click', function(e) { if (e.target === ov) closeWinPopup(); });
        loadFromFirebase();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
