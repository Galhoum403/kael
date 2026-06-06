const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'favorites.html' && f !== 'admin.html');

let updated = 0;

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    let modified = false;

    // 1. Add wishlist icon back to header (before the cart div)
    // Find the header-ctn div and add wishlist icon before the cart span
    const cartDiv = '<div><span data-reflow-type="view-cart"';
    const wishlistDiv = `<div class="kael-header-wish"><a href="favorites.html"><i class="fa fa-heart-o"></i><span>المفضلة</span><div class="kael-wish-badge kael-wishlist-count">0</div></a></div>
                        <div><span data-reflow-type="view-cart"`;

    if (content.includes(cartDiv) && !content.includes('kael-header-wish')) {
        content = content.replace(cartDiv, wishlistDiv);
        modified = true;
    }

    // 2. Add kael-wishlist.js before </body>
    if (!content.includes('kael-wishlist.js')) {
        content = content.replace('</body>', '<script src="assets/js/kael-wishlist.js"></script>\n</body>');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(path.join(dir, file), content, 'utf8');
        console.log(`✅ Updated: ${file}`);
        updated++;
    } else {
        console.log(`⏩ Skipped: ${file} (already updated)`);
    }
});

console.log(`\nDone! Updated ${updated} files.`);
