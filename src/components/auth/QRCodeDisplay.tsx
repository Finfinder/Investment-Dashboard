import React from 'react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ value, size = 200 }) => {
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(
    value
  )}`;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.75rem',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '2px solid #38bdf8',
      boxShadow: '0 8px 25px rgba(56, 189, 248, 0.2)',
      width: 'fit-content',
      margin: '0 auto'
    }}>
      <img
        src={qrImageUrl}
        alt="Kod QR do skanowania w Microsoft Authenticator"
        width={size}
        height={size}
        style={{ borderRadius: '6px', display: 'block' }}
      />
    </div>
  );
};
