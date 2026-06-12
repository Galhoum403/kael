const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const whatsappScript = `
    <!-- Smart WhatsApp Integration -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const waNumber = "201113119058"; // Kael Store Number

            // 1. Update the main floating WhatsApp button
            const mainWpBtn = document.getElementById('wp');
            if (mainWpBtn) {
                const currentUrl = encodeURIComponent(window.location.href);
                mainWpBtn.href = \`https://wa.me/\${waNumber}?text=مرحباً، أود الاستفسار عن متجركم. أنا أتصفح هذه الصفحة: \${currentUrl}\`;
            }

            // 2. Add WhatsApp Inquire Button to all Reflow Products dynamically
            const observer = new MutationObserver(function(mutations) {
                const products = document.querySelectorAll('.ref-product');
                products.forEach(function(product) {
                    // Check if we already added the button
                    if (!product.querySelector('.kael-wa-inquire')) {
                        const nameEl = product.querySelector('.ref-name');
                        const priceEl = product.querySelector('.ref-price');
                        
                        if (nameEl) {
                            const productName = nameEl.textContent.trim();
                            const productPrice = priceEl ? priceEl.textContent.trim() : '';
                            
                            const waMessage = encodeURIComponent('مرحباً Kael Store، أود الاستفسار عن هذا المنتج:\\n📦 ' + productName + '\\n💰 السعر: ' + productPrice + '\\nهل هو متوفر حالياً؟');
                            const waLink = 'https://wa.me/' + waNumber + '?text=' + waMessage;

                            // Create the WhatsApp button
                            const waBtn = document.createElement('a');
                            waBtn.className = 'kael-wa-inquire';
                            waBtn.href = waLink;
                            waBtn.target = '_blank';
                            waBtn.innerHTML = '<i class="fab fa-whatsapp"></i> استفسار';
                            waBtn.style.cssText = 'display: inline-flex; align-items: center; justify-content: center; gap: 6px; background-color: #25D366; color: white; padding: 8px 15px; border-radius: 20px; text-decoration: none; font-weight: bold; font-size: 0.9em; margin-top: 10px; transition: all 0.3s ease; width: 100%;';

                            waBtn.onmouseover = () => waBtn.style.transform = 'scale(1.02)';
                            waBtn.onmouseout = () => waBtn.style.transform = 'scale(1)';

                            // Append it to the product body or actions area
                            const bodyEl = product.querySelector('.ref-product-data');
                            if (bodyEl) {
                                bodyEl.appendChild(waBtn);
                            } else {
                                product.appendChild(waBtn);
                            }
                        }
                    }
                });
            });

            // Start observing the body for Reflow products loading
            observer.observe(document.body, { childList: true, subtree: true });
        });
    </script>
`;

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');

    if (!content.includes('Smart WhatsApp Integration')) {
        content = content.replace('</body>', whatsappScript + '\\n</body>');
        fs.writeFileSync(path.join(dir, file), content, 'utf8');
        console.log('✅ Injected Smart WhatsApp to ' + file);
    }
});

console.log('✅ Done injecting WhatsApp script!');

