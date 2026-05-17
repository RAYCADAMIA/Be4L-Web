import React from 'react';
import { AlertCircle } from 'lucide-react';
import ConfirmSheet from '../ui/ConfirmSheet';
import PromptSheet from '../ui/PromptSheet';
import { confirmPresets, defaultConfirmPreset, SystemActionType } from './shared/confirmPresets';

export type SystemModalType = SystemActionType | 'INPUT';

interface QuestSystemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (value: string) => void;
    type: SystemModalType;
    userName?: string;
    questTitle?: string;
    placeholder?: string;
    defaultValue?: string;
    loading?: boolean;
}

const QuestSystemModal: React.FC<QuestSystemModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    type,
    userName,
    questTitle,
    placeholder,
    defaultValue,
    loading,
}) => {
    if (type === 'INPUT') {
        return (
            <PromptSheet
                open={isOpen}
                onClose={onClose}
                onSubmit={(val) => onConfirm(val)}
                title="System input"
                subtitle="Please provide the required details below."
                icon={<AlertCircle size={24} />}
                placeholder={placeholder}
                defaultValue={defaultValue}
                confirmLabel="Submit"
                loading={loading}
            />
        );
    }

    const preset = confirmPresets[type as SystemActionType] || defaultConfirmPreset;

    return (
        <ConfirmSheet
            open={isOpen}
            onClose={onClose}
            onConfirm={() => onConfirm('Confirmed')}
            tone={preset.tone}
            icon={preset.icon}
            title={preset.title}
            subtitle={preset.subtitle({ userName, questTitle })}
            confirmLabel={preset.confirmLabel}
            cancelLabel={preset.cancelLabel}
            loading={loading}
        />
    );
};

export default QuestSystemModal;
