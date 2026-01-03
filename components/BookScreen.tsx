import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Star, ArrowRight, ChevronRight, X, Heart, Calendar, Users, CreditCard, CheckCircle, ArrowLeft, Smartphone } from 'lucide-react';
import TopBar from './TopBar';
import { User as UserType } from '../types';

interface InternalPlace {
    id: string;
    name: string;
    type: 'COURT' | 'HOTEL' | 'Hangout' | 'GYM';
    image: string;
    rating: number;
    price: string;
    location: string;
    distance: string;
}

interface InternalTicket {
    id: string;
    name: string;
    type: 'EVENT' | 'PARTY' | 'CONCERT' | 'LOUNGE';
    image: string;
    date: string;
    price: string;
    location: string;
    attendees: number;
}

const MOCK_PLACES: InternalPlace[] = [
    { id: 'p1', name: 'Metro Badminton Center', type: 'COURT', image: 'https://images.unsplash.com/photo-1626245550578-8ae7f6368d49?auto=format&fit=crop&q=80&w=600', rating: 4.8, price: '₱150/hr', location: 'Davao City', distance: '1.2km' },
    { id: 'p2', name: 'Seda Abreeza', type: 'HOTEL', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600', rating: 4.9, price: '₱4,500/night', location: 'Davao City', distance: '2.5km' },
    { id: 'p3', name: 'Anytime Fitness', type: 'GYM', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600', rating: 4.7, price: '₱2,500/mo', location: 'Abreeza Mall', distance: '2.5km' },
    { id: 'p4', name: 'Coffee Project', type: 'Hangout', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600', rating: 4.5, price: '₱200/item', location: 'Maa', distance: '3.0km' },
];

const MOCK_TICKETS: InternalTicket[] = [
    { id: 't1', name: 'Neon Nights @ Hallyu', type: 'PARTY', image: 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&q=80&w=600', date: 'Tonight, 9PM', price: '₱500', location: 'Hallyu Bar', attendees: 124 },
    { id: 't2', name: 'LANY Concert', type: 'CONCERT', image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=600', date: 'Oct 25', price: '₱3,500', location: 'SMX Convention', attendees: 5000 },
    { id: 't3', name: 'Sunday Market Access', type: 'EVENT', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=600', date: 'Sun, 8AM', price: 'Free', location: 'Azuela Cove', attendees: 340 },
];

type BookingStep = 'LIST' | 'DETAILS' | 'FORM' | 'PAYMENT' | 'SUCCESS';

const BookScreen: React.FC<{
    onOpenProfile: () => void,
    currentUser: UserType,
    onNavigate: (tab: 'HOME' | 'QUESTS' | 'CHATS' | 'BOOK' | 'SEARCH' | 'NOTIFICATIONS') => void
}> = ({ onOpenProfile, currentUser, onNavigate }) => {
    const [activeTab, setActiveTab] = useState<'PLACES' | 'TICKETS'>('PLACES');
    const [selectedItem, setSelectedItem] = useState<InternalPlace | InternalTicket | null>(null);
    const [bookingStep, setBookingStep] = useState<BookingStep>('LIST');

    // Form Data
    const [formData, setFormData] = useState({
        name: currentUser.name || '',
        date: '',
        guests: 1,
        promoCode: ''
    });

    const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'GCASH' | 'CASH'>('GCASH');

    // Scroll Logic
    const [showTopBar, setShowTopBar] = useState(true);
    const lastScrollY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastClickTimeRef = useRef(0);

    // Reset flow when item is deselected
    useEffect(() => {
        if (!selectedItem) {
            setBookingStep('LIST');
            setFormData({ name: currentUser.name || '', date: '', guests: 1, promoCode: '' });
        } else {
            setBookingStep('DETAILS');
        }
    }, [selectedItem, currentUser.name]);

    const handleLogoClick = () => {
        const now = Date.now();
        if (now - lastClickTimeRef.current < 300) {
            onNavigate('HOME');
        } else {
            containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }
        lastClickTimeRef.current = now;
    };

    const handleScroll = () => {
        const currentScrollY = containerRef.current?.scrollTop || 0;
        if (currentScrollY < 10) {
            setShowTopBar(true);
        } else if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
            setShowTopBar(false);
        } else if (currentScrollY < lastScrollY.current) {
            setShowTopBar(true);
        }
        lastScrollY.current = currentScrollY;
    };

    // --- Sub-components for cleanliness ---

    const renderDetails = () => {
        if (!selectedItem) return null;
        const isPlace = 'rating' in selectedItem;

        return (
            <div className="flex flex-col h-full bg-black/40 backdrop-blur-md">
                {/* Header Image */}
                <div className="relative h-[45%] shrink-0">
                    <img src={selectedItem.image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/30" />
                    <button onClick={() => setSelectedItem(null)} className="absolute top-6 left-6 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white/10 transition-colors z-50 border border-white/10">
                        <ChevronRight size={24} className="rotate-180" />
                    </button>
                    <div className="absolute bottom-8 left-6 right-6">
                        <span className="px-3 py-1 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-full mb-3 inline-block">
                            {selectedItem.type}
                        </span>
                        <h2 className="text-4xl font-black italic text-white leading-none mb-2">{selectedItem.name}</h2>
                        <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                            <MapPin size={14} className="text-primary" /> {selectedItem.location}
                            {isPlace && <span className="opacity-50">• {selectedItem.distance}</span>}
                        </div>
                    </div>
                </div>

                {/* Info Body */}
                <div className="flex-1 px-6 pt-4 pb-24 overflow-y-auto">
                    <div className="flex justify-between items-center mb-8 p-4 bg-card border border-white/5 rounded-2xl">
                        <div className="flex gap-8">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Price</span>
                                <span className="text-xl font-bold text-white">{selectedItem.price}</span>
                            </div>
                            {isPlace && (
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Rating</span>
                                    <span className="text-xl font-bold text-primary flex items-center gap-1">
                                        {selectedItem.rating} <Star size={14} className="fill-current" />
                                    </span>
                                </div>
                            )}
                            {!isPlace && (
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Going</span>
                                    <span className="text-xl font-bold text-primary flex items-center gap-1">
                                        {selectedItem.attendees} <Users size={14} />
                                    </span>
                                </div>
                            )}
                        </div>
                        <button className="p-3 rounded-full bg-surface border border-white/10 text-gray-400 hover:text-red-500 transition-colors">
                            <Heart size={20} />
                        </button>
                    </div>

                    <div className="space-y-4 mb-8">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">About</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Experience the best of Davao City lifestyle. Great vibes, amazing crowd, and unforgettable memories await.
                            Secure your spot now and join the community.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Amenities</h4>
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                            {['Wifi', 'Parking', 'Food', 'Drinks', 'AC'].map(item => (
                                <span key={item} className="px-4 py-2 bg-surface border border-white/5 rounded-xl text-xs font-bold text-gray-300">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0a0a0a] to-transparent">
                    <button
                        onClick={() => setBookingStep('FORM')}
                        className="w-full py-4 bg-primary text-black font-black text-lg uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        Reserve Now <ArrowRight size={20} strokeWidth={3} />
                    </button>
                </div>
            </div>
        );
    };

    const renderForm = () => {
        return (
            <div className="flex flex-col h-full bg-black/40 backdrop-blur-md p-6 pt-24">
                <div className="mb-8">
                    <button onClick={() => setBookingStep('DETAILS')} className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-gray-400 hover:text-white mb-6 border border-white/5">
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-3xl font-black italic text-white uppercase mb-2">Booking Details</h2>
                    <p className="text-gray-400 text-sm">Fill in the info to secure your slot.</p>
                </div>

                <div className="space-y-6 flex-1 overflow-y-auto">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-primary uppercase tracking-wider">Full Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-card border border-white/10 rounded-xl p-4 text-white font-bold outline-none ring-1 ring-transparent focus:ring-primary/50 transition-all placeholder-gray-700"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="space-y-2 flex-1">
                            <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1"><Calendar size={12} /> Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-card border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:ring-primary/50 transition-all [color-scheme:dark]"
                            />
                        </div>
                        <div className="space-y-2 w-1/3">
                            <label className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1"><Users size={12} /> Guests</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.guests}
                                onChange={e => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                                className="w-full bg-card border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:ring-primary/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-primary uppercase tracking-wider">Promo Code (Optional)</label>
                        <input
                            type="text"
                            placeholder="BE4L2024"
                            value={formData.promoCode}
                            onChange={e => setFormData({ ...formData, promoCode: e.target.value })}
                            className="w-full bg-card border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:ring-primary/50 transition-all placeholder-gray-700"
                        />
                    </div>
                </div>

                <button
                    onClick={() => setBookingStep('PAYMENT')}
                    disabled={!formData.name || !formData.date}
                    className={`w-full py-4 mt-4 font-black text-lg uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${(!formData.name || !formData.date) ? 'bg-surface text-gray-500 cursor-not-allowed' : 'bg-primary text-black shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:scale-[1.02] active:scale-[0.98]'}`}
                >
                    Proceed to Payment <ArrowRight size={20} strokeWidth={3} />
                </button>
            </div>
        )
    };

    const renderPayment = () => {
        return (
            <div className="flex flex-col h-full bg-black/40 backdrop-blur-md p-6 pt-24">
                <div className="mb-8">
                    <button onClick={() => setBookingStep('FORM')} className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-gray-400 hover:text-white mb-6 border border-white/5">
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-3xl font-black italic text-white uppercase mb-2">Checkout</h2>
                    <p className="text-gray-400 text-sm">Choose how you want to pay.</p>
                </div>

                <div className="space-y-4 flex-1">
                    <div
                        onClick={() => setPaymentMethod('GCASH')}
                        className={`p-5 rounded-2xl border flex items-center gap-4 cursor-pointer transition-all ${paymentMethod === 'GCASH' ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(204,255,0,0.1)]' : 'bg-card border-white/10 hover:bg-white/5'}`}
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">GCash</div>
                        <div className="flex-1">
                            <h4 className="text-white font-bold">GCash</h4>
                            <p className="text-gray-500 text-xs">Fast & Secure</p>
                        </div>
                        {paymentMethod === 'GCASH' && <CheckCircle size={20} className="text-primary" />}
                    </div>

                    <div
                        onClick={() => setPaymentMethod('CARD')}
                        className={`p-5 rounded-2xl border flex items-center gap-4 cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(204,255,0,0.1)]' : 'bg-card border-white/10 hover:bg-white/5'}`}
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white"><CreditCard size={20} /></div>
                        <div className="flex-1">
                            <h4 className="text-white font-bold">Credit / Debit Card</h4>
                            <p className="text-gray-500 text-xs">Visa, Mastercard</p>
                        </div>
                        {paymentMethod === 'CARD' && <CheckCircle size={20} className="text-primary" />}
                    </div>

                    <div
                        onClick={() => setPaymentMethod('CASH')}
                        className={`p-5 rounded-2xl border flex items-center gap-4 cursor-pointer transition-all ${paymentMethod === 'CASH' ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(204,255,0,0.1)]' : 'bg-card border-white/10 hover:bg-white/5'}`}
                    >
                        <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white"><Smartphone size={20} /></div>
                        <div className="flex-1">
                            <h4 className="text-white font-bold">Pay at Venue</h4>
                            <p className="text-gray-500 text-xs">Cash on Arrival</p>
                        </div>
                        {paymentMethod === 'CASH' && <CheckCircle size={20} className="text-primary" />}
                    </div>

                    <div className="mt-8 p-6 bg-card rounded-2xl border border-white/5 border-dashed">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-400 text-sm">Subtotal</span>
                            <span className="text-white font-bold">{selectedItem?.price} x {formData.guests}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-400 text-sm">Service Fee</span>
                            <span className="text-white font-bold">₱50</span>
                        </div>
                        <div className="w-full h-[1px] bg-white/10 my-4" />
                        <div className="flex justify-between">
                            <span className="text-white font-black text-lg">Total</span>
                            <span className="text-primary font-black text-lg italic">₱ ---</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setBookingStep('SUCCESS')}
                    className="w-full py-4 mt-4 bg-primary text-black font-black text-lg uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    Confirm Payment <ArrowRight size={20} strokeWidth={3} />
                </button>
            </div>
        )
    };

    const renderSuccess = () => {
        return (
            <div className="flex flex-col h-full bg-black/40 backdrop-blur-md items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(204,255,0,0.2)]">
                    <CheckCircle size={48} className="text-primary" />
                </div>
                <h2 className="text-4xl font-black italic text-white uppercase mb-4 tracking-tighter">You're Set!</h2>
                <p className="text-gray-400 text-sm max-w-xs mx-auto mb-8 leading-relaxed">
                    Your booking for <span className="text-white font-bold">{selectedItem?.name}</span> has been confirmed. A receipt has been sent to your email.
                </p>

                <div className="p-6 bg-card border border-white/10 rounded-2xl w-full max-w-sm mb-8 transform -rotate-2">
                    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
                        <span className="text-xs uppercase font-bold text-gray-500">Booking ID</span>
                        <span className="text-sm font-mono text-primary">#B4L-{Math.floor(Math.random() * 10000)}</span>
                    </div>
                    <div className="space-y-2 text-left">
                        <div className="flex justify-between">
                            <span className="text-gray-400 text-sm">Date</span>
                            <span className="text-white font-bold text-sm">{formData.date}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400 text-sm">Guests</span>
                            <span className="text-white font-bold text-sm">{formData.guests} Pax</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400 text-sm">Location</span>
                            <span className="text-white font-bold text-sm truncate max-w-[150px]">{selectedItem?.location}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => { setSelectedItem(null); setBookingStep('LIST'); }}
                    className="w-full py-4 bg-surface border border-white/10 text-white font-bold text-lg uppercase tracking-wider rounded-xl hover:bg-white/10 transition-all"
                >
                    Back to Places
                </button>
            </div>
        )
    }

    // --- Main Render ---

    return (
        <div className="flex-1 h-full relative flex flex-col overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            </div>

            {/* Overlays for different steps */}
            {selectedItem ? (
                <div className="absolute inset-0 z-[60] bg-black animate-in slide-in-from-bottom duration-300">
                    {bookingStep === 'DETAILS' && renderDetails()}
                    {bookingStep === 'FORM' && renderForm()}
                    {bookingStep === 'PAYMENT' && renderPayment()}
                    {bookingStep === 'SUCCESS' && renderSuccess()}
                </div>
            ) : (
                <>
                    <TopBar
                        visible={showTopBar}
                        onOpenProfile={onOpenProfile}
                        user={currentUser}
                        onLogoClick={handleLogoClick}
                        onSearchClick={() => onNavigate('SEARCH')}
                        onNotificationsClick={() => onNavigate('NOTIFICATIONS')}
                    />

                    <div
                        ref={containerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto px-4 pb-24 pt-24 no-scrollbar"
                    >
                        {/* Tabs */}
                        <div className="flex p-1 bg-surface rounded-2xl border border-white/5 relative overflow-hidden mb-6 mx-1">
                            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-xl transition-all duration-300 ease-spring ${activeTab === 'PLACES' ? 'left-1' : 'left-[calc(50%+4px)]'}`} />
                            <button
                                onClick={() => setActiveTab('PLACES')}
                                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest z-10 text-center transition-colors ${activeTab === 'PLACES' ? 'text-black' : 'text-gray-500 hover:text-white'}`}
                            >
                                Places
                            </button>
                            <button
                                onClick={() => setActiveTab('TICKETS')}
                                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest z-10 text-center transition-colors ${activeTab === 'TICKETS' ? 'text-black' : 'text-gray-500 hover:text-white'}`}
                            >
                                Tickets
                            </button>
                        </div>

                        {/* List Grid */}
                        <div className="grid grid-cols-1 gap-4">
                            {activeTab === 'PLACES' ? (
                                MOCK_PLACES.map(place => (
                                    <div key={place.id} onClick={() => setSelectedItem(place)} className="bg-card border border-white/5 rounded-3xl overflow-hidden active:scale-[0.98] transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] relative">
                                        <div className="h-48 relative">
                                            <img src={place.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                                            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                                <span className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                                                    {place.type}
                                                </span>
                                            </div>

                                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                                <div>
                                                    <h3 className="text-white font-bold text-xl leading-none mb-1">{place.name}</h3>
                                                    <p className="text-gray-400 text-xs flex items-center gap-1 font-medium"><MapPin size={12} className="text-primary" /> {place.location}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-primary font-black italic text-lg shadow-black drop-shadow-md">{place.price}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-card border-t border-white/5 flex items-center justify-between">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-card bg-gray-700 overflow-hidden">
                                                        <img src={`https://picsum.photos/50/50?random=${i + 10}`} className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                                <div className="w-6 h-6 rounded-full border-2 border-card bg-surface flex items-center justify-center text-[8px] font-bold text-gray-400">+12</div>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover:text-white transition-colors">
                                                View Details <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                MOCK_TICKETS.map(ticket => (
                                    <div key={ticket.id} onClick={() => setSelectedItem(ticket)} className="bg-card border border-white/5 rounded-3xl overflow-hidden active:scale-[0.98] transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] relative flex h-36">
                                        <div className="w-32 relative shrink-0">
                                            <img src={ticket.image} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/20" />
                                            <div className="absolute top-2 left-2 right-2 bottom-2 border border-white/20 rounded-xl flex flex-col items-center justify-center backdrop-blur-[2px]">
                                                <span className="text-[10px] font-black text-white uppercase">{ticket.date.split(',')[0]}</span>
                                                <span className="text-2xl font-black text-primary italic leading-none">{ticket.date.split(',')[1]?.trim().split(' ')[0] || '25'}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 p-4 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-[9px] font-black text-primary uppercase tracking-wider border border-primary/20 px-2 py-0.5 rounded-md bg-primary/5">{ticket.type}</span>
                                                    <span className="text-white font-black italic">{ticket.price}</span>
                                                </div>
                                                <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">{ticket.name}</h3>
                                            </div>

                                            <div className="flex justify-between items-end">
                                                <div className="flex items-center gap-1 text-gray-400 text-xs">
                                                    <MapPin size={12} /> {ticket.location}
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center text-white group-hover:bg-primary group-hover:text-black transition-all">
                                                    <ArrowRight size={14} strokeWidth={3} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default BookScreen;
