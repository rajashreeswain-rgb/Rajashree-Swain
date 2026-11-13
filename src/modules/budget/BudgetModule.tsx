/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ListingTable } from '../../components/common/ListingTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationRequiredBadge } from '../../components/common/ConfirmationRequiredBadge';
import { ColumnDef, CostCode, ActualCostEntry } from '../../types';
import { BudgetCreationWizard } from './BudgetCreationWizard';
import { RecordActualCostModal } from './RecordActualCostModal';
import {
  Plus,
  History,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Send,
  AlertCircle,
  Calculator,
  ArrowLeft,
  CheckCircle2,
  Eye,
  Receipt,
  AlertTriangle,
  FileSpreadsheet,
  Trash2,
  Filter,
} from 'lucide-react';

export const BudgetModule: React.FC = () => {
  const {
    activeSubModule,
    budgets,
    projects,
    costCodes,
    actualCosts,
    manpowerCostResources,
    equipmentCostResources,
    machineriesCostResources,
    updateBudget,
    reviseBudget,
    deleteActualCost,
    showToast,
  } = useAppStore();

  // Selected project ID in Budget Register or Workspace
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Active section tab within the selected project workspace
  const [activeTab, setActiveTab] = useState<
    'overview' | 'costcode' | 'manpower' | 'equipment' | 'machinery' | 'phasing' | 'actuals' | 'variance' | 'approval' | 'revision'
  >('overview');

  // Wizard and Modal States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isActualCostModalOpen, setIsActualCostModalOpen] = useState(false);
  const [actualCostModalSCode, setActualCostModalSCode] = useState<string | null>(null);

  // Rejection Modal State
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Cost Code-wise View Filters
  const [costCodeCategoryFilter, setCostCodeCategoryFilter] = useState<string>('all');
  const [actualCostMonthFilter, setActualCostMonthFilter] = useState<string>('all');
  const [actualCostProjectFilter, setActualCostProjectFilter] = useState<string>('all');

  // Expandable C-Codes
  const [expandedCCodes, setExpandedCCodes] = useState<Record<string, boolean>>({
    '1001': true,
    '1002': true,
    '1003': false,
    '1004': false,
  });

  // Sync activeSubModule selection from sidebar navigation
  useEffect(() => {
    if (activeSubModule === 'budget-actual-costs') {
      if (selectedProjectId) {
        setActiveTab('actuals');
      }
    } else if (activeSubModule === 'budget-monitoring') {
      if (selectedProjectId) {
        setActiveTab('variance');
      }
    } else if (activeSubModule === 'budget-register') {
      // Show register table if no project selected
    }
  }, [activeSubModule, selectedProjectId]);

  // Selected project object
  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  // Find latest or active budget for selected project
  const selectedBudget = useMemo(() => {
    if (!selectedProjectId) return null;
    const projBudgets = budgets.filter((b) => b.projectId === selectedProjectId);
    if (projBudgets.length === 0) return null;
    return projBudgets[0];
  }, [budgets, selectedProjectId]);

  // All budget revisions for selected project
  const projectBudgets = useMemo(() => {
    if (!selectedProjectId) return [];
    return budgets.filter((b) => b.projectId === selectedProjectId);
  }, [budgets, selectedProjectId]);

  // Parent C-Codes list
  const parentCCodes = useMemo(
    () => costCodes.filter((c) => c.level === 'C-Code'),
    [costCodes]
  );

  // Group child S-Codes under each parent C-Code
  const getSCodesForCCode = (cCodeStr: string): CostCode[] => {
    return costCodes.filter((c) => c.level === 'S-Code' && c.parentCCode === cCodeStr);
  };

  // Derive month columns from project dates
  const activeMonthColumns = useMemo(() => {
    if (!selectedProject && !selectedBudget) return ['Jan-26', 'Feb-26', 'Mar-26', 'Apr-26', 'May-26', 'Jun-26'];
    const startStr = selectedBudget?.startDate || selectedProject?.startDate || '15-Jan-2026';
    const compStr = selectedProject?.completion || selectedProject?.constructionCompletionDate || '30-Jun-2026';

    if (!startStr || !compStr || compStr.toLowerCase() === 'nil' || compStr.toLowerCase() === 'tbc') {
      return ['Jan-26', 'Feb-26', 'Mar-26', 'Apr-26', 'May-26', 'Jun-26'];
    }

    try {
      const parseDate = (dStr: string): Date | null => {
        const parts = dStr.split(/[-/]/);
        if (parts.length === 3) {
          const monthMap: Record<string, number> = {
            jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
            jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
          };
          let day = parseInt(parts[0], 10);
          let monthStr = parts[1].toLowerCase();
          let month = monthMap[monthStr] !== undefined ? monthMap[monthStr] : parseInt(parts[1], 10) - 1;
          let year = parseInt(parts[2], 10);
          if (year < 100) year += 2000;
          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            return new Date(year, month, day);
          }
        }
        return null;
      };

      const start = parseDate(startStr);
      const end = parseDate(compStr);

      if (!start || !end || start >= end) {
        return ['Jan-26', 'Feb-26', 'Mar-26', 'Apr-26', 'May-26', 'Jun-26'];
      }

      const months: string[] = [];
      const cur = new Date(start.getFullYear(), start.getMonth(), 1);
      const last = new Date(end.getFullYear(), end.getMonth(), 1);

      while (cur <= last && months.length < 36) {
        const monthName = cur.toLocaleString('en-US', { month: 'short' });
        const yr = String(cur.getFullYear()).slice(-2);
        months.push(`${monthName}-${yr}`);
        cur.setMonth(cur.getMonth() + 1);
      }

      return months.length > 0 ? months : ['Jan-26', 'Feb-26', 'Mar-26', 'Apr-26', 'May-26', 'Jun-26'];
    } catch {
      return ['Jan-26', 'Feb-26', 'Mar-26', 'Apr-26', 'May-26', 'Jun-26'];
    }
  }, [selectedBudget, selectedProject]);

  // Toggle C-Code Category Expansion
  const toggleCCodeExpansion = (cCode: string) => {
    setExpandedCCodes((prev) => ({ ...prev, [cCode]: !prev[cCode] }));
  };

  // Helper mapping project records to budget summary rows for Landing Page Table
  const projectRegisterRows = useMemo(() => {
    return projects.map((p) => {
      const projBudgets = budgets.filter((b) => b.projectId === p.id);
      const latestBudget = projBudgets[0] || null;

      const totalBudget = latestBudget?.totalBudget ?? (p.budget != null && p.budget > 0 ? p.budget : 0);
      const hasBudget = !!latestBudget || (p.budget != null && p.budget > 0);
      const budgetStatus = latestBudget ? latestBudget.status : (p.budget ? 'Approved' : 'No Budget Created');
      const revision = latestBudget ? (latestBudget.revision || 'REV-00') : '—';

      // Sum of actual costs recorded for this project
      const projActualCosts = actualCosts.filter((a) => a.projectId === p.id);
      const totalActualCost = projActualCosts.reduce((sum, a) => sum + (a.amount || 0), 0);

      return {
        id: p.id,
        projectCode: p.code,
        name: p.name,
        client: p.customerName || '—',
        projectManager: p.projectManager || '—',
        startDate: p.startDate || '15-Jan-2026',
        completion: p.completion || p.constructionCompletionDate || '—',
        projectValue: p.projectValue ?? p.contractValue ?? null,
        totalBudget,
        totalActualCost,
        hasBudget,
        budgetStatus,
        revision,
        latestBudgetId: latestBudget?.id || null,
        projectRecord: p,
      };
    });
  }, [projects, budgets, actualCosts]);

  // Filter options derived from data
  const clientFilterOptions = useMemo(() => {
    const clients = Array.from(new Set(projects.map((p) => p.customerName).filter((c): c is string => Boolean(c))));
    return clients.map((c) => ({ label: c, value: c }));
  }, [projects]);

  const pmFilterOptions = useMemo(() => {
    const pms = Array.from(new Set(projects.map((p) => p.projectManager).filter((pm): pm is string => Boolean(pm))));
    return pms.map((pm) => ({ label: pm, value: pm }));
  }, [projects]);

  // Landing Page Table Columns
  const registerColumns: ColumnDef<(typeof projectRegisterRows)[0]>[] = [
    {
      key: 'projectCode',
      header: 'Project Code',
      sortable: true,
      render: (r) => <span className="font-mono font-bold text-blue-700">{r.projectCode}</span>,
    },
    {
      key: 'client',
      header: 'Client',
      sortable: true,
      render: (r) => <span className="font-semibold text-slate-900">{r.client}</span>,
    },
    {
      key: 'name',
      header: 'Project Description',
      render: (r) => <span className="text-slate-800 line-clamp-2">{r.name}</span>,
    },
    {
      key: 'projectManager',
      header: 'Project Manager',
      render: (r) => <span className="font-medium text-slate-700">{r.projectManager}</span>,
    },
    {
      key: 'projectValue',
      header: 'Project Value (MYR)',
      sortable: true,
      render: (r) => (
        <span className="font-mono font-semibold tabular-nums text-slate-900">
          {r.projectValue != null ? `MYR ${r.projectValue.toLocaleString()}` : '—'}
        </span>
      ),
    },
    {
      key: 'totalBudget',
      header: 'Approved Budget (MYR)',
      sortable: true,
      render: (r) => (
        <span className="font-mono font-bold tabular-nums text-slate-900">
          {r.totalBudget > 0
            ? `MYR ${r.totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
            : r.hasBudget ? 'MYR 0.00' : '—'}
        </span>
      ),
    },
    {
      key: 'totalActualCost',
      header: 'Actual Cost (MYR)',
      sortable: true,
      render: (r) => (
        <span className="font-mono font-bold tabular-nums text-amber-700">
          MYR {r.totalActualCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'budgetStatus',
      header: 'Budget Status',
      render: (r) => <StatusBadge label={r.budgetStatus} />,
    },
    {
      key: 'revision',
      header: 'Revision',
      render: (r) => (
        <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold border border-slate-300">
          {r.revision}
        </span>
      ),
    },
  ];

  // Workspace Tabs Definition
  const workspaceTabs = [
    { id: 'overview', label: '1. Overview' },
    { id: 'costcode', label: '2. Cost Code Allocations' },
    { id: 'manpower', label: '3. Manpower Cost' },
    { id: 'equipment', label: '4. Equipment Cost' },
    { id: 'machinery', label: '5. Machineries Cost' },
    { id: 'phasing', label: '6. Monthly Budget' },
    { id: 'actuals', label: '7. Record Actual Cost' },
    { id: 'variance', label: '8. Budget vs Actual' },
    { id: 'approval', label: '9. Budget Approval' },
    { id: 'revision', label: '10. Budget Revisions' },
  ] as const;

  // Handle Approve Action for Selected Project
  const handleApproveBudget = () => {
    if (!selectedBudget) return;
    updateBudget(selectedBudget.id, {
      status: 'Approved',
      approvedDate: new Date().toISOString().split('T')[0],
      approvedBy: 'Designated Approver',
    });
    showToast(`Budget ${selectedBudget.revision} approved and synchronized with Project Master`, 'success');
  };

  // Handle Reject Action for Selected Project
  const handleRejectBudget = () => {
    if (!selectedBudget) return;
    if (!rejectionReason.trim()) {
      showToast('Mandatory rejection reason is required', 'error');
      return;
    }
    updateBudget(selectedBudget.id, {
      status: 'Draft',
      rejectionReason: rejectionReason.trim(),
      jobScope: `${selectedBudget.jobScope || ''} [Rejection Note: ${rejectionReason.trim()}]`.trim(),
    });
    setRejectionModalOpen(false);
    setRejectionReason('');
    showToast('Budget rejected and returned to Draft state', 'info');
  };

  // Handle New Revision Creation for Selected Project
  const handleCreateRevision = () => {
    if (!selectedBudget) return;
    const rev = reviseBudget(selectedBudget.id, 'Routine budget revision adjustment');
    setActiveTab('phasing');
    showToast(`Revision ${rev.revision} created for Project ${selectedBudget.projectCode}`, 'success');
  };

  // Filtered actual costs list for standalone Actual Cost register view
  const filteredActualCosts = useMemo(() => {
    return actualCosts.filter((a) => {
      if (selectedProjectId && a.projectId !== selectedProjectId) return false;
      if (actualCostProjectFilter !== 'all' && a.projectId !== actualCostProjectFilter) return false;
      if (actualCostMonthFilter !== 'all' && a.costMonth !== actualCostMonthFilter) return false;
      return true;
    });
  }, [actualCosts, selectedProjectId, actualCostProjectFilter, actualCostMonthFilter]);

  // Actual Cost Listing Table Columns
  const actualCostColumns: ColumnDef<ActualCostEntry>[] = [
    {
      key: 'createdDate',
      header: 'Entry Date',
      sortable: true,
      render: (r) => <span className="font-mono text-slate-600 text-xs">{r.createdDate}</span>,
    },
    {
      key: 'projectCode',
      header: 'Project Code',
      sortable: true,
      render: (r) => <span className="font-mono font-bold text-blue-700">{r.projectCode}</span>,
    },
    {
      key: 'cCode',
      header: 'Cost Code',
      render: (r) => <span className="font-mono text-slate-700">C-{r.cCode}</span>,
    },
    {
      key: 'sCode',
      header: 'Sub-Code',
      sortable: true,
      render: (r) => <span className="font-mono font-bold text-slate-900">{r.sCode}</span>,
    },
    {
      key: 'sCodeDescription',
      header: 'Cost Description',
      render: (r) => <span className="text-slate-800 font-medium">{r.sCodeDescription}</span>,
    },
    {
      key: 'costMonth',
      header: 'Cost Month',
      render: (r) => (
        <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold border border-slate-300">
          {r.costMonth}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Actual Cost (MYR)',
      sortable: true,
      render: (r) => (
        <span className="font-mono font-bold tabular-nums text-amber-700">
          MYR {r.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'reference',
      header: 'Reference',
      render: (r) => <span className="font-mono text-xs text-slate-600">{r.reference || '—'}</span>,
    },
  ];

  // =========================================================================
  // VIEW MODE SWITCHING (REGISTER VS WORKSPACE VS ACTUAL COST REGISTER)
  // =========================================================================

  // If sub-module is Record Actual Cost & no specific project is selected, render global Actual Cost Register
  if (activeSubModule === 'budget-actual-costs' && !selectedProjectId) {
    return (
      <div className="space-y-4 select-none">
        {/* Workspace Header */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-600" />
              <span>Record &amp; Monitor Actual Costs</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Record project expenditure against approved cost codes with live budget consumption tracking and excess warnings.
            </p>
          </div>

          <button
            onClick={() => {
              setActualCostModalSCode(null);
              setIsActualCostModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded shadow-2xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Record Actual Cost</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 font-mono">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filters:</span>
          </div>

          <div>
            <select
              value={actualCostProjectFilter}
              onChange={(e) => setActualCostProjectFilter(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded font-medium text-slate-800"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.code}] {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={actualCostMonthFilter}
              onChange={(e) => setActualCostMonthFilter(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded font-medium text-slate-800 font-mono"
            >
              <option value="all">All Months</option>
              {['Jan-26', 'Feb-26', 'Mar-26', 'Apr-26', 'May-26', 'Jun-26', 'Jul-26', 'Aug-26', 'Sep-26', 'Oct-26', 'Nov-26', 'Dec-26'].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actual Cost Listing Table */}
        <ListingTable
          data={filteredActualCosts}
          columns={actualCostColumns}
          keyExtractor={(r) => r.id}
          searchPlaceholder="Search by Project Code, S-Code, Reference, or Description..."
          searchableKeys={['projectCode', 'sCode', 'sCodeDescription', 'reference', 'costMonth']}
          emptyStateTitle="No actual cost records found"
          emptyStateDescription="Click 'Record Actual Cost' to record expenditure incurred against a project budget."
          rowActions={(r) => (
            <button
              onClick={() => {
                deleteActualCost(r.id);
              }}
              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
              title="Remove Actual Cost Record"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        />

        {/* Modal */}
        <RecordActualCostModal
          isOpen={isActualCostModalOpen}
          onClose={() => setIsActualCostModalOpen(false)}
          initialProjectId={selectedProjectId}
          initialSCode={actualCostModalSCode}
        />
      </div>
    );
  }

  // =========================================================================
  // RENDER LANDING PAGE: PROJECT BUDGET REGISTER (WHEN NO PROJECT SELECTED)
  // =========================================================================
  if (!selectedProjectId || !selectedProject) {
    return (
      <div className="space-y-4 select-none">
        {/* Workspace Header */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              <span>Project Budget Register</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Centralized register of project budget proposals, approved baselines, and cost monitoring workspaces.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                setActualCostModalSCode(null);
                setIsActualCostModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded shadow-2xs transition-colors"
            >
              <Receipt className="w-4 h-4 text-amber-600" />
              <span>Record Actual Cost</span>
            </button>

            <button
              onClick={() => setIsWizardOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-2xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Budget (5-Step Wizard)</span>
            </button>
          </div>
        </div>

        {/* Project Budget Register Listing Table */}
        <ListingTable
          data={projectRegisterRows}
          columns={registerColumns}
          keyExtractor={(r) => r.id}
          searchPlaceholder="Search by Project Code, Description, Client, or Project Manager..."
          searchableKeys={['projectCode', 'client', 'name', 'projectManager', 'budgetStatus', 'revision']}
          filters={[
            {
              key: 'client',
              label: 'Client',
              options: clientFilterOptions,
            },
            {
              key: 'projectManager',
              label: 'Project Manager',
              options: pmFilterOptions,
            },
            {
              key: 'budgetStatus',
              label: 'Budget Status',
              options: [
                { label: 'Draft', value: 'Draft' },
                { label: 'Submitted', value: 'Submitted' },
                { label: 'Approved', value: 'Approved' },
                { label: 'No Budget Created', value: 'No Budget Created' },
              ],
            },
          ]}
          emptyStateTitle="No project records found"
          emptyStateDescription="No projects available in Project Master. Register a project or initialize a budget proposal."
          rowActions={(r) => (
            <button
              onClick={() => {
                setSelectedProjectId(r.id);
                setActiveTab('overview');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Budget Workspace</span>
            </button>
          )}
        />

        {/* 5-Step Budget Creation Wizard */}
        <BudgetCreationWizard
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onBudgetCreated={(newBudgetId, projId) => {
            setSelectedProjectId(projId);
            setActiveTab('overview');
          }}
        />

        {/* Record Actual Cost Modal */}
        <RecordActualCostModal
          isOpen={isActualCostModalOpen}
          onClose={() => setIsActualCostModalOpen(false)}
          initialProjectId={selectedProjectId}
        />
      </div>
    );
  }

  // =========================================================================
  // RENDER SELECTED PROJECT WORKSPACE
  // =========================================================================
  const projectValue = selectedProject.projectValue ?? selectedProject.contractValue ?? null;
  const calcBudget = selectedBudget?.totalBudget || 0;

  // Actual costs sum for selected project
  const projectActualCosts = actualCosts.filter((a) => a.projectId === selectedProject.id);
  const totalProjectActualCost = projectActualCosts.reduce((sum, a) => sum + (a.amount || 0), 0);
  const totalRemainingBudget = calcBudget - totalProjectActualCost;

  const expectedProfit = projectValue != null ? projectValue - calcBudget : null;
  const expectedProfitPct =
    projectValue != null && projectValue > 0
      ? ((expectedProfit! / projectValue) * 100).toFixed(2)
      : null;

  return (
    <div className="space-y-4 select-none">
      {/* Selected Project Header Bar */}
      <div className="bg-slate-900 text-white rounded-lg p-4 shadow-sm space-y-3 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <button
              onClick={() => setSelectedProjectId(null)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors flex items-center gap-1 text-xs font-mono shrink-0"
              title="Return to Project Budget Register"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline font-bold">Register</span>
            </button>

            <div className="border-l border-slate-700 pl-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                  Project {selectedProject.code}
                </span>
                <span className="font-mono text-xs text-slate-400">
                  {selectedBudget?.revision || 'REV-00'}
                </span>
                <StatusBadge label={selectedBudget?.status || 'Draft'} />
              </div>
              <h2 className="text-sm font-bold text-white mt-1 line-clamp-1">
                {selectedProject.name}
              </h2>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setActualCostModalSCode(null);
                setIsActualCostModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-300 bg-amber-950/80 hover:bg-amber-900 border border-amber-800 rounded transition-colors"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Record Actual Cost</span>
            </button>

            {selectedBudget?.status === 'Draft' && (
              <button
                onClick={() => {
                  updateBudget(selectedBudget.id, { status: 'Submitted' });
                  showToast(`Budget submitted for approval`, 'success');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Approval</span>
              </button>
            )}

            {selectedBudget?.status === 'Submitted' && (
              <button
                onClick={handleApproveBudget}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve Budget</span>
              </button>
            )}

            <button
              onClick={handleCreateRevision}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-300 bg-purple-950/80 hover:bg-purple-900 border border-purple-800 rounded transition-colors"
              title="Create new REV-xx revision"
            >
              <History className="w-3.5 h-3.5" />
              <span>Create Revision</span>
            </button>
          </div>
        </div>

        {/* Sub-header Context Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300 font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">Client:</span>
            <span className="text-slate-200 font-semibold">{selectedProject.customerName || 'CAHYA MATA'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Project Manager:</span>
            <span className="text-slate-200 font-semibold">{selectedProject.projectManager || 'MR.MANIMARAN'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Approved Budget:</span>
            <span className="text-emerald-400 font-bold">
              {calcBudget > 0 ? `MYR ${calcBudget.toLocaleString()}` : 'Unallocated'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Actual Cost Incurred:</span>
            <span className="text-amber-400 font-bold">
              MYR {totalProjectActualCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Remaining Budget:</span>
            <span className={`font-bold ${totalRemainingBudget >= 0 ? 'text-blue-300' : 'text-rose-400'}`}>
              MYR {totalRemainingBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Internal Section Tabs Strip */}
      <div className="bg-white rounded-lg border border-slate-200 p-1.5 shadow-2xs flex items-center gap-1 overflow-x-auto">
        {workspaceTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BUDGET OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-500 text-[11px] block font-sans">Project Contract Value</span>
              <span className="text-slate-900 font-bold text-base block mt-1">
                {projectValue != null ? `MYR ${projectValue.toLocaleString()}` : '—'}
              </span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-500 text-[11px] block font-sans">Approved Budget Total</span>
              <span className="text-blue-700 font-bold text-base block mt-1">
                MYR {calcBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-500 text-[11px] block font-sans">Actual Expenditure</span>
              <span className="text-amber-700 font-bold text-base block mt-1">
                MYR {totalProjectActualCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-500 text-[11px] block font-sans">Expected Profit Margin</span>
              <span className="text-emerald-700 font-bold text-base block mt-1">
                {expectedProfitPct != null ? `${expectedProfitPct}%` : '—'}
              </span>
              <div className="mt-1">
                <ConfirmationRequiredBadge variant="proposed" text="Proposed – Pending Client Validation" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 border-b pb-2 text-xs uppercase tracking-wider font-mono">
              Project Specification &amp; Baseline Metadata
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>Ref No: <strong className="text-slate-900">{selectedBudget?.refNo || `BDG-${selectedProject.code}-REV00`}</strong></div>
              <div>Project Code: <strong className="text-blue-700">{selectedProject.code}</strong></div>
              <div>Workflow Status: <StatusBadge label={selectedBudget?.status || 'Draft'} /></div>
              <div>Revision: <strong className="text-purple-700">{selectedBudget?.revision || 'REV-00'}</strong></div>
              <div>Start Date: <strong className="text-slate-900">{selectedProject.startDate || '15-Jan-2026'}</strong></div>
              <div>Completion Date: <strong className="text-slate-900">{selectedProject.completion || selectedProject.constructionCompletionDate || '30-Apr-2026'}</strong></div>
              <div>Manager: <strong className="text-slate-900">{selectedProject.projectManager || 'MR.MANIMARAN'}</strong></div>
              <div>Client: <strong className="text-slate-900">{selectedProject.customerName || 'CAHYA MATA'}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COST CODE ALLOCATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'costcode' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Cost Code Breakdown &amp; Baseline Allocation Hierarchy
                </h3>
                <p className="text-[11px] text-slate-500">
                  Allocations organized by Parent C-Codes and Child S-Codes.
                </p>
              </div>
              <div className="text-right font-mono">
                <span className="text-[11px] text-slate-500 block">Total Allocated:</span>
                <span className="text-xs font-bold text-blue-700">
                  MYR {calcBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="border border-slate-200 rounded overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-white font-mono text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Selection</th>
                    <th className="py-2.5 px-3">Cost Code</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Allocated Amount (MYR)</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {parentCCodes.map((cCodeObj) => {
                    const isExpanded = !!expandedCCodes[cCodeObj.code];
                    const childSCodes = getSCodesForCCode(cCodeObj.code);
                    return (
                      <React.Fragment key={cCodeObj.id}>
                        <tr onClick={() => toggleCCodeExpansion(cCodeObj.code)} className="bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer transition-colors">
                          <td colSpan={5} className="py-2 px-3 font-mono text-blue-800 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                              <span>C-{cCodeObj.code} - {cCodeObj.description}</span>
                            </span>
                          </td>
                        </tr>
                        {isExpanded && childSCodes.map((sCodeObj) => {
                          const isSelected = !!selectedBudget?.costCodeAllocations?.find((a) => a.id === sCodeObj.id || a.sCode === sCodeObj.code);
                          const alloc = selectedBudget?.costCodeAllocations?.find((a) => a.id === sCodeObj.id || a.sCode === sCodeObj.code);
                          return (
                            <tr key={sCodeObj.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-1.5 px-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (!selectedBudget) return;
                                    const allocations = [...(selectedBudget.costCodeAllocations || [])];
                                    if (e.target.checked) {
                                      allocations.push({
                                        id: sCodeObj.id,
                                        cCode: cCodeObj.code,
                                        cCodeDescription: cCodeObj.description,
                                        sCode: sCodeObj.code,
                                        sCodeDescription: sCodeObj.description,
                                        monthlyAmounts: {},
                                        totalAmount: 0,
                                      });
                                    } else {
                                      const idx = allocations.findIndex((a) => a.id === sCodeObj.id || a.sCode === sCodeObj.code);
                                      if (idx > -1) allocations.splice(idx, 1);
                                    }
                                    updateBudget(selectedBudget.id, { costCodeAllocations: allocations });
                                  }}
                                />
                              </td>
                              <td className="py-1.5 px-3 font-mono text-slate-700 text-[11px] font-bold">{sCodeObj.code}</td>
                              <td className="py-1.5 px-3 text-slate-800 font-medium">{sCodeObj.description}</td>
                              <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                                MYR {(alloc?.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-1.5 px-3 text-right">
                                <button
                                  onClick={() => {
                                    setActualCostModalSCode(sCodeObj.code);
                                    setIsActualCostModalOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded transition-colors"
                                >
                                  <Receipt className="w-3 h-3 text-amber-600" />
                                  <span>Record Cost</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MANPOWER COST */}
      {/* ========================================================================= */}
      {activeTab === 'manpower' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Manpower Cost Master Resources (Project {selectedProject.code})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Resource catalog retrieved from Manpower Cost Master for baseline budgeting.
                </p>
              </div>
              <span className="text-xs font-mono text-blue-700 font-bold">{manpowerCostResources.length} Resources</span>
            </div>
            <div className="border border-slate-200 rounded overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-mono text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Resource Name</th>
                    <th className="py-2.5 px-3">Classification</th>
                    <th className="py-2.5 px-3">Local / Foreigner</th>
                    <th className="py-2.5 px-3">Hour Type</th>
                    <th className="py-2.5 px-3">Cost Details</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {manpowerCostResources.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 font-semibold text-slate-900">{res.resourceName}</td>
                      <td className="py-2 px-3 text-slate-700">{res.classification || '—'}</td>
                      <td className="py-2 px-3 text-slate-700">{res.origin || '—'}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{res.hourType || '—'}</td>
                      <td className="py-2 px-3 text-slate-700">{res.costDetails || '—'}</td>
                      <td className="py-2 px-3 text-right">
                        <StatusBadge label={res.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: EQUIPMENT COST */}
      {/* ========================================================================= */}
      {activeTab === 'equipment' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Equipment Cost Master Resources (Project {selectedProject.code})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Resource catalog retrieved from Equipment Cost Master for baseline budgeting.
                </p>
              </div>
              <span className="text-xs font-mono text-blue-700 font-bold">{equipmentCostResources.length} Resources</span>
            </div>
            <div className="border border-slate-200 rounded overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-mono text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Resource Name</th>
                    <th className="py-2.5 px-3">UOM</th>
                    <th className="py-2.5 px-3">Hour Type</th>
                    <th className="py-2.5 px-3">Source Cost Code</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {equipmentCostResources.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 font-semibold text-slate-900">{res.resourceName}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{res.uom || '—'}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{res.hourType || '—'}</td>
                      <td className="py-2 px-3 font-mono font-bold text-blue-700">{res.sourceCostCode || '—'}</td>
                      <td className="py-2 px-3 text-right">
                        <StatusBadge label={res.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: MACHINERY COST */}
      {/* ========================================================================= */}
      {activeTab === 'machinery' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Machineries Cost Master Resources (Project {selectedProject.code})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Resource catalog retrieved from Machineries Cost Master for baseline budgeting.
                </p>
              </div>
              <span className="text-xs font-mono text-blue-700 font-bold">{machineriesCostResources.length} Resources</span>
            </div>
            <div className="border border-slate-200 rounded overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-mono sticky top-0 z-10 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Resource Name</th>
                    <th className="py-2.5 px-3">UOM</th>
                    <th className="py-2.5 px-3">C-Code</th>
                    <th className="py-2.5 px-3">Cost Details</th>
                    <th className="py-2.5 px-3">S-C-Code</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {machineriesCostResources.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2 px-3 font-semibold text-slate-900">{res.resourceName}</td>
                      <td className="py-2 px-3 font-mono text-slate-700">{res.uom || '—'}</td>
                      <td className="py-2 px-3 font-mono font-bold text-blue-700">{res.cCode || '—'}</td>
                      <td className="py-2 px-3 text-slate-700">{res.costDetails || '—'}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{res.sCCode || '—'}</td>
                      <td className="py-2 px-3 text-right">
                        <StatusBadge label={res.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: MONTHLY BUDGET PHASING */}
      {/* ========================================================================= */}
      {activeTab === 'phasing' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Monthly Budget Allocation Grid ({activeMonthColumns.length} Months)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Spreadsheet grid displaying S-Code monthly phasing projections.
                </p>
              </div>
              <span className="text-[11px] text-slate-400 italic font-mono">Editable Cell Allocation Grid</span>
            </div>

            <div className="border border-slate-200 rounded overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-white font-mono sticky top-0 z-10 text-[11px]">
                  <tr>
                    <th className="py-2 px-3 w-28">Cost Code</th>
                    <th className="py-2 px-3 min-w-[200px]">Cost Description</th>
                    {activeMonthColumns.map((m) => (
                      <th key={m} className="py-2 px-2 text-right w-24 whitespace-nowrap">
                        {m}
                      </th>
                    ))}
                    <th className="py-2 px-3 text-right w-32 font-bold">Total Allocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedBudget?.costCodeAllocations.map((alloc) => (
                    <tr key={alloc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-1.5 px-3 font-mono text-[11px] font-bold text-blue-700">{alloc.sCode}</td>
                      <td className="py-1.5 px-3 text-xs font-medium text-slate-900">{alloc.sCodeDescription}</td>
                      {activeMonthColumns.map((m) => (
                        <td key={m} className="py-1 px-1 text-right">
                          <input
                            type="number"
                            min="0"
                            value={alloc.monthlyAmounts[m] !== undefined ? alloc.monthlyAmounts[m] : ''}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              const newAllocations = selectedBudget.costCodeAllocations.map((a) =>
                                a.id === alloc.id
                                  ? {
                                      ...a,
                                      monthlyAmounts: { ...a.monthlyAmounts, [m]: val },
                                      totalAmount: Object.values({ ...a.monthlyAmounts, [m]: val }).reduce(
                                        (sum, v) => sum + (Number(v) || 0),
                                        0
                                      ),
                                    }
                                  : a
                              );
                              updateBudget(selectedBudget.id, {
                                costCodeAllocations: newAllocations,
                                totalBudget: newAllocations.reduce((sum, a) => sum + a.totalAmount, 0),
                              });
                            }}
                            className="w-full px-1 py-0.5 text-right font-mono border rounded text-xs tabular-nums border-slate-300 focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                      ))}
                      <td className="py-1.5 px-3 text-right font-bold text-xs font-mono tabular-nums text-slate-900">
                        MYR {alloc.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: RECORD ACTUAL COST & CONSUMPTION */}
      {/* ========================================================================= */}
      {activeTab === 'actuals' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Recorded Actual Expenditure Log (Project {selectedProject.code})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Listing of all recorded costs incurred against approved S-Code allocations.
                </p>
              </div>

              <button
                onClick={() => {
                  setActualCostModalSCode(null);
                  setIsActualCostModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded shadow-2xs transition-colors self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Record Actual Cost</span>
              </button>
            </div>

            <ListingTable
              data={projectActualCosts}
              columns={actualCostColumns}
              keyExtractor={(r) => r.id}
              searchPlaceholder="Search by S-Code, Description, or Reference..."
              searchableKeys={['sCode', 'sCodeDescription', 'reference', 'costMonth']}
              emptyStateTitle="No actual costs recorded for this project"
              emptyStateDescription="Click 'Record Actual Cost' to add expenditures incurred."
              rowActions={(r) => (
                <button
                  onClick={() => deleteActualCost(r.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  title="Remove record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: BUDGET VS ACTUAL VARIANCE MONITORING */}
      {/* ========================================================================= */}
      {activeTab === 'variance' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Cost Code-wise Budget Consumption &amp; Variance Analysis
                </h3>
                <p className="text-[11px] text-slate-500">
                  Line-item monitoring comparing Approved Budget baseline against Cumulative Actual Expenditure.
                </p>
              </div>

              <select
                value={costCodeCategoryFilter}
                onChange={(e) => setCostCodeCategoryFilter(e.target.value)}
                className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded font-medium"
              >
                <option value="all">All C-Codes</option>
                {parentCCodes.map((c) => (
                  <option key={c.id} value={c.code}>
                    C-{c.code} {c.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-white font-mono sticky top-0 z-10 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">C-Code</th>
                    <th className="py-2.5 px-3">S-Code</th>
                    <th className="py-2.5 px-3 min-w-[180px]">Cost Description</th>
                    <th className="py-2.5 px-3 text-right">Approved Budget (MYR)</th>
                    <th className="py-2.5 px-3 text-right">Actual Cost (MYR)</th>
                    <th className="py-2.5 px-3 text-right">Remaining Budget (MYR)</th>
                    <th className="py-2.5 px-3 text-right">% Consumed</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {costCodes
                    .filter((c) => c.level === 'S-Code')
                    .filter((c) => costCodeCategoryFilter === 'all' || c.parentCCode === costCodeCategoryFilter)
                    .map((sCodeObj) => {
                      // Approved S-Code budget allocation
                      const currentAlloc = selectedBudget?.costCodeAllocations?.find(
                        (a) => a.id === sCodeObj.id || a.sCode === sCodeObj.code
                      );
                      const sApproved = currentAlloc?.totalAmount || 0;

                      // Actual cost for this S-Code
                      const sActuals = projectActualCosts.filter((a) => a.sCode === sCodeObj.code);
                      const sActualTotal = sActuals.reduce((sum, a) => sum + (a.amount || 0), 0);

                      const remaining = sApproved - sActualTotal;
                      const pctConsumed = sApproved > 0 ? ((sActualTotal / sApproved) * 100).toFixed(1) : '0.0';

                      const isExceeded = sActualTotal > sApproved && sApproved > 0;
                      const isNearLimit = !isExceeded && sApproved > 0 && parseFloat(pctConsumed) >= 90;

                      return (
                        <tr
                          key={sCodeObj.id}
                          className={`hover:bg-slate-50 transition-colors ${
                            isExceeded ? 'bg-rose-50/60 font-medium' : isNearLimit ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          <td className="py-2 px-3 font-mono font-bold text-blue-700">
                            C-{sCodeObj.parentCCode}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">{sCodeObj.code}</td>
                          <td className="py-2 px-3 font-medium text-slate-900">{sCodeObj.description}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                            MYR {sApproved.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-amber-700 tabular-nums">
                            MYR {sActualTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td
                            className={`py-2 px-3 text-right font-mono font-bold tabular-nums ${
                              remaining < 0 ? 'text-rose-600 font-extrabold' : 'text-slate-900'
                            }`}
                          >
                            MYR {remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                            {pctConsumed}%
                          </td>
                          <td className="py-2 px-3 text-center">
                            {isExceeded ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold text-rose-800 bg-rose-100 border border-rose-300 rounded font-mono">
                                <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                Budget Exceeded
                              </span>
                            ) : isNearLimit ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 rounded font-mono">
                                Near Limit
                              </span>
                            ) : sApproved > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded font-mono">
                                Within Budget
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-mono">Unallocated</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: BUDGET APPROVAL */}
      {/* ========================================================================= */}
      {activeTab === 'approval' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-2 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Single-Level Approval Workflow:</span> Proposed Draft → Submitted → Approved / Rejected.
              <p className="text-[11px] text-amber-700 mt-0.5">
                Approving this budget updates the Project Master approved budget baseline.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Approval Status for Project {selectedProject.code} ({selectedBudget?.revision || 'REV-00'})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Review calculated allocations and execute single-level approval decision.
                </p>
              </div>

              {selectedBudget && <StatusBadge label={selectedBudget.status} />}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded border border-slate-200 font-mono">
              <div>
                <span className="text-slate-400 text-[11px] block">Project Code:</span>
                <p className="font-bold text-blue-800 text-sm">{selectedProject.code}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Proposed Total Budget:</span>
                <p className="font-bold text-slate-900 text-sm">
                  MYR {calcBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Approval Date:</span>
                <p className="text-slate-700">{selectedBudget?.approvedDate || 'Pending Approval'}</p>
              </div>
            </div>

            {selectedBudget?.status === 'Submitted' && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleApproveBudget}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors shadow-2xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve Project Budget</span>
                </button>

                <button
                  onClick={() => setRejectionModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Reject &amp; Return to Draft</span>
                </button>
              </div>
            )}

            {selectedBudget?.status === 'Approved' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  This budget is approved and active in Project Master ({selectedBudget.approvedDate} by {selectedBudget.approvedBy || 'Designated Approver'}).
                </span>
              </div>
            )}

            {selectedBudget?.status === 'Draft' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900 flex items-center justify-between">
                <span>Budget is currently in Draft state. Submit for approval when allocations are complete.</span>
                <button
                  onClick={() => {
                    updateBudget(selectedBudget.id, { status: 'Submitted' });
                    showToast('Budget submitted for approval', 'success');
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shrink-0"
                >
                  Submit for Approval
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 10: BUDGET REVISION HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'revision' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Revision History for Project {selectedProject.code}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Audited list of all historical and active budget revisions (REV-xx).
                </p>
              </div>

              <button
                onClick={handleCreateRevision}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded shadow-2xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Initiate Revision</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold font-mono">
                  <tr>
                    <th className="py-2.5 px-3">Revision</th>
                    <th className="py-2.5 px-3">Ref No</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Total Budget (MYR)</th>
                    <th className="py-2.5 px-3">Approved Date</th>
                    <th className="py-2.5 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projectBudgets.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-bold border border-slate-300">
                          {b.revision || 'REV-00'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{b.refNo || b.id}</td>
                      <td className="py-2.5 px-3">
                        <StatusBadge label={b.status} />
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 tabular-nums">
                        MYR {b.totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{b.approvedDate || '—'}</td>
                      <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate">{b.jobScope || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <BudgetCreationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        initialProjectId={selectedProjectId}
      />

      <RecordActualCostModal
        isOpen={isActualCostModalOpen}
        onClose={() => setIsActualCostModalOpen(false)}
        initialProjectId={selectedProjectId}
        initialSCode={actualCostModalSCode}
      />

      {/* Rejection Modal Dialog */}
      {rejectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Reject Budget Proposal</span>
            </h3>

            <p className="text-xs text-slate-600">
              Mandatory rejection reason required before returning budget proposal to Draft state.
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Specify rejection reason or requested cost code adjustments..."
              rows={3}
              className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-amber-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRejectionModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectBudget}
                className="px-3 py-1.5 text-xs text-white bg-amber-600 hover:bg-amber-700 rounded font-medium transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
