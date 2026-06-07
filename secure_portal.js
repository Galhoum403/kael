const fs = require('fs');
const path = require('path');

const file = 'z:/Kael store/kael final/kael-portal-7x9.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Update the Login HTML
const newLoginHTML = `
    <div id="login-screen">
        <div class="login-box">
            <img src="assets/img/logo.png" alt="Logo" style="filter: invert(1); max-width: 150px; margin-bottom: 20px;">
            <h4 class="mb-3">تسجيل الدخول للإدارة</h4>
            
            <div class="alert alert-warning text-end" style="font-size: 12px; padding: 10px;">
                <strong>ملاحظة هامة:</strong> يجب تفعيل (Email/Password) وإنشاء حساب لك من لوحة تحكم Firebase Auth لتتمكن من الدخول.
            </div>

            <input type="email" id="admin-email" class="form-control text-end mb-2" placeholder="البريد الإلكتروني..." dir="ltr">
            <input type="password" id="admin-pass" class="form-control text-end mb-3" placeholder="كلمة المرور..." dir="ltr">
            
            <button id="login-btn" class="btn btn-gold w-100" onclick="checkLogin()">دخول</button>
            <p id="login-error" class="text-danger mt-2" style="display:none; font-size: 14px;">خطأ في البيانات</p>
        </div>
    </div>
`;

// Replace old login-screen div
content = content.replace(/<div id="login-screen">[\s\S]*?<\/div>\s*<\/div>/, newLoginHTML);

// 2. Add logout button to sidebar
const logoutBtn = `
        <a href="#" onclick="logout()" style="color: #dc3545;"><i class="fas fa-sign-out-alt"></i> تسجيل الخروج</a>
        <a href="/" style="margin-top: auto; border-top: 1px solid #333;"><i class="fas fa-store"></i> العودة للمتجر</a>
`;
content = content.replace(/<a href="\/" style="margin-top: auto; border-top: 1px solid #333;"><i class="fas fa-store"><\/i> العودة للمتجر<\/a>/, logoutBtn);

// 3. Update the Script logic
const oldScriptRegex = /<script type="module">[\s\S]*?<\/script>/;
const newScript = `
    <script type="module">
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
        const sliderRef = ref(db, 'offers_slider');

        window.sliderData = [];

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
        window.loadData = function() {
            onValue(sliderRef, (snapshot) => {
                const data = snapshot.val();
                if(data) {
                    window.sliderData = data;
                } else {
                    window.sliderData = [
                        {
                            title: "تخفيضات تصل إلى 50%",
                            desc: "استمتع بأقوى العروض الحصرية على تشكيلة فاخرة من الساعات.",
                            img: "assets/img/product01.png",
                            endDate: new Date(new Date().getTime() + 72*60*60*1000).toISOString().slice(0,16)
                        }
                    ];
                }
                if(typeof window.renderSlides === 'function') window.renderSlides();
            });
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
    </script>
`;

content = content.replace(oldScriptRegex, newScript);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Updated portal security successfully!');
