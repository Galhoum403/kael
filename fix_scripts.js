const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';
const htmlFiles = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const requiredScripts = `
    <!-- Core JS -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="assets/bootstrap/js/bootstrap.min.js"></script>
    <script src="https://cdn.reflowhq.com/v2/toolkit.min.js" data-reflow-project="1911270116" data-reflow-locale="assets/js/ar.json"></script>
`;

htmlFiles.forEach(file => {
    // Skip portal and 404
    if (file.includes('portal') || file.includes('packaging') || file.includes('404')) return;
    
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    // Check if toolkit is missing
    if (!content.includes('toolkit.min.js')) {
        content = content.replace(/<script src="https:\/\/unpkg\.com\/aos@2\.3\.1\/dist\/aos\.js"><\/script>/, requiredScripts + '\n    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>');
        fs.writeFileSync(path.join(dir, file), content, 'utf8');
        console.log('✅ Fixed missing scripts in ' + file);
    }
});
