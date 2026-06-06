const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const preloaderHTML = `
    <!-- Preloader -->
    <div id="kael-preloader">
        <img src="assets/img/logo.png" alt="Kael Logo">
        <div class="kael-spinner"></div>
    </div>
`;

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');

    // Check if the actual div is missing
    if (!content.includes('<div id="kael-preloader">')) {
        content = content.replace(/<body>/i, '<body>\n' + preloaderHTML);
        fs.writeFileSync(path.join(dir, file), content, 'utf8');
        console.log('✅ Injected Preloader HTML to ' + file);
    }
});
console.log('Done!');
