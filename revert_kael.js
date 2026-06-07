const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';

// 1. Update Config to Kael
const configPath = path.join(dir, 'assets/js/lylix-config.js');
let configContent = fs.readFileSync(configPath, 'utf8');
configContent = configContent.replace(/storeName: "Lylix Store"/, 'storeName: "Kael"');
configContent = configContent.replace(/storeDescription: ".*?"/, 'storeDescription: "متجر Kael وجهتك الأولى للهدايا الفاخرة، الساعات، والإكسسوارات. تسوق الآن لأفضل الهدايا لجميع المناسبات."');
configContent = configContent.replace(/info@lylix.com/, 'info@kael.com');
fs.writeFileSync(configPath, configContent, 'utf8');

// 2. Revert alt tags and title tags in HTML just to be safe
const htmlFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
htmlFiles.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    content = content.replace(/alt="Lylix Logo"/g, 'alt="Kael Logo"');
    content = content.replace(/<title>Lylix<\/title>/g, '<title>Kael</title>');
    fs.writeFileSync(path.join(dir, file), content, 'utf8');
    console.log('✅ Reverted ' + file + ' back to Kael context');
});

console.log('Done restoring Kael context!');
