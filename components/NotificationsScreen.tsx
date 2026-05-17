import React, { useState, useEffect } from 'react';
import { User, MessageCircle, Heart, Star, Calendar, ChevronLeft, Check, X } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { useNavigate } from 'react-router-dom';

const NotificationsScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchNotifs = async () => {
        setLoading(true);
        const data = await supabaseService.notifications.getNotifications();
        setNotifications(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchNotifs();

        const { supabase } = supabaseService as any;
        if (supabase) {
            const channel = supabase.channel('realtime-notifs-screen')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
                    fetchNotifs();
                })
                .subscribe();
            return () => { channel.unsubscribe(); };
        }
    }, []);

    const getTimeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    };

    const handleNotificationClick = (n: any) => {
        if (n.target_id) {
            if (n.type.startsWith('QUEST')) {
                navigate(`/app/quest/${n.target_id}`);
                onClose();
            }
        }
    };

    return (
        <div className="flex-1 h-full bg-deep-black overflow-y-auto pb-14 animate-in slide-in-from-right duration-200">
            <div className="sticky top-0 z-30 bg-deep-black/95 backdrop-blur-md px-4 pt-[15px] pb-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="p-1 -ml-1 text-gray-400 hover:text-white"><ChevronLeft /></button>
                    <h2 className="text-xl font-black text-white tracking-tight leading-none pt-1 uppercase">NOTIFICATIONS</h2>
                </div>
                <button
                    onClick={() => supabaseService.notifications.markAllAsRead().then(fetchNotifs)}
                    className="text-[10px] font-bold text-gray-500 uppercase hover:text-white"
                >Mark all read</button>
            </div>

            <div className="divide-y divide-white/[0.02]">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center opacity-20">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Scanning Frequencies...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="py-20 text-center opacity-20">
                        <Star size={48} className="mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Digital silence confirmed.</p>
                    </div>
                ) : (
                    notifications.map(n => (
                        <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-4 flex gap-4 items-start transition-colors cursor-pointer hover:bg-white/[0.03] ${n.read ? 'bg-transparent' : 'bg-primary/[0.02]'}`}
                        >
                            <div className="shrink-0 relative">
                                {n.actor ? (
                                    <img src={n.actor.avatar_url || `https://ui-avatars.com/api/?name=${n.actor.name}`} className="w-12 h-12 rounded-full border border-white/[0.05] object-cover" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                        <Star size={20} className="text-white/20" />
                                    </div>
                                )}

                                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border border-black ${n.type === 'QUEST_ACCEPTED' ? 'bg-emerald-500' :
                                        n.type === 'QUEST_DECLINED' ? 'bg-red-500' :
                                            n.type === 'QUEST_REQUEST' ? 'bg-purple-500' : 'bg-gray-700'
                                    }`}>
                                    {n.type === 'QUEST_ACCEPTED' && <Check size={12} strokeWidth={3} className="text-black" />}
                                    {n.type === 'QUEST_DECLINED' && <X size={12} strokeWidth={3} className="text-white" />}
                                    {n.type === 'QUEST_REQUEST' && <Calendar size={12} className="text-white" />}
                                    {!n.type.startsWith('QUEST') && <Star size={12} className="text-white" />}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0 pt-1">
                                <p className="text-sm text-gray-300 leading-snug">
                                    <span className="font-black text-white mr-1 uppercase">
                                        {n.actor ? n.actor.name : 'SYSTEM'}
                                    </span>
                                    {n.content}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{getTimeAgo(n.created_at)}</span>
                                    {!n.read && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                                </div>

                                {n.metadata?.reasoning && (
                                    <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                                        <p className="text-[11px] text-gray-400 italic">"{n.metadata.reasoning}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsScreen;
