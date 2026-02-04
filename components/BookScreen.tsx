import React, { useState, useEffect } from 'react';
import { Briefcase, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useNavigation } from '../contexts/NavigationContext';
import { supabaseService } from '../services/supabaseService';
import DibsCard, { Operator } from './DibsCard';
import { DibsSidebar, DibsHeader } from './Dibs/DibsFilters';
import { User as UserType, DibsItem } from '../types';
import DibsItemCard from './DibsItemCard';
import BookingModal from './Dibs/BookingModal';

const BookScreen: React.FC<{
    onOpenProfile: () => void,
    currentUser: UserType,
    onNavigate: (tab: 'HOME' | 'QUESTS' | 'CHATS' | 'BOOK' | 'SEARCH' | 'NOTIFICATIONS') => void
}> = ({ onOpenProfile, currentUser, onNavigate }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [brands, setBrands] = useState<Operator[]>([]);
    const [allItems, setAllItems] = useState<DibsItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<DibsItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeCat, setActiveCat] = useState('All');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
    const [locationFilter, setLocationFilter] = useState('');

    // Fetch Brands (Operators)
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [opData, itemData] = await Promise.all([
                    supabaseService.dibs.getOperators(),
                    supabaseService.dibs.getAllItems()
                ]);

                if (opData) {
                    const enhanced = opData.map(op => ({
                        ...op,
                        offerings: getMockOfferings(op.category)
                    }));
                    setBrands(enhanced);

                    // Handle deep-link from item param
                    const itemId = searchParams.get('item');
                    if (itemId && itemData) {
                        const targetItem = itemData.find(i => i.id === itemId);
                        if (targetItem) {
                            setSelectedItem(targetItem);
                        }
                    }
                }

                if (itemData) {
                    setAllItems(itemData);
                }

            } catch (err) {
                console.error("Failed to load dibs data", err);
            }
            setLoading(false);
        };
        loadData();
    }, [searchParams]);

    const getMockOfferings = (cat: string) => {
        if (cat === 'venue') return ['Court Rental', 'Coaching', 'Memberships'];
        if (cat === 'event') return ['Tickets', 'Merch', 'VIP Access'];
        if (cat === 'food') return ['Dine-in', 'Takeout', 'Reservations'];
        return ['Services', 'Consultation'];
    };

    // Filter Logic
    const filteredBrands = brands.filter(brand => {
        if (!brand) return false;

        // Global restriction: Only starting with Courts and Events
        const isAllowedCategory = brand.category === 'venue' || brand.category === 'event';
        if (!isAllowedCategory) return false;

        // Empty specific categories for now as requested
        const emptyCats = ['Competitions', 'Resto', 'Cafe', 'Vacation', 'Hotels', 'Services'];
        if (emptyCats.includes(activeCat)) return false;

        // Location filter
        if (locationFilter && !brand.location_text?.toLowerCase().includes(locationFilter.toLowerCase())) {
            return false;
        }

        if (activeCat === 'All') return true;
        if (activeCat === 'Courts') return brand.category === 'venue' || brand.business_name.toLowerCase().includes('court');
        if (activeCat === 'Events') return brand.category === 'event';

        // These are empty due to the check above but kept for logic completeness
        if (activeCat === 'Competitions') return brand.category === 'competition';
        if (activeCat === 'Resto') return brand.category === 'food' || brand.category === 'restaurant' || brand.category === 'resto';
        if (activeCat === 'Cafe') return brand.category === 'cafe' || brand.category === 'coffee';
        if (activeCat === 'Vacation' || activeCat === 'Hotels') return brand.category === 'stay' || brand.category === 'hotel' || brand.category === 'resort';
        if (activeCat === 'Services') return brand.category === 'service' || brand.category === 'wellness';

        return true;
    });

    const filteredItems = allItems.filter(item => {
        // Global restriction: Only starting with Courts and Events
        // (PLACE type is usually Courts, EVENT type is usually Events/Competitions)
        const isAllowedType = item.type === 'PLACE' || item.type === 'EVENT';
        // But we want to be stricter:
        const brand = brands.find(b => b.user_id === item.operator_id);
        if (!brand) return false;
        const brandIsAllowed = brand.category === 'venue' || brand.category === 'event';
        if (!brandIsAllowed) return false;

        // Empty specific categories
        const emptyCats = ['Competitions', 'Resto', 'Cafe', 'Vacation', 'Hotels', 'Services'];
        if (emptyCats.includes(activeCat)) return false;

        // Price filter: find lowest price
        const lowestPrice = item.tiers && item.tiers.length > 0
            ? Math.min(...item.tiers.map(t => t.price))
            : item.price;
        if (lowestPrice < priceRange[0] || lowestPrice > priceRange[1]) return false;

        // Location filter
        if (locationFilter) {
            const hasLocation = item.event_location?.toLowerCase().includes(locationFilter.toLowerCase());
            const brandHasLocation = brand?.location_text?.toLowerCase().includes(locationFilter.toLowerCase());
            if (!hasLocation && !brandHasLocation) return false;
        }

        if (activeCat === 'All') return true;
        if (activeCat === 'Courts') return item.type === 'PLACE' && (item.category?.toLowerCase().includes('court') || item.title.toLowerCase().includes('court'));
        if (activeCat === 'Events') return item.type === 'EVENT' && item.category?.toLowerCase() !== 'competition';
        return true;
    });

    return (
        <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-transparent">
            <div className="flex-1 h-full overflow-hidden flex flex-col md:flex-row max-w-[1600px] mx-auto w-full">

                {/* Desktop Sidebar (Left) */}
                <div className="hidden md:flex flex-col w-40 shrink-0 pt-8 border-r border-white/[0.02] sticky top-0 h-full overflow-y-auto no-scrollbar">
                    <DibsSidebar
                        activeCat={activeCat}
                        setActiveCat={setActiveCat}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                        locationFilter={locationFilter}
                        setLocationFilter={setLocationFilter}
                    />
                </div>

                {/* Main Content */}
                <div className="flex-1 h-full overflow-y-auto no-scrollbar relative flex flex-col">

                    {/* Mobile Header (Filters) */}
                    <div className="md:hidden pt-6 pb-2 sticky top-0 z-30 bg-black/40 backdrop-blur-xl">
                        <DibsHeader
                            activeCat={activeCat}
                            setActiveCat={setActiveCat}
                            priceRange={priceRange}
                            setPriceRange={setPriceRange}
                            locationFilter={locationFilter}
                            setLocationFilter={setLocationFilter}
                        />
                    </div>

                    {/* Feed Grid */}
                    <div className="flex-1 overflow-y-auto pt-4 md:pt-8 pb-32 space-y-16 px-4 no-scrollbar">

                        {/* Discovery Row (Items) */}
                        {!loading && filteredItems.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                                        <Sparkles size={14} className="text-electric-teal" /> DISCOVER
                                    </h3>
                                </div>
                                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 -mx-1 px-1">
                                    {filteredItems.filter(i => i.is_active !== false).map(item => (
                                        <div key={item.id} className="w-[300px] shrink-0">
                                            <DibsItemCard
                                                item={item}
                                                operator={brands.find(b => b.user_id === item.operator_id)}
                                                onClick={() => setSelectedItem(item)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className="col-span-full flex items-center justify-center py-20">
                                <div className="w-8 h-8 border-2 border-electric-teal/20 border-t-electric-teal rounded-full animate-spin" />
                            </div>
                        ) : activeCat === 'All' ? (
                            /* All Page: Categorized Slidable Rows */
                            <div className="space-y-16 pb-20">

                                {/* Section: Courts */}
                                {(() => {
                                    const sectionBrands = filteredBrands.filter(b => b.category === 'venue' || b.business_name.toLowerCase().includes('court'));
                                    if (sectionBrands.length === 0) return null;
                                    return (
                                        <div className="space-y-4">
                                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 px-1">COURTS</h3>
                                            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6 -mx-1 px-1">
                                                {sectionBrands.map(brand => (
                                                    <div key={brand.user_id} className="w-[300px] shrink-0">
                                                        <DibsCard
                                                            operator={brand}
                                                            onClick={(slug) => navigate(`/app/shop/${slug}`)}
                                                            isMe={brand.user_id === currentUser.id}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Section: Events */}
                                {(() => {
                                    const sectionBrands = filteredBrands.filter(b => b.category === 'event');
                                    if (sectionBrands.length === 0) return null;
                                    return (
                                        <div className="space-y-4">
                                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 px-1">EVENTS</h3>
                                            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6 -mx-1 px-1">
                                                {sectionBrands.map(brand => (
                                                    <div key={brand.user_id} className="w-[300px] shrink-0">
                                                        <DibsCard
                                                            operator={brand}
                                                            onClick={(slug) => navigate(`/app/shop/${slug}`)}
                                                            isMe={brand.user_id === currentUser.id}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        ) : (
                            /* Specific Category: Grid View */
                            <div className="space-y-6">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 px-1">
                                    {activeCat}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                                    {filteredBrands.length === 0 ? (
                                        <div className="col-span-full flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-500">
                                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                                                <Briefcase size={24} className="text-white/20" />
                                            </div>
                                            <h3 className="text-white font-bold text-lg mb-2 uppercase tracking-tight">No brands yet</h3>
                                            <p className="text-gray-500 text-sm mb-6 italic">Are you a brand? Partner with us.</p>
                                            <button
                                                onClick={() => navigate('/partner')}
                                                className="px-8 py-4 bg-electric-teal/5 hover:bg-electric-teal/10 border-2 border-electric-teal/30 hover:border-electric-teal rounded-full transition-all group active:scale-95"
                                            >
                                                <span className="text-electric-teal font-black text-xs tracking-[0.3em] uppercase animate-liquid-text">
                                                    Partner With Be4L
                                                </span>
                                            </button>
                                        </div>
                                    ) : (
                                        filteredBrands.map(brand => (
                                            <DibsCard
                                                key={brand.user_id}
                                                operator={brand}
                                                onClick={(slug) => navigate(`/app/shop/${slug}`)}
                                                isMe={brand.user_id === currentUser.id}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            {selectedItem && (
                <BookingModal
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                    item={selectedItem}
                    operator={brands.find(op => op.user_id === selectedItem.operator_id) || { business_name: 'Be4L Partner', category: 'venue', logo_url: '', cover_photo_url: '', slug: '', user_id: selectedItem.operator_id, is_verified: true, followers_count: 0 } as any}
                />
            )}
        </div>
    );
};

export default BookScreen;
