import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Building, Mail, Phone, Instagram, Globe, FileText, Zap } from 'lucide-react';
import { EKGLoader } from '../ui/AestheticComponents';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { supabase } from '../../utils/supabaseClient';

interface PendingOperator {
    id: string;
    business_name: string;
    contact_email: string;
    contact_number: string;
    category: string;
    social_handle?: string;
    website?: string;
    proof_url?: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

const AdminDashboard: React.FC = () => {
    useDocumentTitle('Admin Command');
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<PendingOperator[]>([]);

    const loadRequests = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('operators')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setRequests(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
        const { error } = await supabase
            .from('operators')
            .update({ status })
            .eq('id', id);

        if (!error) {
            setRequests(prev => prev.filter(r => r.id !== id));
        } else {
            alert('Error updating status: ' + error.message);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-transparent"><EKGLoader /></div>;

    return (
        <div className="min-h-screen bg-transparent text-white p-6 pt-32 pb-24">
            <header className="mb-12 max-w-4xl mx-auto flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-electric-teal/20 flex items-center justify-center text-electric-teal">
                            <Zap size={18} fill="currentColor" />
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter animate-liquid-text">Admin Command</h1>
                    </div>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] ml-11">Platform Integrity & Oversight</p>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-6 max-w-4xl mx-auto"
            >
                <AnimatePresence mode="popLayout">
                    {requests.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-32 text-white/20"
                        >
                            <div className="w-24 h-24 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <Check size={40} strokeWidth={3} className="opacity-30" />
                            </div>
                            <p className="uppercase tracking-[0.4em] font-black text-xs text-white/40">All Caught Up</p>
                            <p className="text-[10px] font-bold mt-3 text-white/10 uppercase tracking-widest">No pending partnership requests.</p>
                        </motion.div>
                    ) : (
                        requests.map(req => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={req.id}
                                className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 flex flex-col md:flex-row md:items-center justify-between gap-10 hover:bg-white/[0.05] hover:border-white/20 transition-all duration-500 group shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-electric-teal/5 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none group-hover:bg-electric-teal/10 transition-all duration-700" />

                                <div className="flex-1 space-y-6 relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-electric-teal shadow-xl group-hover:scale-110 group-hover:border-electric-teal/30 transition-all duration-500">
                                            <Building size={32} strokeWidth={1.5} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-2xl font-black uppercase text-white leading-none tracking-tight group-hover:text-electric-teal transition-colors">{req.business_name}</h3>
                                                <span className="px-3 py-1 rounded-full bg-electric-teal/10 border border-electric-teal/20 text-[9px] font-black uppercase tracking-widest text-electric-teal">{req.category}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-white/30 font-black uppercase tracking-widest">
                                                <span>Submitted {new Date(req.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-[11px] text-white/50 pl-0 md:pl-20 uppercase font-bold tracking-wider">
                                        <div className="flex items-center gap-3"><div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-white/20"><Mail size={12} /></div> {req.contact_email}</div>
                                        <div className="flex items-center gap-3"><div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-white/20"><Phone size={12} /></div> {req.contact_number}</div>
                                        {req.social_handle && <div className="flex items-center gap-3"><div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-white/20"><Instagram size={12} /></div> {req.social_handle}</div>}
                                        {req.website && <div className="flex items-center gap-3"><div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-white/20"><Globe size={12} /></div> {req.website}</div>}
                                        {req.proof_url && (
                                            <a
                                                href={req.proof_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 text-electric-teal hover:text-white transition-colors group/link"
                                            >
                                                <div className="w-6 h-6 rounded-lg bg-electric-teal/10 flex items-center justify-center group-hover/link:bg-electric-teal group-hover/link:text-black transition-all"><FileText size={12} /></div>
                                                <span className="border-b border-electric-teal/30 group-hover:border-white transition-all">Verification Proof</span>
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-row md:flex-col items-center gap-4 relative z-10 w-full md:w-auto">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleUpdateStatus(req.id, 'approved')}
                                        className="flex-1 md:w-40 py-4 rounded-2xl bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:shadow-[0_25px_50px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2"
                                    >
                                        <Check size={16} strokeWidth={4} /> Approve
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleUpdateStatus(req.id, 'rejected')}
                                        className="flex-1 md:w-40 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                                    >
                                        <X size={16} strokeWidth={4} /> Reject
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default AdminDashboard;
