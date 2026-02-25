import React, { useState, useEffect } from 'react';
import { Search, ArrowUpRight, TrendingUp, ChevronLeft, User as UserIcon, Zap, Shield } from 'lucide-react';
import { MOCK_USER, MOCK_QUESTS, MOCK_CAPTURES, OTHER_USERS } from '../constants';
import { Quest, Capture, User as UserType } from '../types';
import { supabaseService } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';

interface SearchScreenProps {
    onClose: () => void;
    onOpenQuest: (q: Quest) => void;
    onOpenPost: (c: Capture) => void;
    onOpenProfile: (u: UserType) => void;
    onBack?: () => void;
}

const SearchScreen: React.FC<SearchScreenProps> = ({ onClose, onOpenQuest, onOpenPost, onOpenProfile, onBack }) => {
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState<{
        quests: Quest[],
        posts: Capture[],
        users: UserType[]
    }>({ quests: [], posts: [], users: [] });
    const [loading, setLoading] = useState(false);
    const { user: currentUser } = useAuth();

    const categories = ['Sports', 'Adventures', 'Travel', 'Social', 'Train', 'Others'];
    const popularSearches = ['Pickleball tournaments', 'Rave tonight', 'Coffee shops', 'Marathon training'];

    useEffect(() => {
        const performSearch = async () => {
            if (!searchText || searchText.length < 1) {
                setSearchResults({ quests: [], posts: [], users: [] });
                return;
            }

            setLoading(true);
            try {
                // 1. Search Users (Real)
                const realUsers = await supabaseService.profiles.searchUsers(searchText);

                // 2. Filter Mocks for Quests/Posts (as placeholder until real search is implemented for them)
                const filteredQuests = MOCK_QUESTS.filter(q => {
                    const matchesText = q.title.toLowerCase().includes(searchText.toLowerCase()) ||
                        q.category.toLowerCase().includes(searchText.toLowerCase());
                    const isDiscoverable = q.status === QuestStatus.DISCOVERABLE || !q.status;
                    const hasNotStarted = new Date() < new Date(q.start_time);

                    return matchesText && isDiscoverable && hasNotStarted;
                });
                const filteredPosts = MOCK_CAPTURES.filter(c =>
                    c.user?.username?.toLowerCase().includes(searchText.toLowerCase()) ||
                    c.caption?.toLowerCase().includes(searchText.toLowerCase())
                );

                setSearchResults({
                    quests: filteredQuests,
                    posts: filteredPosts,
                    users: realUsers
                });
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(performSearch, 300);
        return () => clearTimeout(timer);
    }, [searchText]);

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
                {loading && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-electric-teal/20 overflow-hidden">
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="w-1/3 h-full bg-electric-teal shadow-[0_0_10px_rgba(45,212,191,0.5)]"
                        />
                    </div>
                )}
            </div>

            {/* Content Container */}
            <div className="px-4 py-6 space-y-8">
                {/* Search Results */}
                {searchText ? (
                    <section className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
                        {/* Users Section */}
                        {searchResults.users.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">People</h3>
                                <div className="space-y-2">
                                    {searchResults.users.map(u => (
                                        <div
                                            key={u.id}
                                            onClick={() => onOpenProfile(u)}
                                            className="flex items-center gap-3 p-3 bg-white/[0.02] hover:bg-white/[0.05] rounded-[1.5rem] border border-white/5 transition-all group cursor-pointer active:scale-[0.98]"
                                        >
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-electric-teal/30 transition-all">
                                                    {u.avatar_url ? (
                                                        <img src={u.avatar_url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                                                            <UserIcon size={20} className="text-white/20" />
                                                        </div>
                                                    )}
                                                </div>
                                                {u.is_operator && (
                                                    <div className="absolute -bottom-1 -right-1 bg-electric-teal text-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#0A0A0A]">
                                                        <Zap size={8} className="fill-current" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-black text-white truncate uppercase tracking-tight">{u.name || u.username}</span>
                                                    {u.is_admin && <Shield size={10} className="text-electric-teal" />}
                                                </div>
                                                <p className="text-[10px] text-electric-teal/60 font-black uppercase tracking-tighter">@{u.username}</p>
                                            </div>
                                            <ArrowUpRight size={16} className="text-gray-700 group-hover:text-white transition-colors mr-2" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Quests & Posts</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Filtered Quests */}
                                {searchResults.quests.map(q => (
                                    <div key={q.id} onClick={() => onOpenQuest(q)} className="aspect-[3/4] rounded-2xl bg-white/[0.03] relative overflow-hidden group cursor-pointer border border-white/[0.02]">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                                        <div className="absolute bottom-3 left-3 right-3 text-left z-10">
                                            <span className="text-[10px] font-black text-primary uppercase bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm mb-1 inline-block">{q.category}</span>
                                            <h4 className="text-white font-bold text-sm leading-tight line-clamp-2">{q.title}</h4>
                                        </div>
                                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                                    </div>
                                ))}
                                {/* Filtered Captures */}
                                {searchResults.posts.map(c => (
                                    <div key={c.id} onClick={() => onOpenPost(c)} className="aspect-[3/4] rounded-2xl bg-black relative overflow-hidden group cursor-pointer border border-white/[0.02]">
                                        <img src={c.back_image_url || undefined} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                                        {c.user && c.user.avatar_url && <img src={c.user.avatar_url} className="absolute bottom-3 left-3 w-6 h-6 rounded-full border border-white/50" />}
                                    </div>
                                ))}
                                {/* Empty State */}
                                {searchResults.quests.length === 0 && searchResults.posts.length === 0 && searchResults.users.length === 0 && !loading && (
                                    <div className="col-span-2 text-center py-12 text-gray-500 text-sm font-medium">
                                        No results found for "{searchText}"
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                ) : (
                    <>
                        {/* Popular Now */}
                        <section>
                            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2 uppercase tracking-tighter">
                                <TrendingUp size={20} className="text-electric-teal" />
                                Popular now
                            </h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-3">
                                {popularSearches.map((term, i) => (
                                    <button key={i} onClick={() => setSearchText(term)} className="text-gray-400 text-sm hover:text-primary transition-colors flex items-center gap-2 group">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary transition-colors" /> {term}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Categories */}
                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-white font-bold text-lg uppercase tracking-tighter">Categories</h3>
                                <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:opacity-80">See All</button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {categories.map((cat, i) => (
                                    <button key={i} onClick={() => setSearchText(cat)} className="bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.02] rounded-2xl p-4 text-left transition-all group">
                                        <span className="text-gray-400 font-bold group-hover:text-white transition-colors text-sm uppercase tracking-tight">{cat}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Recommendation Mix */}
                        <section>
                            <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-tighter">You might like it</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {MOCK_QUESTS.filter(q => (q.status === QuestStatus.DISCOVERABLE || !q.status) && new Date() < new Date(q.start_time)).slice(0, 2).map(q => (
                                    <div key={q.id} onClick={() => onOpenQuest(q)} className="aspect-[3/4] rounded-2xl bg-white/[0.03] relative overflow-hidden group cursor-pointer border border-white/[0.02]">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                                        <div className="absolute bottom-3 left-3 right-3 text-left z-10">
                                            <span className="text-[10px] font-black text-primary uppercase bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm mb-1 inline-block">{q.category}</span>
                                            <h4 className="text-white font-bold text-sm leading-tight line-clamp-2">{q.title}</h4>
                                        </div>
                                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
                                    </div>
                                ))}
                                {MOCK_CAPTURES.slice(0, 2).map(c => (
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
