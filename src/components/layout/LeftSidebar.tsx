/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { APP_MODULES } from '../../config/modulesConfig';
import { MainModuleId } from '../../types';
import {
  LayoutDashboard,
  Briefcase,
  Calculator,
  Database,
  Building2,
  BarChart3,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Briefcase,
  Calculator,
  Database,
  Building2,
  BarChart3,
};

export const LeftSidebar: React.FC = () => {
  const { activeModule, activeSubModule, setActiveModule, setActiveSubModule, sidebarCollapsed } = useAppStore();
  const [masterExpanded, setMasterExpanded] = useState(true);
  const [companyExpanded, setCompanyExpanded] = useState(true);

  const handleSelectModule = (moduleId: MainModuleId) => {
    setActiveModule(moduleId);
    if (moduleId === 'master') {
      setMasterExpanded(true);
      setActiveSubModule('master-customer'); // default master sub-module
    } else if (moduleId === 'company') {
      setCompanyExpanded(true);
      setActiveSubModule('co-profile'); // default company sub-module
    } else {
      setActiveSubModule(null); // Displays module landing page in central workspace
    }
  };

  const handleSelectSubModule = (moduleId: MainModuleId, subId: string) => {
    setActiveModule(moduleId);
    setActiveSubModule(subId);
  };

  return (
    <aside
      className={`shrink-0 bg-slate-900 border-r border-slate-800 transition-all duration-200 select-none flex flex-col justify-between h-full overflow-hidden ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="py-2.5 flex-1 flex flex-col min-h-0 overflow-hidden">
        {!sidebarCollapsed && (
          <div className="px-4 py-1.5 mb-2 shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Main Modules
            </span>
          </div>
        )}

        <nav className="space-y-1 px-2 flex-1 overflow-y-auto min-h-0">
          {APP_MODULES.map((module, idx) => {
            const Icon = ICON_MAP[module.iconName] || LayoutDashboard;
            const isActive = activeModule === module.id;
            const isMaster = module.id === 'master';
            const isCompany = module.id === 'company';

            return (
              <React.Fragment key={module.id}>
                <button
                  onClick={() => handleSelectModule(module.id)}
                  title={sidebarCollapsed ? `${idx + 1}. ${module.label}` : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-medium transition-colors text-left relative ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-white rounded-r" />
                  )}

                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400'
                      }`}
                    />

                    {!sidebarCollapsed && (
                      <span className="truncate">{module.label}</span>
                    )}
                  </div>

                  {!sidebarCollapsed && (
                    <div className="flex items-center gap-1.5">
                      {(isMaster || isCompany) && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isMaster) setMasterExpanded(!masterExpanded);
                            if (isCompany) setCompanyExpanded(!companyExpanded);
                          }}
                          className="p-0.5 hover:bg-slate-700/50 rounded"
                        >
                          {(isMaster && masterExpanded) || (isCompany && companyExpanded) ? (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                          )}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400/80 font-mono">
                        0{idx + 1}
                      </span>
                    </div>
                  )}
                </button>

                {/* Expanded Master Sub-modules in Left Sidebar */}
                {isMaster && masterExpanded && !sidebarCollapsed && (
                  <div className="ml-4 pl-3 border-l border-slate-700/60 space-y-1 my-1">
                    {[
                      { id: 'master-customer', label: 'Customer' },
                      { id: 'master-project', label: 'Project' },
                      { id: 'master-cost-code', label: 'Cost Code' },
                      { id: 'master-employee', label: 'Employee / Manpower' },
                      { id: 'master-manpower-cost', label: 'Manpower Cost' },
                      { id: 'master-equipment-cost', label: 'Equipment Cost' },
                      { id: 'master-machineries-cost', label: 'Machineries Cost' },
                    ].map((sub) => {
                      const isSubActive = activeModule === 'master' && activeSubModule === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleSelectSubModule('master', sub.id)}
                          className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors truncate ${
                            isSubActive
                              ? 'bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                          }`}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Expanded Company Sub-modules in Left Sidebar */}
                {isCompany && companyExpanded && !sidebarCollapsed && (
                  <div className="ml-4 pl-3 border-l border-slate-700/60 space-y-1 my-1">
                    {[
                      { id: 'co-profile', label: 'Company Profile' },
                      { id: 'co-business-units', label: 'Business Units' },
                      { id: 'co-locations', label: 'Organizational Locations' },
                      { id: 'co-settings', label: 'Company Settings' },
                    ].map((sub) => {
                      const isSubActive = activeModule === 'company' && activeSubModule === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => handleSelectSubModule('company', sub.id)}
                          className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-medium transition-colors truncate ${
                            isSubActive
                              ? 'bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                          }`}
                        >
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding & Environment */}
      {!sidebarCollapsed && (
        <div className="p-3 m-2 bg-slate-800/60 rounded border border-slate-700/50 text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center justify-between text-slate-300 font-medium">
            <span>ROCKEYE Core</span>
            <span className="text-emerald-400 font-mono text-[10px]">Active</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
            Poratha Group of Companies • MYR (RM)
          </p>
        </div>
      )}
    </aside>
  );
};
