import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, Package, CheckCircle, Search, X, Shield, List, Store, ArrowLeft, MessageCircle } from 'lucide-react';
import { EKGLoader } from '../ui/AestheticComponents';
import OrderManager from './OrderManager';
import VerifyBooking from './VerifyBooking';
import InventoryManager from './InventoryManager';
import BusinessProfileEditor from './BusinessProfileEditor';
import ChatListScreen from '../Chat/ChatListScreen';
import { useAuth } from '../../contexts/AuthContext';

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
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${active
            ? 'bg-electric-teal text-black shadow-[0_0_20px_rgba(45,212,191,0.4)]'
            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
    >
        <Icon size={16} className={active ? 'stroke-[3px]' : ''} />
        {label}
        {badge && (
            <span className="ml-1 px-2 py-0.5 text-[10px] bg-red-500 text-white rounded-full font-black">
                {badge}
            </span>
        )}
    </button>
);

interface OperatorDashboardProps {
    onBack?: () => void;
    initialTab?: 'overview' | 'orders' | 'verify' | 'items' | 'business' | 'comms';
}

const OperatorDashboard: React.FC<OperatorDashboardProps> = ({ onBack, initialTab = 'overview' }) => {
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

    useEffect(() => {
        const loadStats = async () => {
            // Mock Data Integration
            setTimeout(() => {
                setStats({
                    revenue: 45200,
                    bookings: 128,
                    followers: 1250,
                    pending: 4
                });
                setLoading(false);
            }, 1000);
        };
        loadStats();
    }, []);

    if (loading) return <div className="flex h-screen items-center justify-center bg-transparent"><EKGLoader /></div>;

    return (
        <div className="min-h-full bg-transparent text-white p-6 pt-16 pb-24 relative max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                {onBack && (
                    <button onClick={onBack} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                )}
                <h1 className="text-2xl font-black italic text-white tracking-tighter">DASHBOARD</h1>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-6">
                <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={BarChart3} label="Overview" />
                <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={DollarSign} label="Orders" badge={stats.pending > 0 ? stats.pending : undefined} />
                <TabButton active={activeTab === 'comms'} onClick={() => setActiveTab('comms')} icon={MessageCircle} label="Comms" />
                <TabButton active={activeTab === 'verify'} onClick={() => setActiveTab('verify')} icon={CheckCircle} label="Verify" />
                <TabButton active={activeTab === 'items'} onClick={() => setActiveTab('items')} icon={List} label="Items" />
                <TabButton active={activeTab === 'business'} onClick={() => setActiveTab('business')} icon={Store} label="Brand" />
            </div>

            {/* Content Body */}
            <main className="pb-32">
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
                                    title="Profile Visits"
                                    value="8,242"
                                    subtext="Last 30 days"
                                    icon={Users}
                                    trend={8.5}
                                />
                                <DataCard
                                    title="Aura Rating"
                                    value="9,950"
                                    subtext="Top 1% of creators"
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
                                <div className="lg:col-span-2 bg-white/[0.03] border border-white/5 rounded-3xl p-6 h-[300px] flex items-center justify-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-electric-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="text-center space-y-2 relative z-10">
                                        <BarChart3 className="mx-auto text-gray-600 mb-2" size={40} />
                                        <p className="text-sm font-bold text-gray-400">Revenue Analytics Coming Soon</p>
                                    </div>
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
                                operator={{
                                    business_name: 'Davao Pickleball Center',
                                    bio: 'The premier indoor pickleball facility in the south.',
                                    location: 'Obrero, Davao City/Philippines',
                                    operating_hours: '6:00 AM - 10:00 PM',
                                    contact_number: '0917-000-0000',
                                    email: 'info@davaopickle.com',
                                    gcash_name: 'John Doe',
                                    gcash_number: '09170000001',
                                    user_id: 'mock-user-id',
                                    category: 'venue',
                                    is_verified: true,
                                    rating: 4.8,
                                    image_url: 'https://images.unsplash.com/photo-1626224583764-84d2908ea0a3?q=80&w=2832&auto=format&fit=crop'
                                }}
                                onSave={(data: any) => {
                                    console.log('Saved Profile:', data);
                                    // Mock save to Supabase via service would go here
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
