const fs = require('fs');
const p = 'c:\\Users\\Acer\\Desktop\\Be4L-Web\\components\\Dibs\\BrandOnboardingWizard.tsx';
let c = fs.readFileSync(p, 'utf8');

// 1. Ensure Imports
if (!c.includes('import MapPicker from \'../MapPicker\';')) {
    c = c.replace('import getCroppedImg from \'../../utils/cropImage\';', 'import getCroppedImg from \'../../utils/cropImage\';\nimport MapPicker from \'../MapPicker\';');
}

// 2. Ensure State
if (!c.includes('[showMapPicker, setShowMapPicker]')) {
    c = c.replace('const [croppingIndex, setCroppingIndex] = useState<number | null>(null);', 'const [croppingIndex, setCroppingIndex] = useState<number | null>(null);\n    const [showMapPicker, setShowMapPicker] = useState(false);');
}

// 3. Move Vibe Tags
const taglineMarker = '<span className={`absolute bottom-4 right-4 text-[10px] font-mono ${draft.tagline?.length === 100 ? \'text-red-400\' : \'text-gray-500\'}`}>';
const taglineEndMarker = '</span>\n                                        </div>';

// Find Vibe Tags section
const sectionRegex = /<div>\s*<label[^>]*><Tag[^>]* \/> Vibe Tags \(Max 5\)<\/label>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;
const match = c.match(sectionRegex);

if (match) {
    let vibeCode = match[0];

    // Clean up trailing divs for insertion in Step 2 which already has its wrapper
    // We want to keep the label and its content
    const cleanedVibe = vibeCode.match(/<div>\s*<label[^>]*><Tag[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/)[0];

    // Remove the whole block from Step 3
    c = c.replace(vibeCode, '</div></div></div>'); // Close the wrapping divs in Step 3

    // Insert into Step 2 after tagline
    const insertionPoint = c.indexOf('</span>\n                                        </div>') + '</span>\n                                        </div>'.length;
    if (insertionPoint > 0) {
        c = c.substring(0, insertionPoint) + '\n\n                                        <div className="pt-6 border-t border-white/5">\n                                            ' + cleanedVibe.trim() + '\n                                        </div>' + c.substring(insertionPoint);
    }
}

// 4. Update Step 3 labels and persistent minimap
c = c.replace('Help users find you via location and vibe tags.', 'Map your brand on the marketplace feed.');
c = c.replace('true && (', '(true) && ('); // Ensure it was replaced and make it clear

// 5. Iframe styling and button
const iframeRegex = /<iframe[\s\S]*?className="w-full h-full transition-opacity duration-700 opacity-90 group-hover:opacity-100"\s*\/>/;
if (!c.includes('setShowMapPicker(true)')) {
    c = c.replace(iframeRegex, (m) => {
        return m + '\n                                                <button\n                                                    onClick={() => setShowMapPicker(true)}\n                                                    className="absolute top-3 right-3 p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black transition-all active:scale-95 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl z-20"\n                                                >\n                                                    <MapPin size={14} className="text-electric-teal" />\n                                                    Locate Me\n                                                </button>';
    });
}

// 6. Modal at end
if (!c.includes('showMapPicker && (')) {
    const modal = `
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
            </AnimatePresence>`;

    const lastPart = "        </div>\n    );\n};";
    c = c.replace(lastPart, modal + '\n' + lastPart);
}

fs.writeFileSync(p, c);
console.log('Wizard updated.');
