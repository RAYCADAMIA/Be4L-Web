import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { PartnerPost } from '../../types';
import { useNavigate } from 'react-router-dom';

interface PartnerFeedProps {
    posts: PartnerPost[];
    onOpenProfile: (operatorId: string) => void;
}

export const PartnerFeed: React.FC<PartnerFeedProps> = ({ posts, onOpenProfile }) => {
    return (
        <div className="space-y-6 pb-20">
            <h2 className="text-white font-black text-lg px-4 flex items-center gap-2">
                <span className="text-electric-teal">Currently</span> Trending
            </h2>
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-4 no-scrollbar">
                {posts.map(post => (
                    <PartnerPostCard key={post.id} post={post} onOpenProfile={onOpenProfile} />
                ))}
            </div>
        </div>
    );
};

const PartnerPostCard: React.FC<{ post: PartnerPost; onOpenProfile: (id: string) => void }> = ({ post, onOpenProfile }) => {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const navigate = useNavigate();

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

    return (
        <div className="min-w-[300px] w-[300px] md:min-w-[350px] bg-zinc-900/50 border border-white/5 rounded-3xl overflow-hidden snap-center flex flex-col shrink-0">
            {/* Header */}
            <div className="p-3 flex items-center justify-between bg-black/20 backdrop-blur-sm">
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => onOpenProfile(post.operator_id)}
                >
                    <div className="w-8 h-8 rounded-full border border-electric-teal p-0.5">
                        <img src={post.operator.avatar_url} className="w-full h-full rounded-full object-cover" />
                    </div>
                    <div>
                        <p className="text-white text-xs font-bold">{post.operator.business_name}</p>
                        <p className="text-electric-teal text-[10px] font-bold uppercase tracking-wider">Partner Update</p>
                    </div>
                </div>
                <button className="text-gray-400">
                    <MoreHorizontal size={16} />
                </button>
            </div>

            {/* Media Carousel */}
            <div className="relative aspect-[4/5] bg-black group">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentMediaIndex}
                        src={post.media_urls[currentMediaIndex]}
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                </AnimatePresence>

                {/* Navigation Arrows */}
                {post.media_urls.length > 1 && (
                    <>
                        {currentMediaIndex > 0 && (
                            <button
                                onClick={handlePrevMedia}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <ChevronLeft size={16} />
                            </button>
                        )}
                        {currentMediaIndex < post.media_urls.length - 1 && (
                            <button
                                onClick={handleNextMedia}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <ChevronRight size={16} />
                            </button>
                        )}
                        {/* Dots */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {post.media_urls.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentMediaIndex ? 'bg-white' : 'bg-white/30'}`}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Tagged Item Overlay */}
                {post.tagged_item && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-xl flex items-center gap-3 border border-white/10 cursor-pointer hover:bg-black/80 transition-colors"
                        onClick={() => navigate(`/app/shop/${post.operator.slug}`)} // Assuming slug routing
                    >
                        <div className="w-10 h-10 rounded-lg bg-gray-800 overflow-hidden shrink-0">
                            <img src={post.tagged_item.image_url} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-bold truncate">{post.tagged_item.title}</p>
                            <p className="text-electric-teal text-xs font-bold">₱{post.tagged_item.price}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shrink-0">
                            <ShoppingBag size={14} />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Actions & Caption */}
            <div className="p-3">
                <div className="flex items-center gap-4 mb-3">
                    <button onClick={() => setIsLiked(!isLiked)} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-white transition-colors">
                        <Heart size={18} className={isLiked ? "fill-red-500 text-red-500" : ""} />
                        <span>{post.likes_count + (isLiked ? 1 : 0)}</span>
                    </button>
                    <button className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-white transition-colors">
                        <MessageCircle size={18} />
                        <span>{post.comments_count}</span>
                    </button>
                    <button className="ml-auto text-gray-400">
                        <Share2 size={18} />
                    </button>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">
                    <span className="font-bold text-white mr-2">{post.operator.business_name}</span>
                    {post.caption}
                </p>
            </div>
        </div>
    );
};
