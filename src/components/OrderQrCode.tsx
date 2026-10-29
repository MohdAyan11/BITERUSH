import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface OrderQrCodeProps {
  orderId: string;
  tokenNumber: string;
  size?: number;
}

export const OrderQrCode: React.FC<OrderQrCodeProps> = ({
  orderId,
  tokenNumber,
  size = 140,
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    // Only safe, non-sensitive identifier is encoded inside the QR
    const safePayload = `queuebite:order:${orderId}:token:${tokenNumber}`;

    QRCode.toDataURL(safePayload, {
      width: size,
      margin: 1,
      color: {
        dark: '#1c1917', // stone-900
        light: '#ffffff',
      },
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [orderId, tokenNumber, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className="bg-stone-100 rounded-xl flex items-center justify-center animate-pulse text-[10px] text-stone-400"
      >
        Generating QR...
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-center bg-white p-2.5 rounded-2xl border border-stone-200 shadow-xs">
      <img
        src={dataUrl}
        alt={`Safe Pickup QR for Token ${tokenNumber}`}
        width={size}
        height={size}
        className="rounded-lg"
      />
      <span className="text-[10px] font-bold text-stone-500 tracking-wider mt-1 uppercase">
        Scan at Counter
      </span>
    </div>
  );
};
