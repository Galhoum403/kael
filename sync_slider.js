const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';
const offersPath = path.join(dir, 'offers.html');
const indexPath = path.join(dir, 'index.html');

let offersContent = fs.readFileSync(offersPath, 'utf8');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// 1. Extract CSS
const styleRegex = /<style>[\s\S]*?\.offers-hero[\s\S]*?<\/style>/;
const styleMatch = offersContent.match(styleRegex);
const styles = styleMatch ? styleMatch[0] : '';

// 2. Extract Slider Container
const sliderRegex = /<div class="offers-hero position-relative p-0" id="hero-slider-container">[\s\S]*?<div class="offers-slider" dir="rtl" id="dynamic-slider">[\s\S]*?<\/div>[\s\S]*?<\/div>/;
const sliderMatch = offersContent.match(sliderRegex);
const sliderHtml = sliderMatch ? sliderMatch[0] : '';

// 3. Extract Scripts (Countdown and Firebase module)
// It's located after <script src="assets/js/slick.min.js"></script>
const scriptsRegex = /<style>\s*@media \(max-width: 768px\)[\s\S]*?<\/script>\s*<\/body>/;
const scriptsMatch = offersContent.match(scriptsRegex);
let scriptsHtml = '';
if (scriptsMatch) {
    // Replace the </body> part so we just get the scripts
    scriptsHtml = scriptsMatch[0].replace('</body>', '');
}

// 4. Inject into index.html
// Replace `#hot-deal` with `sliderHtml`
const hotDealRegex = /<div id="hot-deal" class="section" dir="rtl">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;
if (indexContent.match(hotDealRegex)) {
    indexContent = indexContent.replace(hotDealRegex, sliderHtml);
} else {
    // Try a simpler replace if exact match fails
    const hotDealStart = indexContent.indexOf('<div id="hot-deal"');
    if (hotDealStart !== -1) {
        // find the end of this section - roughly before the next section
        const hotDealEnd = indexContent.indexOf('<div class="section" dir="rtl">', hotDealStart + 10);
        if (hotDealEnd !== -1) {
            const originalHotDeal = indexContent.substring(hotDealStart, hotDealEnd);
            indexContent = indexContent.replace(originalHotDeal, sliderHtml + '\n    ');
        }
    }
}

// Inject styles into <head>
if (!indexContent.includes('.offers-hero')) {
    indexContent = indexContent.replace('</head>', styles + '\n</head>');
}

// Inject scripts before </body>
// Remove existing hot-deal countdown script if any
const oldCountdownRegex = /<script>\s*\$\(document\)\.ready\(function \(\) {[\s\S]*?var count = \$\('#hot-deal-countdown'\)[\s\S]*?\}\);\s*<\/script>/;
indexContent = indexContent.replace(oldCountdownRegex, '');

// First check if scriptsHtml is already injected to avoid duplicates
if (!indexContent.includes('import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";')) {
    // Add scripts just before </body>
    indexContent = indexContent.replace('</body>', scriptsHtml + '\n</body>');
}

fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('✅ Synchronized slider to index.html');
