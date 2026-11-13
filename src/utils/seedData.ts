/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Customer, ProjectRecord, EmployeeManpower, CostCode, ProjectMilestone, ProjectScheduleItem, ProjectBudget, ManpowerCostResource, EquipmentCostResource, MachineriesCostResource } from '../types';

export const INITIAL_MANPOWER_COST_RESOURCES: ManpowerCostResource[] = [
  { id: 'MP-01', resourceName: 'General Worker', status: 'Active' },
  { id: 'MP-02', resourceName: 'Semi Skilled', status: 'Active' },
  { id: 'MP-03', resourceName: 'Gas Cutter', status: 'Active' },
  { id: 'MP-04', resourceName: 'Grinder', status: 'Active' },
  { id: 'MP-05', resourceName: 'Rigger', status: 'Active' },
  { id: 'MP-06', resourceName: 'Pipe Fitter', status: 'Active' },
];

export const INITIAL_EQUIPMENT_COST_RESOURCES: EquipmentCostResource[] = [
  { id: 'EQ-01', resourceName: '25 TON CRANE', status: 'Active' },
];

export const INITIAL_MACHINERIES_COST_RESOURCES: MachineriesCostResource[] = [
  { id: 'MC-01', resourceName: 'MILLER M/C', status: 'Active' },
  { id: 'MC-02', resourceName: 'GENSET - 25 KVA', status: 'Active' },
  { id: 'MC-03', resourceName: 'GENSET - 60 KVA', status: 'Active' },
  { id: 'MC-04', resourceName: 'GENSET - 100 KVA', status: 'Active' },
  { id: 'MC-05', resourceName: 'GENSET - 150 KVA', status: 'Active' },
  { id: 'MC-06', resourceName: 'AIR COMPRESSOR 175 CFM', status: 'Active' },
  { id: 'MC-07', resourceName: 'CHART RECORDER', status: 'Active' },
  { id: 'MC-08', resourceName: 'MANIFOLD', status: 'Active' },
  { id: 'MC-09', resourceName: 'PIPE ROLLER MACHINE', status: 'Active' },
  { id: 'MC-10', resourceName: 'PUMP', status: 'Active' },
  { id: 'MC-11', resourceName: 'TOWER LIGHT', status: 'Active' },
  { id: 'MC-12', resourceName: 'HYDROTEST MATERIAL FOR RENTAL', status: 'Active' },
  { id: 'MC-13', resourceName: 'VALVE RENTAL', status: 'Active' },
  { id: 'MC-14', resourceName: 'BUNDLE PULLER RENTAL', status: 'Active' },
  { id: 'MC-15', resourceName: 'OTHERS MACHINERIES RENTAL', status: 'Active' },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-01',
    code: 'CUST-CM',
    name: 'CAHYA MATA',
    status: 'Active',
  },
  {
    id: 'CUST-02',
    code: 'CUST-ANC',
    name: 'ALFA NOISE CONTROL SDN BHD',
    status: 'Active',
  },
  {
    id: 'CUST-03',
    code: 'CUST-SFR',
    name: 'SAKURA FERROALLYS SDN BHD',
    status: 'Active',
  },
  {
    id: 'CUST-04',
    code: 'CUST-TTE',
    name: 'T.T.E ENGINEERING SDN BHD',
    status: 'Active',
  },
  {
    id: 'CUST-05',
    code: 'CUST-HBK',
    name: 'HBKF',
    status: 'Active',
  },
];

export const INITIAL_EMPLOYEES: EmployeeManpower[] = [
  {
    id: 'EMP-01',
    code: 'EMP-001',
    name: 'MR.MANIMARAN',
    designation: 'Senior Project Manager',
    resourceType: 'Manpower',
    classification: 'Supervisory / Engineering',
    status: 'Active',
  },
  {
    id: 'EMP-02',
    code: 'EMP-002',
    name: 'MR.MALUSOUNDER',
    designation: 'Project Manager / Operations',
    resourceType: 'Manpower',
    classification: 'Supervisory / Engineering',
    status: 'Active',
  },
  {
    id: 'EMP-03',
    code: 'EMP-003',
    name: 'MR.VIGNESH CM',
    designation: 'Construction Manager',
    resourceType: 'Manpower',
    classification: 'Supervisory / Engineering',
    status: 'Active',
  },
  {
    id: 'EMP-04',
    code: 'EMP-004',
    name: 'MR.SARGUNAN',
    designation: 'Project Lead / Coordinator',
    resourceType: 'Manpower',
    classification: 'Supervisory / Engineering',
    status: 'Active',
  },
];

export const INITIAL_PROJECTS: ProjectRecord[] = [
  {
    id: 'PRJ-044',
    code: '044',
    name: 'SCAFFOLDING ERECTION & DISMANTLING WORKS',
    customerId: 'CUST-01',
    customerName: 'CAHYA MATA',
    projectManager: 'MR.MANIMARAN',
    location: 'MYS',
    startDate: '15-Jan-2026',
    completion: '30-Apr-2026',
    constructionCompletionDate: '30-Apr-2026',
    eot: 'N/A',
    contractValue: 650000,
    projectValue: 650000,
    budget: 485000,
    status: 'In Progress',
  },
  {
    id: 'PRJ-366',
    code: '366',
    name: 'SUPPLY OF MANPOWER FOR TM NXERA-MANPOWER SUPPLY',
    customerId: 'CUST-02',
    customerName: 'ALFA NOISE CONTROL SDN BHD',
    projectManager: 'MR.MALUSOUNDER',
    location: 'MYS',
    startDate: '01-Jan-2026',
    completion: '30-Apr-2026',
    constructionCompletionDate: '30-Apr-2026',
    eot: 'N/A',
    contractValue: 1450000,
    projectValue: 1450000,
    budget: 1120000,
    status: 'In Progress',
  },
  {
    id: 'PRJ-377',
    code: '377',
    name: 'SAKURA PLANT MAINTENANCE WORK',
    customerId: 'CUST-03',
    customerName: 'SAKURA FERROALLYS SDN BHD',
    projectManager: 'MR.MANIMARAN',
    location: 'MYS',
    startDate: '10-Jan-2026',
    completion: '30-Jun-2026',
    constructionCompletionDate: '30-Jun-2026',
    eot: 'N/A',
    contractValue: 2200000,
    projectValue: 2200000,
    budget: 1680000,
    status: 'In Progress',
  },
  {
    id: 'PRJ-389',
    code: '389',
    name: 'PERFORM TUBULAR SCAFFOLDING, TANK CLEANING, PAINTING AND CATHODIC PROTECTION FOR INDUSTRIAL WATER TANK PACKAGE',
    customerId: 'CUST-04',
    customerName: 'T.T.E ENGINEERING SDN BHD',
    projectManager: 'MR.VIGNESH CM',
    location: 'MYS',
    startDate: '01-Feb-2026',
    completion: '15-Jul-2026',
    constructionCompletionDate: '15-Jul-2026',
    eot: 'TBC',
    contractValue: 3500000,
    projectValue: 3500000,
    budget: 2750000,
    status: 'In Progress',
  },
  {
    id: 'PRJ-390',
    code: '390',
    name: 'MANPOWER SUPPLY WORKS FOR HUBEI AIRSEP ENGINEERING & TECHNOLOGY (MALAYSIA)',
    customerId: 'CUST-05',
    customerName: 'HBKF',
    projectManager: 'MR.SARGUNAN',
    location: 'MYS',
    startDate: '05-Feb-2026',
    completion: '31-May-2026',
    constructionCompletionDate: '31-May-2026',
    eot: 'TBC',
    contractValue: 1100000,
    projectValue: 1100000,
    budget: 840000,
    status: 'Confirmed',
  },
];

export const PARENT_C_CODES: CostCode[] = [
  { id: 'CC-1001', code: '1001', description: 'Direct Labor / Manpower Costs', category: 'Direct Cost', level: 'C-Code', status: 'Active', sourceRowIndex: 1 },
  { id: 'CC-1002', code: '1002', description: 'Scaffolding & Temporary Structural Assets', category: 'Direct Cost', level: 'C-Code', status: 'Active', sourceRowIndex: 2 },
  { id: 'CC-1003', code: '1003', description: 'Heavy Plant & Equipment Rental', category: 'Equipment', level: 'C-Code', status: 'Active', sourceRowIndex: 3 },
  { id: 'CC-1004', code: '1004', description: 'Freight, Logistics & Transport Expenses', category: 'Direct Cost', level: 'C-Code', status: 'Active', sourceRowIndex: 4 },
  { id: 'CC-1005', code: '1005', description: 'Engineering, Permitting & Inspection Fees', category: 'Overhead', level: 'C-Code', status: 'Active', sourceRowIndex: 5 },
  { id: 'CC-1006', code: '1006', description: 'Direct Materials & Consumables', category: 'Direct Cost', level: 'C-Code', status: 'Active', sourceRowIndex: 6 },
  { id: 'CC-1007', code: '1007', description: 'Subcontractors & Specialized Trades', category: 'Direct Cost', level: 'C-Code', status: 'Active', sourceRowIndex: 7 },
  { id: 'CC-1008', code: '1008', description: 'Asset Expenses & Capitalization', category: 'Asset', level: 'C-Code', status: 'Active', sourceRowIndex: 8 },
  { id: 'CC-1009', code: '1009', description: 'Plant & Equipment Maintenance', category: 'Overhead', level: 'C-Code', status: 'Active', sourceRowIndex: 9 },
  { id: 'CC-1010', code: '1010', description: 'Site Office & Infrastructure Setup', category: 'Overhead', level: 'C-Code', status: 'Active', sourceRowIndex: 10 },
  { id: 'CC-1011', code: '1011', description: 'Miscellaneous Site Contingency', category: 'Overhead', level: 'C-Code', status: 'Active', sourceRowIndex: 11 },
];

export const generateAuthoritativeSCodes = (): CostCode[] => {
  const codes: CostCode[] = [];
  const definitions: Record<string, string[]> = {
    '1001': [
      'Senior Scaffolding Inspector', 'Certified Advanced Scaffolder', 'Intermediate Scaffolder',
      'Basic Scaffolder', 'Blasting & Painting Inspector (NACE/SSPC)', 'Blaster / Painter Specialist',
      'Tank Cleaning Crew Supervisor', 'Tank Cleaning Operator / Technician', 'Cathodic Protection Technician',
      'Multi-Skilled Mechanical Fitter', '6G Certified Structural Welder', 'Site HSE Officer (Green Book)',
      'Site QA/QC Engineer', 'Project Operations Coordinator', 'General Skilled Site Helper'
    ],
    '1002': [
      'Tubular Steel Scaffold Pipes (BS1139)', 'Scaffold Couplers (Double/Swivel)', 'Metal Deck Scaffold Planks',
      'Scaffold Base Plates & Adjustable Jacks', 'Safety Ladders & Trapdoors', 'Scaffolding Netting & Tarpaulins',
      'Aluminum Mobile Scaffold Towers', 'Heavy Duty Shoring Props', 'Chain Blocks & Rigging Hoists',
      'Safety Harnesses & Life Lines'
    ],
    '1003': [
      '50-Ton Mobile Crane Rental', '25-Ton Rough Terrain Crane', '10-Ton Forklift Hire',
      'Articulating Boom Lift / Skylift', '350 CFM Diesel Air Compressor', 'High Pressure Hydro Blasting Rig',
      'Dehumidifier & Dust Extractor Units', '500 kVA Diesel Generator Unit', 'Site Floodlight Towers',
      'Scaffold Delivery Lorry Crane'
    ],
    '1004': [
      'Material Mobilization Transport (Trailer)', 'Yard-to-Site Local Freight', 'Heavy Equipment Lowbed Transport',
      'Demobilization Logistics Charge', 'Customs & Port Handling Fees'
    ],
    '1005': [
      'DOSH / JKKP Inspection & Green Tagging', 'Third-Party NDT Inspection Services', 'Environmental & Waste Disposal Permits',
      'Cathodic Protection Design Verification', 'PE Endorsement & Structural Calculation Fee'
    ],
    '1006': [
      'Abrasive Grit for Sandblasting', 'Epoxy Primer & Polyurethane Paint', 'Sacrificial Zinc/Magnesium Anodes',
      'High Density Chemical Cleaning Agents', 'Welding Electrodes & Flux Core Wires', 'Gaskets & Fasteners (Stud Bolts/Nuts)',
      'PPE Kits (Coveralls, Boots, Helmets)', 'Rigging Shackles & Webbing Slings'
    ],
    '1007': [
      'Subcontractor - High Pressure Water Jetting', 'Subcontractor - NDT Radiography Testing', 'Subcontractor - Cathodic Protection Wiring',
      'Subcontractor - Hazardous Waste Disposal', 'Subcontractor - Fireproofing Application'
    ],
  };

  let globalIndex = 1;
  Object.entries(definitions).forEach(([cCode, subDescs]) => {
    subDescs.forEach((desc, idx) => {
      const sCodeNum = Number(cCode) * 100 + (idx + 1);
      codes.push({
        id: `CC-${cCode}-S${idx + 1}`,
        code: `S-${sCodeNum}`,
        description: desc,
        category: cCode === '1003' ? 'Equipment' : 'Direct Cost',
        level: 'S-Code',
        parentCCode: cCode,
        status: 'Active',
        sourceRowIndex: globalIndex++,
      });
    });
  });

  return codes;
};

export const INITIAL_MILESTONES: ProjectMilestone[] = [
  // PRJ-044
  { id: 'MS-044-01', projectId: 'PRJ-044', sequence: 1, title: 'Project Registration', description: 'Initial setup and register creation', targetDate: '2026-01-15', actualDate: '2026-01-15', status: 'Completed', remarks: 'Project scope registered under Cahya Mata' },
  { id: 'MS-044-02', projectId: 'PRJ-044', sequence: 2, title: 'Site Mobilisation', description: 'Mobilise scaffolding materials and certified personnel', targetDate: '2026-02-01', actualDate: '2026-02-03', status: 'Completed', remarks: 'Scaffolding crew and gear on site' },
  { id: 'MS-044-03', projectId: 'PRJ-044', sequence: 3, title: 'Scaffolding Material Preparation', description: 'Sort, inspect, and bundle tubular scaffolding components', targetDate: '2026-02-10', actualDate: '2026-02-12', status: 'Completed', remarks: '100% material inspection completed' },
  { id: 'MS-044-04', projectId: 'PRJ-044', sequence: 4, title: 'Scaffolding Erection', description: 'Erect heavy-duty tubular scaffolding structures around target areas', targetDate: '2026-03-01', actualDate: '2026-03-10', status: 'Completed', remarks: 'Scaffolding towers erected to specified elevation' },
  { id: 'MS-044-05', projectId: 'PRJ-044', sequence: 5, title: 'Scaffolding Inspection', description: 'Conduct safety audit, load testing, and green tag issuance', targetDate: '2026-03-15', actualDate: '2026-03-16', status: 'Completed', remarks: 'Green tag certified by HSE inspector' },
  { id: 'MS-044-06', projectId: 'PRJ-044', sequence: 6, title: 'Scaffolding Dismantling', description: 'Dismantle scaffolding post industrial works', targetDate: '2026-04-15', actualDate: undefined, status: 'In Progress', remarks: 'Phase 1 dismantling underway' },
  { id: 'MS-044-07', projectId: 'PRJ-044', sequence: 7, title: 'Site Clearance', description: 'Clear scaffolding components and perform final housekeeping', targetDate: '2026-04-30', actualDate: undefined, status: 'Pending', remarks: 'Scheduled post dismantling' },

  // PRJ-366
  { id: 'MS-366-01', projectId: 'PRJ-366', sequence: 1, title: 'Project Registration', description: 'Formal setup of TM NXERA manpower contract', targetDate: '2026-01-05', actualDate: '2026-01-05', status: 'Completed', remarks: 'Manpower agreement executed' },
  { id: 'MS-366-02', projectId: 'PRJ-366', sequence: 2, title: 'Manpower Requirement Coordination', description: 'Finalize trade roster and cert requirements', targetDate: '2026-01-15', actualDate: '2026-01-18', status: 'Completed', remarks: 'Roster approved for 25 specialists' },
  { id: 'MS-366-03', projectId: 'PRJ-366', sequence: 3, title: 'Manpower Mobilisation', description: 'Onboard crew, issue CIDB green cards, PPE', targetDate: '2026-02-01', actualDate: '2026-02-01', status: 'Completed', remarks: 'Induction completed at TM NXERA site' },
  { id: 'MS-366-04', projectId: 'PRJ-366', sequence: 4, title: 'Manpower Deployment', description: 'Direct site assignment across civil & electrical packages', targetDate: '2026-02-10', actualDate: '2026-02-10', status: 'Completed', remarks: 'Active on site' },
  { id: 'MS-366-05', projectId: 'PRJ-366', sequence: 5, title: 'Manpower Attendance Monitoring', description: 'Daily biometric tracking and timesheet compilation', targetDate: '2026-03-01', actualDate: undefined, status: 'In Progress', remarks: 'Monthly timesheets verified' },
  { id: 'MS-366-06', projectId: 'PRJ-366', sequence: 6, title: 'Manpower Supply Completion', description: 'Final demobilization and contract sign-off', targetDate: '2026-04-30', actualDate: undefined, status: 'Pending', remarks: 'Target completion date 30-Apr-2026' },

  // PRJ-377
  { id: 'MS-377-01', projectId: 'PRJ-377', sequence: 1, title: 'Project Registration', description: 'Annual plant maintenance contract registration', targetDate: '2026-01-10', actualDate: '2026-01-10', status: 'Completed', remarks: 'Maintenance scope registered' },
  { id: 'MS-377-02', projectId: 'PRJ-377', sequence: 2, title: 'Maintenance Planning', description: 'Work permit application and tool calibration', targetDate: '2026-01-20', actualDate: '2026-01-22', status: 'Completed', remarks: 'Permits issued by Sakura HSE' },
  { id: 'MS-377-03', projectId: 'PRJ-377', sequence: 3, title: 'Site Mobilisation', description: 'Deploy maintenance team and equipment to plant site', targetDate: '2026-02-05', actualDate: '2026-02-05', status: 'Completed', remarks: 'Mechanical and electrical crews deployed' },
  { id: 'MS-377-04', projectId: 'PRJ-377', sequence: 4, title: 'Plant Maintenance Execution', description: 'Execute mechanical overhauls, piping, and valve servicing', targetDate: '2026-02-15', actualDate: undefined, status: 'In Progress', remarks: 'Major overhaul phase active' },
  { id: 'MS-377-05', projectId: 'PRJ-377', sequence: 5, title: 'Maintenance Inspection', description: 'Pressure testing and QA sign-off', targetDate: '2026-05-30', actualDate: undefined, status: 'Pending', remarks: 'Scheduled post execution' },
  { id: 'MS-377-06', projectId: 'PRJ-377', sequence: 6, title: 'Maintenance Work Completion', description: 'Final plant handover and documentation sign-off', targetDate: '2026-06-30', actualDate: undefined, status: 'Pending', remarks: 'Target completion 30-Jun-2026' },

  // PRJ-389
  { id: 'MS-389-01', projectId: 'PRJ-389', sequence: 1, title: 'Project Registration', description: 'Water tank multi-discipline overhaul contract setup', targetDate: '2026-02-01', actualDate: '2026-02-01', status: 'Completed', remarks: 'Multi-trade contract registered' },
  { id: 'MS-389-02', projectId: 'PRJ-389', sequence: 2, title: 'Site Mobilisation', description: 'Mobilise blasting pots, scaffolding, and safety gear', targetDate: '2026-02-15', actualDate: '2026-02-18', status: 'Completed', remarks: 'Blasting & painting rigs on site' },
  { id: 'MS-389-03', projectId: 'PRJ-389', sequence: 3, title: 'Tubular Scaffolding', description: 'Erect external & internal tank scaffolding', targetDate: '2026-03-01', actualDate: '2026-03-12', status: 'Completed', remarks: 'Internal tank scaffolding erected' },
  { id: 'MS-389-04', projectId: 'PRJ-389', sequence: 4, title: 'Tank Cleaning', description: 'Sludge removal, chemical wash, and surface prep', targetDate: '2026-03-15', actualDate: undefined, status: 'In Progress', remarks: 'Sludge removal 80% complete' },
  { id: 'MS-389-05', projectId: 'PRJ-389', sequence: 5, title: 'Tank Surface Preparation', description: 'Grit blasting to SA 2.5 standard', targetDate: '2026-04-01', actualDate: undefined, status: 'Pending', remarks: 'Pending cleaning completion' },
  { id: 'MS-389-06', projectId: 'PRJ-389', sequence: 6, title: 'Painting Work', description: 'Epoxy primer and polyurethane topcoat application', targetDate: '2026-04-20', actualDate: undefined, status: 'Pending', remarks: 'Material staged on site' },
  { id: 'MS-389-07', projectId: 'PRJ-389', sequence: 7, title: 'Cathodic Protection Work', description: 'Sacrificial anode installation and wiring', targetDate: '2026-05-10', actualDate: undefined, status: 'Pending', remarks: 'Anodes delivered' },
  { id: 'MS-389-08', projectId: 'PRJ-389', sequence: 8, title: 'Inspection and Completion', description: 'Holiday testing, thickness check, and final sign-off', targetDate: '2026-05-30', actualDate: undefined, status: 'Pending', remarks: 'Completion date TBC' },

  // PRJ-390
  { id: 'MS-390-01', projectId: 'PRJ-390', sequence: 1, title: 'Project Registration', description: 'Setup of manpower supply contract for Airsep project', targetDate: '2026-02-05', actualDate: '2026-02-05', status: 'Completed', remarks: 'Airsep contract registered' },
  { id: 'MS-390-02', projectId: 'PRJ-390', sequence: 2, title: 'Manpower Requirement Coordination', description: 'Alignment on mechanical fitters and welders', targetDate: '2026-02-15', actualDate: '2026-02-15', status: 'Completed', remarks: '18 skilled trades confirmed' },
  { id: 'MS-390-03', projectId: 'PRJ-390', sequence: 3, title: 'Manpower Mobilisation', description: 'Site briefing, medical checks, and CIDB passes', targetDate: '2026-03-01', actualDate: '2026-03-02', status: 'Completed', remarks: 'Safety pass issued' },
  { id: 'MS-390-04', projectId: 'PRJ-390', sequence: 4, title: 'Manpower Deployment', description: 'Deployment to Airsep plant construction site', targetDate: '2026-03-10', actualDate: undefined, status: 'In Progress', remarks: 'Active on site' },
  { id: 'MS-390-05', projectId: 'PRJ-390', sequence: 5, title: 'Manpower Coordination', description: 'Daily shift allocation and supervisor reporting', targetDate: '2026-03-20', actualDate: undefined, status: 'In Progress', remarks: 'Shift monitoring active' },
  { id: 'MS-390-06', projectId: 'PRJ-390', sequence: 6, title: 'Manpower Supply Completion', description: 'Demobilization and final billing reconciliation', targetDate: '2026-05-31', actualDate: undefined, status: 'Pending', remarks: 'Completion date TBC' },
];

export const INITIAL_SCHEDULE_ITEMS: ProjectScheduleItem[] = [
  // PRJ-044
  { id: 'SCH-044-01', projectId: 'PRJ-044', sequence: 1, taskName: 'Project Kickoff & Registration', group: 'Registration', startDate: '2026-01-15', endDate: '2026-01-20', actualStartDate: '2026-01-15', actualEndDate: '2026-01-20', status: 'Completed', progress: 100 },
  { id: 'SCH-044-02', projectId: 'PRJ-044', sequence: 2, taskName: 'Yard & Site Mobilisation', group: 'Mobilisation', startDate: '2026-02-01', endDate: '2026-02-10', actualStartDate: '2026-02-03', actualEndDate: '2026-02-10', status: 'Completed', progress: 100 },
  { id: 'SCH-044-03', projectId: 'PRJ-044', sequence: 3, taskName: 'Scaffolding Staging & Pre-Inspection', group: 'Preparation', startDate: '2026-02-11', endDate: '2026-02-28', actualStartDate: '2026-02-12', actualEndDate: '2026-02-28', status: 'Completed', progress: 100 },
  { id: 'SCH-044-04', projectId: 'PRJ-044', sequence: 4, taskName: 'Main Tubular Erection Works', group: 'Execution', startDate: '2026-03-01', endDate: '2026-03-15', actualStartDate: '2026-03-01', actualEndDate: '2026-03-15', status: 'Completed', progress: 100 },
  { id: 'SCH-044-05', projectId: 'PRJ-044', sequence: 5, taskName: 'HSE Structural Inspection & Tagging', group: 'Monitoring', startDate: '2026-03-16', endDate: '2026-03-20', actualStartDate: '2026-03-16', actualEndDate: '2026-03-18', status: 'Completed', progress: 100 },
  { id: 'SCH-044-06', projectId: 'PRJ-044', sequence: 6, taskName: 'Controlled Dismantling Phase', group: 'Execution', startDate: '2026-04-01', endDate: '2026-04-25', actualStartDate: '2026-04-01', actualEndDate: undefined, status: 'In Progress', progress: 60 },
  { id: 'SCH-044-07', projectId: 'PRJ-044', sequence: 7, taskName: 'Site De-mobilisation & Clearance', group: 'Completion', startDate: '2026-04-26', endDate: '2026-04-30', actualStartDate: undefined, actualEndDate: undefined, status: 'Scheduled', progress: 0 },

  // PRJ-366
  { id: 'SCH-366-01', projectId: 'PRJ-366', sequence: 1, taskName: 'Contract Registration & Setup', group: 'Registration', startDate: '2026-01-05', endDate: '2026-01-10', actualStartDate: '2026-01-05', actualEndDate: '2026-01-10', status: 'Completed', progress: 100 },
  { id: 'SCH-366-02', projectId: 'PRJ-366', sequence: 2, taskName: 'Trade Selection & Screening', group: 'Planning', startDate: '2026-01-11', endDate: '2026-01-25', actualStartDate: '2026-01-12', actualEndDate: '2026-01-25', status: 'Completed', progress: 100 },
  { id: 'SCH-366-03', projectId: 'PRJ-366', sequence: 3, taskName: 'CIDB & Safety Onboarding', group: 'Mobilisation', startDate: '2026-01-26', endDate: '2026-02-05', actualStartDate: '2026-01-26', actualEndDate: '2026-02-05', status: 'Completed', progress: 100 },
  { id: 'SCH-366-04', projectId: 'PRJ-366', sequence: 4, taskName: 'Full Fleet Deployment', group: 'Execution', startDate: '2026-02-06', endDate: '2026-03-31', actualStartDate: '2026-02-06', actualEndDate: undefined, status: 'In Progress', progress: 75 },
  { id: 'SCH-366-05', projectId: 'PRJ-366', sequence: 5, taskName: 'Monthly Timesheet & Audit', group: 'Monitoring', startDate: '2026-03-01', endDate: '2026-04-20', actualStartDate: '2026-03-01', actualEndDate: undefined, status: 'In Progress', progress: 50 },
  { id: 'SCH-366-06', projectId: 'PRJ-366', sequence: 6, taskName: 'Project Handover & Demob', group: 'Completion', startDate: '2026-04-21', endDate: '2026-04-30', actualStartDate: undefined, actualEndDate: undefined, status: 'Scheduled', progress: 0 },

  // PRJ-377
  { id: 'SCH-377-01', projectId: 'PRJ-377', sequence: 1, taskName: 'Contract Scope Registration', group: 'Registration', startDate: '2026-01-10', endDate: '2026-01-15', actualStartDate: '2026-01-10', actualEndDate: '2026-01-15', status: 'Completed', progress: 100 },
  { id: 'SCH-377-02', projectId: 'PRJ-377', sequence: 2, taskName: 'Cold & Hot Work Permits', group: 'Planning', startDate: '2026-01-16', endDate: '2026-02-01', actualStartDate: '2026-01-18', actualEndDate: '2026-02-01', status: 'Completed', progress: 100 },
  { id: 'SCH-377-03', projectId: 'PRJ-377', sequence: 3, taskName: 'Tooling & Crew Mobilisation', group: 'Mobilisation', startDate: '2026-02-02', endDate: '2026-02-12', actualStartDate: '2026-02-02', actualEndDate: '2026-02-12', status: 'Completed', progress: 100 },
  { id: 'SCH-377-04', projectId: 'PRJ-377', sequence: 4, taskName: 'Overhaul & Piping Servicing', group: 'Execution', startDate: '2026-02-13', endDate: '2026-05-15', actualStartDate: '2026-02-13', actualEndDate: undefined, status: 'In Progress', progress: 55 },
  { id: 'SCH-377-05', projectId: 'PRJ-377', sequence: 5, taskName: 'Hydro-testing & QA/QC Audit', group: 'Monitoring', startDate: '2026-05-16', endDate: '2026-06-15', actualStartDate: undefined, actualEndDate: undefined, status: 'Scheduled', progress: 0 },
  { id: 'SCH-377-06', projectId: 'PRJ-377', sequence: 6, taskName: 'Final Plant Handover', group: 'Completion', startDate: '2026-06-16', endDate: '2026-06-30', actualStartDate: undefined, actualEndDate: undefined, status: 'Scheduled', progress: 0 },

  // PRJ-389
  { id: 'SCH-389-01', projectId: 'PRJ-389', sequence: 1, taskName: 'Work Package Registration', group: 'Registration', startDate: '2026-02-01', endDate: '2026-02-10', actualStartDate: '2026-02-01', actualEndDate: '2026-02-10', status: 'Completed', progress: 100 },
  { id: 'SCH-389-02', projectId: 'PRJ-389', sequence: 2, taskName: 'Equipment & Rig Mobilisation', group: 'Mobilisation', startDate: '2026-02-11', endDate: '2026-02-28', actualStartDate: '2026-02-15', actualEndDate: '2026-02-28', status: 'Completed', progress: 100 },
  { id: 'SCH-389-03', projectId: 'PRJ-389', sequence: 3, taskName: 'Tank Internal Scaffolding', group: 'Preparation', startDate: '2026-03-01', endDate: '2026-03-14', actualStartDate: '2026-03-01', actualEndDate: '2026-03-14', status: 'Completed', progress: 100 },
  { id: 'SCH-389-04', projectId: 'PRJ-389', sequence: 4, taskName: 'Tank Sludge Cleaning & Wash', group: 'Execution', startDate: '2026-03-15', endDate: '2026-03-31', actualStartDate: '2026-03-15', actualEndDate: undefined, status: 'In Progress', progress: 80 },
  { id: 'SCH-389-05', projectId: 'PRJ-389', sequence: 5, taskName: 'Surface Grit Blasting (SA 2.5)', group: 'Execution', startDate: '2026-04-01', endDate: '2026-04-19', actualStartDate: undefined, actualEndDate: undefined, status: 'Scheduled', progress: 0 },
  { id: 'SCH-389-06', projectId: 'PRJ-389', sequence: 6, taskName: 'Epoxy Coating & Painting', group: 'Execution', startDate: '2026-04-20', endDate: '2026-05-09', actualStartDate: undefined, actualEndDate: undefined, status: 'Scheduled', progress: 0 },
  { id: 'SCH-389-07', projectId: 'PRJ-389', sequence: 7, taskName: 'Cathodic Protection Installation', group: 'Execution', startDate: '2026-05-10', endDate: '2026-05-25', actualStartDate: undefined, actualEndDate: undefined, status: 'Scheduled', progress: 0 },
  { id: 'SCH-389-08', projectId: 'PRJ-389', sequence: 8, taskName: 'Holiday Test & Tank Handover', group: 'Completion', startDate: '2026-05-26', endDate: '2026-06-10', actualStartDate: undefined, actualEndDate: undefined, status: 'Scheduled', progress: 0 },

  // PRJ-390
  { id: 'SCH-390-01', projectId: 'PRJ-390', sequence: 1, taskName: 'Contract & Scope Registration', group: 'Registration', startDate: '2026-02-05', endDate: '2026-02-12', actualStartDate: '2026-02-05', actualEndDate: '2026-02-12', status: 'Completed', progress: 100 },
  { id: 'SCH-390-02', projectId: 'PRJ-390', sequence: 2, taskName: 'Manpower Trade Screening', group: 'Planning', startDate: '2026-02-13', endDate: '2026-02-28', actualStartDate: '2026-02-13', actualEndDate: '2026-02-28', status: 'Completed', progress: 100 },
  { id: 'SCH-390-03', projectId: 'PRJ-390', sequence: 3, taskName: 'CIDB & Medical Mobilisation', group: 'Mobilisation', startDate: '2026-03-01', endDate: '2026-03-09', actualStartDate: '2026-03-02', actualEndDate: '2026-03-09', status: 'Completed', progress: 100 },
  { id: 'SCH-390-04', projectId: 'PRJ-390', sequence: 4, taskName: 'Site Workstation Deployment', group: 'Execution', startDate: '2026-03-10', endDate: '2026-04-30', actualStartDate: '2026-03-10', actualEndDate: undefined, status: 'In Progress', progress: 65 },
  { id: 'SCH-390-05', projectId: 'PRJ-390', sequence: 5, taskName: 'Weekly Performance & Shift Audit', group: 'Monitoring', startDate: '2026-03-20', endDate: '2026-05-15', actualStartDate: '2026-03-20', actualEndDate: undefined, status: 'In Progress', progress: 40 },
  { id: 'SCH-390-06', projectId: 'PRJ-390', sequence: 6, taskName: 'Contract Closeout & Demob', group: 'Completion', startDate: '2026-05-16', endDate: '2026-05-31', actualStartDate: undefined, actualEndDate: undefined, status: 'Scheduled', progress: 0 },
];

export const INITIAL_BUDGETS: ProjectBudget[] = [
  {
    id: 'BDG-044-REV00',
    refNo: 'BDG-044-REV00',
    projectId: 'PRJ-044',
    projectCode: '044',
    projectName: 'SCAFFOLDING ERECTION & DISMANTLING WORKS',
    projectUnder: 'Direct Contract',
    client: 'CAHYA MATA',
    startDate: '15-Jan-2026',
    status: 'Draft',
    projectIncharge: 'MR.MANIMARAN',
    jobScope: 'Scaffolding erection and dismantling package for industrial plant maintenance',
    revision: 'REV-00',
    totalBudget: 485000,
    monthlyColumns: [],
    costCodeAllocations: [
      {
        id: 'CC-1001-S1',
        cCode: '1001',
        cCodeDescription: 'Manpower Cost',
        sCode: 'S-100101',
        sCodeDescription: 'Senior Scaffolding Inspector & Riggers',
        monthlyAmounts: { 'Jan-26': 30000, 'Feb-26': 45000, 'Mar-26': 45000, 'Apr-26': 30000 },
        totalAmount: 150000,
        
      },
      {
        id: 'CC-1002-S1',
        cCode: '1002',
        cCodeDescription: 'Administrative Expenses',
        sCode: 'S-100201',
        sCodeDescription: 'Tubular Steel Scaffold Pipes (BS1139)',
        monthlyAmounts: { 'Jan-26': 50000, 'Feb-26': 60000, 'Mar-26': 40000 },
        totalAmount: 150000,
        
      },
      {
        id: 'CC-1003-S1',
        cCode: '1003',
        cCodeDescription: 'Equipment Cost',
        sCode: 'S-100301',
        sCodeDescription: 'Mobile Crane & Lifting Equipment Hire',
        monthlyAmounts: { 'Feb-26': 35000, 'Mar-26': 35000, 'Apr-26': 15000 },
        totalAmount: 85000,
        
      },
      {
        id: 'CC-1006-S1',
        cCode: '1006',
        cCodeDescription: 'Procurement & Purchase',
        sCode: 'S-100601',
        sCodeDescription: 'Abrasive Grit & Safety Fasteners',
        monthlyAmounts: { 'Jan-26': 25000, 'Feb-26': 45000, 'Mar-26': 30000 },
        totalAmount: 100000,
        
      },
    ],
  },
  {
    id: 'BDG-366-REV00',
    refNo: 'BDG-366-REV00',
    projectId: 'PRJ-366',
    projectCode: '366',
    projectName: 'SUPPLY OF MANPOWER FOR TM NXERA-MANPOWER SUPPLY',
    projectUnder: 'Sub-contract',
    client: 'ALFA NOISE CONTROL SDN BHD',
    startDate: '01-Jan-2026',
    status: 'Submitted',
    projectIncharge: 'MR.MALUSOUNDER',
    jobScope: 'Manpower supply for TM NXERA data center expansion project',
    revision: 'REV-00',
    totalBudget: 485000,
    monthlyColumns: [],
    costCodeAllocations: [
      {
        id: 'CC-1001-S1',
        cCode: '1001',
        cCodeDescription: 'Manpower Cost',
        sCode: 'S-100101',
        sCodeDescription: 'Certified Data Center Trades',
        monthlyAmounts: { 'Jan-26': 120000, 'Feb-26': 180000, 'Mar-26': 180000, 'Apr-26': 140000 },
        totalAmount: 620000,
        
      },
      {
        id: 'CC-1006-S1',
        cCode: '1006',
        cCodeDescription: 'Procurement & Purchase',
        sCode: 'S-100601',
        sCodeDescription: 'Electrical Cables & Accessories',
        monthlyAmounts: { 'Jan-26': 100000, 'Feb-26': 150000, 'Mar-26': 150000, 'Apr-26': 100000 },
        totalAmount: 500000,
        
      },
    ],
  },
  {
    id: 'BDG-377-REV00',
    refNo: 'BDG-377-REV00',
    projectId: 'PRJ-377',
    projectCode: '377',
    projectName: 'SAKURA PLANT MAINTENANCE WORK',
    projectUnder: 'Maintenance Package',
    client: 'SAKURA FERROALLYS SDN BHD',
    startDate: '10-Jan-2026',
    status: 'Approved',
    approvedDate: '2026-01-20',
    approvedBy: 'Designated Approver',
    projectIncharge: 'MR.MANIMARAN',
    jobScope: 'Annual plant turnaround and mechanical servicing works',
    revision: 'REV-00',
    totalBudget: 485000,
    monthlyColumns: [],
    costCodeAllocations: [
      {
        id: 'CC-1001-S1',
        cCode: '1001',
        cCodeDescription: 'Manpower Cost',
        sCode: 'S-100101',
        sCodeDescription: 'Plant Maintenance Mechanics & Welders',
        monthlyAmounts: { 'Jan-26': 150000, 'Feb-26': 200000, 'Mar-26': 200000, 'Apr-26': 150000, 'May-26': 100000 },
        totalAmount: 800000,
        
      },
      {
        id: 'CC-1003-S1',
        cCode: '1003',
        cCodeDescription: 'Equipment Cost',
        sCode: 'S-100301',
        sCodeDescription: 'Plant Overhaul Rigging Equipment',
        monthlyAmounts: { 'Jan-26': 80000, 'Feb-26': 120000, 'Mar-26': 120000, 'Apr-26': 80000 },
        totalAmount: 400000,
        
      },
      {
        id: 'CC-1006-S1',
        cCode: '1006',
        cCodeDescription: 'Procurement & Purchase',
        sCode: 'S-100601',
        sCodeDescription: 'Replacement Gaskets, Valves & Consumables',
        monthlyAmounts: { 'Feb-26': 150000, 'Mar-26': 200000, 'Apr-26': 130000 },
        totalAmount: 480000,
        
      },
    ],
  },
  {
    id: 'BDG-389-REV00',
    refNo: 'BDG-389-REV00',
    projectId: 'PRJ-389',
    projectCode: '389',
    projectName: 'PERFORM TUBULAR SCAFFOLDING, TANK CLEANING, PAINTING AND CATHODIC PROTECTION FOR INDUSTRIAL WATER TANK PACKAGE',
    projectUnder: 'Turnkey Package',
    client: 'T.T.E ENGINEERING SDN BHD',
    startDate: '01-Feb-2026',
    status: 'Draft',
    projectIncharge: 'MR.VIGNESH CM',
    jobScope: 'Multi-discipline water tank overhaul, scaffolding, cleaning, painting and cathodic protection',
    revision: 'REV-00',
    totalBudget: 485000,
    monthlyColumns: [],
    costCodeAllocations: [
      {
        id: 'CC-1001-S1',
        cCode: '1001',
        cCodeDescription: 'Manpower Cost',
        sCode: 'S-100101',
        sCodeDescription: 'Blasting, Painting & Tank Cleaning Specialists',
        monthlyAmounts: { 'Feb-26': 200000, 'Mar-26': 300000, 'Apr-26': 300000, 'May-26': 200000 },
        totalAmount: 1000000,
        
      },
      {
        id: 'CC-1006-S1',
        cCode: '1006',
        cCodeDescription: 'Procurement & Purchase',
        sCode: 'S-100601',
        sCodeDescription: 'Industrial Tank Primers & Polyurethane Coatings',
        monthlyAmounts: { 'Feb-26': 250000, 'Mar-26': 350000, 'Apr-26': 350000, 'May-26': 150000 },
        totalAmount: 1100000,
        
      },
      {
        id: 'CC-1007-S1',
        cCode: '1007',
        cCodeDescription: 'Sub-Contractor Payment',
        sCode: 'S-100701',
        sCodeDescription: 'Cathodic Protection Anode & Wiring Subcontractor',
        monthlyAmounts: { 'Mar-26': 200000, 'Apr-26': 250000, 'May-26': 200000 },
        totalAmount: 650000,
        
      },
    ],
  },
  {
    id: 'BDG-390-REV00',
    refNo: 'BDG-390-REV00',
    projectId: 'PRJ-390',
    projectCode: '390',
    projectName: 'MANPOWER SUPPLY WORKS FOR HUBEI AIRSEP ENGINEERING & TECHNOLOGY (MALAYSIA)',
    projectUnder: 'Manpower Supply',
    client: 'HBKF',
    startDate: '05-Feb-2026',
    status: 'Draft',
    projectIncharge: 'MR.SARGUNAN',
    jobScope: 'Skilled trade manpower supply for industrial gas plant construction',
    revision: 'REV-00',
    totalBudget: 485000,
    monthlyColumns: [],
    costCodeAllocations: [
      {
        id: 'CC-1001-S1',
        cCode: '1001',
        cCodeDescription: 'Manpower Cost',
        sCode: 'S-100101',
        sCodeDescription: 'Certified Airsep Welders & Fitters',
        monthlyAmounts: { 'Feb-26': 120000, 'Mar-26': 180000, 'Apr-26': 180000, 'May-26': 120000 },
        totalAmount: 600000,
        
      },
      {
        id: 'CC-1006-S1',
        cCode: '1006',
        cCodeDescription: 'Procurement & Purchase',
        sCode: 'S-100601',
        sCodeDescription: 'Welding Consumables & PPE Kits',
        monthlyAmounts: { 'Feb-26': 50000, 'Mar-26': 80000, 'Apr-26': 70000, 'May-26': 40000 },
        totalAmount: 240000,
        
      },
    ],
  },
];
