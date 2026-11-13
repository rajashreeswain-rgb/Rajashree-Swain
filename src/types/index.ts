/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ==========================================
// 1. STRICT APPLICATION SCOPE (6 MAIN MODULES)
// ==========================================
export type MainModuleId =
  | 'dashboard'
  | 'project-management'
  | 'budget-cost-control'
  | 'master'
  | 'company'
  | 'reports';

export interface MainModuleDef {
  id: MainModuleId;
  label: string;
  iconName: string;
  description: string;
  categories: SubModuleCategory[];
}

export interface SubModuleCategory {
  title: string;
  subModules: SubModuleDef[];
}

export interface SubModuleDef {
  id: string;
  label: string;
  description: string;
}

// ==========================================
// 2. CENTRAL STORE ENTITY COLLECTIONS
// ==========================================

// Collection 1: Customers
export interface Customer {
  id: string;
  code?: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  status: 'Active' | 'Inactive';
  billingAddress?: string;
  createdDate?: string;
}

// Collection 2: Projects (Shared between Project Management and Project Master)
export interface ProjectRecord {
  id: string;
  refNo?: string;
  code: string; // e.g. "044", "366", "377", "389", "390"
  name: string; // Project Description / Title
  projectUnder?: string;
  customerId?: string;
  customerName?: string;
  projectManager?: string; // e.g. MR.MANIMARAN
  projectManagerId?: string;
  projectIncharge?: string;
  location?: string; // MYS
  startDate?: string;
  completion?: string; // e.g. "nil", "30-Apr-26", "TBC"
  constructionCompletionDate?: string;
  revisedCompletionDate?: string;
  eot?: string; // e.g. "nil", "N/A"
  contractValue?: number | null;
  projectValue?: number | null; // Blank per Rule 5
  budget?: number | null; // Blank per Rule 5
  expectedProfit?: number | null; // Blank
  expectedProfitPercentage?: number | null; // Blank
  jobScope?: string;
  status?: string; // Blank until maintained by authorized user
  progressPlan?: number | null; // Blank
  progressActual?: number | null; // Blank
  createdDate?: string;
  milestones?: ProjectMilestone[];
  schedules?: ProjectScheduleItem[];
}

// Collection 3: Employees / Manpower
export interface EmployeeManpower {
  id: string;
  code?: string;
  name: string;
  designation?: string;
  department?: string;
  contact?: string;
  email?: string;
  phone?: string;
  resourceType?: 'Manpower' | 'Equipment' | 'Machinery';
  classification?: 'Direct' | 'Indirect' | 'Supervisory / Engineering';
  origin?: 'Local' | 'Foreigner';
  hourType?: 'NOR' | 'OT' | 'SUN-PH';
  dailyRate?: number | null;
  status: 'Active' | 'Inactive' | 'Mobilized';
  assignedProjectId?: string;
  createdDate?: string;
}

// Collection 4: Cost Codes (Hierarchical C-Code -> S-Code)
export interface CostCode {
  id: string;
  code: string; // e.g. "1001", "S-101"
  description: string;
  category?: string;
  level: 'C-Code' | 'S-Code';
  parentCCode?: string; // for child S-Codes e.g. "1001"
  status: 'Active' | 'Inactive';
  sourceRowIndex?: number;
}

// Collection 4b: Manpower Cost Resources
export interface ManpowerCostResource {
  id: string;
  classification?: 'Direct' | 'Indirect';
  costDetails?: string; // Accommodation, Transport, Visa, Levy, PPE, MPK, CIDB, etc.
  resourceName: string;
  origin?: 'Local' | 'Foreigner';
  hourType?: 'NOR' | 'OT' | 'SUN/P.H OT';
  status: 'Active' | 'Inactive';
  createdDate?: string;
}

// Collection 4c: Equipment Cost Resources
export interface EquipmentCostResource {
  id: string;
  resourceName: string;
  uom?: string;
  hourType?: 'NOR' | 'OT' | 'SUN/P.H OT';
  sourceCostCode?: string;
  status: 'Active' | 'Inactive';
  createdDate?: string;
}

// Collection 4d: Machineries Cost Resources
export interface MachineriesCostResource {
  id: string;
  resourceName: string;
  uom?: string;
  cCode?: string;
  costDetails?: string;
  sCCode?: string;
  status: 'Active' | 'Inactive';
  createdDate?: string;
}

// Collection 5: Budgets (Supports Versioning e.g. REV-00, REV-01)
export interface BudgetCostCodeAllocation {
  id: string; // Refers to the original CostCode record ID
  cCode: string;
  cCodeDescription: string;
  sCode: string;
  sCodeDescription: string;
  monthlyAmounts: Record<string, number>; // Map of "Month-YY" to amount
  totalAmount: number;
  phasingMethod?: 'Even' | 'Front-loaded' | 'S-curve' | 'Back-loaded' | 'Custom';
}

export interface ActualCostEntry {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  cCode: string; // e.g. "1001"
  cCodeDescription: string;
  sCode: string; // e.g. "S-101"
  sCodeDescription: string;
  amount: number;
  costMonth: string; // e.g. "Jan-26"
  reference?: string;
  documentName?: string;
  createdDate: string; // YYYY-MM-DD
  createdBy?: string;
  notes?: string;
}

export interface ProjectBudget {
  id: string;
  refNo?: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  projectUnder?: string;
  client?: string;
  startDate?: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  projectIncharge?: string;
  jobScope?: string;
  revision: string; // Versioning: e.g. REV-00, REV-01, REV-xx
  version?: string;
  totalBudget: number;
  monthlyColumns: string[]; // Dynamically generated columns
  costCodeAllocations: BudgetCostCodeAllocation[];
  approvedDate?: string;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlannedManhourEntry {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  projectManager: string;
  planningMonth: string; // e.g. "Jan-26"
  plannedManhours: number;
  plannedHeadcount?: number | null;
  remarks?: string;
}

export interface ActualManhourEntry {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  projectManager: string;
  workDate: string; // YYYY-MM-DD
  workforceCategory?: string; // Direct / Indirect / Supervisory
  headcount: number;
  actualManhours: number;
  remarks?: string;
  createdDate: string; // YYYY-MM-DD
}

export interface DailySiteHeadcount {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  workDate: string; // YYYY-MM-DD
  actualHeadcount: number;
  remarks?: string;
  createdDate: string; // YYYY-MM-DD
}

// Collection 6: Milestones
export interface ProjectMilestone {
  id: string;
  projectId: string;
  sequence?: number;
  title: string;
  description?: string;
  targetDate: string; // Planned Date
  actualDate?: string;
  completionDate?: string;
  claimPercentage?: number | null;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Delayed';
  remarks?: string;
  certified?: boolean;
}

// Collection 7: Schedule Items
export interface ProjectScheduleItem {
  id: string;
  projectId: string;
  sequence?: number;
  taskName: string;
  group?: string;
  startDate: string; // Planned Start
  endDate: string; // Planned End
  actualStartDate?: string;
  actualEndDate?: string;
  revisedEndDate?: string;
  eot?: string;
  assignedTo?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Delayed';
  notes?: string;
  progress?: number;
}

export interface ProjectLifecycleStage {
  id: string;
  stageNumber: number;
  name: string;
  description: string;
  status: 'Completed' | 'In Progress' | 'Pending';
  completionPercentage: number;
}

// ==========================================
// 3. APPLICATION BRANDING & SETTINGS
// ==========================================
export interface CompanyProfile {
  name: string; // Poratha Group of Companies
  currency: string; // MYR (RM)
  locationCode: string; // MYS
  registrationNumber?: string;
  address?: string;
}

export interface TerminologyNote {
  id: string;
  clientTerm: string;
  correctedTerm: string;
  context: string;
  dateAdded: string;
}

// ==========================================
// 4. HEADER & NAVIGATION AUXILIARY TYPES
// ==========================================
export interface BookmarkItem {
  id: string;
  title: string;
  moduleId: MainModuleId;
  subModuleId: string;
  createdAt: string;
}

export interface PendingActivity {
  id: string;
  title: string;
  description: string;
  recordType: 'Project' | 'Budget' | 'Milestone';
  recordId: string;
  date: string;
  linkModule: MainModuleId;
  linkSubModule: string;
}

// ==========================================
// 5. REUSABLE TABLE & FORM TYPES
// ==========================================
export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  className?: string;
}

export interface SlideOverState {
  isOpen: boolean;
  title: string;
  description?: string;
  formType: string;
  initialData?: any;
  recordId?: string;
}

export interface ToastMessage {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}
