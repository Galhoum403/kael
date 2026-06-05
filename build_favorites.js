const fs = require('fs');
const path = require('path');

const filePath = 'z:/Kael store/kael final/favorites.html';
let content = fs.readFileSync(filePath, 'utf8');

// Change Title
content = content.replace('<title>Kael - عربة التسوق</title>', '<title>المفضلة - Kael</title>');

// Extract from <div class="section"> to <footer>
const sectionStart = content.indexOf('<div class="section">');
const footerStart = content.indexOf('<!-- Premium Footer -->');

if (sectionStart !== -1 && footerStart !== -1) {
    const favoritesUI = `<div class="section" style="min-height: 50vh; display: flex; align-items: center;">
        <div class="container text-center" dir="rtl">
            <div class="card shadow-sm border-0" style="border-radius: 15px; padding: 50px 20px; background-color: var(--kael-cream, #F9F6F0);">
                <i class="fas fa-heart-broken mb-4" style="font-size: 60px; color: #ccc;"></i>
                <h3 style="color: var(--kael-green-dark, #103C2B); font-weight: bold; margin-bottom: 15px;">قائمة المفضلة فارغة</h3>
                <p class="text-muted mb-4" style="font-size: 16px; max-width: 500px; margin: 0 auto;">لا توجد أي منتجات في قائمتك المفضلة حتى الآن. تصفح متجرنا الفاخر وأضف الهدايا التي تعجبك هنا لتتمكن من العودة إليها لاحقاً.</p>
                <a href="shop.html" class="btn" style="background: var(--kael-gold, #C5A059); color: white; padding: 12px 35px; font-weight: bold; border-radius: 30px; font-size: 16px;">
                    <i class="fas fa-shopping-bag me-2"></i> تصفح المنتجات الآن
                </a>
            </div>
        </div>
    </div>\n\n    `;
    
    content = content.substring(0, sectionStart) + favoritesUI + content.substring(footerStart);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Favorites UI built successfully');
} else {
    console.log('Failed to find markers in favorites.html');
}
