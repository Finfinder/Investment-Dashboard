import * as xlsx from 'xlsx';
import Papa from 'papaparse';
import { Transaction, AssetCategory, Currency } from '../../types/portfolio';
import { XTBImportParseResult } from '../../types/xtb';

export class XTBImporter {
  public static parseFile(file: File, portfolioId: string): Promise<XTBImportParseResult> {
    return new Promise((resolve, reject) => {
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = xlsx.read(data, { type: 'array' });
            const result = XTBImporter.parseWorkbook(workbook, portfolioId);
            resolve(result);
          } catch (err: any) {
            reject(new Error('Błąd odczytu pliku Excel: ' + (err.message || err)));
          }
        };
        reader.onerror = () => reject(new Error('Błąd pliku Excel'));
        reader.readAsArrayBuffer(file);
      } else if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const csvText = e.target?.result as string;
            const result = XTBImporter.parseCSVText(csvText, portfolioId);
            resolve(result);
          } catch (err: any) {
            reject(new Error('Błąd odczytu pliku CSV: ' + (err.message || err)));
          }
        };
        reader.onerror = () => reject(new Error('Błąd pliku CSV'));
        reader.readAsText(file, 'utf-8');
      } else {
        reject(new Error('Nieobsługiwany format pliku. Wybierz plik XLSX lub CSV z XTB.'));
      }
    });
  }

  private static parseWorkbook(workbook: xlsx.WorkBook, portfolioId: string): XTBImportParseResult {
    const result: XTBImportParseResult = {
      cashOperationsCount: 0,
      closedPositionsCount: 0,
      transactions: [],
      warnings: [],
      rawSummary: {
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalDividends: 0,
        totalTrades: 0
      }
    };

    let accountNumber = '';

    // Sheet 1: Cash Operations / Operacje gotówkowe
    const cashSheetName = workbook.SheetNames.find(s => 
      s.toLowerCase().includes('cash') || s.toLowerCase().includes('gotówk') || s.toLowerCase().includes('operacj')
    );

    if (cashSheetName) {
      const sheet = workbook.Sheets[cashSheetName];
      const rows: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });

      if (rows.length > 0) {
        // Extract account number if present (e.g., row 0: Account number, 50582183)
        if (rows[0] && rows[0][1]) {
          accountNumber = String(rows[0][1]).trim();
          result.accountNumber = accountNumber;
        }

        // Find header row (starts with Type / Typ)
        let headerIndex = -1;
        for (let i = 0; i < Math.min(15, rows.length); i++) {
          const rowStr = (rows[i] || []).join(' ').toLowerCase();
          if (rowStr.includes('type') || rowStr.includes('typ') || rowStr.includes('amount') || rowStr.includes('kwota')) {
            headerIndex = i;
            break;
          }
        }

        if (headerIndex !== -1) {
          const headers = rows[headerIndex].map((h: any) => String(h || '').trim().toLowerCase());
          const typeIdx = headers.findIndex(h => h.includes('type') || h.includes('typ'));
          const tickerIdx = headers.findIndex(h => h.includes('ticker') || h.includes('symbol'));
          const instrumentIdx = headers.findIndex(h => h.includes('instrument') || h.includes('walor'));
          const timeIdx = headers.findIndex(h => h.includes('time') || h.includes('czas') || h.includes('data'));
          const amountIdx = headers.findIndex(h => h.includes('amount') || h.includes('kwota') || h.includes('wartość'));
          const idIdx = headers.findIndex(h => h.includes('id'));
          const commentIdx = headers.findIndex(h => h.includes('comment') || h.includes('komentarz'));

          for (let i = headerIndex + 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0) continue;

            const typeRaw = typeIdx !== -1 ? String(row[typeIdx] || '').trim() : '';
            if (!typeRaw || typeRaw.toLowerCase().startsWith('total') || typeRaw.toLowerCase().startsWith('razem')) continue;

            const tickerRaw = tickerIdx !== -1 ? String(row[tickerIdx] || '').trim() : '';
            const instrumentRaw = instrumentIdx !== -1 ? String(row[instrumentIdx] || '').trim() : '';
            const timeRaw = timeIdx !== -1 ? String(row[timeIdx] || '').trim() : '';
            const amountVal = amountIdx !== -1 ? parseFloat(String(row[amountIdx] || '0').replace(',', '.')) : 0;
            const xtbId = idIdx !== -1 ? String(row[idIdx] || '').trim() : undefined;
            const commentRaw = commentIdx !== -1 ? String(row[commentIdx] || '').trim() : '';

            const tx = XTBImporter.convertCashOpToTransaction(
              portfolioId, typeRaw, tickerRaw, instrumentRaw, timeRaw, amountVal, xtbId, commentRaw
            );

            if (tx) {
              result.transactions.push(tx);
              result.cashOperationsCount++;

              if (tx.type === 'DEPOSIT') result.rawSummary.totalDeposits += tx.totalValue;
              if (tx.type === 'WITHDRAWAL') result.rawSummary.totalWithdrawals += Math.abs(tx.totalValue);
              if (tx.type === 'DIVIDEND') result.rawSummary.totalDividends += tx.totalValue;
            }
          }
        }
      }
    }

    // Sheet 2: Closed Positions / Pozycje zamknięte
    const closedSheetName = workbook.SheetNames.find(s => 
      s.toLowerCase().includes('closed') || s.toLowerCase().includes('zamknięt')
    );

    if (closedSheetName) {
      const sheet = workbook.Sheets[closedSheetName];
      const rows: any[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });

      let headerIndex = -1;
      for (let i = 0; i < Math.min(15, rows.length); i++) {
        const rowStr = (rows[i] || []).join(' ').toLowerCase();
        if (rowStr.includes('instrument') && (rowStr.includes('type') || rowStr.includes('typ'))) {
          headerIndex = i;
          break;
        }
      }

      if (headerIndex !== -1) {
        const headers = rows[headerIndex].map((h: any) => String(h || '').trim().toLowerCase());
        const instIdx = headers.findIndex(h => h.includes('instrument') || h.includes('walor'));
        const tickerIdx = headers.findIndex(h => h.includes('ticker') || h.includes('symbol'));
        const typeIdx = headers.findIndex(h => h.includes('type') || h.includes('typ'));
        const volIdx = headers.findIndex(h => h.includes('volume') || h.includes('wolumen') || h.includes('liczba'));
        const openPriceIdx = headers.findIndex(h => h.includes('open price') || h.includes('cena otwarcia'));
        const openTimeIdx = headers.findIndex(h => h.includes('open time') || h.includes('czas otwarcia'));
        const closePriceIdx = headers.findIndex(h => h.includes('close price') || h.includes('cena zamknięcia'));
        const closeTimeIdx = headers.findIndex(h => h.includes('close time') || h.includes('czas zamknięcia'));
        const profitIdx = headers.findIndex(h => h.includes('profit') || h.includes('zysk'));
        const posIdIdx = headers.findIndex(h => h.includes('position id') || h.includes('id pozycji'));
        const commentIdx = headers.findIndex(h => h.includes('comment') || h.includes('komentarz'));

        for (let i = headerIndex + 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          const inst = instIdx !== -1 ? String(row[instIdx] || '').trim() : '';
          if (!inst || inst.toLowerCase().includes('profit') || inst.toLowerCase().includes('razem')) continue;

          const ticker = tickerIdx !== -1 ? String(row[tickerIdx] || '').trim() : inst;
          const openTime = openTimeIdx !== -1 ? String(row[openTimeIdx] || '').trim() : new Date().toISOString();
          const closeTime = closeTimeIdx !== -1 ? String(row[closeTimeIdx] || '').trim() : new Date().toISOString();
          const vol = volIdx !== -1 ? parseFloat(String(row[volIdx] || '0').replace(',', '.')) : 0;
          const openP = openPriceIdx !== -1 ? parseFloat(String(row[openPriceIdx] || '0').replace(',', '.')) : 0;
          const closeP = closePriceIdx !== -1 ? parseFloat(String(row[closePriceIdx] || '0').replace(',', '.')) : 0;
          const posId = posIdIdx !== -1 ? String(row[posIdIdx] || '').trim() : undefined;
          const comment = commentIdx !== -1 ? String(row[commentIdx] || '').trim() : '';

          if (vol > 0 && openP > 0) {
            // Note: If trades were already captured via Cash Operations `Stock purchase`, we avoid duplicate BUY/SELL transactions by matching xtbId/comment
            const exists = result.transactions.some(t => (posId && t.xtbId === posId) || (t.comment && posId ? t.comment.includes(posId) : false));
            if (!exists) {
              const buyTx: Transaction = {
                id: 'xtb-buy-' + Math.random().toString(36).substr(2, 9),
                portfolioId,
                type: 'BUY',
                ticker: ticker || inst,
                instrumentName: inst || ticker,
                assetCategory: XTBImporter.categorizeSymbol(ticker || inst),
                date: XTBImporter.formatDateString(openTime),
                quantity: vol,
                price: openP,
                currency: XTBImporter.detectCurrency(ticker),
                commission: 0,
                tax: 0,
                totalValue: vol * openP,
                xtbId: posId ? posId + '-buy' : undefined,
                comment: `Otwarcie pozycji XTB #${posId || ''} ${comment}`
              };

              const sellTx: Transaction = {
                id: 'xtb-sell-' + Math.random().toString(36).substr(2, 9),
                portfolioId,
                type: 'SELL',
                ticker: ticker || inst,
                instrumentName: inst || ticker,
                assetCategory: XTBImporter.categorizeSymbol(ticker || inst),
                date: XTBImporter.formatDateString(closeTime),
                quantity: vol,
                price: closeP,
                currency: XTBImporter.detectCurrency(ticker),
                commission: 0,
                tax: 0,
                totalValue: vol * closeP,
                xtbId: posId ? posId + '-sell' : undefined,
                linkedBuyTransactionId: buyTx.id,
                comment: `Zamknięcie pozycji XTB #${posId || ''} ${comment}`
              };

              result.transactions.push(buyTx);
              result.transactions.push(sellTx);
              result.closedPositionsCount++;
              result.rawSummary.totalTrades += 2;
            }
          }
        }
      }
    }

    return result;
  }

  private static parseCSVText(csvText: string, portfolioId: string): XTBImportParseResult {
    const parsed = Papa.parse<string[]>(csvText, { skipEmptyLines: true });
    const rows = parsed.data;

    const result: XTBImportParseResult = {
      cashOperationsCount: 0,
      closedPositionsCount: 0,
      transactions: [],
      warnings: [],
      rawSummary: { totalDeposits: 0, totalWithdrawals: 0, totalDividends: 0, totalTrades: 0 }
    };

    if (!rows || rows.length === 0) return result;

    let headerIdx = -1;
    for (let i = 0; i < Math.min(20, rows.length); i++) {
      const line = (rows[i] || []).join(' ').toLowerCase();
      if (line.includes('type') || line.includes('typ') || line.includes('amount') || line.includes('kwota')) {
        headerIdx = i;
        break;
      }
    }

    if (headerIdx !== -1) {
      const headers = rows[headerIdx].map(h => String(h || '').trim().toLowerCase());
      const typeIdx = headers.findIndex(h => h.includes('type') || h.includes('typ'));
      const tickerIdx = headers.findIndex(h => h.includes('ticker') || h.includes('symbol'));
      const instIdx = headers.findIndex(h => h.includes('instrument') || h.includes('walor'));
      const timeIdx = headers.findIndex(h => h.includes('time') || h.includes('czas') || h.includes('data'));
      const amountIdx = headers.findIndex(h => h.includes('amount') || h.includes('kwota'));
      const idIdx = headers.findIndex(h => h.includes('id'));
      const commentIdx = headers.findIndex(h => h.includes('comment') || h.includes('komentarz'));

      for (let i = headerIdx + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const typeRaw = typeIdx !== -1 ? String(row[typeIdx] || '').trim() : '';
        if (!typeRaw || typeRaw.toLowerCase().startsWith('total') || typeRaw.toLowerCase().startsWith('razem')) continue;

        const tickerRaw = tickerIdx !== -1 ? String(row[tickerIdx] || '').trim() : '';
        const instRaw = instIdx !== -1 ? String(row[instIdx] || '').trim() : '';
        const timeRaw = timeIdx !== -1 ? String(row[timeIdx] || '').trim() : '';
        const amountVal = amountIdx !== -1 ? parseFloat(String(row[amountIdx] || '0').replace(',', '.')) : 0;
        const xtbId = idIdx !== -1 ? String(row[idIdx] || '').trim() : undefined;
        const commentRaw = commentIdx !== -1 ? String(row[commentIdx] || '').trim() : '';

        const tx = XTBImporter.convertCashOpToTransaction(
          portfolioId, typeRaw, tickerRaw, instRaw, timeRaw, amountVal, xtbId, commentRaw
        );

        if (tx) {
          result.transactions.push(tx);
          result.cashOperationsCount++;
          if (tx.type === 'DEPOSIT') result.rawSummary.totalDeposits += tx.totalValue;
          if (tx.type === 'WITHDRAWAL') result.rawSummary.totalWithdrawals += Math.abs(tx.totalValue);
          if (tx.type === 'DIVIDEND') result.rawSummary.totalDividends += tx.totalValue;
        }
      }
    }

    return result;
  }

  private static convertCashOpToTransaction(
    portfolioId: string,
    typeRaw: string,
    tickerRaw: string,
    instrumentRaw: string,
    timeRaw: string,
    amountVal: number,
    xtbId?: string,
    commentRaw?: string
  ): Transaction | null {
    const typeLower = typeRaw.toLowerCase();
    const formattedDate = XTBImporter.formatDateString(timeRaw);
    const category = XTBImporter.categorizeSymbol(tickerRaw || instrumentRaw);
    const currency = XTBImporter.detectCurrency(tickerRaw || commentRaw);

    let txType: Transaction['type'] = 'DEPOSIT';
    let qty = 1;
    let price = Math.abs(amountVal);

    if (typeLower.includes('stock purchase') || typeLower.includes('zakup akcji') || typeLower.includes('buy')) {
      txType = 'BUY';
      // Parse quantity and price from comment if available (e.g., "OPEN BUY 2/3 @ 141.43" or "OPEN BUY 2 @ 51.90")
      if (commentRaw) {
        const match = commentRaw.match(/OPEN BUY ([\d\.\/]+)\s*@\s*([\d\.]+)/i);
        if (match) {
          const qtyStr = match[1];
          if (qtyStr.includes('/')) {
            const parts = qtyStr.split('/');
            qty = parseFloat(parts[0]);
          } else {
            qty = parseFloat(qtyStr);
          }
          price = parseFloat(match[2]);
        }
      }
    } else if (typeLower.includes('stock sell') || typeLower.includes('sprzedaż akcji') || typeLower.includes('sell')) {
      txType = 'SELL';
      if (commentRaw) {
        const match = commentRaw.match(/CLOSE BUY ([\d\.\/]+)\s*@\s*([\d\.]+)/i);
        if (match) {
          const qtyStr = match[1];
          if (qtyStr.includes('/')) {
            const parts = qtyStr.split('/');
            qty = parseFloat(parts[0]);
          } else {
            qty = parseFloat(qtyStr);
          }
          price = parseFloat(match[2]);
        }
      }
    } else if (typeLower.includes('dividend') || typeLower.includes('dywidend')) {
      txType = 'DIVIDEND';
    } else if (typeLower.includes('withholding tax') || typeLower.includes('podatek u źródła')) {
      txType = 'TAX';
    } else if (typeLower.includes('transfer') || typeLower.includes('przelew') || typeLower.includes('deposit') || typeLower.includes('wpłata')) {
      txType = amountVal >= 0 ? 'DEPOSIT' : 'WITHDRAWAL';
    } else if (typeLower.includes('withdrawal') || typeLower.includes('wypłata')) {
      txType = 'WITHDRAWAL';
    } else if (typeLower.includes('free funds interest') || typeLower.includes('odsetki')) {
      txType = 'INTEREST';
    } else {
      return null;
    }

    return {
      id: 'xtb-' + Math.random().toString(36).substr(2, 9),
      portfolioId,
      type: txType,
      ticker: tickerRaw || (commentRaw ? commentRaw.split(' ')[0] : 'N/A'),
      instrumentName: instrumentRaw || tickerRaw || 'Operacja XTB',
      assetCategory: category,
      date: formattedDate,
      quantity: qty,
      price: price,
      currency: currency,
      commission: 0,
      tax: txType === 'TAX' ? Math.abs(amountVal) : 0,
      totalValue: Math.abs(amountVal),
      xtbId: xtbId,
      comment: commentRaw
    };
  }

  public static categorizeSymbol(symbol: string): AssetCategory {
    if (!symbol) return 'Akcje GPW';
    const sym = symbol.toUpperCase();

    if (sym.endsWith('.PL') || sym.includes('WIG') || sym.includes('GPW')) return 'Akcje GPW';
    if (sym.endsWith('.US') || ['AAPL', 'NVDA', 'TSLA', 'AMKR', 'TDC', 'INTU', 'COR1', 'SPCX', 'UPST', 'IRM', 'MSFT', 'AMZN', 'GOOGL', 'META'].includes(sym)) {
      return 'Akcje NASDAQ';
    }
    if (sym.endsWith('.DE') || sym.endsWith('.NL') || sym.endsWith('.UK') || sym.endsWith('.FR') || sym.endsWith('.ES') || sym.endsWith('.IT')) {
      return 'Akcje Europejskie';
    }
    if (sym.includes('ETF') || sym.includes('VWCE') || sym.includes('SPY') || sym.includes('QQQ') || sym.includes('EQAC')) {
      return 'ETF';
    }
    if (sym.includes('GOLD') || sym.includes('SILVER') || sym.includes('OIL') || sym.includes('GAS') || sym.includes('XAU') || sym.includes('XAG')) {
      return 'Surowce';
    }
    if (sym.includes('EURUSD') || sym.includes('USDPLN') || sym.includes('EURPLN') || sym.includes('GBPUSD')) {
      return 'Forex';
    }
    return 'Akcje GPW';
  }

  public static detectCurrency(symbolOrComment?: string): Currency {
    if (!symbolOrComment) return 'PLN';
    const str = symbolOrComment.toUpperCase();
    if (str.includes('.US') || str.includes('USD') || str.includes('AMKR') || str.includes('TDC') || str.includes('INTU')) return 'USD';
    if (str.includes('.DE') || str.includes('.NL') || str.includes('.FR') || str.includes('EUR')) return 'EUR';
    if (str.includes('.UK') || str.includes('GBP')) return 'GBP';
    return 'PLN';
  }

  private static formatDateString(rawDate: string): string {
    if (!rawDate) return new Date().toISOString();
    try {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) return d.toISOString();
    } catch {}
    return new Date().toISOString();
  }
}
