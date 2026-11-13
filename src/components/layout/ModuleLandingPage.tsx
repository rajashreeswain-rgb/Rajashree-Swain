/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { MainModuleDef, SubModuleDef } from '../../types';
import { ChevronRight, ArrowRight } from 'lucide-react';

interface ModuleLandingPageProps {
  moduleDef: MainModuleDef;
}

export const ModuleLandingPage: React.FC<ModuleLandingPageProps> = ({ moduleDef }) => {
  const { setActiveSubModule } = useAppStore();

  return (
    <div className="space-y-6">
      {/* Module Header Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold uppercase tracking-wider font-mono">
          <span>Main Module</span>
          <span>•</span>
          <span>ROCKEYE Shell</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mt-1 tracking-tight">
          {moduleDef.label}
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          {moduleDef.description}
        </p>
      </div>

      {/* Categories & Sub-Modules Section (Clean column-based layout with subtle dividers) */}
      <div className="space-y-6">
        {moduleDef.categories.map((category, catIdx) => (
          <div
            key={category.title}
            className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs"
          >
            {/* Category Section Header */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {category.title}
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">
                {category.subModules.length} Sub-Module{category.subModules.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* Sub-modules Grid with subtle borders */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-slate-100">
              {category.subModules.map((subModule: SubModuleDef) => (
                <div
                  key={subModule.id}
                  onClick={() => setActiveSubModule(subModule.id)}
                  className="p-5 hover:bg-blue-50/40 cursor-pointer transition-colors group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                        {subModule.label}
                      </h3>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      {subModule.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono">ROCKEYE Workspace</span>
                    <span className="font-medium text-blue-600 group-hover:underline flex items-center gap-0.5">
                      Open <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
