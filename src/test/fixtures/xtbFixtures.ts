import * as xlsx from 'xlsx';

/**
 * Valid sample CSV content representing an XTB cash operations export
 */
export const SAMPLE_XTB_CSV_VALID = `ID,Type,Time,Comment,Amount
50582183,Account number,,,
101,Wpłata,2025-01-05 10:00:00,Przelew środków,5000.00
102,Zakup akcji,2025-01-06 14:30:00,OPEN BUY 10 @ 120.50 CDR.PL,-1205.00
103,Dywidenda,2025-05-15 09:00:00,Dywidenda Apple AAPL.US,150.00
104,Podatek u źródła,2025-05-15 09:00:01,WHT podatek AAPL.US,-22.50
105,Sprzedaż akcji,2025-06-01 11:00:00,CLOSE BUY 5 @ 140.00 CDR.PL,700.00
106,Wypłata,2025-07-01 08:30:00,Wypłata na konto,-1000.00
,Razem,,,-1205.00
,Total,,,5000.00
`;

/**
 * Malformed CSV without expected header columns
 */
export const SAMPLE_XTB_CSV_MALFORMED = `KolumnaA,KolumnaB,KolumnaC
Wartość1,Wartość2,Wartość3
Wartość4,Wartość5,Wartość6
`;

/**
 * Empty CSV
 */
export const SAMPLE_XTB_CSV_EMPTY = ``;

/**
 * Generates an in-memory XTB XLSX workbook with Cash Operations and Closed Positions sheets
 */
export function generateMockXTBWorkbook(): xlsx.WorkBook {
  const wb = xlsx.utils.book_new();

  // Sheet 1: Operacje gotówkowe (Cash Operations)
  const cashData: (string | number)[][] = [
    ['Account number', '50582183'],
    [],
    ['ID', 'Type', 'Time', 'Comment', 'Amount'],
    ['201', 'Wpłata', '2025-01-01 10:00:00', 'Wpłata własna', '10000.00'],
    ['202', 'Dywidenda', '2025-04-10 12:00:00', 'Dywidenda PKO.PL', '300.00'],
    ['203', 'Podatek u źródła', '2025-04-10 12:00:01', 'WHT PKO', '57.00'],
    ['204', 'Wypłata', '2025-05-01 15:00:00', 'Wypłata z rachunku', '-2000.00'],
    ['Razem', '', '', '', '8243.00']
  ];
  const cashSheet = xlsx.utils.aoa_to_sheet(cashData);
  xlsx.utils.book_append_sheet(wb, cashSheet, 'Operacje gotówkowe');

  // Sheet 2: Pozycje zamknięte (Closed Positions)
  const closedData: (string | number)[][] = [
    ['Account number', '50582183'],
    [],
    [
      'Position ID',
      'Instrument',
      'Type',
      'Open Time',
      'Open Price',
      'Close Time',
      'Close Price',
      'Volume',
      'Profit',
      'Comment'
    ],
    [
      '9901',
      'PKO.PL',
      'Buy',
      '2025-01-10 09:30:00',
      '50.00',
      '2025-02-15 16:45:00',
      '58.00',
      '10',
      '80.00',
      'Zlecenie zrealizowane'
    ],
    [
      '9902',
      'AAPL.US',
      'Buy',
      '2025-01-20 15:30:00',
      '180.00',
      '2025-03-01 21:00:00',
      '205.00',
      '5',
      '125.00',
      'Zlecenie US'
    ],
    ['Razem', '', '', '', '', '', '', '', '205.00', '']
  ];
  const closedSheet = xlsx.utils.aoa_to_sheet(closedData);
  xlsx.utils.book_append_sheet(wb, closedSheet, 'Pozycje zamknięte');

  return wb;
}

/**
 * Creates a mock File object containing CSV text
 */
export function createMockCSVFile(content: string, fileName = 'xtb_report.csv'): File {
  return new File([content], fileName, { type: 'text/csv' });
}

/**
 * Creates a mock File object containing binary XLSX workbook
 */
export function createMockXLSXFile(workbook: xlsx.WorkBook, fileName = 'xtb_report.xlsx'): File {
  const wbout = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new File([wbout], fileName, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}
