const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const mainNavHtml = `<nav class="d-none d-md-block" id="navigation" dir="rtl">
        <div class="container">
            <ul class="main-nav">
                <li class="REPLACE_ACTIVE_INDEX"><a href="index.html">الرئيسية</a></li>
                <li class="REPLACE_ACTIVE_OFFERS"><a href="offers.html" style="color:var(--kael-gold, #C5A059);font-weight:bold;">عروض مميزة 🌟</a></li>
                <li class="dropdown REPLACE_ACTIVE_OCCASION">
                    <a href="#" class="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" style="cursor: pointer;">تسوق بالمناسبة 🎈 <i class="fas fa-chevron-down me-1" style="font-size: 11px;"></i></a>
                    <ul class="dropdown-menu shadow-sm" style="text-align: right; border: 1px solid var(--kael-gold, #C5A059); padding: 10px; border-radius: 8px;">
                        <li><a class="dropdown-item" href="shop.html?category=birthday">هدايا أعياد الميلاد</a></li>
                        <li><a class="dropdown-item" href="shop.html?category=wedding">هدايا زواج وخطوبة</a></li>
                        <li><a class="dropdown-item" href="shop.html?category=bridal">تجهيز عرائس</a></li>
                        <li><a class="dropdown-item" href="shop.html?category=baby">هدايا سبوع ومواليد</a></li>
                        <li><a class="dropdown-item" href="shop.html?category=graduation">هدايا التخرج</a></li>
                        <li><a class="dropdown-item" href="shop.html?category=anniversary">هدايا ذكرى سنوية</a></li>
                    </ul>
                </li>
                <li class="dropdown REPLACE_ACTIVE_FORWHO">
                    <a href="#" class="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" style="cursor: pointer;">لمن الهدية؟ 🎁 <i class="fas fa-chevron-down me-1" style="font-size: 11px;"></i></a>
                    <ul class="dropdown-menu shadow-sm" style="text-align: right; border: 1px solid var(--kael-gold, #C5A059); padding: 10px; border-radius: 8px;">
                        <li><a class="dropdown-item" href="shop.html?category=men">هدايا رجالي</a></li>
                        <li><a class="dropdown-item" href="shop.html?category=women">هدايا نسائي</a></li>
                        <li><a class="dropdown-item" href="shop.html?category=kids">هدايا أطفال</a></li>
                    </ul>
                </li>
                <li class="dropdown REPLACE_ACTIVE_DEPT">
                    <a href="#" class="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" style="cursor: pointer;">الأقسام 💎 <i class="fas fa-chevron-down me-1" style="font-size: 11px;"></i></a>
                    <ul class="dropdown-menu shadow-sm" style="text-align: right; border: 1px solid var(--kael-gold, #C5A059); padding: 10px; border-radius: 8px;">
                        <li><a class="dropdown-item" href="shop.html?category=watches">ساعات فاخرة</a></li>
                        <li><a class="dropdown-item" href="shop.html?category=accessories">إكسسوارات</a></li>
                        <li><a class="dropdown-item" href="shop.html?category=custom">هدايا مخصصة بالاسم</a></li>
                    </ul>
                </li>
                <li class="REPLACE_ACTIVE_CONTACT"><a href="contact.html">تواصل معنا</a></li>
            </ul>
        </div>
    </nav>`;

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    let navReplaced = mainNavHtml;
    navReplaced = navReplaced.replace('REPLACE_ACTIVE_INDEX', file === 'index.html' ? 'active' : '');
    navReplaced = navReplaced.replace('REPLACE_ACTIVE_OFFERS', file === 'offers.html' ? 'active' : '');
    navReplaced = navReplaced.replace('REPLACE_ACTIVE_CONTACT', file === 'contact.html' ? 'active' : '');
    navReplaced = navReplaced.replace('REPLACE_ACTIVE_OCCASION', '');
    navReplaced = navReplaced.replace('REPLACE_ACTIVE_FORWHO', '');
    navReplaced = navReplaced.replace('REPLACE_ACTIVE_DEPT', file === 'shop.html' ? 'active' : '');
    
    // Fix broken nav by replacing from <nav ... id="navigation"...> to </nav>
    content = content.replace(/<nav class="d-none d-md-block" id="navigation" dir="rtl">[\s\S]*?<\/nav>/, navReplaced);
    
    fs.writeFileSync(path.join(dir, file), content, 'utf8');
});
console.log('Fix Complete');
