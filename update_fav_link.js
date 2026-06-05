const fs = require('fs');
const path = require('path');

const dir = 'z:/Kael store/kael final';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    // Replace the favorites link
    const oldFavLink = `<div><a href="#"><i class="fa fa-heart-o"></i><span>المفضلة</span>`;
    const newFavLink = `<div><a href="favorites.html"><i class="fa fa-heart-o"></i><span>المفضلة</span>`;
    
    if (content.includes(oldFavLink)) {
        content = content.replace(oldFavLink, newFavLink);
        fs.writeFileSync(path.join(dir, file), content, 'utf8');
        console.log(`Updated link in ${file}`);
    }
});
console.log('Link Update Complete');
