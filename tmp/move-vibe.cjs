const fs = require('fs');
const p = 'c:\\Users\\Acer\\Desktop\\Be4L-Web\\components\\Dibs\\BrandOnboardingWizard.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Move Vibe Tags
const vibeStart = '                                        <div>\n                                            <label className={`text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${isSunrise ? \'text-orange-950/60\' : \'text-gray-400\'}`}><Tag size={12} /> Vibe Tags (Max 5)</label>';
const vibeEnd = '                                                    </div>\n                                                );\n                                            })}\n                                        </div>\n                                    </div>';

// Try to find vibe section using a more reliable method
const vibeRegex = /<div>\s*<label[^>]*><Tag[^>]* \/> Vibe Tags \(Max 5\)<\/label>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;
const vibeMatch = c.match(vibeRegex);

if (!vibeMatch) {
    console.log("Vibe match NOT found. Check content.");
    process.exit(1);
}

const originalVibeBlock = vibeMatch[0];
// Clean up for Step 2
const cleanedVibe = originalVibeBlock.match(/<div>\s*<label[^>]*><Tag[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/)[0];

// Remove from Step 3
c = c.replace(originalVibeBlock, '</div></div></div>');

// Insert into Step 2
const taglineBlock = '                                            <span className={`absolute bottom-4 right-4 text-[10px] font-mono ${draft.tagline?.length === 100 ? \'text-red-400\' : \'text-gray-500\'}`}>\n                                                {draft.tagline?.length || 0}/100\n                                            </span>\n                                        </div>';

if (c.includes(taglineBlock)) {
    c = c.replace(taglineBlock, taglineBlock + '\n\n                                        <div className="pt-6 border-t border-white/5">\n                                            ' + cleanedVibe.trim() + '\n                                        </div>');
} else {
    console.log("Tagline block NOT found. Indentation might be different.");
    // Try a laxer match
    const laxTagline = /<span[^>]*>\s*\{draft\.tagline\?\.length \|\| 0\}\/100\s*<\/span>\s*<\/div>/;
    const match2 = c.match(laxTagline);
    if (match2) {
        c = c.replace(match2[0], match2[0] + '\n\n                                        <div className="pt-6 border-t border-white/5">\n                                            ' + cleanedVibe.trim() + '\n                                        </div>');
    } else {
        process.exit(1);
    }
}

fs.writeFileSync(p, c);
console.log("Success.");
