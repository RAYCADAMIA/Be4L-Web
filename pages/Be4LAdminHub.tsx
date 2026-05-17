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
    LogOut, Activity, Flag, Megaphone, Send, Trash2, CreditCard
} from 'lucide-react';

const ADMIN_EMAIL = 'raycadamia@gmail.com';

// ─── Tab Components ───────────────────────────────────────────

const StatCard: React.FC<{ label: string; value: string; icon: any; color: string; badge?: string }> = ({ label, value, icon: Icon, color, badge }) => (
    <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
        <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${color} mb-4 group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
        </div>
        <div className="space-y-1">
            <h4 className="text-3xl font-black text-white">{value}</h4>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{label}</p>
        </div>
        {badge && (
            <div className={`absolute top-4 right-4 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[7px] font-black uppercase tracking-widest ${color}`}>
                {badge}
            </div>
        )}
    </div>
);

const OverviewTab: React.FC<{ stats: any }> = ({ stats }) => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={Users} label="Total Users" value={stats.users.toLocaleString()} color="text-blue-400" />
            <StatCard icon={Shield} label="Operator Apps" value={stats.pendingPartners.toString()} color="text-yellow-400" badge={`${stats.pendingPartners > 0 ? 'Needs Action' : 'Clear'}`} />
            <StatCard icon={Bell} label="New Activity" value={stats.notifications.toString()} color="text-purple-400" badge={stats.notifications > 0 ? 'Unread' : undefined} />
            <StatCard icon={Zap} label="Active Quests" value={stats.quests.toString()} color="text-electric-teal" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Command Center Insights */}
            <div className="lg:col-span-2 glass-panel p-8 rounded-[2rem] border-white/5 bg-white/[0.02] space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <BarChart3 size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tighter">Command Center</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Network Traffic & Order Flow</p>
                        </div>
                    </div>
                </div>
                
                <div className="h-64 flex items-end gap-3 px-4">
                    {[30, 45, 25, 60, 80, 55, 90, 70, 85, 40, 50, 65].map((h, i) => (
                        <div key={i} className="flex-1 group relative">
                            <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: i * 0.05, duration: 1 }}
                                className="w-full bg-gradient-to-t from-blue-500/10 to-blue-400/40 rounded-t-lg group-hover:to-blue-400 transition-all cursor-crosshair"
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/20 px-2">
                    <span>JAN</span>
                    <span>JUN</span>
                    <span>DEC</span>
                </div>
            </div>

            {/* Dynamic Commerce Stats */}
            <div className="glass-panel p-8 rounded-[2rem] border-white/5 bg-white/[0.02] flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                        <CreditCard size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-tighter text-left">Dynamic Commerce</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 text-left">Booking Conversion</p>
                    </div>
                </div>

                <div className="flex-1 space-y-6">
                    {[
                        { label: 'Event Tickets', value: 72, color: 'bg-orange-400' },
                        { label: 'Service Slots', value: 18, color: 'bg-purple-400' },
                        { label: 'VIP Exclusives', value: 10, color: 'bg-pink-400' }
                    ].map(item => (
                        <div key={item.label} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-white/40">{item.label}</span>
                                <span className="text-white">{item.value}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-6 rounded-3xl bg-white/[0.03] border border-white/5 text-center bg-gradient-to-br from-white/5 to-transparent">
                    <p className="text-[9px] font-black uppercase tracking-widest text-cool-grey">Active PILOT QUESTS</p>
                    <p className="text-3xl font-black text-white mt-1">{stats.operators + stats.pendingPartners + stats.pendingLeads}</p>
                </div>
            </div>
        </div>
    </div>
);

const PartnerLeadsTab: React.FC = () => {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'contacted' | 'approved' | 'rejected' | 'all'>('pending');

    const loadLeads = async () => {
        setLoading(true);
        let query = supabase.from('partner_leads').select('*').order('created_at', { ascending: false });
        if (filter !== 'all') query = query.eq('status', filter);
        const { data } = await query;
        setLeads(data || []);
        setLoading(false);
    };

    useEffect(() => { loadLeads(); }, [filter]);

    const handleUpdate = async (id: string, status: string) => {
        await supabase.from('partner_leads').update({ status }).eq('id', id);
        loadLeads();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                {(['pending', 'contacted', 'approved', 'rejected', 'all'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-electric-teal text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>
            {loading ? (
                <div className="py-20 text-center text-white/20 text-xs font-bold uppercase tracking-widest animate-pulse">Scanning leads...</div>
            ) : leads.length === 0 ? (
                <div className="py-20 text-center text-white/20 text-xs font-bold uppercase tracking-widest">No {filter} inquiries</div>
            ) : (
                <div className="space-y-4">
                    {leads.map(lead => (
                        <div key={lead.id} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.05] transition-all">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-electric-teal/10 flex items-center justify-center text-electric-teal">
                                        <Building size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white leading-tight">{lead.business_name}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${lead.status === 'pending' ? 'bg-orange-500/10 text-orange-400' : lead.status === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-white/40'}`}>
                                            {lead.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-4 text-[10px] text-white/40 font-bold ml-12">
                                    <span className="flex items-center gap-1"><Mail size={10} /> {lead.contact_email}</span>
                                    {lead.contact_number && <span className="flex items-center gap-1"><Phone size={10} /> {lead.contact_number}</span>}
                                    <span className="text-electric-teal/50">{lead.category}</span>
                                    {lead.website && <a href={lead.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors"><Globe size={10} /> Web</a>}
                                    {lead.social_handle && <span className="flex items-center gap-1"><Instagram size={10} /> {lead.social_handle}</span>}
                                    <span className="flex items-center gap-1 font-normal opacity-50 px-2 border-l border-white/10">{new Date(lead.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {lead.proof_url && (
                                    <a 
                                        href={`${supabase.storage.from('partner-docs').getPublicUrl(lead.proof_url).data.publicUrl}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-3 rounded-xl bg-white/5 text-white/30 hover:text-white hover:bg-white/10 transition-all"
                                        title="View Proof"
                                    >
                                        <FileText size={18} />
                                    </a>
                                )}
                                {lead.status === 'pending' && (
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleUpdate(lead.id, 'contacted')} className="px-4 py-2.5 rounded-xl border border-white/10 text-white/60 text-[9px] font-black uppercase tracking-widest hover:text-white hover:border-white/20 transition-all">
                                            Contacted
                                        </button>
                                        <button onClick={() => handleUpdate(lead.id, 'approved')} className="px-4 py-2.5 rounded-xl bg-electric-teal text-black text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-[0_10px_20px_rgba(45,212,191,0.2)]">
                                            <Check size={14} strokeWidth={3} /> Approve Lead
                                        </button>
                                    </div>
                                )}
                                {lead.status !== 'pending' && lead.status !== 'rejected' && (
                                    <button onClick={() => handleUpdate(lead.id, 'rejected')} className="p-3 rounded-xl bg-white/5 text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

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
        await supabase.from('operators').update({ status }).eq('user_id', id);
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
                        <div key={req.user_id} className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
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
                                    <button onClick={() => handleUpdate(req.user_id, 'approved')} className="px-5 py-2.5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all">
                                        <Check size={14} strokeWidth={3} /> Approve
                                    </button>
                                    <button onClick={() => handleUpdate(req.user_id, 'rejected')} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-white hover:border-white/20 transition-all">
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

const NotificationsTab: React.FC = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadNotifications = async () => {
        setLoading(true);
        // Get notifications for the admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('notifications')
            .select('*, actor:profiles!notifications_actor_id_fkey(name, username, avatar_url)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        setNotifications(data || []);
        setLoading(false);

        // Mark as read
        if (data && data.length > 0) {
            await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
        }
    };

    useEffect(() => { loadNotifications(); }, []);

    return (
        <div className="space-y-6">
            {loading ? (
                <div className="py-20 text-center text-white/20 text-xs font-bold uppercase tracking-widest">Loading Activity...</div>
            ) : notifications.length === 0 ? (
                <div className="py-20 text-center text-white/20 text-xs font-bold uppercase tracking-widest">No activity recorded</div>
            ) : (
                <div className="space-y-4">
                    {notifications.map(n => (
                        <div key={n.id} className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${n.read ? 'bg-white/[0.02] border-white/5' : 'bg-electric-teal/[0.03] border-electric-teal/20 shadow-[0_0_20px_rgba(45,212,191,0.05)]'}`}>
                            <div className="shrink-0 pt-1">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${n.type === 'PARTNER_APPLICATION' ? 'bg-electric-teal/10 text-electric-teal' : 'bg-blue-500/10 text-blue-400'}`}>
                                    {n.type === 'PARTNER_APPLICATION' ? <Building size={18} /> : <Bell size={18} />}
                                </div>
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black text-white uppercase tracking-tight">{n.title}</h3>
                                    <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">{new Date(n.created_at).toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-white/60 leading-relaxed">{n.content}</p>
                                {n.actor && (
                                    <div className="pt-2 flex items-center gap-2">
                                        <img src={n.actor.avatar_url || `https://ui-avatars.com/api/?name=${n.actor.name}`} className="w-5 h-5 rounded-full border border-white/10" />
                                        <span className="text-[10px] text-white/30 font-bold">BY @{n.actor.username}</span>
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

type AdminTab = 'overview' | 'partners' | 'leads' | 'notifications' | 'creators' | 'users' | 'quests' | 'reports' | 'alerts';

const TABS: { id: AdminTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'leads', label: 'Inquiries', icon: Mail },
    { id: 'partners', label: 'Partners', icon: Building },
    { id: 'notifications', label: 'Activity', icon: Bell },
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
        users: 0, pendingPartners: 0, pendingLeads: 0, creatorApps: 0, quests: 0,
        operators: 0, bookings: 0, echoes: 0, notifications: 0,
        reports: 0
    });
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Verify admin access
    useEffect(() => {
        const checkAdmin = async () => {
            const isBypass = sessionStorage.getItem('be4l_admin_authorized') === 'true';
            
            if (isBypass) {
                setAuthorized(true);
                loadStats();
            } else {
                setAuthorized(false);
                setLoading(false);
            }
        };
        checkAdmin();
    }, []);

    const handlePasscodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passcode.toLowerCase() === 'begonia') {
            sessionStorage.setItem('be4l_admin_authorized', 'true');
            setAuthorized(true);
            loadStats();
            setError(null);
        } else {
            setError('Invalid Access Code');
        }
    };
    const loadStats = async () => {
        setLoading(true);
        const [profiles, operators, pendingOps, leads, creators, quests, bookings, echoes, notifs, reports] = await Promise.all([
            supabase.from('profiles').select('id', { count: 'exact', head: true }),
            supabase.from('operators').select('user_id', { count: 'exact', head: true }).in('status', ['approved', 'live', 'active']),
            supabase.from('operators').select('user_id', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('partner_leads').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('creator_applications').select('id', { count: 'exact', head: true }),
            supabase.from('quests').select('id', { count: 'exact', head: true }),
            supabase.from('dibs_bookings').select('id', { count: 'exact', head: true }),
            supabase.from('echoes').select('id', { count: 'exact', head: true }),
            supabase.from('notifications').select('id', { count: 'exact', head: true }),
            supabase.from('platform_reports').select('id', { count: 'exact', head: true }),
        ]);

        setStats({
            users: profiles.count || 0,
            pendingPartners: pendingOps.count || 0,
            pendingLeads: leads.count || 0,
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
            <div className="min-h-screen bg-[#060606] flex items-center justify-center text-white p-6">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-electric-teal/5 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full relative z-10"
                >
                    <div className="glass-panel p-10 rounded-[2.5rem] border-white/5 bg-white/[0.02] shadow-2xl space-y-8 text-center">
                        <div className="space-y-4">
                            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-2xl group transition-all duration-500 hover:border-electric-teal/30">
                                <Shield size={40} className="text-white group-hover:text-electric-teal transition-colors" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Admin Access</h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Enter Mission Credentials</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasscodeSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <input
                                    type="password"
                                    value={passcode}
                                    onChange={(e) => setPasscode(e.target.value)}
                                    placeholder="Enter Access Code"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center text-lg font-black tracking-[0.5em] focus:outline-none focus:border-electric-teal/30 focus:bg-white/[0.07] transition-all placeholder:tracking-normal placeholder:font-bold placeholder:text-white/10"
                                    autoFocus
                                />
                                {error && (
                                    <motion.p 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-[10px] font-black uppercase tracking-widest text-red-500 pt-2"
                                    >
                                        {error}
                                    </motion.p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl"
                            >
                                AUTHORIZE SYSTEM
                            </button>
                        </form>

                        <button 
                            onClick={() => navigate('/')}
                            className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"
                        >
                            Back to Platform
                        </button>
                    </div>
                </motion.div>
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
                                    {activeTab === 'leads' && 'Review public brand inquiries & requests'}
                                    {activeTab === 'partners' && 'Manage approved brand operators'}
                                    {activeTab === 'notifications' && 'System activity and new submissions'}
                                    {activeTab === 'creators' && 'Review creator program applications'}
                                    {activeTab === 'users' && 'All registered platform users'}
                                    {activeTab === 'quests' && 'All quests in the system'}
                                    {activeTab === 'reports' && 'User-submitted platform reports'}
                                    {activeTab === 'alerts' && 'Manage platform-wide announcements'}
                                </p>
                            </div>
                            {activeTab === 'overview' && <OverviewTab stats={stats} />}
                            {activeTab === 'leads' && <PartnerLeadsTab />}
                            {activeTab === 'partners' && <PartnerRequestsTab />}
                            {activeTab === 'notifications' && <NotificationsTab />}
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
