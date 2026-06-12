const fs = require('fs');
let html = fs.readFileSync('kael-portal-7x9.html', 'utf8');
let match = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
let script = match.replace(/import .*/g, '');
const mock = `
const initializeApp = ()=>({});
const getDatabase = ()=>({});
const getAuth = ()=>({});
const ref = ()=>({});
const set = ()=>({then:()=>({catch:()=>({finally:()=>{}})})});
const onValue = (r, cb)=>{
    cb({val:()=>({seasonal_theme: true})});
};
const onAuthStateChanged = ()=>{};
const signInWithEmailAndPassword = ()=>({then:()=>({catch:()=>{}})});
const signOut = ()=>{};
const document = {
    getElementById: (id) => ({style:{}, classList:{replace:()=>{}}, checked: false, value: ''}),
    querySelectorAll: ()=>[],
    querySelector: ()=>({innerHTML:''})
};
const window = {};
const alert = ()=>{};
`;
fs.writeFileSync('test_run.js', mock + '\n' + script);
