import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { supabase } from '../utils/supabaseClient';
import {
    Shield, Users, Building, FileText, BarChart3, Bell,
    Check, X, Mail, Phone, Instagram, Globe, Zap, Video,
    ArrowLeft, RefreshCw, Search, ChevronDown, Eye,
    TrendingUp, MapPin, Calendar, Compass, MessageCircle,
    LogOut, Activity, Flag, Megaphone, Send, Trash2
} from 'lucide-react';

const ADMIN_EMAIL = 'raycadamia@gmail.com';

// ─── Tab Components ───────────────────────────────────────────

const OverviewTab: React.FC<{ stats: any }> = ({ stats }) => (
    <div className="space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { label: 'Total Users', value: stats.users, icon: Users, color: 'text-electric-teal', bg: 'bg-electric-teal/10' },
                { label: 'Pending Partners', value: stats.pendingPartners, icon: Building, color: 'text-orange-400', bg: 'bg-orange-400/10' },
                { label: 'Creator Apps', value: stats.creatorApps, icon: Video, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                { label: 'Total Quests', value: stats.quests, icon: Compass, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                { label: 'Active Operators', value: stats.operators, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10' },
                { label: 'Bookings', value: stats.bookings, icon: Calendar, color: 'text-pink-400', bg: 'bg-pink-400/10' },
                { label: 'Echoes (Chats)', value: stats.echoes, icon: MessageCircle, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
                { label: 'Notifications', value: stats.notifications, icon: Bell, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
            ].map(stat => (
                <div key={stat.label} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group">
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} mb-3 group-hover:scale-110 transition-transform`}>
                        <stat.icon size={20} />
                    </div>
                    <p className="text-2xl font-black text-white">{stat.value}</p>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mt-1">{stat.label}</p>
                </div>
            ))}
        </div>
    </div>
);

const PartnerRequestsTab: React.FC = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

    const loadRequests = async () => {
        setLoading(true);
        let query = supabase.from('operators').select('*').order('created_at', { ascending: false });
        if (filter !== 'all') query = query.eq('status', filter);
        const { data } = await query;
        setRequests(data || []);
        setLoading(false);
    };

    useEffect(() => { loadRequests(); }, [filter]);

    const handleUpdate = async (id: string, status: 'approved' | 'rejected') => {
        await supabase.from('operators').update({ status }).eq('id', id);
        loadRequests();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>
            {loading ? (
                <div className="py-20 text-center text-white/20 text-xs font-bold uppercase tracking-widest">Loading...</div>
            ) : requests.length === 0 ? (
                <div className="py-20 text-center text-white/20 text-xs font-bold uppercase tracking-widest">No {filter} requests</div>
            ) : (
                <div className="space-y-4">
                    {requests.map(req => (
                        <div key={req.id} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <Building size={18} className="text-electric-teal" />
                                    <h3 className="text-lg font-black text-white">{req.business_name}</h3>
                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${req.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : req.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                        {req.status}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-[10px] text-white/40 font-bold">
                                    <span className="flex items-center gap-1"><Mail size={10} /> {req.contact_email}</span>
                                    {req.contact_number && <span className="flex items-center gap-1"><Phone size={10} /> {req.contact_number}</span>}
                                    {req.category && <span className="flex items-center gap-1"><MapPin size={10} /> {req.category}</span>}
                                    <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(req.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            {req.status === 'pending' && (
                                <div className="flex items-center gap-3">
                                    <button onClick={() => handleUpdate(req.id, 'approved')} className="px-5 py-2.5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all">
                                        <Check size={14} strokeWidth={3} /> Approve
                                    </button>
                                    <button onClick={() => handleUpdate(req.id, 'rejected')} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-white hover:border-white/20 transition-all">
                                        <X size={14} strokeWidth={3} /> Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const CreatorAppsTab: React.FC = () => {
    const [apps, setApps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
    const [expanded, setExpanded] = useState<string | null>(null);

    const loadApps = async () => {
        setLoading(true);
        let query = supabase.from('creator_applications').select('*').order('created_at', { ascending: false });
        if (filter !== 'all') query = query.eq('status', filter);
        const { data } = await query;
        setApps(data || []);
        setLoading(false);
    };

    useEffect(() => { loadApps(); }, [filter]);

    const handleUpdate = async (id: string, status: 'approved' | 'rejected') => {
        await supabase.from('creator_applications').update({ status }).eq('id', id);
        loadApps();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-white/5 text-white/40 hover:text-white'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>
            {loading ? (
                <div className="py-20 text-center text-white/20 text-xs font-bold uppercase tracking-widest">Loading...</div>
            ) : apps.length === 0 ? (
                <div className="py-20 text-center text-white/20 text-xs font-bold uppercase tracking-widest">No {filter} applications</div>
            ) : (
                <div className="space-y-4">
                    {apps.map(app => (
                        <div key={app.id} className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
                            <div
                                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-all"
                                onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                            >
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <Video size={18} className="text-purple-400" />
                                        <h3 className="text-lg font-black text-white">{app.full_name}</h3>
                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${app.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : app.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                            {app.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-[10px] text-white/40 font-bold">
                                        <span className="flex items-center gap-1"><Mail size={10} /> {app.email}</span>
                                        {app.content_niche && <span className="text-purple-400/60">{app.content_niche}</span>}
                                        {app.follower_count && <span className="text-white/30">{app.follower_count} followers</span>}
                                        <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(app.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <ChevronDown size={16} className={`text-white/20 transition-transform ${expanded === app.id ? 'rotate-180' : ''}`} />
                                </div>
                            </div>

                            <AnimatePresence>
                                {expanded === app.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-6 pt-0 border-t border-white/5 mt-0 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                                                {app.phone && <div className="text-[10px] text-white/40"><span className="text-white/20 uppercase tracking-widest">Phone:</span> {app.phone}</div>}
                                                {app.city && <div className="text-[10px] text-white/40"><span className="text-white/20 uppercase tracking-widest">City:</span> {app.city}</div>}
                                                {app.tiktok_handle && <div className="text-[10px] text-white/40"><span className="text-white/20 uppercase tracking-widest">TikTok:</span> {app.tiktok_handle}</div>}
                                                {app.instagram_handle && <div className="text-[10px] text-white/40"><span className="text-white/20 uppercase tracking-widest">IG:</span> {app.instagram_handle}</div>}
                                                {app.youtube_handle && <div className="text-[10px] text-white/40"><span className="text-white/20 uppercase tracking-widest">YouTube:</span> {app.youtube_handle}</div>}
                                                {app.portfolio_link && (
                                                    <a href={app.portfolio_link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-purple-400 hover:text-white transition-colors underline">
                                                        View Portfolio
                                                    </a>
                                                )}
                                            </div>
                                            {app.why_join && (
                                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                                    <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold mb-2">Why they want to join:</p>
                                                    <p className="text-sm text-white/60">{app.why_join}</p>
                                                </div>
                                            )}
                                            {app.status === 'pending' && (
                                                <div className="flex gap-3 pt-2">
                                                    <button onClick={() => handleUpdate(app.id, 'approved')} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all">
                                                        <Check size={14} strokeWidth={3} /> Approve
                                                    </button>
                                                    <button onClick={() => handleUpdate(app.id, 'rejected')} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-white hover:border-white/20 transition-all">
                                                        <X size={14} strokeWidth={3} /> Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const UsersTab: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
            setUsers(data || []);
            setLoading(false);
        };
        load();
    }, []);

    const filtered = users.filter(u =>
        (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-11 pr-5 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-electric-teal/30 transition-all"
                />
            </div>
            {loading ? (
                <div className="py-20 text-center text-white/20 text-xs font-bold uppercase tracking-widest">Loading...</div>
            ) : (
                <div className="space-y-2">
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{filtered.length} users</p>
                    <div className="grid gap-3 max-h-[60vh] overflow-y-auto no-scrollbar">
                        {filtered.map(user => (
                            <div key={user.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-4 hover:bg-white/[0.04] transition-all">
                                <img
                                    src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name || 'U'}&background=111&color=fff`}
                                    alt=""
                                    className="w-10 h-10 rounded-xl object-cover border border-white/10"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-white truncate">{user.name || 'Unknown'}</p>
                                    <p className="text-[10px] text-white/30 font-bold">@{user.username || 'no-username'}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">
                                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                                    </p>
                                    {user.is_operator && (
                                        <span className="text-[8px] font-black text-electric-teal uppercase tracking-widest">Operator</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const QuestsTab: React.FC = () => {
    const [quests, setQuests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const { data } = await supabase.from('quests').select('*').order('created_at', { ascending: false });
            setQuests(data || []);
            setLoading(false);
        };
        load();
    }, []);

    return (
        <div className="space-y-6">
            {loading ? (
                <div className="py-20 text-center text-white/20 text-xs font-bold uppercase tracking-widest">Loading...</div>
            ) : quests.length === 0 ? (
                <div className="py-20 text-center text-white/20 text-xs font-bold uppercase tracking-widest">No quests in database</div>
            ) : (
                <div className="space-y-3">
                    {quests.map(q => (
                        <div key={q.id} className="p-5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-white truncate">{q.title}</p>
                                <div className="flex gap-3 mt-1 text-[9px] text-white/30 font-bold uppercase tracking-widest">
                                    <span>{q.mode || 'canon'}</span>
                                    <span>{q.category}</span>
                                    <span>{q.status}</span>
                                </div>
                            </div>
                            <div className="text-[9px] text-white/20 font-bold uppercase tracking-widest text-right">
                                {q.start_time ? new Date(q.start_time).toLocaleDateString() : '-'}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ReportsTab: React.FC = () => {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const { data } = await supabase.from('platform_reports').select('*, profiles(name, username)').order('created_at', { ascending: false });
        setReports(data || []);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleUpdate = async (id: string, status: 'resolved' | 'ignored') => {
        await supabase.from('platform_reports').update({ status }).eq('id', id);
        load();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this report?')) return;
        await supabase.from('platform_reports').delete().eq('id', id);
        load();
    };

    return (
        <div className="space-y-6">
            {loading ? (
                <div className="py-20 text-center text-white/20 text-xs font-bold uppercase tracking-widest">Loading...</div>
            ) : reports.length === 0 ? (
                <div className="py-20 text-center text-white/20 text-xs font-bold uppercase tracking-widest">No reports pending</div>
            ) : (
                <div className="space-y-4">
                    {reports.map(rep => (
                        <div key={rep.id} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Flag size={18} className="text-red-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Case #{rep.id.slice(0, 8)}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${rep.status === 'pending' ? 'bg-orange-500/10 text-orange-400' : rep.status === 'resolved' ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/30'}`}>
                                        {rep.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleDelete(rep.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-white font-bold">{rep.reason}</h3>
                                <p className="text-sm text-white/60">{rep.details}</p>
                            </div>
                            <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                                    Reported by: <span className="text-white">@{rep.profiles?.username || 'unknown'}</span> • {new Date(rep.created_at).toLocaleString()}
                                </div>
                                {rep.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleUpdate(rep.id, 'resolved')} className="px-4 py-2 rounded-xl bg-green-500 text-black text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all">Resolve</button>
                                        <button onClick={() => handleUpdate(rep.id, 'ignored')} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Ignore</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const BroadcastTab: React.FC = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) return;
        if (!confirm('This will send a notification to ALL users on the platform. Continue?')) return;

        setLoading(true);
        try {
            // 1. Get all user IDs
            const { data: profiles } = await supabase.from('profiles').select('id');
            if (!profiles) return;

            // 2. Insert notifications in chunks (Supabase limit)
            const chunkSize = 100;
            for (let i = 0; i < profiles.length; i += chunkSize) {
                const chunk = profiles.slice(i, i + chunkSize).map(p => ({
                    user_id: p.id,
                    type: 'SYSTEM_ALERT',
                    title: title,
                    content: message,
                    metadata: { broadcast: true }
                }));
                await supabase.from('notifications').insert(chunk);
            }

            setSuccess(true);
            setTitle('');
            setMessage('');
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error(err);
            alert('Failed to send broadcast');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl space-y-8">
            <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-500">
                    <Megaphone size={24} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tighter">System-wide Broadcast</h3>
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Send a direct notification to every Be4L user</p>
            </div>

            <form onSubmit={handleSend} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Alert Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. New Quest Mode Available!"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder-white/15 focus:outline-none focus:border-yellow-400/30 transition-all"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Message Content</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Detail your announcement here..."
                        rows={4}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm placeholder-white/15 focus:outline-none focus:border-yellow-400/30 transition-all resize-none"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-yellow-400 text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                    {loading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                    {loading ? 'Broadcasting...' : 'Blast Broadcast'}
                </button>

                {success && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-green-400 text-[10px] font-black uppercase tracking-widest"
                    >
                        Success! Broadcast sent to all users.
                    </motion.p>
                )}
            </form>
        </div>
    );
};

// ─── Main Admin Hub ───────────────────────────────────────────

type AdminTab = 'overview' | 'partners' | 'creators' | 'users' | 'quests' | 'reports' | 'alerts';

const TABS: { id: AdminTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'partners', label: 'Partners', icon: Building },
    { id: 'creators', label: 'Creators', icon: Video },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'quests', label: 'Quests', icon: Compass },
    { id: 'reports', label: 'Reports', icon: Flag },
    { id: 'alerts', label: 'Broadcast', icon: Megaphone },
];

export const Be4LAdminHub: React.FC = () => {
    const navigate = useNavigate();
    useDocumentTitle('Be4L Admin Hub');
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [stats, setStats] = useState({
        users: 0, pendingPartners: 0, creatorApps: 0, quests: 0,
        operators: 0, bookings: 0, echoes: 0, notifications: 0,
        reports: 0
    });
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    // Verify admin access
    useEffect(() => {
        const checkAdmin = async () => {
            const isBypass = sessionStorage.getItem('be4l_admin_authorized') === 'true';
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user?.email === ADMIN_EMAIL || isBypass) {
                setAuthorized(true);
                loadStats();
            } else {
                setAuthorized(false);
                setLoading(false);
            }
        };
        checkAdmin();
    }, []);

            supabase.from('notifications').select('id', { count: 'exact', head: true }),
            supabase.from('platform_reports').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
            users: profiles.count || 0,
            pendingPartners: pendingOps.count || 0,
            creatorApps: creators.count || 0,
            quests: quests.count || 0,
            operators: operators.count || 0,
            bookings: bookings.count || 0,
            echoes: echoes.count || 0,
            notifications: notifs.count || 0,
            reports: (reports as any).count || 0,
        });
        setLoading(false);
    };

    const handleLogout = async () => {
        sessionStorage.removeItem('be4l_admin_authorized');
        await supabase.auth.signOut();
        navigate('/');
    };

    if (!authorized && !loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
                <div className="text-center space-y-4">
                    <Shield size={48} className="mx-auto text-red-500/50" />
                    <h1 className="text-2xl font-black uppercase tracking-tighter">Access Denied</h1>
                    <p className="text-sm text-white/40">You are not authorized to view this page.</p>
                    <button onClick={() => navigate('/')} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Top Bar */}
            <div className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="text-white/30 hover:text-white transition-colors">
                            <ArrowLeft size={18} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-electric-teal/20 flex items-center justify-center text-electric-teal">
                                <Shield size={16} />
                            </div>
                            <div>
                                <h1 className="text-sm font-black uppercase tracking-tighter">Be4L Admin Hub</h1>
                                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Platform Operations</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={loadStats} className="p-2 rounded-lg bg-white/5 text-white/30 hover:text-white hover:bg-white/10 transition-all">
                            <RefreshCw size={14} />
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-electric-teal/10 border border-electric-teal/20">
                            <Activity size={12} className="text-electric-teal" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-electric-teal">Live</span>
                        </div>
                        <button onClick={handleLogout} className="p-2 rounded-lg bg-white/5 text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Sign Out">
                            <LogOut size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto flex min-h-[calc(100vh-65px)]">
                {/* Sidebar */}
                <div className="w-48 shrink-0 border-r border-white/5 py-6 px-3 hidden md:block">
                    <nav className="space-y-1">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Mobile Tab Bar */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/5 p-2 flex gap-1">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white/10 text-white' : 'text-white/30'}`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 p-6 md:p-10 pb-24 md:pb-10">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center space-y-4">
                                <div className="w-12 h-12 rounded-full border-2 border-electric-teal/20 border-t-electric-teal animate-spin mx-auto" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Loading Admin Data...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h2 className="text-2xl font-black uppercase tracking-tighter">{TABS.find(t => t.id === activeTab)?.label}</h2>
                                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">
                                    {activeTab === 'overview' && 'Platform health at a glance'}
                                    {activeTab === 'partners' && 'Manage operator/partner requests'}
                                    {activeTab === 'creators' && 'Review creator program applications'}
                                    {activeTab === 'users' && 'All registered platform users'}
                                    {activeTab === 'quests' && 'All quests in the system'}
                                    {activeTab === 'reports' && 'User-submitted platform reports'}
                                    {activeTab === 'alerts' && 'Manage platform-wide announcements'}
                                </p>
                            </div>
                            {activeTab === 'overview' && <OverviewTab stats={stats} />}
                            {activeTab === 'partners' && <PartnerRequestsTab />}
                            {activeTab === 'creators' && <CreatorAppsTab />}
                            {activeTab === 'users' && <UsersTab />}
                            {activeTab === 'quests' && <QuestsTab />}
                            {activeTab === 'reports' && <ReportsTab />}
                            {activeTab === 'alerts' && <BroadcastTab />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Be4LAdminHub;
