import React, { useState } from 'react';
import { PortfolioProvider } from './context/PortfolioContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { SummaryKPIs } from './components/dashboard/SummaryKPIs';
import { PortfolioCardsGrid } from './components/dashboard/PortfolioCardsGrid';
import { PortfolioDonutChart } from './components/dashboard/PortfolioDonutChart';
import { PerformanceChart } from './components/dashboard/PerformanceChart';
import { HoldingsTable } from './components/holdings/HoldingsTable';
import { TransactionHistory } from './components/transactions/TransactionHistory';
import { BuyAssetModal } from './components/transactions/BuyAssetModal';
import { SellAssetModal } from './components/transactions/SellAssetModal';
import { XTBImportModal } from './components/transactions/XTBImportModal';
import { PortfolioManagerModal } from './components/portfolios/PortfolioManagerModal';
import { BackupModal } from './components/common/BackupModal';
import { LandingPage } from './components/auth/LandingPage';
import { Currency, AssetCategory } from './types/portfolio';
import { usePortfolio } from './context/PortfolioContext';
import { PlusCircle, FolderPlus, LayoutDashboard, Table, History as HistoryIcon, RefreshCw } from 'lucide-react';

const OnboardingCreatePortfolioCard: React.FC = () => {
  const { addPortfolio } = usePortfolio();
  const { authState } = useAuth();
  const [name, setName] = useState('XTB');
  const [currency, setCurrency] = useState<Currency>('PLN');
  const [description, setDescription] = useState('Główny portfel inwestycyjny');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await addPortfolio({
        name: name.trim(),
        currency,
        includeInDashboard: true,
        description: description.trim(),
        color: '#2563eb'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '3rem auto',
      backgroundColor: '#0d1527',
      border: '1px solid #2563eb',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
      textAlign: 'center'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.25rem auto',
        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
      }}>
        <FolderPlus size={28} color="#ffffff" />
      </div>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
        Witaj, {authState.user?.name || 'Inwestorze'}! 👋
      </h2>
      <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.75rem' }}>
        Twój profil nie posiada jeszcze żadnego portfela inwestycyjnego. Utwórz swój pierwszy portfel (np. <strong>XTB</strong>, <strong>IKE</strong> lub <strong>Giełda</strong>), aby rozpocząć ewidencjonowanie transakcji i importowanie raportów.
      </p>

      <form onSubmit={handleSubmit} style={{ textAlign: 'left', backgroundColor: '#091122', border: '1px solid #1a2847', borderRadius: '12px', padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <label className="form-label">Nazwa pierwszego portfela</label>
            <input
              type="text"
              required
              placeholder="np. XTB, IKE, Rachunek Maklerski"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Waluta bazowa</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="form-select">
              <option value="PLN">PLN</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="CHF">CHF</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Opis / Uwagi (Opcjonalnie)</label>
          <input
            type="text"
            placeholder="np. Główny rachunek maklerski w XTB"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <PlusCircle size={18} /> {isSubmitting ? 'Tworzenie portfela...' : 'Utwórz pierwszy portfel'}
        </button>
      </form>
    </div>
  );
};

const MainDashboardView: React.FC<{
  onOpenImportModal: () => void;
  onOpenBuyModal: () => void;
  onOpenSellModal: () => void;
  onOpenPortfolioManagerModal: () => void;
  onOpenBackupModal: () => void;
}> = ({
  onOpenImportModal,
  onOpenBuyModal,
  onOpenSellModal,
  onOpenPortfolioManagerModal,
  onOpenBackupModal
}) => {
  const { portfolios } = usePortfolio();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'holdings' | 'history'>('dashboard');
  const [quickBuyState, setQuickBuyState] = useState<{ isOpen: boolean; ticker?: string; category?: AssetCategory }>({ isOpen: false });
  const [quickSellState, setQuickSellState] = useState<{ isOpen: boolean; ticker?: string; category?: AssetCategory }>({ isOpen: false });
  const [_editPortfolioId, setEditPortfolioId] = useState<string | undefined>(undefined);

  const handleQuickBuy = (ticker: string, category: AssetCategory) => {
    setQuickBuyState({ isOpen: true, ticker, category });
  };

  const handleQuickSell = (ticker: string, category: AssetCategory) => {
    setQuickSellState({ isOpen: true, ticker, category });
  };

  const handleEditPortfolio = (id: string) => {
    setEditPortfolioId(id);
    onOpenPortfolioManagerModal();
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        onOpenImportModal={onOpenImportModal}
        onOpenBuyModal={onOpenBuyModal}
        onOpenSellModal={onOpenSellModal}
        onOpenPortfolioManagerModal={onOpenPortfolioManagerModal}
        onOpenBackupModal={onOpenBackupModal}
      />

      <main className="main-content">
        {portfolios.length === 0 ? (
          <OnboardingCreatePortfolioCard />
        ) : (
          <>
            {/* Navigation Tabs Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderBottom: '1px solid #1a2847',
              paddingBottom: '0.85rem',
              marginBottom: '1.5rem',
              overflowX: 'auto'
            }}>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.875rem' }}
              >
                <LayoutDashboard size={16} /> Kokpit / Podsumowanie
              </button>

              <button
                onClick={() => setActiveTab('holdings')}
                className={`btn ${activeTab === 'holdings' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.875rem' }}
              >
                <Table size={16} /> Inwestycje (Tabela)
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.875rem' }}
              >
                <HistoryIcon size={16} /> Historia Operacji
              </button>
            </div>

            {/* Tab 1: Dashboard View */}
            {activeTab === 'dashboard' && (
              <div>
                {/* KPI Cards Grid */}
                <SummaryKPIs />

                {/* Grid layout for Charts and Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <PortfolioDonutChart />
                  <PortfolioCardsGrid onEditPortfolio={handleEditPortfolio} />
                </div>

                {/* Performance Curve Chart */}
                <PerformanceChart />
              </div>
            )}

            {/* Tab 2: Holdings Table View */}
            {activeTab === 'holdings' && (
              <HoldingsTable
                onQuickBuy={handleQuickBuy}
                onQuickSell={handleQuickSell}
              />
            )}

            {/* Tab 3: Transaction History View */}
            {activeTab === 'history' && (
              <TransactionHistory />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#091122',
        borderTop: '1px solid #1a2847',
        padding: '1rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#64748b'
      }}>
        Investment Dashboard • System Śledzenia Portfela (XTB, Portfeo/MyFund Style) • Wersja 1.0.0
      </footer>

      {/* Quick Action Modals */}
      <BuyAssetModal
        isOpen={quickBuyState.isOpen}
        onClose={() => setQuickBuyState({ isOpen: false })}
        initialTicker={quickBuyState.ticker}
        initialCategory={quickBuyState.category}
      />

      <SellAssetModal
        isOpen={quickSellState.isOpen}
        onClose={() => setQuickSellState({ isOpen: false })}
        initialTicker={quickSellState.ticker}
        initialCategory={quickSellState.category}
      />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { authState, isLoading } = useAuth();
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState<boolean>(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState<boolean>(false);
  const [isPortfolioManagerOpen, setIsPortfolioManagerOpen] = useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#050a15',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#38bdf8'
      }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={36} className="spin-animation" style={{ marginBottom: '1rem' }} />
          <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Weryfikacja sesji użytkownika...</div>
        </div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <>
      <MainDashboardView
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenBuyModal={() => setIsBuyModalOpen(true)}
        onOpenSellModal={() => setIsSellModalOpen(true)}
        onOpenPortfolioManagerModal={() => setIsPortfolioManagerOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
      />

      {/* Modal overlays */}
      <XTBImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      <BuyAssetModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
      />

      <SellAssetModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
      />

      <PortfolioManagerModal
        isOpen={isPortfolioManagerOpen}
        onClose={() => setIsPortfolioManagerOpen(false)}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <AppContent />
      </PortfolioProvider>
    </AuthProvider>
  );
};

export default App;

