const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';

// ==========================================
// 1. Create 404.html Page
// ==========================================
const indexHTML = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

// Strip out the main content of index and replace it with a 404 block
let page404 = indexHTML.replace(/<!-- Start Main Slider -->[\s\S]*?<!-- Start Footer -->/, `
    <div style="min-height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px;">
        <h1 style="font-size: 8rem; font-weight: 900; color: var(--lylix-primary, #C5A059); margin-bottom: 0;">404</h1>
        <h2 style="font-size: 2rem; color: #103C2B; margin-bottom: 20px;">الصفحة غير موجودة</h2>
        <p style="color: #666; margin-bottom: 30px; font-size: 1.1rem;">عذراً، الرابط الذي تحاول الوصول إليه غير موجود أو تم نقله.</p>
        <a href="/" class="btn btn-gold" style="padding: 12px 30px; border-radius: 30px; background: var(--lylix-primary, #C5A059); color: white; text-decoration: none; font-weight: bold;">العودة للرئيسية</a>
    </div>
    <!-- Start Footer -->
`);

// Adjust the title
page404 = page404.replace(/<title>.*?<\/title>/, '<title>الصفحة غير موجودة | 404</title>');

fs.writeFileSync(path.join(dir, '404.html'), page404, 'utf8');
console.log('✅ Created 404.html');

// ==========================================
// 2. Disable Inspect Element (lylix-core.js)
// ==========================================
const coreJsPath = path.join(dir, 'assets/js/lylix-core.js');
let coreJs = fs.readFileSync(coreJsPath, 'utf8');

if (!coreJs.includes('Anti-Inspect Logic')) {
    const antiInspectLogic = `
// J. Anti-Inspect Logic (Security)
document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('keydown', function(e) {
    // Prevent F12
    if (e.key === 'F12' || e.keyCode === 123) { e.preventDefault(); return false; }
    // Prevent Ctrl+Shift+I
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) { e.preventDefault(); return false; }
    // Prevent Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) { e.preventDefault(); return false; }
    // Prevent Ctrl+Shift+J
    if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) { e.preventDefault(); return false; }
    // Prevent Ctrl+U
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) { e.preventDefault(); return false; }
});
`;
    coreJs += '\n' + antiInspectLogic;
    fs.writeFileSync(coreJsPath, coreJs, 'utf8');
    console.log('✅ Added Anti-Inspect logic to lylix-core.js');
}

// ==========================================
// 3. Fix Admin Portal renderSlides and Extract Packaging
// ==========================================
const portalPath = path.join(dir, 'kael-portal-7x9.html');
let portalContent = fs.readFileSync(portalPath, 'utf8');

// 3a. Add renderSlides function and addSlide function inside the module
const renderSlidesScript = `
        window.renderSlides = function() {
            const container = document.getElementById('slides-container');
            container.innerHTML = ''; // clear
            window.sliderData.forEach((slide, index) => {
                const html = \`
                    <div class="slide-item">
                        <i class="fas fa-trash delete-slide" onclick="deleteSlide(\${index})"></i>
                        <div class="row">
                            <div class="col-md-6 mb-2">
                                <label>العنوان</label>
                                <input type="text" class="form-control s-title text-end" value="\${slide.title || ''}">
                            </div>
                            <div class="col-md-6 mb-2">
                                <label>رابط الصورة</label>
                                <input type="text" class="form-control s-img text-end" value="\${slide.img || ''}" placeholder="assets/img/product01.png">
                            </div>
                            <div class="col-md-8 mb-2">
                                <label>الوصف</label>
                                <input type="text" class="form-control s-desc text-end" value="\${slide.desc || ''}">
                            </div>
                            <div class="col-md-4 mb-2">
                                <label>تاريخ انتهاء العرض (اختياري)</label>
                                <input type="datetime-local" class="form-control s-date" value="\${slide.endDate || ''}">
                            </div>
                        </div>
                    </div>
                \`;
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
`;

if (!portalContent.includes('window.renderSlides = function()')) {
    portalContent = portalContent.replace('window.saveData = function()', renderSlidesScript + '\n        window.saveData = function()');
}

// 3b. Extract Packaging Section into its own page
const packagingSectionRegex = /<!-- Custom Packaging Config -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
const packagingSectionMatch = portalContent.match(packagingSectionRegex);

if (packagingSectionMatch) {
    let packagingHTML = packagingSectionMatch[0];
    
    // Remove it from portal
    portalContent = portalContent.replace(packagingSectionRegex, '');
    
    // Add navigation link in sidebar
    portalContent = portalContent.replace('<a href="#"><i class="fas fa-box"></i> المنتجات (قريباً)</a>', '<a href="kael-packaging-7x9.html"><i class="fas fa-gift"></i> طلبات التغليف</a>\n        <a href="#"><i class="fas fa-box"></i> المنتجات (قريباً)</a>');

    fs.writeFileSync(portalPath, portalContent, 'utf8');
    console.log('✅ Updated Admin Portal (renderSlides + links)');

    // Create the packaging page
    let newPackagingPage = portalContent; // Clone portal structure
    
    // Fix sidebar active state
    newPackagingPage = newPackagingPage.replace('<a href="#" class="active"><i class="fas fa-images"></i> سلايدر العروض</a>', '<a href="kael-portal-7x9.html"><i class="fas fa-images"></i> سلايدر العروض</a>');
    newPackagingPage = newPackagingPage.replace('<a href="kael-packaging-7x9.html"><i class="fas fa-gift"></i> طلبات التغليف</a>', '<a href="#" class="active"><i class="fas fa-gift"></i> طلبات التغليف</a>');
    
    // Replace Main Content Area
    newPackagingPage = newPackagingPage.replace(/<!-- Main Content -->[\s\S]*?<script src="assets\/bootstrap\/js\/bootstrap.min.js">/, `
    <!-- Main Content -->
    <div class="main-content">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>لوحة التحكم - إدارة التغليف</h2>
            <div>
                <span class="badge bg-success" id="db-status">مستعد</span>
            </div>
        </div>

        ${packagingHTML}
    </div>

    <script src="assets/bootstrap/js/bootstrap.min.js">`);
    
    // Fix the script block for packaging (we don't need sliders logic here)
    const scriptBlockRegex = /<script type="module">[\s\S]*?<\/script>/;
    newPackagingPage = newPackagingPage.replace(scriptBlockRegex, `
    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
        import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

        const firebaseConfig = {
            apiKey: "AIzaSyDuynSBIWoQYcuyRYEjXEZ8qhnbMMU0pfE",
            authDomain: "kael-85f70.firebaseapp.com",
            projectId: "kael-85f70"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);

        onAuthStateChanged(auth, (user) => {
            if (user) {
                document.getElementById('login-screen').style.display = 'none';
                document.getElementById('db-status').innerText = 'متصل كـ: ' + user.email;
            } else {
                document.getElementById('login-screen').style.display = 'flex';
                document.getElementById('db-status').innerText = 'غير متصل';
                document.getElementById('db-status').className = 'badge bg-danger ms-2';
            }
        });

        window.checkLogin = function() {
            let email = document.getElementById('admin-email').value;
            let pass = document.getElementById('admin-pass').value;
            let btn = document.getElementById('login-btn');
            
            if(!email || !pass) return;

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الدخول...';
            btn.disabled = true;

            signInWithEmailAndPassword(auth, email, pass)
                .then(() => { btn.innerHTML = 'دخول'; btn.disabled = false; })
                .catch(() => {
                    document.getElementById('login-error').style.display = 'block';
                    document.getElementById('login-error').innerText = 'البيانات غير صحيحة أو الحساب غير مسجل.';
                    btn.innerHTML = 'دخول'; btn.disabled = false;
                });
        };

        window.logout = function() { signOut(auth); };
        
        // Dummy search pkg logic for UI
        document.getElementById('search-pkg-btn').addEventListener('click', function() {
            const val = document.getElementById('search-pkg-input').value;
            const res = document.getElementById('pkg-result');
            res.style.display = 'block';
            if(val) res.innerHTML = '<p class="text-success mb-0"><i class="fas fa-check-circle"></i> طلب تغليف مفعل للكود: <strong>' + val + '</strong> - رسالة التغليف: "عيد ميلاد سعيد يا غالي"</p>';
            else res.innerHTML = '<p class="text-danger mb-0">يرجى إدخال كود التغليف</p>';
        });
    </script>
    `);

    fs.writeFileSync(path.join(dir, 'kael-packaging-7x9.html'), newPackagingPage, 'utf8');
    console.log('✅ Created kael-packaging-7x9.html');
}

console.log('Done!');
