import React from 'react'

interface ScorebadgeProps{
    score: number;
}

const ScoreBadge: React.FC<ScorebadgeProps> = ({score}) => {
    let badgeColor = '';
    let badgeText = '';

    if(score > 70){
        badgeColor = 'bg-badge-green text-green-600';
        badgeText = 'Strong';
    } else if(score > 49) {
        badgeColor = 'bg-badge-yellow text-yellow-600';
        badgeText = 'Good Work';
    } else {
        badgeColor = 'bg-badge-red text-red-600';
        badgeText = 'Needs Work';
    }
  return (
    <div className={`px-3 py-1 rounded-full ${badgeColor}`}>
        <p className='text-sm font-medium'>{badgeText}</p>
    </div>
  )
}

export default ScoreBadge