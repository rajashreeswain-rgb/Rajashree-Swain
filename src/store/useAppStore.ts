/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  MainModuleId,
  Customer,
  ProjectRecord,
  EmployeeManpower,
  CostCode,
  ProjectBudget,
  ProjectMilestone,
  ProjectScheduleItem,
  CompanyProfile,
  TerminologyNote,
  BookmarkItem,
  PendingActivity,
  SlideOverState,
  ToastMessage,
  ManpowerCostResource,
  EquipmentCostResource,
  MachineriesCostResource,
  ActualCostEntry,
  PlannedManhourEntry,
  ActualManhourEntry,
  DailySiteHeadcount,
} from '../types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_PROJECTS,
  INITIAL_EMPLOYEES,
  PARENT_C_CODES,
  generateAuthoritativeSCodes,
  INITIAL_MILESTONES,
  INITIAL_SCHEDULE_ITEMS,
  INITIAL_BUDGETS,
  INITIAL_MANPOWER_COST_RESOURCES,
  INITIAL_EQUIPMENT_COST_RESOURCES,
  INITIAL_MACHINERIES_COST_RESOURCES,
} from '../utils/seedData';

interface AppState {
  // Navigation State
  activeModule: MainModuleId;
  activeSubModule: string | null;
  sidebarCollapsed: boolean;
  searchQuery: string;
  searchScope: 'all' | 'projects' | 'customers' | 'employees' | 'costCodes';
  bookmarks: BookmarkItem[];

  // Slide-over Form State
  slideOver: SlideOverState;

  // Toast Notification
  toast: ToastMessage | null;

  // Store Collections
  projects: ProjectRecord[];
  customers: Customer[];
  employees: EmployeeManpower[];
  costCodes: CostCode[];
  budgets: ProjectBudget[];
  actualCosts: ActualCostEntry[];
  plannedManhours: PlannedManhourEntry[];
  actualManhours: ActualManhourEntry[];
  dailyHeadcounts: DailySiteHeadcount[];
  milestones: ProjectMilestone[];
  scheduleItems: ProjectScheduleItem[];
  manpowerCostResources: ManpowerCostResource[];
  equipmentCostResources: EquipmentCostResource[];
  machineriesCostResources: MachineriesCostResource[];

  // Pending Activities
  pendingActivities: PendingActivity[];

  // Company Information & Settings
  companyProfile: CompanyProfile;
  terminologyNotes: TerminologyNote[];

  // Navigation Actions
  setActiveModule: (module: MainModuleId) => void;
  setActiveSubModule: (subModuleId: string | null) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSearchScope: (scope: 'all' | 'projects' | 'customers' | 'employees' | 'costCodes') => void;
  toggleBookmark: (item: { title: string; moduleId: MainModuleId; subModuleId: string }) => void;
  isBookmarked: (moduleId: MainModuleId, subModuleId: string) => boolean;

  // Slide-Over Actions
  openSlideOver: (params: { title: string; description?: string; formType: string; initialData?: any; recordId?: string }) => void;
  closeSlideOver: () => void;

  // Toast Action
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  clearToast: () => void;

  // Entity Management Actions
  addProject: (project: Omit<ProjectRecord, 'id'>) => ProjectRecord;
  updateProject: (id: string, updates: Partial<ProjectRecord>) => void;
  deleteProject: (id: string) => void;

  addCustomer: (customer: Omit<Customer, 'id'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  addEmployee: (employee: Omit<EmployeeManpower, 'id'>) => EmployeeManpower;
  updateEmployee: (id: string, updates: Partial<EmployeeManpower>) => void;
  deleteEmployee: (id: string) => void;

  addCostCode: (costCode: Omit<CostCode, 'id'>) => CostCode;
  updateCostCode: (id: string, updates: Partial<CostCode>) => void;
  deleteCostCode: (id: string) => void;

  addManpowerCostResource: (resource: Omit<ManpowerCostResource, 'id'>) => ManpowerCostResource;
  updateManpowerCostResource: (id: string, updates: Partial<ManpowerCostResource>) => void;
  deleteManpowerCostResource: (id: string) => void;

  addEquipmentCostResource: (resource: Omit<EquipmentCostResource, 'id'>) => EquipmentCostResource;
  updateEquipmentCostResource: (id: string, updates: Partial<EquipmentCostResource>) => void;
  deleteEquipmentCostResource: (id: string) => void;

  addMachineriesCostResource: (resource: Omit<MachineriesCostResource, 'id'>) => MachineriesCostResource;
  updateMachineriesCostResource: (id: string, updates: Partial<MachineriesCostResource>) => void;
  deleteMachineriesCostResource: (id: string) => void;

  addBudget: (budget: Omit<ProjectBudget, 'id'>) => ProjectBudget;
  updateBudget: (id: string, updates: Partial<ProjectBudget>) => void;
  reviseBudget: (sourceBudgetId: string, revisionNote?: string) => ProjectBudget;

  addActualCost: (entry: Omit<ActualCostEntry, 'id' | 'createdDate'>) => ActualCostEntry;
  updateActualCost: (id: string, updates: Partial<ActualCostEntry>) => void;
  deleteActualCost: (id: string) => void;

  addPlannedManhour: (entry: Omit<PlannedManhourEntry, 'id'>) => PlannedManhourEntry;
  updatePlannedManhour: (id: string, updates: Partial<PlannedManhourEntry>) => void;
  deletePlannedManhour: (id: string) => void;

  addActualManhour: (entry: Omit<ActualManhourEntry, 'id' | 'createdDate'>) => ActualManhourEntry;
  updateActualManhour: (id: string, updates: Partial<ActualManhourEntry>) => void;
  deleteActualManhour: (id: string) => void;

  addDailyHeadcount: (entry: Omit<DailySiteHeadcount, 'id' | 'createdDate'>) => DailySiteHeadcount;
  updateDailyHeadcount: (id: string, updates: Partial<DailySiteHeadcount>) => void;
  deleteDailyHeadcount: (id: string) => void;

  addMilestone: (milestone: Omit<ProjectMilestone, 'id'>) => ProjectMilestone;
  updateMilestone: (id: string, updates: Partial<ProjectMilestone>) => void;
  deleteMilestone: (id: string) => void;

  addScheduleItem: (item: Omit<ProjectScheduleItem, 'id'>) => ProjectScheduleItem;
  updateScheduleItem: (id: string, updates: Partial<ProjectScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;

  // Prototype Data Management
  resetPrototypeData: () => void;
  addTerminologyNote: (note: Omit<TerminologyNote, 'id' | 'dateAdded'>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Navigation Defaults
      activeModule: 'dashboard',
      activeSubModule: null, // null displays Module Landing Page
      sidebarCollapsed: false,
      searchQuery: '',
      searchScope: 'all',
      bookmarks: [],

      slideOver: {
        isOpen: false,
        title: '',
        description: '',
        formType: '',
        initialData: null,
        recordId: undefined,
      },

      toast: null,

      // Initial Seed Collections per Step 2, 3 & 4 Client Specification
      projects: INITIAL_PROJECTS,
      customers: INITIAL_CUSTOMERS,
      employees: INITIAL_EMPLOYEES,
      costCodes: [...PARENT_C_CODES, ...generateAuthoritativeSCodes()],
      budgets: INITIAL_BUDGETS,
      actualCosts: [],
      plannedManhours: [
        {
          id: 'PMH-044-Nov',
          projectId: 'PRJ-044',
          projectCode: '044',
          projectName: 'Refinery Turnaround Scaffolding Package',
          projectManager: 'MR.MANIMARAN',
          planningMonth: 'Nov-26',
          plannedManhours: 6264,
          plannedHeadcount: 45,
          remarks: 'Baseline monthly allocation for turnaround phase',
        },
        {
          id: 'PMH-366-Nov',
          projectId: 'PRJ-366',
          projectCode: '366',
          projectName: 'Offshore Platform Maintenance',
          projectManager: 'MR.MALUSOUNDER',
          planningMonth: 'Nov-26',
          plannedManhours: 4800,
          plannedHeadcount: 35,
          remarks: 'Offshore deployment schedule',
        },
      ],
      actualManhours: [
        {
          id: 'AMH-044-1',
          projectId: 'PRJ-044',
          projectCode: '044',
          projectName: 'Refinery Turnaround Scaffolding Package',
          projectManager: 'MR.MANIMARAN',
          workDate: '2026-11-11',
          workforceCategory: 'Direct',
          headcount: 42,
          actualManhours: 336,
          remarks: 'Normal shift operations completed',
          createdDate: '2026-11-11',
        },
      ],
      dailyHeadcounts: [
        {
          id: 'DHC-044-1',
          projectId: 'PRJ-044',
          projectCode: '044',
          projectName: 'Refinery Turnaround Scaffolding Package',
          workDate: '2026-11-11',
          actualHeadcount: 42,
          remarks: 'Muster verified at site gate 01',
          createdDate: '2026-11-11',
        },
      ],
      milestones: INITIAL_MILESTONES,
      scheduleItems: INITIAL_SCHEDULE_ITEMS,
      manpowerCostResources: INITIAL_MANPOWER_COST_RESOURCES,
      equipmentCostResources: INITIAL_EQUIPMENT_COST_RESOURCES,
      machineriesCostResources: INITIAL_MACHINERIES_COST_RESOURCES,
      pendingActivities: [],

      companyProfile: {
        name: 'Poratha Group of Companies',
        currency: 'MYR (RM)',
        locationCode: 'MYS',
      },

      terminologyNotes: [],

      // Navigation Actions
      setActiveModule: (module) => {
        set({
          activeModule: module,
          activeSubModule: module === 'master' ? 'master-customer' : module === 'company' ? 'co-profile' : null,
          searchQuery: '',
        });
      },
      setActiveSubModule: (subModuleId) => {
        set({ activeSubModule: subModuleId, searchQuery: '' });
      },
      toggleSidebar: () => {
        set((state: any) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },
      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed });
      },
      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },
      setSearchScope: (scope) => {
        set({ searchScope: scope });
      },
      toggleBookmark: (item) => {
        const { bookmarks } = get();
        const existing = bookmarks.find(
          (b: any) => b.moduleId === item.moduleId && b.subModuleId === item.subModuleId
        );
        if (existing) {
          set((state: any) => ({ bookmarks: state.bookmarks.filter((b: any) => b.id !== existing.id) }));
          get().showToast('Bookmark removed', 'info');
        } else {
          const newBookmark: BookmarkItem = {
            id: `BM-${Date.now()}`,
            title: item.title,
            moduleId: item.moduleId,
            subModuleId: item.subModuleId,
            createdAt: new Date().toISOString(),
          };
          set((state: any) => ({ bookmarks: [...state.bookmarks, newBookmark] }));
          get().showToast('Page added to Quick Bookmarks', 'success');
        }
      },
      isBookmarked: (moduleId, subModuleId) => {
        return get().bookmarks.some(
          (b: any) => b.moduleId === moduleId && b.subModuleId === subModuleId
        );
      },

      // Slide-Over Actions
      openSlideOver: ({ title, description, formType, initialData, recordId }) => {
        set({
          slideOver: {
            isOpen: true,
            title,
            description,
            formType,
            initialData,
            recordId,
          },
        });
      },
      closeSlideOver: () => {
        set((state: any) => ({
          slideOver: { ...state.slideOver, isOpen: false },
        }));
      },

      // Toast Actions
      showToast: (message, type = 'info') => {
        set({ toast: { message, type } });
        setTimeout(() => {
          const current = get().toast;
          if (current?.message === message) {
            set({ toast: null });
          }
        }, 3500);
      },
      clearToast: () => {
        set({ toast: null });
      },

      // Entity Collections Actions
      addProject: (payload) => {
        const id = `PRJ-${payload.code || Date.now()}`;
        const newProject: ProjectRecord = {
          ...payload,
          id,
          createdDate: new Date().toISOString().split('T')[0],
        };
        set((state: any) => ({ projects: [newProject, ...state.projects] }));
        get().showToast(`Project ${newProject.code} registered successfully`, 'success');
        return newProject;
      },
      updateProject: (id, updates) => {
        set((state: any) => ({
          projects: state.projects.map((p: any) => (p.id === id ? { ...p, ...updates } : p)),
        }));
        get().showToast('Project updated successfully', 'success');
      },
      deleteProject: (id) => {
        set((state: any) => ({
          projects: state.projects.filter((p: any) => p.id !== id),
        }));
        get().showToast('Project removed', 'info');
      },

      addCustomer: (payload) => {
        const id = `CUST-${Date.now().toString().slice(-4)}`;
        const newCustomer: Customer = {
          ...payload,
          id,
          createdDate: new Date().toISOString().split('T')[0],
        };
        set((state: any) => ({ customers: [newCustomer, ...state.customers] }));
        get().showToast(`Customer ${newCustomer.name} added`, 'success');
        return newCustomer;
      },
      updateCustomer: (id, updates) => {
        set((state: any) => ({
          customers: state.customers.map((c: any) => (c.id === id ? { ...c, ...updates } : c)),
        }));
        get().showToast('Customer record updated', 'success');
      },
      deleteCustomer: (id) => {
        set((state: any) => ({
          customers: state.customers.filter((c: any) => c.id !== id),
        }));
        get().showToast('Customer removed', 'info');
      },

      addEmployee: (payload) => {
        const id = `EMP-${Date.now().toString().slice(-4)}`;
        const newEmployee: EmployeeManpower = {
          ...payload,
          id,
          createdDate: new Date().toISOString().split('T')[0],
        };
        set((state: any) => ({ employees: [newEmployee, ...state.employees] }));
        get().showToast(`Employee ${newEmployee.name} registered`, 'success');
        return newEmployee;
      },
      updateEmployee: (id, updates) => {
        set((state: any) => ({
          employees: state.employees.map((e: any) => (e.id === id ? { ...e, ...updates } : e)),
        }));
        get().showToast('Employee record updated', 'success');
      },
      deleteEmployee: (id) => {
        set((state: any) => ({
          employees: state.employees.filter((e: any) => e.id !== id),
        }));
        get().showToast('Employee removed', 'info');
      },

      addCostCode: (payload) => {
        const id = `CC-${payload.code}`;
        const newCC: CostCode = { ...payload, id };
        set((state: any) => ({ costCodes: [...state.costCodes, newCC] }));
        get().showToast(`Cost Code ${newCC.code} saved`, 'success');
        return newCC;
      },
      updateCostCode: (id, updates) => {
        set((state: any) => ({
          costCodes: state.costCodes.map((cc: any) => (cc.id === id ? { ...cc, ...updates } : cc)),
        }));
        get().showToast('Cost code updated', 'success');
      },
      deleteCostCode: (id) => {
        set((state: any) => ({
          costCodes: state.costCodes.filter((cc: any) => cc.id !== id),
        }));
        get().showToast('Cost code removed', 'info');
      },

      addManpowerCostResource: (payload) => {
        const id = `MP-${Date.now().toString().slice(-6)}`;
        const newRes: ManpowerCostResource = {
          ...payload,
          id,
          createdDate: new Date().toISOString().split('T')[0],
        };
        set((state: any) => ({ manpowerCostResources: [...state.manpowerCostResources, newRes] }));
        get().showToast(`Manpower cost resource ${newRes.resourceName} saved`, 'success');
        return newRes;
      },
      updateManpowerCostResource: (id, updates) => {
        set((state: any) => ({
          manpowerCostResources: state.manpowerCostResources.map((r: any) => (r.id === id ? { ...r, ...updates } : r)),
        }));
        get().showToast('Manpower cost resource updated', 'success');
      },
      deleteManpowerCostResource: (id) => {
        set((state: any) => ({
          manpowerCostResources: state.manpowerCostResources.filter((r: any) => r.id !== id),
        }));
        get().showToast('Manpower cost resource removed', 'info');
      },

      addEquipmentCostResource: (payload) => {
        const id = `EQ-${Date.now().toString().slice(-6)}`;
        const newRes: EquipmentCostResource = {
          ...payload,
          id,
          createdDate: new Date().toISOString().split('T')[0],
        };
        set((state: any) => ({ equipmentCostResources: [...state.equipmentCostResources, newRes] }));
        get().showToast(`Equipment cost resource ${newRes.resourceName} saved`, 'success');
        return newRes;
      },
      updateEquipmentCostResource: (id, updates) => {
        set((state: any) => ({
          equipmentCostResources: state.equipmentCostResources.map((r: any) => (r.id === id ? { ...r, ...updates } : r)),
        }));
        get().showToast('Equipment cost resource updated', 'success');
      },
      deleteEquipmentCostResource: (id) => {
        set((state: any) => ({
          equipmentCostResources: state.equipmentCostResources.filter((r: any) => r.id !== id),
        }));
        get().showToast('Equipment cost resource removed', 'info');
      },

      addMachineriesCostResource: (payload) => {
        const id = `MC-${Date.now().toString().slice(-6)}`;
        const newRes: MachineriesCostResource = {
          ...payload,
          id,
          createdDate: new Date().toISOString().split('T')[0],
        };
        set((state: any) => ({ machineriesCostResources: [...state.machineriesCostResources, newRes] }));
        get().showToast(`Machinery cost resource ${newRes.resourceName} saved`, 'success');
        return newRes;
      },
      updateMachineriesCostResource: (id, updates) => {
        set((state: any) => ({
          machineriesCostResources: state.machineriesCostResources.map((r: any) => (r.id === id ? { ...r, ...updates } : r)),
        }));
        get().showToast('Machinery cost resource updated', 'success');
      },
      deleteMachineriesCostResource: (id) => {
        set((state: any) => ({
          machineriesCostResources: state.machineriesCostResources.filter((r: any) => r.id !== id),
        }));
        get().showToast('Machinery cost resource removed', 'info');
      },

      addBudget: (payload) => {
        const id = `BDG-${payload.projectCode}-${Date.now().toString().slice(-4)}`;
        const newBudget: ProjectBudget = {
          ...payload,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state: any) => ({ budgets: [newBudget, ...state.budgets] }));
        get().showToast(`Budget ${newBudget.refNo || newBudget.id} created`, 'success');
        return newBudget;
      },
      updateBudget: (id, updates) => {
        set((state: any) => {
          const nextBudgets = state.budgets.map((b: any) =>
            b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
          );
          const updatedBudget = nextBudgets.find((b: any) => b.id === id);

          // Section 10.1: When a budget is approved, update the linked project's approved budget value in Project Master
          if (updatedBudget && updates.status === 'Approved') {
            const linkedProj = state.projects.find((p: any) => p.id === updatedBudget.projectId);
            if (linkedProj) {
              const updatedProjects = state.projects.map((p: any) =>
                p.id === updatedBudget.projectId
                  ? { ...p, budget: updatedBudget.totalBudget, status: p.status || 'Confirmed' }
                  : p
              );
              return { budgets: nextBudgets, projects: updatedProjects };
            }
          }

          return { budgets: nextBudgets };
        });
        get().showToast('Budget record updated', 'success');
      },
      reviseBudget: (sourceBudgetId, revisionNote) => {
        const source = get().budgets.find((b: any) => b.id === sourceBudgetId);
        if (!source) throw new Error('Source budget not found');

        const match = (source.revision || 'REV-00').match(/REV-(\d+)/i);
        const currentRevNum = match ? parseInt(match[1], 10) : 0;
        const nextRevStr = `REV-${String(currentRevNum + 1).padStart(2, '0')}`;

        const newId = `BDG-${source.projectCode}-${Date.now().toString().slice(-4)}`;
        const revisedBudget: ProjectBudget = {
          ...source,
          id: newId,
          revision: nextRevStr,
          status: 'Draft',
          approvedDate: undefined,
          approvedBy: undefined,
          jobScope: revisionNote ? `${source.jobScope || ''} [${revisionNote}]`.trim() : source.jobScope,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state: any) => ({ budgets: [revisedBudget, ...state.budgets] }));
        get().showToast(`Revised budget created (${nextRevStr})`, 'success');
        return revisedBudget;
      },

      addActualCost: (payload) => {
        const id = `ACT-${payload.projectCode}-${Date.now().toString().slice(-4)}`;
        const newEntry: ActualCostEntry = {
          ...payload,
          id,
          createdDate: new Date().toISOString().split('T')[0],
        };
        set((state: any) => ({ actualCosts: [newEntry, ...(state.actualCosts || [])] }));
        get().showToast(`Actual cost entry recorded for Project ${payload.projectCode}`, 'success');
        return newEntry;
      },

      updateActualCost: (id, updates) => {
        set((state: any) => ({
          actualCosts: (state.actualCosts || []).map((a: any) => (a.id === id ? { ...a, ...updates } : a)),
        }));
        get().showToast('Actual cost entry updated', 'success');
      },

      deleteActualCost: (id) => {
        set((state: any) => ({
          actualCosts: (state.actualCosts || []).filter((a: any) => a.id !== id),
        }));
        get().showToast('Actual cost record removed', 'info');
      },

      addMilestone: (payload) => {
        const id = `MLS-${Date.now().toString().slice(-4)}`;
        const newMilestone: ProjectMilestone = { ...payload, id };
        set((state: any) => ({ milestones: [...state.milestones, newMilestone] }));
        get().showToast('Milestone registered', 'success');
        return newMilestone;
      },
      updateMilestone: (id, updates) => {
        set((state: any) => ({
          milestones: state.milestones.map((m: any) => (m.id === id ? { ...m, ...updates } : m)),
        }));
        get().showToast('Milestone updated', 'success');
      },
      deleteMilestone: (id) => {
        set((state: any) => ({
          milestones: state.milestones.filter((m: any) => m.id !== id),
        }));
        get().showToast('Milestone deleted', 'info');
      },

      addScheduleItem: (payload) => {
        const id = `SCH-${Date.now().toString().slice(-4)}`;
        const newItem: ProjectScheduleItem = { ...payload, id };
        set((state: any) => ({ scheduleItems: [...state.scheduleItems, newItem] }));
        get().showToast('Schedule item registered', 'success');
        return newItem;
      },
      updateScheduleItem: (id, updates) => {
        set((state: any) => ({
          scheduleItems: state.scheduleItems.map((s: any) => (s.id === id ? { ...s, ...updates } : s)),
        }));
        get().showToast('Schedule item updated', 'success');
      },
      deleteScheduleItem: (id) => {
        set((state: any) => ({
          scheduleItems: state.scheduleItems.filter((s: any) => s.id !== id),
        }));
        get().showToast('Schedule item deleted', 'info');
      },

      addPlannedManhour: (payload) => {
        const id = `PMH-${payload.projectCode}-${Date.now().toString().slice(-4)}`;
        const newEntry: PlannedManhourEntry = { ...payload, id };
        set((state: any) => ({ plannedManhours: [newEntry, ...(state.plannedManhours || [])] }));
        get().showToast(`Planned manhours scheduled for Project ${payload.projectCode}`, 'success');
        return newEntry;
      },
      updatePlannedManhour: (id, updates) => {
        set((state: any) => ({
          plannedManhours: (state.plannedManhours || []).map((p: any) => (p.id === id ? { ...p, ...updates } : p)),
        }));
        get().showToast('Planned manhour entry updated', 'success');
      },
      deletePlannedManhour: (id) => {
        set((state: any) => ({
          plannedManhours: (state.plannedManhours || []).filter((p: any) => p.id !== id),
        }));
        get().showToast('Planned manhour entry removed', 'info');
      },

      addActualManhour: (payload) => {
        const id = `AMH-${payload.projectCode}-${Date.now().toString().slice(-4)}`;
        const newEntry: ActualManhourEntry = {
          ...payload,
          id,
          createdDate: new Date().toISOString().split('T')[0],
        };
        set((state: any) => ({ actualManhours: [newEntry, ...(state.actualManhours || [])] }));
        get().showToast(`Actual manhours recorded for Project ${payload.projectCode}`, 'success');
        return newEntry;
      },
      updateActualManhour: (id, updates) => {
        set((state: any) => ({
          actualManhours: (state.actualManhours || []).map((a: any) => (a.id === id ? { ...a, ...updates } : a)),
        }));
        get().showToast('Actual manhour entry updated', 'success');
      },
      deleteActualManhour: (id) => {
        set((state: any) => ({
          actualManhours: (state.actualManhours || []).filter((a: any) => a.id !== id),
        }));
        get().showToast('Actual manhour entry removed', 'info');
      },

      addDailyHeadcount: (payload) => {
        const id = `DHC-${payload.projectCode}-${Date.now().toString().slice(-4)}`;
        const newEntry: DailySiteHeadcount = {
          ...payload,
          id,
          createdDate: new Date().toISOString().split('T')[0],
        };
        set((state: any) => ({ dailyHeadcounts: [newEntry, ...(state.dailyHeadcounts || [])] }));
        get().showToast(`Daily headcount recorded for Project ${payload.projectCode}`, 'success');
        return newEntry;
      },
      updateDailyHeadcount: (id, updates) => {
        set((state: any) => ({
          dailyHeadcounts: (state.dailyHeadcounts || []).map((d: any) => (d.id === id ? { ...d, ...updates } : d)),
        }));
        get().showToast('Daily headcount entry updated', 'success');
      },
      deleteDailyHeadcount: (id) => {
        set((state: any) => ({
          dailyHeadcounts: (state.dailyHeadcounts || []).filter((d: any) => d.id !== id),
        }));
        get().showToast('Daily headcount entry removed', 'info');
      },

      // Section 9: Reset Prototype Data
      // Must restore only permitted source data defined in approved client specification.
      resetPrototypeData: () => {
        set({
          projects: INITIAL_PROJECTS,
          customers: INITIAL_CUSTOMERS,
          employees: INITIAL_EMPLOYEES,
          costCodes: [...PARENT_C_CODES, ...generateAuthoritativeSCodes()],
          budgets: INITIAL_BUDGETS,
          actualCosts: [],
          plannedManhours: [
            {
              id: 'PMH-044-Nov',
              projectId: 'PRJ-044',
              projectCode: '044',
              projectName: 'Refinery Turnaround Scaffolding Package',
              projectManager: 'MR.MANIMARAN',
              planningMonth: 'Nov-26',
              plannedManhours: 6264,
              plannedHeadcount: 45,
              remarks: 'Baseline monthly allocation for turnaround phase',
            },
            {
              id: 'PMH-366-Nov',
              projectId: 'PRJ-366',
              projectCode: '366',
              projectName: 'Offshore Platform Maintenance',
              projectManager: 'MR.MALUSOUNDER',
              planningMonth: 'Nov-26',
              plannedManhours: 4800,
              plannedHeadcount: 35,
              remarks: 'Offshore deployment schedule',
            },
          ],
          actualManhours: [
            {
              id: 'AMH-044-1',
              projectId: 'PRJ-044',
              projectCode: '044',
              projectName: 'Refinery Turnaround Scaffolding Package',
              projectManager: 'MR.MANIMARAN',
              workDate: '2026-11-11',
              workforceCategory: 'Direct',
              headcount: 42,
              actualManhours: 336,
              remarks: 'Normal shift operations completed',
              createdDate: '2026-11-11',
            },
          ],
          dailyHeadcounts: [
            {
              id: 'DHC-044-1',
              projectId: 'PRJ-044',
              projectCode: '044',
              projectName: 'Refinery Turnaround Scaffolding Package',
              workDate: '2026-11-11',
              actualHeadcount: 42,
              remarks: 'Muster verified at site gate 01',
              createdDate: '2026-11-11',
            },
          ],
          milestones: INITIAL_MILESTONES,
          scheduleItems: INITIAL_SCHEDULE_ITEMS,
          manpowerCostResources: INITIAL_MANPOWER_COST_RESOURCES,
          equipmentCostResources: INITIAL_EQUIPMENT_COST_RESOURCES,
          machineriesCostResources: INITIAL_MACHINERIES_COST_RESOURCES,
          pendingActivities: [],
        });
        get().showToast('Prototype data restored to approved Poratha client baseline', 'success');
      },

      addTerminologyNote: (note) => {
        const newNote: TerminologyNote = {
          ...note,
          id: `TN-${Date.now().toString().slice(-4)}`,
          dateAdded: new Date().toISOString().split('T')[0],
        };
        set((state: any) => ({ terminologyNotes: [...state.terminologyNotes, newNote] }));
        get().showToast('Terminology note recorded', 'success');
      },
    }),
    {
      name: 'rockeye_poratha_store',
      version: 7,
      migrate: (persistedState: any, _version: number) => {
        // Return persisted state so merge can smoothly layer current initial defaults
        return persistedState || {};
      },
      merge: (persistedState: any, currentState: any) => {
        const merged = { ...currentState, ...(persistedState || {}) };
        if (!merged.customers || merged.customers.length === 0) {
          merged.customers = INITIAL_CUSTOMERS;
        }
        if (!merged.projects || merged.projects.length === 0 || merged.projects.every((p: any) => !p.projectValue)) {
          merged.projects = INITIAL_PROJECTS;
        }
        if (!merged.employees || merged.employees.length === 0) {
          merged.employees = INITIAL_EMPLOYEES;
        }
        if (!merged.costCodes || merged.costCodes.length === 0) {
          merged.costCodes = [...PARENT_C_CODES, ...generateAuthoritativeSCodes()];
        }
        if (!merged.milestones || merged.milestones.length === 0) {
          merged.milestones = INITIAL_MILESTONES;
        }
        if (!merged.scheduleItems || merged.scheduleItems.length === 0) {
          merged.scheduleItems = INITIAL_SCHEDULE_ITEMS;
        }
        if (!merged.budgets || merged.budgets.length === 0 || merged.budgets.every((b: any) => b.totalBudget === 0)) {
          merged.budgets = INITIAL_BUDGETS;
        }
        if (!merged.actualCosts) {
          merged.actualCosts = [];
        }
        if (!merged.plannedManhours) {
          merged.plannedManhours = [
            {
              id: 'PMH-044-Nov',
              projectId: 'PRJ-044',
              projectCode: '044',
              projectName: 'Refinery Turnaround Scaffolding Package',
              projectManager: 'MR.MANIMARAN',
              planningMonth: 'Nov-26',
              plannedManhours: 6264,
              plannedHeadcount: 45,
              remarks: 'Baseline monthly allocation for turnaround phase',
            },
          ];
        }
        if (!merged.actualManhours) {
          merged.actualManhours = [
            {
              id: 'AMH-044-1',
              projectId: 'PRJ-044',
              projectCode: '044',
              projectName: 'Refinery Turnaround Scaffolding Package',
              projectManager: 'MR.MANIMARAN',
              workDate: '2026-11-11',
              workforceCategory: 'Direct',
              headcount: 42,
              actualManhours: 336,
              remarks: 'Normal shift operations completed',
              createdDate: '2026-11-11',
            },
          ];
        }
        if (!merged.dailyHeadcounts) {
          merged.dailyHeadcounts = [
            {
              id: 'DHC-044-1',
              projectId: 'PRJ-044',
              projectCode: '044',
              projectName: 'Refinery Turnaround Scaffolding Package',
              workDate: '2026-11-11',
              actualHeadcount: 42,
              remarks: 'Muster verified at site gate 01',
              createdDate: '2026-11-11',
            },
          ];
        }
        if (!merged.manpowerCostResources || merged.manpowerCostResources.length === 0) {
          merged.manpowerCostResources = INITIAL_MANPOWER_COST_RESOURCES;
        } else {
          const existingNames = new Set(merged.manpowerCostResources.map((r: any) => r.resourceName));
          INITIAL_MANPOWER_COST_RESOURCES.forEach((r) => {
            if (!existingNames.has(r.resourceName)) {
              merged.manpowerCostResources.push(r);
            }
          });
        }
        if (!merged.equipmentCostResources || merged.equipmentCostResources.length === 0) {
          merged.equipmentCostResources = INITIAL_EQUIPMENT_COST_RESOURCES;
        } else {
          const existingNames = new Set(merged.equipmentCostResources.map((r: any) => r.resourceName));
          INITIAL_EQUIPMENT_COST_RESOURCES.forEach((r) => {
            if (!existingNames.has(r.resourceName)) {
              merged.equipmentCostResources.push(r);
            }
          });
        }
        if (!merged.machineriesCostResources || merged.machineriesCostResources.length === 0) {
          merged.machineriesCostResources = INITIAL_MACHINERIES_COST_RESOURCES;
        } else {
          const existingNames = new Set(merged.machineriesCostResources.map((r: any) => r.resourceName));
          INITIAL_MACHINERIES_COST_RESOURCES.forEach((r) => {
            if (!existingNames.has(r.resourceName)) {
              merged.machineriesCostResources.push(r);
            }
          });
        }
        if (merged.terminologyNotes) {
          merged.terminologyNotes = merged.terminologyNotes.filter(
            (tn: any) =>
              !['Poratha Coporation', 'Poratha Corporation', 'Bussiness Management', 'ASSEST'].includes(tn.clientTerm)
          );
        } else {
          merged.terminologyNotes = [];
        }
        return merged;
      },
      partialize: (state: any) => ({
        projects: state.projects,
        customers: state.customers,
        employees: state.employees,
        costCodes: state.costCodes,
        budgets: state.budgets,
        actualCosts: state.actualCosts,
        plannedManhours: state.plannedManhours,
        actualManhours: state.actualManhours,
        dailyHeadcounts: state.dailyHeadcounts,
        milestones: state.milestones,
        scheduleItems: state.scheduleItems,
        manpowerCostResources: state.manpowerCostResources,
        equipmentCostResources: state.equipmentCostResources,
        machineriesCostResources: state.machineriesCostResources,
        bookmarks: state.bookmarks,
        terminologyNotes: state.terminologyNotes,
        companyProfile: state.companyProfile,
      }),
    }
  )
);
