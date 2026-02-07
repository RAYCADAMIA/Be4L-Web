import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Building, MapPin, User, Mail, Phone } from 'lucide-react';
import { EKGLoader } from '../ui/AestheticComponents';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

interface PendingOperator {
    id: string;
    business_name: string;
    contact_name: string;
    email: string;
    phone: string;
    location_text: string;
    status: 'pending';
    created_at: string;
}

const AdminDashboard: React.FC = () => {
    useDocumentTitle('Admin Command');
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<PendingOperator[]>([]);

    useEffect(() => {
        const loadRequests = async () => {
            setRequests([
                {
                    id: 'op_123',
                    business_name: 'Davao Pickleball Club',
                    contact_name: 'John Doe',
                    email: 'john@example.com',
                    phone: '0917-123-4567',
                    location_text: 'Ecoland, Davao City',
                    status: 'pending',
                    created_at: new Date().toISOString()
                },
                {
                    id: 'op_456',
                    business_name: 'Mt. Apo Coffee',
                    contact_name: 'Jane Smith',
                    email: 'jane@example.com',
                    phone: '0918-987-6543',
                    location_text: 'Toril, Davao City',
                    status: 'pending',
                    created_at: new Date().toISOString()
                }
            ]);
            setLoading(false);
        };
        loadRequests();
    }, []);

    const handleApprove = (id: string) => {
        setRequests(prev => prev.filter(r => r.id !== id));
    };

    const handleReject = (id: string) => {
        setRequests(prev => prev.filter(r => r.id !== id));
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-deep-void"><EKGLoader /></div>;

    return (
        <div className="min-h-screen bg-deep-void text-white p-6 pb-24">
            <header className="mb-8">
                <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Admin Command</h1>
                <p className="text-gray-500 text-sm">Review partnership applications and manage platform integrity.</p>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-4"
            >
                {requests.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <Check size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="uppercase tracking-widest font-bold">All Caught Up</p>
                        <p className="text-xs">No pending partnership requests.</p>
                    </div>
                ) : (
                    requests.map(req => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key={req.id}
                            className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/10 transition-colors group"
                        >
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-electric-teal/10 flex items-center justify-center text-electric-teal shadow-[0_0_15px_rgba(45,212,191,0.1)] group-hover:scale-110 transition-transform">
                                        <Building size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase text-white leading-none tracking-tight">{req.business_name}</h3>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">
                                            <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full"><MapPin size={10} /> {req.location_text}</div>
                                            <span className="text-white/10">•</span>
                                            <span>{new Date(req.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-gray-400 pl-16">
                                    <div className="flex items-center gap-2 hover:text-white transition-colors"><User size={12} className="text-electric-teal/50" /> {req.contact_name}</div>
                                    <div className="flex items-center gap-2 hover:text-white transition-colors"><Mail size={12} className="text-electric-teal/50" /> {req.email}</div>
                                    <div className="flex items-center gap-2 hover:text-white transition-colors"><Phone size={12} className="text-electric-teal/50" /> {req.phone}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pl-16 md:pl-0">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleReject(req.id)}
                                    className="px-5 py-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold uppercase text-[10px] tracking-widest transition-colors flex items-center gap-2 border border-transparent hover:border-red-500/30"
                                >
                                    <X size={14} strokeWidth={3} /> Reject
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleApprove(req.id)}
                                    className="px-6 py-2.5 rounded-xl bg-electric-teal text-black hover:bg-electric-teal/90 font-black uppercase text-[10px] tracking-widest transition-colors shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:shadow-[0_0_30px_rgba(45,212,191,0.5)] flex items-center gap-2"
                                >
                                    <Check size={14} strokeWidth={3} /> Approve
                                </motion.button>
                            </div>
                        </motion.div>
                    ))
                )}
            </motion.div>
        </div>
    );
};

export default AdminDashboard;
