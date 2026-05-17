import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Sheet, SheetStepper } from '../ui/Sheet';
import { DibsItem, Operator, BookingMode, AIVerification, CustomField } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../Toast';
import { supabaseService } from '../../services/supabaseService';
import { verifyGCashProof } from '../../services/paymentVerification';
import { GradientButton } from '../ui/AestheticComponents';
import { Upload, Check, AlertCircle, Minus, Plus, Loader2, Copy, Shield, X } from 'lucide-react';

interface BookingSheetProps {
    open: boolean;
    onClose: () => void;
    item: DibsItem;
    operator: Operator;
}

type Step =
    | 'select'
    | 'quantity'
    | 'addons'
    | 'fields'
    | 'guest'
    | 'payment'
    | 'verify'
    | 'confirm';

const resolveMode = (item: DibsItem): BookingMode => {
    if (item.booking_mode) return item.booking_mode;
    if (item.type === 'EVENT') return 'TICKETED';
    if (item.type === 'SERVICE') return 'APPOINTMENT';
    return 'SLOTTED';
};

const generateSlots = (start = '08:00', end = '20:00', duration = 60) => {
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    const slots: string[] = [];
    const cur = new Date();
    cur.setHours(sH, sM, 0, 0);
    const endT = new Date(cur);
    endT.setHours(eH, eM, 0, 0);
    if (endT <= cur) endT.setDate(endT.getDate() + 1);
    while (cur < endT) {
        slots.push(cur.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }));
        cur.setMinutes(cur.getMinutes() + duration);
    }
    return slots;
};

export const BookingSheet: React.FC<BookingSheetProps> = ({ open, onClose, item, operator }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const mode = useMemo(() => resolveMode(item), [item]);

    const steps: Step[] = useMemo(() => {
        const s: Step[] = ['select'];
        if (mode !== 'APPOINTMENT') s.push('quantity');
        if (item.add_ons?.length) s.push('addons');
        if (item.custom_fields?.length) s.push('fields');
        s.push('guest', 'payment', 'verify', 'confirm');
        return s;
    }, [mode, item]);

    const [stepIdx, setStepIdx] = useState(0);
    const step = steps[stepIdx];

    // Selection state
    const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
    const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [providerId, setProviderId] = useState<string | null>(null);

    // Quantity
    const [quantity, setQuantity] = useState(1);

    // Add-ons
    const [addons, setAddons] = useState<Record<string, number>>({});

    // Custom fields
    const [responses, setResponses] = useState<Record<string, any>>({});

    // Guest info
    const [guest, setGuest] = useState({ name: '', contact: '', email: '' });

    // Payment
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [proofPreview, setProofPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Verification
    const [verifying, setVerifying] = useState(false);
    const [aiResult, setAiResult] = useState<AIVerification | null>(null);

    // Submission
    const [submitting, setSubmitting] = useState(false);
    const [bookingRef, setBookingRef] = useState<string>('');

    // Reset when reopened
    useEffect(() => {
        if (open) {
            setStepIdx(0);
            setSelectedTierId(null);
            setSelectedSlot(null);
            setProviderId(null);
            setQuantity(1);
            setAddons({});
            setResponses({});
            setProofFile(null);
            setAiResult(null);
            setBookingRef('');
        }
    }, [open, item.id]);

    useEffect(() => {
        if (user && !guest.name) {
            setGuest(g => ({ ...g, name: user.name || '', email: user.email || '' }));
        }
    }, [user]);

    useEffect(() => {
        if (!proofFile) { setProofPreview(null); return; }
        const url = URL.createObjectURL(proofFile);
        setProofPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [proofFile]);

    // Pricing
    const selectedTier = item.tiers?.find(t => t.id === selectedTierId);
    const basePrice = selectedTier ? selectedTier.price : item.price;
    const addonsTotal = Object.entries(addons).reduce((sum, [id, qty]) => {
        const ao = item.add_ons?.find(a => a.id === id);
        return sum + (ao ? ao.price * qty : 0);
    }, 0);
    const total = basePrice * quantity + addonsTotal;

    // Validation per step
    const canAdvance = useMemo(() => {
        switch (step) {
            case 'select':
                if (mode === 'TICKETED') return !!selectedTierId;
                if (mode === 'SLOTTED') return !!date && !!selectedSlot;
                if (mode === 'APPOINTMENT') return !!date && !!selectedSlot && (!item.providers?.length || !!providerId);
                return false;
            case 'quantity':
                return quantity > 0;
            case 'addons':
                return true;
            case 'fields':
                return (item.custom_fields || []).every(f => !f.required || !!responses[f.id]);
            case 'guest':
                return !!guest.name && !!guest.contact;
            case 'payment':
                return !!proofFile;
            case 'verify':
                return aiResult?.status === 'verified' || aiResult?.status === 'flagged';
            default:
                return true;
        }
    }, [step, mode, selectedTierId, date, selectedSlot, providerId, quantity, responses, guest, proofFile, aiResult, item]);

    const goNext = async () => {
        if (!canAdvance && step !== 'verify') return;
        if (step === 'payment') {
            await runVerification();
            return;
        }
        if (step === 'verify') {
            await submitBooking();
            return;
        }
        setStepIdx(i => Math.min(i + 1, steps.length - 1));
    };

    const goBack = () => setStepIdx(i => Math.max(0, i - 1));

    const runVerification = async () => {
        if (!proofFile) return;
        setVerifying(true);
        setStepIdx(steps.indexOf('verify'));
        try {
            const result = await verifyGCashProof(proofFile, {
                amount: total,
                receiver_name: operator.gcash_name,
                receiver_number: operator.gcash_number,
                booking_created_at: new Date().toISOString(),
            });
            setAiResult(result);
            if (result.status === 'rejected') {
                showToast('Payment proof could not be verified. Please re-upload.', 'error');
            }
        } catch (e) {
            showToast('Verification failed. Please try again.', 'error');
        } finally {
            setVerifying(false);
        }
    };

    const submitBooking = async () => {
        if (!aiResult || aiResult.status === 'rejected') return;
        setSubmitting(true);
        try {
            const ref = `DIB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            await (supabaseService.dibs as any).createBooking?.({
                item_id: item.id,
                operator_id: operator.user_id,
                quantity,
                booking_date: date,
                tier_id: selectedTierId,
                total_amount: total,
                payment_method: 'gcash',
                booking_ref: ref,
                slot_times: selectedSlot ? [{ date, time: selectedSlot }] : undefined,
                extracted_ref: aiResult.extracted_ref,
                metadata: {
                    guest,
                    provider_id: providerId,
                    add_ons_selected: addons,
                    custom_responses: responses,
                    ai_verification: aiResult,
                },
            });
            setBookingRef(ref);
            setStepIdx(steps.indexOf('confirm'));
        } catch (e) {
            showToast('Booking failed. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const titleForStep: Record<Step, string> = {
        select: mode === 'TICKETED' ? 'Choose Tier' : mode === 'SLOTTED' ? 'Pick Date & Time' : 'Book Appointment',
        quantity: 'How many?',
        addons: 'Add-Ons',
        fields: 'Additional Info',
        guest: 'Your Details',
        payment: 'Payment',
        verify: 'Verifying',
        confirm: 'Booked',
    };

    return (
        <Sheet
            open={open}
            onClose={onClose}
            variant="auto"
            size="lg"
            title={titleForStep[step]}
            subtitle={item.title}
            headerAccessory={
                step !== 'confirm' && (
                    <SheetStepper current={stepIdx} total={steps.length - 1} />
                )
            }
            footer={
                step !== 'confirm' ? (
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-left">
                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total</div>
                            <div className="text-white font-display font-black text-2xl">₱{total.toLocaleString()}</div>
                        </div>
                        <div className="flex gap-2">
                            {stepIdx > 0 && step !== 'verify' && (
                                <button
                                    onClick={goBack}
                                    className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold text-sm hover:bg-white/10"
                                >
                                    Back
                                </button>
                            )}
                            <GradientButton
                                onClick={goNext}
                                disabled={!canAdvance || submitting || verifying}
                                icon={submitting || verifying ? <Loader2 className="animate-spin" size={16} /> : undefined}
                            >
                                {step === 'payment' ? 'Verify Payment' :
                                 step === 'verify' ? (aiResult?.status === 'rejected' ? 'Re-upload' : 'Confirm Booking') :
                                 'Continue'}
                            </GradientButton>
                        </div>
                    </div>
                ) : (
                    <GradientButton fullWidth onClick={onClose}>Done</GradientButton>
                )
            }
        >
            <div className="p-6 space-y-5">
                {step === 'select' && (
                    <SelectStep
                        mode={mode}
                        item={item}
                        selectedTierId={selectedTierId}
                        onTier={setSelectedTierId}
                        date={date}
                        onDate={setDate}
                        slot={selectedSlot}
                        onSlot={setSelectedSlot}
                        providerId={providerId}
                        onProvider={setProviderId}
                    />
                )}
                {step === 'quantity' && (
                    <QuantityStep quantity={quantity} onChange={setQuantity} max={selectedTier?.available ?? 10} unit={item.unit_label || 'pax'} />
                )}
                {step === 'addons' && (
                    <AddonsStep addons={item.add_ons || []} selected={addons} onChange={setAddons} />
                )}
                {step === 'fields' && (
                    <FieldsStep fields={item.custom_fields || []} responses={responses} onChange={setResponses} />
                )}
                {step === 'guest' && (
                    <GuestStep value={guest} onChange={setGuest} />
                )}
                {step === 'payment' && (
                    <PaymentStep
                        operator={operator}
                        total={total}
                        file={proofFile}
                        preview={proofPreview}
                        onFile={setProofFile}
                        inputRef={fileInputRef}
                    />
                )}
                {step === 'verify' && (
                    <VerifyStep verifying={verifying} result={aiResult} onRetry={() => setStepIdx(steps.indexOf('payment'))} />
                )}
                {step === 'confirm' && (
                    <ConfirmStep bookingRef={bookingRef} item={item} aiResult={aiResult} />
                )}
            </div>
        </Sheet>
    );
};

// ---------- Sub-components ----------

const SelectStep: React.FC<any> = ({ mode, item, selectedTierId, onTier, date, onDate, slot, onSlot, providerId, onProvider }) => {
    const slots = useMemo(
        () => generateSlots(item.opening_time, item.closing_time, item.slot_duration || item.service_duration || 60),
        [item]
    );

    if (mode === 'TICKETED') {
        return (
            <div className="space-y-2">
                {(item.tiers || []).map((t: any) => (
                    <button
                        key={t.id}
                        onClick={() => onTier(t.id)}
                        disabled={t.available <= 0}
                        className={`w-full text-left p-4 rounded-2xl border transition-all ${
                            selectedTierId === t.id
                                ? 'border-electric-teal bg-electric-teal/10'
                                : 'border-white/10 bg-white/5 hover:border-white/20'
                        } ${t.available <= 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-white font-black uppercase">{t.name}</div>
                                <div className="text-gray-500 text-xs">{t.perks?.join(' · ')}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-white font-display font-black text-xl">₱{t.price.toLocaleString()}</div>
                                <div className="text-gray-500 text-[10px] uppercase">{t.available} left</div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Date</label>
                <input
                    type="date"
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => onDate(e.target.value)}
                    className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-electric-teal"
                />
            </div>
            <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Time Slot</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                    {slots.map(s => (
                        <button
                            key={s}
                            onClick={() => onSlot(s)}
                            className={`py-2 rounded-lg text-sm font-bold transition-all ${
                                slot === s ? 'bg-electric-teal text-black' : 'bg-white/5 text-gray-300 hover:bg-white/10'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>
            {mode === 'APPOINTMENT' && item.providers?.length > 0 && (
                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Provider</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {item.providers.map((p: any) => (
                            <button
                                key={p.id}
                                onClick={() => onProvider(p.id)}
                                className={`p-3 rounded-xl border text-left ${
                                    providerId === p.id ? 'border-electric-teal bg-electric-teal/10' : 'border-white/10 bg-white/5'
                                }`}
                            >
                                <div className="text-white font-bold text-sm">{p.name}</div>
                                {p.specialty && <div className="text-gray-500 text-xs">{p.specialty}</div>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const QuantityStep: React.FC<{ quantity: number; onChange: (n: number) => void; max: number; unit: string }> = ({ quantity, onChange, max, unit }) => (
    <div className="flex flex-col items-center gap-6 py-8">
        <div className="text-gray-500 text-xs font-black uppercase tracking-widest">Number of {unit}</div>
        <div className="flex items-center gap-6">
            <button
                onClick={() => onChange(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10"
            >
                <Minus size={20} />
            </button>
            <div className="text-white font-display font-black text-6xl w-24 text-center">{quantity}</div>
            <button
                onClick={() => onChange(Math.min(max, quantity + 1))}
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10"
            >
                <Plus size={20} />
            </button>
        </div>
        <div className="text-gray-600 text-xs">Max {max}</div>
    </div>
);

const AddonsStep: React.FC<{ addons: any[]; selected: Record<string, number>; onChange: (v: Record<string, number>) => void }> = ({ addons, selected, onChange }) => (
    <div className="space-y-2">
        {addons.map(a => {
            const qty = selected[a.id] || 0;
            return (
                <div key={a.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex-1">
                        <div className="text-white font-bold">{a.name}</div>
                        {a.description && <div className="text-gray-500 text-xs">{a.description}</div>}
                        <div className="text-electric-teal text-sm font-bold mt-1">+₱{a.price}</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onChange({ ...selected, [a.id]: Math.max(0, qty - 1) })}
                            className="w-8 h-8 rounded-full bg-white/5 text-white"
                        >
                            <Minus size={14} className="mx-auto" />
                        </button>
                        <span className="text-white font-black w-6 text-center">{qty}</span>
                        <button
                            onClick={() => onChange({ ...selected, [a.id]: qty + 1 })}
                            className="w-8 h-8 rounded-full bg-white/5 text-white"
                        >
                            <Plus size={14} className="mx-auto" />
                        </button>
                    </div>
                </div>
            );
        })}
    </div>
);

const FieldsStep: React.FC<{ fields: CustomField[]; responses: Record<string, any>; onChange: (v: Record<string, any>) => void }> = ({ fields, responses, onChange }) => (
    <div className="space-y-4">
        {fields.map(f => (
            <div key={f.id}>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    {f.label} {f.required && <span className="text-red-400">*</span>}
                </label>
                {f.type === 'textarea' ? (
                    <textarea
                        value={responses[f.id] || ''}
                        placeholder={f.placeholder}
                        onChange={e => onChange({ ...responses, [f.id]: e.target.value })}
                        className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl p-3 text-white min-h-[80px] outline-none focus:border-electric-teal"
                    />
                ) : f.type === 'select' ? (
                    <select
                        value={responses[f.id] || ''}
                        onChange={e => onChange({ ...responses, [f.id]: e.target.value })}
                        className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-electric-teal"
                    >
                        <option value="">Select...</option>
                        {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                ) : (
                    <input
                        type={f.type === 'phone' ? 'tel' : f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                        value={responses[f.id] || ''}
                        placeholder={f.placeholder}
                        onChange={e => onChange({ ...responses, [f.id]: e.target.value })}
                        className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-electric-teal"
                    />
                )}
                {f.help_text && <div className="text-gray-600 text-[10px] mt-1">{f.help_text}</div>}
            </div>
        ))}
    </div>
);

const GuestStep: React.FC<{ value: { name: string; contact: string; email: string }; onChange: (v: any) => void }> = ({ value, onChange }) => (
    <div className="space-y-4">
        {([
            ['name', 'Full Name', 'text'],
            ['contact', 'Mobile Number', 'tel'],
            ['email', 'Email (optional)', 'email'],
        ] as const).map(([key, label, type]) => (
            <div key={key}>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</label>
                <input
                    type={type}
                    value={(value as any)[key]}
                    onChange={e => onChange({ ...value, [key]: e.target.value })}
                    className="w-full mt-1 bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-electric-teal"
                />
            </div>
        ))}
    </div>
);

const PaymentStep: React.FC<any> = ({ operator, total, file, preview, onFile, inputRef }) => {
    const { showToast } = useToast();
    const copy = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('Copied', 'success');
    };
    return (
        <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-500/10 to-teal-500/10 border border-blue-500/20 rounded-2xl p-5">
                <div className="text-[10px] font-black uppercase tracking-widest text-blue-300">Send ₱{total.toLocaleString()} via GCash</div>
                <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
                        <div>
                            <div className="text-[10px] uppercase text-gray-500">Name</div>
                            <div className="text-white font-bold">{operator.gcash_name || operator.business_name}</div>
                        </div>
                        <button onClick={() => copy(operator.gcash_name || '')} className="p-2 text-gray-400"><Copy size={14} /></button>
                    </div>
                    <div className="flex items-center justify-between bg-black/30 rounded-lg p-3">
                        <div>
                            <div className="text-[10px] uppercase text-gray-500">Number</div>
                            <div className="text-white font-bold">{operator.gcash_number || '—'}</div>
                        </div>
                        <button onClick={() => copy(operator.gcash_number || '')} className="p-2 text-gray-400"><Copy size={14} /></button>
                    </div>
                </div>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => onFile(e.target.files?.[0] || null)}
            />
            <button
                onClick={() => inputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-2 transition-all ${
                    file ? 'border-electric-teal bg-electric-teal/5' : 'border-white/20 hover:border-white/40'
                }`}
            >
                {preview ? (
                    <img src={preview} className="max-h-48 rounded-lg" />
                ) : (
                    <>
                        <Upload className="text-gray-400" size={28} />
                        <div className="text-white font-bold text-sm">Upload GCash Screenshot</div>
                        <div className="text-gray-500 text-xs">PNG, JPG up to 10MB</div>
                    </>
                )}
            </button>
            {file && (
                <div className="text-center text-xs text-gray-500">
                    {file.name} · <button onClick={() => onFile(null)} className="text-electric-teal hover:underline">Replace</button>
                </div>
            )}
        </div>
    );
};

const VerifyStep: React.FC<{ verifying: boolean; result: AIVerification | null; onRetry: () => void }> = ({ verifying, result, onRetry }) => {
    if (verifying || !result) {
        return (
            <div className="py-12 flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-electric-teal" size={40} />
                <div className="text-white font-black uppercase tracking-widest text-sm">AI Verifying Payment</div>
                <div className="text-gray-500 text-xs text-center max-w-xs">Reading your GCash receipt and cross-checking reference, amount, and receiver.</div>
            </div>
        );
    }

    const pct = Math.round(result.confidence_score * 100);
    const palette =
        result.status === 'verified' ? { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', label: 'Verified' } :
        result.status === 'flagged' ? { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', label: 'Flagged — Pending Review' } :
        { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: 'Rejected' };

    return (
        <div className="space-y-4">
            <div className={`${palette.bg} ${palette.border} border rounded-2xl p-5 flex items-start gap-3`}>
                <Shield className={palette.text} size={20} />
                <div className="flex-1">
                    <div className={`${palette.text} text-xs font-black uppercase tracking-widest`}>{palette.label}</div>
                    <div className="text-white font-display font-black text-3xl mt-1">{pct}%</div>
                    <div className="text-gray-400 text-xs mt-1">Confidence Score</div>
                </div>
            </div>

            {result.checks && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Transparency</div>
                    {Object.entries(result.checks).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between text-sm">
                            <span className="text-gray-300 capitalize">{k.replace(/_/g, ' ')}</span>
                            {v ? <Check className="text-green-400" size={16} /> : <X className="text-red-400" size={16} />}
                        </div>
                    ))}
                </div>
            )}

            {result.status === 'rejected' && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="text-red-400 shrink-0" size={18} />
                    <div className="text-xs text-red-300">
                        Your payment proof could not be verified. Please re-upload a clearer screenshot.
                        <button onClick={onRetry} className="block mt-2 text-white font-bold underline">Re-upload →</button>
                    </div>
                </div>
            )}

            {result.status === 'flagged' && (
                <div className="text-xs text-yellow-300 bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3">
                    Your booking will be held for manual operator review. You'll be notified once approved.
                </div>
            )}
        </div>
    );
};

const ConfirmStep: React.FC<{ bookingRef: string; item: DibsItem; aiResult: AIVerification | null }> = ({ bookingRef, item, aiResult }) => (
    <div className="py-6 flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-electric-teal/20 border border-electric-teal flex items-center justify-center">
            <Check className="text-electric-teal" size={32} />
        </div>
        <div>
            <div className="text-white font-display font-black text-2xl">Booking {aiResult?.status === 'flagged' ? 'Received' : 'Confirmed'}</div>
            <div className="text-gray-500 text-sm mt-1">{item.title}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-3">
            <div className="text-[10px] uppercase tracking-widest text-gray-500">Booking Ref</div>
            <div className="text-white font-mono font-black text-xl">{bookingRef}</div>
        </div>
        {item.confirmation_message && (
            <div className="text-gray-400 text-xs max-w-xs">{item.confirmation_message}</div>
        )}
    </div>
);

export default BookingSheet;
