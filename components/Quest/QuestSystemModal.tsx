import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Trash2, LogOut, UserMinus, Check, X } from 'lucide-react';

export type SystemModalType = 'ACCEPT' | 'DECLINE' | 'KICK' | 'ABANDON' | 'CANCEL' | 'FINISH' | 'DELETE' | 'INPUT';

interface QuestSystemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (value: string) => void;
    type: SystemModalType;
    userName?: string;
    questTitle?: string;
    placeholder?: string;
    defaultValue?: string;
}

const QuestSystemModal: React.FC<QuestSystemModalProps> = ({ isOpen, onClose, onConfirm, type, userName, questTitle, placeholder, defaultValue }) => {
    const [inputValue, setInputValue] = React.useState(defaultValue || '');

    React.useEffect(() => {
        if (isOpen) setInputValue(defaultValue || '');
    }, [isOpen, defaultValue]);

    if (!isOpen) return null;

    const getModalConfig = () => {
        switch (type) {
            case 'ACCEPT':
                return {
                    title: 'Confirm Acceptance',
                    subtitle: `Clear ${userName} for this mission?`,
                    buttonText: 'ACCEPT HUNTER',
                    buttonClass: 'bg-emerald-500 text-black',
                    icon: <Check size={24} className="text-emerald-500" />
                };
            case 'DECLINE':
                return {
                    title: 'Decline Request',
                    subtitle: `Reject ${userName}'s join request?`,
                    buttonText: 'DECLINE',
                    buttonClass: 'bg-red-500 text-white',
                    icon: <X size={24} className="text-red-500" />
                };
            case 'KICK':
                return {
                    title: 'Remove Hunter',
                    subtitle: `Are you sure you want to kick ${userName}?`,
                    buttonText: 'KICK FROM SQUAD',
                    buttonClass: 'bg-red-500 text-white',
                    icon: <UserMinus size={24} className="text-red-500" />
                };
            case 'ABANDON':
                return {
                    title: 'Leave Quest',
                    subtitle: `Are you sure you want to leave "${questTitle}"?`,
                    buttonText: 'YES, LEAVE QUEST',
                    buttonClass: 'bg-red-500 text-white',
                    icon: <LogOut size={24} className="text-red-500" />
                };
            case 'CANCEL':
                return {
                    title: 'CANCEL QUEST',
                    subtitle: 'Are you sure you want to cancel this quest?',
                    buttonText: 'YES, CANCEL',
                    cancelButtonText: 'NO, GO BACK',
                    buttonClass: 'bg-white text-black',
                    icon: <AlertCircle size={24} className="text-white" />
                };
            case 'FINISH':
                return {
                    title: 'QUEST FINISHED',
                    subtitle: 'Finalize and award points?',
                    buttonText: 'FINISH QUEST',
                    cancelButtonText: 'NOT YET',
                    buttonClass: 'bg-primary text-black',
                    icon: <Check size={24} className="text-primary" />
                };
            case 'DELETE':
                return {
                    title: 'Delete Listing',
                    subtitle: `Permanently remove this deployment?`,
                    buttonText: 'DELETE PERMANENTLY',
                    buttonClass: 'bg-red-600 text-white',
                    icon: <Trash2 size={24} className="text-red-600" />
                };
            case 'INPUT':
                return {
                    title: 'System Input',
                    subtitle: 'Please provide the required details below.',
                    buttonText: 'SUBMIT',
                    buttonClass: 'bg-white text-black',
                    icon: <AlertCircle size={24} className="text-white" />
                };
            default:
                return {
                    title: 'Are you sure?',
                    subtitle: 'Please confirm this action.',
                    buttonText: 'CONFIRM',
                    buttonClass: 'bg-white text-black',
                    icon: <AlertCircle size={24} />
                };
        }
    };

    const config = getModalConfig();

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="relative w-full max-w-[340px] bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
                >
                    <div className="p-10 space-y-8">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mb-2">
                                {config.icon}
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none">
                                    {config.title}
                                </h3>
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-4">
                                    {config.subtitle}
                                </p>
                            </div>

                            {type === 'INPUT' && (
                                <div className="space-y-2">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder={placeholder || "Enter details..."}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-white transition-all placeholder-white/20"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') onConfirm(inputValue);
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-3 p-10 pt-0">
                            <button
                                onClick={() => onConfirm(inputValue || 'Confirmed')}
                                className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-2xl ${config.buttonClass}`}
                            >
                                {config.buttonText}
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all bg-white/[0.02] hover:bg-white/[0.05]"
                            >
                                {config.cancelButtonText || 'ABORT ACTION'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default QuestSystemModal;
