import React from 'react';
import { motion } from 'framer-motion';

export const DeviceMockup: React.FC = () => {
    return (
        <div className="relative w-full h-full flex items-center justify-center pointer-events-none select-none">
            {/* Background Atmosphere */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-electric-teal/5 blur-[160px] rounded-full" />

            <div className="relative w-full max-w-5xl aspect-[16/10] flex items-center justify-center">

                {/* MacBook Simulation */}
                <motion.div
                    initial={{ opacity: 0, y: 40, rotateX: 5 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full h-full perspective-1000"
                >
                    {/* Shadow */}
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[95%] h-16 bg-black/60 blur-[60px] rounded-full" />

                    {/* Laptop Body */}
                    <div className="relative w-full h-full bg-[#1c1c1e] rounded-[2.5rem] border-[12px] border-[#2c2c2e] shadow-2xl overflow-hidden ring-1 ring-white/10">
                        {/* Screen Content */}
                        <div className="w-full h-full bg-[#050505] relative overflow-hidden group">
                            <img
                                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2000"
                                alt="Be4L Dashboard"
                                className="w-full h-full object-cover opacity-60"
                            />

                            {/* Glass Reflection */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-40" />

                            {/* Dashboard Overlay */}
                            <div className="absolute inset-0 p-10 flex flex-col gap-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-electric-teal/20 border border-electric-teal/40 backdrop-blur-md" />
                                        <div className="space-y-2">
                                            <div className="w-40 h-5 bg-white/10 rounded-full" />
                                            <div className="w-24 h-3 bg-white/5 rounded-full" />
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10" />
                                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-6">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-32 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm" />
                                    ))}
                                </div>
                                <div className="flex-1 rounded-[2rem] bg-white/[0.02] border border-white/5 p-8 flex flex-col gap-6">
                                    <div className="w-48 h-8 bg-white/10 rounded-xl" />
                                    <div className="w-full h-px bg-white/5" />
                                    <div className="space-y-3">
                                        <div className="w-full h-4 bg-white/5 rounded-full" />
                                        <div className="w-5/6 h-4 bg-white/5 rounded-full" />
                                        <div className="w-4/6 h-4 bg-white/5 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* iPhone Simulation */}
                <motion.div
                    initial={{ opacity: 0, x: 80, y: 80, rotate: 2 }}
                    animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                    transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute -bottom-16 -right-16 w-[24%] aspect-[9/19]"
                >
                    {/* Shadow */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[85%] h-10 bg-black/80 blur-[40px] rounded-full" />

                    {/* iPhone Body */}
                    <div className="relative w-full h-full bg-[#0a0a0a] rounded-[3.5rem] p-4 border-[8px] border-[#242426] shadow-2xl ring-1 ring-white/10">
                        {/* Screen */}
                        <div className="w-full h-full bg-[#050505] rounded-[2.8rem] overflow-hidden relative">
                            <img
                                src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=80&w=800"
                                alt="Be4L Mobile"
                                className="w-full h-full object-cover opacity-80"
                            />

                            {/* Dynamic Island */}
                            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-8 bg-black rounded-full shadow-inner" />

                            {/* App UI */}
                            <div className="absolute inset-0 p-8 flex flex-col justify-end gap-6 bg-gradient-to-t from-black/90 to-transparent">
                                <div className="w-16 h-16 rounded-3xl bg-electric-teal shadow-[0_0_30px_rgba(45,212,191,0.5)] flex items-center justify-center">
                                    <div className="w-8 h-8 border-[6px] border-black rounded-full" />
                                </div>
                                <div className="space-y-3">
                                    <div className="w-3/4 h-7 bg-white rounded-full" />
                                    <div className="w-full h-4 bg-white/20 rounded-full" />
                                </div>
                                <div className="w-full h-14 bg-white/10 rounded-2xl border border-white/10" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
