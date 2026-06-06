const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'admin.html');

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    let modified = false;

    // 1. Remove kael-wishlist.js script tag
    if (content.includes('kael-wishlist.js')) {
        content = content.replace(/<script src="assets\/js\/kael-wishlist\.js"><\/script>\n?/g, '');
        modified = true;
    }

    // 2. Replace the full wishlist header div (with badge) with a simple heart icon link
    const wishRegex = /<div class="kael-header-wish">.*?<\/div><\/a><\/div>/gs;
    if (wishRegex.test(content)) {
        content = content.replace(wishRegex, '<div><a href="favorites.html"><i class="fa fa-heart-o"></i><span>المفضلة</span></a></div>');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(path.join(dir, file), content, 'utf8');
        console.log('✅ Cleaned: ' + file);
    }
});
console.log('Done!');
