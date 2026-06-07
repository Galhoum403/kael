const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const categoryMap = {
    'birthday': '766123984',
    'wedding': '780330277',
    'bridal': '601704586',
    'baby': '607399455',
    'graduation': '1052647750',
    'anniversary': '865502379',
    
    'men': '1237856653',
    'women': '1243649810',
    'kids': '1333493095',
    
    'watches': '1152034393',
    'accessories': '1501892014',
    'custom': '1524486963'
};

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');

    // Replace hrefs in the format /shop?category=XXX
    for (const [key, id] of Object.entries(categoryMap)) {
        const regex1 = new RegExp('href="shop\\\\?category=' + key + '"', 'g');
        const regex2 = new RegExp('href="/shop\\\\?category=' + key + '"', 'g');
        
        content = content.replace(regex1, 'href="/shop?category=' + id + '"');
        content = content.replace(regex2, 'href="/shop?category=' + id + '"');
    }

    fs.writeFileSync(path.join(dir, file), content, 'utf8');
    console.log('✅ Mapped Categories in ' + file);
});

console.log('Done Category Mapping!');
