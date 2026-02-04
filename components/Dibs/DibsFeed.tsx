import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseService } from '../../services/supabaseService';
import { Operator } from '../../types';
import OperatorCard from './OperatorCard';
import { EKGLoader } from '../ui/AestheticComponents';
import { MapPin, Ticket, Briefcase } from 'lucide-react';
import { useNavigation } from '../../contexts/NavigationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { UNIVERSAL_CATEGORIES } from '../../constants';

const DibsFeed: React.FC = () => {
    const navigate = useNavigate();
    const { setTabs, activeTab, setActiveTab } = useNavigation();
    const [operators, setOperators] = useState<Operator[]>([]);
    const [loading, setLoading] = useState(true);

    // Set Tabs for Sidebar
    useEffect(() => {
        setTabs([
            { label: 'Places', value: 'venue', icon: MapPin },
            { label: 'Event', value: 'event', icon: Ticket },
            { label: 'Services', value: 'service', icon: Briefcase }
        ]);
        setActiveTab('venue');
        return () => setTabs([]);
    }, []);

    useEffect(() => {
        const loadOps = async () => {
            setLoading(true);
            const data = await supabaseService.dibs.getOperators();
            setOperators(data);
            setLoading(false);
        };
        loadOps();
    }, []);

    const filteredOps = operators.filter(op => activeTab === 'All' || op.category.toLowerCase() === activeTab.toLowerCase());

    return (
        <div className="flex-1 pb-24 px-4">
            {/* Feed Grid */}

            {/* Feed Grid */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center py-20"
                    >
                        <EKGLoader size={40} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6"
                    >
                        {filteredOps.map(op => (
                            <OperatorCard
                                key={op.slug}
                                operator={op}
                                onClick={(slug) => navigate(`/shop/${slug}`)}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DibsFeed;
