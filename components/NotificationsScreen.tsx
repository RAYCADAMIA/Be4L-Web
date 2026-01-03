import React from 'react';
import { User, MessageCircle, Heart, Star, Calendar, ChevronLeft } from 'lucide-react';
import { MOCK_USER, MOCK_CAPTURES, MOCK_QUESTS } from '../constants';

interface Notification {
    id: string;
    type: 'LIKE' | 'COMMENT' | 'INVITE' | 'SYSTEM';
    user?: { name: string, avatar: string };
    text: string;
    time: string;
    read: boolean;
    image?: string; // For post previews
}

interface NotificationsScreenProps {
    onClose: () => void;
    onOpenPost: (id: string) => void;
    onOpenQuest: (id: string) => void;
}

const MOCK_NOTIFICATIONS: (Notification & { targetId?: string })[] = [
    { id: '1', type: 'LIKE', user: { name: 'sarah_j', avatar: 'https://picsum.photos/100/100?random=2' }, text: 'liked your memory.', time: '2m', read: false, image: MOCK_CAPTURES[0]?.back_image_url, targetId: 'c1' },
    { id: '2', type: 'COMMENT', user: { name: 'dave_climbs', avatar: 'https://picsum.photos/100/100?random=8' }, text: 'commented: "Sick moves!"', time: '15m', read: false, image: MOCK_CAPTURES[0]?.back_image_url, targetId: 'c1' },
    { id: '3', type: 'INVITE', user: { name: 'pickle_king', avatar: 'https://picsum.photos/100/100?random=9' }, text: 'invited you to "2v2 Pickleball Tournament".', time: '1h', read: true, targetId: 'q2' },
    { id: '4', type: 'SYSTEM', text: 'Welcome to Be4L! Complete your profile to start your streak.', time: '1d', read: true },
    { id: '5', type: 'LIKE', user: { name: 'art_anna', avatar: 'https://picsum.photos/100/100?random=10' }, text: 'liked your memory.', time: '2d', read: true, image: 'https://picsum.photos/200/300?random=50', targetId: 'c2' },
];

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onClose, onOpenPost, onOpenQuest }) => {

    const handleNotificationClick = (n: typeof MOCK_NOTIFICATIONS[0]) => {
        if (n.type === 'INVITE' && n.targetId) {
            // In a real app we'd fetch the quest logic here or pass object.
            // For now we assume ID corresponds to something fetchable or handle in parent.
            // But our App passes `setSelectedQuest` which expects a Quest OBJECT.
            // We need to fetch it or cheat. Let's cheat and assume MOCK_QUESTS has it.
            const quest = MOCK_QUESTS.find(q => q.id === n.targetId) || MOCK_QUESTS[0];
            onOpenQuest(quest as any);
        } else if ((n.type === 'LIKE' || n.type === 'COMMENT') && n.targetId) {
            const post = MOCK_CAPTURES.find(c => c.id === n.targetId) || MOCK_CAPTURES[0];
            onOpenPost(post as any);
        }
    };

    return (
        <div className="flex-1 h-full bg-black overflow-y-auto pb-24 animate-in slide-in-from-right duration-200">
            <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-md px-4 py-4 pt-12 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="p-1 -ml-1 text-gray-400 hover:text-white"><ChevronLeft /></button>
                    <h2 className="text-xl font-black text-white italic tracking-tight">NOTIFICATIONS</h2>
                </div>
                <button className="text-[10px] font-bold text-gray-500 uppercase hover:text-white">Mark all read</button>
            </div>

            <div className="divide-y divide-white/5">
                {MOCK_NOTIFICATIONS.map(n => (
                    <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-4 flex gap-3 items-start transition-colors cursor-pointer hover:bg-white/5 ${n.read ? 'bg-transparent' : 'bg-white/[0.02]'}`}
                    >
                        <div className="shrink-0 relative">
                            {n.user ? (
                                <img src={n.user.avatar} className="w-10 h-10 rounded-full border border-white/10 object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50">
                                    <Star size={16} className="text-primary" />
                                </div>
                            )}

                            {/* Type Icon Badge */}
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border border-black ${n.type === 'LIKE' ? 'bg-red-500' :
                                n.type === 'COMMENT' ? 'bg-blue-500' :
                                    n.type === 'INVITE' ? 'bg-purple-500' : 'bg-gray-700'
                                }`}>
                                {n.type === 'LIKE' && <Heart size={10} fill="white" className="text-white" />}
                                {n.type === 'COMMENT' && <MessageCircle size={10} className="text-white" />}
                                {n.type === 'INVITE' && <Calendar size={10} className="text-white" />}
                                {n.type === 'SYSTEM' && <Star size={10} className="text-white" />}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-300 leading-snug">
                                {n.user && <span className="font-bold text-white mr-1">{n.user.name}</span>}
                                {n.text}
                            </p>
                            <span className="text-[10px] text-gray-500 font-medium mt-1 block">{n.time}</span>

                            {n.type === 'INVITE' && (
                                <div className="mt-2 flex gap-2">
                                    <button className="text-[10px] font-bold bg-primary text-black px-3 py-1.5 rounded-full hover:bg-lime-400">Accept</button>
                                    <button className="text-[10px] font-bold bg-surface border border-white/10 text-white px-3 py-1.5 rounded-full hover:bg-white/10">Decline</button>
                                </div>
                            )}
                        </div>

                        {n.image && (
                            <div className="shrink-0 w-10 h-12 rounded bg-gray-800 overflow-hidden border border-white/10">
                                <img src={n.image} className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="p-8 text-center">
                <p className="text-xs text-gray-600 uppercase tracking-widest">End of notifications</p>
            </div>
        </div>
    );
};

export default NotificationsScreen;
