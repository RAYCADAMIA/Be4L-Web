import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, ShoppingBag, Send } from 'lucide-react';
import { supabaseService } from '../../services/supabaseService';
import { DibsItem } from '../../types';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    operatorId: string;
    onSuccess: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, operatorId, onSuccess }) => {
    const [caption, setCaption] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [selectedItemId, setSelectedItemId] = useState<string>('');
    const [items, setItems] = useState<DibsItem[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadItems();
        }
    }, [isOpen]);

    const loadItems = async () => {
        const data = await supabaseService.dibs.getItems(operatorId);
        setItems(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!caption || !imageUrl) return;

        setSubmitting(true);
        const res = await supabaseService.partner.createPost({
            operator_id: operatorId,
            caption,
            media_urls: [imageUrl],
            tagged_item_id: selectedItemId || undefined
        });

        setSubmitting(false);
        if (res.success) {
            setCaption('');
            setImageUrl('');
            setSelectedItemId('');
            onSuccess();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-white font-black uppercase tracking-wider text-sm">Create Partner Update</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Image Input */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Post Image</label>
                        <div className="flex gap-4">
                            <div className="w-24 h-24 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center shrink-0 overflow-hidden bg-white/5">
                                {imageUrl ? (
                                    <img src={imageUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <Image size={24} className="text-gray-600" />
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <input
                                    type="url"
                                    placeholder="Paste image URL..." // Simplified for prototype
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-electric-teal/50"
                                    required
                                />
                                <p className="text-[9px] text-gray-500">Supported formats: JPG, PNG, WEBP</p>
                            </div>
                        </div>
                    </div>

                    {/* Caption */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Caption</label>
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Share the latest news, events, or vibes..."
                            rows={4}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-electric-teal/50 resize-none"
                            required
                        />
                    </div>

                    {/* Tag Item */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <ShoppingBag size={12} className="text-electric-teal" /> Tag Item (Optional)
                        </label>
                        <select
                            value={selectedItemId}
                            onChange={(e) => setSelectedItemId(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-electric-teal/50"
                        >
                            <option value="">No item tagged</option>
                            {items.map(item => (
                                <option key={item.id} value={item.id}>{item.title}</option>
                            ))}
                        </select>
                    </div>

                    {/* Action */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-electric-teal hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                        {submitting ? 'Posting...' : <><Send size={14} /> Post Update</>}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default CreatePostModal;
