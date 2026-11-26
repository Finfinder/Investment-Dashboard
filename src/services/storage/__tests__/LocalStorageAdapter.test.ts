import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageAdapter } from '../LocalStorageAdapter';
import { Portfolio, Transaction } from '../../../types/portfolio';

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    localStorage.clear();
    adapter = new LocalStorageAdapter();
  });

  describe('Portfolios', () => {
    it('returns INITIAL_PORTFOLIOS for demo user when storage is empty', async () => {
      const portfolios = await adapter.getPortfolios('usr-demo-1');
      expect(portfolios.length).toBeGreaterThan(0);
      expect(portfolios.some(p => p.id === 'port-xtb')).toBe(true);
    });

    it('returns empty array for custom user when storage is empty', async () => {
      const portfolios = await adapter.getPortfolios('usr-custom-99');
      expect(portfolios).toEqual([]);
    });

    it('saves and retrieves portfolios correctly for custom user', async () => {
      const testPortfolios: Portfolio[] = [
        {
          id: 'custom-p1',
          name: 'Portfel Emerytalny',
          currency: 'PLN',
          includeInDashboard: true,
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01'
        }
      ];

      await adapter.savePortfolios(testPortfolios, 'usr-custom-99');
      const loaded = await adapter.getPortfolios('usr-custom-99');

      expect(loaded).toHaveLength(1);
      expect(loaded[0].name).toBe('Portfel Emerytalny');
    });
  });

  describe('Transactions', () => {
    it('returns INITIAL_TRANSACTIONS for demo user when storage is empty', async () => {
      const txs = await adapter.getTransactions('usr-demo-1');
      expect(txs.length).toBeGreaterThan(0);
      expect(txs.some(t => t.id === 'tx-1')).toBe(true);
    });

    it('returns empty array for custom user when storage is empty', async () => {
      const txs = await adapter.getTransactions('usr-custom-99');
      expect(txs).toEqual([]);
    });

    it('saves and retrieves transactions correctly for custom user', async () => {
      const testTxs: Transaction[] = [
        {
          id: 'tx-custom-1',
          portfolioId: 'custom-p1',
          type: 'BUY',
          ticker: 'PKO.PL',
          date: '2025-01-01',
          quantity: 10,
          price: 50,
          currency: 'PLN',
          commission: 0,
          tax: 0,
          totalValue: 500
        }
      ];

      await adapter.saveTransactions(testTxs, 'usr-custom-99');
      const loaded = await adapter.getTransactions('usr-custom-99');

      expect(loaded).toHaveLength(1);
      expect(loaded[0].ticker).toBe('PKO.PL');
    });
  });

  describe('Backup & Restore', () => {
    it('exports backup data as a valid JSON string', async () => {
      const jsonStr = await adapter.exportBackupData('usr-demo-1');
      const parsed = JSON.parse(jsonStr);

      expect(parsed.version).toBe('1.0');
      expect(Array.isArray(parsed.portfolios)).toBe(true);
      expect(Array.isArray(parsed.transactions)).toBe(true);
    });

    it('imports backup data successfully when JSON structure is valid', async () => {
      const backupData = {
        version: '1.0',
        portfolios: [
          {
            id: 'p-backup',
            name: 'Przywrócony Portfel',
            currency: 'PLN',
            includeInDashboard: true,
            createdAt: '2025-01-01',
            updatedAt: '2025-01-01'
          }
        ],
        transactions: [
          {
            id: 'tx-backup',
            portfolioId: 'p-backup',
            type: 'BUY',
            ticker: 'CDR.PL',
            date: '2025-01-01',
            quantity: 5,
            price: 150,
            currency: 'PLN',
            commission: 0,
            tax: 0,
            totalValue: 750
          }
        ]
      };

      const ok = await adapter.importBackupData(JSON.stringify(backupData), 'usr-restore');
      expect(ok).toBe(true);

      const loadedPortfolios = await adapter.getPortfolios('usr-restore');
      const loadedTxs = await adapter.getTransactions('usr-restore');

      expect(loadedPortfolios).toHaveLength(1);
      expect(loadedPortfolios[0].name).toBe('Przywrócony Portfel');
      expect(loadedTxs).toHaveLength(1);
      expect(loadedTxs[0].ticker).toBe('CDR.PL');
    });

    it('returns false when importing invalid or corrupted JSON', async () => {
      const result1 = await adapter.importBackupData('invalid json string', 'usr-err');
      expect(result1).toBe(false);

      const result2 = await adapter.importBackupData('{}', 'usr-err');
      expect(result2).toBe(false);
    });

    it('clears all data for user', async () => {
      await adapter.savePortfolios([], 'usr-clear');
      await adapter.saveTransactions([], 'usr-clear');

      await adapter.clearAllData('usr-clear');
      const portfolios = await adapter.getPortfolios('usr-clear');
      expect(portfolios).toEqual([]);
    });
  });
});
