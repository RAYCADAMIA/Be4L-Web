import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, Package, CheckCircle, Search, X, Shield, List, Store, ArrowLeft, MessageCircle, Send } from 'lucide-react';
import { EKGLoader } from '../ui/AestheticComponents';
import OrderManager from './OrderManager';
import VerifyBooking from './VerifyBooking';
import InventoryManager from './InventoryManager';
import BusinessProfileEditor from './BusinessProfileEditor';
import ChatListScreen from '../Chat/ChatListScreen';
import { useAuth } from '../../contexts/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { supabaseService } from '../../services/supabaseService';

// Simple Revenue Chart Component
const RevenueChart = ({ revenue }: { revenue: number }) => {
    // Mock data for the chart path
    const points = [40, 60, 45, 70, 55, 85, 75, 95].map((p, i) => ({ x: i * 40, y: 100 - p }));
    const path = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

    return (
        <div className="w-full h-full relative group">
            <svg viewBox="0 0 280 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(45,212,191,0.3)]">
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <motion.path
                    d={path + " V 100 H 0 Z"}
                    fill="url(#chartGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                />
                <motion.path
                    d={path}
                    fill="none"
                    stroke="#2DD4BF"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                />
                {points.map((p, i) => (
                    <motion.circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="3"
                        fill="#2DD4BF"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 + i * 0.1 }}
                        className="group-hover:r-5 transition-all"
                    />
                ))}
            </svg>
            <div className="absolute top-4 left-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Live Volume</p>
                <p className="text-lg font-black text-white">₱{revenue.toLocaleString()}</p>
            </div>
        </div>
    );
};

// Reusable Stats Card
const DataCard = ({ title, value, subtext, icon: Icon, trend }: any) => (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:bg-white/[0.05] transition-colors">
        <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-xl bg-white/5 text-primary">
                <Icon size={20} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${trend > 0 ? 'bg-electric-teal/10 text-electric-teal' : 'bg-red-500/10 text-red-500'}`}>
                    {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div>
            <h4 className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">{title}</h4>
            <p className="text-2xl font-black text-white">{value}</p>
            <p className="text-[10px] text-gray-500 mt-1">{subtext}</p>
        </div>
    </div>
);

// Reusable Tab Button
const TabButton = ({ active, onClick, icon: Icon, label, badge }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap relative group ${active
            ? 'bg-electric-teal text-black shadow-[0_10px_30px_rgba(45,212,191,0.2)] scale-105'
            : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'
            }`}
    >
        <Icon size={14} className={active ? 'stroke-[3px]' : ''} />
        {label}
        {badge && (
            <span className="ml-1 px-1.5 py-0.5 text-[8px] bg-red-500 text-white rounded-full font-black animate-pulse">
                {badge}
            </span>
        )}
        {active && (
            <motion.div
                layoutId="activeTabGlow"
                className="absolute inset-0 bg-electric-teal/20 blur-xl -z-10 rounded-full"
            />
        )}
    </button>
);

interface OperatorDashboardProps {
    onBack?: () => void;
    initialTab?: 'overview' | 'orders' | 'verify' | 'items' | 'business' | 'comms';
}

const OperatorDashboard: React.FC<OperatorDashboardProps> = ({ onBack, initialTab = 'overview' }) => {
    useDocumentTitle('Partner Dashboard');
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'verify' | 'items' | 'business' | 'comms'>(initialTab === 'comms' ? 'comms' : initialTab === 'menu' ? 'items' : initialTab);
    const [stats, setStats] = useState({
        revenue: 0,
        bookings: 0,
        followers: 0,
        pending: 0
    });

    const [operatorProfile, setOperatorProfile] = useState<any>(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!user) return;
            try {
                const [statsData, ops] = await Promise.all([
                    supabaseService.dibs.getOperatorStats(user.id),
                    supabaseService.dibs.getOperators()
                ]);
                
                setStats(statsData);
                
                // Find this operator's profile
                const myProfile = ops.find(o => o.user_id === user.id);
                if (myProfile) setOperatorProfile(myProfile);
                
            } catch (e) {
                console.error("Dashboard data load failed:", e);
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, [user]);

    if (loading) return <div className="flex h-screen items-center justify-center bg-transparent"><EKGLoader /></div>;

    return (
        <div className="min-h-full bg-transparent text-white relative pt-24 md:pt-32">
            {/* Dashboard Header */}
            <header className="bg-transparent border-b border-white/5 px-6 py-4">
                <div className="max-w-7xl mx-auto flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {onBack && (
                                <button onClick={onBack} className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all active:scale-90 flex items-center justify-center border border-white/10">
                                    <ArrowLeft size={18} />
                                </button>
                            )}
                            <div>
                                <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter leading-none flex items-center gap-2">
                                    {operatorProfile?.business_name || 'BE4L'} <span className="text-electric-teal">DASHBOARD</span>
                                </h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mt-1.5 flex items-center gap-2">
                                    <Shield size={10} className="text-electric-teal/50" />
                                    {operatorProfile?.category || 'Operator'} Portal <span className="w-1 h-1 rounded-full bg-electric-teal animate-pulse" />
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setActiveTab('comms')}
                                className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors relative"
                            >
                                <MessageCircle size={18} />
                                {stats.pending > 0 && <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping" />}
                            </button>
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-electric-teal to-blue-500 p-[1px]">
                                <div className="w-full h-full bg-white/[0.03] rounded-[calc(1rem-1px)] flex items-center justify-center overflow-hidden">
                                    {operatorProfile?.logo_url ? (
                                        <img src={operatorProfile.logo_url} className="w-full h-full object-cover" alt="logo" />
                                    ) : (
                                        <Store size={20} className="text-electric-teal" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs - Compact & Scrollable */}
                    <nav className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={BarChart3} label="Overview" />
                        <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={DollarSign} label="Orders" badge={stats.pending > 0 ? stats.pending : undefined} />
                        <TabButton active={activeTab === 'comms'} onClick={() => setActiveTab('comms')} icon={MessageCircle} label="Comms" />
                        <TabButton active={activeTab === 'verify'} onClick={() => setActiveTab('verify')} icon={CheckCircle} label="Verify" />
                        <TabButton active={activeTab === 'items'} onClick={() => setActiveTab('items')} icon={List} label="Inventory" />
                        <TabButton active={activeTab === 'business'} onClick={() => setActiveTab('business')} icon={Store} label="Settings" />
                    </nav>
                </div>
            </header>

            {/* Content Body with proper spacing for global navbar */}
            <main className="max-w-7xl mx-auto px-6 py-8 pb-40">
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            {/* Stats Grid */}
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <DataCard
                                    title="Total Revenue"
                                    value={`₱${stats.revenue.toLocaleString()}`}
                                    subtext="Lifetime earnings"
                                    icon={DollarSign}
                                    trend={12}
                                />
                                <DataCard
                                    title="Following"
                                    value={stats.followers.toLocaleString()}
                                    subtext="Active community"
                                    icon={Users}
                                    trend={8.5}
                                />
                                <DataCard
                                    title="Aura Score"
                                    value="9,950"
                                    subtext="Trust rating"
                                    icon={Shield}
                                    trend={0.4}
                                />
                                <DataCard
                                    title="Pending Orders"
                                    value={stats.pending}
                                    subtext="Action required"
                                    icon={Package}
                                    trend={0}
                                />
                            </div>

                            {/* Quick Charts / Actions */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-4 h-[300px] relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-electric-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <RevenueChart revenue={stats.revenue} />
                                </div>
                                <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 h-[300px]">
                                    <h3 className="font-bold text-white mb-4">Quick Actions</h3>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setActiveTab('items')}
                                            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase transition-colors text-left px-4 flex justify-between items-center group"
                                        >
                                            Add New Item <ArrowUpRight className="text-gray-500 group-hover:text-electric-teal transition-colors" size={16} />
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('verify')}
                                            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase transition-colors text-left px-4 flex justify-between items-center group"
                                        >
                                            Verify A Booking <ArrowUpRight className="text-gray-500 group-hover:text-electric-teal transition-colors" size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'orders' && (
                        <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <OrderManager />
                        </motion.div>
                    )}


                    {activeTab === 'verify' && (
                        <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <VerifyBooking />
                        </motion.div>
                    )}

                    {activeTab === 'items' && (
                        <motion.div key="items" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <InventoryManager />
                        </motion.div>
                    )}

                    {activeTab === 'comms' && (
                        <motion.div key="comms" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[600px] border border-white/10 rounded-[2.5rem] overflow-hidden bg-white/[0.02]">
                            {user && (
                                <ChatListScreen
                                    currentUser={user as any}
                                    onOpenChat={(id, name) => {
                                        // Navigate to global chat for detail view or we can embed it
                                        navigate('/app/chat', { state: { openChatId: id, openChatName: name } });
                                    }}
                                    onNavigate={() => { }}
                                    onOpenProfile={() => { }}
                                />
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'business' && (
                        <motion.div key="business" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <BusinessProfileEditor
                                operator={operatorProfile || {
                                    business_name: 'Your Brand',
                                    bio: 'Tell your story...',
                                    location: 'Davao City',
                                    category: 'venue',
                                    user_id: user?.id
                                }}
                                onSave={async (data: any) => {
                                    console.log('Saving Profile:', data);
                                    const res = await supabaseService.dibs.updateOnboardingStep(data);
                                    if (res.success) {
                                        setOperatorProfile(prev => ({ ...prev, ...data }));
                                    }
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence >
            </main >
        </div >
    );
};

export default OperatorDashboard;
