/* ==========================================
   🎰 Lucky Wheel v7 - THE PERFECT SPIN
   Dynamically measures actual DOM width
   Flawless transition timing & accurate sound
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

    // ===== SOUND ENGINE =====
    function initAudio() {
        if (audioCtx && audioCtx.state !== 'suspended') return;
        try { 
            var AC = window.AudioContext || window.webkitAudioContext;
            if(AC) {
                audioCtx = new AC(); 
                if(audioCtx.state === 'suspended') audioCtx.resume();
            }
        } catch(e) {}
    }
    
    // Very lightweight tick to prevent dropping audio
    function tick() {
        if (!audioCtx) return;
        try {
            var t = audioCtx.currentTime;
            var o = audioCtx.createOscillator();
            var g = audioCtx.createGain();
            o.connect(g);
            g.connect(audioCtx.destination);
            o.type = 'sine';
            o.frequency.setValueAtTime(1400 + Math.random() * 200, t);
            g.gain.setValueAtTime(0.08, t); // lower volume to avoid distortion
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
            o.start(t);
            o.stop(t + 0.05);
        } catch(e) {}
    }

    function winSound() {
        if (!audioCtx) return;
        try {
            var t = audioCtx.currentTime;
            [523, 659, 784, 1047].forEach(function(f, i) {
                var o = audioCtx.createOscillator();
                var g = audioCtx.createGain();
                o.connect(g);
                g.connect(audioCtx.destination);
                o.type = 'triangle';
                o.frequency.setValueAtTime(f, t + i * 0.12);
                g.gain.setValueAtTime(0.15, t + i * 0.12);
                g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.3);
                o.start(t + i * 0.12);
                o.stop(t + i * 0.12 + 0.3);
            });
        } catch(e) {}
    }

    // Mathematical simulation of the CSS cubic-bezier(0.12, 0.8, 0.08, 1)
    function scheduleTicks(totalCards, durationMs) {
        var tickTimes = [];
        var interval = 20; // 20ms starting speed
        var elapsed = 0;
        
        for (var i = 0; i < totalCards; i++) {
            if (elapsed > durationMs - 400) break; // Don't tick at the very end
            tickTimes.push(elapsed);
            
            // Speed curve approximation
            var progress = elapsed / durationMs;
            if (progress < 0.2) interval = 20 + (progress * 50);
            else if (progress < 0.5) interval = 30 + ((progress - 0.2) * 150);
            else if (progress < 0.75) interval = 75 + ((progress - 0.5) * 300);
            else if (progress < 0.9) interval = 150 + ((progress - 0.75) * 800);
            else interval = 250 + ((progress - 0.9) * 2000);
            
            elapsed += interval;
        }

        tickTimes.forEach(function(time) {
            setTimeout(tick, time);
        });
    }

    // ===== SPINS STATE =====
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
    function pickWinner(products) {
        var tw = 0, i; 
        for (i = 0; i < products.length; i++) tw += (parseInt(products[i].weight) || 1);
        var r = Math.random() * tw, c = 0;
        for (i = 0; i < products.length; i++) { 
            c += (parseInt(products[i].weight) || 1); 
            if (r <= c) return i; 
        }
        return products.length - 1;
    }

    // ===== DOM MEASUREMENT =====
    // This dynamically reads the EXACT rendered size of a card + its gap.
    // It solves the mismatch issue permanently.
    function getExactCardUnit() {
        var strip = document.getElementById('wheel-strip');
        if (!strip) return 172; // fallback
        var cards = strip.querySelectorAll('.wheel-card');
        if (cards.length < 2) return 172;
        
        var rect1 = cards[0].getBoundingClientRect();
        var rect2 = cards[1].getBoundingClientRect();
        
        // Distance from start of card 1 to start of card 2 = exactly one unit (card + gap)
        var unit = rect2.left - rect1.left;
        
        // If they wrap (which they shouldn't in a flex row), fallback to width + computed gap
        if (unit <= 0 || unit > 500) {
            var gap = parseFloat(window.getComputedStyle(strip).gap) || 12;
            return rect1.width + gap;
        }
        return unit;
    }

    // ===== CARD GENERATOR =====
    function makeCard(p) {
        var c = document.createElement('div'); 
        c.className = 'wheel-card';
        var img = document.createElement('img'); 
        img.src = p.image || 'assets/img/logo.png'; 
        img.alt = p.name; 
        img.width = 90; 
        img.height = 90;
        var n = document.createElement('div'); 
        n.className = 'wc-name'; 
        n.textContent = p.name;
        var pr = document.createElement('div'); 
        pr.className = 'wc-prices';
        var o = document.createElement('span'); 
        o.className = 'wc-original'; 
        o.textContent = p.originalPrice + ' ' + CURRENCY;
        var w = document.createElement('span'); 
        w.className = 'wc-wheel'; 
        w.textContent = p.wheelPrice + ' ' + CURRENCY;
        pr.appendChild(o); 
        pr.appendChild(w);
        c.appendChild(img); 
        c.appendChild(n); 
        c.appendChild(pr);
        return c;
    }

    function buildStrip(products, reps) {
        var strip = document.getElementById('wheel-strip');
        if (!strip) return;
        strip.innerHTML = '';
        strip.style.transition = 'none'; // Ensure no transition during build
        
        for (var r = 0; r < reps; r++) {
            for (var i = 0; i < products.length; i++) {
                strip.appendChild(makeCard(products[i]));
            }
        }
    }

    function buildIdleStrip(products) {
        buildStrip(products, 6);
        // We need to wait for layout to measure properly
        requestAnimationFrame(function() {
            var strip = document.getElementById('wheel-strip');
            if (!strip) return;
            var cu = getExactCardUnit();
            var cardWidth = strip.querySelector('.wheel-card') ? strip.querySelector('.wheel-card').getBoundingClientRect().width : cu;
            var ww = (document.querySelector('.wheel-track-wrapper') || {}).offsetWidth || 400;
            
            // Center the middle of the set
            var centerOffset = (ww / 2) - (cardWidth / 2);
            var offset = (products.length * 2 * cu) - centerOffset;
            
            strip.style.transform = 'translateX(-' + offset + 'px)';
        });
    }

    // ===== 🎰 SPIN ENGINE =====
    function spin() {
        if (isSpinning || getSpinsLeft() <= 0) return;
        initAudio();
        isSpinning = true;
        
        var btn = document.getElementById('wheel-spin-btn');
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري اللف...'; }

        var products = wheelProducts.length > 0 ? wheelProducts : defaultProducts;
        var n = products.length;
        var winIdx = pickWinner(products);

        // 1. Build strip fresh with 15 repetitions (plenty of track)
        buildStrip(products, 15);

        var strip = document.getElementById('wheel-strip');
        
        // 2. Measure actual dimensions AFTER building
        requestAnimationFrame(function() {
            var cu = getExactCardUnit();
            var firstCard = strip.querySelector('.wheel-card');
            var cardWidth = firstCard ? firstCard.getBoundingClientRect().width : cu;
            
            var ww = (document.querySelector('.wheel-track-wrapper') || {}).offsetWidth || 400;
            var centerOffset = (ww / 2) - (cardWidth / 2);

            // Start position (at end of 1st repetition)
            var startX = (n * 1 * cu) - centerOffset;
            
            // End position (Target winner in 11th repetition)
            var winDomIdx = (11 * n) + winIdx;
            var endX = (winDomIdx * cu) - centerOffset;

            // 3. Teleport to start position
            strip.style.transition = 'none';
            strip.style.transform = 'translateX(-' + startX + 'px)';

            // 4. Force reflow safely to ensure browser registers the start position
            void strip.offsetHeight;

            // 5. Start animation on NEXT frame
            requestAnimationFrame(function() {
                var DURATION = 6500;
                var cardsTravel = winDomIdx - (n * 1);
                scheduleTicks(cardsTravel, DURATION);

                // Start the CSS transition
                strip.style.transition = 'transform ' + DURATION + 'ms cubic-bezier(0.12, 0.8, 0.08, 1)';
                strip.style.transform = 'translateX(-' + endX + 'px)';

                // Cleanup & Popup after animation
                setTimeout(function() {
                    // Safety: clear transition so next spin works perfectly
                    strip.style.transition = 'none';
                    
                    var cards = strip.querySelectorAll('.wheel-card');
                    if (cards[winDomIdx]) {
                        cards[winDomIdx].classList.add('winner');
                    }
                    
                    winSound();

                    setTimeout(function() {
                        useSpin(); // Deduct spin only after successful run
                        showWinPopup(products[winIdx]);
                        isSpinning = false;
                        updateSpinsUI();
                    }, 800);
                    
                }, DURATION + 100);
            });
        });
    }

    // ===== DEAL CODE & POPUP =====
    function generateDealCode() {
        var ch='ABCDEFGHJKLMNPQRSTUVWXYZ23456789', c='KAEL-';
        for(var i=0;i<6;i++) c+=ch.charAt(Math.floor(Math.random()*ch.length));
        return c;
    }

    function showWinPopup(product) {
        var ov = document.getElementById('wheel-win-overlay'); 
        if (!ov) return;
        var code = (product.promoCode && product.promoCode.trim()) ? product.promoCode.trim() : generateDealCode();
        
        var el = function(s) { return ov.querySelector(s); };
        if(el('.wwp-img')) el('.wwp-img').src = product.image || 'assets/img/logo.png';
        if(el('.wwp-name')) el('.wwp-name').textContent = product.name;
        if(el('.wwp-original')) el('.wwp-original').textContent = product.originalPrice + ' ' + CURRENCY;
        if(el('.wwp-deal')) el('.wwp-deal').textContent = product.wheelPrice + ' ' + CURRENCY;
        if(el('.wwp-code-value')) el('.wwp-code-value').textContent = code;
        if(el('.wwp-code-hint')) el('.wwp-code-hint').textContent = (product.promoCode && product.promoCode.trim()) ? 'استخدم هذا الكود عند إتمام الشراء للحصول على الخصم!' : 'أرسل هذا الكود عبر واتساب لتفعيل العرض';
        
        if(el('.wwp-whatsapp')) {
            var num = '201234567890';
            try { if (window.LylixConfig && window.LylixConfig.whatsapp) num = window.LylixConfig.whatsapp.replace(/[^0-9]/g,''); } catch(e){}
            el('.wwp-whatsapp').href = 'https://wa.me/' + num + '?text=' + encodeURIComponent(
                '🎰 مرحباً! ربحت عرض عجلة الحظ!\n\n📦 المنتج: ' + product.name +
                '\n💰 السعر الأصلي: ' + product.originalPrice + ' ' + CURRENCY +
                '\n🔥 سعر العرض: ' + product.wheelPrice + ' ' + CURRENCY +
                '\n🎟️ كود العرض: ' + code + '\n\nأريد الاستفادة من هذا العرض!'
            );
        }
        
        ov.classList.add('active');
        spawnConfetti(ov.querySelector('.wheel-win-popup'));
    }

    function closeWinPopup() { 
        var ov = document.getElementById('wheel-win-overlay'); 
        if (ov) ov.classList.remove('active'); 
    }

    window.copyDealCode = function() {
        var el = document.querySelector('.wwp-code-value'); 
        if (!el) return;
        if (navigator.clipboard) navigator.clipboard.writeText(el.textContent);
        else { 
            var t = document.createElement('textarea'); 
            t.value = el.textContent; 
            document.body.appendChild(t); 
            t.select(); 
            document.execCommand('copy'); 
            document.body.removeChild(t); 
        }
        var b = document.querySelector('.wwp-copy-btn');
        if (b) { 
            b.innerHTML = '<i class="fas fa-check"></i> تم النسخ!'; 
            setTimeout(function() { b.innerHTML = '<i class="fas fa-copy"></i> نسخ الكود'; }, 2000); 
        }
    };

    function spawnConfetti(c) {
        if (!c) return; 
        var cols = ['#C5A059','#FFD700','#fff','#d4af61','#103C2B'];
        for (var i = 0; i < 30; i++) {
            var p = document.createElement('div');
            p.className = 'wheel-confetti';
            p.style.left = Math.random() * 100 + '%';
            p.style.top = Math.random() * 30 + '%';
            p.style.backgroundColor = cols[Math.floor(Math.random() * cols.length)];
            p.style.animationDelay = (Math.random() * 0.5) + 's';
            p.style.animationDuration = (1 + Math.random()) + 's';
            c.appendChild(p);
            setTimeout(function(el) { if (el.parentNode) el.parentNode.removeChild(el); }, 2500, p);
        }
    }

    // ===== FIREBASE =====
    function loadFromFirebase() {
        import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js').then(function(fa) {
            import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js').then(function(fd) {
                var cfg = { apiKey:"AIzaSyDuynSBIWoQYcuyRYEjXEZ8qhnbMMU0pfE", databaseURL:"https://kael-85f70-default-rtdb.firebaseio.com", projectId:"kael-85f70" };
                var app; 
                try { app = fa.initializeApp(cfg, 'wr'); } catch(e) { app = fa.getApp('wr'); }
                fd.onValue(fd.ref(fd.getDatabase(app), 'lucky_wheel'), function(snap) {
                    var d = snap.val(); 
                    wheelProducts = (d && d.length > 0) ? d : defaultProducts;
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

    // ===== INIT =====
    function init() {
        var btn = document.getElementById('wheel-spin-btn'); 
        if (btn) btn.addEventListener('click', spin);
        var cl = document.getElementById('wheel-win-close'); 
        if (cl) cl.addEventListener('click', closeWinPopup);
        var ov = document.getElementById('wheel-win-overlay'); 
        if (ov) ov.addEventListener('click', function(e) { if(e.target === ov) closeWinPopup(); });
        
        loadFromFirebase();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); 
    else init();

})();
