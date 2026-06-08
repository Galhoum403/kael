const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';

// ==========================================
// 1. Inject Reflow Auth into all HTML files
// ==========================================
const htmlFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
const authHtml = `<div style="display:inline-block; margin-left: 15px; margin-right: 15px; vertical-align: top;"><div data-reflow-type="auth"></div></div>`;

htmlFiles.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    // Inject auth button right before the cart dropdown
    if (!content.includes('data-reflow-type="auth"')) {
        content = content.replace(
            /(<div><span data-reflow-type="view-cart")/g, 
            authHtml + '\n                        $1'
        );
        fs.writeFileSync(path.join(dir, file), content, 'utf8');
        console.log('✅ Injected Auth in ' + file);
    }
});

// ==========================================
// 2. Add General Settings to Admin Portal
// ==========================================
const portalPath = path.join(dir, 'kael-portal-7x9.html');
let portalContent = fs.readFileSync(portalPath, 'utf8');

const settingsSection = `
        <!-- General Settings Config -->
        <div class="card mb-4" id="settings-section">
            <div class="card-header bg-secondary text-white" style="border-radius: 10px 10px 0 0;">
                <i class="fas fa-cog"></i> إعدادات المتجر العامة (الخريطة وغيرها)
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <label class="form-label fw-bold">رابط خريطة تواصل معنا (Google Maps Embed URL)</label>
                    <input type="text" id="map-url-input" class="form-control text-end" placeholder="https://www.google.com/maps/embed?pb=..." dir="ltr">
                    <small class="text-muted d-block mt-1">انسخ الرابط من خرائط جوجل (مشاركة -> تضمين خريطة -> انسخ الرابط الموجود داخل src="...")</small>
                </div>
                <button type="button" class="btn btn-gold px-4 py-2" onclick="saveSettings()">
                    <i class="fas fa-save me-2"></i> حفظ الإعدادات
                </button>
                <span id="save-settings-msg" class="text-success ms-3 fw-bold" style="display: none;">تم الحفظ بنجاح!</span>
            </div>
        </div>
`;

if (!portalContent.includes('id="settings-section"')) {
    // Inject right before the closing </div> of main-content
    portalContent = portalContent.replace(/<\/div>\s*<script src="assets\/bootstrap\/js\/bootstrap.min.js">/, settingsSection + '\n    </div>\n\n    <script src="assets/bootstrap/js/bootstrap.min.js">');

    // Add JS logic for Settings
    const settingsLogic = `
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
`;
    portalContent = portalContent.replace(/window\.loadData = function\(\) \{[\s\S]*?if\(typeof window\.renderSlides === 'function'\) window\.renderSlides\(\);\n\s*\}\);\n\s*\};/, settingsLogic);
    
    fs.writeFileSync(portalPath, portalContent, 'utf8');
    console.log('✅ Added General Settings to Portal');
}

// ==========================================
// 3. Update Contact.html to load Map dynamically
// ==========================================
const contactPath = path.join(dir, 'contact.html');
let contactContent = fs.readFileSync(contactPath, 'utf8');

// The original map iframe
const oldIframeRegex = /<iframe[^>]*src="https:\/\/www\.google\.com\/maps\/embed\?[^"]*"[^>]*><\/iframe>/;

if (oldIframeRegex.test(contactContent)) {
    // Give the iframe an id so we can target it
    contactContent = contactContent.replace(oldIframeRegex, '<iframe id="kael-dynamic-map" allowfullscreen="" frameborder="0" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110502.60389552702!2d31.25846435!3d30.05948845!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14583fa60b21beeb%3A0x79dfb296e8423bba!2z2KfZhNmC2KfZh9ix2KnYjCDZhdi62KfZgdi42Kkg2KfZhNmC2KfZh9ix2KnigKw!5e0!3m2!1sar!2seg!4v1715690000000!5m2!1sar!2seg" width="100%" height="100%"></iframe>');
    
    const mapScript = `
    <!-- Dynamic Map Loader -->
    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
        import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

        const firebaseConfig = {
            apiKey: "AIzaSyDuynSBIWoQYcuyRYEjXEZ8qhnbMMU0pfE",
            authDomain: "kael-85f70.firebaseapp.com",
            databaseURL: "https://kael-85f70-default-rtdb.firebaseio.com",
            projectId: "kael-85f70"
        };
        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);
        const settingsRef = ref(db, 'store_settings');

        onValue(settingsRef, (snapshot) => {
            const data = snapshot.val();
            if(data && data.mapUrl) {
                const mapIframe = document.getElementById('kael-dynamic-map');
                if(mapIframe) {
                    mapIframe.src = data.mapUrl;
                }
            }
        });
    </script>
`;
    // Insert script before </body>
    if (!contactContent.includes('Dynamic Map Loader')) {
        contactContent = contactContent.replace('</body>', mapScript + '\n</body>');
        fs.writeFileSync(contactPath, contactContent, 'utf8');
        console.log('✅ Updated Contact Map dynamically');
    }
}

console.log('Finished feature injections!');
