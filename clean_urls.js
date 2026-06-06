const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');

    // Remove .html from hrefs, except external links
    content = content.replace(/href="(?!http)([^"]+)\.html(#?[^"]*)?"/g, 'href="$1$2"');
    
    // Remove .html from actions in forms
    content = content.replace(/action="(?!http)([^"]+)\.html"/g, 'action="$1"');

    // Special case: "index" is often preferred as "/"
    content = content.replace(/href="index"/g, 'href="/"');
    
    // Reflow cart URL
    content = content.replace(/data-reflow-shoppingcart-url="cart\.html"/g, 'data-reflow-shoppingcart-url="cart"');

    fs.writeFileSync(path.join(dir, file), content, 'utf8');
    console.log(`✅ Cleaned URLs in ${file}`);
});
console.log('Done!');
