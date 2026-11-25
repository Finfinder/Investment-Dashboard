import { IStorageAdapter } from './IStorageAdapter';
import { Portfolio, Transaction } from '../../types/portfolio';

const PORTFOLIOS_KEY = 'inv_dashboard_portfolios_v1';
const TRANSACTIONS_KEY = 'inv_dashboard_transactions_v1';

const INITIAL_PORTFOLIOS: Portfolio[] = [
  {
    id: 'port-xtb',
    name: 'XTB',
    currency: 'PLN',
    includeInDashboard: true,
    description: 'Główny portfel akcji i ETF w XTB',
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    color: '#ef4444' // Red matching screenshots
  },
  {
    id: 'port-marysia',
    name: 'Marysia',
    currency: 'PLN',
    includeInDashboard: true,
    description: 'Portfel oszczędnościowo-inwestycyjny',
    createdAt: '2025-12-15T00:00:00Z',
    updatedAt: new Date().toISOString(),
    color: '#10b981' // Green
  },
  {
    id: 'port-propicks',
    name: 'ProPicks',
    currency: 'PLN',
    includeInDashboard: true,
    description: 'Portfel wybranych spółek amerykańskich i europejskich',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    color: '#8b5cf6' // Purple
  },
  {
    id: 'port-ike',
    name: 'IKE',
    currency: 'PLN',
    includeInDashboard: true,
    description: 'Indywidualne Konto Emerytalne',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    color: '#f97316' // Orange
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  // XTB portfolio transactions
  {
    id: 'tx-1',
    portfolioId: 'port-xtb',
    type: 'BUY',
    ticker: 'MIL.PL',
    instrumentName: 'MILLENNIUM',
    assetCategory: 'Akcje GPW',
    date: '2025-12-05T10:30:00',
    quantity: 20,
    price: 15.42,
    currency: 'PLN',
    commission: 0,
    tax: 0,
    totalValue: 308.40,
    includeInPIT: true
  },
  {
    id: 'tx-2',
    portfolioId: 'port-xtb',
    type: 'BUY',
    ticker: 'PCO.PL',
    instrumentName: 'PEPCO',
    assetCategory: 'Akcje GPW',
    date: '2025-12-06T11:15:00',
    quantity: 10,
    price: 26.62,
    currency: 'PLN',
    commission: 0,
    tax: 0,
    totalValue: 266.20,
    includeInPIT: true
  },
  {
    id: 'tx-3',
    portfolioId: 'port-xtb',
    type: 'BUY',
    ticker: 'AMKR',
    instrumentName: 'Amkor Technology Inc.',
    assetCategory: 'Akcje NASDAQ',
    date: '2025-12-10T15:45:00',
    quantity: 3,
    price: 134.91,
    currency: 'PLN',
    commission: 0,
    tax: 0,
    totalValue: 404.73,
    includeInPIT: true
  },
  {
    id: 'tx-4',
    portfolioId: 'port-xtb',
    type: 'BUY',
    ticker: 'TDC',
    instrumentName: 'Teradata Corporation',
    assetCategory: 'Akcje NYSE',
    date: '2025-12-12T16:00:00',
    quantity: 3,
    price: 106.44,
    currency: 'PLN',
    commission: 0,
    tax: 0,
    totalValue: 319.32,
    includeInPIT: true
  },
  // ProPicks portfolio transactions
  {
    id: 'tx-5',
    portfolioId: 'port-propicks',
    type: 'BUY',
    ticker: 'ZAB.PL',
    instrumentName: 'ŻABKA GROUP',
    assetCategory: 'Akcje GPW',
    date: '2026-01-05T09:00:00',
    quantity: 50,
    price: 19.50,
    currency: 'PLN',
    commission: 0,
    tax: 0,
    totalValue: 975.00
  },
  {
    id: 'tx-6',
    portfolioId: 'port-propicks',
    type: 'DIVIDEND',
    ticker: 'AMKR',
    instrumentName: 'Amkor Technology Dividend',
    assetCategory: 'Akcje NASDAQ',
    date: '2026-06-23T10:00:00',
    quantity: 3,
    price: 0.0835,
    currency: 'USD',
    commission: 0,
    tax: 0.05,
    totalValue: 0.20
  },
  // Marysia portfolio transactions
  {
    id: 'tx-7',
    portfolioId: 'port-marysia',
    type: 'BUY',
    ticker: 'VWCE.DE',
    instrumentName: 'Vanguard FTSE All-World ETF',
    assetCategory: 'ETF',
    date: '2025-12-20T12:00:00',
    quantity: 25,
    price: 430.00,
    currency: 'PLN',
    commission: 0,
    tax: 0,
    totalValue: 10750.00
  },
  // IKE portfolio transactions
  {
    id: 'tx-8',
    portfolioId: 'port-ike',
    type: 'BUY',
    ticker: 'PKO.PL',
    instrumentName: 'PKO Bank Polski',
    assetCategory: 'Akcje GPW',
    date: '2026-02-10T10:00:00',
    quantity: 6,
    price: 56.50,
    currency: 'PLN',
    commission: 0,
    tax: 0,
    totalValue: 339.00
  }
];

export class LocalStorageAdapter implements IStorageAdapter {
  private getPortfolioKey(userId?: string): string {
    if (!userId || userId === 'usr-demo-1' || userId === 'usr-default') {
      return PORTFOLIOS_KEY;
    }
    return `inv_dashboard_portfolios_user_${userId}`;
  }

  private getTransactionKey(userId?: string): string {
    if (!userId || userId === 'usr-demo-1' || userId === 'usr-default') {
      return TRANSACTIONS_KEY;
    }
    return `inv_dashboard_transactions_user_${userId}`;
  }

  async getPortfolios(userId?: string): Promise<Portfolio[]> {
    const key = this.getPortfolioKey(userId);
    const raw = localStorage.getItem(key);
    const isDemoUser = !userId || userId === 'usr-demo-1' || userId === 'usr-default';

    if (!raw) {
      if (isDemoUser) {
        localStorage.setItem(key, JSON.stringify(INITIAL_PORTFOLIOS));
        return INITIAL_PORTFOLIOS;
      }
      return [];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return isDemoUser ? INITIAL_PORTFOLIOS : [];
    }
  }

  async savePortfolios(portfolios: Portfolio[], userId?: string): Promise<void> {
    const key = this.getPortfolioKey(userId);
    localStorage.setItem(key, JSON.stringify(portfolios));
  }

  async getTransactions(userId?: string): Promise<Transaction[]> {
    const key = this.getTransactionKey(userId);
    const raw = localStorage.getItem(key);
    const isDemoUser = !userId || userId === 'usr-demo-1' || userId === 'usr-default';

    if (!raw) {
      if (isDemoUser) {
        localStorage.setItem(key, JSON.stringify(INITIAL_TRANSACTIONS));
        return INITIAL_TRANSACTIONS;
      }
      return [];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return isDemoUser ? INITIAL_TRANSACTIONS : [];
    }
  }

  async saveTransactions(transactions: Transaction[], userId?: string): Promise<void> {
    const key = this.getTransactionKey(userId);
    localStorage.setItem(key, JSON.stringify(transactions));
  }

  async exportBackupData(userId?: string): Promise<string> {
    const portfolios = await this.getPortfolios(userId);
    const transactions = await this.getTransactions(userId);
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      portfolios,
      transactions
    }, null, 2);
  }

  async importBackupData(jsonString: string, userId?: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.portfolios) && Array.isArray(data.transactions)) {
        await this.savePortfolios(data.portfolios, userId);
        await this.saveTransactions(data.transactions, userId);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async clearAllData(userId?: string): Promise<void> {
    localStorage.removeItem(this.getPortfolioKey(userId));
    localStorage.removeItem(this.getTransactionKey(userId));
  }
}
