'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QRCodeGenerator({ url = 'https://northernriversknivessharpening.com' }: { url?: string }) {
  const [qrCode, setQrCode] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      }
    })
      .then(url => {
        setQrCode(url);
      })
      .catch(err => {
        console.error(err);
      });
  }, [url]);

  return (
    <div className="flex flex-col items-center">
      {qrCode && (
        <>
          <img src={qrCode} alt="QR Code" className="border-2 border-gray-300 rounded-lg" />
          <a
            href={qrCode}
            download="website-qr-code.png"
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Download QR Code
          </a>
        </>
      )}
    </div>
  );
}