import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
  const { authState, deleteAccount } = useAuth();
  const [confirmText, setConfirmText] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const targetEmail = authState.user?.email || '';
  const isConfirmed = confirmText.trim().toUpperCase() === 'USUŃ MY KONTO' || confirmText.trim().toUpperCase() === 'USUŃ';

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) return;

    setIsDeleting(true);
    setErrorMsg('');
    try {
      const ok = await deleteAccount(authState.user?.id);
      if (ok) {
        onClose();
      } else {
        setErrorMsg('Nie udało się usunąć konta. Spróbuj ponownie.');
      }
    } catch {
      setErrorMsg('Błąd podczas usuwania konta.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#091124',
          borderColor: 'rgba(239, 68, 68, 0.4)',
          maxWidth: '460px'
        }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Trash2 color="#ef4444" size={22} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
              Usuwanie konta
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        <form onSubmit={handleDelete} className="modal-body">
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            gap: '0.75rem'
          }}>
            <AlertTriangle color="#ef4444" size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.84rem', color: '#fca5a5', lineHeight: '1.4' }}>
              <strong style={{ color: '#ffffff', display: 'block', marginBottom: '0.2rem' }}>
                Ta operacja jest nieodwracalna!
              </strong>
              Trwale usuniesz swoje konto (<span style={{ color: '#38bdf8' }}>{targetEmail}</span>) oraz wszystkie utworzone w nim portfele inwestycyjne, notowania i historię transakcji.
            </div>
          </div>

          {errorMsg && (
            <div style={{ fontSize: '0.82rem', color: '#fca5a5', marginBottom: '1rem' }}>
              {errorMsg}
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Aby potwierdzić, wpisz wyraz <strong style={{ color: '#ef4444' }}>USUŃ</strong> poniżej:
            </label>
            <input
              type="text"
              autoFocus
              placeholder="Wpisz USUŃ"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="form-input"
              style={{
                borderColor: isConfirmed ? '#ef4444' : '#1a2847',
                fontWeight: 700,
                color: isConfirmed ? '#ef4444' : '#f8fafc'
              }}
            />
          </div>

          <div className="modal-footer" style={{ padding: '0.5rem 0 0 0', borderTop: 'none', display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>
              Anuluj
            </button>
            <button
              type="submit"
              disabled={!isConfirmed || isDeleting}
              className="btn btn-danger"
              style={{
                flex: 1,
                opacity: isConfirmed ? 1 : 0.4,
                cursor: isConfirmed ? 'pointer' : 'not-allowed'
              }}
            >
              {isDeleting ? 'Usuwanie...' : 'Trwale usuń konto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
