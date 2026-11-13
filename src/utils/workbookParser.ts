/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { CostCode, EmployeeManpower } from '../types';

export interface ParseWorkbookResult {
  success: boolean;
  error?: string;
  sCodes: CostCode[];
  manpowerResources: EmployeeManpower[];
  equipmentResources: EmployeeManpower[];
  machineryResources: EmployeeManpower[];
}

export const parsePorathaBudgetWorkbook = (fileBuffer: ArrayBuffer): ParseWorkbookResult => {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const sCodes: CostCode[] = [];
    const manpowerResources: EmployeeManpower[] = [];
    const equipmentResources: EmployeeManpower[] = [];
    const machineryResources: EmployeeManpower[] = [];

    // 1. SHEET: BUDGET MONTHLY
    const budgetSheetName = workbook.SheetNames.find((name) =>
      name.trim().toUpperCase() === 'BUDGET MONTHLY'
    );

    if (budgetSheetName) {
      const sheet = workbook.Sheets[budgetSheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      let currentCCode = '1001';

      rows.forEach((row, index) => {
        if (!row || row.length === 0) return;

        const colA = String(row[0] || '').trim();
        const colB = String(row[1] || '').trim();
        const colC = String(row[2] || '').trim();

        // Detect parent C-Code header (1001 to 1011)
        const cCodeMatch = colA.match(/^(100[1-9]|101[0-1])/);
        if (cCodeMatch) {
          currentCCode = cCodeMatch[1];
        }

        // Detect S-Code (e.g. S-101, S-201, S-221, etc.)
        let sCodeCandidate = '';
        let descCandidate = '';

        if (colA.match(/^S-\d+/i)) {
          sCodeCandidate = colA.toUpperCase();
          descCandidate = colB || colC;
        } else if (colB.match(/^S-\d+/i)) {
          sCodeCandidate = colB.toUpperCase();
          descCandidate = colC || colA;
        }

        if (sCodeCandidate && descCandidate) {
          // Rule: For Equipment Cost, use parent C-Code 1003 and ignore alternative EQ-xxxx
          const assignedCCode = currentCCode === '1003' || sCodeCandidate.startsWith('S-3') ? '1003' : currentCCode;

          sCodes.push({
            id: `SC-${sCodeCandidate}`,
            code: sCodeCandidate,
            description: descCandidate.trim(),
            category: (assignedCCode === '1003' ? 'Equipment' : 'Direct Cost') as any,
            level: 'S-Code',
            parentCCode: assignedCCode,
            status: 'Active',
          });
        }
      });
    }

    // 2. SHEET: MANPOWER COST
    const manpowerSheetName = workbook.SheetNames.find((name) =>
      name.trim().toUpperCase().includes('MANPOWER')
    );
    if (manpowerSheetName) {
      const sheet = workbook.Sheets[manpowerSheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      rows.forEach((row, i) => {
        if (!row || i < 2) return;
        const nameCandidate = String(row[1] || row[0] || '').trim();
        if (nameCandidate && !nameCandidate.toUpperCase().includes('TOTAL') && !nameCandidate.toUpperCase().includes('NAME')) {
          const classCandidate = String(row[2] || '').trim().toLowerCase();
          const originCandidate = String(row[3] || '').trim().toLowerCase();
          const hourTypeCandidate = String(row[4] || '').trim().toUpperCase();

          manpowerResources.push({
            id: `RES-MAN-${i}`,
            name: nameCandidate,
            resourceType: 'Manpower',
            classification: classCandidate.includes('direct') ? 'Direct' : classCandidate.includes('indirect') ? 'Indirect' : 'Direct',
            origin: originCandidate.includes('local') ? 'Local' : originCandidate.includes('foreign') ? 'Foreigner' : undefined,
            hourType: hourTypeCandidate.includes('OT') ? 'OT' : hourTypeCandidate.includes('SUN') ? 'SUN-PH' : 'NOR',
            status: 'Active',
          });
        }
      });
    }

    // 3. SHEET: EQUIPMENT COST
    const equipSheetName = workbook.SheetNames.find((name) =>
      name.trim().toUpperCase().includes('EQUIPMENT')
    );
    if (equipSheetName) {
      const sheet = workbook.Sheets[equipSheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      rows.forEach((row, i) => {
        if (!row || i < 2) return;
        const nameCandidate = String(row[1] || row[0] || '').trim();
        if (nameCandidate && !nameCandidate.toUpperCase().includes('TOTAL') && !nameCandidate.toUpperCase().includes('EQUIPMENT')) {
          equipmentResources.push({
            id: `RES-EQP-${i}`,
            name: nameCandidate,
            resourceType: 'Equipment',
            status: 'Active',
          });
        }
      });
    }

    // 4. SHEET: MACHINERIES COST
    const machSheetName = workbook.SheetNames.find((name) =>
      name.trim().toUpperCase().includes('MACHINER')
    );
    if (machSheetName) {
      const sheet = workbook.Sheets[machSheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      rows.forEach((row, i) => {
        if (!row || i < 2) return;
        const nameCandidate = String(row[1] || row[0] || '').trim();
        if (nameCandidate && !nameCandidate.toUpperCase().includes('TOTAL') && !nameCandidate.toUpperCase().includes('MACHINE')) {
          machineryResources.push({
            id: `RES-MCH-${i}`,
            name: nameCandidate,
            resourceType: 'Machinery',
            status: 'Active',
          });
        }
      });
    }

    return {
      success: true,
      sCodes,
      manpowerResources,
      equipmentResources,
      machineryResources,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to read Excel workbook',
      sCodes: [],
      manpowerResources: [],
      equipmentResources: [],
      machineryResources: [],
    };
  }
};
