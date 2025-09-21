import type { Metadata } from "next";
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Mobile Knife Sharpening Ballina NSW 2478 | Commercial & Residential | Industrial Estate",
  description: "Professional mobile knife sharpening service in Ballina NSW. Servicing 140+ restaurants, commercial kitchens & homes. Expert blade restoration. Book online today!",
  keywords: "knife sharpening Ballina, mobile knife sharpening 2478, commercial knife sharpening Ballina, restaurant knife service Ballina NSW, Southern Cross Industrial Estate",
  openGraph: {
    title: "Mobile Knife Sharpening Ballina NSW | Commercial & Residential Service",
    description: "Professional mobile knife sharpening service in Ballina NSW. Servicing 140+ restaurants, commercial kitchens & homes. Expert blade restoration.",
    url: "https://northernriversknifesharpening.com/knife-sharpening-ballina",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Professional knife sharpening service Ballina NSW 2478",
      },
    ],
  },
  alternates: {
    canonical: "https://northernriversknifesharpening.com/knife-sharpening-ballina",
  },
  other: {
    "geo.region": "AU-NSW",
    "geo.placename": "Ballina, NSW",
    "geo.position": "-28.8669;153.5617",
    "ICBM": "-28.8669, 153.5617",
  },
};

export default function BallinaKnifeSharpeningPage() {
  return (
    <>
      {/* Local Business Schema for Ballina */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": "https://northernriversknifesharpening.com/knife-sharpening-ballina#business",
            "name": "Northern Rivers Knife Sharpening - Ballina",
            "description": "Professional mobile knife sharpening service in Ballina NSW 2478. Commercial and residential blade restoration for the Northern Rivers regional center.",
            "url": "https://northernriversknifesharpening.com/knife-sharpening-ballina",
            "telephone": "+61451494922",
            "email": "info@northernriversknifesharpening.com",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Ballina",
              "addressRegion": "NSW",
              "postalCode": "2478",
              "addressCountry": "AU"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "-28.8669",
              "longitude": "153.5617"
            },
            "areaServed": [
              {
                "@type": "City",
                "name": "Ballina",
                "@id": "https://www.wikidata.org/wiki/Q1021863"
              },
              {
                "@type": "Place",
                "name": "Southern Cross Industrial Estate"
              },
              {
                "@type": "Place",
                "name": "East Ballina"
              },
              {
                "@type": "Place",
                "name": "West Ballina"
              }
            ],
            "serviceType": "Commercial & Residential Mobile Knife Sharpening",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Ballina Commercial Knife Sharpening Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Commercial Kitchen Knife Sharpening Ballina"
                  },
                  "price": "20.00",
                  "priceCurrency": "AUD",
                  "availability": "https://schema.org/InStock"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Industrial Estate Knife Service Ballina"
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

      {/* Breadcrumb Schema for Ballina */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://northernriversknifesharpening.com"
              },
              {
                "@type": "ListItem", 
                "position": 2,
                "name": "Knife Sharpening",
                "item": "https://northernriversknifesharpening.com/#services"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Ballina",
                "item": "https://northernriversknifesharpening.com/knife-sharpening-ballina"
              }
            ]
          })
        }}
      />

      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        {/* Header Section */}
        <header className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-green-900">
                Northern Rivers Knife Sharpening
              </Link>
              <Link 
                href="/#booking" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
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
              Professional Mobile Knife Sharpening in <span className="text-green-600">Ballina NSW</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Northern Rivers' premier mobile knife sharpening service for Ballina's 140+ restaurants, 
              commercial kitchens, and residential customers. Servicing all of postcode 2478.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/#booking"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Book Ballina Service
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

        {/* Ballina Specific Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Ballina's Commercial Kitchens Choose Our Service
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-green-900 mb-6">
                  Serving Ballina's Thriving Commercial Food Industry
                </h3>
                <div className="space-y-4 text-gray-700">
                  <p>
                    As Northern Rivers' major regional center, Ballina hosts 140+ restaurants and extensive 
                    commercial food operations. From the Southern Cross Industrial Estate to busy riverside 
                    dining, we keep Ballina's blades razor-sharp.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Mobile service to all Ballina commercial locations</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Bulk pricing for large commercial kitchens</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Same-day service for urgent restaurant needs</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Regular maintenance schedules available</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-green-50 p-8 rounded-xl">
                <h4 className="text-xl font-semibold text-green-900 mb-4">
                  Major Ballina Areas We Service:
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Southern Cross Industrial Estate commercial kitchens</li>
                  <li>• Ballina CBD restaurant district</li>
                  <li>• Richmond River waterfront dining</li>
                  <li>• East Ballina residential areas</li>
                  <li>• West Ballina suburbs</li>
                  <li>• Ballina Airport hospitality venues</li>
                  <li>• Construction industry catering services</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Commercial Focus Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Commercial Kitchen Solutions in Ballina
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">🏭</div>
                <h3 className="text-xl font-semibold text-green-900 mb-4">Industrial Estate</h3>
                <p className="text-gray-700">
                  Specialized service for Southern Cross Industrial Estate food processing 
                  and commercial kitchen facilities.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-green-900 mb-4">Restaurant District</h3>
                <p className="text-gray-700">
                  Supporting Ballina's 140+ restaurants with professional knife 
                  maintenance and emergency sharpening services.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">🏗️</div>
                <h3 className="text-xl font-semibold text-green-900 mb-4">Construction Catering</h3>
                <p className="text-gray-700">
                  Mobile service perfect for construction industry catering operations 
                  throughout the Ballina region.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Service Pricing Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Professional Pricing for Ballina Commercial & Residential
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200">
                <h3 className="text-xl font-semibold text-green-900 mb-4">Standard Care</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">$20</p>
                <p className="text-gray-600 mb-4">per item</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Razor-sharp edge restoration</li>
                  <li>• Professional sharpening</li>
                  <li>• Quality guaranteed</li>
                  <li>• Perfect for home kitchens</li>
                </ul>
              </div>
              
              <div className="bg-green-600 text-white p-6 rounded-xl shadow-lg transform scale-105">
                <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold mb-4 inline-block">
                  Commercial Favorite
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
                <h3 className="text-xl font-semibold text-green-900 mb-4">Traditional Japanese</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">$27</p>
                <p className="text-gray-600 mb-4">per item</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• 4-stone progression</li>
                  <li>• Leather strop finishing</li>
                  <li>• Ultimate edge quality</li>
                  <li>• Premium restaurant grade</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Local Testimonials */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              What Ballina Businesses Say
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <p className="text-gray-700 mb-4">
                  "Essential service for our Ballina commercial kitchen. The mobile convenience 
                  means we never have downtime. Professional results every visit!"
                </p>
                <p className="font-semibold text-green-900">- Ballina Restaurant Manager</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <p className="text-gray-700 mb-4">
                  "Perfect for our industrial estate food processing facility. They understand 
                  commercial kitchen requirements and deliver quality every time."
                </p>
                <p className="font-semibold text-green-900">- Southern Cross Industrial Estate</p>
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
              <Link href="/knife-sharpening-east-ballina" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center">
                <h3 className="font-semibold text-gray-900">East Ballina</h3>
                <p className="text-sm text-gray-600">Professional knife sharpening</p>
              </Link>
              <Link href="/knife-sharpening-west-ballina" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center">
                <h3 className="font-semibold text-gray-900">West Ballina</h3>
                <p className="text-sm text-gray-600">Professional knife sharpening</p>
              </Link>
              <Link href="/knife-sharpening-lennox-head" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center">
                <h3 className="font-semibold text-gray-900">Lennox Head</h3>
                <p className="text-sm text-gray-600">Professional knife sharpening</p>
              </Link>
              <Link href="/knife-sharpening-alstonville" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center">
                <h3 className="font-semibold text-gray-900">Alstonville</h3>
                <p className="text-sm text-gray-600">Professional knife sharpening</p>
              </Link>
              <Link href="/knife-sharpening-ocean-shores" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center">
                <h3 className="font-semibold text-gray-900">Ocean Shores</h3>
                <p className="text-sm text-gray-600">Professional knife sharpening</p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-green-600 text-white text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">
              Ready for Professional Knife Sharpening in Ballina?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join Ballina's leading restaurants and commercial kitchens who trust our mobile service
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/#booking"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Book Ballina Service Now
              </Link>
              <Link 
                href="tel:+61451494922"
                className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
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
              Professional Mobile Knife Sharpening Service | Ballina NSW 2478
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