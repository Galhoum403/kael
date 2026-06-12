const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: fs.createReadStream('C:\\Users\\i-seven\\.gemini\\antigravity\\brain\\9f0a53ec-e271-4647-854b-f204caa99054\\.system_generated\\logs\\transcript_full.jsonl'),
    crlfDelay: Infinity
});

let found = false;

rl.on('line', (line) => {
    if (line.includes('"type":"USER_INPUT"') && line.includes('wheelAnimation')) {
        const data = JSON.parse(line);
        fs.writeFileSync('z:/Kael store/kael final/scratch_wheel.html', data.content, 'utf8');
        found = true;
    }
});

rl.on('close', () => {
    if (found) console.log('Found and extracted.');
    else console.log('Not found.');
});
