import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, ArrowRight, ChevronRight, X, Heart, Calendar, Users, CreditCard, CheckCircle, ArrowLeft, Smartphone } from 'lucide-react';
import { FloatingTabs } from './ui/AestheticComponents';
import TopBar from './TopBar';
import { User as UserType } from '../types';
import { supabaseService } from '../services/supabaseService';

interface InternalPlace {
    id: string;
    name: string;
    type: string;
    category: 'Courts' | 'Resto' | 'Cafe' | 'Hotel' | 'Others';
    image: string;
    rating: number;
    price: string;
    location: string;
    distance: string;
}

interface InternalEvent {
    id: string;
    name: string;
    type: string;
    category: 'Competitions' | 'Socials' | 'Others';
    image: string;
    date: string;
    price: string;
    location: string;
    attendees: number;
}

const MOCK_PLACES: InternalPlace[] = [
    { id: 'p1', name: 'SuperSmasher Pickleball', type: 'COURT', category: 'Courts', image: 'https://images.unsplash.com/photo-1626245550578-8ae7f6368d49?auto=format&fit=crop&q=80&w=600', rating: 4.9, price: '₱150/hr', location: 'Lanang, Davao', distance: '1.2km' },
    { id: 'p2', name: 'PickleTown Davao', type: 'COURT', category: 'Courts', image: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&q=80&w=600', rating: 4.8, price: '₱200/hr', location: 'Matina Enclaves', distance: '3.5km' },
    { id: 'p3', name: 'Quinspot Fitness', type: 'GYM', category: 'Others', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600', rating: 4.7, price: '₱2,500/mo', location: 'Damosa Gateway', distance: '2.1km' },
    { id: 'p4', name: 'Homecourt Davao', type: 'COURT', category: 'Courts', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=600', rating: 4.6, price: '₱500/hr', location: 'Obrero', distance: '0.8km' },
    { id: 'p5', name: 'Cloud29 Rooftop', type: 'Hangout', category: 'Others', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600', rating: 4.5, price: '₱500/entry', location: 'Juna Subd', distance: '4.2km' },
    { id: 'p6', name: 'The Matcha Bar', type: 'Cafe', category: 'Cafe', image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=600', rating: 4.9, price: '₱250/pax', location: 'Torres St.', distance: '1.5km' },
    { id: 'p7', name: 'Dustin\'s Steakhouse', type: 'Resto', category: 'Resto', image: 'https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?auto=format&fit=crop&q=80&w=600', rating: 4.7, price: '₱1,200/avg', location: 'Bajada', distance: '2.8km' },
    { id: 'p8', name: 'The Ritz Hotel', type: 'Hotel', category: 'Hotel', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600', rating: 4.6, price: '₱4,500/night', location: 'Obrero', distance: '1.0km' },
    { id: 'p9', name: 'Marco Polo Davao', type: 'Hotel', category: 'Hotel', image: 'https://images.unsplash.com/photo-1551882547-ff43c33f1744?auto=format&fit=crop&q=80&w=600', rating: 4.8, price: '₱5,800/night', location: 'Bajada', distance: '2.5km' },
    { id: 'p10', name: 'Tennis Club Davao', type: 'Court', category: 'Courts', image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a4bd13?auto=format&fit=crop&q=80&w=600', rating: 4.5, price: '₱300/hr', location: 'Torres St.', distance: '1.4km' },
    { id: 'p11', name: 'Outback Grill', type: 'Resto', category: 'Resto', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600', rating: 4.6, price: '₱800/avg', location: 'Lanang', distance: '1.9km' },
];

const MOCK_EVENTS: InternalEvent[] = [
    { id: 't2', name: '&Friends Festival', type: 'CONCERT', category: 'Socials', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600', date: 'Jan 23-25, 2026', price: '₱1,200/ticket', location: 'Okada, Manila', attendees: 1200 },
    { id: 't8', name: 'Pickleball Invitational', type: 'LEAGUE', category: 'Competitions', image: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&q=80&w=600', date: 'Feb 12, 2026', price: '₱500/team', location: 'SuperSmasher', attendees: 64 },
    { id: 't9', name: 'Art & Matcha Workshop', type: 'CLASS', category: 'Others', image: 'https://images.unsplash.com/photo-1515630278258-407f66498911?auto=format&fit=crop&q=80&w=600', date: 'Feb 15, 2026', price: '₱800/person', location: 'Quinspot', attendees: 25 },
    { id: 't11', name: 'Tech Founders Meetup', type: 'NETWORKING', category: 'Socials', image: 'https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&q=80&w=600', date: 'Feb 18, 2026', price: 'Free', location: 'Finster Hall', attendees: 120 },
    { id: 't5', name: 'Fuego Flea Market', type: 'EVENT', category: 'Socials', image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=600', date: 'Feb 20-22, 2026', price: 'Free', location: 'SM Lanang Prem', attendees: 5000 },
    { id: 't1', name: 'Psyched House Party', type: 'PARTY', category: 'Socials', image: 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&q=80&w=600', date: 'Tonight', price: '₱350/ticket', location: 'Private Venue, Davao', attendees: 180 },
    { id: 't3', name: 'Ballbreakers Finals', type: 'EVENT', category: 'Competitions', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=600', date: 'Next Saturday', price: '₱100/ticket', location: 'Homecourt Obrero', attendees: 340 },
    { id: 't4', name: 'Davao Golf Open', type: 'EVENT', category: 'Competitions', image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=600', date: 'Nov 12, 2026', price: '₱2,500/person', location: 'Rancho Palos Verdes', attendees: 80 },
    { id: 't6', name: 'Midnight Run Bash', type: 'RACE', category: 'Competitions', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=600', date: 'Oct 30, 2026', price: '₱200/person', location: 'Coastal Road', attendees: 450 },
    { id: 't7', name: 'Vibe Check DJ Night', type: 'SOCIAL', category: 'Socials', image: 'https://images.unsplash.com/photo-1514525253361-bee243870d4c?auto=format&fit=crop&q=80&w=600', date: 'Every Friday', price: '₱300/ticket', location: 'Cloud29', attendees: 200 },
    { id: 't10', name: 'Retro Movie Night', type: 'CINEMA', category: 'Socials', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=600', date: 'Sun, 7PM', price: 'Free', location: 'City Hall Green', attendees: 300 },
    { id: 't12', name: 'Inter-High Basketball', type: 'TOURNAMENT', category: 'Competitions', image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=600', date: 'Dec 1, 9AM', price: '₱50/ticket', location: 'MTS Pickle', attendees: 1000 },
    { id: 't13', name: 'Sunday Wellness Yoga', type: 'WELLNESS', category: 'Others', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600', date: 'Sun, 6AM', price: '₱1,000/person', location: 'Eden Nature Park', attendees: 50 },
    { id: 't14', name: 'Underground Tekken Match', type: 'ESPORTS', category: 'Competitions', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600', date: 'Sat, 8PM', price: '₱200/ticket', location: 'Gamerz Den', attendees: 40 },
    { id: 't15', name: 'Riverside BBQ Party', type: 'PARTY', category: 'Socials', image: 'https://images.unsplash.com/photo-1533143708019-15dcb4e43bc7?auto=format&fit=crop&q=80&w=600', date: 'Sun, 4PM', price: '₱500/person', location: 'Riverside Calinan', attendees: 100 },
    { id: 't16', name: 'Davao Esports Cup', type: 'TOURNAMENT', category: 'Competitions', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=600', date: 'Nov 20, 10AM', price: '₱300/ticket', location: 'SM Convention', attendees: 800 },
];

type BookingStep = 'LIST' | 'DETAILS' | 'FORM' | 'PAYMENT' | 'SUCCESS';

const BookScreen: React.FC<{
    onOpenProfile: () => void,
    currentUser: UserType,
    onNavigate: (tab: 'HOME' | 'QUESTS' | 'CHATS' | 'BOOK' | 'SEARCH' | 'NOTIFICATIONS') => void
}> = ({ onOpenProfile, currentUser, onNavigate }) => {
    const [places, setPlaces] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'PLACES' | 'EVENTS'>('PLACES');
    const [activePlaceCat, setActivePlaceCat] = useState('All');
    const [activeEventCat, setActiveEventCat] = useState('All');
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [bookingStep, setBookingStep] = useState<BookingStep>('LIST');

    // Form Data
    const [formData, setFormData] = useState({
        name: currentUser.name || '',
        date: '',
        guests: 1,
        promoCode: ''
    });

    const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'GCASH' | 'CASH'>('GCASH');
    const [paymentRef, setPaymentRef] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Scroll Logic for Sync Top Bar
    const [topBarY, setTopBarY] = useState(0);
    const lastScrollY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastClickTimeRef = useRef(0);

    // Fetch Data
    useEffect(() => {
        const loadDibs = async () => {
            setLoading(true);
            const [p, e] = await Promise.all([
                supabaseService.dibs.getItems('PLACE'),
                supabaseService.dibs.getItems('EVENT')
            ]);
            setPlaces(p);
            setEvents(e);
            setLoading(false);
        };
        loadDibs();
    }, []);

    // Reset flow when item is deselected
    useEffect(() => {
        if (!selectedItem) {
            setBookingStep('LIST');
            setFormData({ name: currentUser.name || '', date: '', guests: 1, promoCode: '' });
            setPaymentRef('');
        } else {
            setBookingStep('DETAILS');
        }
    }, [selectedItem, currentUser.name]);

    // Payment Logic
    const handleConfirmPayment = async () => {
        if (!selectedItem || !paymentRef) return;
        setIsSubmitting(true);

        // Calculate Total
        const price = parseFloat(selectedItem.price.replace(/[^\d.]/g, '')) || 0; // Naive parsing for now
        const total = price * formData.guests + 50;

        const { success, orderId } = await supabaseService.dibs.createOrder(
            selectedItem.id,
            total,
            paymentRef
        );

        setIsSubmitting(false);

        if (success) {
            setBookingStep('SUCCESS');
        } else {
            alert("Booking Failed. Please try again.");
        }
    };

    // ... Existing Scroll Logic ...
    const handleLogoClick = () => {
        const now = Date.now();
        if (now - lastClickTimeRef.current < 300) {
            onNavigate('LANDING');
        } else {
            containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }
        lastClickTimeRef.current = now;
    };

    const handleScroll = () => {
        const currentScrollY = containerRef.current?.scrollTop || 0;
        const delta = currentScrollY - lastScrollY.current;

        if (currentScrollY > 10) {
            setTopBarY(prev => {
                const newY = prev - delta;
                return Math.max(-80, Math.min(0, newY));
            });
        } else {
            setTopBarY(0);
        }

        lastScrollY.current = currentScrollY;
    };

    // --- Sub-components for cleanliness ---

    const renderDetails = () => {
        if (!selectedItem) return null;
        // Check if it's a place by looking for rating or type
        const isPlace = selectedItem.type === 'PLACE' || 'rating' in selectedItem;

        return (
            <div className="flex flex-col h-full bg-black/40 backdrop-blur-md">
                {/* Header Image */}
                <div className="relative h-[45%] shrink-0">
                    <img src={selectedItem.image_url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-transparent to-black/30" />
                    <button onClick={() => setSelectedItem(null)} className="absolute top-6 left-6 p-2 bg-white/[0.03] backdrop-blur-md rounded-full text-white hover:bg-white/10 transition-colors z-50 border border-white/5">
                        <ChevronRight size={24} className="rotate-180" />
                    </button>
                    <div className="absolute bottom-8 left-6 right-6">
                        <span className="px-3 py-1 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-full mb-3 inline-block">
                            {selectedItem.type}
                        </span>
                        <h2 className="text-4xl font-black italic text-white leading-none mb-2">{selectedItem.name}</h2>
                        <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">
                            <MapPin size={14} className="text-primary" /> {selectedItem.location || 'Davao City'}
                        </div>
                    </div>
                </div>

                {/* Info Body */}
                <div className="flex-1 px-6 pt-12 pb-20 overflow-y-auto">
                    <div className="flex justify-between items-center mb-8 p-4 bg-card border border-white/5 rounded-2xl">
                        <div className="flex gap-8">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Price</span>
                                <span className="text-xl font-bold text-white">₱{selectedItem.price}</span>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">{isPlace ? 'Rating' : 'Going'}</span>
                                <span className="text-xl font-bold text-primary flex items-center gap-1">
                                    {isPlace ? '4.9' : selectedItem.capacity || 'Unlimited'} {isPlace && <Star size={14} className="fill-current" />}
                                </span>
                            </div>
                        </div>
                        <button className="p-3 rounded-full bg-surface border border-white/10 text-gray-400 hover:text-red-500 transition-colors">
                            <Heart size={20} />
                        </button>
                    </div>

                    <div className="space-y-4 mb-8">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">About</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            {selectedItem.description || "Experience the best of Davao City lifestyle. Great vibes, amazing crowd, and unforgettable memories await."}
                        </p>
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
            <div className="flex flex-col h-full bg-black/40 backdrop-blur-md p-6 pt-16">
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
        const priceVal = parseFloat(selectedItem?.price?.toString().replace(/[^\d.]/g, '') || '0');
        const total = (priceVal * formData.guests) + 50;

        return (
            <div className="flex flex-col h-full bg-black/40 backdrop-blur-md p-6 pt-16">
                <div className="mb-4">
                    <button onClick={() => setBookingStep('FORM')} className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-gray-400 hover:text-white mb-6 border border-white/5">
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-3xl font-black italic text-white uppercase mb-2">Checkout</h2>
                    <p className="text-gray-400 text-sm">Review your booking.</p>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto">
                    {/* Provider GCash Card */}
                    <div className="p-5 rounded-2xl bg-surface border border-white/10">
                        <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Send Payment To</h4>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-[10px]">GCash</div>
                            <div>
                                <h3 className="text-white font-bold text-lg">{selectedItem?.provider?.gcash_name || selectedItem?.name || "Provider"}</h3>
                                <p className="text-primary font-mono text-xl tracking-wider">{selectedItem?.provider?.gcash_number || "0917-XXX-XXXX"}</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Please send the exact amount to the number above via GCash. Take a screenshot of your receipt and enter the <span className="text-white font-bold">Reference Number</span> below.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-primary uppercase tracking-wider">GCash Reference No.</label>
                        <input
                            type="text"
                            placeholder="e.g. 100234567890"
                            value={paymentRef}
                            onChange={e => setPaymentRef(e.target.value)}
                            className="w-full bg-card border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:ring-primary/50 transition-all font-mono text-lg"
                        />
                    </div>

                    <div className="mt-4 p-6 bg-card rounded-2xl border border-white/5 border-dashed">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-400 text-sm">Subtotal</span>
                            <span className="text-white font-bold">₱{priceVal} x {formData.guests}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-400 text-sm">Service Fee</span>
                            <span className="text-white font-bold">₱50</span>
                        </div>
                        <div className="w-full h-[1px] bg-white/10 my-4" />
                        <div className="flex justify-between">
                            <span className="text-white font-black text-lg">Total</span>
                            <span className="text-primary font-black text-lg italic">₱{total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleConfirmPayment}
                    disabled={!paymentRef || isSubmitting}
                    className={`w-full py-4 mt-4 font-black text-lg uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all flex items-center justify-center gap-2 ${(!paymentRef || isSubmitting) ? 'bg-gray-800 text-gray-500' : 'bg-primary text-black hover:scale-[1.02]'}`}
                >
                    {isSubmitting ? 'Verifying...' : 'Submit Reference No.'} <ArrowRight size={20} strokeWidth={3} />
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
                <h2 className="text-4xl font-black italic text-white uppercase mb-4 tracking-tighter">Verification Pending</h2>
                <p className="text-gray-400 text-sm max-w-xs mx-auto mb-8 leading-relaxed">
                    We've received your Reference No. <span className="text-white font-mono">{paymentRef}</span>. The provider will verify it shortly. You'll get a notification once confirmed.
                </p>

                <button
                    onClick={() => { setSelectedItem(null); setBookingStep('LIST'); setPaymentRef(''); }}
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
                <div className="absolute inset-0 z-[60] bg-deep-black animate-in slide-in-from-bottom duration-300">
                    {bookingStep === 'DETAILS' && renderDetails()}
                    {bookingStep === 'FORM' && renderForm()}
                    {bookingStep === 'PAYMENT' && renderPayment()}
                    {bookingStep === 'SUCCESS' && renderSuccess()}
                </div>
            ) : (
                <>

                    <TopBar
                        translateY={topBarY}
                        onOpenProfile={onOpenProfile}
                        user={currentUser}
                        onLogoClick={handleLogoClick}
                        onSearchClick={() => onNavigate('SEARCH')}
                        onNotificationsClick={() => onNavigate('NOTIFICATIONS')}
                    />

                    <motion.div
                        animate={{ y: topBarY }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="absolute top-[80px] left-0 right-0 z-30 flex items-center justify-center pt-2 pointer-events-none"
                    >
                        <FloatingTabs
                            activeTab={activeTab}
                            onChange={(val) => setActiveTab(val as 'PLACES' | 'EVENTS')}
                            tabs={[
                                { label: 'Places', value: 'PLACES' },
                                { label: 'Events', value: 'EVENTS' }
                            ]}
                        />
                    </motion.div>

                    <div
                        ref={containerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto pb-14 pt-[150px] no-scrollbar"
                    >
                        {/* Category Bar */}
                        <div className="px-4 mb-6">
                            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-2 px-2 py-1">
                                {(activeTab === 'PLACES'
                                    ? ['All', 'Courts', 'Resto', 'Cafe', 'Hotel', 'Others']
                                    : ['All', 'Competitions', 'Socials', 'Others']
                                ).map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => activeTab === 'PLACES' ? setActivePlaceCat(cat) : setActiveEventCat(cat)}
                                        className={`px-5 py-2 rounded-full whitespace-nowrap text-[10px] font-black uppercase tracking-tighter transition-all ${(activeTab === 'PLACES' ? activePlaceCat === cat : activeEventCat === cat)
                                            ? 'bg-white text-black'
                                            : 'bg-white/[0.04] text-gray-500'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* List Grid */}
                        <div className="grid grid-cols-1 gap-4 px-4 pb-20">
                            {loading ? (
                                <div className="text-center text-gray-500 py-10">Loading Dibs...</div>
                            ) : (
                                (activeTab === 'PLACES' ? places : events)
                                    .filter(item => {
                                        const activeCat = activeTab === 'PLACES' ? activePlaceCat : activeEventCat;
                                        return activeCat === 'All' || item.category === activeCat; // Keep simple for now
                                    })
                                    .map(item => (
                                        <div key={item.id} onClick={() => setSelectedItem(item)} className="bg-card border border-white/[0.03] rounded-3xl overflow-hidden active:scale-[0.98] transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] relative">
                                            <div className="h-48 relative">
                                                <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                                                <div className="absolute top-3 left-3 bg-white/[0.05] backdrop-blur-md px-3 py-1 rounded-full border border-white/[0.05]">
                                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                                                        {item.type}
                                                    </span>
                                                </div>

                                                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                                    <div>
                                                        <h3 className="text-white font-bold text-xl leading-none mb-1">{item.name}</h3>
                                                        <p className="text-gray-400 text-xs flex items-center gap-1 font-medium"><MapPin size={12} className="text-primary" /> {item.location || 'Davao'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-primary font-black italic text-lg shadow-black drop-shadow-md">₱{item.price}</span>
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
