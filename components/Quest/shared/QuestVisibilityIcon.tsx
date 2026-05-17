import React from 'react';
import { Globe, Lock, Signal } from 'lucide-react';
import { QuestVisibilityScope } from '../../../types';

interface QuestVisibilityIconProps {
    scope?: QuestVisibilityScope | string;
    size?: number;
    className?: string;
}

export const QuestVisibilityIcon: React.FC<QuestVisibilityIconProps> = ({
    scope,
    size = 14,
    className = '',
}) => {
    switch (scope) {
        case QuestVisibilityScope.PUBLIC:
        case 'public':
            return <Globe size={size} className={className} aria-label="Public" />;
        case QuestVisibilityScope.FRIENDS:
        case 'friends':
            return <Lock size={size} className={className} aria-label="Friends only" />;
        case QuestVisibilityScope.FOLLOWERS:
        case 'followers':
        case 'squad':
        case 'private':
            return <Signal size={size} className={className} aria-label="Squad / private" />;
        default:
            return <Globe size={size} className={className} aria-label="Public" />;
    }
};

export default QuestVisibilityIcon;
