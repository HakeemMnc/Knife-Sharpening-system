import type { Metadata } from "next";
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Mobile Knife Sharpening Lennox Head NSW 2478 | Surf Culture Dining | Lake Ainsworth",
  description: "Professional mobile knife sharpening service in Lennox Head NSW. Expert blade service for award-winning restaurants & surf culture dining. Book online today! Servicing 2478 postcode.",
  keywords: "knife sharpening Lennox Head, mobile knife sharpening 2478, blade sharpening Lennox Head NSW, surf culture dining knives, Lake Ainsworth restaurants, professional knife service",
  openGraph: {
    title: "Mobile Knife Sharpening Lennox Head NSW | Surf Culture Dining Service",
    description: "Professional mobile knife sharpening service in Lennox Head NSW. Expert blade service for award-winning restaurants & surf culture dining.",
    url: "https://northernriversknifesharpening.com/knife-sharpening-lennox-head",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Professional knife sharpening service Lennox Head NSW 2478",
      },
    ],
  },
  alternates: {
    canonical: "https://northernriversknifesharpening.com/knife-sharpening-lennox-head",
  },
  other: {
    "geo.region": "AU-NSW",
    "geo.placename": "Lennox Head, NSW",
    "geo.position": "-28.7917;153.5889",
    "ICBM": "-28.7917, 153.5889",
  },
};

export default function LennoxHeadKnifeSharpeningPage() {
  return (
    <>
      {/* Local Business Schema for Lennox Head */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": "https://northernriversknifesharpening.com/knife-sharpening-lennox-head#business",
            "name": "Northern Rivers Knife Sharpening - Lennox Head",
            "description": "Professional mobile knife sharpening service in Lennox Head NSW 2478. Expert blade restoration for surf culture restaurants, award-winning dining, and Lake Ainsworth establishments.",
            "url": "https://northernriversknifesharpening.com/knife-sharpening-lennox-head",
            "telephone": "+61451494922",
            "email": "info@northernriversknifesharpening.com",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Lennox Head",
              "addressRegion": "NSW",
              "postalCode": "2478",
              "addressCountry": "AU"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "-28.7917",
              "longitude": "153.5889"
            },
            "areaServed": {
              "@type": "City",
              "name": "Lennox Head",
              "@id": "https://www.wikidata.org/wiki/Q2471876"
            },
            "serviceType": "Mobile Knife Sharpening Service",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Lennox Head Knife Sharpening Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Surf Culture Restaurant Knife Sharpening Lennox Head"
                  },
                  "price": "20.00",
                  "priceCurrency": "AUD",
                  "availability": "https://schema.org/InStock"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Lake Ainsworth Dining Knife Service"
                  },
                  "price": "20.00",
                  "priceCurrency": "AUD",
                  "availability": "https://schema.org/InStock"
                }
              ]
            },
            "priceRange": "$20-$27",
            "openingHours": ["Mo-Fr 08:00-17:00", "Sa 08:00-15:00"],
            "sameAs": ["https://facebook.com/northernriversknifesharpening"]
          })
        }}
      />

      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        {/* Header Section */}
        <header className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-orange-900">
                Northern Rivers Knife Sharpening
              </Link>
              <Link 
                href="/#booking" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Book Now
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Professional Mobile Knife Sharpening in <span className="text-orange-600">Lennox Head NSW</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Expert blade restoration for Lennox Head&apos;s surf culture dining scene and award-winning restaurants. 
              Servicing postcode 2478 with mobile convenience. Book online today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/#booking"
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Book Lennox Head Service
              </Link>
              <Link 
                href="tel:+61451494922"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Call: 0451 494 922
              </Link>
            </div>
          </div>
        </section>

        {/* Lennox Head Specific Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Lennox Head&apos;s Surf Culture Dining Chooses Our Service
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-orange-900 mb-6">
                  Serving Lennox Head&apos;s Award-Winning Restaurant Scene
                </h3>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Lennox Head&apos;s 7,741 residents and visitors enjoy world-class dining that matches the town&apos;s 
                    legendary surf culture. From beachfront cafes to award-winning restaurants, we keep your 
                    blades as sharp as the waves at The Point.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Mobile service to beachfront restaurants and cafes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Perfect for Lennox Head&apos;s fresh seafood dining culture</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Supporting Lake Ainsworth waterfront establishments</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Same-day service for busy surf culture venues</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-orange-50 p-8 rounded-xl">
                <h4 className="text-xl font-semibold text-orange-900 mb-4">
                  Popular Lennox Head Locations We Service:
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Lennox Head village center restaurants</li>
                  <li>• Lake Ainsworth waterfront dining</li>
                  <li>• Beachfront cafes and surf culture venues</li>
                  <li>• Residential homes throughout 2478 postcode</li>
                  <li>• Award-winning restaurant establishments</li>
                  <li>• Surf club and community venues</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Surf Culture Focus Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Supporting Lennox Head&apos;s Surf Culture Dining
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">🏄‍♂️</div>
                <h3 className="text-xl font-semibold text-orange-900 mb-4">Surf Culture Venues</h3>
                <p className="text-gray-700">
                  Mobile knife sharpening for Lennox Head&apos;s iconic surf culture restaurants 
                  and beachfront dining establishments.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">🌊</div>
                <h3 className="text-xl font-semibold text-orange-900 mb-4">Lake Ainsworth Dining</h3>
                <p className="text-gray-700">
                  Specialized service for Lake Ainsworth&apos;s unique tea-tree lake 
                  waterfront restaurants and cafes.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold text-orange-900 mb-4">Award-Winning Restaurants</h3>
                <p className="text-gray-700">
                  Professional knife maintenance for Lennox Head&apos;s acclaimed 
                  dining establishments and culinary destinations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Service Pricing Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Professional Pricing for Lennox Head Knife Sharpening
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200">
                <h3 className="text-xl font-semibold text-orange-900 mb-4">Standard Care</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">$20</p>
                <p className="text-gray-600 mb-4">per item</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Razor-sharp edge restoration</li>
                  <li>• Professional sharpening</li>
                  <li>• Quality guaranteed</li>
                  <li>• Perfect for home kitchens</li>
                </ul>
              </div>
              
              <div className="bg-orange-600 text-white p-6 rounded-xl shadow-lg transform scale-105">
                <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold mb-4 inline-block">
                  Surf Culture Favorite
                </div>
                <h3 className="text-xl font-semibold mb-4">Premium Care</h3>
                <p className="text-3xl font-bold mb-2">$22</p>
                <p className="opacity-90 mb-4">per item</p>
                <ul className="text-sm space-y-2">
                  <li>• Mirror polish finish</li>
                  <li>• Rust prevention coating</li>
                  <li>• Lasts 2x longer</li>
                  <li>• Restaurant quality</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200">
                <h3 className="text-xl font-semibold text-orange-900 mb-4">Traditional Japanese</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">$27</p>
                <p className="text-gray-600 mb-4">per item</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• 4-stone progression</li>
                  <li>• Leather strop finishing</li>
                  <li>• Ultimate edge quality</li>
                  <li>• Award-restaurant grade</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Local Testimonials */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              What Lennox Head Customers Say
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <p className="text-gray-700 mb-4">
                  &quot;Perfect for our surf culture restaurant in Lennox Head. The mobile service 
                  fits perfectly with our laid-back vibe. Sharp knives, professional service!&quot;
                </p>
                <p className="font-semibold text-orange-900">- Lennox Head Surf Culture Restaurant</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <p className="text-gray-700 mb-4">
                  &quot;Love the convenience for our Lake Ainsworth venue. They understand the local 
                  dining scene and deliver quality that matches our award-winning food.&quot;
                </p>
                <p className="font-semibold text-orange-900">- Lake Ainsworth Restaurant Owner</p>
              </div>
            </div>
          </div>
        </section>

        {/* Nearby Service Areas */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Also Servicing Nearby Areas
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Link href="/knife-sharpening-byron-bay" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center">
                <h3 className="font-semibold text-gray-900">Byron Bay</h3>
                <p className="text-sm text-gray-600">Professional knife sharpening</p>
              </Link>
              <Link href="/knife-sharpening-ballina" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center">
                <h3 className="font-semibold text-gray-900">Ballina</h3>
                <p className="text-sm text-gray-600">Professional knife sharpening</p>
              </Link>
              <Link href="/knife-sharpening-east-ballina" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center">
                <h3 className="font-semibold text-gray-900">East Ballina</h3>
                <p className="text-sm text-gray-600">Professional knife sharpening</p>
              </Link>
              <Link href="/knife-sharpening-suffolk-park" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center">
                <h3 className="font-semibold text-gray-900">Suffolk Park</h3>
                <p className="text-sm text-gray-600">Professional knife sharpening</p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-orange-600 text-white text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Sharpen Your Knives in Lennox Head?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join Lennox Head&apos;s surf culture dining scene and award-winning restaurants who trust our mobile service
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/#booking"
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Book Lennox Head Service Now
              </Link>
              <Link 
                href="tel:+61451494922"
                className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Call: 0451 494 922
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h3 className="text-lg font-semibold mb-2">Northern Rivers Knife Sharpening</h3>
            <p className="text-gray-400 mb-4">
              Professional Mobile Knife Sharpening Service | Lennox Head NSW 2478
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-gray-400">
              <span>Phone: 0451 494 922</span>
              <span>Email: info@northernriversknifesharpening.com</span>
              <Link href="/" className="hover:text-white transition-colors">
                Back to Main Site
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}