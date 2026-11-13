/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { APP_MODULES } from '../../config/modulesConfig';
import { MainModuleId } from '../../types';
import {
  Search,
  Globe,
  Bookmark,
  Bell,
  Grid,
  User,
  Building2,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';

export const TopHeader: React.FC = () => {
  const {
    activeModule,
    activeSubModule,
    setActiveModule,
    setActiveSubModule,
    sidebarCollapsed,
    toggleSidebar,
    searchQuery,
    setSearchQuery,
    searchScope,
    setSearchScope,
    bookmarks,
    toggleBookmark,
    isBookmarked,
    pendingActivities,
    companyProfile,
    projects,
    budgets,
    customers,
    employees,
    costCodes,
    showToast,
  } = useAppStore();

  const [showBookmarksMenu, setShowBookmarksMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [showAppLauncher, setShowAppLauncher] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute Current Page Title for Bookmark Action
  const currentModuleDef = APP_MODULES.find((m) => m.id === activeModule) || APP_MODULES[0];
  let currentSubLabel = '';
  currentModuleDef.categories.forEach((cat) => {
    const sub = cat.subModules.find((s) => s.id === activeSubModule);
    if (sub) currentSubLabel = sub.label;
  });
  const currentPageTitle = currentSubLabel
    ? `${currentModuleDef.label} - ${currentSubLabel}`
    : currentModuleDef.label;

  const currentIsBookmarked = isBookmarked(activeModule, activeSubModule || '');

  // Global Search Retrieval against central store
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: { category: string; id: string; title: string; subtitle: string; moduleId: MainModuleId; subModuleId: string }[] = [];

    if (searchScope === 'all' || searchScope === 'projects') {
      projects.forEach((p) => {
        if (p.code.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)) {
          results.push({
            category: 'Project',
            id: p.id,
            title: `${p.code} - ${p.name}`,
            subtitle: `Client: ${p.customerName || '—'} | Status: ${p.status}`,
            moduleId: 'project-management',
            subModuleId: 'pm-registration',
          });
        }
      });
    }

    if (searchScope === 'all' || searchScope === 'customers') {
      customers.forEach((c) => {
        if (c.name.toLowerCase().includes(q) || (c.code && c.code.toLowerCase().includes(q))) {
          results.push({
            category: 'Customer',
            id: c.id,
            title: c.name,
            subtitle: `Code: ${c.code || '—'} | Status: ${c.status}`,
            moduleId: 'master',
            subModuleId: 'master-customer',
          });
        }
      });
    }

    if (searchScope === 'all' || searchScope === 'employees') {
      employees.forEach((e) => {
        if (e.name.toLowerCase().includes(q) || (e.designation && e.designation.toLowerCase().includes(q))) {
          results.push({
            category: 'Employee',
            id: e.id,
            title: e.name,
            subtitle: `Role: ${e.designation || 'Staff'} | Status: ${e.status}`,
            moduleId: 'master',
            subModuleId: 'master-employee',
          });
        }
      });
    }

    if (searchScope === 'all' || searchScope === 'costCodes') {
      costCodes.forEach((cc) => {
        if (cc.code.toLowerCase().includes(q) || cc.description.toLowerCase().includes(q)) {
          results.push({
            category: 'Cost Code',
            id: cc.id,
            title: `${cc.code} - ${cc.description}`,
            subtitle: `Category: ${cc.category}`,
            moduleId: 'master',
            subModuleId: 'master-cost-code',
          });
        }
      });
    }

    return results;
  }, [searchQuery, searchScope, projects, customers, employees, costCodes]);

  const handleSelectSearchResult = (moduleId: MainModuleId, subModuleId: string) => {
    setActiveModule(moduleId);
    setActiveSubModule(subModuleId);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  // Derive Dynamic Notifications directly from Projects and Budgets
  const dynamicNotifications = React.useMemo(() => {
    const list: { id: string; title: string; description: string; linkModule: MainModuleId; linkSubModule: string }[] = [];

    // Budgets awaiting submission
    budgets.filter((b) => b.status === 'Draft').forEach((b) => {
      list.push({
        id: `notif-draft-${b.id}`,
        title: `Budget Draft: [${b.projectCode}] ${b.revision || 'REV-00'}`,
        description: `Budget proposal ${b.refNo || b.id} is awaiting submission.`,
        linkModule: 'budget-cost-control',
        linkSubModule: 'bcc-project-budget',
      });
    });

    // Budgets awaiting approval
    budgets.filter((b) => b.status === 'Submitted').forEach((b) => {
      list.push({
        id: `notif-sub-${b.id}`,
        title: `Budget Approval Requested: [${b.projectCode}]`,
        description: `Budget ${b.refNo || b.id} is submitted and awaiting approval.`,
        linkModule: 'budget-cost-control',
        linkSubModule: 'bcc-budget-approval',
      });
    });

    // Projects without assigned PM
    projects.filter((p) => !p.projectManager || !p.projectManager.trim()).forEach((p) => {
      list.push({
        id: `notif-pm-${p.id}`,
        title: `Unassigned Project Manager: [${p.code}]`,
        description: `Project ${p.code} has no designated Project Manager.`,
        linkModule: 'project-management',
        linkSubModule: 'pm-registration',
      });
    });

    // Projects without approved budget
    const approvedIds = new Set(budgets.filter((b) => b.status === 'Approved').map((b) => b.projectId));
    projects.filter((p) => !approvedIds.has(p.id)).forEach((p) => {
      list.push({
        id: `notif-bdg-${p.id}`,
        title: `Unapproved Budget: [${p.code}]`,
        description: `Project ${p.code} does not have an approved budget.`,
        linkModule: 'budget-cost-control',
        linkSubModule: 'bcc-project-budget',
      });
    });

    return list;
  }, [projects, budgets]);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-14 px-3 sm:px-4 bg-slate-900 text-slate-100 border-b border-slate-800 shadow-xs select-none">
      {/* 10. Sidebar Collapse Toggle + 1. Brand + 2. Product Name */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          aria-label="Toggle sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand & Product Name */}
        <div className="flex items-center">
          <img 
            src="/public/assets/aistudio/image_c8ef854f.png" 
            alt="ROCKEYE Project Management" 
            className="h-9 w-auto object-contain"
          />
        </div>
      </div>

      {/* 3. Global Search with Scope Selector (Searchable: Projects, Customers, Employees, Cost Codes) */}
      <div ref={searchContainerRef} className="relative hidden md:flex items-center w-full max-w-xl mx-4">
        <div className="relative flex items-center w-full bg-slate-800/95 rounded border border-slate-700/80 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          <div className="flex items-center pl-2.5 text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>

          <input
            type="text"
            placeholder="Search projects, customers, employees, cost codes..."
            value={searchQuery}
            onFocus={() => setShowSearchResults(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            className="w-full px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-400 bg-transparent focus:outline-hidden"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-white"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Scope Selector */}
          <div className="border-l border-slate-700 shrink-0">
            <select
              value={searchScope}
              onChange={(e) => setSearchScope(e.target.value as any)}
              className="text-[11px] bg-slate-800 text-slate-300 font-medium py-1.5 px-2.5 rounded-r focus:outline-hidden cursor-pointer hover:text-white"
            >
              <option value="all">All In-Scope</option>
              <option value="projects">Projects</option>
              <option value="customers">Customers</option>
              <option value="employees">Employees</option>
              <option value="costCodes">Cost Codes</option>
            </select>
          </div>
        </div>

        {/* Global Search Results Dropdown */}
        {showSearchResults && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white text-slate-900 border border-slate-200 rounded-lg shadow-xl py-2 z-50 text-xs max-h-80 overflow-y-auto">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              Matching Records ({searchResults.length})
            </div>
            {searchResults.length === 0 ? (
              <div className="px-3 py-4 text-center text-slate-500">
                No matching records found in central store.
              </div>
            ) : (
              searchResults.map((item) => (
                <div
                  key={`${item.category}-${item.id}`}
                  onClick={() => handleSelectSearchResult(item.moduleId, item.subModuleId)}
                  className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between border-b border-slate-50 last:border-b-0"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-700 font-semibold rounded">
                        {item.category}
                      </span>
                      <span className="font-medium text-slate-800">{item.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.subtitle}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right Controls: 4. Language, 5. Bookmark, 6. Notifications, 7. Launcher, 8. Profile, 9. Company */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* 4. Language Selector — English only */}
        <div
          title="Language: English only"
          className="flex items-center gap-1 px-2 py-1 text-xs text-slate-300 bg-slate-800/60 rounded border border-slate-800 select-none cursor-default"
        >
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono text-[11px] font-semibold text-slate-200">English</span>
        </div>

        {/* 5. Bookmark Interaction & Saved Pages List */}
        <div className="relative">
          <div className="flex items-center bg-slate-800/80 rounded border border-slate-700/60 overflow-hidden">
            <button
              onClick={() =>
                toggleBookmark({
                  title: currentPageTitle,
                  moduleId: activeModule,
                  subModuleId: activeSubModule || '',
                })
              }
              title={currentIsBookmarked ? 'Remove bookmark' : 'Bookmark this page'}
              className={`p-1.5 transition-colors ${
                currentIsBookmarked ? 'text-amber-400 bg-slate-800' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${currentIsBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => {
                setShowBookmarksMenu(!showBookmarksMenu);
                setShowNotificationsMenu(false);
                setShowAppLauncher(false);
                setShowProfileMenu(false);
                setShowCompanyMenu(false);
              }}
              title="View saved bookmarks"
              className="px-1.5 py-1 text-[11px] font-mono text-slate-400 hover:text-white border-l border-slate-700"
            >
              {bookmarks.length}
            </button>
          </div>

          {/* Bookmarks Dropdown */}
          {showBookmarksMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white text-slate-900 border border-slate-200 rounded-lg shadow-xl py-2 z-50 text-xs">
              <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between font-semibold text-slate-800">
                <span>Quick Bookmarks</span>
                <span className="text-[10px] text-slate-400 font-mono">{bookmarks.length} Saved</span>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {bookmarks.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">
                    No bookmarked pages yet. Click the bookmark icon on any page to save it.
                  </div>
                ) : (
                  bookmarks.map((bm) => (
                    <div
                      key={bm.id}
                      onClick={() => {
                        setActiveModule(bm.moduleId);
                        setActiveSubModule(bm.subModuleId || null);
                        setShowBookmarksMenu(false);
                      }}
                      className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between border-b border-slate-50 last:border-b-0"
                    >
                      <div>
                        <p className="font-medium text-slate-800">{bm.title}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-mono">{bm.moduleId}</p>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 6. Notifications (Derived from actual Pending Activities) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotificationsMenu(!showNotificationsMenu);
              setShowBookmarksMenu(false);
              setShowAppLauncher(false);
              setShowProfileMenu(false);
              setShowCompanyMenu(false);
            }}
            title="Notifications & Pending Activities"
            className="relative p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <Bell className="w-4 h-4" />
            {dynamicNotifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </button>

          {showNotificationsMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white text-slate-900 border border-slate-200 rounded-lg shadow-xl py-2 z-50 text-xs">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 font-semibold text-slate-800">
                <span>Pending Notifications</span>
                <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono">
                  {dynamicNotifications.length} Active
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {dynamicNotifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    <Info className="w-5 h-5 mx-auto mb-1.5 text-slate-300" />
                    <p className="font-medium text-slate-700 text-xs">No pending notifications</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Notifications update automatically as projects and budgets require attention.
                    </p>
                  </div>
                ) : (
                  dynamicNotifications.map((act) => (
                    <div
                      key={act.id}
                      onClick={() => {
                        setActiveModule(act.linkModule);
                        setActiveSubModule(act.linkSubModule);
                        setShowNotificationsMenu(false);
                      }}
                      className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                    >
                      <p className="font-medium text-slate-800">{act.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{act.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 7. Application Launcher (6 in-scope modules only) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowAppLauncher(!showAppLauncher);
              setShowBookmarksMenu(false);
              setShowNotificationsMenu(false);
              setShowProfileMenu(false);
              setShowCompanyMenu(false);
            }}
            title="ROCKEYE Application Suite (In-Scope Modules)"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <Grid className="w-4 h-4" />
          </button>

          {showAppLauncher && (
            <div className="absolute right-0 mt-2 w-72 bg-white text-slate-900 border border-slate-200 rounded-lg shadow-xl p-3 z-50">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                In-Scope Modules (6)
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {APP_MODULES.map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => {
                      setActiveModule(mod.id);
                      setActiveSubModule(null);
                      setShowAppLauncher(false);
                    }}
                    className={`p-2 rounded transition-colors flex flex-col items-center ${
                      activeModule === mod.id
                        ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-bold text-xs mb-1 text-slate-700">
                      {mod.label.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[10px] truncate max-w-[70px]">{mod.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 9. Company Information */}
        <div className="relative">
          <button
            onClick={() => {
              setShowCompanyMenu(!showCompanyMenu);
              setShowBookmarksMenu(false);
              setShowNotificationsMenu(false);
              setShowAppLauncher(false);
              setShowProfileMenu(false);
            }}
            title="Company Information"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <Building2 className="w-4 h-4" />
          </button>

          {showCompanyMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white text-slate-900 border border-slate-200 rounded-lg shadow-xl p-4 z-50 text-xs">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
                <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold font-mono">
                  PG
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{companyProfile.name}</h4>
                  <p className="text-[11px] text-slate-400">Enterprise Entity Setup</p>
                </div>
              </div>
              <div className="py-2.5 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Default Currency:</span>
                  <span className="font-semibold text-slate-800 font-mono">{companyProfile.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location Code:</span>
                  <span className="font-semibold text-slate-800 font-mono">{companyProfile.locationCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Registration:</span>
                  <span className="text-slate-700 font-mono">{companyProfile.registrationNumber}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 text-right">
                <button
                  onClick={() => {
                    setActiveModule('company');
                    setActiveSubModule('co-settings');
                    setShowCompanyMenu(false);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium text-[11px]"
                >
                  Company Settings &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 8. User Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowBookmarksMenu(false);
              setShowNotificationsMenu(false);
              setShowAppLauncher(false);
              setShowCompanyMenu(false);
            }}
            title="User Profile"
            className="flex items-center gap-1.5 p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-semibold text-xs border border-slate-600">
              <User className="w-3.5 h-3.5" />
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white text-slate-900 border border-slate-200 rounded-lg shadow-xl p-3 z-50 text-xs">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                  SA
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Solution Administrator</h4>
                  <p className="text-[11px] text-slate-400">Client Demonstration Session</p>
                </div>
              </div>
              <div className="py-2 text-[11px] text-slate-500 space-y-1">
                <p>Role: ERP Solution Demonstrator</p>
                <p>Environment: Client Prototype</p>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    showToast('Demonstration session active', 'info');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded"
                >
                  Session Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
