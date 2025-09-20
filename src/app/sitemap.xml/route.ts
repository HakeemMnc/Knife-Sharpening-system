import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = 'https://northernriversknifesharpening.com'
  
  // Main pages
  const staticPages = [
    '',
    '/admin'
  ]
  
  // Location pages
  const locationPages = [
    '/knife-sharpening-byron-bay',
    '/knife-sharpening-ballina', 
    '/knife-sharpening-mullumbimby',
    '/knife-sharpening-bangalow',
    '/knife-sharpening-alstonville',
    '/knife-sharpening-ocean-shores',
    '/knife-sharpening-brunswick-heads',
    '/knife-sharpening-suffolk-park',
    '/knife-sharpening-lennox-head',
    '/knife-sharpening-east-ballina',
    '/knife-sharpening-west-ballina',
    '/knife-sharpening-pottsville'
  ]
  
  const currentDate = new Date().toISOString()
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
${locationPages.map(page => `  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200'
    }
  })
}