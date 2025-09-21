import type { Metadata } from "next";
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Mobile Knife Sharpening Brunswick Heads NSW 2483 | Fishing Village Service | Festival Ready",
  description: "Professional mobile knife sharpening service in Brunswick Heads NSW. Expert blade restoration for 25+ cafes, restaurants & fishing community. Book online today! Servicing 2483 postcode area.",
  keywords: "knife sharpening Brunswick Heads, mobile knife sharpening 2483, fishing village knife service, Brunswick Heads restaurants, Festival Fish n Chips knife sharpening, professional knife service Brunswick",
  openGraph: {
    title: "Mobile Knife Sharpening Brunswick Heads NSW | Fishing Village Professional Service",
    description: "Professional mobile knife sharpening service in Brunswick Heads NSW. Expert blade restoration for 25+ cafes, restaurants & fishing community. Book online today!",
    url: "https://northernriversknifesharpening.com/knife-sharpening-brunswick-heads",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Professional knife sharpening service Brunswick Heads NSW 2483",
      },
    ],
  },
  alternates: {
    canonical: "https://northernriversknifesharpening.com/knife-sharpening-brunswick-heads",
  },
  other: {
    "geo.region": "AU-NSW",
    "geo.placename": "Brunswick Heads, NSW",
    "geo.position": "-28.5415;153.5481",
    "ICBM": "-28.5415, 153.5481",
  },
};

export default function BrunswickHeadsKnifeSharpeningPage() {
  return (
    <>
      {/* Local Business Schema for Brunswick Heads */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": "https://northernriversknifesharpening.com/knife-sharpening-brunswick-heads#business",
            "name": "Northern Rivers Knife Sharpening - Brunswick Heads",
            "description": "Professional mobile knife sharpening service in Brunswick Heads NSW 2483. Expert blade restoration for fishing village restaurants, cafes, and marine community.",
            "url": "https://northernriversknifesharpening.com/knife-sharpening-brunswick-heads",
            "telephone": "+61451494922",
            "email": "info@northernriversknifesharpening.com",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Brunswick Heads",
              "addressRegion": "NSW",
              "postalCode": "2483",
              "addressCountry": "AU"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "-28.5415",
              "longitude": "153.5481"
            },
            "areaServed": {
              "@type": "City",
              "name": "Brunswick Heads",
              "@id": "https://www.wikidata.org/wiki/Q2925854"
            },
            "serviceType": "Mobile Knife Sharpening Service",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Brunswick Heads Knife Sharpening Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Restaurant Knife Sharpening Brunswick Heads"
                  },
                  "price": "20.00",
                  "priceCurrency": "AUD",
                  "availability": "https://schema.org/InStock"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Fishing Village Cafe Knife Sharpening"
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

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Header Section */}
        <header className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-blue-900">
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
              Professional Mobile Knife Sharpening in <span className="text-blue-600">Brunswick Heads NSW</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Expert blade restoration service for Brunswick Heads' fishing village community. 
              Servicing 25+ cafes, restaurants, and marine businesses in postcode 2483. Festival ready!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/#booking"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Book Brunswick Heads Service
              </Link>
              <Link 
                href="tel:+61451494922"
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Call: 0451 494 922
              </Link>
            </div>
          </div>
        </section>

        {/* Brunswick Heads Specific Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Brunswick Heads' Fishing Village Chooses Our Service
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-blue-900 mb-6">
                  Serving Brunswick Heads' Thriving Marine Food Scene
                </h3>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Brunswick Heads' 1,686 residents support a vibrant fishing village with 25+ cafes and restaurants. 
                    From fresh seafood establishments to the famous Festival of Fish n Chips, we keep your blades 
                    razor-sharp for this unique coastal community.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-teal-500 mr-2">✓</span>
                      <span>Mobile service perfect for riverside dining venues</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal-500 mr-2">✓</span>
                      <span>Specialized in seafood restaurant knife maintenance</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal-500 mr-2">✓</span>
                      <span>Festival preparation and event catering support</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal-500 mr-2">✓</span>
                      <span>Same-day service for fishing village businesses</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-50 p-8 rounded-xl">
                <h4 className="text-xl font-semibold text-blue-900 mb-4">
                  Popular Brunswick Heads Locations We Service:
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Riverside dining establishments along Brunswick River</li>
                  <li>• 25+ cafes and restaurants throughout the village</li>
                  <li>• Festival of Fish n Chips event venues</li>
                  <li>• Marine industry catering services</li>
                  <li>• Residential fishing village homes</li>
                  <li>• Coastal holiday accommodation kitchens</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Fishing Village Features Section */}
        <section className="py-16 bg-gradient-to-r from-blue-50 to-teal-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Fishing Village Knife Care in Brunswick Heads
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">🎣</div>
                <h3 className="text-xl font-semibold text-blue-900 mb-4">Seafood Specialists</h3>
                <p className="text-gray-700">
                  Expert knife maintenance for Brunswick Heads' seafood restaurants 
                  and fishing industry catering operations.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">🎪</div>
                <h3 className="text-xl font-semibold text-blue-900 mb-4">Festival Ready</h3>
                <p className="text-gray-700">
                  Supporting the famous Festival of Fish n Chips and other 
                  Brunswick Heads community events with professional service.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">🏞️</div>
                <h3 className="text-xl font-semibold text-blue-900 mb-4">Riverside Dining</h3>
                <p className="text-gray-700">
                  Mobile service for Brunswick River waterfront restaurants 
                  and the village's 25+ dining establishments.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Service Pricing Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Professional Pricing for Brunswick Heads Restaurants & Cafes
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">Standard Care</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">$20</p>
                <p className="text-gray-600 mb-4">per item</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Razor-sharp edge restoration</li>
                  <li>• Professional sharpening</li>
                  <li>• Quality guaranteed</li>
                </ul>
              </div>
              
              <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg transform scale-105">
                <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold mb-4 inline-block">
                  Restaurant Favorite
                </div>
                <h3 className="text-xl font-semibold mb-4">Premium Care</h3>
                <p className="text-3xl font-bold mb-2">$22</p>
                <p className="opacity-90 mb-4">per item</p>
                <ul className="text-sm space-y-2">
                  <li>• Mirror polish finish</li>
                  <li>• Rust prevention coating</li>
                  <li>• Lasts 2x longer</li>
                  <li>• Perfect for seafood preparation</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">Traditional Japanese</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">$27</p>
                <p className="text-gray-600 mb-4">per item</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• 4-stone progression</li>
                  <li>• Leather strop finishing</li>
                  <li>• Ultimate edge quality</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Local Testimonials */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              What Brunswick Heads Businesses Say
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <p className="text-gray-700 mb-4">
                  "Essential for our seafood restaurant in Brunswick Heads. The mobile service 
                  means we never miss service during busy fishing season. Perfect for our village!"
                </p>
                <p className="font-semibold text-blue-900">- Brunswick Heads Seafood Restaurant</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <p className="text-gray-700 mb-4">
                  "They helped us prepare for the Festival of Fish n Chips with professional 
                  knife sharpening. Great service for our fishing village community."
                </p>
                <p className="font-semibold text-blue-900">- Festival Food Vendor</p>
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
              <Link href="/knife-sharpening-mullumbimby" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center">
                <h3 className="font-semibold text-gray-900">Mullumbimby</h3>
                <p className="text-sm text-gray-600">Professional knife sharpening</p>
              </Link>
              <Link href="/knife-sharpening-bangalow" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center">
                <h3 className="font-semibold text-gray-900">Bangalow</h3>
                <p className="text-sm text-gray-600">Professional knife sharpening</p>
              </Link>
              <Link href="/knife-sharpening-ocean-shores" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center">
                <h3 className="font-semibold text-gray-900">Ocean Shores</h3>
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
        <section className="py-16 bg-blue-600 text-white text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">
              Ready for Professional Knife Sharpening in Brunswick Heads?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join Brunswick Heads' fishing village restaurants and cafes who trust our mobile service
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/#booking"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Book Brunswick Heads Service Now
              </Link>
              <Link 
                href="tel:+61451494922"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
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
              Professional Mobile Knife Sharpening Service | Brunswick Heads NSW 2483
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