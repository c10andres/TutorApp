import React from 'react';
import { Badge as UIBadge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { reputationService } from '../services/reputation';

interface ReputationBadgeProps {
    badgeId: string;
    showLabel?: boolean;
    className?: string;
}

export function ReputationBadge({ badgeId, showLabel = true, className = '' }: ReputationBadgeProps) {
    const badgeInfo = reputationService.getBadgeInfo(badgeId);

    if (!badgeInfo) return null;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <UIBadge
                        variant="secondary"
                        className={`${badgeInfo.color} cursor-help ${className}`}
                    >
                        <span className="mr-1">{badgeInfo.icon}</span>
                        {showLabel && badgeInfo.name}
                    </UIBadge>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="font-semibold">{badgeInfo.name}</p>
                    <p className="text-xs">{badgeInfo.description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
