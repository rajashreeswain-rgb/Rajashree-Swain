/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HelpCircle, AlertCircle, Sparkles } from 'lucide-react';

interface Props {
  text?: string;
  variant?: 'confirmation' | 'proposed' | 'simulation' | 'unconfirmed' | 'required';
  detail?: string;
  className?: string;
}

export const ConfirmationRequiredBadge: React.FC<Props> = ({
  text,
  variant = 'confirmation',
  detail,
  className = '',
}) => {
  if (variant === 'unconfirmed') {
    return (
      <span
        title={detail || 'Formula or transition rule is not confirmed. Rule to be confirmed by Poratha management.'}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded transition-colors ${className}`}
      >
        <AlertCircle className="w-3 h-3 text-slate-500 shrink-0" />
        <span>{text || 'Rule to be confirmed'}</span>
      </span>
    );
  }

  if (variant === 'simulation') {
    return (
      <span
        title={detail || 'This function demonstrates simulated OCR or accounting posting behavior for prototype evaluation.'}
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded tracking-wide font-mono ${className}`}
      >
        <Sparkles className="w-3 h-3 text-purple-600 shrink-0" />
        <span>{text || 'Simulation'}</span>
      </span>
    );
  }

  if (variant === 'proposed') {
    return (
      <span
        title={detail || 'This business rule is proposed and pending client validation during stakeholder workshops.'}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-300 rounded transition-colors ${className}`}
      >
        <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
        <span>{text || 'Proposed – pending client validation'}</span>
      </span>
    );
  }

  return (
    <span
      title={detail || 'This field or requirement is subject to client confirmation.'}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded transition-colors ${className}`}
    >
      <HelpCircle className="w-3 h-3 text-amber-600 shrink-0" />
      <span>{text || 'Client confirmation required'}</span>
    </span>
  );
};
