import { describe, it, expect } from 'vitest';
import * as xlsx from 'xlsx';
import { XTBImporter } from '../XTBImporter';
import {
  SAMPLE_XTB_CSV_VALID,
  SAMPLE_XTB_CSV_MALFORMED,
  SAMPLE_XTB_CSV_EMPTY,
  generateMockXTBWorkbook,
  createMockCSVFile,
  createMockXLSXFile
} from '../../../test/fixtures/xtbFixtures';

describe('XTBImporter', () => {
  const targetPortfolioId = 'port-test-123';

  describe('categorizeSymbol', () => {
    it('categorizes Polish stocks (.PL, GPW, WIG) as Akcje GPW', () => {
      expect(XTBImporter.categorizeSymbol('CDR.PL')).toBe('Akcje GPW');
      expect(XTBImporter.categorizeSymbol('PKO.PL')).toBe('Akcje GPW');
      expect(XTBImporter.categorizeSymbol('WIG20')).toBe('Akcje GPW');
      expect(XTBImporter.categorizeSymbol('GPW_INVEST')).toBe('Akcje GPW');
    });

    it('categorizes US stocks (.US, AAPL, NVDA, TSLA, AMKR) as Akcje NASDAQ', () => {
      expect(XTBImporter.categorizeSymbol('AAPL.US')).toBe('Akcje NASDAQ');
      expect(XTBImporter.categorizeSymbol('NVDA')).toBe('Akcje NASDAQ');
      expect(XTBImporter.categorizeSymbol('TSLA')).toBe('Akcje NASDAQ');
      expect(XTBImporter.categorizeSymbol('AMKR')).toBe('Akcje NASDAQ');
    });

    it('categorizes European stocks (.DE, .NL, .UK, .FR, .ES, .IT) as Akcje Europejskie', () => {
      expect(XTBImporter.categorizeSymbol('SAP.DE')).toBe('Akcje Europejskie');
      expect(XTBImporter.categorizeSymbol('ASML.NL')).toBe('Akcje Europejskie');
      expect(XTBImporter.categorizeSymbol('BP.UK')).toBe('Akcje Europejskie');
      expect(XTBImporter.categorizeSymbol('TOTAL.FR')).toBe('Akcje Europejskie');
    });

    it('categorizes ETFs (VWCE, SPY, QQQ, ETF) as ETF', () => {
      expect(XTBImporter.categorizeSymbol('VWCE.DE')).toBe('ETF');
      expect(XTBImporter.categorizeSymbol('SPY.US')).toBe('ETF');
      expect(XTBImporter.categorizeSymbol('QQQ.US')).toBe('ETF');
      expect(XTBImporter.categorizeSymbol('BETA_ETF')).toBe('ETF');
    });

    it('categorizes commodities (GOLD, SILVER, OIL, GAS, XAU, XAG) as Surowce', () => {
      expect(XTBImporter.categorizeSymbol('GOLD')).toBe('Surowce');
      expect(XTBImporter.categorizeSymbol('SILVER')).toBe('Surowce');
      expect(XTBImporter.categorizeSymbol('OIL.WTI')).toBe('Surowce');
      expect(XTBImporter.categorizeSymbol('NATGAS')).toBe('Surowce');
    });

    it('categorizes forex pairs (EURUSD, USDPLN) as Forex', () => {
      expect(XTBImporter.categorizeSymbol('EURUSD')).toBe('Forex');
      expect(XTBImporter.categorizeSymbol('USDPLN')).toBe('Forex');
    });

    it('falls back to Akcje GPW for empty or unrecognized symbols', () => {
      expect(XTBImporter.categorizeSymbol('')).toBe('Akcje GPW');
      expect(XTBImporter.categorizeSymbol('UNKNOWN_SYMBOL_XYZ')).toBe('Akcje GPW');
    });
  });

  describe('detectCurrency', () => {
    it('detects USD for .US suffix or USD references', () => {
      expect(XTBImporter.detectCurrency('AAPL.US')).toBe('USD');
      expect(XTBImporter.detectCurrency('USD account')).toBe('USD');
      expect(XTBImporter.detectCurrency('AMKR')).toBe('USD');
    });

    it('detects EUR for European suffixes or EUR references', () => {
      expect(XTBImporter.detectCurrency('SAP.DE')).toBe('EUR');
      expect(XTBImporter.detectCurrency('ASML.NL')).toBe('EUR');
      expect(XTBImporter.detectCurrency('Dividend EUR')).toBe('EUR');
    });

    it('detects GBP for UK suffix or GBP references', () => {
      expect(XTBImporter.detectCurrency('BP.UK')).toBe('GBP');
      expect(XTBImporter.detectCurrency('GBP dividend')).toBe('GBP');
    });

    it('defaults to PLN for undefined or PL symbols', () => {
      expect(XTBImporter.detectCurrency(undefined)).toBe('PLN');
      expect(XTBImporter.detectCurrency('CDR.PL')).toBe('PLN');
    });
  });

  describe('parseFile with CSV', () => {
    it('parses valid CSV statement and assigns target portfolioId', async () => {
      const file = createMockCSVFile(SAMPLE_XTB_CSV_VALID);
      const result = await XTBImporter.parseFile(file, targetPortfolioId);

      expect(result.cashOperationsCount).toBeGreaterThan(0);
      expect(result.transactions.length).toBeGreaterThan(0);

      // Verify all transactions belong to target portfolio
      result.transactions.forEach(tx => {
        expect(tx.portfolioId).toBe(targetPortfolioId);
      });

      // Verify summary numbers
      expect(result.rawSummary.totalDeposits).toBe(5000.0);
      expect(result.rawSummary.totalWithdrawals).toBe(1000.0);
      expect(result.rawSummary.totalDividends).toBe(150.0);

      // Verify trade parsed from comment: OPEN BUY 10 @ 120.50 CDR.PL
      const buyTx = result.transactions.find(tx => tx.type === 'BUY');
      expect(buyTx).toBeDefined();
      expect(buyTx?.quantity).toBe(10);
      expect(buyTx?.price).toBe(120.5);
      expect(buyTx?.ticker).toBe('CDR.PL');

      // Verify trade parsed from comment: CLOSE BUY 5 @ 140.00 CDR.PL
      const sellTx = result.transactions.find(tx => tx.type === 'SELL');
      expect(sellTx).toBeDefined();
      expect(sellTx?.quantity).toBe(5);
      expect(sellTx?.price).toBe(140.0);

      // Verify dividend transaction: Dywidenda Apple AAPL.US (currency USD, ticker AAPL.US)
      const divTx = result.transactions.find(tx => tx.type === 'DIVIDEND');
      expect(divTx).toBeDefined();
      expect(divTx?.ticker).toBe('AAPL.US');
      expect(divTx?.currency).toBe('USD');
      expect(divTx?.totalValue).toBe(150.0);

      // Verify tax transaction: WHT podatek AAPL.US (currency USD, ticker AAPL.US)
      const taxTx = result.transactions.find(tx => tx.type === 'TAX');
      expect(taxTx).toBeDefined();
      expect(taxTx?.ticker).toBe('AAPL.US');
      expect(taxTx?.currency).toBe('USD');
      expect(taxTx?.tax).toBe(22.5);

      // Verify cash deposit and withdrawal do not have pseudo-tickers
      const depositTx = result.transactions.find(tx => tx.type === 'DEPOSIT');
      expect(depositTx).toBeDefined();
      expect(depositTx?.ticker).toBe('N/A');
      expect(depositTx?.currency).toBe('PLN');
    });

    it('detects correct currency and tickers for European and US dividends and taxes', async () => {
      const csv = `ID,Type,Time,Comment,Amount
301,Dywidenda,2025-05-01 10:00:00,Dywidenda SAP.DE,200.00
302,Podatek u źródła,2025-05-01 10:00:01,WHT podatek SAP.DE,-52.70
303,Dywidenda,2025-06-01 10:00:00,Dywidenda BP.UK,120.00
304,Dywidenda,2025-07-01 10:00:00,Dywidenda PKO.PL,350.00
`;
      const file = createMockCSVFile(csv, 'dividends.csv');
      const result = await XTBImporter.parseFile(file, targetPortfolioId);

      expect(result.transactions).toHaveLength(4);

      const sapDiv = result.transactions.find(t => t.xtbId === '301');
      expect(sapDiv?.ticker).toBe('SAP.DE');
      expect(sapDiv?.currency).toBe('EUR');
      expect(sapDiv?.type).toBe('DIVIDEND');

      const sapTax = result.transactions.find(t => t.xtbId === '302');
      expect(sapTax?.ticker).toBe('SAP.DE');
      expect(sapTax?.currency).toBe('EUR');
      expect(sapTax?.type).toBe('TAX');
      expect(sapTax?.tax).toBe(52.7);

      const bpDiv = result.transactions.find(t => t.xtbId === '303');
      expect(bpDiv?.ticker).toBe('BP.UK');
      expect(bpDiv?.currency).toBe('GBP');

      const pkoDiv = result.transactions.find(t => t.xtbId === '304');
      expect(pkoDiv?.ticker).toBe('PKO.PL');
      expect(pkoDiv?.currency).toBe('PLN');
    });

    it('returns empty result gracefully when CSV is empty', async () => {
      const file = createMockCSVFile(SAMPLE_XTB_CSV_EMPTY, 'empty.csv');
      const result = await XTBImporter.parseFile(file, targetPortfolioId);

      expect(result.cashOperationsCount).toBe(0);
      expect(result.transactions).toHaveLength(0);
    });

    it('returns empty result gracefully when CSV headers are unrecognized', async () => {
      const file = createMockCSVFile(SAMPLE_XTB_CSV_MALFORMED, 'malformed.csv');
      const result = await XTBImporter.parseFile(file, targetPortfolioId);

      expect(result.cashOperationsCount).toBe(0);
      expect(result.transactions).toHaveLength(0);
    });
  });

  describe('parseFile with XLSX', () => {
    it('parses valid XLSX statement with Cash Operations and Closed Positions', async () => {
      const wb = generateMockXTBWorkbook();
      const file = createMockXLSXFile(wb, 'statement.xlsx');
      const result = await XTBImporter.parseFile(file, targetPortfolioId);

      expect(result.accountNumber).toBe('50582183');
      expect(result.cashOperationsCount).toBeGreaterThan(0);
      expect(result.closedPositionsCount).toBe(2);

      // Should have generated BUY and SELL pairs for each closed position
      const buyClosed = result.transactions.filter(t => t.xtbId?.endsWith('-buy'));
      const sellClosed = result.transactions.filter(t => t.xtbId?.endsWith('-sell'));

      expect(buyClosed).toHaveLength(2);
      expect(sellClosed).toHaveLength(2);

      // Verify PKO.PL position
      const pkoBuy = buyClosed.find(t => t.ticker === 'PKO.PL');
      expect(pkoBuy).toBeDefined();
      expect(pkoBuy?.quantity).toBe(10);
      expect(pkoBuy?.price).toBe(50.0);

      const pkoSell = sellClosed.find(t => t.ticker === 'PKO.PL');
      expect(pkoSell).toBeDefined();
      expect(pkoSell?.quantity).toBe(10);
      expect(pkoSell?.price).toBe(58.0);
      expect(pkoSell?.linkedBuyTransactionId).toBe(pkoBuy?.id);
    });
  });

  describe('Unsupported files', () => {
    it('rejects with error when file format is not supported', async () => {
      const file = new File(['dummy'], 'report.pdf', { type: 'application/pdf' });
      await expect(XTBImporter.parseFile(file, targetPortfolioId)).rejects.toThrow(
        'Nieobsługiwany format pliku. Wybierz plik XLSX lub CSV z XTB.'
      );
    });
  });

  describe('closed positions deduplication (IT-14)', () => {
    /**
     * Builds a statement whose Cash Operations sheet already contains the
     * opening trade of a position that is also reported in Closed Positions.
     */
    function buildWorkbookWithOverlap(cashOps: (string | number)[][]): File {
      const wb = xlsx.utils.book_new();

      const cashData: (string | number)[][] = [
        ['Account number', '50582183'],
        ['ID', 'Type', 'Time', 'Comment', 'Amount'],
        ...cashOps
      ];
      xlsx.utils.book_append_sheet(wb, xlsx.utils.aoa_to_sheet(cashData), 'Operacje gotówkowe');

      const closedData: (string | number)[][] = [
        ['Position ID', 'Instrument', 'Type', 'Open Time', 'Open Price', 'Close Time', 'Close Price', 'Volume', 'Profit', 'Comment'],
        ['9901', 'PKO.PL', 'Buy', '2025-01-10 09:30:00', '50.00', '2025-02-15 16:45:00', '58.00', '10', '80.00', 'Zlecenie zrealizowane']
      ];
      xlsx.utils.book_append_sheet(wb, xlsx.utils.aoa_to_sheet(closedData), 'Pozycje zamknięte');

      return createMockXLSXFile(wb, 'overlap.xlsx');
    }

    it('skips both legs when cash operations already contain the opening and closing trade', async () => {
      const file = buildWorkbookWithOverlap([
        ['401', 'Zakup akcji', '2025-01-10 09:30:00', 'OPEN BUY 10 @ 50.00 PKO.PL', '-500.00'],
        ['402', 'Sprzedaż akcji', '2025-02-15 16:45:00', 'CLOSE BUY 10 @ 58.00 PKO.PL', '580.00']
      ]);

      const result = await XTBImporter.parseFile(file, targetPortfolioId);

      const buys = result.transactions.filter(t => t.type === 'BUY' && t.ticker === 'PKO.PL');
      const sells = result.transactions.filter(t => t.type === 'SELL' && t.ticker === 'PKO.PL');

      expect(buys).toHaveLength(1);
      expect(sells).toHaveLength(1);
      expect(result.closedPositionsCount).toBe(0);
      // Only the two cash operation trades remain.
      expect(result.rawSummary.totalTrades).toBe(0);
    });

    it('creates only the missing leg and links it to the existing opening trade', async () => {
      const file = buildWorkbookWithOverlap([
        ['401', 'Zakup akcji', '2025-01-10 09:30:00', 'OPEN BUY 10 @ 50.00 PKO.PL', '-500.00']
      ]);

      const result = await XTBImporter.parseFile(file, targetPortfolioId);

      const buys = result.transactions.filter(t => t.type === 'BUY' && t.ticker === 'PKO.PL');
      const sells = result.transactions.filter(t => t.type === 'SELL' && t.ticker === 'PKO.PL');

      expect(buys).toHaveLength(1);
      expect(sells).toHaveLength(1);
      expect(sells[0].linkedBuyTransactionId).toBe(buys[0].id);
      expect(result.closedPositionsCount).toBe(1);
      expect(result.rawSummary.totalTrades).toBe(1);
    });

    it('does not treat a different volume or trading day as a duplicate', async () => {
      const file = buildWorkbookWithOverlap([
        // Different quantity than the closed position (vol = 10).
        ['401', 'Zakup akcji', '2025-01-10 09:30:00', 'OPEN BUY 5 @ 50.00 PKO.PL', '-250.00'],
        // Same quantity but a different trading day.
        ['402', 'Zakup akcji', '2025-01-11 09:30:00', 'OPEN BUY 10 @ 50.00 PKO.PL', '-500.00']
      ]);

      const result = await XTBImporter.parseFile(file, targetPortfolioId);

      const buys = result.transactions.filter(t => t.type === 'BUY' && t.ticker === 'PKO.PL');
      const sells = result.transactions.filter(t => t.type === 'SELL' && t.ticker === 'PKO.PL');

      // Two cash-operation buys plus the closed position pair.
      expect(buys).toHaveLength(3);
      expect(sells).toHaveLength(1);
      expect(result.closedPositionsCount).toBe(1);
      expect(result.rawSummary.totalTrades).toBe(2);
    });

    it('keeps two identical closed positions distinct instead of collapsing them', async () => {
      const wb = xlsx.utils.book_new();

      const cashData: (string | number)[][] = [
        ['Account number', '50582183'],
        ['ID', 'Type', 'Time', 'Comment', 'Amount'],
        // Only one of the two openings was booked as a cash operation.
        ['401', 'Zakup akcji', '2025-01-10 09:30:00', 'OPEN BUY 10 @ 50.00 PKO.PL', '-500.00']
      ];
      xlsx.utils.book_append_sheet(wb, xlsx.utils.aoa_to_sheet(cashData), 'Operacje gotówkowe');

      const closedData: (string | number)[][] = [
        ['Position ID', 'Instrument', 'Type', 'Open Time', 'Open Price', 'Close Time', 'Close Price', 'Volume', 'Profit', 'Comment'],
        ['9901', 'PKO.PL', 'Buy', '2025-01-10 09:30:00', '50.00', '2025-02-15 16:45:00', '58.00', '10', '80.00', 'Zlecenie zrealizowane'],
        ['9902', 'PKO.PL', 'Buy', '2025-01-10 09:30:00', '50.00', '2025-02-15 16:45:00', '58.00', '10', '80.00', 'Zlecenie zrealizowane']
      ];
      xlsx.utils.book_append_sheet(wb, xlsx.utils.aoa_to_sheet(closedData), 'Pozycje zamknięte');

      const result = await XTBImporter.parseFile(
        createMockXLSXFile(wb, 'duplicate-positions.xlsx'),
        targetPortfolioId
      );

      const buys = result.transactions.filter(t => t.type === 'BUY' && t.ticker === 'PKO.PL');
      const sells = result.transactions.filter(t => t.type === 'SELL' && t.ticker === 'PKO.PL');

      // One cash-operation buy + one created buy (the second position is not
      // swallowed by the first match), and both closing legs.
      expect(buys).toHaveLength(2);
      expect(sells).toHaveLength(2);
      expect(result.closedPositionsCount).toBe(2);
      expect(result.rawSummary.totalTrades).toBe(3);
    });
  });
});
