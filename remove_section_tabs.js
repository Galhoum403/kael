const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    // Regular expression to match the section-nav div and its contents completely
    const regex = /<div class="section-nav">\s*<ul class="section-tab-nav tab-nav">\s*<li.*?><a.*?href="#tab\d".*?>هدايا<\/a><\/li>\s*<li><a.*?href="#tab\d".*?>إكسسوارات<\/a><\/li>\s*<li><a.*?href="#tab\d".*?>ساعات<\/a><\/li>\s*<\/ul>\s*<\/div>/g;
    
    if (regex.test(content)) {
        content = content.replace(regex, '');
        fs.writeFileSync(path.join(dir, file), content, 'utf8');
        console.log(`✅ Removed section tabs from ${file}`);
    }
});
console.log('Done!');
