
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
        import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
        import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

        const firebaseConfig = {
            apiKey: "AIzaSyDuynSBIWoQYcuyRYEjXEZ8qhnbMMU0pfE",
            authDomain: "kael-85f70.firebaseapp.com",
            databaseURL: "https://kael-85f70-default-rtdb.firebaseio.com",
            projectId: "kael-85f70",
            storageBucket: "kael-85f70.firebasestorage.app",
            messagingSenderId: "446946602490",
            appId: "1:446946602490:web:bf875962bb4e6bb03f8843"
        };

        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);
        const auth = getAuth(app);
        const sliderRef = ref(db, 'slider_images');
        const wheelRef = ref(db, 'lucky_wheel');
        const configRef = ref(db, 'kael_config');

        // Load config
        onValue(configRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.seasonal_theme) {
                document.getElementById('theme-toggle').checked = true;
            } else {
                document.getElementById('theme-toggle').checked = false;
            }
        });

        // --- 1. Auth State Listener ---
        onAuthStateChanged(auth, (user) => {
            if (user) {
                document.getElementById('login-screen').style.display = 'none';
                window.loadData();
                document.getElementById('db-status').innerText = 'متصل كـ: ' + user.email;
                document.getElementById('db-status').classList.replace('bg-danger', 'bg-success');
                document.getElementById('db-status').classList.replace('bg-warning', 'bg-success');
            } else {
                document.getElementById('login-screen').style.display = 'flex';
                document.getElementById('db-status').innerText = 'غير متصل';
                document.getElementById('db-status').className = 'badge bg-danger ms-2';
            }
        });

        // --- 2. Login Logic ---
        window.checkLogin = function() {
            let email = document.getElementById('admin-email').value;
            let pass = document.getElementById('admin-pass').value;
            let btn = document.getElementById('login-btn');
            
            if(!email || !pass) return;

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الدخول...';
            btn.disabled = true;
            document.getElementById('login-error').style.display = 'none';

            signInWithEmailAndPassword(auth, email, pass)
                .then((userCredential) => {
                    btn.innerHTML = 'دخول';
                    btn.disabled = false;
                })
                .catch((error) => {
                    document.getElementById('login-error').style.display = 'block';
                    document.getElementById('login-error').innerText = 'البيانات غير صحيحة أو الحساب غير مسجل.';
                    btn.innerHTML = 'دخول';
                    btn.disabled = false;
                });
        };

        // --- 3. Logout Logic ---
        window.logout = function() {
            signOut(auth);
        };

        // --- 4. Data Management (Firebase DB) ---
        
        const settingsRef = ref(db, 'store_settings');
        
        window.loadData = function() {
            onValue(sliderRef, (snapshot) => {
                const data = snapshot.val();
                if(data) window.sliderData = data;
                else window.sliderData = [];
                if(typeof window.renderSlides === 'function') window.renderSlides();
            });
            // Load settings
            onValue(settingsRef, (snapshot) => {
                const data = snapshot.val();
                if(data && data.mapUrl) {
                    document.getElementById('map-url-input').value = data.mapUrl;
                }
            });
        };

        window.saveSettings = function() {
            let mapUrl = document.getElementById('map-url-input').value;
            let btn = document.querySelector('#settings-section button');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
            
            set(settingsRef, { mapUrl: mapUrl }).then(() => {
                let msg = document.getElementById('save-settings-msg');
                msg.style.display = 'inline-block';
                setTimeout(() => msg.style.display = 'none', 3000);
            }).catch((error) => {
                alert("فشل الحفظ: تأكد من الصلاحيات.");
            }).finally(() => {
                btn.innerHTML = originalText;
            });
        };


        
        window.renderSlides = function() {
            const container = document.getElementById('slides-container');
            container.innerHTML = ''; // clear
            window.sliderData.forEach((slide, index) => {
                const html = `
                    <div class="slide-item">
                        <i class="fas fa-trash delete-slide" onclick="deleteSlide(${index})"></i>
                        <div class="row">
                            <div class="col-md-6 mb-2">
                                <label>العنوان</label>
                                <input type="text" class="form-control s-title text-end" value="${slide.title || ''}">
                            </div>
                            <div class="col-md-6 mb-2">
                                <label>رابط الصورة</label>
                                <input type="text" class="form-control s-img text-end" value="${slide.img || ''}" placeholder="assets/img/product01.png">
                            </div>
                            <div class="col-md-8 mb-2">
                                <label>الوصف</label>
                                <input type="text" class="form-control s-desc text-end" value="${slide.desc || ''}">
                            </div>
                            <div class="col-md-4 mb-2">
                                <label>تاريخ انتهاء العرض (اختياري)</label>
                                <input type="datetime-local" class="form-control s-date" value="${slide.endDate || ''}">
                            </div>
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', html);
            });
        };

        window.addSlide = function() {
            window.sliderData.push({ title: '', desc: '', img: '', endDate: '' });
            window.renderSlides();
        };

        window.deleteSlide = function(index) {
            window.sliderData.splice(index, 1);
            window.renderSlides();
        };

        window.saveData = function() {
            window.sliderData = [];
            let slides = document.querySelectorAll('.slide-item');
            slides.forEach((slide) => {
                window.sliderData.push({
                    title: slide.querySelector('.s-title').value,
                    desc: slide.querySelector('.s-desc').value,
                    img: slide.querySelector('.s-img').value,
                    endDate: slide.querySelector('.s-date').value
                });
            });

            let btn = document.getElementById('save-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';

            set(sliderRef, window.sliderData).then(() => {
                let msg = document.getElementById('save-msg');
                msg.style.display = 'inline-block';
                setTimeout(() => msg.style.display = 'none', 3000);
            }).catch((error) => {
                alert("فشل الحفظ: لا تملك الصلاحيات! يرجى التأكد من أنك سجلت الدخول وأن قواعد بيانات Firebase (Rules) تسمح بالكتابة.");
            }).finally(() => {
                btn.innerHTML = originalText;
            });
        };

        // --- Lucky Wheel Management ---
        const wheelRef = ref(db, 'lucky_wheel');
        window.wheelData = [];

        // Section switching
        window.showSection = function(section) {
            const sliderCard = document.querySelector('.card.mb-4:not(#wheel-section):not(#settings-section)');
            const wheelCard = document.getElementById('wheel-section');
            const links = document.querySelectorAll('.sidebar a');

            links.forEach(l => l.classList.remove('active'));

            if (section === 'wheel') {
                if (sliderCard) sliderCard.style.display = 'none';
                if (wheelCard) wheelCard.style.display = 'block';
                links[1].classList.add('active');
            } else {
                if (sliderCard) sliderCard.style.display = 'block';
                if (wheelCard) wheelCard.style.display = 'none';
                links[0].classList.add('active');
            }
        };

        // Load wheel data
        onValue(wheelRef, (snapshot) => {
            const data = snapshot.val();
            if (data) window.wheelData = data;
            else window.wheelData = [];
            window.renderWheelProducts();
        });

        window.renderWheelProducts = function() {
            const container = document.getElementById('wheel-products-container');
            if (!container) return;
            container.innerHTML = '';
            window.wheelData.forEach((item, index) => {
                const html = `
                    <div class="slide-item" style="border-right: 4px solid #C5A059;">
                        <i class="fas fa-trash delete-slide" onclick="deleteWheelProduct(${index})"></i>
                        <div class="row">
                            <div class="col-md-4 mb-2">
                                <label>اسم المنتج</label>
                                <input type="text" class="form-control wp-name text-end" value="${item.name || ''}">
                            </div>
                            <div class="col-md-4 mb-2">
                                <label>رابط الصورة</label>
                                <input type="text" class="form-control wp-image text-end" value="${item.image || ''}" placeholder="assets/img/product01.png">
                            </div>
                            <div class="col-md-4 mb-2">
                                <label>كود الخصم (Promo Code من Reflow)</label>
                                <input type="text" class="form-control wp-promo text-end" value="${item.promoCode || ''}" placeholder="مثال: WHEEL50" dir="ltr" style="font-weight:bold; color:#C5A059;">
                            </div>
                            <div class="col-md-3 mb-2">
                                <label>السعر الأصلي</label>
                                <input type="text" class="form-control wp-original text-end" value="${item.originalPrice || ''}">
                            </div>
                            <div class="col-md-3 mb-2">
                                <label>سعر العجلة (المخفض)</label>
                                <input type="text" class="form-control wp-wheel text-end" value="${item.wheelPrice || ''}">
                            </div>
                            <div class="col-md-3 mb-2">
                                <label>نسبة الظهور (%)</label>
                                <input type="number" class="form-control wp-weight text-end" value="${item.weight || 10}" min="1" max="100">
                            </div>
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', html);
            });
        };

        window.addWheelProduct = function() {
            window.wheelData.push({ name: '', image: '', originalPrice: '', wheelPrice: '', weight: 10, promoCode: '' });
            window.renderWheelProducts();
        };

        window.deleteWheelProduct = function(index) {
            window.wheelData.splice(index, 1);
            window.renderWheelProducts();
        };

        window.saveWheelData = function() {
            window.wheelData = [];
            let items = document.querySelectorAll('#wheel-products-container .slide-item');
            items.forEach((item) => {
                window.wheelData.push({
                    name: item.querySelector('.wp-name').value,
                    image: item.querySelector('.wp-image').value,
                    originalPrice: item.querySelector('.wp-original').value,
                    wheelPrice: item.querySelector('.wp-wheel').value,
                    weight: parseInt(item.querySelector('.wp-weight').value) || 10,
                    promoCode: item.querySelector('.wp-promo').value
                });
            });

            set(wheelRef, window.wheelData).then(() => {
                let msg = document.getElementById('save-wheel-msg');
                msg.style.display = 'inline-block';
                setTimeout(() => msg.style.display = 'none', 3000);
            }).catch((error) => {
                alert("فشل الحفظ: تأكد من الصلاحيات.");
            });
        };

        window.saveSettings = function() {
            const isThemeActive = document.getElementById('theme-toggle').checked;
            set(configRef, {
                seasonal_theme: isThemeActive
            }).then(() => {
                let msg = document.getElementById('save-settings-msg');
                msg.style.display = 'inline-block';
                setTimeout(() => msg.style.display = 'none', 3000);
            }).catch((error) => {
                alert("فشل الحفظ.");
            });
        };
    