const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const seoTags = `    <meta name="description" content="متجر Kael وجهتك الأولى للهدايا الفاخرة، الساعات، والإكسسوارات. تسوق الآن لأفضل الهدايا لجميع المناسبات.">
    <meta name="keywords" content="هدايا, ساعات, إكسسوارات, متجر هدايا, هدايا فاخرة, هدايا رجالي, هدايا نسائي, هدايا عيد ميلاد">
    <meta property="og:title" content="Kael Store | متجر الهدايا الفاخرة">
    <meta property="og:description" content="متجر Kael وجهتك الأولى للهدايا الفاخرة، الساعات، والإكسسوارات. تسوق الآن لأفضل الهدايا لجميع المناسبات.">
    <meta property="og:image" content="assets/img/logo.png">
    <meta property="og:type" content="website">
`;

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    // Fix the literal \n bug
    content = content.replace(/\\n\s*<link/g, '\n    <link');
    
    if (!content.includes('og:title')) {
        content = content.replace('</head>', seoTags + '</head>');
    }
    
    fs.writeFileSync(path.join(dir, file), content, 'utf8');
});
console.log('SEO update Complete');
