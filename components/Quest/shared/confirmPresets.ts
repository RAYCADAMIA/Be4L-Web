import React from 'react';
import { AlertCircle, Trash2, LogOut, UserMinus, Check, X, Flag } from 'lucide-react';
import type { ConfirmTone } from '../../ui/ConfirmSheet';

export type SystemActionType =
    | 'ACCEPT'
    | 'DECLINE'
    | 'KICK'
    | 'ABANDON'
    | 'CANCEL'
    | 'FINISH'
    | 'DELETE';

export interface ConfirmPreset {
    tone: ConfirmTone;
    icon: React.ReactNode;
    title: string;
    subtitle: (ctx: { userName?: string; questTitle?: string }) => string;
    confirmLabel: string;
    cancelLabel?: string;
}

export const confirmPresets: Record<SystemActionType, ConfirmPreset> = {
    ACCEPT: {
        tone: 'success',
        icon: React.createElement(Check, { size: 24 }),
        title: 'Confirm acceptance',
        subtitle: ({ userName }) => `Clear ${userName ?? 'this hunter'} for the mission?`,
        confirmLabel: 'Accept hunter',
        cancelLabel: 'Not now',
    },
    DECLINE: {
        tone: 'danger',
        icon: React.createElement(X, { size: 24 }),
        title: 'Decline request',
        subtitle: ({ userName }) => `Reject ${userName ?? 'this hunter'}’s join request?`,
        confirmLabel: 'Decline',
    },
    KICK: {
        tone: 'danger',
        icon: React.createElement(UserMinus, { size: 24 }),
        title: 'Remove hunter',
        subtitle: ({ userName }) => `Kick ${userName ?? 'this hunter'} from the squad?`,
        confirmLabel: 'Kick from squad',
    },
    ABANDON: {
        tone: 'danger',
        icon: React.createElement(LogOut, { size: 24 }),
        title: 'Leave quest',
        subtitle: ({ questTitle }) =>
            questTitle ? `Are you sure you want to leave “${questTitle}”?` : 'Are you sure you want to leave this quest?',
        confirmLabel: 'Yes, leave quest',
    },
    CANCEL: {
        tone: 'warning',
        icon: React.createElement(Flag, { size: 24 }),
        title: 'Cancel quest',
        subtitle: () => 'This will notify every hunter in the squad.',
        confirmLabel: 'Yes, cancel',
        cancelLabel: 'No, go back',
    },
    FINISH: {
        tone: 'success',
        icon: React.createElement(Check, { size: 24 }),
        title: 'Quest finished',
        subtitle: () => 'Finalize and award points?',
        confirmLabel: 'Finish quest',
        cancelLabel: 'Not yet',
    },
    DELETE: {
        tone: 'danger',
        icon: React.createElement(Trash2, { size: 24 }),
        title: 'Delete listing',
        subtitle: () => 'Permanently remove this deployment?',
        confirmLabel: 'Delete permanently',
    },
};

// Fallback for unknown action types
export const defaultConfirmPreset: ConfirmPreset = {
    tone: 'neutral',
    icon: React.createElement(AlertCircle, { size: 24 }),
    title: 'Are you sure?',
    subtitle: () => 'Please confirm this action.',
    confirmLabel: 'Confirm',
};
