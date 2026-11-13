/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ConfirmationRequiredBadge } from '../../components/common/ConfirmationRequiredBadge';
import {
  Receipt,
  AlertTriangle,
  Building2,
  Layers,
  FileText,
  DollarSign,
  Calendar,
  Paperclip,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialProjectId?: string | null;
  initialSCode?: string | null;
}

export const RecordActualCostModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialProjectId,
  initialSCode,
}) => {
  const { projects, costCodes, budgets, actualCosts, addActualCost, showToast } = useAppStore();

  const [projectId, setProjectId] = useState<string>(initialProjectId || '');
  const [cCode, setCCode] = useState<string>('');
  const [sCode, setSCode] = useState<string>(initialSCode || '');
  const [amount, setAmount] = useState<string>('');
  const [costMonth, setCostMonth] = useState<string>('Jan-26');
  const [reference, setReference] = useState<string>('');
  const [documentName, setDocumentName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Parent C-Codes
  const parentCCodes = useMemo(
    () => costCodes.filter((c) => c.level === 'C-Code'),
    [costCodes]
  );

  // Child S-Codes restricted to selected C-Code
  const availableSCodes = useMemo(() => {
    if (!cCode) return costCodes.filter((c) => c.level === 'S-Code');
    return costCodes.filter((c) => c.level === 'S-Code' && c.parentCCode === cCode);
  }, [costCodes, cCode]);

  // Selected Project
  const selectedProject = useMemo(() => {
    if (!projectId) return null;
    return projects.find((p) => p.id === projectId) || null;
  }, [projects, projectId]);

  // Active Approved budget for selected project
  const activeApprovedBudget = useMemo(() => {
    if (!projectId) return null;
    const projBudgets = budgets.filter((b) => b.projectId === projectId);
    // Find latest approved budget
    const approved = projBudgets.find((b) => b.status === 'Approved');
    if (approved) return approved;
    return projBudgets[0] || null; // fallback to latest draft/submitted
  }, [budgets, projectId]);

  // Check if project budget is approved
  const isBudgetApproved = activeApprovedBudget?.status === 'Approved';

  // Budget position calculation for selected S-Code
  const budgetPosition = useMemo(() => {
    if (!selectedProject || !sCode) {
      return {
        approvedSCodeBudget: 0,
        previouslyRecordedActualCost: 0,
        currentEntryAmount: 0,
        updatedCumulativeActualCost: 0,
        remainingBudget: 0,
        isExceeded: false,
        excessAmount: 0,
      };
    }

    const currentSCodeObj = costCodes.find((c) => c.code === sCode || c.id === sCode);
    const targetSCodeStr = currentSCodeObj ? currentSCodeObj.code : sCode;

    // 1. Approved S-Code budget
    let approvedSCodeBudget = 0;
    if (activeApprovedBudget && isBudgetApproved) {
      const alloc = activeApprovedBudget.costCodeAllocations.find(
        (a) => a.sCode === targetSCodeStr || a.id === currentSCodeObj?.id
      );
      if (alloc) {
        approvedSCodeBudget = alloc.totalAmount || 0;
      }
    }

    // 2. Previously recorded actual cost for this project and S-Code
    const prevActuals = actualCosts.filter(
      (a) => a.projectId === projectId && a.sCode === targetSCodeStr
    );
    const previouslyRecordedActualCost = prevActuals.reduce((sum, a) => sum + (a.amount || 0), 0);

    // 3. Current entry amount
    const currentEntryAmount = parseFloat(amount || '0') || 0;

    // 4. Updated Cumulative Actual Cost
    const updatedCumulativeActualCost = previouslyRecordedActualCost + currentEntryAmount;

    // 5. Remaining Budget
    const remainingBudget = approvedSCodeBudget - updatedCumulativeActualCost;

    // 6. Exceeded check
    const isExceeded = updatedCumulativeActualCost > approvedSCodeBudget && approvedSCodeBudget > 0;
    const excessAmount = isExceeded ? updatedCumulativeActualCost - approvedSCodeBudget : 0;

    return {
      approvedSCodeBudget,
      previouslyRecordedActualCost,
      currentEntryAmount,
      updatedCumulativeActualCost,
      remainingBudget,
      isExceeded,
      excessAmount,
    };
  }, [selectedProject, sCode, costCodes, activeApprovedBudget, isBudgetApproved, actualCosts, amount, projectId]);

  // Handle Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectId || !selectedProject) {
      showToast('Please select a project', 'error');
      return;
    }
    if (!cCode) {
      showToast('Please select a parent C-Code', 'error');
      return;
    }
    if (!sCode) {
      showToast('Please select an S-Code', 'error');
      return;
    }
    const costVal = parseFloat(amount);
    if (isNaN(costVal) || costVal <= 0) {
      showToast('Please enter a valid actual cost amount (> MYR 0)', 'error');
      return;
    }

    const cCodeObj = parentCCodes.find((c) => c.code === cCode || c.id === cCode);
    const sCodeObj = availableSCodes.find((s) => s.code === sCode || s.id === sCode);

    addActualCost({
      projectId: selectedProject.id,
      projectCode: selectedProject.code,
      projectName: selectedProject.name,
      cCode: cCodeObj ? cCodeObj.code : cCode,
      cCodeDescription: cCodeObj ? cCodeObj.description : 'Cost Category',
      sCode: sCodeObj ? sCodeObj.code : sCode,
      sCodeDescription: sCodeObj ? sCodeObj.description : 'Sub-Cost Category',
      amount: costVal,
      costMonth: costMonth || 'Jan-26',
      reference: reference.trim() || `VOUCHER-${Date.now().toString().slice(-4)}`,
      documentName: documentName.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-2xl my-auto overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Record Project Actual Cost
              </h2>
              <p className="text-xs text-slate-400">
                Record expenditure incurred against project &amp; approved S-Code cost code.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Project Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 font-mono">
              Project *
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
            >
              <option value="">-- Select Project Record --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.code}] {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Budget Approval Notice / Warning */}
          {selectedProject && (
            <div>
              {isBudgetApproved ? (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Approved budget baseline active ({activeApprovedBudget?.revision}). Actual cost will update budget consumption totals.
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Project Budget Status: {activeApprovedBudget?.status || 'No Budget Created'}</span>
                  </div>
                  <p className="text-amber-800 text-[11px]">
                    Recording actual costs against an unapproved budget is subject to configuration rules.
                  </p>
                  <ConfirmationRequiredBadge text="Client Confirmation Required" detail="Unapproved budget actual cost recording policy pending client validation." />
                </div>
              )}
            </div>
          )}

          {/* C-Code & S-Code Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 font-mono">
                C-Code (Cost Category) *
              </label>
              <select
                value={cCode}
                onChange={(e) => {
                  setCCode(e.target.value);
                  setSCode('');
                }}
                required
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- Select C-Code --</option>
                {parentCCodes.map((c) => (
                  <option key={c.id} value={c.code}>
                    C-{c.code} {c.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 font-mono">
                S-Code (Sub-Cost Category) *
              </label>
              <select
                value={sCode}
                onChange={(e) => setSCode(e.target.value)}
                required
                disabled={!cCode && availableSCodes.length === 0}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
              >
                <option value="">-- Select S-Code --</option>
                {availableSCodes.map((s) => (
                  <option key={s.id} value={s.code}>
                    {s.code} - {s.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount & Cost Month */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 font-mono">
                Actual Cost Amount (MYR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-slate-400">
                  RM
                </span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-amber-500 tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 font-mono">
                Cost Month *
              </label>
              <select
                value={costMonth}
                onChange={(e) => setCostMonth(e.target.value)}
                required
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded font-mono text-slate-900"
              >
                {[
                  'Jan-26', 'Feb-26', 'Mar-26', 'Apr-26', 'May-26', 'Jun-26',
                  'Jul-26', 'Aug-26', 'Sep-26', 'Oct-26', 'Nov-26', 'Dec-26'
                ].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Budget Consumption Preview Card */}
          {selectedProject && sCode && (
            <div className="bg-slate-900 text-white rounded-lg p-3.5 space-y-2.5 border border-slate-800 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  Budget Consumption Preview
                </span>
                <ConfirmationRequiredBadge variant="proposed" text="Proposed – Pending Client Validation" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Approved S-Code Budget:</span>
                  <span className="text-slate-200 font-bold">
                    MYR {budgetPosition.approvedSCodeBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block">Previously Recorded:</span>
                  <span className="text-slate-200 font-bold">
                    MYR {budgetPosition.previouslyRecordedActualCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block">Current Entry:</span>
                  <span className="text-amber-300 font-bold">
                    MYR {budgetPosition.currentEntryAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block">Updated Cumulative Actual:</span>
                  <span className="text-white font-bold text-xs">
                    MYR {budgetPosition.updatedCumulativeActualCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="text-slate-400 block">Remaining S-Code Budget:</span>
                  <span className={`font-bold text-xs ${budgetPosition.remainingBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    MYR {budgetPosition.remainingBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Excess Budget Warning Alert */}
              {budgetPosition.isExceeded && (
                <div className="bg-rose-950/90 border border-rose-700 text-rose-200 p-2.5 rounded flex items-start gap-2 text-[11px] font-sans">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-rose-300">
                      ⚠️ Budget Exceeded Warning!
                    </span>
                    Cumulative actual cost exceeds approved S-Code budget by{' '}
                    <strong className="text-white font-mono">
                      MYR {budgetPosition.excessAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </strong>. Transaction is permitted for client evaluation.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reference & Supporting Document */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                Transaction Reference
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. PO-2026-0881 / INV-9942"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supporting Document Name
              </label>
              <div className="relative">
                <Paperclip className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="e.g. Supplier_Invoice_044.pdf"
                  className="w-full text-xs pl-8 pr-2 py-2 bg-white border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Expenditure Notes / Remarks
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Direct site expenditure incurred during Phase 1"
              className="w-full text-xs p-2 bg-white border border-slate-300 rounded"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded transition-colors shadow-md flex items-center gap-1.5"
            >
              <Receipt className="w-4 h-4" />
              <span>Record Actual Cost</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
