import type { LedgerContact, WorkspaceLedger } from '../types';
import { computeContactBalance, getDaysElapsed } from './formatters';

function escapeCsvCell(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

export function downloadCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number | undefined | null>>
): void {
  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ];
  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportContactsCsv(
  ledgerTitle: string,
  currency: string,
  contacts: LedgerContact[],
  kindLabel: string
): void {
  downloadCsv(
    `${ledgerTitle}_${kindLabel}_${new Date().toISOString().slice(0, 10)}.csv`,
    ['الاسم', 'الهاتف', 'الحالة', `المبلغ (${currency})`, 'آخر تاريخ', 'الأيام المنقضية'],
    contacts.map((c) => {
      const bal = computeContactBalance(c);
      return [
        c.name,
        c.phone ?? '',
        bal.direction === 'given' ? 'فلوس ليا (أعطيت)' : 'فلوس عليا (أخذت)',
        bal.absAmount.toFixed(1),
        c.lastDate,
        getDaysElapsed(c.lastDate),
      ];
    })
  );
}

export function exportFullLedgerCsv(ledger: WorkspaceLedger): void {
  const sections: string[] = [];

  const pushSection = (
    title: string,
    headers: string[],
    rows: Array<Array<string | number | undefined | null>>
  ) => {
    sections.push(escapeCsvCell(title));
    sections.push(headers.map(escapeCsvCell).join(','));
    rows.forEach((r) => sections.push(r.map(escapeCsvCell).join(',')));
    sections.push('');
  };

  pushSection(
    `دفتر الديون - ${ledger.title}`,
    ['الفئة', 'الاسم', 'الهاتف', 'الحالة', `الرصيد (${ledger.currency})`, 'آخر حركة'],
    ledger.contacts.map((c) => {
      const bal = computeContactBalance(c);
      return [
        c.kind === 'customers' ? 'العملاء' : 'الموردين',
        c.name,
        c.phone ?? '',
        bal.direction === 'given' ? 'فلوس ليا (أعطيت)' : 'فلوس عليا (أخذت)',
        bal.absAmount.toFixed(1),
        c.lastDate,
      ];
    })
  );

  pushSection(
    `دفتر النقدية - ${ledger.title}`,
    ['التاريخ', 'النوع', 'البند', `المبلغ (${ledger.currency})`, 'ملاحظات'],
    ledger.cashbook.map((entry) => [
      entry.date,
      entry.direction === 'in' ? 'وارد (قبض)' : 'صادر (صرف)',
      entry.category,
      entry.amount.toFixed(1),
      entry.note,
    ])
  );

  const csvContent = '\uFEFF' + sections.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute(
    'download',
    `${ledger.title}_نسخة_شاملة_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
