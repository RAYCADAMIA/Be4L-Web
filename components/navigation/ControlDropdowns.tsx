import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Plus, Trash2, Bell, Star, Heart, MessageCircle, Calendar, CheckSquare } from 'lucide-react';
import { dailyService } from '../../services/dailyService';
import { DailyTask } from '../../types';

// --- TASK WINDOW ---
export const TaskWindow: React.FC = () => {
    const [tasks, setTasks] = useState<DailyTask[]>(() => dailyService.getTasks());
    const [newItem, setNewItem] = useState('');

    const refreshTasks = () => {
        setTasks(dailyService.getTasks());
    };

    const addTask = () => {
        if (!newItem.trim()) return;
        dailyService.addTask(newItem);
        setNewItem('');
        refreshTasks();
    };

    const toggleTask = (id: string) => {
        dailyService.toggleTask(id);
        refreshTasks();
    };

    const deleteTask = (id: string) => {
        dailyService.deleteTask(id);
        refreshTasks();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 p-1.5 w-[240px] bg-white/[0.05] backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[200] overflow-hidden flex flex-col max-h-[480px]"
        >
            <div className="px-2 py-2 mb-1 border-b border-white/5 flex items-center justify-between">
                <span className="text-[9px] font-black text-white/50 uppercase tracking-widest px-1">Side Quests</span>
            </div>

            <div className="flex-1 overflow-y-auto p-1.5 no-scrollbar space-y-1">
                {/* Simplified Input */}
                <div className="flex gap-1.5 mb-2 px-1">
                    <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTask()}
                        placeholder="Add objective..."
                        className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-[10px] text-white focus:border-white/20 outline-none transition-all placeholder-white/20 font-black uppercase tracking-wider"
                    />
                    <button
                        onClick={addTask}
                        disabled={!newItem.trim()}
                        className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-20 shrink-0"
                    >
                        <Plus size={14} strokeWidth={3} />
                    </button>
                </div>

                {tasks.length === 0 ? (
                    <div className="py-6 text-center">
                        <p className="text-[9px] font-black text-white/10 uppercase tracking-widest">No active quests</p>
                    </div>
                ) : (
                    tasks.map(task => (
                        <div
                            key={task.id}
                            className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-300 ${task.completed ? 'opacity-40' : 'hover:bg-white/5'}`}
                        >
                            <button
                                onClick={() => toggleTask(task.id)}
                                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 ${task.completed ? 'bg-white border-white' : 'border-white/20 hover:border-white/40'}`}
                            >
                                {task.completed && <Check size={10} className="text-black" strokeWidth={4} />}
                            </button>
                            <span
                                onClick={() => toggleTask(task.id)}
                                className={`flex-1 text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${task.completed ? 'line-through' : 'text-white'}`}
                            >
                                {task.text}
                            </span>
                            <button
                                onClick={() => deleteTask(task.id)}
                                className="p-1 opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    );
};

// --- NOTIFICATION WINDOW ---
const MOCK_NOTIFICATIONS = [
    { id: '1', type: 'LIKE', user: { name: 'sarah_j', avatar: 'https://picsum.photos/100/100?random=2' }, text: 'liked your memory.', time: '2m', read: false },
    { id: '2', type: 'COMMENT', user: { name: 'dave_climbs', avatar: 'https://picsum.photos/100/100?random=8' }, text: 'commented on your post.', time: '15m', read: false },
    { id: '3', type: 'INVITE', user: { name: 'pickle_king', avatar: 'https://picsum.photos/100/100?random=9' }, text: 'invited you to a quest.', time: '1h', read: true },
    { id: '4', type: 'SYSTEM', text: 'Welcome to Be4L! Your streak has started.', time: '1d', read: true },
];

export const NotificationWindow: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 p-1.5 w-[240px] bg-white/[0.05] backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[200] overflow-hidden flex flex-col max-h-[480px]"
        >
            <div className="px-3 py-2 mb-1 border-b border-white/5 flex items-center justify-between">
                <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Notifs</span>
                <button className="text-[8px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors">Clear</button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar p-1.5 space-y-1">
                {MOCK_NOTIFICATIONS.map(n => (
                    <div
                        key={n.id}
                        className={`p-3 flex gap-3 items-start transition-all rounded-xl cursor-pointer hover:bg-white/5 ${n.read ? 'opacity-40' : ''}`}
                    >
                        <div className="shrink-0 relative">
                            {n.user ? (
                                <img src={n.user.avatar} className="w-7 h-7 rounded-full border border-white/10 object-cover" />
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                                    <Star size={10} className="text-white" />
                                </div>
                            )}
                            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center border border-black text-[7px] ${n.type === 'LIKE' ? 'bg-red-500' :
                                n.type === 'COMMENT' ? 'bg-blue-500' :
                                    n.type === 'INVITE' ? 'bg-purple-500' : 'bg-white/20'
                                }`}>
                                {n.type === 'LIKE' && <Heart size={6} fill="white" />}
                                {n.type === 'COMMENT' && <MessageCircle size={6} />}
                                {n.type === 'INVITE' && <Calendar size={6} />}
                                {n.type === 'SYSTEM' && <Star size={6} />}
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-bold text-white leading-tight">
                                {n.user && <span className="text-[10px] font-black text-white mr-1 uppercase">{n.user.name}</span>}
                                {n.text}
                            </p>
                            <span className="text-[7px] text-white/30 font-black uppercase tracking-widest mt-1 block">{n.time}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-2 border-t border-white/5">
                <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] transition-all text-white/30 hover:text-white">
                    View All Activity
                </button>
            </div>
        </motion.div>
    );
};
