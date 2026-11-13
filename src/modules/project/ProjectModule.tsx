/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ListingTable } from '../../components/common/ListingTable';
import { SlideOverForm, FormField } from '../../components/common/SlideOverForm';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ProjectRecord, ProjectMilestone, ProjectScheduleItem, ColumnDef, ProjectLifecycleStage } from '../../types';
import { ManpowerModule } from './ManpowerModule';
import {
  Plus,
  Briefcase,
  Eye,
  Trash2,
  Edit2,
  ArrowLeft,
  Calendar,
  UserCheck,
  CheckCircle2,
  Clock,
  Layers,
  FileText,
  BarChart2,
  Target,
  ChevronRight,
  AlertCircle,
  PlayCircle,
  Building2,
  MapPin,
  DollarSign,
  TrendingUp,
  Award,
  Users,
} from 'lucide-react';

export const ProjectModule: React.FC = () => {
  const {
    projects,
    customers,
    employees,
    milestones,
    scheduleItems,
    activeSubModule,
    addProject,
    updateProject,
    deleteProject,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    addScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
    showToast,
  } = useAppStore();

  // If activeSubModule is manpower planning, render ManpowerModule directly
  if (activeSubModule === 'pm-manpower') {
    return <ManpowerModule />;
  }

  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<
    'overview' | 'details' | 'lifecycle' | 'milestones' | 'schedule' | 'status' | 'assignment' | 'manpower'
  >('overview');

  // Modal / Form state for Milestones
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null);
  const [msSequence, setMsSequence] = useState<number>(1);
  const [msTitle, setMsTitle] = useState('');
  const [msDesc, setMsDesc] = useState('');
  const [msTargetDate, setMsTargetDate] = useState('');
  const [msActualDate, setMsActualDate] = useState('');
  const [msStatus, setMsStatus] = useState<'Pending' | 'In Progress' | 'Completed' | 'Delayed'>('Pending');
  const [msRemarks, setMsRemarks] = useState('');

  // Modal / Form state for Schedule Items
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingScheduleItem, setEditingScheduleItem] = useState<ProjectScheduleItem | null>(null);
  const [schSequence, setSchSequence] = useState<number>(1);
  const [schTaskName, setSchTaskName] = useState('');
  const [schGroup, setSchGroup] = useState('Execution');
  const [schStartDate, setSchStartDate] = useState('');
  const [schEndDate, setSchEndDate] = useState('');
  const [schActualStart, setSchActualStart] = useState('');
  const [schActualEnd, setSchActualEnd] = useState('');
  const [schStatus, setSchStatus] = useState<'Scheduled' | 'In Progress' | 'Completed' | 'Delayed'>('Scheduled');
  const [schProgress, setSchProgress] = useState<number>(0);

  const currentProject = projects.find((p) => p.id === selectedProjectId);

  // Column definitions for main Project Register Listing
  const projectColumns: ColumnDef<ProjectRecord>[] = [
    {
      key: 'code',
      header: 'Project Code',
      sortable: true,
      render: (p) => (
        <button
          onClick={() => {
            setSelectedProjectId(p.id);
            setActiveDetailTab('overview');
          }}
          className="font-mono font-bold text-blue-700 hover:underline text-left inline-flex items-center gap-1"
        >
          <span>{p.code}</span>
        </button>
      ),
    },
    {
      key: 'customerName',
      header: 'Client',
      sortable: true,
      render: (p) => <span className="font-semibold text-slate-800">{p.customerName || '—'}</span>,
    },
    {
      key: 'name',
      header: 'Project Description',
      sortable: true,
      render: (p) => (
        <div>
          <p className="font-semibold text-slate-900 line-clamp-2">{p.name}</p>
          {p.jobScope && <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{p.jobScope}</p>}
        </div>
      ),
    },
    {
      key: 'projectManager',
      header: 'Project Manager',
      render: (p) => <span className="font-medium text-slate-700">{p.projectManager || '—'}</span>,
    },
    {
      key: 'completion',
      header: 'Completion Date',
      render: (p) => <span className="font-mono text-slate-800">{p.completion || p.constructionCompletionDate || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => <StatusBadge label={p.status || 'Confirmed'} />,
    },
  ];

  const projectFormFields: FormField[] = [
    { name: 'code', label: 'Project Code', type: 'text', required: true, placeholder: 'e.g. 044, 366, 389' },
    { name: 'refNo', label: 'Ref No.', type: 'text', required: false, placeholder: 'e.g. REF-2026-001' },
    { name: 'projectUnder', label: 'Project Under', type: 'text', required: false, placeholder: 'e.g. Direct Contract' },
    {
      name: 'customerId',
      label: 'Client / Customer',
      type: 'select',
      required: true,
      options: customers.map((c) => ({ label: c.name, value: c.id })),
      helpText: 'Select existing record from Customer Master.',
    },
    { name: 'name', label: 'Project Description', type: 'text', required: true, placeholder: 'Scaffolding & Painting Package' },
    {
      name: 'projectManager',
      label: 'Project Manager',
      type: 'select',
      required: false,
      options: employees.map((e) => ({ label: e.name, value: e.name })),
    },
    { name: 'projectIncharge', label: 'Project Incharge', type: 'text', required: false, placeholder: 'e.g. MR.MANIMARAN' },
    { name: 'startDate', label: 'Start Date', type: 'text', required: false, placeholder: 'e.g. 15-Jan-2026' },
    { name: 'completion', label: 'Construction Completion Date', type: 'text', required: false, placeholder: 'e.g. 30-Apr-26, nil, TBC' },
    { name: 'revisedCompletionDate', label: 'Revised Completion Date', type: 'text', required: false, placeholder: 'e.g. TBC' },
    { name: 'eot', label: 'Extension of Time (EOT)', type: 'text', required: false, placeholder: 'e.g. N/A or nil' },
    { name: 'jobScope', label: 'Job Scope', type: 'textarea', required: false, placeholder: 'Detailed scope of work...' },
    { name: 'location', label: 'Location Code', type: 'text', required: false, defaultValue: 'MYS', placeholder: 'MYS' },
    {
      name: 'status',
      label: 'Project Status',
      type: 'select',
      required: true,
      defaultValue: 'Confirmed',
      options: [
        { label: 'Confirmed', value: 'Confirmed' },
        { label: 'Not Started', value: 'Not Started' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Completed', value: 'Completed' },
        { label: 'On Hold', value: 'On Hold' },
      ],
    },
  ];

  const handleCreateProject = (data: Record<string, any>) => {
    const cust = customers.find((c) => c.id === data.customerId);
    addProject({
      code: data.code.trim(),
      name: data.name.trim(),
      refNo: data.refNo?.trim() || '',
      projectUnder: data.projectUnder?.trim() || '',
      customerId: data.customerId,
      customerName: cust ? cust.name : '',
      projectManager: data.projectManager?.trim() || '',
      projectIncharge: data.projectIncharge?.trim() || data.projectManager?.trim() || '',
      location: data.location?.trim() || 'MYS',
      startDate: data.startDate?.trim() || '',
      completion: data.completion?.trim() || 'nil',
      constructionCompletionDate: data.completion?.trim() || 'nil',
      revisedCompletionDate: data.revisedCompletionDate?.trim() || '',
      eot: data.eot?.trim() || 'nil',
      projectValue: null,
      budget: null,
      expectedProfit: null,
      jobScope: data.jobScope?.trim() || '',
      status: data.status || 'Confirmed',
      progressPlan: 50,
      progressActual: 45,
    });
    setIsSlideOverOpen(false);
  };

  // Open milestone modal for create/edit
  const openMilestoneModal = (milestone?: ProjectMilestone) => {
    if (milestone) {
      setEditingMilestone(milestone);
      setMsSequence(milestone.sequence || 1);
      setMsTitle(milestone.title);
      setMsDesc(milestone.description || '');
      setMsTargetDate(milestone.targetDate);
      setMsActualDate(milestone.actualDate || '');
      setMsStatus(milestone.status);
      setMsRemarks(milestone.remarks || '');
    } else {
      const existing = milestones.filter((m) => m.projectId === selectedProjectId);
      setEditingMilestone(null);
      setMsSequence(existing.length + 1);
      setMsTitle('');
      setMsDesc('');
      setMsTargetDate('');
      setMsActualDate('');
      setMsStatus('Pending');
      setMsRemarks('');
    }
    setMilestoneModalOpen(true);
  };

  const handleSaveMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    if (!msTitle.trim()) {
      showToast('Milestone title is required', 'error');
      return;
    }

    if (editingMilestone) {
      updateMilestone(editingMilestone.id, {
        sequence: msSequence,
        title: msTitle.trim(),
        description: msDesc.trim(),
        targetDate: msTargetDate.trim() || 'TBC',
        actualDate: msActualDate.trim() || undefined,
        status: msStatus,
        remarks: msRemarks.trim(),
      });
    } else {
      addMilestone({
        projectId: selectedProjectId,
        sequence: msSequence,
        title: msTitle.trim(),
        description: msDesc.trim(),
        targetDate: msTargetDate.trim() || 'TBC',
        actualDate: msActualDate.trim() || undefined,
        status: msStatus,
        remarks: msRemarks.trim(),
      });
    }
    setMilestoneModalOpen(false);
  };

  // Open schedule modal for create/edit
  const openScheduleModal = (item?: ProjectScheduleItem) => {
    if (item) {
      setEditingScheduleItem(item);
      setSchSequence(item.sequence || 1);
      setSchTaskName(item.taskName);
      setSchGroup(item.group || 'Execution');
      setSchStartDate(item.startDate);
      setSchEndDate(item.endDate);
      setSchActualStart(item.actualStartDate || '');
      setSchActualEnd(item.actualEndDate || '');
      setSchStatus(item.status);
      setSchProgress(item.progress ?? 0);
    } else {
      const existing = scheduleItems.filter((s) => s.projectId === selectedProjectId);
      setEditingScheduleItem(null);
      setSchSequence(existing.length + 1);
      setSchTaskName('');
      setSchGroup('Execution');
      setSchStartDate('');
      setSchEndDate('');
      setSchActualStart('');
      setSchActualEnd('');
      setSchStatus('Scheduled');
      setSchProgress(0);
    }
    setScheduleModalOpen(true);
  };

  const handleSaveScheduleItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    if (!schTaskName.trim()) {
      showToast('Task name is required', 'error');
      return;
    }

    if (editingScheduleItem) {
      updateScheduleItem(editingScheduleItem.id, {
        sequence: schSequence,
        taskName: schTaskName.trim(),
        group: schGroup,
        startDate: schStartDate.trim() || 'TBC',
        endDate: schEndDate.trim() || 'TBC',
        actualStartDate: schActualStart.trim() || undefined,
        actualEndDate: schActualEnd.trim() || undefined,
        status: schStatus,
        progress: schProgress,
      });
    } else {
      addScheduleItem({
        projectId: selectedProjectId,
        sequence: schSequence,
        taskName: schTaskName.trim(),
        group: schGroup,
        startDate: schStartDate.trim() || 'TBC',
        endDate: schEndDate.trim() || 'TBC',
        actualStartDate: schActualStart.trim() || undefined,
        actualEndDate: schActualEnd.trim() || undefined,
        status: schStatus,
        progress: schProgress,
      });
    }
    setScheduleModalOpen(false);
  };

  // Helper to calculate project-specific 7 Lifecycle stages
  const getLifecycleStages = (projectId: string): ProjectLifecycleStage[] => {
    const projMilestones = milestones.filter((m) => m.projectId === projectId);
    const completedCount = projMilestones.filter((m) => m.status === 'Completed').length;
    const totalCount = projMilestones.length || 1;
    const ratio = completedCount / totalCount;

    return [
      {
        id: 'stage-1',
        stageNumber: 1,
        name: 'Project Registration',
        description: 'Contract setup, project code allocation & customer register linking.',
        status: 'Completed',
        completionPercentage: 100,
      },
      {
        id: 'stage-2',
        stageNumber: 2,
        name: 'Project Planning',
        description: 'Work package definition, resource budgeting & trade allocation.',
        status: 'Completed',
        completionPercentage: 100,
      },
      {
        id: 'stage-3',
        stageNumber: 3,
        name: 'Site Mobilisation',
        description: 'Equipment transport, safety inductions & CIDB clearance on site.',
        status: 'Completed',
        completionPercentage: 100,
      },
      {
        id: 'stage-4',
        stageNumber: 4,
        name: 'Project Execution',
        description: 'Active field operations (scaffolding erection, maintenance, painting).',
        status: ratio >= 0.8 ? 'Completed' : 'In Progress',
        completionPercentage: Math.min(100, Math.round(ratio * 100)),
      },
      {
        id: 'stage-5',
        stageNumber: 5,
        name: 'Progress Monitoring',
        description: 'Weekly supervisor audits, QA/QC inspections & timesheet approvals.',
        status: ratio > 0.5 ? 'In Progress' : 'Pending',
        completionPercentage: Math.max(0, Math.min(100, Math.round((ratio - 0.2) * 100))),
      },
      {
        id: 'stage-6',
        stageNumber: 6,
        name: 'Project Completion',
        description: 'Final structural inspection, dismantling, or surface testing sign-off.',
        status: ratio >= 1.0 ? 'Completed' : 'Pending',
        completionPercentage: ratio >= 1.0 ? 100 : 0,
      },
      {
        id: 'stage-7',
        stageNumber: 7,
        name: 'Handover',
        description: 'Client certificate issuance, site clearance & final billing closeout.',
        status: ratio >= 1.0 ? 'Completed' : 'Pending',
        completionPercentage: ratio >= 1.0 ? 100 : 0,
      },
    ];
  };

  // If a project is selected, render the unified Project Detail workspace
  if (currentProject) {
    const projMilestones = milestones
      .filter((m) => m.projectId === currentProject.id)
      .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

    const projSchedules = scheduleItems
      .filter((s) => s.projectId === currentProject.id)
      .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

    const lifecycleStages = getLifecycleStages(currentProject.id);

    return (
      <div className="space-y-4">
        {/* Detail Workspace Header */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedProjectId(null)}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
              title="Return to Project Register"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-blue-700 text-sm">[{currentProject.code}]</span>
                <h1 className="text-base font-bold text-slate-900">{currentProject.name}</h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Client: <span className="font-semibold text-slate-800">{currentProject.customerName || '—'}</span> • Project Manager:{' '}
                <span className="font-semibold text-slate-800">{currentProject.projectManager || 'Unassigned'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge label={currentProject.status || 'Confirmed'} />
            <span className="text-xs font-mono bg-slate-100 border border-slate-200 px-2.5 py-1 rounded text-slate-700">
              {currentProject.location || 'MYS'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs within Unified Project Workspace */}
        <div className="bg-white rounded-lg border border-slate-200 p-1.5 shadow-2xs flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart2 },
            { id: 'details', label: 'Project Details', icon: FileText },
            { id: 'lifecycle', label: 'Project Lifecycle', icon: Layers },
            { id: 'milestones', label: 'Milestones', icon: Target },
            { id: 'schedule', label: 'Project Schedule', icon: Calendar },
            { id: 'status', label: 'Status & Progress', icon: Clock },
            { id: 'assignment', label: 'PM Assignment', icon: UserCheck },
            { id: 'manpower', label: 'Manpower & Manhour', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDetailTab(tab.id as any)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded font-medium transition-colors whitespace-nowrap ${
                  activeDetailTab === tab.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5 opacity-80" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeDetailTab === 'manpower' && <ManpowerModule />}

        {/* ========================================================= */}
        {/* 1. PROJECT OVERVIEW SECTION */}
        {/* ========================================================= */}
        {activeDetailTab === 'overview' && (
          <div className="space-y-4">
            {/* 3 Structured Attribute Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Project Identity & Scope */}
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Identity &amp; Client
                  </h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                    <span className="text-slate-500">Project Code</span>
                    <span className="font-mono font-bold text-blue-700">{currentProject.code}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                    <span className="text-slate-500">Ref No</span>
                    <span className="font-mono font-medium text-slate-800">{currentProject.refNo || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                    <span className="text-slate-500">Project Under</span>
                    <span className="font-medium text-slate-800">{currentProject.projectUnder || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                    <span className="text-slate-500">Client</span>
                    <span className="font-semibold text-slate-900">{currentProject.customerName || '—'}</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-500 block mb-1 font-mono text-[11px]">Project Description</span>
                    <p className="font-medium text-slate-900 leading-snug">{currentProject.name}</p>
                  </div>
                </div>
              </div>

              {/* Card 2: Timeline & Location */}
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Timeline &amp; Operations
                  </h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                    <span className="text-slate-500">Project Manager</span>
                    <span className="font-semibold text-slate-900">{currentProject.projectManager || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                    <span className="text-slate-500">Project Incharge</span>
                    <span className="font-semibold text-slate-800">
                      {currentProject.projectIncharge || currentProject.projectManager || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                    <span className="text-slate-500">Start Date</span>
                    <span className="font-mono text-slate-800">{currentProject.startDate || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                    <span className="text-slate-500">Construction Comp Date</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {currentProject.completion || currentProject.constructionCompletionDate || 'nil'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                    <span className="text-slate-500">Revised Comp Date</span>
                    <span className="font-mono text-slate-800">{currentProject.revisedCompletionDate || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                    <span className="text-slate-500">Extension of Time (EOT)</span>
                    <span className="font-mono text-slate-800">{currentProject.eot || 'nil'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Location</span>
                    <span className="font-mono text-slate-800">{currentProject.location || 'MYS'}</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Financial & Progress Metrics */}
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Financials &amp; Performance
                  </h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                    <span className="text-slate-500">Project Value (MYR)</span>
                    <span className="font-mono text-slate-700">
                      {currentProject.projectValue != null ? `MYR ${currentProject.projectValue.toLocaleString()}` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                    <span className="text-slate-500">Project Budget (MYR)</span>
                    <span className="font-mono text-slate-700">
                      {currentProject.budget != null ? `MYR ${currentProject.budget.toLocaleString()}` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                    <span className="text-slate-500">Expected Profit</span>
                    <span className="font-mono text-slate-700">
                      {currentProject.expectedProfit != null ? `MYR ${currentProject.expectedProfit.toLocaleString()}` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                    <span className="text-slate-500">Project Status</span>
                    <StatusBadge label={currentProject.status || 'Confirmed'} />
                  </div>
                  <div className="pt-2 space-y-2">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                        <span>Plan Progress</span>
                        <span>{currentProject.progressPlan ?? 70}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${currentProject.progressPlan ?? 70}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1 font-mono">
                        <span>Actual Progress</span>
                        <span>{currentProject.progressActual ?? 65}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{ width: `${currentProject.progressActual ?? 65}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Scope Full Description Box */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                Job Scope &amp; Deliverables
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
                {currentProject.jobScope ||
                  'Industrial works execution including manpower deployment, certified trade supervision, scaffolding erection/dismantling, surface preparation, and quality assurance compliance.'}
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. PROJECT DETAILS SECTION */}
        {/* ========================================================= */}
        {activeDetailTab === 'details' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Project Specifications Register</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete record attributes linked across Project Management and Master Data.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 text-[11px] font-mono">Project Code</span>
                <p className="font-mono font-bold text-blue-700 mt-0.5">{currentProject.code}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 text-[11px] font-mono">Ref No</span>
                <p className="font-mono text-slate-800 mt-0.5">{currentProject.refNo || '—'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 text-[11px] font-mono">Project Under</span>
                <p className="font-medium text-slate-800 mt-0.5">{currentProject.projectUnder || '—'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 text-[11px] font-mono">Client Name</span>
                <p className="font-semibold text-slate-900 mt-0.5">{currentProject.customerName || '—'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 text-[11px] font-mono">Project Manager</span>
                <p className="font-semibold text-slate-900 mt-0.5">{currentProject.projectManager || '—'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 text-[11px] font-mono">Project Incharge</span>
                <p className="font-semibold text-slate-900 mt-0.5">
                  {currentProject.projectIncharge || currentProject.projectManager || '—'}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 text-[11px] font-mono">Start Date</span>
                <p className="font-mono text-slate-800 mt-0.5">{currentProject.startDate || '—'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 text-[11px] font-mono">Construction Completion Date</span>
                <p className="font-mono font-semibold text-slate-900 mt-0.5">
                  {currentProject.completion || currentProject.constructionCompletionDate || 'nil'}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 text-[11px] font-mono">Revised Completion Date</span>
                <p className="font-mono text-slate-800 mt-0.5">{currentProject.revisedCompletionDate || '—'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 text-[11px] font-mono">Extension of Time (EOT)</span>
                <p className="font-mono text-slate-800 mt-0.5">{currentProject.eot || 'nil'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 text-[11px] font-mono">Location Code</span>
                <p className="font-mono text-slate-800 mt-0.5">{currentProject.location || 'MYS'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 text-[11px] font-mono">Project Status</span>
                <div className="mt-0.5">
                  <StatusBadge label={currentProject.status || 'Confirmed'} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. PROJECT LIFECYCLE SECTION */}
        {/* ========================================================= */}
        {activeDetailTab === 'lifecycle' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Project Lifecycle Stepper</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Standard 7-stage project execution framework for Poratha client projects.
              </p>
            </div>

            {/* Stepper Steps */}
            <div className="space-y-4">
              {lifecycleStages.map((stage) => {
                const isCompleted = stage.status === 'Completed';
                const isInProgress = stage.status === 'In Progress';

                return (
                  <div
                    key={stage.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isCompleted
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : isInProgress
                        ? 'bg-blue-50/50 border-blue-300 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 opacity-70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : isInProgress
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-300 text-slate-700'
                          }`}
                        >
                          {stage.stageNumber}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">{stage.name}</h4>
                            <StatusBadge label={stage.status} />
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{stage.description}</p>
                        </div>
                      </div>

                      <div className="sm:w-48 shrink-0 space-y-1">
                        <div className="flex justify-between text-[11px] font-mono text-slate-600">
                          <span>Progress</span>
                          <span className="font-bold">{stage.completionPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isCompleted ? 'bg-emerald-600' : isInProgress ? 'bg-blue-600' : 'bg-slate-400'
                            }`}
                            style={{ width: `${stage.completionPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. PROJECT MILESTONES SECTION */}
        {/* ========================================================= */}
        {activeDetailTab === 'milestones' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Project Milestones</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Milestones for Project Code [{currentProject.code}] ({projMilestones.length} items registered).
                </p>
              </div>
              <button
                onClick={() => openMilestoneModal()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-2xs transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Milestone</span>
              </button>
            </div>

            {/* Milestones Listing Table */}
            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 w-12 font-mono">Seq</th>
                    <th className="py-2.5 px-3">Milestone Name</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 font-mono">Planned Date</th>
                    <th className="py-2.5 px-3 font-mono">Actual Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Remarks</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projMilestones.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No milestones registered for this project.
                      </td>
                    </tr>
                  ) : (
                    projMilestones.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-600">{m.sequence || '—'}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{m.title}</td>
                        <td className="py-2.5 px-3 text-slate-600">{m.description || '—'}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">{m.targetDate}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">{m.actualDate || '—'}</td>
                        <td className="py-2.5 px-3">
                          <StatusBadge label={m.status} />
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 italic">{m.remarks || '—'}</td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openMilestoneModal(m)}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                              title="Edit milestone"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteMilestone(m.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Delete milestone"
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
        {/* 5. PROJECT SCHEDULE SECTION */}
        {/* ========================================================= */}
        {activeDetailTab === 'schedule' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Project Visual Schedule &amp; Timeline</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Activity Gantt chart and chronological schedule for [{currentProject.code}] ({projSchedules.length} tasks).
                </p>
              </div>
              <button
                onClick={() => openScheduleModal()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-2xs transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Visual Gantt Chart View */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                Visual Activity Timeline
              </h3>
              <div className="space-y-3">
                {projSchedules.map((task) => {
                  const isCompleted = task.status === 'Completed';
                  const isInProgress = task.status === 'In Progress';
                  const pct = task.progress ?? (isCompleted ? 100 : isInProgress ? 60 : 0);

                  return (
                    <div key={task.id} className="bg-white p-3 rounded border border-slate-200 shadow-2xs space-y-2 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-700">#{task.sequence || '—'}</span>
                          <span className="font-bold text-slate-900">{task.taskName}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 font-mono rounded">
                            {task.group || 'Execution'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-slate-500 text-[11px]">
                            {task.startDate} → {task.endDate}
                          </span>
                          <StatusBadge label={task.status} />
                        </div>
                      </div>

                      {/* Visual Gantt Progress Bar */}
                      <div className="space-y-1">
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isCompleted ? 'bg-emerald-600' : isInProgress ? 'bg-blue-600' : 'bg-slate-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-slate-500">
                          <span>Actual Start: {task.actualStartDate || 'Pending'}</span>
                          <span>{pct}% Completed</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Table Listing */}
            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 w-12 font-mono">Seq</th>
                    <th className="py-2.5 px-3">Task / Activity Name</th>
                    <th className="py-2.5 px-3">Phase Group</th>
                    <th className="py-2.5 px-3 font-mono">Planned Start</th>
                    <th className="py-2.5 px-3 font-mono">Planned End</th>
                    <th className="py-2.5 px-3 font-mono">Actual Dates</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projSchedules.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No schedule tasks registered for this project.
                      </td>
                    </tr>
                  ) : (
                    projSchedules.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-600">{s.sequence || '—'}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{s.taskName}</td>
                        <td className="py-2.5 px-3 text-slate-600">{s.group || 'Execution'}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">{s.startDate}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">{s.endDate}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                          {s.actualStartDate ? `${s.actualStartDate} to ${s.actualEndDate || 'Present'}` : '—'}
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge label={s.status} />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openScheduleModal(s)}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                              title="Edit task"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteScheduleItem(s.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Delete task"
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
        {/* 6. PROJECT STATUS SECTION */}
        {/* ========================================================= */}
        {activeDetailTab === 'status' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Project Status &amp; Progress Maintenance</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update status and completion percentages for [{currentProject.code}].
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Project Status</label>
                <select
                  value={currentProject.status || 'Confirmed'}
                  onChange={(e) => updateProject(currentProject.id, { status: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 font-medium"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
                <p className="text-[10px] text-slate-400">Stores status against shared project record.</p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Project Plan Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={currentProject.progressPlan ?? 70}
                  onChange={(e) =>
                    updateProject(currentProject.id, {
                      progressPlan: e.target.value !== '' ? Number(e.target.value) : null,
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 font-mono tabular-nums"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Project Actual Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={currentProject.progressActual ?? 65}
                  onChange={(e) =>
                    updateProject(currentProject.id, {
                      progressActual: e.target.value !== '' ? Number(e.target.value) : null,
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 font-mono tabular-nums"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 7. PM ASSIGNMENT SECTION */}
        {/* ========================================================= */}
        {activeDetailTab === 'assignment' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Project Manager Assignment</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign designated project manager from Employee Master to [{currentProject.code}].
              </p>
            </div>

            <div className="max-w-xl space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Assigned Project Manager</label>
                <select
                  value={currentProject.projectManager || ''}
                  onChange={(e) =>
                    updateProject(currentProject.id, {
                      projectManager: e.target.value,
                      projectIncharge: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 font-medium"
                >
                  <option value="">— Select Project Manager —</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.name}>
                      {emp.name} ({emp.designation || 'Project Manager'})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  Selects from Employee / Manpower Master (MR.MANIMARAN, MR.MALUSOUNDER, MR.VIGNESH CM, MR.SARGUNAN).
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                <span className="font-semibold text-slate-800">Assignment Impact</span>
                <p className="text-slate-600 leading-relaxed">
                  Updating the project manager here automatically synchronizes the Project Register, Project Master, and reports without duplicating data.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Milestone Modal */}
        {milestoneModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                {editingMilestone ? 'Edit Milestone' : 'Add Milestone'}
              </h3>
              <form onSubmit={handleSaveMilestone} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sequence #</label>
                  <input
                    type="number"
                    value={msSequence}
                    onChange={(e) => setMsSequence(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Milestone Name</label>
                  <input
                    type="text"
                    value={msTitle}
                    onChange={(e) => setMsTitle(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    value={msDesc}
                    onChange={(e) => setMsDesc(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Planned Date</label>
                    <input
                      type="text"
                      value={msTargetDate}
                      onChange={(e) => setMsTargetDate(e.target.value)}
                      placeholder="e.g. 2026-03-15"
                      className="w-full px-3 py-1.5 border rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Actual Date</label>
                    <input
                      type="text"
                      value={msActualDate}
                      onChange={(e) => setMsActualDate(e.target.value)}
                      placeholder="e.g. 2026-03-16"
                      className="w-full px-3 py-1.5 border rounded font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={msStatus}
                    onChange={(e) => setMsStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 border rounded"
                  >
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending">Pending</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Remarks</label>
                  <input
                    type="text"
                    value={msRemarks}
                    onChange={(e) => setMsRemarks(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setMilestoneModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium">
                    Save Milestone
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Schedule Task Modal */}
        {scheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                {editingScheduleItem ? 'Edit Schedule Task' : 'Add Schedule Task'}
              </h3>
              <form onSubmit={handleSaveScheduleItem} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sequence #</label>
                  <input
                    type="number"
                    value={schSequence}
                    onChange={(e) => setSchSequence(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Task / Activity Name</label>
                  <input
                    type="text"
                    value={schTaskName}
                    onChange={(e) => setSchTaskName(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phase / Group</label>
                  <select
                    value={schGroup}
                    onChange={(e) => setSchGroup(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded"
                  >
                    <option value="Registration">Registration</option>
                    <option value="Planning">Planning</option>
                    <option value="Mobilisation">Mobilisation</option>
                    <option value="Preparation">Preparation</option>
                    <option value="Execution">Execution</option>
                    <option value="Monitoring">Monitoring</option>
                    <option value="Completion">Completion</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Planned Start</label>
                    <input
                      type="text"
                      value={schStartDate}
                      onChange={(e) => setSchStartDate(e.target.value)}
                      placeholder="e.g. 2026-03-01"
                      className="w-full px-3 py-1.5 border rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Planned End</label>
                    <input
                      type="text"
                      value={schEndDate}
                      onChange={(e) => setSchEndDate(e.target.value)}
                      placeholder="e.g. 2026-03-31"
                      className="w-full px-3 py-1.5 border rounded font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Actual Start</label>
                    <input
                      type="text"
                      value={schActualStart}
                      onChange={(e) => setSchActualStart(e.target.value)}
                      placeholder="e.g. 2026-03-02"
                      className="w-full px-3 py-1.5 border rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Actual End</label>
                    <input
                      type="text"
                      value={schActualEnd}
                      onChange={(e) => setSchActualEnd(e.target.value)}
                      placeholder="e.g. 2026-03-28"
                      className="w-full px-3 py-1.5 border rounded font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Status</label>
                    <select
                      value={schStatus}
                      onChange={(e) => setSchStatus(e.target.value as any)}
                      className="w-full px-3 py-1.5 border rounded"
                    >
                      <option value="Completed">Completed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Delayed">Delayed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Progress (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={schProgress}
                      onChange={(e) => setSchProgress(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border rounded font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setScheduleModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium">
                    Save Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Primary Landing Page: Project Register Listing Table
  return (
    <div className="space-y-4">
      {/* Workspace Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">Project Management Workspace</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Poratha Corporation client project register and unified detail workspace.
          </p>
        </div>

        <button
          onClick={() => setIsSlideOverOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Project</span>
        </button>
      </div>

      {/* Project Register Listing Table */}
      <ListingTable
        data={projects}
        columns={projectColumns}
        keyExtractor={(p) => p.id}
        searchPlaceholder="Search project register by code, description, client, or manager..."
        searchableKeys={['code', 'name', 'customerName', 'projectManager']}
        filters={[
          {
            key: 'status',
            label: 'Project Status',
            options: [
              { label: 'Confirmed', value: 'Confirmed' },
              { label: 'In Progress', value: 'In Progress' },
              { label: 'Completed', value: 'Completed' },
              { label: 'On Hold', value: 'On Hold' },
            ],
          },
        ]}
        emptyStateTitle="No projects registered"
        emptyStateDescription="The project collection is currently empty. You may register a new project using the button above."
        emptyStateAction={
          <button
            onClick={() => setIsSlideOverOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Project</span>
          </button>
        }
        rowActions={(p) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => {
                setSelectedProjectId(p.id);
                setActiveDetailTab('overview');
              }}
              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
              title="View project workspace"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => deleteProject(p.id)}
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
              title="Delete project"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      />

      {/* Slide-Over Form for Project Registration */}
      <SlideOverForm
        isOpen={isSlideOverOpen}
        title="Create Project"
        description="Register a new confirmed Poratha project. Synchronized with Project Master."
        onClose={() => setIsSlideOverOpen(false)}
        onSubmit={handleCreateProject}
        fields={projectFormFields}
        submitLabel="Save Project"
      />
    </div>
  );
};
