import React, { useState } from 'react';
import { AuthModal } from './AuthModal';
import { 
  TrendingUp, 
  ShieldCheck, 
  Upload, 
  PieChart, 
  LineChart, 
  Lock, 
  Database, 
  ArrowRight, 
  CheckCircle2, 
  Zap,
  BarChart3,
  Globe2,
  Wallet
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#050a15',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Header Navigation */}
      <header style={{
        backgroundColor: 'rgba(9, 17, 34, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1a2847',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '0.85rem 1.5rem'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
            }}>
              <TrendingUp size={24} color="#ffffff" />
            </div>
            <div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                Investment <span style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard</span>
              </span>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>
                XTB & Portfeo Analytics System
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => openAuth('login')}
              className="btn btn-outline"
              style={{
                padding: '0.5rem 1.1rem',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              Zaloguj się
            </button>
            <button
              onClick={() => openAuth('register')}
              className="btn btn-primary"
              style={{
                padding: '0.55rem 1.25rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                boxShadow: '0 4px 15px rgba(37, 99, 235, 0.35)'
              }}
            >
              Zarejestruj się
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '4.5rem 1.5rem 3.5rem 1.5rem',
        background: 'radial-gradient(circle at 50% 20%, rgba(37, 99, 235, 0.15) 0%, rgba(5, 10, 21, 0) 70%)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 1rem',
            backgroundColor: 'rgba(37, 99, 235, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '50px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#38bdf8',
            marginBottom: '1.5rem'
          }}>
            <Zap size={14} color="#38bdf8" />
            <span>Pełne Bezpieczeństwo 2FA & 30-dniowa Sesja Użytkownika</span>
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: '2.75rem',
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: '1.25rem',
            letterSpacing: '-0.03em'
          }}>
            Kompleksowe Śledzenie Portfela <br />
            <span style={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              XTB, Akcji, ETF i Kryptowalut
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '1.1rem',
            color: '#94a3b8',
            lineHeight: 1.6,
            maxWidth: '720px',
            margin: '0 auto 2.25rem auto'
          }}>
            Analizuj stopy zwrotu, łącz portfele walutowe (PLN, EUR, USD), importuj raporty zysków z XTB oraz zabezpiecz swoje konto 2-składnikowym uwierzytelnianiem.
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '3rem'
          }}>
            <button
              onClick={() => openAuth('register')}
              className="btn btn-primary"
              style={{
                padding: '0.85rem 2rem',
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)'
              }}
            >
              Rozpocznij Bezpłatnie <ArrowRight size={18} />
            </button>

            <button
              onClick={() => openAuth('login')}
              className="btn btn-outline"
              style={{
                padding: '0.85rem 1.8rem',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '10px'
              }}
            >
              Zaloguj do Konta Demo
            </button>
          </div>

          {/* Feature Badges */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.75rem',
            flexWrap: 'wrap',
            fontSize: '0.85rem',
            color: '#64748b'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="#10b981" /> Bez opłat abonamentowych
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="#10b981" /> Ochrona 2FA TOTP
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} color="#10b981" /> Sesja na 30 dni
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Mockup Section */}
      <section style={{ padding: '0 1.5rem 4rem 1.5rem' }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          backgroundColor: '#0d1527',
          border: '1px solid #1a2847',
          borderRadius: '20px',
          padding: '1.5rem',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
          position: 'relative'
        }}>
          {/* Top Fake Window Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '1rem',
            marginBottom: '1.25rem',
            borderBottom: '1px solid #1a2847'
          }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
              Podgląd Systemu • Investment Dashboard
            </div>
            <div style={{ width: '40px' }} />
          </div>

          {/* Fake Dashboard Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ backgroundColor: '#091122', border: '1px solid #1a2847', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Wartość Całkowita Portfela</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: '0.2rem 0' }}>142 850,00 PLN</div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>▲ +18.4% (+22 230 PLN)</div>
            </div>

            <div style={{ backgroundColor: '#091122', border: '1px solid #1a2847', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Suma Dywidend</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', margin: '0.2rem 0' }}>4 320,50 PLN</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Średnia stopa dywidendy: 3.8%</div>
            </div>

            <div style={{ backgroundColor: '#091122', border: '1px solid #1a2847', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Liczba Pozycji Aktywnych</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a855f7', margin: '0.2rem 0' }}>24 Aktywa</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>XTB, ETF World, Obligacje</div>
            </div>

            <div style={{ backgroundColor: '#091122', border: '1px solid #1a2847', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Status Zabezpieczeń</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', margin: '0.2rem 0' }}>Szyfrowane 2FA</div>
              <div style={{ fontSize: '0.75rem', color: '#10b981' }}>✓ Aktywna sesja 30 dni</div>
            </div>
          </div>

          {/* Overlay CTA Banner */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '20px',
            backgroundColor: 'rgba(5, 10, 21, 0.45)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <div style={{
              backgroundColor: '#0d1527',
              border: '1px solid #2563eb',
              borderRadius: '16px',
              padding: '1.75rem 2.5rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
              maxWidth: '500px'
            }}>
              <Lock size={32} color="#38bdf8" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                Zaloguj się, aby zobaczyć swój portfel
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
                Serwis jest dostępny wyłącznie po zarejestrowaniu i zalogowaniu konta.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  onClick={() => openAuth('login')}
                  className="btn btn-primary"
                  style={{ padding: '0.6rem 1.4rem', fontSize: '0.875rem' }}
                >
                  Zaloguj się
                </button>
                <button
                  onClick={() => openAuth('register')}
                  className="btn btn-outline"
                  style={{ padding: '0.6rem 1.4rem', fontSize: '0.875rem' }}
                >
                  Zarejestruj się
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{
        padding: '4rem 1.5rem',
        backgroundColor: '#080f1e',
        borderTop: '1px solid #1a2847'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Dlaczego warto wybrać Investment Dashboard?
            </h2>
            <p style={{ fontSize: '1rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
              Wszystkie narzędzia potrzebne do precyzyjnej kontroli kapitału i wyników inwestycyjnych.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.75rem'
          }}>
            {/* Feature 1 */}
            <div style={{
              backgroundColor: '#0d1527',
              border: '1px solid #1a2847',
              borderRadius: '14px',
              padding: '1.75rem',
              transition: 'transform 0.2s ease'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: 'rgba(37, 99, 235, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Upload size={22} color="#38bdf8" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Automatyczny Import z XTB
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Szybki wczytaj historię transakcji z plików CSV i raportów zysków/strat XTB bez konieczności ręcznego wprowadzania danych.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{
              backgroundColor: '#0d1527',
              border: '1px solid #1a2847',
              borderRadius: '14px',
              padding: '1.75rem'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <ShieldCheck size={22} color="#10b981" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Ochrona 2FA & Sesja 30 dni
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Zabezpiecz konto dwuskładnikowym uwierzytelnianiem TOTP oraz zapamiętuj zaufane urządzenie przez 30 dni.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{
              backgroundColor: '#0d1527',
              border: '1px solid #1a2847',
              borderRadius: '14px',
              padding: '1.75rem'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: 'rgba(168, 85, 247, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <PieChart size={22} color="#c084fc" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Agregacja & Alokacja Aktywów
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Przeglądaj podział alokacji na akcje, ETF-y, kryptowaluty, obligacje i gotówkę w wielu walutach równocześnie.
              </p>
            </div>

            {/* Feature 4 */}
            <div style={{
              backgroundColor: '#0d1527',
              border: '1px solid #1a2847',
              borderRadius: '14px',
              padding: '1.75rem'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <LineChart size={22} color="#fbbf24" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Krzywa Wyników & Stopy Zwrotu
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Śledź historyczną wycenę wartości portfela oraz wskaźniki zysku i straty w czasie rzeczywistym.
              </p>
            </div>

            {/* Feature 5 */}
            <div style={{
              backgroundColor: '#0d1527',
              border: '1px solid #1a2847',
              borderRadius: '14px',
              padding: '1.75rem'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: 'rgba(236, 72, 153, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Database size={22} color="#f472b6" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Prywatność & Kopia Zapasowa
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Twoje dane finansowe pozostają pod Twoją wyłączną kontrolą z opcją natychmiastowego eksportu do pliku JSON.
              </p>
            </div>

            {/* Feature 6 */}
            <div style={{
              backgroundColor: '#0d1527',
              border: '1px solid #1a2847',
              borderRadius: '14px',
              padding: '1.75rem'
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: 'rgba(14, 165, 233, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Globe2 size={22} color="#38bdf8" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Wielowalutowość & Przeliczenia
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Przeliczaj wyceny pozycji giełdowych z USD i EUR na PLN wg bieżących kursów walutowych.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        backgroundColor: '#040812',
        borderTop: '1px solid #1a2847',
        padding: '1.5rem',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: '#64748b'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          Investment Dashboard • System Śledzenia Portfela XTB & Portfeo • Wersja 1.0.0
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
};
