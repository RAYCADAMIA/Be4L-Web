import React, { useState, useEffect } from 'react';
import { X, Plus, Check, Trash2, CheckSquare } from 'lucide-react';
import { GlassCard, GlowText, GradientButton } from './ui/AestheticComponents';
import { dailyService } from '../services/dailyService';
import { DailyTask } from '../types';

interface DailyQuestListModalProps {
    onClose: () => void;
}

const DailyQuestListModal: React.FC<DailyQuestListModalProps> = ({ onClose }) => {
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

    // Calculate progress
    const completedCount = tasks.filter(t => t.completed).length;
    const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

    return (
        <div className="fixed inset-0 z-[80] bg-deep-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200" onClick={onClose}>
            <div className="w-full max-w-sm bg-deep-black border border-primary-text/[0.04] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="p-6 pb-2 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                                <CheckSquare size={20} className="text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-primary-text uppercase tracking-wider">Side Quest To Do</h2>
                                <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Personal Objectives</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-1.5 bg-gray-800 rounded-full overflow-hidden mb-2">
                        <div
                            className="absolute top-0 left-0 h-full bg-primary transition-all duration-500 ease-out box-content border-r-2 border-black"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                        <span>Progress</span>
                        <span className={progress === 100 ? "text-primary" : ""}>{Math.round(progress)}%</span>
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">

                    {/* Add New Input */}
                    <div className="flex gap-2 mb-6">
                        <input
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addTask()}
                            placeholder="Add new objective..."
                            className="flex-1 bg-white/5 border border-primary-text/[0.05] rounded-xl px-4 py-3 text-sm text-primary-text focus:border-primary/50 outline-none transition-all placeholder-gray-600 font-medium"
                        />
                        <button
                            onClick={addTask}
                            disabled={!newItem.trim()}
                            className="w-12 bg-primary text-black rounded-xl flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={20} strokeWidth={3} />
                        </button>
                    </div>

                    {tasks.length === 0 && (
                        <div className="text-center py-8 text-gray-600">
                            <p className="text-xs">No active side quests.</p>
                        </div>
                    )}

                    {tasks.map(task => (
                        <div
                            key={task.id}
                            onClick={() => toggleTask(task.id)}
                            className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${task.completed ? 'bg-black/40 border-primary/20' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                        >
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${task.completed ? 'bg-primary border-primary' : 'border-gray-600 group-hover:border-primary/50'}`}>
                                <Check size={14} className={`text-black transition-transform duration-300 ${task.completed ? 'scale-100' : 'scale-0'}`} strokeWidth={4} />
                            </div>

                            <span className={`flex-1 text-sm font-bold transition-all duration-300 ${task.completed ? 'text-gray-500 line-through' : 'text-primary-text'}`}>
                                {task.text}
                            </span>

                            <button
                                onClick={(e) => { e.stopPropagation(); deleteTask(task.id); refreshTasks(); }}
                                className="p-2 text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DailyQuestListModal;
