import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useAuth } from '../../context/AuthContext';
import { 
  TrendingUp, 
  RefreshCw, 
  Upload, 
  PlusCircle, 
  MinusCircle, 
  FolderPlus, 
  ShieldCheck, 
  Download, 
  Settings,
  LogOut,
  User,
  Trash2
} from 'lucide-react';

import { TwoFactorSetupModal } from '../auth/TwoFactorSetupModal';
import { DeleteAccountModal } from '../auth/DeleteAccountModal';

interface NavbarProps {
  onOpenImportModal: () => void;
  onOpenBuyModal: () => void;
  onOpenSellModal: () => void;
  onOpenPortfolioManagerModal: () => void;
  onOpenBackupModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenImportModal,
  onOpenBuyModal,
  onOpenSellModal,
  onOpenPortfolioManagerModal,
  onOpenBackupModal
}) => {
  const { portfolios, selectedPortfolioId, setSelectedPortfolioId, syncPrices, isSyncing, lastSyncTime } = usePortfolio();
  const { authState, toggle2FA, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [is2FASetupOpen, setIs2FASetupOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

  return (
    <header style={{
      backgroundColor: '#091122',
      borderBottom: '1px solid #1a2847',
      padding: '0.85rem 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand & Portfolio Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.4)'
            }}>
              <TrendingUp size={22} color="#ffffff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.1 }}>
                Inwestycje <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, marginLeft: '4px' }}>XTB & Portfeo</span>
              </h1>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Ostatnia synchr.: {lastSyncTime}</span>
            </div>
          </div>

          {/* Portfolio Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Portfel:</span>
            <select
              value={selectedPortfolioId}
              onChange={(e) => setSelectedPortfolioId(e.target.value)}
              className="form-select"
              style={{
                width: 'auto',
                padding: '0.4rem 0.8rem',
                backgroundColor: '#0f182e',
                borderColor: '#1a2847',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#38bdf8'
              }}
            >
              <option value="ALL">∑ Wszystkie Portfele (Kokpit)</option>
              {portfolios.map(p => (
                <option key={p.id} value={p.id}>
                  {p.includeInDashboard ? '∑ ' : ''}{p.name} ({p.currency})
                </option>
              ))}
            </select>

            <button
              onClick={onOpenPortfolioManagerModal}
              title="Zarządzaj portfelami"
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.6rem' }}
            >
              <FolderPlus size={16} />
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={syncPrices}
            disabled={isSyncing}
            className="btn btn-secondary"
            title="Odśwież notowania cen na żywo"
            style={{ fontSize: '0.8rem' }}
          >
            <RefreshCw size={15} className={isSyncing ? 'spin-animation' : ''} />
            {isSyncing ? 'Pobieranie...' : 'Synchronizuj ceny'}
          </button>

          <button
            onClick={onOpenImportModal}
            className="btn btn-success"
            style={{ fontSize: '0.8rem' }}
          >
            <Upload size={15} />
            Importuj XTB
          </button>

          <button
            onClick={onOpenBuyModal}
            className="btn btn-primary"
            style={{ fontSize: '0.8rem' }}
          >
            <PlusCircle size={15} />
            Kup walory
          </button>

          <button
            onClick={onOpenSellModal}
            className="btn btn-danger"
            style={{ fontSize: '0.8rem' }}
          >
            <MinusCircle size={15} />
            Sprzedaj walory
          </button>

          {/* Backup / User Settings */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="btn btn-outline"
              style={{ padding: '0.4rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              title="Ustawienia / Profil / Wyloguj"
            >
              <User size={16} color="#38bdf8" />
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{authState.user?.name || 'Profil'}</span>
            </button>

            {showUserMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '110%',
                backgroundColor: '#0f182e',
                border: '1px solid #1a2847',
                borderRadius: '8px',
                padding: '0.75rem',
                minWidth: '230px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                zIndex: 100
              }}>
                <div style={{ paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid #1a2847' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>{authState.user?.name || 'Inwestor'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{authState.user?.email}</div>
                  {authState.rememberMe && (
                    <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '4px' }}>
                      ✓ Zapamiętano na 30 dni
                    </div>
                  )}
                </div>

                <button
                  onClick={() => { setShowUserMenu(false); onOpenBackupModal(); }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    color: '#f8fafc',
                    padding: '0.4rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a2847'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Download size={14} /> Kopia zapasowa (JSON)
                </button>

                <button
                  onClick={async () => {
                    setShowUserMenu(false);
                    if (authState.user?.twoFactorEnabled) {
                      if (confirm('Czy na pewno chcesz wyłączyć 2FA na swoim koncie?')) {
                        await toggle2FA(false);
                      }
                    } else {
                      setIs2FASetupOpen(true);
                    }
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    color: '#f8fafc',
                    padding: '0.4rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '0.25rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a2847'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <ShieldCheck size={14} color={authState.user?.twoFactorEnabled ? '#10b981' : '#94a3b8'} /> 
                  <span>
                    2FA (Authenticator): <strong style={{ color: authState.user?.twoFactorEnabled ? '#10b981' : '#f59e0b' }}>
                      {authState.user?.twoFactorEnabled ? 'Włączone' : 'Konfiguruj QR'}
                    </strong>
                  </span>
                </button>

                <div style={{ borderTop: '1px solid #1a2847', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <button
                    onClick={async () => {
                      setShowUserMenu(false);
                      await logout();
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      color: '#f8fafc',
                      padding: '0.4rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a2847'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={14} color="#94a3b8" /> Wyloguj się
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setIsDeleteAccountOpen(true);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      color: '#fca5a5',
                      padding: '0.4rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Trash2 size={14} color="#ef4444" /> Usuń konto
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <TwoFactorSetupModal
        isOpen={is2FASetupOpen}
        onClose={() => setIs2FASetupOpen(false)}
        targetUserId={authState.user?.id}
        targetUserEmail={authState.user?.email}
      />

      <DeleteAccountModal
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
      />
    </header>
  );
};
