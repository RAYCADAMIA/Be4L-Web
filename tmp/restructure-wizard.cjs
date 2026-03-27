const fs = require('fs');
const p = 'c:\\Users\\Acer\\Desktop\\Be4L-Web\\components\\Dibs\\BrandOnboardingWizard.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Add Imports
if (!c.includes("import MapPicker from '../MapPicker';")) {
    c = c.replace("import getCroppedImg from '../../utils/cropImage';", "import getCroppedImg from '../../utils/cropImage';\nimport MapPicker from '../MapPicker';");
}

// 2. Add State
if (!c.includes("const [showMapPicker, setShowMapPicker] = useState(false);")) {
    c = c.replace("const [croppingIndex, setCroppingIndex] = useState<number | null>(null);", "const [croppingIndex, setCroppingIndex] = useState<number | null>(null);\n    const [showMapPicker, setShowMapPicker] = useState(false);");
}

// 3. Extract Vibe Tags section
const vibeRegex = /<div>\s*<label[^>]*><Tag[^>]* \/> Vibe Tags \(Max 5\)<\/label>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;
const vibeMatch = c.match(vibeRegex);

if (vibeMatch) {
    let vibeContent = vibeMatch[0];
    // Clean up trailing divs for insertion
    vibeContent = vibeContent.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>$/, '');

    // Remove from original position (Step 3)
    c = c.replace(vibeContent, '');

    // Insert into Step 2 (after tagline character count)
    const taglineEnd = "                                            </span>\n                                        </div>";
    if (c.includes(taglineEnd)) {
        c = c.replace(taglineEnd, taglineEnd + "\n\n                                        <div className=\"pt-4 border-t border-white/5\">\n" + vibeContent + "\n                                        </div>");
    }
}

// 4. Update Step 3 Labels and Minimap
c = c.replace("Help users find you via location and vibe tags.", "Map your brand on the marketplace feed.");
c = c.replace(/\{\(draft\.location_text \|\| draft\.google_maps_link\) && \(/, "true && (");

// 5. Add "Locate Me" button to minimap
const iframeEnd = "group-hover:opacity-100\"\\s*\\/>";
const iframeEndRegex = /className="w-full h-full transition-opacity duration-700 opacity-90 group-hover:opacity-100"\s*\/>/;
c = c.replace(iframeEndRegex, '$&\n                                                <button\n                                                    onClick={() => setShowMapPicker(true)}\n                                                    className="absolute top-3 right-3 p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black transition-all active:scale-95 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl z-10"\n                                                >\n                                                    <MapPin size={14} className="text-electric-teal" />\n                                                    Locate Me\n                                                </button>');

// 6. Add Map Picker Modal at the end
const lastDiv = "        </div>\n    );\n};";
if (!c.includes("showMapPicker && (")) {
    const modalCode = `
            {/* Map Picker Modal */}
            <AnimatePresence>
                {showMapPicker && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[400] bg-black shadow-2xl overflow-hidden"
                    >
                        <MapPicker
                            initialCoords={draft.lat && draft.lng ? { latitude: draft.lat, longitude: draft.lng } : undefined}
                            onSelect={(coords, address) => {
                                setDraft(prev => ({ ...prev, lat: coords.latitude, lng: coords.longitude }));
                                if (!draft.location_text) updateField('location_text', address);
                            }}
                            onClose={() => setShowMapPicker(false)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
`;
    c = c.replace(lastDiv, modalCode + lastDiv);
}

fs.writeFileSync(p, c);
console.log('Successfully restructured wizard.');
