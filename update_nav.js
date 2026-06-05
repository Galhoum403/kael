const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const mainNavHtml = `<ul class="main-nav">
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
            </ul>`;

const mobileNavHtml = `<ul class="list-unstyled text-end mobile-nav">
                <li><a href="index.html">الرئيسية</a></li>
                <li><a href="offers.html" style="color:var(--kael-gold, #C5A059);">عروض مميزة 🌟</a></li>
                <li class="dropdown">
                    <a href="#" class="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">تسوق بالمناسبة 🎈 <i class="fas fa-chevron-down me-1" style="font-size: 11px;"></i></a>
                    <ul class="dropdown-menu text-end border-0 bg-transparent pe-3" style="box-shadow: none;">
                        <li><a class="dropdown-item" href="shop.html?category=birthday">أعياد الميلاد</a></li>
                        <li><a class="dropdown-item" href="shop.html?category=wedding">زواج وخطوبة</a></li>
                        <li><a class="dropdown-item" href="shop.html?category=bridal">تجهيز عرائس</a></li>
                        <li><a class="dropdown-item" href="shop.html?category=baby">سبوع ومواليد</a></li>
                        <li><a class="dropdown-item" href="shop.html?category=graduation">تخرج</a></li>
                        <li><a class="dropdown-item" href="shop.html?category=anniversary">ذكرى سنوية</a></li>
                    </ul>
                </li>
                <li class="dropdown">
                    <a href="#" class="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">لمن الهدية؟ 🎁 <i class="fas fa-chevron-down me-1" style="font-size: 11px;"></i></a>
                    <ul class="dropdown-menu text-end border-0 bg-transparent pe-3" style="box-shadow: none;">
                        <li><a class="dropdown-item" href="shop.html?category=men">رجالي</a></li>
                        <li><a class="dropdown-item" href="shop.html?category=women">نسائي</a></li>
                        <li><a class="dropdown-item" href="shop.html?category=kids">أطفال</a></li>
                    </ul>
                </li>
                <li class="dropdown">
                    <a href="#" class="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">الأقسام 💎 <i class="fas fa-chevron-down me-1" style="font-size: 11px;"></i></a>
                    <ul class="dropdown-menu text-end border-0 bg-transparent pe-3" style="box-shadow: none;">
                        <li><a class="dropdown-item" href="shop.html?category=watches">ساعات فاخرة</a></li>
                        <li><a class="dropdown-item" href="shop.html?category=accessories">إكسسوارات</a></li>
                        <li><a class="dropdown-item" href="shop.html?category=custom">مخصصة بالاسم</a></li>
                    </ul>
                </li>
                <li><a href="contact.html">تواصل معنا</a></li>
            </ul>`;

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    // Add favicon if missing
    if (!content.includes('rel="icon"')) {
        content = content.replace(/<\/title>/i, '</title>\\n    <link rel="icon" type="image/png" href="assets/img/logo.png">');
    }
    
    // Replace main-nav
    let navReplaced = mainNavHtml;
    // Set active class based on file
    navReplaced = navReplaced.replace('REPLACE_ACTIVE_INDEX', file === 'index.html' ? 'active' : '');
    navReplaced = navReplaced.replace('REPLACE_ACTIVE_OFFERS', file === 'offers.html' ? 'active' : '');
    navReplaced = navReplaced.replace('REPLACE_ACTIVE_CONTACT', file === 'contact.html' ? 'active' : '');
    navReplaced = navReplaced.replace('REPLACE_ACTIVE_OCCASION', '');
    navReplaced = navReplaced.replace('REPLACE_ACTIVE_FORWHO', '');
    navReplaced = navReplaced.replace('REPLACE_ACTIVE_DEPT', file === 'shop.html' ? 'active' : '');
    
    if (content.match(/<ul class="main-nav">[\s\S]*?<\/ul>/)) {
        content = content.replace(/<ul class="main-nav">[\s\S]*?<\/ul>/, navReplaced);
    }
    
    // Replace mobile-nav
    if (content.match(/<ul class="list-unstyled text-end mobile-nav">[\s\S]*?<\/ul>/)) {
        content = content.replace(/<ul class="list-unstyled text-end mobile-nav">[\s\S]*?<\/ul>/, mobileNavHtml);
    }
    
    fs.writeFileSync(path.join(dir, file), content, 'utf8');
});
console.log('Update Complete');
