import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DEMO_2FA_CODE } from '../../utils/totp';
import { ShieldCheck, Lock, Mail, User, CheckSquare, Square, X, AlertCircle, KeyRound, Info } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

/**
 * Hint advertising the demo 2FA code. Rendered only in Vite development builds;
 * `import.meta.env.DEV` is statically replaced with `false` in production.
 */
const Demo2FAHint: React.ReactNode = import.meta.env.DEV ? (
  <div style={{
    fontSize: '0.75rem',
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: '0.6rem 0.75rem',
    borderRadius: '6px',
    marginBottom: '1.5rem',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    textAlign: 'center'
  }}>
    🔑 Dla celów testowych użyj kodu: <strong>{DEMO_2FA_CODE}</strong>
  </div>
) : null;

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, register, verify2FA } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | '2fa'>(initialMode);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [enable2FA, setEnable2FA] = useState(false);
  const [remember30Days, setRemember30Days] = useState(true);
  const [token2FA, setToken2FA] = useState('');

  // UI state
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setEnable2FA(false);
    setRemember30Days(true);
    setToken2FA('');
    setPendingUserId(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSwitchMode = (newMode: 'login' | 'register') => {
    resetForm();
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        if (!name.trim() || !email.trim() || !password) {
          setErrorMessage('Uzupełnij wszystkie pola formularza.');
          setIsSubmitting(false);
          return;
        }

        if (password !== confirmPassword) {
          setErrorMessage('Hasła nie są identyczne.');
          setIsSubmitting(false);
          return;
        }

        if (password.length < 6) {
          setErrorMessage('Hasło powinno mieć minimum 6 znaków.');
          setIsSubmitting(false);
          return;
        }

        const res = await register(name, email, password, enable2FA);
        if (!res.success) {
          setErrorMessage(res.message || 'Wystąpił błąd podczas rejestracji.');
        } else if (res.requires2FA && res.tempUserId) {
          setPendingUserId(res.tempUserId);
          setMode('2fa');
          setSuccessMessage('Konto utworzone z 2FA! Wprowadź kod weryfikacyjny.');
        } else {
          onClose();
          resetForm();
        }
      } else if (mode === 'login') {
        if (!email.trim() || !password) {
          setErrorMessage('Podaj adres email oraz hasło.');
          setIsSubmitting(false);
          return;
        }

        const res = await login(email, password, remember30Days);
        if (!res.success) {
          setErrorMessage(res.message || 'Błąd logowania.');
        } else if (res.requires2FA && res.tempUserId) {
          setPendingUserId(res.tempUserId);
          setMode('2fa');
          setSuccessMessage('Konto wymaga autoryzacji dwuskładnikowej. Wprowadź kod 2FA.');
        } else {
          onClose();
          resetForm();
        }
      } else if (mode === '2fa') {
        if (!pendingUserId) {
          setErrorMessage('Brak identyfikatora sesji 2FA. Zaloguj się ponownie.');
          setMode('login');
          setIsSubmitting(false);
          return;
        }

        if (!token2FA.trim()) {
          setErrorMessage('Wprowadź kod autoryzacji 2FA.');
          setIsSubmitting(false);
          return;
        }

        const res = await verify2FA(pendingUserId, token2FA, remember30Days);
        if (!res.success) {
          setErrorMessage(res.message || 'Nieprawidłowy kod 2FA.');
        } else {
          onClose();
          resetForm();
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Wystąpił niespodziewany błąd.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 10, 20, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#0d1527',
        border: '1px solid #1a2847',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Header Bar */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #1a2847',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(180deg, #111c35 0%, #0d1527 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {mode === '2fa' ? <ShieldCheck size={18} color="#fff" /> : <Lock size={18} color="#fff" />}
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              {mode === 'login' && 'Logowanie do serwisu'}
              {mode === 'register' && 'Rejestracja nowego konta'}
              {mode === '2fa' && 'Uwierzytelnianie 2FA'}
            </h2>
          </div>

          <button
            onClick={() => { onClose(); resetForm(); }}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#f8fafc'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {/* Messages */}
          {errorMessage && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#6ee7b7',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Info size={16} style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Mode 1: Register */}
          {mode === 'register' && (
            <>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                  Imię i nazwisko / Nazwa
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    required
                    placeholder="np. Jan Kowalski"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                  Adres e-mail
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    placeholder="jan@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                  Hasło
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                  Powtórz hasło
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                  />
                </div>
              </div>

              {/* 2FA Option Checkbox during Registration */}
              <div 
                onClick={() => setEnable2FA(!enable2FA)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.75rem',
                  backgroundColor: enable2FA ? 'rgba(37, 99, 235, 0.12)' : '#0f182e',
                  border: enable2FA ? '1px solid #2563eb' : '1px solid #1a2847',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {enable2FA ? <CheckSquare size={18} color="#38bdf8" /> : <Square size={18} color="#64748b" />}
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: enable2FA ? '#38bdf8' : '#f8fafc' }}>
                    Włącz uwierzytelnianie 2-składnikowe (2FA)
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Zabezpiecza logowanie dodatkowym 6-cyfrowym kodem autoryzacyjnym TOTP.
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Mode 2: Login */}
          {mode === 'login' && (
            <>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                  Adres e-mail
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    placeholder="demo@xtb.pl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.35rem' }}>
                  Hasło
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                  />
                </div>
              </div>

              {/* 30-Day Remember Me Option */}
              <div 
                onClick={() => setRemember30Days(!remember30Days)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.75rem',
                  backgroundColor: remember30Days ? 'rgba(16, 185, 129, 0.12)' : '#0f182e',
                  border: remember30Days ? '1px solid #10b981' : '1px solid #1a2847',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {remember30Days ? <CheckSquare size={18} color="#10b981" /> : <Square size={18} color="#64748b" />}
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: remember30Days ? '#10b981' : '#f8fafc' }}>
                    Zapamiętaj mnie na 30 dni
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Utrzymuje aktywną sesję na tym komputerze przez 30 dni bez konieczności ponownego logowania.
                  </div>
                </div>
              </div>

              {/* Quick Demo Hint */}
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#64748b', 
                backgroundColor: '#0f182e', 
                padding: '0.5rem 0.75rem', 
                borderRadius: '6px', 
                marginBottom: '1rem',
                border: '1px dashed #1a2847'
              }}>
                💡 <strong style={{ color: '#94a3b8' }}>Domyślne konto testowe:</strong> email: <code style={{ color: '#38bdf8' }}>demo@xtb.pl</code> | hasło: <code style={{ color: '#38bdf8' }}>demo123</code>
              </div>
            </>
          )}

          {/* Mode 3: 2FA Token Prompt */}
          {mode === '2fa' && (
            <>
              <div style={{
                textAlign: 'center',
                padding: '0.5rem 0 1.25rem 0'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <KeyRound size={28} color="#38bdf8" />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.4rem' }}>
                  Weryfikacja 2FA (Microsoft Authenticator)
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                  Otwórz aplikację <strong style={{ color: '#38bdf8' }}>Microsoft Authenticator</strong> na swoim telefonie i wprowadź aktualny 6-cyfrowy kod (lub jednorazowy kod awaryjny):
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <input
                  type="text"
                  required
                  maxLength={6}
                  autoFocus
                  placeholder="000000"
                  value={token2FA}
                  onChange={(e) => setToken2FA(e.target.value.replace(/[^0-9]/g, ''))}
                  className="form-input"
                  style={{
                    fontSize: '1.5rem',
                    letterSpacing: '0.5rem',
                    textAlign: 'center',
                    fontWeight: 700,
                    color: '#38bdf8',
                    padding: '0.6rem'
                  }}
                />
              </div>

              {/* Demo 2FA Hint - development builds only */}
              {Demo2FAHint}
            </>
          )}

          {/* Action Buttons */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {isSubmitting ? 'Przetwarzanie...' : (
              mode === 'register' ? 'Utwórz konto' : (
                mode === 'login' ? 'Zaloguj się' : 'Zatwierdź kod 2FA'
              )
            )}
          </button>

          {/* Footer Navigation between Modes */}
          <div style={{
            marginTop: '1.25rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: '#64748b'
          }}>
            {mode === 'login' && (
              <span>
                Nie masz jeszcze konta?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('register')}
                  style={{ background: 'none', border: 'none', color: '#38bdf8', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  Zarejestruj się za darmo
                </button>
              </span>
            )}

            {mode === 'register' && (
              <span>
                Masz już konto?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  style={{ background: 'none', border: 'none', color: '#38bdf8', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  Zaloguj się
                </button>
              </span>
            )}

            {mode === '2fa' && (
              <button
                type="button"
                onClick={() => handleSwitchMode('login')}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
              >
                ← Wróć do ekranu logowania
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
