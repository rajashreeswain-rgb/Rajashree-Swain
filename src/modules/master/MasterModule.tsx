/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ListingTable } from '../../components/common/ListingTable';
import { SlideOverForm, FormField } from '../../components/common/SlideOverForm';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Customer,
  ProjectRecord,
  CostCode,
  EmployeeManpower,
  ManpowerCostResource,
  EquipmentCostResource,
  MachineriesCostResource,
  ColumnDef,
} from '../../types';
import { Plus, Trash2 } from 'lucide-react';

export const MasterModule: React.FC = () => {
  const {
    activeSubModule,
    customers,
    projects,
    costCodes,
    employees,
    manpowerCostResources,
    equipmentCostResources,
    machineriesCostResources,
    addCustomer,
    deleteCustomer,
    addProject,
    deleteProject,
    addCostCode,
    deleteCostCode,
    addEmployee,
    deleteEmployee,
    addManpowerCostResource,
    deleteManpowerCostResource,
    addEquipmentCostResource,
    deleteEquipmentCostResource,
    addMachineriesCostResource,
    deleteMachineriesCostResource,
  } = useAppStore();

  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  const activeSub = activeSubModule || 'master-customer';

  // 1. Customer Columns & Form
  const customerColumns: ColumnDef<Customer>[] = [
    {
      key: 'name',
      header: 'Customer Name',
      sortable: true,
      render: (c) => <span className="font-semibold text-slate-900">{c.name}</span>,
    },
    {
      key: 'code',
      header: 'Customer Code',
      sortable: true,
      render: (c) => <span className="font-mono">{c.code || c.id}</span>,
    },
    {
      key: 'contactPerson',
      header: 'Contact Person',
      render: (c) => c.contactPerson || '—',
    },
    {
      key: 'email',
      header: 'Email',
      render: (c) => c.email || '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => <StatusBadge label={c.status} />,
    },
  ];

  const customerFields: FormField[] = [
    { name: 'name', label: 'Customer Name', type: 'text', required: true, placeholder: 'e.g. CAHYA MATA, ALFA NOISE CONTROL' },
    { name: 'code', label: 'Customer Code', type: 'text', required: false, placeholder: 'e.g. CUST-001' },
    { name: 'contactPerson', label: 'Contact Person', type: 'text', required: false, placeholder: 'e.g. Encik Ahmad' },
    { name: 'email', label: 'Email Address', type: 'text', required: false, placeholder: 'corporate@client.com' },
    { name: 'billingAddress', label: 'Billing Address', type: 'textarea', required: false, placeholder: 'Client corporate address' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'Active',
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
      ],
    },
  ];

  // 2. Project Master Columns & Form
  const projectColumns: ColumnDef<ProjectRecord>[] = [
    {
      key: 'code',
      header: 'Project Code',
      sortable: true,
      render: (p) => <span className="font-mono font-bold text-blue-700">{p.code}</span>,
    },
    {
      key: 'name',
      header: 'Project Title',
      sortable: true,
      render: (p) => <span className="font-medium text-slate-900">{p.name}</span>,
    },
    {
      key: 'customerName',
      header: 'Client',
      render: (p) => p.customerName || '—',
    },
    {
      key: 'projectManager',
      header: 'Project Manager',
      render: (p) => p.projectManager || '—',
    },
    {
      key: 'completion',
      header: 'Completion',
      render: (p) => <span className="font-mono">{p.completion || p.constructionCompletionDate || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => <StatusBadge label={p.status || 'Confirmed'} />,
    },
  ];

  const projectFields: FormField[] = [
    { name: 'code', label: 'Project Code', type: 'text', required: true, placeholder: 'e.g. 044, 366' },
    { name: 'name', label: 'Project Name / Description', type: 'text', required: true, placeholder: 'e.g. Scaffolding Works' },
    {
      name: 'customerId',
      label: 'Client / Customer',
      type: 'select',
      required: false,
      options: customers.map((c) => ({ label: c.name, value: c.id })),
    },
    { name: 'projectManager', label: 'Project Manager', type: 'text', required: false, placeholder: 'e.g. MR.MANIMARAN' },
    { name: 'completion', label: 'Completion Target', type: 'text', required: false, placeholder: 'e.g. 30-Apr-26' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'Confirmed',
      options: [
        { label: 'Confirmed', value: 'Confirmed' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Completed', value: 'Completed' },
      ],
    },
  ];

  // 3. Cost Code Columns & Form
  const costCodeColumns: ColumnDef<CostCode>[] = [
    {
      key: 'code',
      header: 'Cost Code',
      sortable: true,
      render: (c) => <span className="font-mono font-bold text-blue-700">{c.code}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      sortable: true,
      render: (c) => <span className="font-medium text-slate-900">{c.description}</span>,
    },
    {
      key: 'category',
      header: 'Cost Category',
      render: (c) => (
        <span className="text-[11px] px-2 py-0.5 bg-slate-100 rounded font-medium text-slate-700">
          {c.category}
        </span>
      ),
    },
    {
      key: 'parentCCode',
      header: 'Parent C-Code',
      render: (c) => <span className="font-mono text-slate-500">{c.parentCCode || '— (Parent)'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => <StatusBadge label={c.status} />,
    },
  ];

  const costCodeFields: FormField[] = [
    { name: 'code', label: 'Cost Code', type: 'text', required: true, placeholder: 'e.g. 1001 or S-101' },
    { name: 'description', label: 'Cost Code Description', type: 'text', required: true, placeholder: 'e.g. Direct Materials - Pipes' },
    {
      name: 'category',
      label: 'Cost Category',
      type: 'select',
      required: true,
      options: [
        { label: 'Direct Cost', value: 'Direct Cost' },
        { label: 'Indirect Cost', value: 'Indirect Cost' },
        { label: 'Equipment', value: 'Equipment' },
        { label: 'Subcontract', value: 'Subcontract' },
        { label: 'Overhead', value: 'Overhead' },
      ],
    },
    { name: 'parentCCode', label: 'Parent C-Code (If S-Code)', type: 'text', required: false, placeholder: 'e.g. 1001' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'Active',
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
      ],
    },
  ];

  // 4. Employee Columns & Form
  const employeeColumns: ColumnDef<EmployeeManpower>[] = [
    {
      key: 'name',
      header: 'Employee / Staff Name',
      sortable: true,
      render: (e) => <span className="font-semibold text-slate-900">{e.name}</span>,
    },
    {
      key: 'code',
      header: 'Staff ID',
      render: (e) => <span className="font-mono">{e.code || e.id}</span>,
    },
    {
      key: 'designation',
      header: 'Designation / Role',
      render: (e) => e.designation || '—',
    },
    {
      key: 'resourceType',
      header: 'Resource Type',
      render: (e) => e.resourceType || 'Manpower',
    },
    {
      key: 'status',
      header: 'Status',
      render: (e) => <StatusBadge label={e.status} />,
    },
  ];

  const employeeFields: FormField[] = [
    { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g. MR.MANIMARAN' },
    { name: 'code', label: 'Employee / Staff ID', type: 'text', required: false, placeholder: 'e.g. EMP-001' },
    { name: 'designation', label: 'Designation / Trade', type: 'text', required: false, placeholder: 'e.g. Project Manager, 6G Welder' },
    {
      name: 'resourceType',
      label: 'Resource Type',
      type: 'select',
      required: true,
      defaultValue: 'Manpower',
      options: [
        { label: 'Manpower', value: 'Manpower' },
        { label: 'Equipment', value: 'Equipment' },
        { label: 'Machinery', value: 'Machinery' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'Active',
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
        { label: 'Mobilized', value: 'Mobilized' },
      ],
    },
  ];

  // 5. Manpower Cost Columns & Form
  const manpowerCostColumns: ColumnDef<ManpowerCostResource>[] = [
    {
      key: 'resourceName',
      header: 'Resource Name',
      sortable: true,
      render: (r) => <span className="font-semibold text-slate-900">{r.resourceName}</span>,
    },
    {
      key: 'classification',
      header: 'Direct / Indirect',
      sortable: true,
      render: (r) => (
        <span
          className={`text-[11px] px-2 py-0.5 rounded font-medium ${
            r.classification === 'Direct' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'
          }`}
        >
          {r.classification || '—'}
        </span>
      ),
    },
    {
      key: 'costDetails',
      header: 'Cost Details',
      render: (r) => <span className="text-slate-700">{r.costDetails || '—'}</span>,
    },
    {
      key: 'origin',
      header: 'Local / Foreigner',
      render: (r) => <span className="text-slate-700">{r.origin || '—'}</span>,
    },
    {
      key: 'hourType',
      header: 'Hour Type',
      render: (r) => <span className="font-mono text-slate-700">{r.hourType || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge label={r.status} />,
    },
  ];

  const manpowerCostFields: FormField[] = [
    { name: 'resourceName', label: 'Resource Name', type: 'text', required: true, placeholder: 'e.g. Scaffolder Level 1, 6G Welder' },
    {
      name: 'classification',
      label: 'Direct / Indirect',
      type: 'select',
      required: true,
      defaultValue: 'Direct',
      options: [
        { label: 'Direct', value: 'Direct' },
        { label: 'Indirect', value: 'Indirect' },
      ],
    },
    { name: 'costDetails', label: 'Cost Details / Category', type: 'text', required: false, placeholder: 'e.g. Accommodation, Transport, Visa, Levy, PPE, MPK, CIDB' },
    {
      name: 'origin',
      label: 'Local / Foreigner',
      type: 'select',
      required: false,
      options: [
        { label: 'Local', value: 'Local' },
        { label: 'Foreigner', value: 'Foreigner' },
      ],
    },
    {
      name: 'hourType',
      label: 'Hour Type',
      type: 'select',
      required: false,
      options: [
        { label: 'NOR', value: 'NOR' },
        { label: 'OT', value: 'OT' },
        { label: 'SUN/P.H OT', value: 'SUN/P.H OT' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'Active',
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
      ],
    },
  ];

  // 6. Equipment Cost Columns & Form
  const equipmentCostColumns: ColumnDef<EquipmentCostResource>[] = [
    {
      key: 'resourceName',
      header: 'Resource Name',
      sortable: true,
      render: (r) => <span className="font-semibold text-slate-900">{r.resourceName}</span>,
    },
    {
      key: 'uom',
      header: 'UOM',
      render: (r) => <span className="font-mono text-slate-700">{r.uom || '—'}</span>,
    },
    {
      key: 'hourType',
      header: 'Hour Type',
      render: (r) => <span className="font-mono text-slate-700">{r.hourType || '—'}</span>,
    },
    {
      key: 'sourceCostCode',
      header: 'Source Cost Code',
      render: (r) => <span className="font-mono font-bold text-blue-700">{r.sourceCostCode || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge label={r.status} />,
    },
  ];

  const equipmentCostFields: FormField[] = [
    { name: 'resourceName', label: 'Resource Name', type: 'text', required: true, placeholder: 'e.g. 50T Mobile Crane, Scaffolding Pipes (BS1139)' },
    { name: 'uom', label: 'Unit of Measurement (UOM)', type: 'text', required: false, placeholder: 'e.g. Unit, Set, Month, Day, Hour' },
    {
      name: 'hourType',
      label: 'Hour Type',
      type: 'select',
      required: false,
      options: [
        { label: 'NOR', value: 'NOR' },
        { label: 'OT', value: 'OT' },
        { label: 'SUN/P.H OT', value: 'SUN/P.H OT' },
      ],
    },
    { name: 'sourceCostCode', label: 'Source Cost Code', type: 'text', required: false, placeholder: 'e.g. 1003' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'Active',
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
      ],
    },
  ];

  // 7. Machineries Cost Columns & Form
  const machineriesCostColumns: ColumnDef<MachineriesCostResource>[] = [
    {
      key: 'resourceName',
      header: 'Resource Name',
      sortable: true,
      render: (r) => <span className="font-semibold text-slate-900">{r.resourceName}</span>,
    },
    {
      key: 'uom',
      header: 'UOM',
      render: (r) => <span className="font-mono text-slate-700">{r.uom || '—'}</span>,
    },
    {
      key: 'cCode',
      header: 'C-Code',
      render: (r) => <span className="font-mono font-bold text-blue-700">{r.cCode || '—'}</span>,
    },
    {
      key: 'costDetails',
      header: 'Cost Details',
      render: (r) => <span className="text-slate-700">{r.costDetails || '—'}</span>,
    },
    {
      key: 'sCCode',
      header: 'S-C-Code',
      render: (r) => <span className="font-mono text-slate-600">{r.sCCode || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge label={r.status} />,
    },
  ];

  const machineriesCostFields: FormField[] = [
    { name: 'resourceName', label: 'Resource Name', type: 'text', required: true, placeholder: 'e.g. Air Compressor 750 CFM, Diesel Generator 250 kVA' },
    { name: 'uom', label: 'Unit of Measurement (UOM)', type: 'text', required: false, placeholder: 'e.g. Unit, Set, Day, Month' },
    { name: 'cCode', label: 'C-Code', type: 'text', required: false, placeholder: 'e.g. 1004' },
    { name: 'costDetails', label: 'Cost Details / Category', type: 'text', required: false, placeholder: 'e.g. Machineries Hire & Maintenance' },
    { name: 'sCCode', label: 'S-C-Code', type: 'text', required: false, placeholder: 'e.g. S-100401' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'Active',
      options: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
      ],
    },
  ];

  // Dispatch Form Submit
  const handleSaveRecord = (formData: Record<string, any>) => {
    if (activeSub === 'master-customer') {
      addCustomer({
        name: formData.name.trim(),
        code: formData.code?.trim(),
        contactPerson: formData.contactPerson?.trim(),
        email: formData.email?.trim(),
        billingAddress: formData.billingAddress?.trim(),
        status: formData.status || 'Active',
      });
    } else if (activeSub === 'master-project') {
      const cust = customers.find((c) => c.id === formData.customerId);
      addProject({
        code: formData.code.trim(),
        name: formData.name.trim(),
        customerId: formData.customerId,
        customerName: cust ? cust.name : '',
        projectManager: formData.projectManager?.trim(),
        completion: formData.completion?.trim() || 'TBC',
        contractValue: null,
        budget: null,
        status: formData.status || 'Confirmed',
      });
    } else if (activeSub === 'master-cost-code') {
      addCostCode({
        code: formData.code.trim(),
        description: formData.description.trim(),
        category: formData.category || 'Direct Cost',
        level: formData.parentCCode?.trim() ? 'S-Code' : 'C-Code',
        parentCCode: formData.parentCCode?.trim() || undefined,
        status: formData.status || 'Active',
      });
    } else if (activeSub === 'master-employee') {
      addEmployee({
        name: formData.name.trim(),
        code: formData.code?.trim(),
        designation: formData.designation?.trim(),
        resourceType: formData.resourceType || 'Manpower',
        status: formData.status || 'Active',
      });
    } else if (activeSub === 'master-manpower-cost') {
      addManpowerCostResource({
        resourceName: formData.resourceName.trim(),
        classification: formData.classification || 'Direct',
        costDetails: formData.costDetails?.trim(),
        origin: formData.origin,
        hourType: formData.hourType,
        status: formData.status || 'Active',
      });
    } else if (activeSub === 'master-equipment-cost') {
      addEquipmentCostResource({
        resourceName: formData.resourceName.trim(),
        uom: formData.uom?.trim(),
        hourType: formData.hourType,
        sourceCostCode: formData.sourceCostCode?.trim(),
        status: formData.status || 'Active',
      });
    } else if (activeSub === 'master-machineries-cost') {
      addMachineriesCostResource({
        resourceName: formData.resourceName.trim(),
        uom: formData.uom?.trim(),
        cCode: formData.cCode?.trim(),
        costDetails: formData.costDetails?.trim(),
        sCCode: formData.sCCode?.trim(),
        status: formData.status || 'Active',
      });
    }
    setIsSlideOverOpen(false);
  };

  const getSubMeta = () => {
    switch (activeSub) {
      case 'master-project':
        return {
          title: 'Project Master',
          desc: 'Unified project master data synchronized with Project Management workspace.',
          actionLabel: 'Add Project Master',
          fields: projectFields,
        };
      case 'master-cost-code':
        return {
          title: 'Cost Code Master',
          desc: 'Standardized cost breakdown structure (Parent C-Codes and Child S-Codes).',
          actionLabel: 'Add Cost Code',
          fields: costCodeFields,
        };
      case 'master-employee':
        return {
          title: 'Employee / Manpower Master',
          desc: 'Operational register of project leads, supervisors, engineers, and workforce.',
          actionLabel: 'Add Employee',
          fields: employeeFields,
        };
      case 'master-manpower-cost':
        return {
          title: 'Manpower Cost Master',
          desc: 'Manpower cost classification, resource catalog, and hour type parameters.',
          actionLabel: 'Add Manpower Resource',
          fields: manpowerCostFields,
        };
      case 'master-equipment-cost':
        return {
          title: 'Equipment Cost Master',
          desc: 'Equipment resource reference catalog with UOM and hour type parameters.',
          actionLabel: 'Add Equipment Resource',
          fields: equipmentCostFields,
        };
      case 'master-machineries-cost':
        return {
          title: 'Machineries Cost Master',
          desc: 'Machinery resource reference catalog with UOM and cost code parameters.',
          actionLabel: 'Add Machinery Resource',
          fields: machineriesCostFields,
        };
      case 'master-customer':
      default:
        return {
          title: 'Customer Master',
          desc: 'Manage corporate client accounts, commercial terms, and contact records.',
          actionLabel: 'Add Customer',
          fields: customerFields,
        };
    }
  };

  const currentMeta = getSubMeta();

  return (
    <div className="space-y-4">
      {/* Workspace Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            {currentMeta.title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{currentMeta.desc}</p>
        </div>

        <button
          onClick={() => setIsSlideOverOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{currentMeta.actionLabel}</span>
        </button>
      </div>

      {/* Listing Tables (Strongly Typed per Entity) */}
      {activeSub === 'master-customer' && (
        <ListingTable<Customer>
          data={customers}
          columns={customerColumns}
          keyExtractor={(c) => c.id}
          searchPlaceholder="Search Customer Master..."
          searchableKeys={['name', 'code', 'contactPerson', 'email']}
          emptyStateTitle="No Customer records found"
          emptyStateDescription="No customer records currently exist in the master catalog. Use the action button above to add customer records."
          emptyStateAction={
            <button
              onClick={() => setIsSlideOverOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Customer</span>
            </button>
          }
          rowActions={(c) => (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => deleteCustomer(c.id)}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                title="Delete customer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        />
      )}

      {activeSub === 'master-project' && (
        <ListingTable<ProjectRecord>
          data={projects}
          columns={projectColumns}
          keyExtractor={(p) => p.id}
          searchPlaceholder="Search Project Master..."
          searchableKeys={['code', 'name', 'customerName', 'projectManager']}
          emptyStateTitle="No Project Master records found"
          emptyStateDescription="No project master records currently exist. Project Master and Project Management share the identical projects collection."
          emptyStateAction={
            <button
              onClick={() => setIsSlideOverOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project Master</span>
            </button>
          }
          rowActions={(p) => (
            <div className="flex items-center justify-end gap-1">
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
      )}

      {activeSub === 'master-cost-code' && (
        <ListingTable<CostCode>
          data={costCodes}
          columns={costCodeColumns}
          keyExtractor={(cc) => cc.id}
          searchPlaceholder="Search Cost Code Master..."
          searchableKeys={['code', 'description', 'category']}
          emptyStateTitle="No Cost Code records found"
          emptyStateDescription="No cost code records currently exist in the master catalog."
          emptyStateAction={
            <button
              onClick={() => setIsSlideOverOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Cost Code</span>
            </button>
          }
          rowActions={(cc) => (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => deleteCostCode(cc.id)}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                title="Delete cost code"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        />
      )}

      {activeSub === 'master-employee' && (
        <ListingTable<EmployeeManpower>
          data={employees}
          columns={employeeColumns}
          keyExtractor={(e) => e.id}
          searchPlaceholder="Search Employee / Manpower Master..."
          searchableKeys={['name', 'code', 'designation']}
          emptyStateTitle="No Employee records found"
          emptyStateDescription="No employee records currently exist in the master catalog. Use the action button above to add workforce records."
          emptyStateAction={
            <button
              onClick={() => setIsSlideOverOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Employee</span>
            </button>
          }
          rowActions={(e) => (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => deleteEmployee(e.id)}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                title="Delete employee"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        />
      )}

      {activeSub === 'master-manpower-cost' && (
        <ListingTable<ManpowerCostResource>
          data={manpowerCostResources}
          columns={manpowerCostColumns}
          keyExtractor={(r) => r.id}
          searchPlaceholder="Search Manpower Cost Master..."
          searchableKeys={['resourceName', 'classification', 'costDetails', 'origin', 'hourType']}
          filters={[
            {
              key: 'classification',
              label: 'Classification',
              options: [
                { label: 'Direct', value: 'Direct' },
                { label: 'Indirect', value: 'Indirect' },
              ],
            },
            {
              key: 'origin',
              label: 'Origin',
              options: [
                { label: 'Local', value: 'Local' },
                { label: 'Foreigner', value: 'Foreigner' },
              ],
            },
            {
              key: 'hourType',
              label: 'Hour Type',
              options: [
                { label: 'NOR', value: 'NOR' },
                { label: 'OT', value: 'OT' },
                { label: 'SUN/P.H OT', value: 'SUN/P.H OT' },
              ],
            },
          ]}
          emptyStateTitle="No Manpower Cost records found"
          emptyStateDescription="No manpower cost reference records currently exist in the master catalog. Use the action button above to add actual manpower resource records."
          emptyStateAction={
            <button
              onClick={() => setIsSlideOverOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Manpower Resource</span>
            </button>
          }
          rowActions={(r) => (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => deleteManpowerCostResource(r.id)}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                title="Delete manpower resource"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        />
      )}

      {activeSub === 'master-equipment-cost' && (
        <ListingTable<EquipmentCostResource>
          data={equipmentCostResources}
          columns={equipmentCostColumns}
          keyExtractor={(r) => r.id}
          searchPlaceholder="Search Equipment Cost Master..."
          searchableKeys={['resourceName', 'uom', 'hourType', 'sourceCostCode']}
          filters={[
            {
              key: 'hourType',
              label: 'Hour Type',
              options: [
                { label: 'NOR', value: 'NOR' },
                { label: 'OT', value: 'OT' },
                { label: 'SUN/P.H OT', value: 'SUN/P.H OT' },
              ],
            },
          ]}
          emptyStateTitle="No Equipment Cost records found"
          emptyStateDescription="No equipment cost reference records currently exist in the master catalog. Use the action button above to add actual equipment resource records."
          emptyStateAction={
            <button
              onClick={() => setIsSlideOverOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Equipment Resource</span>
            </button>
          }
          rowActions={(r) => (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => deleteEquipmentCostResource(r.id)}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                title="Delete equipment resource"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        />
      )}

      {activeSub === 'master-machineries-cost' && (
        <ListingTable<MachineriesCostResource>
          data={machineriesCostResources}
          columns={machineriesCostColumns}
          keyExtractor={(r) => r.id}
          searchPlaceholder="Search Machineries Cost Master..."
          searchableKeys={['resourceName', 'uom', 'cCode', 'costDetails', 'sCCode']}
          emptyStateTitle="No Machineries Cost records found"
          emptyStateDescription="No machinery cost reference records currently exist in the master catalog. Use the action button above to add actual machinery resource records."
          emptyStateAction={
            <button
              onClick={() => setIsSlideOverOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Machinery Resource</span>
            </button>
          }
          rowActions={(r) => (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => deleteMachineriesCostResource(r.id)}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                title="Delete machinery resource"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        />
      )}

      {/* Slide-Over Form */}
      <SlideOverForm
        isOpen={isSlideOverOpen}
        title={currentMeta.actionLabel}
        description={`Add a new record to ${currentMeta.title}.`}
        onClose={() => setIsSlideOverOpen(false)}
        onSubmit={handleSaveRecord}
        fields={currentMeta.fields}
        submitLabel="Save Master Record"
      />
    </div>
  );
};
