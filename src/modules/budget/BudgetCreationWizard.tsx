/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ProjectRecord, CostCode, BudgetCostCodeAllocation } from '../../types';
import { ConfirmationRequiredBadge } from '../../components/common/ConfirmationRequiredBadge';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Building2,
  Calendar,
  DollarSign,
  Layers,
  Calculator,
  Sliders,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialProjectId?: string | null;
  onBudgetCreated?: (newBudgetId: string, projectId: string) => void;
}

export const BudgetCreationWizard: React.FC<Props> = ({
  isOpen,
  onClose,
  initialProjectId,
  onBudgetCreated,
}) => {
  const { projects, costCodes, addBudget, showToast } = useAppStore();

  // Wizard Step State (1 to 5)
  const [step, setStep] = useState<number>(1);

  // Step 1: Selected Project ID
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || '');

  // Step 2: Selected S-Code IDs
  const [selectedSCodeIds, setSelectedSCodeIds] = useState<Set<string>>(new Set());

  // Step 3: S-Code Proposed Budget Amounts (Map S-Code ID -> amount number or string)
  const [sCodeAmounts, setSCodeAmounts] = useState<Record<string, string>>({});

  // Step 4: Phasing Methods & Custom Monthly Amounts
  // S-Code ID -> Phasing method
  const [sCodePhasingMethods, setSCodePhasingMethods] = useState<Record<string, 'Even' | 'Front-loaded' | 'S-curve' | 'Back-loaded' | 'Custom'>>({});
  // S-Code ID -> Record<MonthString, amountNumber>
  const [sCodeMonthlyAllocations, setSCodeMonthlyAllocations] = useState<Record<string, Record<string, number>>>({});

  // Additional Metadata
  const [refNo, setRefNo] = useState<string>('');
  const [jobScope, setJobScope] = useState<string>('');

  // Parent C-Codes
  const parentCCodes = useMemo(
    () => costCodes.filter((c) => c.level === 'C-Code'),
    [costCodes]
  );

  // Helper to group child S-Codes under each C-Code
  const getSCodesForCCode = (cCodeStr: string): CostCode[] => {
    return costCodes.filter((c) => c.level === 'S-Code' && c.parentCCode === cCodeStr);
  };

  // Find selected project record
  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  // Derive Month Columns from selected project dates
  const monthColumns = useMemo(() => {
    if (!selectedProject) return [];
    const startStr = selectedProject.startDate;
    const compStr = selectedProject.completion || selectedProject.constructionCompletionDate;

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
  }, [selectedProject]);

  // Selected S-Code CostCode objects
  const selectedSCodes = useMemo(() => {
    return costCodes.filter((c) => c.level === 'S-Code' && selectedSCodeIds.has(c.id));
  }, [costCodes, selectedSCodeIds]);

  // Calculate totals for Step 3 & Step 5
  const sCodeProposedTotals = useMemo(() => {
    const map: Record<string, number> = {};
    selectedSCodes.forEach((s) => {
      const val = parseFloat(sCodeAmounts[s.id] || '0');
      map[s.id] = isNaN(val) ? 0 : val;
    });
    return map;
  }, [selectedSCodes, sCodeAmounts]);

  const cCodeSubtotals = useMemo(() => {
    const map: Record<string, number> = {};
    parentCCodes.forEach((c) => {
      map[c.code] = 0;
    });
    selectedSCodes.forEach((s) => {
      const amt = sCodeProposedTotals[s.id] || 0;
      if (s.parentCCode) {
        map[s.parentCCode] = (map[s.parentCCode] || 0) + amt;
      }
    });
    return map;
  }, [parentCCodes, selectedSCodes, sCodeProposedTotals]);

  const totalProjectBudget = useMemo(() => {
    return Object.values(sCodeProposedTotals).reduce((sum, v) => sum + v, 0);
  }, [sCodeProposedTotals]);

  // Phasing helper calculation
  const calculatePhasedMonthly = (
    totalAmt: number,
    method: 'Even' | 'Front-loaded' | 'S-curve' | 'Back-loaded' | 'Custom',
    months: string[]
  ): Record<string, number> => {
    if (months.length === 0 || totalAmt <= 0) return {};
    const count = months.length;
    const result: Record<string, number> = {};

    let weights: number[] = [];

    if (method === 'Even') {
      weights = new Array(count).fill(1);
    } else if (method === 'Front-loaded') {
      weights = months.map((_, i) => count - i);
    } else if (method === 'Back-loaded') {
      weights = months.map((_, i) => i + 1);
    } else if (method === 'S-curve') {
      // Gaussian bell shape approximation
      weights = months.map((_, i) => {
        const x = (i / Math.max(1, count - 1)) * 4 - 2; // -2 to +2
        return Math.exp(-0.5 * x * x);
      });
    } else {
      // Custom - keep existing or split evenly
      weights = new Array(count).fill(1);
    }

    const weightSum = weights.reduce((sum, w) => sum + w, 0);
    let allocatedSum = 0;

    months.forEach((m, idx) => {
      if (idx === count - 1) {
        // Last month absorbs rounding remainder
        result[m] = Math.round((totalAmt - allocatedSum) * 100) / 100;
      } else {
        const val = Math.round(((totalAmt * weights[idx]) / weightSum) * 100) / 100;
        result[m] = val;
        allocatedSum += val;
      }
    });

    return result;
  };

  // Step 4: Apply Phasing to S-Code
  const handleApplyPhasingMethod = (sCodeId: string, method: 'Even' | 'Front-loaded' | 'S-curve' | 'Back-loaded' | 'Custom') => {
    setSCodePhasingMethods((prev) => ({ ...prev, [sCodeId]: method }));
    const totalProposed = sCodeProposedTotals[sCodeId] || 0;
    if (method !== 'Custom') {
      const phasedMap = calculatePhasedMonthly(totalProposed, method, monthColumns);
      setSCodeMonthlyAllocations((prev) => ({ ...prev, [sCodeId]: phasedMap }));
    }
  };

  // Step 4: Handle Global Phasing preset apply
  const handleApplyGlobalPhasing = (method: 'Even' | 'Front-loaded' | 'S-curve' | 'Back-loaded') => {
    const nextMethods: Record<string, 'Even' | 'Front-loaded' | 'S-curve' | 'Back-loaded' | 'Custom'> = {};
    const nextMonthly: Record<string, Record<string, number>> = {};

    selectedSCodes.forEach((s) => {
      nextMethods[s.id] = method;
      const totalProposed = sCodeProposedTotals[s.id] || 0;
      nextMonthly[s.id] = calculatePhasedMonthly(totalProposed, method, monthColumns);
    });

    setSCodePhasingMethods(nextMethods);
    setSCodeMonthlyAllocations(nextMonthly);
    showToast(`Applied ${method} phasing to all selected S-Codes`, 'info');
  };

  // Toggle S-Code Selection
  const toggleSCode = (sId: string) => {
    setSelectedSCodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(sId)) {
        next.delete(sId);
      } else {
        next.add(sId);
      }
      return next;
    });
  };

  // Toggle All S-Codes under a C-Code
  const toggleAllSCodesUnderCCode = (cCodeStr: string) => {
    const children = getSCodesForCCode(cCodeStr);
    const childIds = children.map((c) => c.id);
    const allSelected = childIds.every((id) => selectedSCodeIds.has(id));

    setSelectedSCodeIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        childIds.forEach((id) => next.delete(id));
      } else {
        childIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  // Handle Submission of Budget
  const handleSubmitBudget = (asStatus: 'Draft' | 'Submitted') => {
    if (!selectedProject) {
      showToast('Please select a project first', 'error');
      return;
    }
    if (selectedSCodes.length === 0) {
      showToast('Please select at least one S-Code', 'error');
      return;
    }

    const allocations: BudgetCostCodeAllocation[] = selectedSCodes.map((s) => {
      const parent = parentCCodes.find((p) => p.code === s.parentCCode);
      const totalAmt = sCodeProposedTotals[s.id] || 0;
      const method = sCodePhasingMethods[s.id] || 'Even';
      const monthly = sCodeMonthlyAllocations[s.id] || calculatePhasedMonthly(totalAmt, method, monthColumns);

      return {
        id: s.id,
        cCode: s.parentCCode || '1001',
        cCodeDescription: parent?.description || 'Cost Category',
        sCode: s.code,
        sCodeDescription: s.description,
        monthlyAmounts: monthly,
        totalAmount: totalAmt,
        phasingMethod: method,
      };
    });

    const generatedRefNo = refNo.trim() || `BDG-${selectedProject.code}-REV00`;

    const newBudget = addBudget({
      refNo: generatedRefNo,
      projectId: selectedProject.id,
      projectCode: selectedProject.code,
      projectName: selectedProject.name,
      projectUnder: selectedProject.projectUnder || 'Direct Contract',
      client: selectedProject.customerName || 'Client',
      startDate: selectedProject.startDate || '15-Jan-2026',
      status: asStatus,
      projectIncharge: selectedProject.projectManager || 'MR.MANIMARAN',
      jobScope: jobScope.trim() || selectedProject.jobScope || 'Baseline budget allocation',
      revision: 'REV-00',
      totalBudget: totalProjectBudget,
      monthlyColumns: monthColumns,
      costCodeAllocations: allocations,
    });

    onClose();
    if (onBudgetCreated) {
      onBudgetCreated(newBudget.id, selectedProject.id);
    }
    showToast(
      `Budget proposal created successfully (${newBudget.revision} - ${asStatus})`,
      'success'
    );
  };

  if (!isOpen) return null;

  const projectValue = selectedProject?.projectValue ?? selectedProject?.contractValue ?? null;
  const expectedProfit = projectValue != null ? projectValue - totalProjectBudget : null;
  const expectedProfitPct =
    projectValue != null && projectValue > 0
      ? ((expectedProfit! / projectValue) * 100).toFixed(2)
      : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-5xl my-auto flex flex-col max-h-[92vh] overflow-hidden">
        {/* Wizard Header Bar */}
        <div className="bg-slate-900 text-white p-4 sm:px-6 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Project Budget Creation Wizard
              </h2>
              <span className="text-xs bg-blue-900/80 text-blue-300 font-mono px-2 py-0.5 rounded border border-blue-700">
                5-Step Standard Flow
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Formulate project budget proposal at S-Code level with monthly cash flow phasing.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors font-bold"
            title="Close Wizard"
          >
            ✕
          </button>
        </div>

        {/* Wizard Stepper Progress Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 py-3 shrink-0">
          <div className="flex items-center justify-between gap-1 max-w-3xl mx-auto">
            {[
              { num: 1, label: '1. Project Selection', icon: Building2 },
              { num: 2, label: '2. Cost Codes', icon: Layers },
              { num: 3, label: '3. Budget Amounts', icon: DollarSign },
              { num: 4, label: '4. Monthly Phasing', icon: Calendar },
              { num: 5, label: '5. Review & Submit', icon: CheckCircle2 },
            ].map((st, idx) => {
              const isActive = step === st.num;
              const isCompleted = step > st.num;
              return (
                <React.Fragment key={st.num}>
                  <button
                    onClick={() => {
                      if (st.num < step || (st.num === 2 && selectedProject)) {
                        setStep(st.num);
                      }
                    }}
                    disabled={st.num > step && (!selectedProject || (st.num >= 3 && selectedSCodeIds.size === 0))}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : isCompleted
                        ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                        : 'text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${
                        isActive
                          ? 'bg-white text-blue-600'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-300 text-slate-600'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : st.num}
                    </span>
                    <span className="hidden md:inline">{st.label.split('. ')[1]}</span>
                  </button>
                  {idx < 4 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Wizard Body Scrollable Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: PROJECT SELECTION */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-lg text-xs text-blue-950 flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Step 1: Project Selection</span>
                  <p className="text-blue-800 mt-0.5">
                    Select an existing project from Project Master. Project details (Code, Client, Manager, Start Date, Completion Date, and Project Value) will populate automatically.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 font-mono">
                  Select Project *
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    const proj = projects.find((p) => p.id === e.target.value);
                    if (proj) {
                      setRefNo(`BDG-${proj.code}-REV00`);
                    }
                  }}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose Existing Project Record --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name} (Client: {p.customerName || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProject ? (
                <div className="bg-slate-900 text-white rounded-lg p-4 space-y-3 border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono text-xs text-blue-400 font-bold bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                      Project Code: {selectedProject.code}
                    </span>
                    <span className="text-xs text-slate-400">Project Master Record</span>
                  </div>

                  <h3 className="text-sm font-bold text-white">{selectedProject.name}</h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono pt-1">
                    <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
                      <span className="text-slate-400 text-[11px] block">Client Name</span>
                      <span className="text-slate-200 font-semibold">{selectedProject.customerName || 'CAHYA MATA'}</span>
                    </div>

                    <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
                      <span className="text-slate-400 text-[11px] block">Project Manager</span>
                      <span className="text-slate-200 font-semibold">{selectedProject.projectManager || 'MR.MANIMARAN'}</span>
                    </div>

                    <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
                      <span className="text-slate-400 text-[11px] block">Project Value (MYR)</span>
                      <span className="text-emerald-400 font-bold">
                        {selectedProject.projectValue != null || selectedProject.contractValue != null
                          ? `MYR ${(selectedProject.projectValue ?? selectedProject.contractValue!).toLocaleString()}`
                          : '—'}
                      </span>
                    </div>

                    <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
                      <span className="text-slate-400 text-[11px] block">Start Date</span>
                      <span className="text-slate-200">{selectedProject.startDate || '15-Jan-2026'}</span>
                    </div>

                    <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
                      <span className="text-slate-400 text-[11px] block">Construction Completion Date</span>
                      <span className="text-slate-200">
                        {selectedProject.constructionCompletionDate || selectedProject.completion || '30-Apr-2026'}
                      </span>
                    </div>

                    <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
                      <span className="text-slate-400 text-[11px] block">Revised Completion Date</span>
                      <span className="text-slate-200">{selectedProject.revisedCompletionDate || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-lg text-xs text-slate-500">
                  Please select a project above to inspect master details and proceed to cost code selection.
                </div>
              )}

              {selectedProject && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                      Budget Proposal Ref No
                    </label>
                    <input
                      type="text"
                      value={refNo}
                      onChange={(e) => setRefNo(e.target.value)}
                      placeholder={`e.g. BDG-${selectedProject.code}-REV00`}
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Job Scope &amp; Budget Baseline Notes
                    </label>
                    <input
                      type="text"
                      value={jobScope}
                      onChange={(e) => setJobScope(e.target.value)}
                      placeholder="e.g. Approved baseline budget proposal for execution"
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: COST CODE SELECTION */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-lg text-xs text-blue-950 flex items-start gap-2.5">
                <Layers className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Step 2: Cost Code Selection (2-Level Hierarchy)</span>
                  <p className="text-blue-800 mt-0.5">
                    Select the applicable Sub-Cost Categories (S-Codes) under their Parent Cost Categories (C-Codes).
                    <span className="font-semibold block mt-0.5 text-blue-900">
                      * Crucial Rule: Budget allocation occurs strictly at S-Code level. Parent C-Codes act as aggregator categories.
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-100 p-2.5 rounded border border-slate-200 text-xs font-mono">
                <span className="text-slate-700 font-semibold">
                  Selected S-Codes: <span className="text-blue-700 font-bold">{selectedSCodeIds.size}</span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const allS = costCodes.filter((c) => c.level === 'S-Code').map((c) => c.id);
                      setSelectedSCodeIds(new Set(allS));
                    }}
                    className="px-2.5 py-1 text-[11px] bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Select All S-Codes
                  </button>
                  <button
                    onClick={() => setSelectedSCodeIds(new Set())}
                    className="px-2.5 py-1 text-[11px] bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>

              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                {parentCCodes.map((cCodeObj) => {
                  const childSCodes = getSCodesForCCode(cCodeObj.code);
                  const selectedChildCount = childSCodes.filter((s) => selectedSCodeIds.has(s.id)).length;
                  const allChildSelected = childSCodes.length > 0 && selectedChildCount === childSCodes.length;

                  return (
                    <div key={cCodeObj.id} className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                      <div className="bg-slate-900 text-white p-2.5 px-3 flex items-center justify-between font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={allChildSelected}
                            onChange={() => toggleAllSCodesUnderCCode(cCodeObj.code)}
                            className="rounded text-blue-500 focus:ring-blue-400"
                          />
                          <span className="font-bold text-blue-400">C-{cCodeObj.code}</span>
                          <span className="font-semibold">{cCodeObj.description}</span>
                        </div>

                        <span className="text-[11px] text-slate-300">
                          {selectedChildCount} of {childSCodes.length} S-Codes selected
                        </span>
                      </div>

                      <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50/50">
                        {childSCodes.map((sCodeObj) => {
                          const isChecked = selectedSCodeIds.has(sCodeObj.id);
                          return (
                            <label
                              key={sCodeObj.id}
                              className={`flex items-start gap-2.5 p-2 rounded border text-xs cursor-pointer transition-colors ${
                                isChecked
                                  ? 'bg-blue-50/80 border-blue-300 text-blue-950 font-medium'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSCode(sCodeObj.id)}
                                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                              />
                              <div>
                                <span className="font-mono font-bold text-blue-700 block text-[11px]">
                                  {sCodeObj.code}
                                </span>
                                <span className="text-slate-900 leading-tight block">
                                  {sCodeObj.description}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: BUDGET AMOUNT ENTRY */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-lg text-xs text-blue-950 flex items-start gap-2.5">
                <DollarSign className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Step 3: Proposed Budget Amount Entry (S-Code Level)</span>
                  <p className="text-blue-800 mt-0.5">
                    Enter proposed budget amounts against each selected S-Code. C-Code subtotals and overall project budget total update dynamically.
                    <span className="font-semibold block text-blue-950 mt-0.5">
                      Currency: MYR (RM). Keep amounts blank until entered by user.
                    </span>
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white max-h-[420px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900 text-white font-mono sticky top-0 z-10 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Parent C-Code</th>
                      <th className="py-2.5 px-3">S-Code</th>
                      <th className="py-2.5 px-3 min-w-[200px]">Cost Description</th>
                      <th className="py-2.5 px-3 text-right w-44">Proposed Budget (MYR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {parentCCodes.map((cCodeObj) => {
                      const childSCodes = selectedSCodes.filter((s) => s.parentCCode === cCodeObj.code);
                      if (childSCodes.length === 0) return null;

                      const cSubtotal = cCodeSubtotals[cCodeObj.code] || 0;

                      return (
                        <React.Fragment key={cCodeObj.id}>
                          <tr className="bg-slate-100 font-bold font-mono text-slate-800">
                            <td colSpan={3} className="py-2 px-3 text-blue-800">
                              C-{cCodeObj.code} - {cCodeObj.description} Subtotal:
                            </td>
                            <td className="py-2 px-3 text-right text-blue-900 tabular-nums font-bold">
                              MYR {cSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>

                          {childSCodes.map((sCodeObj) => (
                            <tr key={sCodeObj.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">
                                C-{cCodeObj.code}
                              </td>
                              <td className="py-2 px-3 font-mono font-bold text-blue-700">
                                {sCodeObj.code}
                              </td>
                              <td className="py-2 px-3 font-semibold text-slate-900">
                                {sCodeObj.description}
                              </td>
                              <td className="py-1.5 px-3 text-right">
                                <div className="relative inline-block w-full">
                                  <span className="absolute left-2.5 top-2 font-mono text-slate-400 text-[11px]">
                                    RM
                                  </span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="100"
                                    placeholder="0.00"
                                    value={sCodeAmounts[sCodeObj.id] || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setSCodeAmounts((prev) => ({ ...prev, [sCodeObj.id]: val }));
                                    }}
                                    className="w-full text-right pl-9 pr-2 py-1.5 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 tabular-nums"
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-900 text-white font-mono text-xs sticky bottom-0 z-10">
                    <tr>
                      <td colSpan={3} className="py-3 px-3 font-bold text-right uppercase tracking-wider">
                        Total Project Budget:
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-400 tabular-nums text-sm">
                        MYR {totalProjectBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* STEP 4: MONTHLY BUDGET PHASING */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-lg text-xs text-blue-950 flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Step 4: Monthly Budget Cash Flow Phasing</span>
                  <p className="text-blue-800 mt-0.5">
                    Allocate monthly cash flow forecast across project months derived from project start and completion dates ({monthColumns.length} Months: {monthColumns.join(', ')}).
                  </p>
                  {(!selectedProject?.startDate || !selectedProject?.completion) && (
                    <div className="mt-1">
                      <ConfirmationRequiredBadge text="Client Confirmation Required" detail="Monthly phasing structure requires project-date confirmation." />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 font-mono">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>Apply Phasing Preset to All S-Codes:</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(['Even', 'Front-loaded', 'S-curve', 'Back-loaded'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => handleApplyGlobalPhasing(m)}
                      className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 hover:bg-blue-50 hover:border-blue-400 rounded text-slate-800 transition-colors shadow-2xs"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-[420px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900 text-white font-mono sticky top-0 z-10 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 w-24">S-Code</th>
                      <th className="py-2.5 px-3 min-w-[160px]">Description</th>
                      <th className="py-2.5 px-3 w-28">Method</th>
                      <th className="py-2.5 px-3 text-right w-28">Proposed Budget</th>
                      {monthColumns.map((m) => (
                        <th key={m} className="py-2.5 px-2 text-right w-24 whitespace-nowrap">
                          {m}
                        </th>
                      ))}
                      <th className="py-2.5 px-3 text-right w-28 font-bold">Sum Monthly</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedSCodes.map((sCodeObj) => {
                      const totalProposed = sCodeProposedTotals[sCodeObj.id] || 0;
                      const method = sCodePhasingMethods[sCodeObj.id] || 'Even';
                      const monthlyMap = sCodeMonthlyAllocations[sCodeObj.id] || calculatePhasedMonthly(totalProposed, method, monthColumns);

                      const sumMonthly = Object.values(monthlyMap).reduce((sum, v) => sum + (v || 0), 0);
                      const isReconciled = Math.abs(sumMonthly - totalProposed) < 1;

                      return (
                        <tr key={sCodeObj.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2 px-3 font-mono font-bold text-blue-700">{sCodeObj.code}</td>
                          <td className="py-2 px-3 font-medium text-slate-900">{sCodeObj.description}</td>

                          <td className="py-1 px-2">
                            <select
                              value={method}
                              onChange={(e) =>
                                handleApplyPhasingMethod(
                                  sCodeObj.id,
                                  e.target.value as any
                                )
                              }
                              className="w-full text-[11px] p-1 bg-white border border-slate-300 rounded font-semibold text-slate-800"
                            >
                              <option value="Even">Even</option>
                              <option value="Front-loaded">Front-loaded</option>
                              <option value="S-curve">S-curve</option>
                              <option value="Back-loaded">Back-loaded</option>
                              <option value="Custom">Custom</option>
                            </select>
                          </td>

                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                            MYR {totalProposed.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>

                          {monthColumns.map((m) => (
                            <td key={m} className="py-1 px-1 text-right">
                              <input
                                type="number"
                                min="0"
                                value={monthlyMap[m] !== undefined ? monthlyMap[m] : ''}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  const nextMonthly = { ...monthlyMap, [m]: val };
                                  setSCodePhasingMethods((prev) => ({ ...prev, [sCodeObj.id]: 'Custom' }));
                                  setSCodeMonthlyAllocations((prev) => ({ ...prev, [sCodeObj.id]: nextMonthly }));
                                }}
                                className="w-full text-right p-1 font-mono text-[11px] font-bold border rounded bg-white tabular-nums border-slate-300 focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                          ))}

                          <td className={`py-2 px-3 text-right font-mono font-bold tabular-nums ${isReconciled ? 'text-emerald-700' : 'text-rose-600 font-extrabold'}`}>
                            MYR {sumMonthly.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW AND SUBMIT */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-lg text-xs text-emerald-950 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Step 5: Consolidated Review &amp; Approval Submission</span>
                  <p className="text-emerald-800 mt-0.5">
                    Review all project metadata, S-Code budget allocations, C-Code subtotals, and cash flow phasing prior to submitting for single-level workflow approval.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="bg-slate-900 text-white p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Project Value</span>
                  <span className="text-white font-bold text-sm">
                    {projectValue != null ? `MYR ${projectValue.toLocaleString()}` : '—'}
                  </span>
                </div>

                <div className="bg-slate-900 text-white p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Total Proposed Budget</span>
                  <span className="text-blue-400 font-bold text-sm">
                    MYR {totalProjectBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="bg-slate-900 text-white p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[11px] block flex items-center justify-between">
                    <span>Expected Profit</span>
                  </span>
                  <span className={`font-bold text-sm ${expectedProfit != null && expectedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {expectedProfit != null ? `MYR ${expectedProfit.toLocaleString()}` : '—'}
                  </span>
                  <div className="mt-1">
                    <ConfirmationRequiredBadge variant="proposed" text="Proposed – Pending Client Validation" />
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Expected Profit Margin</span>
                  <span className="text-amber-400 font-bold text-sm">
                    {expectedProfitPct != null ? `${expectedProfitPct}%` : '—'}
                  </span>
                  <div className="mt-1">
                    <ConfirmationRequiredBadge variant="proposed" text="Proposed – Pending Client Validation" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 text-sm">
                    [{selectedProject?.code}] {selectedProject?.name}
                  </span>
                  <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-300">
                    Ref: {refNo || `BDG-${selectedProject?.code}-REV00`}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700 pt-1">
                  <div>Client: <strong className="text-slate-900">{selectedProject?.customerName || 'CAHYA MATA'}</strong></div>
                  <div>Manager: <strong className="text-slate-900">{selectedProject?.projectManager || 'MR.MANIMARAN'}</strong></div>
                  <div>Start: <strong className="text-slate-900">{selectedProject?.startDate || '15-Jan-2026'}</strong></div>
                  <div>Completion: <strong className="text-slate-900">{selectedProject?.completion || '30-Apr-2026'}</strong></div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white max-h-[300px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900 text-white font-mono text-[11px] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">C-Code</th>
                      <th className="py-2.5 px-3">S-Code</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Phasing Method</th>
                      <th className="py-2.5 px-3 text-right">Proposed Budget (MYR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {parentCCodes.map((cCodeObj) => {
                      const childSCodes = selectedSCodes.filter((s) => s.parentCCode === cCodeObj.code);
                      if (childSCodes.length === 0) return null;
                      const cSubtotal = cCodeSubtotals[cCodeObj.code] || 0;

                      return (
                        <React.Fragment key={cCodeObj.id}>
                          <tr className="bg-slate-100 font-bold font-mono text-slate-900">
                            <td colSpan={4} className="py-2 px-3 text-blue-800">
                              C-{cCodeObj.code} - {cCodeObj.description} Subtotal:
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-blue-900 tabular-nums">
                              MYR {cSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                          {childSCodes.map((s) => (
                            <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">C-{cCodeObj.code}</td>
                              <td className="py-2 px-3 font-mono font-bold text-blue-700">{s.code}</td>
                              <td className="py-2 px-3 text-slate-900 font-medium">{s.description}</td>
                              <td className="py-2 px-3 font-mono text-slate-600">{sCodePhasingMethods[s.id] || 'Even'}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                                MYR {(sCodeProposedTotals[s.id] || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 sm:px-6 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              if (step > 1) setStep(step - 1);
            }}
            disabled={step === 1}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <div className="flex items-center gap-2">
            {step < 5 ? (
              <button
                onClick={() => {
                  if (step === 1 && !selectedProject) {
                    showToast('Please select a project before continuing', 'error');
                    return;
                  }
                  if (step === 2 && selectedSCodeIds.size === 0) {
                    showToast('Please select at least one S-Code before continuing', 'error');
                    return;
                  }
                  setStep(step + 1);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-2xs"
              >
                <span>Continue to Step {step + 1}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleSubmitBudget('Draft')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-800 bg-slate-200 hover:bg-slate-300 rounded transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Save as Draft</span>
                </button>
                <button
                  onClick={() => handleSubmitBudget('Submitted')}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Submit Budget Proposal</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
