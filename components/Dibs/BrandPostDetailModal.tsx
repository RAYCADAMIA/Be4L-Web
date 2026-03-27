import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, Share2, ShoppingBag, ChevronLeft, ChevronRight, Send, Smile } from 'lucide-react';
import { PartnerPost, User } from '../../types';
import { useNavigate } from 'react-router-dom';

interface BrandPostDetailModalProps {
    post: PartnerPost;
    currentUser: User;
    onClose: () => void;
}

export const BrandPostDetailModal: React.FC<BrandPostDetailModalProps> = ({ post, currentUser, onClose }) => {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [newComment, setNewComment] = useState('');
    const navigate = useNavigate();

    // Mock comments since PartnerPost doesn't have a comments array yet
    const [comments, setComments] = useState([
        { id: '1', user: 'adventure_seeker', text: 'This looks amazing! Can\'t wait to visit. 🔥', time: '2h' },
        { id: '2', user: 'davao_explorer', text: 'Highly recommended! The vibe is unmatched.', time: '5h' },
    ]);

    const handleNextMedia = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentMediaIndex < post.media_urls.length - 1) {
            setCurrentMediaIndex(prev => prev + 1);
        }
    };

    const handlePrevMedia = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentMediaIndex > 0) {
            setCurrentMediaIndex(prev => prev - 1);
        }
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        const comment = {
            id: Date.now().toString(),
            user: currentUser.username,
            text: newComment,
            time: 'Just now'
        };
        setComments([comment, ...comments]);
        setNewComment('');
    };

    const handleShare = async () => {
        const shareData = {
            title: `Check out ${post.operator.business_name} on Be4L`,
            text: post.caption,
            url: window.location.origin + `/app/shop/${post.operator.slug}?post=${post.id}`
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.url);
                alert("Link copied to clipboard!");
            }
        } catch (err) {
            console.log('Share failed', err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 pt-20 pb-32 md:p-6"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-4xl h-full md:h-[85vh] bg-deep-black/90 backdrop-blur-3xl md:rounded-[2.5rem] rounded-[2rem] overflow-hidden flex flex-col md:flex-row border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]"
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button Mobile */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-[110] p-2 bg-black/50 backdrop-blur-md rounded-full text-white md:hidden border border-white/10"
                >
                    <X size={20} />
                </button>

                {/* Left: Media Area */}
                <div className="relative w-full md:w-3/5 h-[40vh] md:h-full bg-black flex items-center justify-center overflow-hidden shrink-0">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentMediaIndex}
                            src={post.media_urls[currentMediaIndex]}
                            className="w-full h-full object-cover"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        />
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    {post.media_urls.length > 1 && (
                        <>
                            {currentMediaIndex > 0 && (
                                <button
                                    onClick={handlePrevMedia}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                            )}
                            {currentMediaIndex < post.media_urls.length - 1 && (
                                <button
                                    onClick={handleNextMedia}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            )}
                        </>
                    )}

                    {/* Progress Dots */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 p-1.5 bg-black/20 backdrop-blur-sm rounded-full">
                        {post.media_urls.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentMediaIndex ? 'bg-electric-teal w-4' : 'bg-white/40'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Right: Info & Interactions */}
                <div className="w-full md:w-2/5 flex flex-col bg-deep-black/30 backdrop-blur-3xl md:border-l border-white/5 h-full">
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <div
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => navigate(`/app/shop/${post.operator.slug}`)}
                        >
                            <div className="w-10 h-10 rounded-full border-2 border-electric-teal p-0.5 group-hover:scale-105 transition-transform">
                                <img src={post.operator.logo_url} className="w-full h-full rounded-full object-cover" />
                            </div>
                            <div>
                                <h3 className="text-white font-black text-sm uppercase tracking-wider">{post.operator.business_name}</h3>
                                <p className="text-electric-teal text-[10px] font-bold uppercase tracking-widest">{post.operator.category}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="hidden md:flex p-2 text-gray-500 hover:text-white transition-colors hover:bg-white/5 rounded-full"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
                        {/* Caption Section */}
                        <div className="space-y-3">
                            <p className="text-white text-[15px] leading-relaxed font-medium whitespace-pre-wrap">
                                {post.caption}
                            </p>
                            <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">
                                Released {new Date(post.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>

                        {/* Tagged Item Card */}
                        {post.tagged_item && (
                            <div
                                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-all group"
                                onClick={() => navigate(`/app/shop/${post.operator.slug}`)}
                            >
                                <div className="w-16 h-16 rounded-xl bg-black overflow-hidden shrink-0 border border-white/5">
                                    <img src={post.tagged_item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Featured Item</p>
                                    <h4 className="text-white font-bold text-sm truncate uppercase tracking-tight">{post.tagged_item.title}</h4>
                                    <p className="text-electric-teal font-black text-sm">₱{post.tagged_item.price.toLocaleString()}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-electric-teal text-black flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.4)] group-hover:scale-110 transition-transform">
                                    <ShoppingBag size={18} />
                                </div>
                            </div>
                        )}

                        {/* Comments List */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                                <MessageCircle size={12} /> Community Dialogue
                            </h4>
                            <div className="space-y-6">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 shrink-0 flex items-center justify-center overflow-hidden">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user}`} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-black text-xs uppercase tracking-tight">{comment.user}</span>
                                                <span className="text-gray-500 text-[10px]">{comment.time}</span>
                                            </div>
                                            <p className="text-gray-400 text-sm leading-relaxed">{comment.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom: Interactions & Input */}
                    <div className="mt-auto border-t border-white/5 bg-black/40 backdrop-blur-md p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => setIsLiked(!isLiked)}
                                    className="flex items-center gap-2 transition-all active:scale-90 group"
                                >
                                    <Heart
                                        size={24}
                                        className={`${isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-white/60 group-hover:text-white'} transition-all`}
                                    />
                                    <span className="text-white font-black text-sm">{post.likes_count + (isLiked ? 1 : 0)}</span>
                                </button>
                                <button className="flex items-center gap-2 group">
                                    <MessageCircle size={24} className="text-white/60 group-hover:text-white transition-all" />
                                    <span className="text-white font-black text-sm">{post.comments_count + (comments.length - 2)}</span>
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-2 group"
                                >
                                    <Share2 size={24} className="text-white/60 group-hover:text-white transition-all" />
                                    <span className="text-white font-black text-sm uppercase tracking-widest text-[10px]">Share</span>
                                </button>
                            </div>
                        </div>

                        {/* Comment Input */}
                        <div className="relative">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                                placeholder="Share your thoughts..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 pr-14 text-white placeholder-gray-600 outline-none text-sm focus:border-electric-teal/50 transition-colors"
                            />
                            <button
                                onClick={handleAddComment}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-electric-teal hover:bg-electric-teal/10 rounded-full transition-colors"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
