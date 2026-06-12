const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const newWhatsappScript = `
    <!-- Smart WhatsApp Integration -->
    <style>
        .kael-wa-circle-btn {
            position: absolute !important;
            top: 55px !important; /* Below the wishlist heart which is at 10px */
            right: 10px !important;
            background: #25D366 !important;
            border: none !important;
            border-radius: 50% !important;
            width: 35px !important;
            height: 35px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-shadow: 0 3px 6px rgba(0,0,0,0.15) !important;
            color: #ffffff !important;
            font-size: 18px !important;
            cursor: pointer !important;
            z-index: 10 !important;
            transition: 0.3s !important;
        }
        .kael-wa-circle-btn:hover {
            transform: scale(1.1) !important;
        }
    </style>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const waNumber = "201113119058"; // Kael Store Number

            // 1. Update the main floating WhatsApp button
            const mainWpBtn = document.getElementById('wp');
            if (mainWpBtn) {
                const currentUrl = encodeURIComponent(window.location.href);
                mainWpBtn.href = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent('مرحباً، أود الاستفسار عن متجركم. أنا أتصفح هذه الصفحة: ') + currentUrl;
            }

            // 2. Add WhatsApp Inquire Button to all Reflow Products dynamically
            const observer = new MutationObserver(function(mutations) {
                const products = document.querySelectorAll('.ref-product');
                products.forEach(function(product) {
                    // Check if we already added the button
                    if (!product.querySelector('.kael-wa-circle-btn')) {
                        const nameEl = product.querySelector('.ref-name');
                        const priceEl = product.querySelector('.ref-price');
                        
                        if (nameEl) {
                            const productName = nameEl.textContent.trim();
                            const productPrice = priceEl ? priceEl.textContent.trim() : '';
                            
                            const waMessage = encodeURIComponent('مرحباً Kael Store، أود الاستفسار عن هذا المنتج:\\n📦 ' + productName + '\\n💰 السعر: ' + productPrice + '\\nهل هو متوفر حالياً؟');
                            const waLink = 'https://wa.me/' + waNumber + '?text=' + waMessage;

                            // Create the WhatsApp circle button
                            const waBtn = document.createElement('a');
                            waBtn.className = 'kael-wa-circle-btn';
                            waBtn.href = waLink;
                            waBtn.target = '_blank';
                            waBtn.innerHTML = '<i class="fab fa-whatsapp"></i>';
                            waBtn.title = 'استفسار عبر واتساب';

                            // Append it to the media container so it sits over the image like the heart
                            const mediaEl = product.querySelector('.ref-media');
                            if (mediaEl) {
                                mediaEl.appendChild(waBtn);
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

    // Replace the old Smart WhatsApp Integration entirely
    const oldScriptStart = content.indexOf('<!-- Smart WhatsApp Integration -->');
    if (oldScriptStart !== -1) {
        let oldScriptEnd = content.indexOf('</script>', oldScriptStart);
        if (oldScriptEnd !== -1) {
            oldScriptEnd += 9; // length of </script>
            content = content.substring(0, oldScriptStart) + newWhatsappScript + content.substring(oldScriptEnd);
            fs.writeFileSync(path.join(dir, file), content, 'utf8');
            console.log('✅ Replaced WhatsApp script in ' + file);
        }
    }
});

console.log('Done!');

