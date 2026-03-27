const fs = require('fs');
const p = 'c:\\Users\\Acer\\Desktop\\Be4L-Web\\components\\Dibs\\BrandOnboardingWizard.tsx';
let c = fs.readFileSync(p, 'utf8');

const m = 'className={`transition-all duration-700 ${isSunrise ? \'grayscale-0\' : \'grayscale-[0.8] invert-[0.9] hue-rotate-[180deg] brightness-[0.8] contrast-[1.2] opacity-60 group-hover:opacity-100\'}`}';
const r = 'className="w-full h-full transition-opacity duration-700 opacity-90 group-hover:opacity-100"';

if (c.includes(m)) {
    c = c.replace(m, r);
    fs.writeFileSync(p, c);
    console.log('Successfully removed filters.');
} else {
    console.error('Marker not found.');
    process.exit(1);
}
