const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';
const htmlFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const authHtml = `<div style="display:inline-block; margin-left: 15px; margin-right: 15px; vertical-align: top;"><div data-reflow-type="auth"></div></div>\\n                        `;

htmlFiles.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    // Remove the auth snippet if it exists
    if (content.includes('data-reflow-type="auth"')) {
        // We'll replace using regex to catch any spacing variations, or just standard replace
        content = content.replace(/<div style="display:inline-block; margin-left: 15px; margin-right: 15px; vertical-align: top;"><div data-reflow-type="auth"><\/div><\/div>\s*/g, '');
        fs.writeFileSync(path.join(dir, file), content, 'utf8');
        console.log('✅ Removed Auth from ' + file);
    }
});
