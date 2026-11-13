/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MainModuleDef } from '../types';

export const APP_MODULES: MainModuleDef[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    iconName: 'LayoutDashboard',
    description: 'Executive visibility and project monitoring for Poratha Group of Companies.',
    categories: [
      {
        title: 'Dashboard Views',
        subModules: [
          {
            id: 'dash-project-overview',
            label: 'Project Overview',
            description: 'Consolidated overview of projects, physical progress, and status indicators.',
          },
          {
            id: 'dash-pending-activities',
            label: 'Pending Activities',
            description: 'Action items, approval requests, and milestones requiring immediate attention.',
          },
        ],
      },
    ],
  },
  {
    id: 'project-management',
    label: 'Project Management',
    iconName: 'Briefcase',
    description: 'Project-centric workspace for registration, lifecycle execution, schedules, and manager assignments.',
    categories: [
      {
        title: 'Project Workspace Functions',
        subModules: [
          {
            id: 'pm-registration',
            label: 'Project Registration',
            description: 'Register and initialize project records with client association.',
          },
          {
            id: 'pm-details',
            label: 'Project Details',
            description: 'Contractual specifications, scope, timelines, and extension of time (EOT).',
          },
          {
            id: 'pm-lifecycle',
            label: 'Project Lifecycle',
            description: 'Tracking execution phases from award to handover.',
          },
          {
            id: 'pm-milestones',
            label: 'Project Milestones',
            description: 'Project milestone schedules, verification criteria, and claim percentages.',
          },
          {
            id: 'pm-schedule',
            label: 'Project Schedule',
            description: 'Timeline planning, task sequencing, and construction completion dates.',
          },
          {
            id: 'pm-status',
            label: 'Project Status',
            description: 'Current health, delay indicators, and operational status.',
          },
          {
            id: 'pm-assignment',
            label: 'Project Manager Assignment',
            description: 'Assign designated project managers to project leadership roles.',
          },
          {
            id: 'pm-manpower',
            label: 'Manpower & Manhour Planning',
            description: 'Planned manhour scheduling, actual manhour recording, daily site headcount, and planned vs actual monitoring.',
          },
        ],
      },
    ],
  },
  {
    id: 'budget-cost-control',
    label: 'Budget & Cost Control',
    iconName: 'Calculator',
    description: 'Project budget register, 5-step budget creation wizard, actual cost recording, and cost code consumption monitoring.',
    categories: [
      {
        title: 'Budget & Cost Functions',
        subModules: [
          {
            id: 'budget-register',
            label: 'Project Budget Register',
            description: 'Central registry of project budget proposals, approvals, and 5-step budget creation wizard.',
          },
          {
            id: 'budget-actual-costs',
            label: 'Record Actual Cost',
            description: 'Record expenditure incurred against projects and cost codes with budget consumption preview.',
          },
          {
            id: 'budget-monitoring',
            label: 'Budget vs Actual Monitoring',
            description: 'Cost Code-wise comparative analysis of approved budget baseline against actual costs.',
          },
        ],
      },
    ],
  },
  {
    id: 'master',
    label: 'Master',
    iconName: 'Database',
    description: 'Centralized master data repository for business, financial, and operational entities.',
    categories: [
      {
        title: 'Business Masters',
        subModules: [
          {
            id: 'master-customer',
            label: 'Customer',
            description: 'Maintain corporate client records, contacts, and account statuses.',
          },
          {
            id: 'master-project',
            label: 'Project',
            description: 'Master project registry synchronized with Project Management.',
          },
        ],
      },
      {
        title: 'Financial Masters',
        subModules: [
          {
            id: 'master-cost-code',
            label: 'Cost Code',
            description: 'Engineering cost breakdown structure (Parent C-Codes and Child S-Codes).',
          },
        ],
      },
      {
        title: 'Operational Masters',
        subModules: [
          {
            id: 'master-employee',
            label: 'Employee / Manpower',
            description: 'Engineers, supervisors, project managers, and craft workforce records.',
          },
          {
            id: 'master-manpower-cost',
            label: 'Manpower Cost',
            description: 'Manpower cost classification, resource catalog, and hour types.',
          },
          {
            id: 'master-equipment-cost',
            label: 'Equipment Cost',
            description: 'Equipment resource reference catalog with UOM and hour types.',
          },
          {
            id: 'master-machineries-cost',
            label: 'Machineries Cost',
            description: 'Machinery resource reference catalog with UOM and cost code mappings.',
          },
        ],
      },
    ],
  },
  {
    id: 'company',
    label: 'Company',
    iconName: 'Building2',
    description: 'Corporate organizational profile, business units, locations, and system configuration.',
    categories: [
      {
        title: 'Corporate Setup',
        subModules: [
          {
            id: 'co-profile',
            label: 'Company Profile',
            description: 'Legal entity details, default currency, and location code.',
          },
          {
            id: 'co-business-units',
            label: 'Business Units',
            description: 'Organizational business units breakdown.',
          },
          {
            id: 'co-locations',
            label: 'Organizational Locations',
            description: 'Head office, fabrication yards, and regional bases.',
          },
          {
            id: 'co-settings',
            label: 'Company Settings',
            description: 'Corporate parameters and prototype data controls.',
          },
        ],
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    iconName: 'BarChart3',
    description: 'Read-only operational and financial reporting derived from central collections.',
    categories: [
      {
        title: 'Project Reports',
        subModules: [
          {
            id: 'rep-project-register',
            label: 'Project Register',
            description: 'Complete listing of all registered projects and core contract attributes.',
          },
          {
            id: 'rep-project-status',
            label: 'Project Status',
            description: 'Operational health, progress statuses, and delay monitoring.',
          },
          {
            id: 'rep-project-schedule-milestones',
            label: 'Project Schedule and Milestones',
            description: 'Milestone target dates, completion schedules, and claim percentages.',
          },
          {
            id: 'rep-project-manager-projects',
            label: 'Project Manager-wise Projects',
            description: 'Portfolio distribution grouped by assigned project manager.',
          },
        ],
      },
      {
        title: 'Budget Reports',
        subModules: [
          {
            id: 'rep-budget-by-project',
            label: 'Budget by Project',
            description: 'Consolidated approved baseline budget summary per project.',
          },
          {
            id: 'rep-budget-by-cost-code',
            label: 'Budget by Cost Code',
            description: 'Budget allocations aggregated across standardized cost codes.',
          },
          {
            id: 'rep-budget-revision-history',
            label: 'Budget Revision History',
            description: 'Historical audit trail of budget revisions (REV-xx) and approval records.',
          },
          {
            id: 'rep-monthly-budget-phasing',
            label: 'Monthly Budget Phasing',
            description: 'Cash flow forecast and monthly expenditure projections.',
          },
        ],
      },
    ],
  },
];
