/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Check } from 'lucide-react';

export interface WorkflowStep {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
  subtext?: string;
}

interface WorkflowStepperProps {
  steps: WorkflowStep[];
  className?: string;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ steps, className = '' }) => {
  return (
    <div className={`w-full py-3 ${className}`}>
      <ol className="flex items-center w-full">
        {steps.map((step, idx) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isLast = idx === steps.length - 1;

          return (
            <li
              key={step.id}
              className={`flex items-center ${
                isLast ? 'w-auto' : 'w-full'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                    isCompleted
                      ? 'bg-blue-600 text-white'
                      : isCurrent
                      ? 'border-2 border-blue-600 bg-white text-blue-600'
                      : 'border border-slate-300 bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                </span>

                <div className="flex flex-col text-left">
                  <span
                    className={`text-xs font-medium ${
                      isCurrent
                        ? 'text-blue-900 font-semibold'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.subtext && (
                    <span className="text-[10px] text-slate-400">{step.subtext}</span>
                  )}
                </div>
              </div>

              {!isLast && (
                <div
                  className={`flex-1 h-0.5 mx-3 transition-colors ${
                    isCompleted ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};
