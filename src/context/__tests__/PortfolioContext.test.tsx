import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { PortfolioProvider, usePortfolio } from '../PortfolioContext';
import { StorageService } from '../../services/storage/StorageService';
import { StooqProvider } from '../../services/market/StooqProvider';
import { createMockCSVFile, SAMPLE_XTB_CSV_VALID } from '../../test/fixtures/xtbFixtures';

// Mock AuthContext
vi.mock('../AuthContext', () => ({
  useAuth: () => ({
    authState: {
      user: { id: 'usr-test-1', email: 'test@example.com', name: 'Test User' },
      isAuthenticated: true
    }
  })
}));

describe('PortfolioContext Integration', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <PortfolioProvider>{children}</PortfolioProvider>
  );

  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes portfolios and transactions from storage adapter', async () => {
    const { result } = renderHook(() => usePortfolio(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(Array.isArray(result.current.portfolios)).toBe(true);
    expect(Array.isArray(result.current.transactions)).toBe(true);
    expect(result.current.selectedPortfolioId).toBe('ALL');
  });

  it('adds a new portfolio and updates state', async () => {
    const { result } = renderHook(() => usePortfolio(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const initialCount = result.current.portfolios.length;

    await act(async () => {
      await result.current.addPortfolio({
        name: 'Nowy Portfel Testowy',
        currency: 'PLN',
        includeInDashboard: true,
        description: 'Opis portfela'
      });
    });

    expect(result.current.portfolios).toHaveLength(initialCount + 1);
    const added = result.current.portfolios.find(p => p.name === 'Nowy Portfel Testowy');
    expect(added).toBeDefined();
    expect(added?.currency).toBe('PLN');
  });

  it('updates an existing portfolio', async () => {
    const { result } = renderHook(() => usePortfolio(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.addPortfolio({
        name: 'Do Edycji',
        currency: 'EUR',
        includeInDashboard: true
      });
    });

    const created = result.current.portfolios.find(p => p.name === 'Do Edycji')!;

    await act(async () => {
      await result.current.updatePortfolio(created.id, {
        name: 'Po Edycji',
        includeInDashboard: false
      });
    });

    const updated = result.current.portfolios.find(p => p.id === created.id)!;
    expect(updated.name).toBe('Po Edycji');
    expect(updated.includeInDashboard).toBe(false);
  });

  it('deletes portfolio and all associated transactions', async () => {
    const { result } = renderHook(() => usePortfolio(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.addPortfolio({
        name: 'Do Usunięcia',
        currency: 'PLN',
        includeInDashboard: true
      });
    });

    const created = result.current.portfolios.find(p => p.name === 'Do Usunięcia')!;

    await act(async () => {
      await result.current.addTransaction({
        portfolioId: created.id,
        type: 'BUY',
        ticker: 'TEST.PL',
        date: '2025-01-01',
        quantity: 10,
        price: 50,
        currency: 'PLN',
        commission: 0,
        tax: 0,
        totalValue: 500
      });
    });

    expect(result.current.transactions.some(t => t.portfolioId === created.id)).toBe(true);

    await act(async () => {
      await result.current.deletePortfolio(created.id);
    });

    expect(result.current.portfolios.some(p => p.id === created.id)).toBe(false);
    expect(result.current.transactions.some(t => t.portfolioId === created.id)).toBe(false);
  });

  it('adds and deletes transactions, updating holdings reactively', async () => {
    const { result } = renderHook(() => usePortfolio(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.addPortfolio({
        name: 'Portfel Transakcyjny',
        currency: 'PLN',
        includeInDashboard: true
      });
    });

    const port = result.current.portfolios.find(p => p.name === 'Portfel Transakcyjny')!;

    await act(async () => {
      await result.current.addTransaction({
        portfolioId: port.id,
        type: 'BUY',
        ticker: 'MIL.PL',
        date: '2025-01-01',
        quantity: 10,
        price: 20,
        currency: 'PLN',
        commission: 0,
        tax: 0,
        totalValue: 200
      });
    });

    const tx = result.current.transactions.find(t => t.ticker === 'MIL.PL' && t.portfolioId === port.id)!;
    expect(tx).toBeDefined();

    // Verify holding was calculated
    expect(result.current.holdings.some(h => h.ticker === 'MIL.PL')).toBe(true);

    // Delete transaction
    await act(async () => {
      await result.current.deleteTransaction(tx.id);
    });

    expect(result.current.transactions.some(t => t.id === tx.id)).toBe(false);
    expect(result.current.holdings.some(h => h.ticker === 'MIL.PL')).toBe(false);
  });

  it('imports transactions from XTB CSV file and populates state', async () => {
    const { result } = renderHook(() => usePortfolio(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const initialTxCount = result.current.transactions.length;
    const file = createMockCSVFile(SAMPLE_XTB_CSV_VALID);

    let importRes: { success: boolean; count: number; message: string } = { success: false, count: 0, message: '' };
    await act(async () => {
      importRes = await result.current.importXTBFile(file, 'port-default');
    });

    expect(importRes.success).toBe(true);
    expect(importRes.count).toBeGreaterThan(0);
    expect(result.current.transactions).toHaveLength(initialTxCount + importRes.count);
  });

  it('filters holdings when selectedPortfolioId is changed from ALL', async () => {
    const { result } = renderHook(() => usePortfolio(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.addPortfolio({
        name: 'Portfel A',
        currency: 'PLN',
        includeInDashboard: true
      });
    });

    await act(async () => {
      await result.current.addPortfolio({
        name: 'Portfel B',
        currency: 'PLN',
        includeInDashboard: true
      });
    });

    const portA = result.current.portfolios.find(p => p.name === 'Portfel A')!;
    const portB = result.current.portfolios.find(p => p.name === 'Portfel B')!;
    expect(portA).toBeDefined();
    expect(portB).toBeDefined();

    await act(async () => {
      await result.current.addTransaction({
        portfolioId: portA.id,
        type: 'BUY',
        ticker: 'TICKER_A.PL',
        date: '2025-01-01',
        quantity: 1,
        price: 100,
        currency: 'PLN',
        commission: 0,
        tax: 0,
        totalValue: 100
      });
    });

    await act(async () => {
      await result.current.addTransaction({
        portfolioId: portB.id,
        type: 'BUY',
        ticker: 'TICKER_B.PL',
        date: '2025-01-01',
        quantity: 1,
        price: 100,
        currency: 'PLN',
        commission: 0,
        tax: 0,
        totalValue: 100
      });
    });

    // When ALL: both holdings exist
    expect(result.current.holdings.some(h => h.ticker === 'TICKER_A.PL')).toBe(true);
    expect(result.current.holdings.some(h => h.ticker === 'TICKER_B.PL')).toBe(true);

    // Switch to portA
    act(() => {
      result.current.setSelectedPortfolioId(portA.id);
    });

    expect(result.current.holdings.some(h => h.ticker === 'TICKER_A.PL')).toBe(true);
    expect(result.current.holdings.some(h => h.ticker === 'TICKER_B.PL')).toBe(false);
  });

  it('filters non-traded pseudo-tickers before querying marketProvider.getQuotes during import and sync', async () => {
    const getQuotesSpy = vi.spyOn(StooqProvider.prototype, 'getQuotes');
    const { result } = renderHook(() => usePortfolio(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const file = createMockCSVFile(SAMPLE_XTB_CSV_VALID);
    await act(async () => {
      await result.current.importXTBFile(file, 'port-default');
    });

    expect(getQuotesSpy).toHaveBeenCalled();
    const allQueriedTickers = getQuotesSpy.mock.calls.flatMap(call => call[0]);

    // Traded stocks/ETFs from BUY/SELL operations should be queried
    expect(allQueriedTickers).toContain('CDR.PL');

    // Pseudo-tickers and non-traded entries must never be sent to getQuotes
    expect(allQueriedTickers).not.toContain('N/A');
    expect(allQueriedTickers).not.toContain('AAPL.US');
    expect(allQueriedTickers).not.toContain('Dywidenda');
    expect(allQueriedTickers).not.toContain('WHT');
    expect(allQueriedTickers).not.toContain('Przelew');
    expect(allQueriedTickers).not.toContain('Wypłata');

    // Verify syncPrices also respects the filter
    getQuotesSpy.mockClear();
    await act(async () => {
      await result.current.syncPrices();
    });

    const syncQueriedTickers = getQuotesSpy.mock.calls.flatMap(call => call[0]);
    expect(syncQueriedTickers).toContain('CDR.PL');
    expect(syncQueriedTickers).not.toContain('N/A');
    expect(syncQueriedTickers).not.toContain('AAPL.US');
    expect(syncQueriedTickers).not.toContain('Dywidenda');
    expect(syncQueriedTickers).not.toContain('WHT');

    getQuotesSpy.mockRestore();
  });

  it('does not call marketProvider.getQuotes when there are no traded tickers during syncPrices', async () => {
    const storageAdapter = StorageService.getInstance().getAdapter();
    await storageAdapter.saveTransactions([], 'usr-test-1');
    const getQuotesSpy = vi.spyOn(StooqProvider.prototype, 'getQuotes');

    const { result } = renderHook(() => usePortfolio(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    getQuotesSpy.mockClear();
    await act(async () => {
      await result.current.syncPrices();
    });

    // When there are no traded tickers, getQuotes should not be called with []
    expect(getQuotesSpy).not.toHaveBeenCalled();

    getQuotesSpy.mockRestore();
  });
});
