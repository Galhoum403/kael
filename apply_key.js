const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    if (content.includes('YOUR_WEB3FORMS_ACCESS_KEY_HERE')) {
        content = content.replace(/YOUR_WEB3FORMS_ACCESS_KEY_HERE/g, '585d1f02-f9d1-4a09-86f9-955c5233b239');
        fs.writeFileSync(path.join(dir, file), content, 'utf8');
        console.log(`Updated key in ${file}`);
    }
});
console.log('Key Update Complete');
