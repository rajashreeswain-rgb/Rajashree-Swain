/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Building2,
  MapPin,
  Settings,
  Plus,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Briefcase,
} from 'lucide-react';

interface BusinessUnit {
  id: string;
  code: string;
  name: string;
  headName?: string;
  status: 'Active' | 'Inactive';
}

interface OrgLocation {
  id: string;
  code: string;
  name: string;
  type: string;
  status: 'Active' | 'Inactive';
}

export const CompanyModule: React.FC = () => {
  const {
    companyProfile,
    terminologyNotes,
    addTerminologyNote,
    resetPrototypeData,
    activeSubModule,
    setActiveSubModule,
    showToast,
  } = useAppStore();

  const activeSub = activeSubModule || 'co-profile';

  // Local state for Business Units (starts empty per spec)
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [buCode, setBuCode] = useState('');
  const [buName, setBuName] = useState('');
  const [buModalOpen, setBuModalOpen] = useState(false);

  // Local state for Locations (starts with default MYS location per spec)
  const [locations, setLocations] = useState<OrgLocation[]>([
    {
      id: 'LOC-MYS',
      code: 'MYS',
      name: 'Malaysia HQ & Regional Yard Operations',
      type: 'Headquarters & Yard',
      status: 'Active',
    },
  ]);
  const [locCode, setLocCode] = useState('');
  const [locName, setLocName] = useState('');
  const [locType, setLocType] = useState('Branch Office');
  const [locModalOpen, setLocModalOpen] = useState(false);

  // Reset confirmation dialog state
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // New Terminology Note form state
  const [tnClientTerm, setTnClientTerm] = useState('');
  const [tnCorrectedTerm, setTnCorrectedTerm] = useState('');
  const [tnContext, setTnContext] = useState('');

  // Titles mapping
  const subTitles: Record<string, { title: string; subtitle: string }> = {
    'co-profile': {
      title: 'Company Profile',
      subtitle: 'Corporate legal entity details, default currency, and location parameters.',
    },
    'co-business-units': {
      title: 'Business Units',
      subtitle: 'Organizational divisions and operational business unit setup.',
    },
    'co-locations': {
      title: 'Organizational Locations',
      subtitle: 'Head office, regional bases, and fabrication yard location registry.',
    },
    'co-settings': {
      title: 'Company Settings',
      subtitle: 'General system parameters, prototype data reset, and terminology log.',
    },
  };

  const currentInfo = subTitles[activeSub] || subTitles['co-profile'];

  return (
    <div className="space-y-4 select-none">
      {/* Workspace Header & Breadcrumbs */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mb-1">
            <span>Company</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-blue-700 font-bold">{currentInfo.title}</span>
          </div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>{currentInfo.title}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{currentInfo.subtitle}</p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. COMPANY PROFILE WORKSPACE */}
      {/* ========================================================= */}
      {activeSub === 'co-profile' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Corporate Entity Profile</h2>
              <p className="text-xs text-slate-500 mt-0.5">Primary corporate parameters for Poratha Group of Companies.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-slate-400 font-mono text-[11px] block">Company Name</span>
              <p className="text-sm font-bold text-slate-900">{companyProfile.name}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-slate-400 font-mono text-[11px] block">Default Currency</span>
              <p className="text-sm font-bold text-emerald-700 font-mono">{companyProfile.currency}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-slate-400 font-mono text-[11px] block">Location Code</span>
              <p className="text-sm font-bold text-blue-700 font-mono">{companyProfile.locationCode}</p>
            </div>
          </div>

          <div className="p-4 bg-blue-50/60 rounded-lg border border-blue-200 text-xs text-blue-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Poratha Corporate Specification Compliance</span>
            </span>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Standard corporate baseline configuration for Poratha Group of Companies. Operating under default currency MYR (RM) and primary location code MYS.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. BUSINESS UNITS WORKSPACE */}
      {/* ========================================================= */}
      {activeSub === 'co-business-units' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Business Units Listing</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Organizational business units breakdown. Starts with an empty listing per client specification.
              </p>
            </div>
            <button
              onClick={() => setBuModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Business Unit</span>
            </button>
          </div>

          {businessUnits.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center space-y-2 shadow-2xs">
              <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-xs font-bold text-slate-800">No Business Units Registered</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No business unit records exist in the initial baseline. Use the button above to add custom business units.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 font-mono">
                  <tr>
                    <th className="py-2.5 px-3">Unit Code</th>
                    <th className="py-2.5 px-3">Business Unit Name</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {businessUnits.map((bu) => (
                    <tr key={bu.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{bu.code}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{bu.name}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px]">
                          {bu.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add BU Modal */}
          {buModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
              <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900">Add Business Unit</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Unit Code</label>
                    <input
                      type="text"
                      value={buCode}
                      onChange={(e) => setBuCode(e.target.value)}
                      placeholder="e.g. BU-PIP"
                      className="w-full px-3 py-1.5 border rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Business Unit Name</label>
                    <input
                      type="text"
                      value={buName}
                      onChange={(e) => setBuName(e.target.value)}
                      placeholder="e.g. Piping & Fabrication Division"
                      className="w-full px-3 py-1.5 border rounded"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    onClick={() => setBuModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!buName.trim()) {
                        showToast('Please enter a business unit name', 'error');
                        return;
                      }
                      setBusinessUnits([
                        ...businessUnits,
                        {
                          id: `BU-${Date.now()}`,
                          code: buCode.trim() || 'BU-01',
                          name: buName.trim(),
                          status: 'Active',
                        },
                      ]);
                      setBuCode('');
                      setBuName('');
                      setBuModalOpen(false);
                      showToast('Business unit registered', 'success');
                    }}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded font-medium"
                  >
                    Save Business Unit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. ORGANIZATIONAL LOCATIONS WORKSPACE */}
      {/* ========================================================= */}
      {activeSub === 'co-locations' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Organizational Locations Registry</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Maintains location records using location code <span className="font-mono font-bold text-blue-700">MYS</span>.
              </p>
            </div>
            <button
              onClick={() => setLocModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Location</span>
            </button>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 font-mono">
                <tr>
                  <th className="py-2.5 px-3">Location Code</th>
                  <th className="py-2.5 px-3">Location Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{loc.code}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{loc.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{loc.type}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px]">
                        {loc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Location Modal */}
          {locModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
              <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4 text-xs">
                <h3 className="text-sm font-bold text-slate-900">Add Location Record</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Location Code</label>
                    <input
                      type="text"
                      value={locCode}
                      onChange={(e) => setLocCode(e.target.value)}
                      placeholder="e.g. MYS-KEM"
                      className="w-full px-3 py-1.5 border rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Location Name</label>
                    <input
                      type="text"
                      value={locName}
                      onChange={(e) => setLocName(e.target.value)}
                      placeholder="e.g. Kemaman Yard Base"
                      className="w-full px-3 py-1.5 border rounded"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    onClick={() => setLocModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!locName.trim()) {
                        showToast('Please enter a location name', 'error');
                        return;
                      }
                      setLocations([
                        ...locations,
                        {
                          id: `LOC-${Date.now()}`,
                          code: locCode.trim() || 'MYS',
                          name: locName.trim(),
                          type: locType,
                          status: 'Active',
                        },
                      ]);
                      setLocCode('');
                      setLocName('');
                      setLocModalOpen(false);
                      showToast('Location registered', 'success');
                    }}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded font-medium"
                  >
                    Save Location
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. COMPANY SETTINGS WORKSPACE */}
      {/* ========================================================= */}
      {activeSub === 'co-settings' && (
        <div className="space-y-5">
          {/* Section 1: General Configuration */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-600" />
              <span>General Configuration</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyProfile.name}
                  disabled
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded font-semibold text-slate-800 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Currency</label>
                <input
                  type="text"
                  value={companyProfile.currency}
                  disabled
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-slate-800 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location Code</label>
                <input
                  type="text"
                  value={companyProfile.locationCode}
                  disabled
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-slate-800 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Terminology Notes */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Terminology Notes</span>
              </h2>
              <span className="text-xs text-slate-500 font-normal">Manual correction records</span>
            </div>

            {/* Manual Add Form */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
              <span className="font-semibold text-slate-800 block">Record Terminology Note</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Source Term</label>
                  <input
                    type="text"
                    placeholder="e.g. Client source term"
                    value={tnClientTerm}
                    onChange={(e) => setTnClientTerm(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Corrected Term</label>
                  <input
                    type="text"
                    placeholder="e.g. Standard corrected term"
                    value={tnCorrectedTerm}
                    onChange={(e) => setTnCorrectedTerm(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Context / Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Document location or reason"
                    value={tnContext}
                    onChange={(e) => setTnContext(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>
              <div className="pt-1 flex justify-end">
                <button
                  onClick={() => {
                    if (!tnClientTerm.trim() || !tnCorrectedTerm.trim()) {
                      showToast('Please enter both source and corrected terms', 'error');
                      return;
                    }
                    addTerminologyNote({
                      clientTerm: tnClientTerm.trim(),
                      correctedTerm: tnCorrectedTerm.trim(),
                      context: tnContext.trim() || 'Manual adjustment note',
                    });
                    setTnClientTerm('');
                    setTnCorrectedTerm('');
                    setTnContext('');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-2xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Terminology Note</span>
                </button>
              </div>
            </div>

            {/* Notes List / Empty State */}
            {terminologyNotes.length === 0 ? (
              <div className="p-6 text-center bg-slate-50/60 rounded-lg border border-dashed border-slate-200 text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">No Terminology Notes Recorded</p>
                <p className="text-slate-500 text-[11px]">
                  No manual terminology corrections have been recorded yet. Use the form above to add notes when required.
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 font-mono">
                    <tr>
                      <th className="py-2.5 px-3">Source Term</th>
                      <th className="py-2.5 px-3">Corrected Term</th>
                      <th className="py-2.5 px-3">Context / Note</th>
                      <th className="py-2.5 px-3">Date Recorded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {terminologyNotes.map((tn) => (
                      <tr key={tn.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono text-rose-700 font-medium">{tn.clientTerm}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">{tn.correctedTerm}</td>
                        <td className="py-2.5 px-3 text-slate-700">{tn.context}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{tn.dateAdded}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 3: Prototype Data Management */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>Prototype Data Management</span>
            </h2>

            <p className="text-xs text-slate-600 leading-relaxed">
              Resetting restores the original Poratha source dataset (5 Projects, Customers, Employees, and Cost Codes) and removes subsequent prototype modifications.
            </p>

            <div className="pt-1">
              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-300 rounded shadow-2xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Prototype Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Confirm Prototype Data Reset"
        message="Resetting restores the original Poratha source dataset (5 Projects, Customers, Employees, and Cost Codes) and removes subsequent prototype modifications. Do you want to proceed?"
        confirmLabel="Yes, Reset Prototype Data"
        cancelLabel="Cancel"
        onConfirm={() => {
          resetPrototypeData();
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
