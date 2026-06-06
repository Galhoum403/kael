const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    // Regular expression to match the Favorites div block
    const regex = /<div><a href="favorites\.html"><i class="fa fa-heart-o"><\/i><span>المفضلة<\/span>[\s\S]*?<div class="qty"><span>0<\/span><\/div>[\s\S]*?<\/a><\/div>/;
    
    if (regex.test(content)) {
        content = content.replace(regex, '');
        fs.writeFileSync(path.join(dir, file), content, 'utf8');
        console.log(`Removed Favorites from ${file}`);
    }
});
console.log('Update Complete');
