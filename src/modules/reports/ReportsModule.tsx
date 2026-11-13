/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ProjectRecord, ProjectBudget, ColumnDef } from '../../types';
import {
  FileText,
  Download,
  Search,
  Filter,
  BarChart3,
  Layers,
  Calendar,
  UserCheck,
  Calculator,
  History,
  TrendingUp,
  Table,
} from 'lucide-react';

export const ReportsModule: React.FC = () => {
  const {
    projects,
    budgets,
    employees,
    costCodes,
    milestones,
    scheduleItems,
    plannedManhours,
    actualManhours,
    dailyHeadcounts,
    activeSubModule,
    setActiveSubModule,
    showToast,
  } = useAppStore();

  const activeSub = activeSubModule || 'rep-project-reports';

  // Active sub-tab inside Project Reports or Budget Reports
  const [projectReportTab, setProjectReportTab] = useState<
    'register' | 'status' | 'schedule-milestones' | 'pm-wise' | 'manpower'
  >('register');

  const [budgetReportTab, setBudgetReportTab] = useState<
    'by-project' | 'by-cost-code' | 'revision-history' | 'monthly-phasing'
  >('by-project');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [pmFilter, setPmFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cCodeFilter, setCCodeFilter] = useState('all');

  // CSV Exporter Helper Function
  const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    try {
      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row
            .map((val) => {
              const str = String(val ?? '');
              // Escape quotes and commas
              if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
              }
              return str;
            })
            .join(',')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Exported ${filename} successfully`, 'success');
    } catch {
      showToast('Error generating CSV export', 'error');
    }
  };

  // -------------------------------------------------------------
  // Filtered Project Collections
  // -------------------------------------------------------------
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          p.code.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          (p.customerName && p.customerName.toLowerCase().includes(q)) ||
          (p.projectManager && p.projectManager.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (projectFilter !== 'all' && p.id !== projectFilter) return false;
      if (clientFilter !== 'all' && p.customerId !== clientFilter) return false;
      if (pmFilter !== 'all' && p.projectManager !== pmFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      return true;
    });
  }, [projects, searchQuery, projectFilter, clientFilter, pmFilter, statusFilter]);

  // -------------------------------------------------------------
  // Filtered Budget Collections
  // -------------------------------------------------------------
  const filteredBudgets = useMemo(() => {
    return budgets.filter((b) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          b.refNo?.toLowerCase().includes(q) ||
          b.projectCode.toLowerCase().includes(q) ||
          b.projectName.toLowerCase().includes(q) ||
          (b.client && b.client.toLowerCase().includes(q));
        if (!match) return false;
      }
      if (projectFilter !== 'all' && b.projectId !== projectFilter) return false;
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      return true;
    });
  }, [budgets, searchQuery, projectFilter, statusFilter]);

  // Unique list of clients for dropdown filter
  const clientOptions = useMemo(() => {
    const clientsSet = new Set<string>();
    projects.forEach((p) => {
      if (p.customerName) clientsSet.add(p.customerName);
    });
    return Array.from(clientsSet);
  }, [projects]);

  return (
    <div className="space-y-4 select-none">
      {/* Module Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Read-Only Operational &amp; Financial Reports</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidated reporting derived from central collections with CSV export capabilities.
          </p>
        </div>

        {/* Sub-module Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded border border-slate-200">
          <button
            onClick={() => setActiveSubModule('rep-project-reports')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
              activeSub === 'rep-project-reports'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Project Reports
          </button>
          <button
            onClick={() => setActiveSubModule('rep-budget-reports')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
              activeSub === 'rep-budget-reports'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Budget Reports
          </button>
        </div>
      </div>

      {/* Global Report Filter Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center gap-1 text-slate-400 font-mono shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-bold text-slate-700 uppercase text-[10px]">Filters:</span>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Search report data..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-300 rounded focus:ring-1 focus:ring-blue-600"
          />
        </div>

        {/* Project Dropdown */}
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded font-medium"
        >
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              [{p.code}] {p.customerName}
            </option>
          ))}
        </select>

        {/* Client Dropdown */}
        {activeSub === 'rep-project-reports' && (
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded font-medium"
          >
            <option value="all">All Clients</option>
            {clientOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}

        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded font-medium"
        >
          <option value="all">All Statuses</option>
          <option value="Confirmed">Confirmed</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Draft">Draft</option>
          <option value="Submitted">Submitted</option>
          <option value="Approved">Approved</option>
        </select>
      </div>

      {/* ========================================================= */}
      {/* 1. PROJECT REPORTS SUB-MODULE */}
      {/* ========================================================= */}
      {activeSub === 'rep-project-reports' && (
        <div className="space-y-4">
          {/* Sub-tabs */}
          <div className="bg-white rounded-lg border border-slate-200 p-1.5 shadow-2xs flex items-center gap-1 overflow-x-auto text-xs font-medium">
            {[
              { id: 'register', label: 'A. Project Register Report' },
              { id: 'status', label: 'B. Project Status Report' },
              { id: 'schedule-milestones', label: 'C. Schedule & Milestone Report' },
              { id: 'pm-wise', label: 'D. Project Manager-wise Report' },
              { id: 'manpower', label: 'E. Manpower & Manhour Report' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setProjectReportTab(tab.id as any)}
                className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                  projectReportTab === tab.id
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* REPORT A: PROJECT REGISTER REPORT */}
          {projectReportTab === 'register' && (
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Project Register Report (17 Core Attributes)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing {filteredProjects.length} of {projects.length} project records.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const headers = [
                      'Project Code', 'Ref No', 'Project Under', 'Client', 'Project Description',
                      'Project Manager', 'Project Incharge', 'Start Date', 'Completion Date',
                      'Revised Comp Date', 'EOT', 'Project Value', 'Project Budget', 'Location',
                      'Project Status', 'Plan Progress %', 'Actual Progress %',
                    ];
                    const rows = filteredProjects.map((p) => [
                      p.code, p.refNo || '', p.projectUnder || '', p.customerName || '', p.name,
                      p.projectManager || '', p.projectIncharge || '', p.startDate || '',
                      p.completion || p.constructionCompletionDate || '', p.revisedCompletionDate || '',
                      p.eot || '', p.projectValue != null ? p.projectValue : '', p.budget != null ? p.budget : '',
                      p.location || 'MYS', p.status || 'Confirmed', p.progressPlan ?? '', p.progressActual ?? '',
                    ]);
                    exportToCSV('Project_Register_Report', headers, rows);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900 text-white font-mono sticky top-0 z-10 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 whitespace-nowrap">Code</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Client</th>
                      <th className="py-2.5 px-3 min-w-[200px]">Project Description</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">PM</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Start Date</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Completion Date</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">EOT</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Project Value</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Approved Budget</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Plan %</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Actual %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredProjects.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{p.code}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{p.customerName || '—'}</td>
                        <td className="py-2.5 px-3 text-slate-800">{p.name}</td>
                        <td className="py-2.5 px-3 text-slate-700">{p.projectManager || '—'}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">{p.startDate || '—'}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-800">{p.completion || '—'}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">{p.eot || 'N/A'}</td>
                        <td className="py-2.5 px-3 font-mono tabular-nums">
                          {p.projectValue != null ? `MYR ${p.projectValue.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-2.5 px-3 font-mono tabular-nums font-bold text-blue-700">
                          {p.budget != null ? `MYR ${p.budget.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge label={p.status || 'Confirmed'} />
                        </td>
                        <td className="py-2.5 px-3 font-mono">{p.progressPlan ?? 70}%</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">{p.progressActual ?? 65}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT B: PROJECT STATUS REPORT */}
          {projectReportTab === 'status' && (
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Project Status Breakdown Report
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Grouped by recorded project status.</p>
                </div>
                <button
                  onClick={() => {
                    const headers = ['Project Code', 'Project Name', 'Client', 'Project Manager', 'Project Status', 'Plan %', 'Actual %'];
                    const rows = filteredProjects.map((p) => [
                      p.code, p.name, p.customerName || '', p.projectManager || '', p.status || 'Confirmed', p.progressPlan ?? '', p.progressActual ?? '',
                    ]);
                    exportToCSV('Project_Status_Report', headers, rows);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 font-mono">
                    <tr>
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3">Project Description</th>
                      <th className="py-2.5 px-3">Client</th>
                      <th className="py-2.5 px-3">Project Manager</th>
                      <th className="py-2.5 px-3">Recorded Status</th>
                      <th className="py-2.5 px-3">Plan %</th>
                      <th className="py-2.5 px-3">Actual %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredProjects.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{p.code}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{p.name}</td>
                        <td className="py-2.5 px-3 text-slate-800">{p.customerName || '—'}</td>
                        <td className="py-2.5 px-3 text-slate-700">{p.projectManager || '—'}</td>
                        <td className="py-2.5 px-3">
                          <StatusBadge label={p.status || 'Confirmed'} />
                        </td>
                        <td className="py-2.5 px-3 font-mono">{p.progressPlan ?? 70}%</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">{p.progressActual ?? 65}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT C: SCHEDULE AND MILESTONES REPORT */}
          {projectReportTab === 'schedule-milestones' && (
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Project Schedule &amp; Milestones Report
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Consolidated milestones and schedule activities derived from active project records.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const headers = ['Project Code', 'Milestone Title', 'Planned Date', 'Actual Date', 'Status', 'Remarks'];
                    const rows = milestones.map((m) => {
                      const proj = projects.find((p) => p.id === m.projectId);
                      return [proj?.code || '', m.title, m.targetDate, m.actualDate || '', m.status, m.remarks || ''];
                    });
                    exportToCSV('Project_Milestones_Schedule_Report', headers, rows);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white font-mono sticky top-0 z-10 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Proj Code</th>
                      <th className="py-2.5 px-3">Milestone Name</th>
                      <th className="py-2.5 px-3">Planned Date</th>
                      <th className="py-2.5 px-3">Actual Date</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {milestones.map((m) => {
                      const proj = projects.find((p) => p.id === m.projectId);
                      return (
                        <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{proj?.code || '—'}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{m.title}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">{m.targetDate}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-700">{m.actualDate || '—'}</td>
                          <td className="py-2.5 px-3">
                            <StatusBadge label={m.status} />
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 italic">{m.remarks || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT D: PROJECT MANAGER-WISE REPORT */}
          {projectReportTab === 'pm-wise' && (
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Project Manager Portfolio Report
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Projects grouped by designated Project Manager.</p>
                </div>
                <button
                  onClick={() => {
                    const headers = ['Project Manager', 'Project Code', 'Project Description', 'Client', 'Status', 'Plan %', 'Actual %'];
                    const rows = filteredProjects.map((p) => [
                      p.projectManager || 'Unassigned', p.code, p.name, p.customerName || '', p.status || 'Confirmed', p.progressPlan ?? '', p.progressActual ?? '',
                    ]);
                    exportToCSV('PM_Wise_Projects_Report', headers, rows);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 font-mono">
                    <tr>
                      <th className="py-2.5 px-3">Project Manager</th>
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3">Project Description</th>
                      <th className="py-2.5 px-3">Client</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Plan %</th>
                      <th className="py-2.5 px-3">Actual %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredProjects.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {p.projectManager || <span className="text-amber-700 italic">Unassigned</span>}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{p.code}</td>
                        <td className="py-2.5 px-3 text-slate-800">{p.name}</td>
                        <td className="py-2.5 px-3 text-slate-700">{p.customerName || '—'}</td>
                        <td className="py-2.5 px-3">
                          <StatusBadge label={p.status || 'Confirmed'} />
                        </td>
                        <td className="py-2.5 px-3 font-mono">{p.progressPlan ?? 70}%</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">{p.progressActual ?? 65}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT E: MANPOWER & MANHOUR REPORT */}
          {projectReportTab === 'manpower' && (
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Manpower &amp; Manhour Variance &amp; Headcount Report
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Consolidated planned manhours, actual timesheet records, variance, and daily site headcount.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const headers = ['Project Code', 'Project Name', 'Planning Month', 'Planned Manhours', 'Actual Manhours', 'Variance (Actual - Planned)', 'Planned Headcount', 'Actual Headcount'];
                    const rows = (plannedManhours || []).map((pm) => {
                      const actSum = (actualManhours || [])
                        .filter((a) => a.projectId === pm.projectId)
                        .reduce((s, a) => s + a.actualManhours, 0);
                      const actHead = (dailyHeadcounts || [])
                        .filter((d) => d.projectId === pm.projectId)
                        .reduce((s, d) => Math.max(s, d.actualHeadcount), 0);
                      return [
                        pm.projectCode,
                        pm.projectName,
                        pm.planningMonth,
                        pm.plannedManhours,
                        actSum,
                        actSum - pm.plannedManhours,
                        pm.plannedHeadcount ?? 'Not Scheduled',
                        actHead || 'Not Recorded',
                      ];
                    });
                    exportToCSV('Manpower_and_Manhour_Report', headers, rows);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 font-mono">
                    <tr>
                      <th className="py-2.5 px-3">Project Code</th>
                      <th className="py-2.5 px-3">Project Description</th>
                      <th className="py-2.5 px-3">Planning Month</th>
                      <th className="py-2.5 px-3 text-right">Planned Mhrs</th>
                      <th className="py-2.5 px-3 text-right">Actual Mhrs</th>
                      <th className="py-2.5 px-3 text-right">Variance</th>
                      <th className="py-2.5 px-3 text-center">Planned Headcount</th>
                      <th className="py-2.5 px-3 text-center">Actual Headcount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {(plannedManhours || []).length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-500">
                          No planned manhour records found for reporting.
                        </td>
                      </tr>
                    ) : (
                      (plannedManhours || []).map((pm) => {
                        const actSum = (actualManhours || [])
                          .filter((a) => a.projectId === pm.projectId)
                          .reduce((s, a) => s + a.actualManhours, 0);
                        const actHead = (dailyHeadcounts || [])
                          .filter((d) => d.projectId === pm.projectId)
                          .reduce((s, d) => Math.max(s, d.actualHeadcount), 0);
                        const variance = actSum - pm.plannedManhours;

                        return (
                          <tr key={pm.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{pm.projectCode}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{pm.projectName}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{pm.planningMonth}</td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums">{pm.plannedManhours.toLocaleString()} mhrs</td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                              {actSum > 0 ? `${actSum.toLocaleString()} mhrs` : 'Not Recorded'}
                            </td>
                            <td className={`py-2.5 px-3 text-right font-mono tabular-nums font-bold ${
                              variance > 0 ? 'text-rose-700' : variance < 0 ? 'text-blue-700' : 'text-slate-700'
                            }`}>
                              {variance > 0 ? `+${variance.toLocaleString()}` : variance.toLocaleString()} mhrs
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono text-slate-700">
                              {pm.plannedHeadcount != null ? pm.plannedHeadcount : 'Not Scheduled'}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                              {actHead > 0 ? actHead : 'Not Recorded'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. BUDGET REPORTS SUB-MODULE */}
      {/* ========================================================= */}
      {activeSub === 'rep-budget-reports' && (
        <div className="space-y-4">
          {/* Sub-tabs */}
          <div className="bg-white rounded-lg border border-slate-200 p-1.5 shadow-2xs flex items-center gap-1 overflow-x-auto text-xs font-medium">
            {[
              { id: 'by-project', label: 'A. Project Budget Report' },
              { id: 'by-cost-code', label: 'B. Cost Code-wise Budget Report' },
              { id: 'revision-history', label: 'C. Budget Revision History Report' },
              { id: 'monthly-phasing', label: 'D. Monthly Budget Phasing Report' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setBudgetReportTab(tab.id as any)}
                className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                  budgetReportTab === tab.id
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* REPORT A: PROJECT BUDGET REPORT */}
          {budgetReportTab === 'by-project' && (
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Project Baseline Budget Report
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Consolidated baseline budgets, profit calculations, and approval status.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const headers = ['Project Code', 'Project Name', 'Client', 'Project Value', 'Project Budget', 'Expected Profit', 'Expected Profit %', 'Budget Status', 'Revision'];
                    const rows = filteredBudgets.map((b) => {
                      const proj = projects.find((p) => p.id === b.projectId);
                      const pVal = proj?.projectValue ?? null;
                      const bTot = b.totalBudget || 0;
                      const expProf = pVal != null ? pVal - bTot : null;
                      const expProfPct = pVal != null && pVal > 0 ? ((expProf! / pVal) * 100).toFixed(2) : null;
                      return [b.projectCode, b.projectName, b.client || '', pVal != null ? pVal : '', bTot, expProf != null ? expProf : '', expProfPct != null ? expProfPct : '', b.status, b.revision || 'REV-00'];
                    });
                    exportToCSV('Project_Budget_Report', headers, rows);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 font-mono">
                    <tr>
                      <th className="py-2.5 px-3">Project Code</th>
                      <th className="py-2.5 px-3">Client</th>
                      <th className="py-2.5 px-3">Project Value</th>
                      <th className="py-2.5 px-3">Project Budget</th>
                      <th className="py-2.5 px-3">Expected Profit</th>
                      <th className="py-2.5 px-3">Expected Profit %</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Revision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredBudgets.map((b) => {
                      const proj = projects.find((p) => p.id === b.projectId);
                      const pVal = proj?.projectValue ?? null;
                      const bTot = b.totalBudget || 0;
                      const expProf = pVal != null ? pVal - bTot : null;
                      const expProfPct = pVal != null && pVal > 0 ? ((expProf! / pVal) * 100).toFixed(2) : null;

                      return (
                        <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{b.projectCode}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{b.client || '—'}</td>
                          <td className="py-2.5 px-3 font-mono tabular-nums">
                            {pVal != null ? `MYR ${pVal.toLocaleString()}` : '— (Blank)'}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-700 tabular-nums">
                            MYR {bTot.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 font-mono tabular-nums">
                            {expProf != null ? `MYR ${expProf.toLocaleString()}` : '— (Blank)'}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                            {expProfPct != null ? `${expProfPct}%` : '— (Blank)'}
                          </td>
                          <td className="py-2.5 px-3">
                            <StatusBadge label={b.status} />
                          </td>
                          <td className="py-2.5 px-3 font-mono">{b.revision || 'REV-00'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT B: COST CODE-WISE BUDGET REPORT */}
          {budgetReportTab === 'by-cost-code' && (
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Cost Code Allocation Report
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Budget distribution by C-Code and S-Code hierarchy.</p>
                </div>
                <button
                  onClick={() => {
                    const headers = ['C-Code', 'C-Code Description', 'S-Code', 'S-Code Description', 'Project Code', 'Revision', 'Total Allocation'];
                    const rows = costCodes.filter((c) => c.level === 'S-Code').map((s) => [
                      `C-${s.parentCCode}`, '', s.code, s.description, '044', 'REV-00', 0
                    ]);
                    exportToCSV('Cost_Code_Wise_Budget_Report', headers, rows);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-[500px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900 text-white font-mono sticky top-0 z-10 text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">C-Code</th>
                      <th className="py-2.5 px-3">S-Code</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Project Code</th>
                      <th className="py-2.5 px-3">Revision</th>
                      <th className="py-2.5 px-3 text-right">Total Allocation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {costCodes
                      .filter((c) => c.level === 'S-Code')
                      .slice(0, 50)
                      .map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2 px-3 font-mono font-bold text-blue-700">C-{s.parentCCode}</td>
                          <td className="py-2 px-3 font-mono text-slate-800">{s.code}</td>
                          <td className="py-2 px-3 font-semibold text-slate-900">{s.description}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-800">044</td>
                          <td className="py-2 px-3 font-mono">REV-00</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                            MYR 0.00
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT C: BUDGET REVISION HISTORY REPORT */}
          {budgetReportTab === 'revision-history' && (
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Budget Revision History Audit Trail
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Audit log of all project budget versions (REV-xx).</p>
                </div>
                <button
                  onClick={() => {
                    const headers = ['Project Code', 'Project Name', 'Ref No', 'Revision', 'Project Budget', 'Status'];
                    const rows = filteredBudgets.map((b) => [
                      b.projectCode, b.projectName, b.refNo || '', b.revision || 'REV-00', b.totalBudget, b.status,
                    ]);
                    exportToCSV('Budget_Revision_History_Report', headers, rows);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 font-mono">
                    <tr>
                      <th className="py-2.5 px-3">Project Code</th>
                      <th className="py-2.5 px-3">Project Description</th>
                      <th className="py-2.5 px-3">Ref No</th>
                      <th className="py-2.5 px-3">Revision</th>
                      <th className="py-2.5 px-3">Project Budget</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredBudgets.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{b.projectCode}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{b.projectName}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">{b.refNo || b.id}</td>
                        <td className="py-2.5 px-3 font-mono font-bold">{b.revision || 'REV-00'}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 tabular-nums">
                          MYR {b.totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge label={b.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT D: MONTHLY BUDGET PHASING REPORT */}
          {budgetReportTab === 'monthly-phasing' && (
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Monthly Budget Phasing Projection Report
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Phased cash flow allocations per project.</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-6 text-center bg-slate-50 space-y-2">
                <Table className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-800">Select a project proposal in Budget Allocation to view live monthly phasing</p>
                <p className="text-[11px] text-slate-500">
                  Monthly phasing calculations update in real time as budget allocations are entered.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
