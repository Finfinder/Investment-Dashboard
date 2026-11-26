import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { QRCodeDisplay } from './QRCodeDisplay';
import { DEMO_2FA_CODE } from '../../utils/totp';
import { ShieldCheck, Copy, Check, QrCode, Key, Lock, AlertTriangle } from 'lucide-react';

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: string;
  targetUserEmail?: string;
  onSuccess?: () => void;
}

export const TwoFactorSetupModal: React.FC<TwoFactorSetupModalProps> = ({
  isOpen,
  onClose,
  targetUserId,
  targetUserEmail,
  onSuccess
}) => {
  const { setup2FA, confirm2FA } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [secret, setSecret] = useState<string>('');
  const [otpAuthUrl, setOtpAuthUrl] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [copiedSecret, setCopiedSecret] = useState<boolean>(false);
  const [copiedBackup, setCopiedBackup] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setErrorMsg('');
      setVerificationCode('');
      setup2FA(targetUserId, targetUserEmail).then(res => {
        setSecret(res.secret);
        setOtpAuthUrl(res.otpAuthUrl);
        setBackupCodes(res.backupCodes);
      });
    }
  }, [isOpen, targetUserId, targetUserEmail]);

  if (!isOpen) return null;

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedBackup(true);
    setTimeout(() => setCopiedBackup(false), 2000);
  };

  const handleConfirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanCode = verificationCode.trim();

    if (!cleanCode || cleanCode.length < 4) {
      setErrorMsg('Wprowadź 6-cyfrowy kod autoryzacji z aplikacji.');
      return;
    }

    setIsVerifying(true);
    try {
      const ok = await confirm2FA(targetUserId || '', secret, cleanCode, backupCodes);
      if (ok) {
        setStep(3); // Przejdź do wyświetlenia kodów ratunkowych
      } else {
        setErrorMsg('Nieprawidłowy kod autoryzacji. Upewnij się, że kod w Microsoft Authenticator jest aktualny.');
      }
    } catch {
      setErrorMsg('Błąd podczas weryfikacji 2FA.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFinish = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#091124', borderColor: '#172445', maxWidth: '540px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck color="#38bdf8" size={24} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
              Konfiguracja 2FA (Microsoft Authenticator)
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        <div className="modal-body">
          {/* Step Indicator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #172445', paddingBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: step === 1 ? '#38bdf8' : '#64748b' }}>
              1. Zeskanuj Kod QR
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: step === 2 ? '#38bdf8' : '#64748b' }}>
              2. Weryfikacja Kodu
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: step === 3 ? '#38bdf8' : '#64748b' }}>
              3. Kody Odzyskiwania
            </div>
          </div>

          {/* STEP 1: SCAN QR CODE */}
          {step === 1 && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1rem', lineHeight: '1.4' }}>
                  Otwórz aplikację <strong style={{ color: '#f8fafc' }}>Microsoft Authenticator</strong> (lub Google Authenticator / Authy) na swoim telefonie i zeskanuj poniższy kod QR:
                </p>

                {otpAuthUrl ? (
                  <QRCodeDisplay value={otpAuthUrl} size={190} />
                ) : (
                  <div style={{ padding: '2rem', color: '#64748b' }}>Generowanie kodu QR...</div>
                )}
              </div>

              {/* Secret Key Manual Entry */}
              <div style={{
                backgroundColor: '#0d162a',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                  Klucz konfiguracyjny (wpisywanie ręczne):
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <code style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '2px' }}>
                    {secret}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="btn btn-secondary"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                  >
                    {copiedSecret ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    {copiedSecret ? 'Skopiowano!' : 'Kopiuj'}
                  </button>
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '0.5rem 0 0 0', borderTop: 'none' }}>
                <button type="button" onClick={onClose} className="btn btn-outline">Anuluj</button>
                <button type="button" onClick={() => setStep(2)} className="btn btn-primary">Dalej: Weryfikacja kodem</button>
              </div>
            </div>
          )}

          {/* STEP 2: VERIFY CODE */}
          {step === 2 && (
            <form onSubmit={handleConfirmCode}>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '1.2rem', lineHeight: '1.4' }}>
                Wprowadź 6-cyfrowy kod autoryzacji wygenerowany przez aplikację <strong style={{ color: '#f8fafc' }}>Microsoft Authenticator</strong>, aby potwierdzić poprawność konfiguracji:
              </p>

              {errorMsg && (
                <div style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  color: '#f87171',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="form-group" style={{ textAlign: 'center' }}>
                <label className="form-label">6-cyfrowy kod z Microsoft Authenticator</label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  placeholder="000 000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="form-input"
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    letterSpacing: '8px',
                    textAlign: 'center',
                    maxWidth: '220px',
                    margin: '0 auto',
                    color: '#38bdf8'
                  }}
                />
              </div>

              <div style={{ fontSize: '0.78rem', color: '#64748b', textAlign: 'center', marginBottom: '1.2rem' }}>
                Wskazówka: Kod odświeża się co 30 sekund.
                {import.meta.env.DEV && (
                  <> Dla testów akceptowany jest kod: <strong style={{ color: '#f8fafc' }}>{DEMO_2FA_CODE}</strong></>
                )}
              </div>

              <div className="modal-footer" style={{ padding: '0.5rem 0 0 0', borderTop: 'none' }}>
                <button type="button" onClick={() => setStep(1)} className="btn btn-outline">Wstecz</button>
                <button type="submit" disabled={isVerifying} className="btn btn-primary">Weryfikuj i Aktywuj 2FA</button>
              </div>
            </form>
          )}

          {/* STEP 3: BACKUP CODES */}
          {step === 3 && (
            <div>
              <div style={{
                textAlign: 'center',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1.2rem'
              }}>
                <ShieldCheck color="#10b981" size={36} style={{ margin: '0 auto 0.5rem auto' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', marginBottom: '0.2rem' }}>
                  2FA Zostało Pomyślnie Włączone!
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Twoje konto jest teraz zabezpieczone autoryzacją dwuskładnikową.
                </p>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                Oto Twoje <strong style={{ color: '#f8fafc' }}>jednorazowe kody awaryjne</strong>. Zapisz je w bezpiecznym miejscu (np. w menedżerze haseł). Pozwolą zalogować się w przypadku utraty telefonu:
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                backgroundColor: '#0d162a',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1rem'
              }}>
                {backupCodes.map((code, idx) => (
                  <div key={idx} style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'monospace' }}>
                    {idx + 1}. <span style={{ color: '#38bdf8' }}>{code}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCopyBackupCodes}
                className="btn btn-secondary"
                style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
              >
                {copiedBackup ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                {copiedBackup ? 'Kody skopiowane do schowka!' : 'Kopiuj wszystkie kody odzyskiwania'}
              </button>

              <div className="modal-footer" style={{ padding: '0.5rem 0 0 0', borderTop: 'none' }}>
                <button type="button" onClick={handleFinish} className="btn btn-primary" style={{ width: '100%' }}>
                  Zakończ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
