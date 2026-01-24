import React, { useState } from 'react';
import { Search, ArrowUpRight, TrendingUp, ChevronLeft } from 'lucide-react';
import { MOCK_USER, MOCK_QUESTS, MOCK_CAPTURES, OTHER_USERS } from '../constants';
import { Quest, Capture, User as UserType } from '../types';

interface SearchScreenProps {
    onClose: () => void;
    onOpenQuest: (q: Quest) => void;
    onOpenPost: (c: Capture) => void;
    onOpenProfile: (u: UserType) => void;
    onBack?: () => void;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ onClose, onOpenQuest, onOpenPost, onOpenProfile, onBack }) => {
    const [searchText, setSearchText] = useState('');
    const categories = ['Sports', 'Adventures', 'Travel', 'Social', 'Train', 'Others'];
    const popularSearches = ['Pickleball tournaments', 'Rave tonight', 'Coffee shops', 'Marathon training'];

    return (
        <div className="flex-1 h-full bg-deep-black overflow-y-auto pb-14 animate-in fade-in duration-300">
            {/* Search Header */}
            <div className="sticky top-0 z-30 bg-deep-black/95 backdrop-blur-md px-4 py-4 pt-[15px] border-b border-transparent">
                <div className="relative flex items-center gap-3">
                    <button
                        onClick={() => searchText ? setSearchText('') : onClose()}
                        className="p-2 -ml-2 text-gray-400 hover:text-white"
                    >
                        <ChevronLeft />
                    </button>
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            autoFocus
                            type="text"
                            placeholder="Search Be4L..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/[0.05] rounded-full py-3 pl-12 pr-4 text-white placeholder-gray-600 outline-none focus:border-primary/30 transition-all font-medium"
                        />
                        {searchText && (
                            <button onClick={() => setSearchText('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs font-bold uppercase">
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="px-4 py-6 space-y-8">
                {/* Search Results */}
                {searchText ? (
                    <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h3 className="text-white font-bold text-lg mb-4">Results for "{searchText}"</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Filtered Quests */}
                            {MOCK_QUESTS.filter(q => q.title.toLowerCase().includes(searchText.toLowerCase()) || q.category.toLowerCase().includes(searchText.toLowerCase())).map(q => (
                                <div key={q.id} onClick={() => onOpenQuest(q)} className="aspect-[3/4] rounded-2xl bg-white/[0.03] relative overflow-hidden group cursor-pointer border border-white/[0.02]">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                                    <div className="absolute bottom-3 left-3 right-3 text-left">
                                        <span className="text-[10px] font-black text-primary uppercase bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm mb-1 inline-block">{q.category}</span>
                                        <h4 className="text-white font-bold text-sm leading-tight line-clamp-2">{q.title}</h4>
                                    </div>
                                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                                </div>
                            ))}
                            {/* Filtered Captures */}
                            {MOCK_CAPTURES.filter(c => c.user?.username?.toLowerCase().includes(searchText.toLowerCase()) || c.caption?.toLowerCase().includes(searchText.toLowerCase())).map(c => (
                                <div key={c.id} onClick={() => onOpenPost(c)} className="aspect-[3/4] rounded-2xl bg-black relative overflow-hidden group cursor-pointer border border-white/[0.02]">
                                    <img src={c.back_image_url || undefined} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                                    {c.user && c.user.avatar_url && <img src={c.user.avatar_url} className="absolute bottom-3 left-3 w-6 h-6 rounded-full border border-white/50" />}
                                </div>
                            ))}
                            {/* Empty State */}
                            {MOCK_QUESTS.filter(q => q.title.toLowerCase().includes(searchText.toLowerCase()) || q.category.toLowerCase().includes(searchText.toLowerCase())).length === 0 &&
                                MOCK_CAPTURES.filter(c => c.user.username.toLowerCase().includes(searchText.toLowerCase()) || c.caption?.toLowerCase().includes(searchText.toLowerCase())).length === 0 && (
                                    <div className="col-span-2 text-center py-12 text-gray-500 text-sm">
                                        No results found.
                                    </div>
                                )}
                        </div>
                    </section>
                ) : (
                    <>
                        {/* Popular Now */}
                        <section>
                            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                It's Popular now
                            </h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-3">
                                {popularSearches.map((term, i) => (
                                    <button key={i} onClick={() => setSearchText(term)} className="text-gray-400 text-sm hover:text-primary transition-colors flex items-center gap-1 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" /> {term}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Categories */}
                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-white font-bold text-lg">Categories</h3>
                                <button className="text-primary text-xs font-bold uppercase hover:opacity-80">See All</button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {categories.map((cat, i) => (
                                    <button key={i} onClick={() => setSearchText(cat)} className="bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.02] rounded-xl p-4 text-left transition-all group">
                                        <span className="text-gray-300 font-bold group-hover:text-white transition-colors">{cat}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* You Might Like It */}
                        <section>
                            <h3 className="text-white font-bold text-lg mb-4">You might like it</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Mix of Quests and Posts */}
                                {MOCK_QUESTS.slice(0, 2).map(q => (
                                    <div key={q.id} onClick={() => onOpenQuest(q)} className="aspect-[3/4] rounded-2xl bg-white/[0.03] relative overflow-hidden group cursor-pointer border border-white/[0.02]">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                                        <div className="absolute bottom-3 left-3 right-3 text-left">
                                            <span className="text-[10px] font-black text-primary uppercase bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm mb-1 inline-block">{q.category}</span>
                                            <h4 className="text-white font-bold text-sm leading-tight line-clamp-2">{q.title}</h4>
                                        </div>
                                        {/* Placeholder Gradient since no image prop on quest yet properly mapped */}
                                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                                    </div>
                                ))}
                                {MOCK_CAPTURES.map(c => (
                                    <div key={c.id} onClick={() => onOpenPost(c)} className="aspect-[3/4] rounded-2xl bg-black relative overflow-hidden group cursor-pointer border border-white/5">
                                        <img src={c.back_image_url || undefined} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                                        {c.user && c.user.avatar_url && <img src={c.user.avatar_url} className="absolute bottom-3 left-3 w-6 h-6 rounded-full border border-white/50" />}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchScreen;
