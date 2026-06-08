const fs = require('fs');
const path = require('path');

const cssPath = 'z:/Kael store/kael final/assets/css/lylix-core.css';
let css = fs.readFileSync(cssPath, 'utf8');

const modalCss = "\\n" +
"/* ==========================================\\n" +
"   Reflow Product Modal Styling (Quick View)\\n" +
"   ========================================== */\\n" +
".ref-modal-content {\\n" +
"    border-radius: 15px !important;\\n" +
"    border: 2px solid var(--lylix-primary, #C5A059) !important;\\n" +
"    box-shadow: 0 10px 40px rgba(0,0,0,0.2) !important;\\n" +
"    background-color: var(--lylix-background, #fff) !important;\\n" +
"}\\n" +
".ref-modal .ref-close {\\n" +
"    color: var(--lylix-secondary, #103C2B) !important;\\n" +
"    font-size: 24px !important;\\n" +
"    opacity: 1 !important;\\n" +
"    transition: 0.3s;\\n" +
"}\\n" +
".ref-modal .ref-close:hover {\\n" +
"    color: var(--lylix-primary, #C5A059) !important;\\n" +
"    transform: rotate(90deg);\\n" +
"}\\n" +
".ref-modal .ref-product-name {\\n" +
"    color: var(--lylix-secondary, #103C2B) !important;\\n" +
"    font-family: 'Tajawal', sans-serif !important;\\n" +
"    font-weight: bold !important;\\n" +
"}\\n" +
".ref-modal .ref-price {\\n" +
"    color: var(--lylix-primary, #C5A059) !important;\\n" +
"    font-size: 1.5rem !important;\\n" +
"    font-weight: bold !important;\\n" +
"}\\n" +
".ref-modal .ref-button.ref-add-to-cart {\\n" +
"    background-color: var(--lylix-primary, #C5A059) !important;\\n" +
"    color: #fff !important;\\n" +
"    border-radius: 30px !important;\\n" +
"    font-family: 'Tajawal', sans-serif !important;\\n" +
"    transition: 0.3s !important;\\n" +
"    box-shadow: 0 4px 10px rgba(197, 160, 89, 0.3) !important;\\n" +
"}\\n" +
".ref-modal .ref-button.ref-add-to-cart:hover {\\n" +
"    background-color: var(--lylix-secondary, #103C2B) !important;\\n" +
"    box-shadow: 0 4px 15px rgba(16, 60, 43, 0.3) !important;\\n" +
"}\\n" +
".ref-modal .ref-media {\\n" +
"    border-radius: 10px !important;\\n" +
"    overflow: hidden !important;\\n" +
"}\\n";

if (!css.includes('Reflow Product Modal Styling')) {
    fs.writeFileSync(cssPath, css + modalCss, 'utf8');
    console.log('✅ Added Modal CSS');
} else {
    console.log('Already exists');
}
