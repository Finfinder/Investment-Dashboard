import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Portfolio, Transaction, HoldingPosition, PortfolioSummaryStats } from '../types/portfolio';
import { MarketQuote } from '../types/marketData';
import { StorageService } from '../services/storage/StorageService';
import { StooqProvider } from '../services/market/StooqProvider';
import { PortfolioCalculations } from '../services/analytics/portfolioCalculations';
import { XTBImporter } from '../services/importers/XTBImporter';

import { useAuth } from './AuthContext';

interface PortfolioContextType {
  portfolios: Portfolio[];
  selectedPortfolioId: string; // 'ALL' or specific portfolio ID
  setSelectedPortfolioId: (id: string) => void;
  transactions: Transaction[];
  quotes: Map<string, MarketQuote>;
  holdings: HoldingPosition[];
  summaryStats: PortfolioSummaryStats;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: string;
  addPortfolio: (portfolio: Omit<Portfolio, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePortfolio: (id: string, updates: Partial<Portfolio>) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  importXTBFile: (file: File, targetPortfolioId: string) => Promise<{ success: boolean; count: number; message: string }>;
  syncPrices: () => Promise<void>;
  exportBackup: () => Promise<string>;
  importBackup: (json: string) => Promise<boolean>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const marketProvider = new StooqProvider();

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState } = useAuth();
  const currentUserId = authState.user?.id;

  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('ALL');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [quotes, setQuotes] = useState<Map<string, MarketQuote>>(new Map());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString('pl-PL'));

  const storageAdapter = StorageService.getInstance().getAdapter();

  // Load user data on mount and whenever logged in user changes
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const loadedPortfolios = await storageAdapter.getPortfolios(currentUserId);
        const loadedTxs = await storageAdapter.getTransactions(currentUserId);
        setPortfolios(loadedPortfolios);
        setTransactions(loadedTxs);
        setSelectedPortfolioId('ALL');

        // Fetch quotes for all tickers present in transactions
        const tickers = Array.from(
          new Set(
            loadedTxs
              .filter(t => (t.type === 'BUY' || t.type === 'SELL') && t.ticker && t.ticker !== 'N/A')
              .map(t => t.ticker)
          )
        ) as string[];
        if (tickers.length > 0) {
          const fetchedQuotes = await marketProvider.getQuotes(tickers);
          setQuotes(fetchedQuotes);
        } else {
          setQuotes(new Map());
        }
      } catch (err) {
        console.error('Failed to load portfolio data', err);
      } finally {
        setIsLoading(false);
      }
    };
    void initData();
  }, [currentUserId]);

  const syncPrices = useCallback(async () => {
    setIsSyncing(true);
    try {
      const tickers = Array.from(
        new Set(
          transactions
            .filter(t => (t.type === 'BUY' || t.type === 'SELL') && t.ticker && t.ticker !== 'N/A')
            .map(t => t.ticker)
        )
      ) as string[];
      if (tickers.length > 0) {
        const fetchedQuotes = await marketProvider.getQuotes(tickers);
        setQuotes(fetchedQuotes);
      } else {
        setQuotes(new Map());
      }
      setLastSyncTime(new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Failed to sync prices', err);
    } finally {
      setIsSyncing(false);
    }
  }, [transactions]);

  const addPortfolio = useCallback(async (data: Omit<Portfolio, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPort: Portfolio = {
      ...data,
      id: 'port-' + Math.random().toString(36).slice(2, 11),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [...portfolios, newPort];
    setPortfolios(updated);
    await storageAdapter.savePortfolios(updated, currentUserId);
  }, [portfolios, currentUserId, storageAdapter]);

  const updatePortfolio = useCallback(async (id: string, updates: Partial<Portfolio>) => {
    const updated = portfolios.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p);
    setPortfolios(updated);
    await storageAdapter.savePortfolios(updated, currentUserId);
  }, [portfolios, currentUserId, storageAdapter]);

  const deletePortfolio = useCallback(async (id: string) => {
    const updatedPortfolios = portfolios.filter(p => p.id !== id);
    const updatedTxs = transactions.filter(t => t.portfolioId !== id);
    setPortfolios(updatedPortfolios);
    setTransactions(updatedTxs);
    await storageAdapter.savePortfolios(updatedPortfolios, currentUserId);
    await storageAdapter.saveTransactions(updatedTxs, currentUserId);
    if (selectedPortfolioId === id) setSelectedPortfolioId('ALL');
  }, [portfolios, transactions, selectedPortfolioId, currentUserId, storageAdapter]);

  const addTransaction = useCallback(async (txData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...txData,
      id: 'tx-' + Math.random().toString(36).slice(2, 11)
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    await storageAdapter.saveTransactions(updated, currentUserId);
    if (newTx.ticker && !quotes.has(newTx.ticker)) {
      const q = await marketProvider.getQuote(newTx.ticker);
      setQuotes(prev => new Map(prev).set(newTx.ticker!, q));
    }
  }, [transactions, quotes, currentUserId, storageAdapter]);

  const deleteTransaction = useCallback(async (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    await storageAdapter.saveTransactions(updated, currentUserId);
  }, [transactions, currentUserId, storageAdapter]);

  const importXTBFile = useCallback(async (file: File, targetPortfolioId: string) => {
    try {
      const parseResult = await XTBImporter.parseFile(file, targetPortfolioId);
      if (parseResult.transactions.length > 0) {
        const updated = [...parseResult.transactions, ...transactions];
        setTransactions(updated);
        await storageAdapter.saveTransactions(updated, currentUserId);

        const newTickers = Array.from(
          new Set(
            parseResult.transactions
              .filter(t => (t.type === 'BUY' || t.type === 'SELL') && t.ticker && t.ticker !== 'N/A')
              .map(t => t.ticker)
          )
        ) as string[];
        if (newTickers.length > 0) {
          const newQuotes = await marketProvider.getQuotes(newTickers);
          setQuotes(prev => {
            const m = new Map(prev);
            newQuotes.forEach((v, k) => m.set(k, v));
            return m;
          });
        }

        return {
          success: true,
          count: parseResult.transactions.length,
          message: `Pomyślnie zaimportowano ${parseResult.transactions.length} operacji z raportu XTB!`
        };
      }
      return { success: false, count: 0, message: 'Plik nie zawierał żadnych rozpoznanych transakcji.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Błąd importu pliku XTB.';
      return { success: false, count: 0, message: msg };
    }
  }, [transactions, currentUserId, storageAdapter]);

  const exportBackup = useCallback(async () => {
    return await storageAdapter.exportBackupData(currentUserId);
  }, [currentUserId, storageAdapter]);

  const importBackup = useCallback(async (json: string) => {
    const ok = await storageAdapter.importBackupData(json, currentUserId);
    if (ok) {
      const loadedPortfolios = await storageAdapter.getPortfolios(currentUserId);
      const loadedTxs = await storageAdapter.getTransactions(currentUserId);
      setPortfolios(loadedPortfolios);
      setTransactions(loadedTxs);
    }
    return ok;
  }, [currentUserId, storageAdapter]);

  // Relevant transactions based on selectedPortfolioId
  const relevantTransactions = useMemo(
    () => selectedPortfolioId === 'ALL'
      ? transactions
      : transactions.filter(t => t.portfolioId === selectedPortfolioId),
    [selectedPortfolioId, transactions]
  );

  const holdings = useMemo(
    () => PortfolioCalculations.calculateHoldings(relevantTransactions, quotes),
    [relevantTransactions, quotes]
  );

  const summaryStats = useMemo(
    () => PortfolioCalculations.calculateSummaryStats(portfolios, transactions, quotes),
    [portfolios, transactions, quotes]
  );

  const contextValue: PortfolioContextType = useMemo(() => ({
    portfolios,
    selectedPortfolioId,
    setSelectedPortfolioId,
    transactions,
    quotes,
    holdings,
    summaryStats,
    isLoading,
    isSyncing,
    lastSyncTime,
    addPortfolio,
    updatePortfolio,
    deletePortfolio,
    addTransaction,
    deleteTransaction,
    importXTBFile,
    syncPrices,
    exportBackup,
    importBackup
  }), [
    portfolios,
    selectedPortfolioId,
    transactions,
    quotes,
    holdings,
    summaryStats,
    isLoading,
    isSyncing,
    lastSyncTime,
    addPortfolio,
    updatePortfolio,
    deletePortfolio,
    addTransaction,
    deleteTransaction,
    importXTBFile,
    syncPrices,
    exportBackup,
    importBackup
  ]);

  return (
    <PortfolioContext.Provider value={contextValue}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error('usePortfolio must be used within PortfolioProvider');
  return context;
};
