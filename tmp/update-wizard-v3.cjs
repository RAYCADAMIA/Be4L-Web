const fs = require('fs');
const p = 'c:\\Users\\Acer\\Desktop\\Be4L-Web\\components\\Dibs\\BrandOnboardingWizard.tsx';
let content = fs.readFileSync(p, 'utf8');

// 1. Add Import
if (!content.includes("import MapPicker from '../MapPicker';")) {
    content = content.replace("import getCroppedImg from '../../utils/cropImage';", "import getCroppedImg from '../../utils/cropImage';\nimport MapPicker from '../MapPicker';");
}

// 2. Add State
if (!content.includes("showMapPicker")) {
    content = content.replace("const [croppingIndex, setCroppingIndex] = useState<number | null>(null);", "const [croppingIndex, setCroppingIndex] = useState<number | null>(null);\n    const [showMapPicker, setShowMapPicker] = useState(false);");
}

// 3. Move Vibe Tags
// The vibe tags section is roughly lines 470-520 as per recent view_file
// Let's find it by the unique label
const vibeSearch = "<label className={`text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${isSunrise ? 'text-orange-950/60' : 'text-gray-400'}`}><Tag size={12} /> Vibe Tags (Max 5)</label>";
const vibeStartIndex = content.indexOf(vibeSearch);

if (vibeStartIndex !== -1) {
    // We want the parent <div> which is roughly 40 spaces before
    const divStart = content.lastIndexOf("<div>", vibeStartIndex);
    // Find the end of this section. It ends before step === 4
    const nextStepIndex = content.indexOf("step === 4", vibeStartIndex);
    const divEnd = content.lastIndexOf("</div>", nextStepIndex);
    // We need to be careful with nested divs. 
    // The section usually looks like:
    /*
    <div>
        <label>Vibe Tags</label>
        ...
        <div>Preset Tags</div>
    </div>
    */
    // Let's just grab the whole thing based on the view_file block
    const vibeBlockFull = content.substring(divStart, divEnd + 6); // +6 for </div>

    // Clean up block for insertion
    let vibeToInsert = vibeBlockFull.trim();
    // Wrap it in a nice container for Step 2
    vibeToInsert = `\n\n                                        <div className="pt-6 border-t border-white/5">\n                                            ${vibeToInsert}\n                                        </div>`;

    // Remove from content
    content = content.replace(vibeBlockFull, "");

    // Insert into Step 2 after character count
    const taglineCount = "{draft.tagline?.length || 0}/100";
    const taglineCountIndex = content.indexOf(taglineCount);
    const taglineDivEnd = content.indexOf("</div>", taglineCountIndex);

    if (taglineCountIndex !== -1) {
        content = content.substring(0, taglineDivEnd + 6) + vibeToInsert + content.substring(taglineDivEnd + 6);
    }
}

// 4. Update persistent minimap (if not already done)
content = content.replace(/\{\(draft\.location_text \|\| draft\.google_maps_link\) && \(/, "true && (");

// 5. Add "Locate Me" button to iframe (if not already done)
if (!content.includes("Locate Me")) {
    const iframeTag = '<iframe';
    const iframeEnd = '/>';
    const iframeIndex = content.indexOf(iframeTag);
    const iframeCloseIndex = content.indexOf(iframeEnd, iframeIndex);

    if (iframeIndex !== -1) {
        const button = '\n                                                <button\n                                                    onClick={() => setShowMapPicker(true)}\n                                                    className="absolute top-3 right-3 p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black transition-all active:scale-95 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl z-20"\n                                                >\n                                                    <MapPin size={14} className="text-electric-teal" />\n                                                    Locate Me\n                                                </button>';
        content = content.substring(0, iframeCloseIndex + 2) + button + content.substring(iframeCloseIndex + 2);
    }
}

// 6. Add Modal at end
if (!content.includes("Map Picker Modal")) {
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
            </AnimatePresence>
`;
    const lastPart = "        </div>\n    );\n};";
    content = content.replace(lastPart, modal + lastPart);
}

fs.writeFileSync(p, content);
console.log("Wizard updated successfully.");
