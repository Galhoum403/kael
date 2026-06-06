const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    let modified = false;

    // 1. Clean up the duplicate broken links at the end of the mobile menu
    // We are looking for this block:
    /*
            </ul>
                </li>
                <li><a href="shop.html?category=accessories">إكسسوارات</a></li>
                <li><a href="shop.html?category=watches">ساعات</a></li>
                <li><a href="contact.html">تواصل معنا</a></li>
            </ul>
    */
    const brokenMenuRegex = /<\/ul>\s*<\/li>\s*<li><a href="shop\.html\?category=accessories">إكسسوارات<\/a><\/li>\s*<li><a href="shop\.html\?category=watches">ساعات<\/a><\/li>\s*<li><a href="contact\.html">تواصل معنا<\/a><\/li>\s*<\/ul>/g;
    
    if (brokenMenuRegex.test(content)) {
        content = content.replace(brokenMenuRegex, '</ul>');
        modified = true;
    }

    // Also look for simple occurrence of those links in case they are slightly different
    const simpleBrokenRegex = /<\/li>\s*<li><a href="shop\.html\?category=accessories">إكسسوارات<\/a><\/li>\s*<li><a href="shop\.html\?category=watches">ساعات<\/a><\/li>\s*<li><a href="contact\.html">تواصل معنا<\/a><\/li>\s*<\/ul>/g;
    if (simpleBrokenRegex.test(content)) {
        content = content.replace(simpleBrokenRegex, '</ul>');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(path.join(dir, file), content, 'utf8');
        console.log(`✅ Cleaned mobile menu in ${file}`);
    }
});

// 2. Fix the Arabic Name Validation in cart.html
const cartPath = path.join(dir, 'cart.html');
let cartContent = fs.readFileSync(cartPath, 'utf8');

const fixArabicScript = `
    <!-- Fix Reflow Arabic Name Validation -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // MutationObserver to watch for Reflow Checkout Form injection
            const observer = new MutationObserver(function(mutations) {
                const inputs = document.querySelectorAll('.ref-checkout input[name="name"], .ref-checkout input[name="city"], .ref-checkout input[name="address-line"], input');
                inputs.forEach(function(input) {
                    // Remove any strict regex patterns that might prevent Arabic
                    if (input.hasAttribute('pattern')) {
                        const pattern = input.getAttribute('pattern');
                        if (!pattern.includes('\\\\p{Arabic}')) {
                            input.removeAttribute('pattern');
                            input.setAttribute('title', 'يرجى إدخال البيانات بشكل صحيح (يمكن استخدام اللغة العربية)');
                        }
                    }
                    
                    // Specific fix for "name" field if Reflow validates it via JS
                    // We remove the default pattern and set a wide one
                    if (input.name === 'name' || input.name === 'city' || input.name === 'region') {
                        input.removeAttribute('pattern');
                    }
                });
            });

            // Start observing the cart container
            const cartContainer = document.querySelector('[data-reflow-type="shopping-cart"]');
            if (cartContainer) {
                observer.observe(cartContainer, { childList: true, subtree: true });
            } else {
                observer.observe(document.body, { childList: true, subtree: true });
            }
        });
    </script>
`;

if (!cartContent.includes('Fix Reflow Arabic Name Validation')) {
    cartContent = cartContent.replace('</body>', fixArabicScript + '\n</body>');
    fs.writeFileSync(cartPath, cartContent, 'utf8');
    console.log(`✅ Injected Arabic name validation fix in cart.html`);
}

console.log('Done!');
