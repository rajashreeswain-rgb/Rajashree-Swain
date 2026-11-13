/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export type BadgeTone = 'neutral' | 'blue' | 'emerald' | 'amber' | 'rose' | 'slate';

interface StatusBadgeProps {
  label: string;
  tone?: BadgeTone;
  size?: 'sm' | 'md';
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  slate: 'bg-slate-100 text-slate-800 border-slate-300',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  tone,
  size = 'md',
}) => {
  // Determine tone from standard business status words if not explicitly passed
  let resolvedTone: BadgeTone = tone || 'neutral';
  if (!tone) {
    const l = label.toLowerCase();
    if (l.includes('active') || l.includes('confirmed') || l.includes('approved') || l.includes('completed')) {
      resolvedTone = 'emerald';
    } else if (l.includes('progress') || l.includes('submitted') || l.includes('mobilization')) {
      resolvedTone = 'blue';
    } else if (l.includes('pending') || l.includes('hold') || l.includes('draft') || l.includes('scheduled')) {
      resolvedTone = 'amber';
    } else if (l.includes('inactive') || l.includes('rejected') || l.includes('delayed')) {
      resolvedTone = 'rose';
    }
  }

  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center font-medium rounded border ${sizeClasses} ${TONE_CLASSES[resolvedTone]}`}
    >
      {label}
    </span>
  );
};
