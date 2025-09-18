const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const url = 'https://northernriversknifesharpening.com/';

// Create output directory
const outputDir = path.join(__dirname, 'qr-codes-for-print');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Generate high-resolution PNG for print (300 DPI) - transparent background
QRCode.toFile(
  path.join(outputDir, 'qr-code-high-res.png'),
  url,
  {
    width: 1200,
    margin: 4,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#1f2c69',
      light: '#00000000', // Transparent background
    }
  },
  (err) => {
    if (err) throw err;
    console.log('✓ High-resolution PNG saved: qr-codes-for-print/qr-code-high-res.png');
  }
);

// Generate medium resolution for business cards - transparent background
QRCode.toFile(
  path.join(outputDir, 'qr-code-business-card.png'),
  url,
  {
    width: 600,
    margin: 3,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#1f2c69',
      light: '#00000000', // Transparent background
    }
  },
  (err) => {
    if (err) throw err;
    console.log('✓ Business card size PNG saved: qr-codes-for-print/qr-code-business-card.png');
  }
);

// Generate SVG for unlimited scaling - transparent background
QRCode.toString(
  url,
  {
    type: 'svg',
    width: 400,
    margin: 4,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#1f2c69',
      light: '#00000000', // Transparent background using hex with alpha
    }
  },
  (err, svg) => {
    if (err) throw err;
    // Make SVG background truly transparent by removing fill
    const transparentSvg = svg.replace(/fill="#ffffff"/g, 'fill="transparent"');
    fs.writeFileSync(path.join(outputDir, 'qr-code.svg'), transparentSvg);
    console.log('✓ SVG file saved: qr-codes-for-print/qr-code.svg');
  }
);

console.log('\n📱 QR codes generated for:', url);
console.log('\n📁 Files saved in: qr-codes-for-print/');
console.log('\nRecommended sizes:');
console.log('  • Business cards: Use qr-code-business-card.png (1-1.5 inches)');
console.log('  • Flyers: Use qr-code-high-res.png (2-3 inches)');
console.log('  • Large posters: Use qr-code.svg (scales to any size)');
console.log('\n⚠️  Always test scan before printing in bulk!');