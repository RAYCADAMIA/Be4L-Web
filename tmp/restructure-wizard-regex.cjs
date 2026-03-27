const fs = require('fs');
const p = 'c:\\Users\\Acer\\Desktop\\Be4L-Web\\components\\Dibs\\BrandOnboardingWizard.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Move Vibe Tags (Regex based)
const vibeSectionRegex = /<div>\s*<label[^>]*><Tag[^>]* \/> Vibe Tags \(Max 5\)<\/label>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;
const vibeMatch = c.match(vibeSectionRegex);

if (vibeMatch) {
    let vibeCode = vibeMatch[0];
    const cleanedVibe = vibeCode.match(/<div>\s*<label[^>]*><Tag[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/)[0];

    // Remove from Step 3
    c = c.replace(vibeCode, '</div></div></div>');

    // Insert into Step 2 after character count block
    const taglineBlockRegex = /<span[^>]*>\s*\{draft\.tagline\?\.length \|\| 0\}\/100\s*<\/span>\s*<\/div>/;
    const taglineMatch = c.match(taglineBlockRegex);
    if (taglineMatch) {
        c = c.replace(taglineMatch[0], taglineMatch[0] + '\n\n                                        <div className="pt-6 border-t border-white/5">\n                                            ' + cleanedVibe.trim() + '\n                                        </div>');
    }
}

// 2. Ensure Persistent Minimap
c = c.replace(/\(true\)\s*&&\s*\(/, 'true && ('); // Normalizing
c = c.replace(/\{\(draft\.location_text \|\| draft\.google_maps_link\) && \(/, "true && (");

// 3. Iframe Locate Me button
const iframeTag = '<iframe';
const iframeClose = '/>';
const iframeSearchRegex = /<iframe[\s\S]*?\/>/;

if (!c.includes('setShowMapPicker(true)')) {
    c = c.replace(iframeSearchRegex, (m) => {
        return m + '\n                                                <button\n                                                    onClick={() => setShowMapPicker(true)}\n                                                    className="absolute top-3 right-3 p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black transition-all active:scale-95 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl z-20"\n                                                >\n                                                    <MapPin size={14} className="text-electric-teal" />\n                                                    Locate Me\n                                                </button>';
    });
}

fs.writeFileSync(p, c);
console.log('Restructured via regex.');
