const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    if (file === 'favorites.html') {
        fs.unlinkSync(path.join(dir, file));
        console.log('✅ Deleted favorites.html');
        return;
    }

    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    let modified = false;

    // Replace the favorites link
    const regex = /<a href="favorites\.html">(.*?)المفضلة(.*?)<\/a>/g;
    if (regex.test(content)) {
        content = content.replace(regex, '<a href="index.html">$1المفضلة$2</a>');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(path.join(dir, file), content, 'utf8');
        console.log(`✅ Updated link in ${file}`);
    }
});

// Clean up the JS file if it still exists
const jsPath = path.join(dir, 'assets', 'js', 'kael-wishlist.js');
if (fs.existsSync(jsPath)) {
    fs.unlinkSync(jsPath);
    console.log('✅ Deleted kael-wishlist.js');
}

console.log('Done!');
