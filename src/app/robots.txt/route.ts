import { NextResponse } from 'next/server'

export async function GET() {
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://northernriversknifesharpening.com/sitemap.xml

# Block admin area from search engines
Disallow: /admin
Disallow: /api/
Disallow: /_next/
Disallow: /_vercel/

# Allow all location pages
Allow: /knife-sharpening-*`

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    }
  })
}