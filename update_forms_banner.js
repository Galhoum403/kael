const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    let modified = false;

    // Update banner in index.html
    if (file === 'index.html' && content.includes('<a class="primary-btn cta-btn" href="#">تسوق الآن</a>')) {
        content = content.replace('<a class="primary-btn cta-btn" href="#">تسوق الآن</a>', '<a class="primary-btn cta-btn" href="offers.html">تسوق الآن</a>');
        modified = true;
    }

    // Update Newsletter form in all files
    const oldNewsletter = `<form class="d-flex justify-content-center" style="max-width: 500px; margin: auto;">
                            <input type="email" class="form-control text-end" placeholder="أدخل بريدك الإلكتروني..." required>
                            <button type="submit" class="btn me-2">اشترك الآن</button>
                        </form>`;
    
    const newNewsletter = `<form action="https://api.web3forms.com/submit" method="POST" class="d-flex justify-content-center" style="max-width: 500px; margin: auto;">
                            <input type="hidden" name="access_key" value="YOUR_WEB3FORMS_ACCESS_KEY_HERE">
                            <input type="hidden" name="subject" value="اشتراك جديد في القائمة البريدية!">
                            <input type="hidden" name="redirect" value="https://web3forms.com/success">
                            <input type="email" name="email" class="form-control text-end" placeholder="أدخل بريدك الإلكتروني..." required>
                            <button type="submit" class="btn me-2">اشترك الآن</button>
                        </form>`;
    
    if (content.includes(oldNewsletter)) {
        content = content.replace(oldNewsletter, newNewsletter);
        modified = true;
    }

    // Update Contact Form in contact.html
    if (file === 'contact.html') {
        const oldContact = `<form action="https://formspree.io/f/your_form_id" method="POST">`;
        const newContact = `<form action="https://api.web3forms.com/submit" method="POST">
                        <input type="hidden" name="access_key" value="YOUR_WEB3FORMS_ACCESS_KEY_HERE">
                        <input type="hidden" name="subject" value="رسالة جديدة من صفحة تواصل معنا!">
                        <input type="hidden" name="redirect" value="https://web3forms.com/success">`;
        
        if (content.includes(oldContact)) {
            content = content.replace(oldContact, newContact);
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(path.join(dir, file), content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
console.log('Forms Update Complete');
