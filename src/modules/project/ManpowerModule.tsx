/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PlannedManhourEntry, ActualManhourEntry, DailySiteHeadcount } from '../../types';
import {
  Users,
  Clock,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Download,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Filter,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export const ManpowerModule: React.FC = () => {
  const {
    projects,
    plannedManhours,
    actualManhours,
    dailyHeadcounts,
    addPlannedManhour,
    updatePlannedManhour,
    deletePlannedManhour,
    addActualManhour,
    updateActualManhour,
    deleteActualManhour,
    addDailyHeadcount,
    updateDailyHeadcount,
    deleteDailyHeadcount,
    showToast,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<
    'planned' | 'actual' | 'headcount' | 'monitoring'
  >('monitoring');

  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');

  // Modal states
  const [plannedModalOpen, setPlannedModalOpen] = useState(false);
  const [editingPlanned, setEditingPlanned] = useState<PlannedManhourEntry | null>(null);
  const [pProjectId, setPProjectId] = useState(projects[0]?.id || '');
  const [pMonth, setPMonth] = useState('Nov-26');
  const [pManhours, setPManhours] = useState<number>(0);
  const [pHeadcount, setPHeadcount] = useState<number>(0);
  const [pRemarks, setPRemarks] = useState('');

  const [actualModalOpen, setActualModalOpen] = useState(false);
  const [editingActual, setEditingActual] = useState<ActualManhourEntry | null>(null);
  const [aProjectId, setAProjectId] = useState(projects[0]?.id || '');
  const [aWorkDate, setAWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [aCategory, setACategory] = useState('Direct');
  const [aHeadcount, setAHeadcount] = useState<number>(1);
  const [aManhours, setAManhours] = useState<number>(8);
  const [aRemarks, setARemarks] = useState('');

  const [headcountModalOpen, setHeadcountModalOpen] = useState(false);
  const [editingHeadcount, setEditingHeadcount] = useState<DailySiteHeadcount | null>(null);
  const [hProjectId, setHProjectId] = useState(projects[0]?.id || '');
  const [hWorkDate, setHWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [hHeadcount, setHHeadcount] = useState<number>(1);
  const [hRemarks, setHRemarks] = useState('');

  // -------------------------------------------------------------
  // Filtered Collections
  // -------------------------------------------------------------
  const filteredPlanned = useMemo(() => {
    return plannedManhours.filter((item) => {
      if (projectFilter !== 'all' && item.projectId !== projectFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.projectCode.toLowerCase().includes(q) ||
          item.projectName.toLowerCase().includes(q) ||
          item.planningMonth.toLowerCase().includes(q) ||
          item.projectManager.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [plannedManhours, projectFilter, searchQuery]);

  const filteredActual = useMemo(() => {
    return actualManhours.filter((item) => {
      if (projectFilter !== 'all' && item.projectId !== projectFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.projectCode.toLowerCase().includes(q) ||
          item.projectName.toLowerCase().includes(q) ||
          item.workDate.toLowerCase().includes(q) ||
          (item.workforceCategory && item.workforceCategory.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [actualManhours, projectFilter, searchQuery]);

  const filteredHeadcounts = useMemo(() => {
    return dailyHeadcounts.filter((item) => {
      if (projectFilter !== 'all' && item.projectId !== projectFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.projectCode.toLowerCase().includes(q) ||
          item.projectName.toLowerCase().includes(q) ||
          item.workDate.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [dailyHeadcounts, projectFilter, searchQuery]);

  // -------------------------------------------------------------
  // Planned vs Actual Monitoring Consolidated Data
  // -------------------------------------------------------------
  const monitoringData = useMemo(() => {
    // Collect all project and month combinations from planned manhours
    const map: Record<string, {
      projectId: string;
      projectCode: string;
      projectName: string;
      projectManager: string;
      planningMonth: string;
      plannedManhours: number;
      plannedHeadcount: number | null;
      actualManhours: number;
      actualHeadcountAvg: number;
    }> = {};

    plannedManhours.forEach((p) => {
      const key = `${p.projectId}-${p.planningMonth}`;
      map[key] = {
        projectId: p.projectId,
        projectCode: p.projectCode,
        projectName: p.projectName,
        projectManager: p.projectManager,
        planningMonth: p.planningMonth,
        plannedManhours: p.plannedManhours,
        plannedHeadcount: p.plannedHeadcount ?? null,
        actualManhours: 0,
        actualHeadcountAvg: 0,
      };
    });

    // Sum actual manhours matching project and month
    actualManhours.forEach((a) => {
      // derive month format like "Nov-26" from workDate YYYY-MM-DD
      try {
        const dParts = a.workDate.split('-');
        if (dParts.length === 3) {
          const yearShort = dParts[0].slice(-2);
          const monthIdx = parseInt(dParts[1], 10) - 1;
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const mStr = `${monthNames[monthIdx]}-${yearShort}`;
          const key = `${a.projectId}-${mStr}`;
          if (map[key]) {
            map[key].actualManhours += a.actualManhours;
            map[key].actualHeadcountAvg = Math.max(map[key].actualHeadcountAvg, a.headcount);
          } else {
            // If actual exists without planned entry
            const proj = projects.find((pr) => pr.id === a.projectId);
            map[key] = {
              projectId: a.projectId,
              projectCode: a.projectCode,
              projectName: a.projectName,
              projectManager: a.projectManager,
              planningMonth: mStr,
              plannedManhours: 0,
              plannedHeadcount: null,
              actualManhours: a.actualManhours,
              actualHeadcountAvg: a.headcount,
            };
          }
        }
      } catch {
        // fallback
      }
    });

    return Object.values(map).filter((item) => {
      if (projectFilter !== 'all' && item.projectId !== projectFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.projectCode.toLowerCase().includes(q) ||
          item.projectName.toLowerCase().includes(q) ||
          item.planningMonth.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [plannedManhours, actualManhours, projects, projectFilter, searchQuery]);

  // CSV Exporter Helper
  const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    try {
      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row
            .map((val) => {
              const str = String(val ?? '');
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
      showToast('Error exporting CSV', 'error');
    }
  };

  // Handlers for Planned Manhours
  const handleOpenPlannedModal = (item?: PlannedManhourEntry) => {
    if (item) {
      setEditingPlanned(item);
      setPProjectId(item.projectId);
      setPMonth(item.planningMonth);
      setPManhours(item.plannedManhours);
      setPHeadcount(item.plannedHeadcount || 0);
      setPRemarks(item.remarks || '');
    } else {
      setEditingPlanned(null);
      setPProjectId(projects[0]?.id || '');
      setPMonth('Nov-26');
      setPManhours(1000);
      setPHeadcount(25);
      setPRemarks('');
    }
    setPlannedModalOpen(true);
  };

  const handleSavePlanned = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find((p) => p.id === pProjectId);
    if (!proj) return;

    if (editingPlanned) {
      updatePlannedManhour(editingPlanned.id, {
        projectId: proj.id,
        projectCode: proj.code,
        projectName: proj.name,
        projectManager: proj.projectManager || 'Unassigned',
        planningMonth: pMonth.trim(),
        plannedManhours: Number(pManhours),
        plannedHeadcount: pHeadcount ? Number(pHeadcount) : null,
        remarks: pRemarks.trim(),
      });
    } else {
      addPlannedManhour({
        projectId: proj.id,
        projectCode: proj.code,
        projectName: proj.name,
        projectManager: proj.projectManager || 'Unassigned',
        planningMonth: pMonth.trim(),
        plannedManhours: Number(pManhours),
        plannedHeadcount: pHeadcount ? Number(pHeadcount) : null,
        remarks: pRemarks.trim(),
      });
    }
    setPlannedModalOpen(false);
  };

  // Handlers for Actual Manhours
  const handleOpenActualModal = (item?: ActualManhourEntry) => {
    if (item) {
      setEditingActual(item);
      setAProjectId(item.projectId);
      setAWorkDate(item.workDate);
      setACategory(item.workforceCategory || 'Direct');
      setAHeadcount(item.headcount);
      setAManhours(item.actualManhours);
      setARemarks(item.remarks || '');
    } else {
      setEditingActual(null);
      setAProjectId(projects[0]?.id || '');
      setAWorkDate(new Date().toISOString().split('T')[0]);
      setACategory('Direct');
      setAHeadcount(10);
      setAManhours(80);
      setARemarks('');
    }
    setActualModalOpen(true);
  };

  const handleSaveActual = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find((p) => p.id === aProjectId);
    if (!proj) return;

    if (editingActual) {
      updateActualManhour(editingActual.id, {
        projectId: proj.id,
        projectCode: proj.code,
        projectName: proj.name,
        projectManager: proj.projectManager || 'Unassigned',
        workDate: aWorkDate,
        workforceCategory: aCategory,
        headcount: Number(aHeadcount),
        actualManhours: Number(aManhours),
        remarks: aRemarks.trim(),
      });
    } else {
      addActualManhour({
        projectId: proj.id,
        projectCode: proj.code,
        projectName: proj.name,
        projectManager: proj.projectManager || 'Unassigned',
        workDate: aWorkDate,
        workforceCategory: aCategory,
        headcount: Number(aHeadcount),
        actualManhours: Number(aManhours),
        remarks: aRemarks.trim(),
      });
    }
    setActualModalOpen(false);
  };

  // Handlers for Daily Site Headcount
  const handleOpenHeadcountModal = (item?: DailySiteHeadcount) => {
    if (item) {
      setEditingHeadcount(item);
      setHProjectId(item.projectId);
      setHWorkDate(item.workDate);
      setHHeadcount(item.actualHeadcount);
      setHRemarks(item.remarks || '');
    } else {
      setEditingHeadcount(null);
      setHProjectId(projects[0]?.id || '');
      setHWorkDate(new Date().toISOString().split('T')[0]);
      setHHeadcount(25);
      setHRemarks('');
    }
    setHeadcountModalOpen(true);
  };

  const handleSaveHeadcount = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find((p) => p.id === hProjectId);
    if (!proj) return;

    if (editingHeadcount) {
      updateDailyHeadcount(editingHeadcount.id, {
        projectId: proj.id,
        projectCode: proj.code,
        projectName: proj.name,
        workDate: hWorkDate,
        actualHeadcount: Number(hHeadcount),
        remarks: hRemarks.trim(),
      });
    } else {
      addDailyHeadcount({
        projectId: proj.id,
        projectCode: proj.code,
        projectName: proj.name,
        workDate: hWorkDate,
        actualHeadcount: Number(hHeadcount),
        remarks: hRemarks.trim(),
      });
    }
    setHeadcountModalOpen(false);
  };

  return (
    <div className="space-y-4 select-none">
      {/* Workspace Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Manpower &amp; Manhour Planning &amp; Recording</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Project Manager workspace for planned manhours, actual timesheet recording, daily site headcounts, and variance monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'planned' && (
            <button
              onClick={() => handleOpenPlannedModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Planned Manhours</span>
            </button>
          )}
          {activeTab === 'actual' && (
            <button
              onClick={() => handleOpenActualModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Actual Manhours</span>
            </button>
          )}
          {activeTab === 'headcount' && (
            <button
              onClick={() => handleOpenHeadcountModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Daily Headcount</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher & Global Filter Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded border border-slate-200 overflow-x-auto">
          {[
            { id: 'monitoring', label: 'Planned vs Actual Monitoring', icon: TrendingUp },
            { id: 'planned', label: 'Planned Manhour Scheduling', icon: Calendar },
            { id: 'actual', label: 'Actual Manhour Recording', icon: Clock },
            { id: 'headcount', label: 'Daily Site Headcount', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5 opacity-80" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded font-medium"
          >
            <option value="all">All Projects ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.code}] {p.customerName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. PLANNED VS ACTUAL MONITORING VIEW */}
      {/* ========================================================= */}
      {activeTab === 'monitoring' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Planned vs Actual Manhour Monitoring Matrix</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Variance analysis derived from project monthly schedules and actual recorded timesheets (Formula: Actual − Planned).
              </p>
            </div>
            <button
              onClick={() => {
                const headers = ['Project Code', 'Project Name', 'Project Manager', 'Planning Month', 'Planned Manhours', 'Actual Manhours', 'Variance (Actual - Planned)', 'Planned Headcount', 'Actual Headcount'];
                const rows = monitoringData.map((m) => [
                  m.projectCode, m.projectName, m.projectManager, m.planningMonth, m.plannedManhours, m.actualManhours, m.actualManhours - m.plannedManhours, m.plannedHeadcount ?? 'Not Scheduled', m.actualHeadcountAvg || 'Not Recorded',
                ]);
                exportToCSV('Planned_vs_Actual_Manhour_Variance_Report', headers, rows);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-mono sticky top-0 z-10 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Project Code</th>
                  <th className="py-2.5 px-3">Project Description</th>
                  <th className="py-2.5 px-3">Project Manager</th>
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3 text-right">Planned (mhrs)</th>
                  <th className="py-2.5 px-3 text-right">Actual (mhrs)</th>
                  <th className="py-2.5 px-3 text-right">Variance (mhrs)</th>
                  <th className="py-2.5 px-3 text-center">Planned Headcount</th>
                  <th className="py-2.5 px-3 text-center">Actual Headcount</th>
                  <th className="py-2.5 px-3">Utilization Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {monitoringData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500">
                      No planned or actual manhour records found for the selected filter.
                    </td>
                  </tr>
                ) : (
                  monitoringData.map((m, idx) => {
                    const variance = m.actualManhours - m.plannedManhours;
                    const isExcess = variance > 0;
                    const isUnder = variance < 0;

                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-blue-700">{m.projectCode}</td>
                        <td className="py-3 px-3 font-semibold text-slate-900">{m.projectName}</td>
                        <td className="py-3 px-3 text-slate-700">{m.projectManager}</td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">{m.planningMonth}</td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                          {m.plannedManhours.toLocaleString()} mhrs
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                          {m.actualManhours > 0 ? `${m.actualManhours.toLocaleString()} mhrs` : 'Not Recorded'}
                        </td>
                        <td className={`py-3 px-3 text-right font-mono tabular-nums font-bold ${
                          isExcess ? 'text-rose-700' : isUnder ? 'text-blue-700' : 'text-slate-700'
                        }`}>
                          {variance > 0 ? `+${variance.toLocaleString()}` : variance.toLocaleString()} mhrs
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-700">
                          {m.plannedHeadcount != null ? m.plannedHeadcount : 'Not Scheduled'}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                          {m.actualHeadcountAvg > 0 ? m.actualHeadcountAvg : 'Not Recorded'}
                        </td>
                        <td className="py-3 px-3">
                          {m.actualManhours === 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                              Pending Actuals
                            </span>
                          ) : isExcess ? (
                            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                              <ArrowUpRight className="w-3 h-3" />
                              Excess Actuals (+{variance})
                            </span>
                          ) : isUnder ? (
                            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                              <ArrowDownRight className="w-3 h-3" />
                              Under Utilization ({variance})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Exact Match
                            </span>
                          )}
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

      {/* ========================================================= */}
      {/* 2. PLANNED MANHOUR SCHEDULING VIEW */}
      {/* ========================================================= */}
      {activeTab === 'planned' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Planned Manhour Scheduling Register</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Maintain monthly planned manhours and headcounts against Poratha project codes ({filteredPlanned.length} records).
              </p>
            </div>
            <button
              onClick={() => handleOpenPlannedModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Planned Manhours</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold font-mono">
                <tr>
                  <th className="py-2.5 px-3">Project Code</th>
                  <th className="py-2.5 px-3">Project Description</th>
                  <th className="py-2.5 px-3">Project Manager</th>
                  <th className="py-2.5 px-3">Planning Month</th>
                  <th className="py-2.5 px-3 text-right">Planned Manhours</th>
                  <th className="py-2.5 px-3 text-center">Planned Headcount</th>
                  <th className="py-2.5 px-3">Remarks</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPlanned.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No planned manhour schedules registered. Click above to add one.
                    </td>
                  </tr>
                ) : (
                  filteredPlanned.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-blue-700">{item.projectCode}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{item.projectName}</td>
                      <td className="py-3 px-3 text-slate-700">{item.projectManager}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{item.planningMonth}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-blue-700 tabular-nums">
                        {item.plannedManhours.toLocaleString()} mhrs
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-800">
                        {item.plannedHeadcount != null ? item.plannedHeadcount : 'Not Scheduled'}
                      </td>
                      <td className="py-3 px-3 text-slate-600 italic">{item.remarks || '—'}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenPlannedModal(item)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                            title="Edit schedule"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deletePlannedManhour(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Delete schedule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. ACTUAL MANHOUR RECORDING VIEW */}
      {/* ========================================================= */}
      {activeTab === 'actual' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Actual Manhour Recording Register</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Record actual timesheets, workforce categories, and hours deployed on site ({filteredActual.length} records).
              </p>
            </div>
            <button
              onClick={() => handleOpenActualModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Actual Manhours</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold font-mono">
                <tr>
                  <th className="py-2.5 px-3">Project Code</th>
                  <th className="py-2.5 px-3">Project Description</th>
                  <th className="py-2.5 px-3">Work Date</th>
                  <th className="py-2.5 px-3">Workforce Category</th>
                  <th className="py-2.5 px-3 text-center">Headcount</th>
                  <th className="py-2.5 px-3 text-right">Actual Manhours</th>
                  <th className="py-2.5 px-3">Remarks</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredActual.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No actual manhour entries recorded. Click above to add one.
                    </td>
                  </tr>
                ) : (
                  filteredActual.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-blue-700">{item.projectCode}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{item.projectName}</td>
                      <td className="py-3 px-3 font-mono text-slate-800">{item.workDate}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono text-[11px]">
                          {item.workforceCategory || 'Direct'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">{item.headcount}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 tabular-nums">
                        {item.actualManhours.toLocaleString()} mhrs
                      </td>
                      <td className="py-3 px-3 text-slate-600 italic">{item.remarks || '—'}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenActualModal(item)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                            title="Edit entry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteActualManhour(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. DAILY SITE HEADCOUNT VIEW */}
      {/* ========================================================= */}
      {activeTab === 'headcount' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Daily Site Headcount Register</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Record actual workers deployed on site for any work date ({filteredHeadcounts.length} records).
              </p>
            </div>
            <button
              onClick={() => handleOpenHeadcountModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Daily Headcount</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold font-mono">
                <tr>
                  <th className="py-2.5 px-3">Project Code</th>
                  <th className="py-2.5 px-3">Project Description</th>
                  <th className="py-2.5 px-3">Work Date</th>
                  <th className="py-2.5 px-3 text-center">Actual Headcount</th>
                  <th className="py-2.5 px-3">Remarks</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredHeadcounts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No daily site headcount records found. Click above to add one.
                    </td>
                  </tr>
                ) : (
                  filteredHeadcounts.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-blue-700">{item.projectCode}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{item.projectName}</td>
                      <td className="py-3 px-3 font-mono text-slate-800">{item.workDate}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-900 text-sm">
                        {item.actualHeadcount} workers
                      </td>
                      <td className="py-3 px-3 text-slate-600 italic">{item.remarks || '—'}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenHeadcountModal(item)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                            title="Edit headcount"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteDailyHeadcount(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Delete headcount"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALS FOR CREATE / EDIT */}
      {/* ========================================================= */}

      {/* Planned Manhour Modal */}
      {plannedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              {editingPlanned ? 'Edit Planned Manhour Schedule' : 'Schedule Planned Manhours'}
            </h3>
            <form onSubmit={handleSavePlanned} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Project</label>
                <select
                  value={pProjectId}
                  onChange={(e) => setPProjectId(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded font-medium"
                  required
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Planning Month</label>
                  <input
                    type="text"
                    value={pMonth}
                    onChange={(e) => setPMonth(e.target.value)}
                    placeholder="e.g. Nov-26"
                    className="w-full px-3 py-1.5 border rounded font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Planned Headcount</label>
                  <input
                    type="number"
                    value={pHeadcount}
                    onChange={(e) => setPHeadcount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border rounded font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Planned Manhours (mhrs)</label>
                <input
                  type="number"
                  value={pManhours}
                  onChange={(e) => setPManhours(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border rounded font-mono font-bold"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks / Notes</label>
                <textarea
                  value={pRemarks}
                  onChange={(e) => setPRemarks(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setPlannedModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium">
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Actual Manhour Modal */}
      {actualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              {editingActual ? 'Edit Actual Manhour Record' : 'Record Actual Manhours'}
            </h3>
            <form onSubmit={handleSaveActual} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Project</label>
                <select
                  value={aProjectId}
                  onChange={(e) => setAProjectId(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded font-medium"
                  required
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Work Date</label>
                  <input
                    type="date"
                    value={aWorkDate}
                    onChange={(e) => setAWorkDate(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Workforce Category</label>
                  <select
                    value={aCategory}
                    onChange={(e) => setACategory(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded font-medium"
                  >
                    <option value="Direct">Direct</option>
                    <option value="Indirect">Indirect</option>
                    <option value="Supervisory / Engineering">Supervisory / Engineering</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Headcount Deployed</label>
                  <input
                    type="number"
                    value={aHeadcount}
                    onChange={(e) => setAHeadcount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border rounded font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Actual Manhours Worked</label>
                  <input
                    type="number"
                    value={aManhours}
                    onChange={(e) => setAManhours(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border rounded font-mono font-bold"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks</label>
                <textarea
                  value={aRemarks}
                  onChange={(e) => setARemarks(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setActualModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium">
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily Headcount Modal */}
      {headcountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              {editingHeadcount ? 'Edit Daily Headcount' : 'Record Daily Site Headcount'}
            </h3>
            <form onSubmit={handleSaveHeadcount} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Project</label>
                <select
                  value={hProjectId}
                  onChange={(e) => setHProjectId(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded font-medium"
                  required
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Work Date</label>
                  <input
                    type="date"
                    value={hWorkDate}
                    onChange={(e) => setHWorkDate(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Actual Headcount</label>
                  <input
                    type="number"
                    value={hHeadcount}
                    onChange={(e) => setHHeadcount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border rounded font-mono font-bold"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks / Muster Notes</label>
                <textarea
                  value={hRemarks}
                  onChange={(e) => setHRemarks(e.target.value)}
                  className="w-full px-3 py-1.5 border rounded"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setHeadcountModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium">
                  Save Headcount
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
