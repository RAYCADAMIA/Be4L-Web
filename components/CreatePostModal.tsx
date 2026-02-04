import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Video, ShoppingBag, Plus, Tag } from 'lucide-react';
import { GradientButton } from './ui/AestheticComponents';
import { User, DibsItem } from '../types';
import { useToast } from './Toast';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, currentUser }) => {
    const [caption, setCaption] = useState('');
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    // Mock Tagging Logic (Would be a separate modal/dropdown in reality)
    const [taggedItem, setTaggedItem] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            // Limit to 5
            const total = mediaFiles.length + files.length;
            if (total > 5) {
                showToast('Maximum 5 media items allowed.', 'error');
                return;
            }

            const newPreviews = files.map(f => URL.createObjectURL(f));
            setMediaFiles(prev => [...prev, ...files]);
            setMediaPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const handleRemoveMedia = (index: number) => {
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
        setMediaPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!caption && mediaFiles.length === 0) return;

        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            showToast('Update posted successfully!', 'success');
            onClose();
            setCaption('');
            setMediaFiles([]);
            setMediaPreviews([]);
        }, 1500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-zinc-900 border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden relative z-10 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-900 sticky top-0 z-20">
                            <h2 className="text-white font-bold text-lg">New Update</h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                            {/* User Info */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden border border-white/10">
                                    <img src={currentUser.avatar_url} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">{currentUser.name}</p>
                                    <p className="text-electric-teal text-xs uppercase tracking-wider font-bold">Partner</p>
                                </div>
                            </div>

                            {/* Caption Input */}
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="What's new with your business?"
                                className="w-full bg-transparent text-white placeholder-gray-500 text-base resize-none focus:outline-none min-h-[100px]"
                            />

                            {/* Media Preview Grid */}
                            {mediaPreviews.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                    {mediaPreviews.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-white/10">
                                            <img src={url} className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => handleRemoveMedia(idx)}
                                                className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {mediaPreviews.length < 5 && (
                                        <label className="aspect-square rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors text-gray-500 hover:text-white">
                                            <Plus size={24} className="mb-1" />
                                            <span className="text-[10px] uppercase font-bold">Add</span>
                                            <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileSelect} />
                                        </label>
                                    )}
                                </div>
                            )}

                            {/* Action Bar */}
                            <div className="flex items-center gap-2 pt-2">
                                {mediaPreviews.length === 0 && (
                                    <label className="p-3 bg-white/5 rounded-xl text-electric-teal cursor-pointer hover:bg-white/10 transition-colors">
                                        <ImageIcon size={20} />
                                        <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileSelect} />
                                    </label>
                                )}
                                <button className="p-3 bg-white/5 rounded-xl text-electric-teal hover:bg-white/10 transition-colors">
                                    <Tag size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/5 bg-zinc-900 sticky bottom-0 z-20">
                            <GradientButton onClick={handleSubmit} disabled={isSubmitting || (!caption && mediaFiles.length === 0)} className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs">
                                {isSubmitting ? 'Posting...' : 'Post Update'}
                            </GradientButton>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
