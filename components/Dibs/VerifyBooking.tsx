import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, AlertCircle, Loader2, X, Clock, ExternalLink } from 'lucide-react';
import { GradientButton } from '../ui/AestheticComponents';

const VerifyBooking = () => {
    const [code, setCode] = useState('');
    const [status, setStatus] = useState<'IDLE' | 'SEARCHING' | 'FOUND' | 'ERROR'>('IDLE');
    const [bookingData, setBookingData] = useState<any>(null);

    const handleVerify = () => {
        if (code.length < 6) return;
        setStatus('SEARCHING');

        // Mock API Call
        setTimeout(() => {
            if (code.toUpperCase().startsWith('DIB-')) {
                const c = code.toUpperCase();
                let mockData = {
                    id: 'bk-123',
                    ref: c,
                    customer: 'Jane Doe',
                    item: 'Court 1 (5PM - 6PM)',
                    date: new Date().toLocaleDateString(),
                    status: 'PAID',
                    quantity: 1,
                    proof_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b'
                };

                if (c === 'DIB-PASS') {
                    mockData.customer = 'Nico T';
                    mockData.item = 'VIP Festival Pass';
                    mockData.status = 'PAID';
                } else if (c === 'DIB-FAIL') {
                    mockData.customer = 'Mark R';
                    mockData.status = 'VOIDED';
                } else if (c === 'DIB-9XJ2') {
                    mockData.customer = 'Sarah J';
                    mockData.status = 'PENDING';
                }

                setBookingData(mockData);
                setStatus('FOUND');
            } else {
                setStatus('ERROR');
            }
        }, 1500);
    };

    const handleRedeem = async () => {
        if (bookingData) {
            setBookingData({ ...bookingData, status: 'REDEEMED' });
        }
    };

    return (
        <div className="flex flex-col items-center justify-center max-w-md mx-auto py-10">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-black uppercase text-white mb-2">Verify Booking</h2>
                <p className="text-gray-400 text-sm">Enter the customer's 6-character booking reference.</p>
            </div>

            <div className="w-full bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-electric-teal/5 blur-3xl rounded-full" />

                <div className="relative mb-8 text-center">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 block mb-6 px-4">
                        Awaiting Scannable or Manual Entry
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="CODE-XXXX"
                            className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-5 text-white font-mono text-2xl tracking-[0.4em] text-center focus:outline-none focus:border-electric-teal shadow-inner transition-all uppercase placeholder:text-gray-800"
                            maxLength={8}
                        />
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700" size={20} />
                    </div>
                </div>

                {status === 'IDLE' && (
                    <GradientButton onClick={handleVerify} fullWidth disabled={code.length < 5}>
                        CHECK CODE
                    </GradientButton>
                )}

                {status === 'SEARCHING' && (
                    <div className="flex flex-col items-center py-8">
                        <Loader2 className="animate-spin text-electric-teal mb-2" size={32} />
                        <p className="text-xs font-bold uppercase text-gray-500 tracking-widest">Verifying...</p>
                    </div>
                )}

                {status === 'ERROR' && (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="text-red-500" size={32} />
                        </div>
                        <h3 className="text-white font-bold mb-1">Booking Not Found</h3>
                        <p className="text-gray-500 text-xs mb-4">The code entered does not exist or has expired.</p>
                        <button
                            onClick={() => setStatus('IDLE')}
                            className="text-xs font-bold uppercase text-white underline decoration-white/30 hover:decoration-white transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {status === 'FOUND' && bookingData && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="animate-in fade-in zoom-in duration-300"
                    >
                        <div className="text-center mb-8">
                            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border transition-all ${bookingData.status === 'REDEEMED' ? 'bg-white/5 border-white/10 text-gray-500' :
                                bookingData.status === 'VOIDED' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                    bookingData.status === 'PENDING' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                                        'bg-electric-teal/10 border-electric-teal/20 text-electric-teal shadow-[0_0_30px_rgba(45,212,191,0.1)]'
                                }`}>
                                {bookingData.status === 'VOIDED' ? <X size={40} /> :
                                    bookingData.status === 'PENDING' ? <Clock size={40} /> :
                                        <CheckCircle size={40} />}
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-2 leading-none">
                                {bookingData.status === 'REDEEMED' ? 'Redeemed' :
                                    bookingData.status === 'VOIDED' ? 'Voided' :
                                        bookingData.status === 'PENDING' ? 'Pending' :
                                            'Confirmed'}
                            </h3>
                            <p className={`font-mono font-black text-lg tracking-[0.2em] ${bookingData.status === 'VOIDED' ? 'text-red-500' :
                                bookingData.status === 'PENDING' ? 'text-yellow-500' :
                                    'text-electric-teal'
                                }`}>{bookingData.ref}</p>
                        </div>

                        <div className="bg-white/5 border border-white/5 rounded-3xl p-6 mb-8 space-y-5">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Customer</span>
                                <div className="text-right">
                                    <span className="text-white text-sm font-black block">{bookingData.customer}</span>
                                    <span className="text-[10px] text-gray-500 font-mono">ID: {bookingData.id}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Dibs</span>
                                <div className="text-right">
                                    <span className="text-white text-sm font-black block">{bookingData.item}</span>
                                    <span className="text-[10px] text-electric-teal font-bold">{bookingData.quantity} Units</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pb-2">
                                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Date</span>
                                <span className="text-white text-xs font-mono font-bold bg-white/5 px-2 py-1 rounded-md">{bookingData.date}</span>
                            </div>

                            {bookingData.proof_url && (
                                <div className="pt-2 border-t border-white/5">
                                    <a href={bookingData.proof_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-400 hover:text-white underline decoration-gray-600 underline-offset-4 flex items-center gap-2 justify-end">
                                        View Payment Proof <ExternalLink size={10} />
                                    </a>
                                </div>
                            )}
                        </div>

                        {bookingData.status !== 'REDEEMED' ? (
                            <GradientButton onClick={handleRedeem} fullWidth>
                                REDEEM NOW
                            </GradientButton>
                        ) : (
                            <button
                                onClick={() => { setCode(''); setStatus('IDLE'); }}
                                className="w-full py-3 rounded-xl bg-white/5 text-xs font-bold uppercase text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                Verify Next
                            </button>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default VerifyBooking;
