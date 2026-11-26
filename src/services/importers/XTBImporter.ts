import * as xlsx from 'xlsx';
import Papa from 'papaparse';
import { Transaction, AssetCategory, Currency } from '../../types/portfolio';
import { XTBImportParseResult } from '../../types/xtb';

const TRADE_COMMENT_REGEX = /(?:OPEN|CLOSE)\s+BUY\s+[\d./]+\s*@\s*[\d.]+\s+([A-Z0-9._-]+)/i;
const TRADE_QTY_PRICE_OPEN_REGEX = /OPEN BUY ([\d./]+)\s*@\s*([\d.]+)/i;
const TRADE_QTY_PRICE_CLOSE_REGEX = /CLOSE BUY ([\d./]+)\s*@\s*([\d.]+)/i;
const TICKER_SUFFIX_REGEX = /\b([A-Z0-9_.-]+\.(?:PL|US|DE|NL|FR|UK|ES|IT))\b/i;

interface CashOpContext {
  portfolioId: string;
  typeRaw: string;
  tickerRaw: string;
  instrumentRaw: string;
  timeRaw: string;
  amountVal: number;
  xtbId?: string;
  commentRaw?: string;
}
type SheetCell = string | number | boolean | null | undefined;

/** Tolerance used when comparing instrument quantities between sheets. */
const QUANTITY_EPSILON = 0.0001;

interface TradeFingerprint {
  ticker: string;
  quantity: number;
  date: string;
}

/** Calendar day (UTC) of an ISO timestamp, used to match rows across XTB sheets. */
function toDayStamp(dateIso: string): string {
  const parsed = new Date(dateIso);
  if (Number.isNaN(parsed.getTime())) return dateIso.slice(0, 10);
  return parsed.toISOString().slice(0, 10);
}

/**
 * Whether an already parsed transaction represents the same trade as the
 * candidate closed-position leg. XTB cash operations and closed positions use
 * unrelated identifier spaces (operation ID vs. position ID), so the match has
 * to rely on ticker + quantity + trading day.
 */
function isSameTrade(existing: Transaction, candidate: TradeFingerprint): boolean {
  if (existing.ticker?.toUpperCase() !== candidate.ticker.toUpperCase()) {
    return false;
  }
  if (Math.abs(existing.quantity - candidate.quantity) > QUANTITY_EPSILON) {
    return false;
  }
  return toDayStamp(existing.date) === toDayStamp(candidate.date);
}

/**
 * Finds a matching trade that has not been claimed by a previous closed
 * position yet and marks it as claimed, so two genuinely distinct positions
 * sharing ticker/quantity/day are not collapsed into one.
 */
function claimMatchingTrade(
  transactions: Transaction[],
  claimedIds: Set<string>,
  type: Transaction['type'],
  candidate: TradeFingerprint
): Transaction | undefined {
  const match = transactions.find(
    t => t.type === type && !claimedIds.has(t.id) && isSameTrade(t, candidate)
  );
  if (match) {
    claimedIds.add(match.id);
  }
  return match;
}

interface ClosedPositionRow {
  result: XTBImportParseResult;
  claimedIds: Set<string>;
  portfolioId: string;
  ticker: string;
  instrumentName: string;
  openDate: string;
  closeDate: string;
  quantity: number;
  openPrice: number;
  closePrice: number;
  currency: Currency;
  posId?: string;
  comment: string;
}

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
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            reject(new Error('Błąd odczytu pliku Excel: ' + msg));
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
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            reject(new Error('Błąd odczytu pliku CSV: ' + msg));
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
    const claimedIds = new Set<string>();
    let accountNumber = '';

    // Sheet 1: Cash Operations / Operacje gotówkowe
    const cashSheetName = workbook.SheetNames.find(s => 
      s.toLowerCase().includes('cash') || s.toLowerCase().includes('gotówk') || s.toLowerCase().includes('operacj')
    );

    if (cashSheetName) {
      const sheet = workbook.Sheets[cashSheetName];
      const rows: SheetCell[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });

      if (rows.length > 0) {
        // Extract account number if present (e.g., row 0: Account number, 50582183)
        if (rows[0]?.[1] != null) {
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
          const headers = rows[headerIndex].map((h: SheetCell) => String(h ?? '').trim().toLowerCase());
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
            const amountVal = amountIdx !== -1 ? Number.parseFloat(String(row[amountIdx] || '0').replace(',', '.')) : 0;
            const xtbId = idIdx !== -1 ? String(row[idIdx] || '').trim() : undefined;
            const commentRaw = commentIdx !== -1 ? String(row[commentIdx] || '').trim() : '';

            const tx = XTBImporter.convertCashOpToTransaction({
              portfolioId,
              typeRaw,
              tickerRaw,
              instrumentRaw,
              timeRaw,
              amountVal,
              xtbId,
              commentRaw
            });

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
      const rows: SheetCell[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });

      let headerIndex = -1;
      for (let i = 0; i < Math.min(15, rows.length); i++) {
        const rowStr = (rows[i] || []).join(' ').toLowerCase();
        if (rowStr.includes('instrument') && (rowStr.includes('type') || rowStr.includes('typ'))) {
          headerIndex = i;
          break;
        }
      }

      if (headerIndex !== -1) {
        const headers = rows[headerIndex].map((h: SheetCell) => String(h ?? '').trim().toLowerCase());
        const instIdx = headers.findIndex(h => h.includes('instrument') || h.includes('walor'));
        const tickerIdx = headers.findIndex(h => h.includes('ticker') || h.includes('symbol'));
        const volIdx = headers.findIndex(h => h.includes('volume') || h.includes('wolumen') || h.includes('liczba'));
        const openPriceIdx = headers.findIndex(h => h.includes('open price') || h.includes('cena otwarcia'));
        const openTimeIdx = headers.findIndex(h => h.includes('open time') || h.includes('czas otwarcia'));
        const closePriceIdx = headers.findIndex(h => h.includes('close price') || h.includes('cena zamknięcia'));
        const closeTimeIdx = headers.findIndex(h => h.includes('close time') || h.includes('czas zamknięcia'));
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
          const vol = volIdx !== -1 ? Number.parseFloat(String(row[volIdx] || '0').replace(',', '.')) : 0;
          const openP = openPriceIdx !== -1 ? Number.parseFloat(String(row[openPriceIdx] || '0').replace(',', '.')) : 0;
          const closeP = closePriceIdx !== -1 ? Number.parseFloat(String(row[closePriceIdx] || '0').replace(',', '.')) : 0;
          const posId = posIdIdx !== -1 ? String(row[posIdIdx] || '').trim() : undefined;
          const comment = commentIdx !== -1 ? String(row[commentIdx] || '').trim() : '';

          if (vol > 0 && openP > 0) {
            XTBImporter.appendClosedPositionTrade({
              result,
              claimedIds,
              portfolioId,
              ticker: ticker || inst,
              instrumentName: inst || ticker,
              openDate: XTBImporter.formatDateString(openTime),
              closeDate: XTBImporter.formatDateString(closeTime),
              quantity: vol,
              openPrice: openP,
              closePrice: closeP,
              currency: XTBImporter.detectCurrency(ticker),
              posId,
              comment
            });
          }
        }
      }
    }

    return result;
  }

  /**
   * Adds the BUY/SELL legs of a closed position, skipping legs already imported
   * from the Cash Operations sheet. Cash Operations may already contain the
   * opening and/or closing trade of the same position, so legs are matched by
   * ticker + quantity + trading day (identifier namespaces of both sheets are
   * unrelated) and each existing transaction can satisfy at most one leg.
   */
  private static appendClosedPositionTrade(row: ClosedPositionRow): void {
    const { result, claimedIds, portfolioId, ticker, instrumentName } = row;
    const quantity = row.quantity;

    const existingBuy = claimMatchingTrade(result.transactions, claimedIds, 'BUY', {
      ticker,
      quantity,
      date: row.openDate
    });
    const existingSell = claimMatchingTrade(result.transactions, claimedIds, 'SELL', {
      ticker,
      quantity,
      date: row.closeDate
    });

    if (existingBuy && existingSell) {
      // Both legs are already present - the duplicate pair is skipped.
      return;
    }

    let createdCount = 0;
    let buyTransactionId = existingBuy?.id;

    if (!existingBuy) {
      const buyTx: Transaction = {
        id: 'xtb-buy-' + Math.random().toString(36).slice(2, 11),
        portfolioId,
        type: 'BUY',
        ticker,
        instrumentName,
        assetCategory: XTBImporter.categorizeSymbol(ticker),
        date: row.openDate,
        quantity,
        price: row.openPrice,
        currency: row.currency,
        commission: 0,
        tax: 0,
        totalValue: quantity * row.openPrice,
        xtbId: row.posId ? row.posId + '-buy' : undefined,
        comment: `Otwarcie pozycji XTB #${row.posId || ''} ${row.comment}`
      };
      result.transactions.push(buyTx);
      claimedIds.add(buyTx.id);
      buyTransactionId = buyTx.id;
      createdCount++;
    }

    if (!existingSell) {
      const sellTx: Transaction = {
        id: 'xtb-sell-' + Math.random().toString(36).slice(2, 11),
        portfolioId,
        type: 'SELL',
        ticker,
        instrumentName,
        assetCategory: XTBImporter.categorizeSymbol(ticker),
        date: row.closeDate,
        quantity,
        price: row.closePrice,
        currency: row.currency,
        commission: 0,
        tax: 0,
        totalValue: quantity * row.closePrice,
        xtbId: row.posId ? row.posId + '-sell' : undefined,
        linkedBuyTransactionId: buyTransactionId,
        comment: `Zamknięcie pozycji XTB #${row.posId || ''} ${row.comment}`
      };
      result.transactions.push(sellTx);
      claimedIds.add(sellTx.id);
      createdCount++;
    }

    if (createdCount > 0) {
      result.closedPositionsCount++;
      result.rawSummary.totalTrades += createdCount;
    }
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
        const amountVal = amountIdx !== -1 ? Number.parseFloat(String(row[amountIdx] || '0').replace(',', '.')) : 0;
        const xtbId = idIdx !== -1 ? String(row[idIdx] || '').trim() : undefined;
        const commentRaw = commentIdx !== -1 ? String(row[commentIdx] || '').trim() : '';

        const tx = XTBImporter.convertCashOpToTransaction({
          portfolioId,
          typeRaw,
          tickerRaw,
          instrumentRaw: instRaw,
          timeRaw,
          amountVal,
          xtbId,
          commentRaw
        });

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

  private static convertCashOpToTransaction(ctx: CashOpContext): Transaction | null {
    const {
      portfolioId,
      typeRaw,
      tickerRaw,
      instrumentRaw,
      timeRaw,
      amountVal,
      xtbId,
      commentRaw
    } = ctx;
    const typeLower = typeRaw.toLowerCase();
    const formattedDate = XTBImporter.formatDateString(timeRaw);

    let txType: Transaction['type'];
    let qty = 1;
    let price = Math.abs(amountVal);

    if (typeLower.includes('stock purchase') || typeLower.includes('zakup akcji') || typeLower.includes('buy')) {
      txType = 'BUY';
      if (commentRaw) {
        const match = TRADE_QTY_PRICE_OPEN_REGEX.exec(commentRaw);
        if (match) {
          const qtyStr = match[1];
          qty = qtyStr.includes('/') ? Number.parseFloat(qtyStr.split('/')[0]) : Number.parseFloat(qtyStr);
          price = Number.parseFloat(match[2]);
        }
      }
    } else if (typeLower.includes('stock sell') || typeLower.includes('sprzedaż akcji') || typeLower.includes('sell')) {
      txType = 'SELL';
      if (commentRaw) {
        const match = TRADE_QTY_PRICE_CLOSE_REGEX.exec(commentRaw);
        if (match) {
          const qtyStr = match[1];
          qty = qtyStr.includes('/') ? Number.parseFloat(qtyStr.split('/')[0]) : Number.parseFloat(qtyStr);
          price = Number.parseFloat(match[2]);
        }
      }
    } else if (typeLower.includes('dividend') || typeLower.includes('dywidend')) {
      txType = 'DIVIDEND';
    } else if (typeLower.includes('withholding tax') || typeLower.includes('podatek u źródła') || typeLower.includes('tax') || typeLower.includes('podatek')) {
      txType = 'TAX';
    } else if (typeLower.includes('transfer') || typeLower.includes('przelew') || typeLower.includes('deposit') || typeLower.includes('wpłata')) {
      txType = amountVal >= 0 ? 'DEPOSIT' : 'WITHDRAWAL';
    } else if (typeLower.includes('withdrawal') || typeLower.includes('wypłata')) {
      txType = 'WITHDRAWAL';
    } else if (typeLower.includes('free funds interest') || typeLower.includes('odsetki') || typeLower.includes('interest')) {
      txType = 'INTEREST';
    } else {
      return null;
    }

    // Determine ticker symbol
    let parsedTicker = tickerRaw;
    if (!parsedTicker && commentRaw) {
      if (txType === 'BUY' || txType === 'SELL') {
        const matchTrade = TRADE_COMMENT_REGEX.exec(commentRaw);
        if (matchTrade) {
          parsedTicker = matchTrade[1];
        } else {
          const matchSuffix = TICKER_SUFFIX_REGEX.exec(commentRaw);
          if (matchSuffix) {
            parsedTicker = matchSuffix[1];
          }
        }
      } else if (txType === 'DIVIDEND' || txType === 'TAX') {
        const matchSuffix = TICKER_SUFFIX_REGEX.exec(commentRaw);
        if (matchSuffix) {
          parsedTicker = matchSuffix[1];
        } else {
          // Check for uppercase stock symbol token (e.g., AAPL, NVDA, PKO)
          const words = commentRaw.trim().split(/\s+/);
          const candidate = words.find(w => /^[A-Z0-9]{2,6}(\.[A-Z]{2})?$/.test(w) && !['DIVIDEND', 'DYWIDENDA', 'WHT', 'TAX', 'PODATEK'].includes(w.toUpperCase()));
          if (candidate) {
            parsedTicker = candidate;
          }
        }
      }
    }

    // Detect currency using full context (ticker, comment, instrument)
    const currencySource = [parsedTicker, tickerRaw, commentRaw, instrumentRaw].filter(Boolean).join(' ');
    const currency = XTBImporter.detectCurrency(currencySource);

    const category = XTBImporter.categorizeSymbol(parsedTicker || instrumentRaw);
    const instrumentName = instrumentRaw || parsedTicker || commentRaw || 'Operacja XTB';

    return {
      id: 'xtb-' + Math.random().toString(36).slice(2, 11),
      portfolioId,
      type: txType,
      ticker: parsedTicker || 'N/A',
      instrumentName,
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

    if (sym.includes('ETF') || sym.includes('VWCE') || sym.includes('SPY') || sym.includes('QQQ') || sym.includes('EQAC')) {
      return 'ETF';
    }
    if (sym.includes('GOLD') || sym.includes('SILVER') || sym.includes('OIL') || sym.includes('GAS') || sym.includes('XAU') || sym.includes('XAG')) {
      return 'Surowce';
    }
    if (sym.includes('EURUSD') || sym.includes('USDPLN') || sym.includes('EURPLN') || sym.includes('GBPUSD')) {
      return 'Forex';
    }
    if (sym.endsWith('.PL') || sym.includes('WIG') || sym.includes('GPW')) return 'Akcje GPW';
    if (sym.endsWith('.US') || ['AAPL', 'NVDA', 'TSLA', 'AMKR', 'TDC', 'INTU', 'COR1', 'SPCX', 'UPST', 'IRM', 'MSFT', 'AMZN', 'GOOGL', 'META'].includes(sym)) {
      return 'Akcje NASDAQ';
    }
    if (sym.endsWith('.DE') || sym.endsWith('.NL') || sym.endsWith('.UK') || sym.endsWith('.FR') || sym.endsWith('.ES') || sym.endsWith('.IT')) {
      return 'Akcje Europejskie';
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
      if (!Number.isNaN(d.getTime())) return d.toISOString();
    } catch {}
    return new Date().toISOString();
  }
}
