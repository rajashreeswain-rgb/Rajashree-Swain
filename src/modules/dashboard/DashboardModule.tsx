/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  UserCheck,
  Calendar,
  Layers,
  Calculator,
  UserX,
  ChevronRight,
  BarChart3,
  DollarSign,
  PieChart,
  Users,
} from 'lucide-react';

export const DashboardModule: React.FC = () => {
  const {
    projects,
    budgets,
    employees,
    milestones,
    scheduleItems,
    plannedManhours,
    actualManhours,
    dailyHeadcounts,
    setActiveModule,
    setActiveSubModule,
  } = useAppStore();

  // Current month string e.g. "Nov-26" and current date "2026-11-11"
  const currentMonthStr = 'Nov-26';
  const currentDateStr = '2026-11-11';

  const plannedThisMonth = useMemo(() => {
    const matches = (plannedManhours || []).filter((p) => p.planningMonth.toLowerCase() === currentMonthStr.toLowerCase());
    if (matches.length === 0) return 'Not Scheduled';
    const sum = matches.reduce((s, p) => s + p.plannedManhours, 0);
    return `${sum.toLocaleString()} mhrs`;
  }, [plannedManhours]);

  const actualThisMonth = useMemo(() => {
    const matches = (actualManhours || []).filter((a) => a.workDate.startsWith('2026-11'));
    if (matches.length === 0) return 'Not Recorded';
    const sum = matches.reduce((s, a) => s + a.actualManhours, 0);
    return `${sum.toLocaleString()} mhrs`;
  }, [actualManhours]);

  const headcountToday = useMemo(() => {
    const matches = (dailyHeadcounts || []).filter((d) => d.workDate === currentDateStr);
    if (matches.length === 0) return 'Not Recorded';
    const totalHeadcount = matches.reduce((s, d) => s + d.actualHeadcount, 0);
    return `${totalHeadcount} Workers`;
  }, [dailyHeadcounts, currentDateStr]);

  // Parse date string cleanly for runtime date comparisons
  const parseDate = (dStr?: string): Date | null => {
    if (!dStr) return null;
    const clean = dStr.trim().toLowerCase();
    if (clean === 'nil' || clean === 'tbc' || clean === 'n/a') return null;

    try {
      const parts = dStr.split(/[-/]/);
      if (parts.length === 3) {
        const monthMap: Record<string, number> = {
          jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
          jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
        };
        let day = parseInt(parts[0], 10);
        let month = monthMap[parts[1].toLowerCase()] ?? (parseInt(parts[1], 10) - 1);
        let year = parseInt(parts[2], 10);
        if (year < 100) year += 2000;
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          return new Date(year, month, day);
        }
      }
    } catch {
      return null;
    }
    return null;
  };

  const today = useMemo(() => new Date(), []);

  // 1.A Project KPI Summary Indicators
  const totalProjects = projects.length;

  // Total Financial Metrics across all Projects & Budgets
  const financialTotals = useMemo(() => {
    const totalContractValue = projects.reduce((sum, p) => sum + (p.contractValue || p.projectValue || 0), 0);
    const totalBudgetAllocation = budgets.reduce((sum, b) => sum + (b.totalBudget || 0), 0);
    const totalExpectedProfit = totalContractValue - totalBudgetAllocation;
    const profitMargin = totalContractValue > 0 ? ((totalExpectedProfit / totalContractValue) * 100).toFixed(1) : '0';

    return {
      totalContractValue,
      totalBudgetAllocation,
      totalExpectedProfit,
      profitMargin,
    };
  }, [projects, budgets]);

  // 1.B Project Status Breakdown & Visual Chart Data
  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      'In Progress': 0,
      'Confirmed': 0,
      'Completed': 0,
      'Draft': 0,
    };
    projects.forEach((p) => {
      const st = p.status || 'Confirmed';
      counts[st] = (counts[st] || 0) + 1;
    });

    const statusColors: Record<string, { bg: string; text: string; bar: string }> = {
      'In Progress': { bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-600' },
      'Confirmed': { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-600' },
      'Completed': { bg: 'bg-indigo-50', text: 'text-indigo-700', bar: 'bg-indigo-600' },
      'Draft': { bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-500' },
    };

    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
      percentage: totalProjects > 0 ? ((count / totalProjects) * 100).toFixed(0) : '0',
      styling: statusColors[status] || { bg: 'bg-slate-50', text: 'text-slate-700', bar: 'bg-slate-600' },
    }));
  }, [projects, totalProjects]);

  // 1.C Project Manager-wise Breakdown
  const projectsByPM = useMemo(() => {
    const map: Record<string, { count: number; codes: string[] }> = {};
    projects.forEach((p) => {
      const pm = p.projectManager?.trim() || 'Unassigned';
      if (!map[pm]) {
        map[pm] = { count: 0, codes: [] };
      }
      map[pm].count += 1;
      map[pm].codes.push(p.code);
    });
    return map;
  }, [projects]);

  // Projects without PM
  const projectsWithoutPM = useMemo(
    () => projects.filter((p) => !p.projectManager || !p.projectManager.trim()),
    [projects]
  );

  // Projects without approved budget
  const projectsWithoutApprovedBudget = useMemo(() => {
    const approvedProjectIds = new Set(
      budgets.filter((b) => b.status === 'Approved').map((b) => b.projectId)
    );
    return projects.filter((p) => !approvedProjectIds.has(p.id));
  }, [projects, budgets]);

  // 1.D Project Completion Monitoring (Upcoming / Passed)
  const completionMonitoring = useMemo(() => {
    const upcoming: typeof projects = [];
    const passed: typeof projects = [];

    projects.forEach((p) => {
      const compDate = parseDate(p.completion || p.constructionCompletionDate);
      if (compDate) {
        if (compDate < today) {
          passed.push(p);
        } else {
          upcoming.push(p);
        }
      }
    });

    return { upcoming, passed };
  }, [projects, today]);

  // 1.E Pending Activities List
  const pendingActivitiesList = useMemo(() => {
    const list: {
      id: string;
      title: string;
      description: string;
      category: 'Budget' | 'Project';
      module: 'project-management' | 'budget-cost-control';
      subModule: string;
    }[] = [];

    // Budgets awaiting submission
    budgets
      .filter((b) => b.status === 'Draft')
      .forEach((b) => {
        list.push({
          id: `act-draft-${b.id}`,
          title: `Budget Draft Awaiting Submission: [${b.projectCode}] ${b.revision}`,
          description: `Budget proposal ${b.refNo || b.id} is in Draft state awaiting submission.`,
          category: 'Budget',
          module: 'budget-cost-control',
          subModule: '',
        });
      });

    // Budgets awaiting approval
    budgets
      .filter((b) => b.status === 'Submitted')
      .forEach((b) => {
        list.push({
          id: `act-sub-${b.id}`,
          title: `Budget Approval Requested: [${b.projectCode}] ${b.revision}`,
          description: `Budget proposal ${b.refNo || b.id} is submitted and awaiting baseline approval.`,
          category: 'Budget',
          module: 'budget-cost-control',
          subModule: '',
        });
      });

    // Projects without assigned PM
    projectsWithoutPM.forEach((p) => {
      list.push({
        id: `act-nopm-${p.id}`,
        title: `Unassigned PM: Project [${p.code}] ${p.name}`,
        description: `Project ${p.code} does not have a designated Project Manager assigned.`,
        category: 'Project',
        module: 'project-management',
        subModule: '',
      });
    });

    // Projects without approved budget
    projectsWithoutApprovedBudget.forEach((p) => {
      list.push({
        id: `act-nobdg-${p.id}`,
        title: `Pending Approved Budget: Project [${p.code}]`,
        description: `Project ${p.code} does not have an approved budget baseline in Budget Master.`,
        category: 'Project',
        module: 'budget-cost-control',
        subModule: '',
      });
    });

    return list;
  }, [budgets, projectsWithoutPM, projectsWithoutApprovedBudget]);

  return (
    <div className="space-y-6 select-none">
      {/* Executive Welcome & Context Header */}
      <div className="bg-slate-900 text-white p-5 rounded-lg border border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-600/30 text-blue-300 font-mono text-[10px] font-bold rounded border border-blue-500/30">
              MANAGEMENT DASHBOARD
            </span>
            <span className="text-xs text-slate-400 font-mono">Poratha Group of Companies</span>
          </div>
          <h1 className="text-lg font-bold text-white mt-1 tracking-tight">
            ROCKEYE Poratha Executive Operational Overview
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time visibility across client projects, budget approval workflows, completion monitoring, and pending activities.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 block uppercase">Total Portfolio Value</span>
            <span className="text-xl font-bold text-emerald-400">
              MYR {financialTotals.totalContractValue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 1.A Project KPI Summary Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              Total Projects
            </span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-bold text-slate-900 font-mono">{totalProjects}</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono">
              100% Scope
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              In Progress
            </span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-bold text-blue-700 font-mono">
              {projects.filter((p) => p.status === 'In Progress').length}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Active Site</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              Unassigned PM
            </span>
            <UserX className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-bold text-amber-700 font-mono">
              {projectsWithoutPM.length}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {projectsWithoutPM.length === 0 ? 'All Assigned' : 'Needs PM'}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              Unapproved Budget
            </span>
            <Calculator className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-bold text-purple-700 font-mono">
              {projectsWithoutApprovedBudget.length}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Pending</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              Passed Date
            </span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-bold text-rose-700 font-mono">
              {completionMonitoring.passed.length}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Passed Target</span>
          </div>
        </div>
      </div>

      {/* Portfolio Financial Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-mono text-slate-500 block">Total Portfolio Contract Value</span>
          <p className="text-base font-bold text-slate-900 font-mono mt-0.5">
            MYR {financialTotals.totalContractValue.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400">Sum of 5 Client Contracts</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-mono text-slate-500 block">Total Budget Allocation</span>
          <p className="text-base font-bold text-blue-700 font-mono mt-0.5">
            MYR {financialTotals.totalBudgetAllocation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-400">Allocated across C-Codes &amp; Months</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-mono text-slate-500 block">Total Portfolio Expected Profit</span>
          <p className="text-base font-bold text-emerald-700 font-mono mt-0.5">
            MYR {financialTotals.totalExpectedProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-400">Formula: Value - Budget Allocation</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-mono text-slate-500 block">Portfolio Profit Margin %</span>
          <p className="text-base font-bold text-emerald-600 font-mono mt-0.5">
            {financialTotals.profitMargin}%
          </p>
          <span className="text-[10px] text-slate-400">Formula: (Profit / Value) * 100</span>
        </div>
      </div>

      {/* Manpower & Manhour Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-500 block uppercase font-bold">Actual Manhours This Month</span>
            <div className="flex items-center gap-3 mt-1">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">Planned This Month:</span>
                <span className="text-sm font-bold text-slate-700 font-mono">{plannedThisMonth}</span>
              </div>
              <div className="border-l border-slate-200 pl-3">
                <span className="text-[10px] text-slate-400 block font-mono">Actual Recorded:</span>
                <span className="text-sm font-bold text-blue-700 font-mono">{actualThisMonth}</span>
              </div>
            </div>
          </div>
          <Users className="w-8 h-8 text-blue-600 opacity-20" />
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-slate-500 block uppercase font-bold">Headcount on Site Today</span>
            <p className="text-lg font-bold text-emerald-700 font-mono mt-1">
              {headcountToday}
            </p>
            <span className="text-[10px] text-slate-400 font-mono">Date: 2026-11-11 (Latest site muster)</span>
          </div>
          <Clock className="w-8 h-8 text-emerald-600 opacity-20" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): 1.B Project Status Overview Chart + 1.C PM Summary Table + 1.F Workflow Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1.B Project Status Overview Chart Panel */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span>Project Status Overview</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Distribution of client projects by recorded status.
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-400">{totalProjects} Projects Total</span>
            </div>

            <div className="space-y-3">
              {statusDistribution.map((item) => (
                <div key={item.status} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.styling.bar}`} />
                      {item.status}
                    </span>
                    <span className="font-bold text-slate-900">
                      {item.count} Projects ({item.percentage}%)
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.styling.bar} transition-all duration-300`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 1.C Project Manager-wise Summary Table */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Project Manager Portfolio Distribution</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Project assignments grouped by designated Project Manager.
                </p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 font-mono">
                  <tr>
                    <th className="py-2.5 px-3">Project Manager</th>
                    <th className="py-2.5 px-3 text-center">Assigned Projects</th>
                    <th className="py-2.5 px-3">Associated Project Codes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {Object.entries(projectsByPM).map(([pmName, info]) => (
                    <tr key={pmName} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3">
                        {pmName === 'Unassigned' ? (
                          <span className="font-semibold text-amber-700 italic">Unassigned</span>
                        ) : (
                          <span className="font-bold text-slate-900">{pmName}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-800">{info.count}</td>
                      <td className="py-2.5 px-3 font-mono">
                        <div className="flex flex-wrap gap-1">
                          {info.codes.map((code) => (
                            <span
                              key={code}
                              onClick={() => {
                                setActiveModule('project-management');
                              }}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-blue-700 rounded cursor-pointer font-bold border border-slate-200"
                            >
                              {code}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 1.F Budget Workflow Progress */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span>Budget Workflow Implementation Progress</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  10-step project setup and cost control workflow tracker.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {[
                { step: 1, label: 'Confirmation', done: true },
                { step: 2, label: 'Registration', done: true },
                { step: 3, label: 'Project Code', done: true },
                { step: 4, label: 'PM Assignment', done: projectsWithoutPM.length === 0 },
                { step: 5, label: 'Project Budget', done: budgets.length > 0 },
                { step: 6, label: 'Cost Allocation', done: budgets.some((b) => b.totalBudget > 0) },
                { step: 7, label: 'Submit', done: budgets.some((b) => b.status === 'Submitted' || b.status === 'Approved') },
                { step: 8, label: 'Approve', done: budgets.some((b) => b.status === 'Approved') },
                { step: 9, label: 'Approved Budget', done: budgets.some((b) => b.status === 'Approved') },
                { step: 10, label: 'Revision', done: budgets.some((b) => (b.revision || 'REV-00') !== 'REV-00') },
              ].map((st) => (
                <div
                  key={st.step}
                  className={`p-2.5 rounded border text-center space-y-1 transition-all ${
                    st.done
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-500 opacity-70'
                  }`}
                >
                  <span className="font-mono text-[10px] font-bold block">STEP {st.step}</span>
                  <p className="font-bold text-[11px] leading-tight truncate">{st.label}</p>
                  <span className="text-[10px] font-mono font-medium block">
                    {st.done ? 'Completed' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar (1 Col): 1.E Pending Activities & 1.D Project Completion Monitoring */}
        <div className="space-y-6">
          {/* 1.E Pending Activities */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Pending Activities ({pendingActivitiesList.length})</span>
              </h3>
            </div>

            {pendingActivitiesList.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded border border-dashed border-slate-200 space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-800">All Action Items Cleared</p>
                <p className="text-[11px] text-slate-500">No pending budget submissions, approvals, or PM assignments.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto">
                {pendingActivitiesList.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => {
                      setActiveModule(act.module);
                    }}
                    className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded border border-slate-200 hover:border-blue-300 cursor-pointer transition-all space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-blue-700 uppercase bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                        {act.category}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{act.title}</h4>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{act.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 1.D Project Completion Monitoring */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Completion Date Monitoring</span>
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-800 block mb-1 font-mono text-[11px]">
                  Upcoming Completion Dates ({completionMonitoring.upcoming.length})
                </span>
                {completionMonitoring.upcoming.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No upcoming construction completion dates.</p>
                ) : (
                  <div className="space-y-1.5">
                    {completionMonitoring.upcoming.map((p) => (
                      <div
                        key={p.id}
                        className="p-2 bg-emerald-50/60 rounded border border-emerald-200 flex justify-between items-center font-mono text-[11px]"
                      >
                        <span className="font-bold text-slate-900">[{p.code}] {p.customerName}</span>
                        <span className="font-bold text-emerald-800">{p.completion}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1 font-mono text-[11px]">
                  Passed Target Dates ({completionMonitoring.passed.length})
                </span>
                {completionMonitoring.passed.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No projects have passed target dates.</p>
                ) : (
                  <div className="space-y-1.5">
                    {completionMonitoring.passed.map((p) => (
                      <div
                        key={p.id}
                        className="p-2 bg-rose-50/60 rounded border border-rose-200 flex justify-between items-center font-mono text-[11px]"
                      >
                        <span className="font-bold text-slate-900">[{p.code}] {p.customerName}</span>
                        <span className="font-bold text-rose-800">{p.completion}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
