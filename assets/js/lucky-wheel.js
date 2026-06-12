/* ==========================================
   🎰 Lucky Wheel v6 - NATIVE ANIMATION API
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

    // ===== SOUND =====
    function initAudio() {
        if (audioCtx) return;
        try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    }
    function tick() {
        if (!audioCtx) return;
        try {
            var o = audioCtx.createOscillator(), g = audioCtx.createGain();
            o.connect(g); g.connect(audioCtx.destination);
            o.type = 'sine'; o.frequency.value = 1600 + Math.random() * 400;
            g.gain.setValueAtTime(0.1, audioCtx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
            o.start(); o.stop(audioCtx.currentTime + 0.04);
        } catch(e) {}
    }
    function winSound() {
        if (!audioCtx) return;
        try {
            [523,659,784,1047].forEach(function(f,i) {
                var o=audioCtx.createOscillator(), g=audioCtx.createGain();
                o.connect(g); g.connect(audioCtx.destination); o.type='sine'; o.frequency.value=f;
                var t = audioCtx.currentTime + i * 0.12;
                g.gain.setValueAtTime(0.15, t);
                g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
                o.start(t); o.stop(t + 0.25);
            });
        } catch(e) {}
    }

    function scheduleTicks(totalCards, durationMs) {
        var t = 0, interval = 30;
        for (var i = 0; i < totalCards && t < durationMs - 500; i++) {
            setTimeout(tick, t);
            var progress = t / durationMs;
            if (progress < 0.3) interval = 30 + progress * 50;
            else if (progress < 0.6) interval = 50 + (progress - 0.3) * 200;
            else if (progress < 0.85) interval = 110 + (progress - 0.6) * 600;
            else interval = 260 + (progress - 0.85) * 1500;
            t += interval;
        }
    }

    // ===== HELPERS =====
    function getCardUnit() {
        var w = window.innerWidth;
        return w <= 480 ? 112 : w <= 768 ? 132 : 172;
    }
    function getSpinsLeft() {
        try { var d=JSON.parse(localStorage.getItem(STORAGE_KEY)); if(!d||d.date!==new Date().toDateString()) return MAX_SPINS; return Math.max(0,MAX_SPINS-(d.count||0)); } catch(e){return MAX_SPINS;}
    }
    function useSpin() {
        var today=new Date().toDateString(), d;
        try{d=JSON.parse(localStorage.getItem(STORAGE_KEY));}catch(e){d=null;}
        if(!d||d.date!==today)d={date:today,count:1}; else d.count=(d.count||0)+1;
        localStorage.setItem(STORAGE_KEY,JSON.stringify(d));
    }
    function updateSpinsUI() {
        var left=getSpinsLeft(), badge=document.getElementById('wheel-spins-badge'), btn=document.getElementById('wheel-spin-btn');
        if(badge) badge.textContent='لديك '+left+' محاولات متبقية اليوم';
        if(btn){btn.disabled=left<=0; btn.innerHTML=left<=0?'<i class="fas fa-clock"></i> انتهت محاولاتك اليوم':'<i class="fas fa-dice"></i> لف العجلة!';}
    }
    function pickWinner(products) {
        var tw=0,i; for(i=0;i<products.length;i++) tw+=(parseInt(products[i].weight)||1);
        var r=Math.random()*tw, c=0;
        for(i=0;i<products.length;i++){c+=(parseInt(products[i].weight)||1); if(r<=c) return i;}
        return products.length-1;
    }

    // ===== CARD =====
    function makeCard(p) {
        var c=document.createElement('div'); c.className='wheel-card';
        var img=document.createElement('img'); img.src=p.image||'assets/img/logo.png'; img.alt=p.name; img.width=90; img.height=90;
        var n=document.createElement('div'); n.className='wc-name'; n.textContent=p.name;
        var pr=document.createElement('div'); pr.className='wc-prices';
        var o=document.createElement('span'); o.className='wc-original'; o.textContent=p.originalPrice+' '+CURRENCY;
        var w=document.createElement('span'); w.className='wc-wheel'; w.textContent=p.wheelPrice+' '+CURRENCY;
        pr.appendChild(o); pr.appendChild(w);
        c.appendChild(img); c.appendChild(n); c.appendChild(pr);
        return c;
    }

    // ===== BUILD STRIP =====
    function buildStrip(products, reps) {
        var strip = document.getElementById('wheel-strip');
        if (!strip) return;
        strip.innerHTML = '';
        for (var r = 0; r < reps; r++) {
            for (var i = 0; i < products.length; i++) {
                strip.appendChild(makeCard(products[i]));
            }
        }
    }

    function buildIdleStrip(products) {
        buildStrip(products, 6);
        var strip = document.getElementById('wheel-strip');
        var cu = getCardUnit();
        var ww = (document.querySelector('.wheel-track-wrapper')||{}).offsetWidth||400;
        strip.style.transform = 'translateX(-'+(products.length*2*cu - ww/2 + cu/2)+'px)';
    }

    // ===== 🎰 SPIN =====
    function spin() {
        if (isSpinning || getSpinsLeft() <= 0) return;
        initAudio();
        isSpinning = true;
        useSpin();
        updateSpinsUI();

        var btn = document.getElementById('wheel-spin-btn');
        if(btn){btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> جاري اللف...';}

        var products = wheelProducts.length > 0 ? wheelProducts : defaultProducts;
        var cu = getCardUnit();
        var n = products.length;
        var winIdx = pickWinner(products);

        // Build 15 repetitions
        var reps = 15;
        buildStrip(products, reps);

        var strip = document.getElementById('wheel-strip');
        var ww = (document.querySelector('.wheel-track-wrapper')||{}).offsetWidth||400;
        var center = ww / 2 - cu / 2;

        var startX = n * 1 * cu - center;
        var winDomIdx = 11 * n + winIdx;
        var endX = winDomIdx * cu - center;

        // Reset any inline CSS transitions
        strip.style.transition = 'none';

        var cardsTravel = Math.floor((endX - startX) / cu);
        var DURATION = 7000;
        scheduleTicks(cardsTravel, DURATION);

        // NATIVE WEB ANIMATION API - NO GLITCHES
        var animation = strip.animate([
            { transform: 'translateX(-' + startX + 'px)' },
            { transform: 'translateX(-' + endX + 'px)' }
        ], {
            duration: DURATION,
            easing: 'cubic-bezier(0.12, 0.8, 0.08, 1)',
            fill: 'forwards'
        });

        animation.onfinish = function() {
            var cards = strip.querySelectorAll('.wheel-card');
            if (cards[winDomIdx]) cards[winDomIdx].classList.add('winner');
            winSound();

            setTimeout(function() {
                showWinPopup(products[winIdx]);
                isSpinning = false;
                updateSpinsUI();
            }, 700);
        };
    }

    // ===== DEAL CODE =====
    function generateDealCode() {
        var ch='ABCDEFGHJKLMNPQRSTUVWXYZ23456789', c='KAEL-';
        for(var i=0;i<6;i++) c+=ch.charAt(Math.floor(Math.random()*ch.length));
        return c;
    }

    // ===== WIN POPUP =====
    function showWinPopup(product) {
        var ov = document.getElementById('wheel-win-overlay'); if(!ov) return;
        var code = (product.promoCode && product.promoCode.trim()) ? product.promoCode.trim() : generateDealCode();
        var el = function(s){return ov.querySelector(s);};
        if(el('.wwp-img')) el('.wwp-img').src = product.image||'assets/img/logo.png';
        if(el('.wwp-name')) el('.wwp-name').textContent = product.name;
        if(el('.wwp-original')) el('.wwp-original').textContent = product.originalPrice+' '+CURRENCY;
        if(el('.wwp-deal')) el('.wwp-deal').textContent = product.wheelPrice+' '+CURRENCY;
        if(el('.wwp-code-value')) el('.wwp-code-value').textContent = code;
        if(el('.wwp-code-hint')) el('.wwp-code-hint').textContent = (product.promoCode&&product.promoCode.trim()) ? 'استخدم هذا الكود عند إتمام الشراء للحصول على الخصم!' : 'أرسل هذا الكود عبر واتساب لتفعيل العرض';
        if(el('.wwp-whatsapp')) {
            var num='201234567890';
            try{if(window.LylixConfig&&window.LylixConfig.whatsapp) num=window.LylixConfig.whatsapp.replace(/[^0-9]/g,'');}catch(e){}
            el('.wwp-whatsapp').href = 'https://wa.me/'+num+'?text='+encodeURIComponent(
                '🎰 مرحباً! ربحت عرض عجلة الحظ!\n\n📦 المنتج: '+product.name+
                '\n💰 السعر الأصلي: '+product.originalPrice+' '+CURRENCY+
                '\n🔥 سعر العرض: '+product.wheelPrice+' '+CURRENCY+
                '\n🎟️ كود العرض: '+code+'\n\nأريد الاستفادة من هذا العرض!');
        }
        ov.classList.add('active');
        spawnConfetti(ov.querySelector('.wheel-win-popup'));
    }
    function closeWinPopup(){var ov=document.getElementById('wheel-win-overlay'); if(ov) ov.classList.remove('active');}
    window.copyDealCode = function(){
        var el=document.querySelector('.wwp-code-value'); if(!el) return;
        if(navigator.clipboard) navigator.clipboard.writeText(el.textContent);
        else{var t=document.createElement('textarea');t.value=el.textContent;document.body.appendChild(t);t.select();document.execCommand('copy');document.body.removeChild(t);}
        var b=document.querySelector('.wwp-copy-btn');
        if(b){b.innerHTML='<i class="fas fa-check"></i> تم النسخ!';setTimeout(function(){b.innerHTML='<i class="fas fa-copy"></i> نسخ الكود';},2000);}
    };
    function spawnConfetti(c){
        if(!c) return; var cols=['#C5A059','#FFD700','#fff','#d4af61','#103C2B'];
        for(var i=0;i<30;i++){var p=document.createElement('div');p.className='wheel-confetti';p.style.left=Math.random()*100+'%';p.style.top=Math.random()*30+'%';p.style.backgroundColor=cols[Math.floor(Math.random()*cols.length)];p.style.animationDelay=(Math.random()*0.5)+'s';p.style.animationDuration=(1+Math.random())+'s';c.appendChild(p);setTimeout(function(el){if(el.parentNode)el.parentNode.removeChild(el);},2500,p);}
    }

    // ===== FIREBASE =====
    function loadFromFirebase() {
        import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js').then(function(fa) {
            import('https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js').then(function(fd) {
                var cfg={apiKey:"AIzaSyDuynSBIWoQYcuyRYEjXEZ8qhnbMMU0pfE",databaseURL:"https://kael-85f70-default-rtdb.firebaseio.com",projectId:"kael-85f70"};
                var app; try{app=fa.initializeApp(cfg,'wr');}catch(e){app=fa.getApp('wr');}
                fd.onValue(fd.ref(fd.getDatabase(app),'lucky_wheel'),function(snap){
                    var d=snap.val(); wheelProducts=(d&&d.length>0)?d:defaultProducts;
                    buildIdleStrip(wheelProducts); updateSpinsUI();
                });
            });
        }).catch(function(){wheelProducts=defaultProducts; buildIdleStrip(wheelProducts); updateSpinsUI();});
    }

    // ===== INIT =====
    function init(){
        var btn=document.getElementById('wheel-spin-btn'); if(btn) btn.addEventListener('click',spin);
        var cl=document.getElementById('wheel-win-close'); if(cl) cl.addEventListener('click',closeWinPopup);
        var ov=document.getElementById('wheel-win-overlay'); if(ov) ov.addEventListener('click',function(e){if(e.target===ov) closeWinPopup();});
        loadFromFirebase();
    }
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
