/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAppStore } from './store/useAppStore';
import { TopHeader } from './components/layout/TopHeader';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { ModuleLandingPage } from './components/layout/ModuleLandingPage';

// The 6 In-Scope Module Components per Section 1
import { DashboardModule } from './modules/dashboard/DashboardModule';
import { ProjectModule } from './modules/project/ProjectModule';
import { BudgetModule } from './modules/budget/BudgetModule';
import { MasterModule } from './modules/master/MasterModule';
import { CompanyModule } from './modules/company/CompanyModule';
import { ReportsModule } from './modules/reports/ReportsModule';

import { APP_MODULES } from './config/modulesConfig';
import { ChevronRight, CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react';

export default function App() {
  const {
    activeModule,
    activeSubModule,
    setActiveSubModule,
    toast,
  } = useAppStore();

  const currentModuleDef = APP_MODULES.find((m) => m.id === activeModule) || APP_MODULES[0];

  // Find active sub-module label
  let subModuleLabel = '';
  if (activeSubModule) {
    currentModuleDef.categories.forEach((cat) => {
      const found = cat.subModules.find((sm) => sm.id === activeSubModule);
      if (found) subModuleLabel = found.label;
    });
  }

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardModule />;
      case 'project-management':
        return <ProjectModule />;
      case 'budget-cost-control':
        return <BudgetModule />;
      case 'master':
        return <MasterModule />;
      case 'company':
        return <CompanyModule />;
      case 'reports':
        return <ReportsModule />;
      default:
        return <ModuleLandingPage moduleDef={currentModuleDef} />;
    }
  };

  return (
    <div className="h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans overflow-hidden">
      {/* Fixed Top Header per Section 4 */}
      <TopHeader />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Persistent Vertical Left Navigation per Section 5 */}
        <LeftSidebar />

        {/* Central Workspace Canvas per Section 6 & 7 */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-4 max-w-[1720px] mx-auto w-full">
          {/* Breadcrumb Navigation Trail */}
          <nav className="flex items-center text-xs text-slate-500 font-medium" aria-label="Breadcrumb">
            <span className="text-slate-400 font-mono">ROCKEYE</span>
            <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-300" />
            <button
              onClick={() => setActiveSubModule(null)}
              className="hover:text-blue-600 transition-colors text-slate-600 hover:underline"
            >
              {currentModuleDef.label}
            </button>
            {subModuleLabel && (
              <>
                <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-300" />
                <span className="font-semibold text-slate-900">{subModuleLabel}</span>
              </>
            )}
          </nav>

          {/* Render Active View: Module Landing Page or Sub-Module Workspace */}
          {renderModuleContent()}
        </main>
      </div>

      {/* Global Toast Alert Notification */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl text-xs font-medium border animate-in slide-in-from-bottom duration-200 ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-slate-700'
              : toast.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border-amber-300'
              : toast.type === 'error'
              ? 'bg-rose-50 text-rose-900 border-rose-300'
              : 'bg-blue-50 text-blue-900 border-blue-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : toast.type === 'warning' ? (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          ) : toast.type === 'error' ? (
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
