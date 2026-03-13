'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QRCodeForPrint() {
  const [qrCodePNG, setQrCodePNG] = useState<string>('');
  const [qrCodeSVG, setQrCodeSVG] = useState<string>('');
  const url = 'https://northernriversknivessharpening.com';

  useEffect(() => {
    // Generate high-resolution PNG for print (300 DPI equivalent)
    QRCode.toDataURL(url, {
      width: 1200, // High resolution for print
      margin: 4,
      errorCorrectionLevel: 'H', // Highest error correction for print durability
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      }
    })
      .then(dataUrl => {
        setQrCodePNG(dataUrl);
      })
      .catch(err => {
        console.error(err);
      });

    // Generate SVG for scalable vector graphics (perfect for any size)
    QRCode.toString(url, {
      type: 'svg',
      width: 400,
      margin: 4,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      }
    })
      .then(svg => {
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(blob);
        setQrCodeSVG(svgUrl);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  const downloadSVG = () => {
    const svg = document.querySelector('#qr-svg-container')?.innerHTML;
    if (!svg) return;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'northernrivers-qrcode.svg';
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">QR Code for Print Materials</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* High Resolution PNG */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">High Resolution PNG</h3>
          <p className="text-sm text-gray-600 mb-4">
            Best for: Business cards, flyers, posters
          </p>
          {qrCodePNG && (
            <>
              <div className="bg-gray-100 p-4 rounded flex justify-center">
                <img src={qrCodePNG} alt="QR Code" className="w-48 h-48" />
              </div>
              <a
                href={qrCodePNG}
                download="northernrivers-qrcode-highres.png"
                className="mt-4 w-full inline-block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Download PNG (1200x1200)
              </a>
            </>
          )}
        </div>

        {/* SVG Version */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Vector SVG</h3>
          <p className="text-sm text-gray-600 mb-4">
            Best for: Professional printing, any size scaling
          </p>
          {qrCodeSVG && (
            <>
              <div className="bg-gray-100 p-4 rounded flex justify-center">
                <div id="qr-svg-container" dangerouslySetInnerHTML={{
                  __html: qrCodeSVG ?
                    `<svg width="192" height="192" viewBox="0 0 400 400">
                      ${qrCodeSVG.split('<svg')[1]?.split('>').slice(1).join('>').split('</svg>')[0]}
                    </svg>` : ''
                }} />
              </div>
              <button
                onClick={downloadSVG}
                className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Download SVG (Scalable)
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Print Guidelines:</h3>
        <ul className="space-y-2 text-sm">
          <li>• <strong>Business Cards:</strong> Use 1-1.5 inch QR code size</li>
          <li>• <strong>Flyers:</strong> Use 2-3 inch QR code size</li>
          <li>• <strong>Posters:</strong> Scale as needed (SVG recommended)</li>
          <li>• <strong>Minimum Size:</strong> Don&apos;t go smaller than 0.8 inches</li>
          <li>• <strong>Quiet Zone:</strong> Keep white space around the QR code</li>
          <li>• <strong>Testing:</strong> Always test scan before printing in bulk</li>
        </ul>
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        QR Code links to: <strong>{url}</strong>
      </div>
    </div>
  );
}