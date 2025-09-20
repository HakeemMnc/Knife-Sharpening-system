import type { Metadata } from "next";
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Mobile Knife Sharpening Pottsville NSW 2489 | Sustainable Dining | Tweed Shire | Pristine Beaches",
  description: "Professional mobile knife sharpening service in Pottsville NSW. Expert blade service for sustainable dining restaurants & pristine beach venues. Book online today! Servicing 2489 postcode.",
  keywords: "knife sharpening Pottsville, mobile knife sharpening 2489, sustainable dining knife service, Tweed Shire knife sharpening, pristine beach restaurant knives, eco-friendly knife service",
  openGraph: {
    title: "Mobile Knife Sharpening Pottsville NSW | Sustainable Dining Service",
    description: "Professional mobile knife sharpening service in Pottsville NSW. Expert blade service for sustainable dining restaurants & pristine beach venues.",
    url: "https://northernriversknifesharpening.com/knife-sharpening-pottsville",
    images: [
      {
        url: "/knife-sharpening-pottsville-og.jpg",
        width: 1200,
        height: 630,
        alt: "Professional knife sharpening service Pottsville NSW 2489",
      },
    ],
  },
  alternates: {
    canonical: "https://northernriversknifesharpening.com/knife-sharpening-pottsville",
  },
  other: {
    "geo.region": "AU-NSW",
    "geo.placename": "Pottsville, NSW",
    "geo.position": "-28.3894;153.5631",
    "ICBM": "-28.3894, 153.5631",
  },
};

export default function PottsvilleKnifeSharpeningPage() {
  return (
    <>
      {/* Local Business Schema for Pottsville */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": "https://northernriversknifesharpening.com/knife-sharpening-pottsville#business",
            "name": "Northern Rivers Knife Sharpening - Pottsville",
            "description": "Professional mobile knife sharpening service in Pottsville NSW 2489. Expert blade restoration for sustainable dining restaurants, pristine beach venues, and eco-conscious establishments in Tweed Shire.",
            "url": "https://northernriversknifesharpening.com/knife-sharpening-pottsville",
            "telephone": "+61451494922",
            "email": "info@northernriversknifesharpening.com",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Pottsville",
              "addressRegion": "NSW",
              "postalCode": "2489",
              "addressCountry": "AU"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "-28.3894",
              "longitude": "153.5631"
            },
            "areaServed": {
              "@type": "City",
              "name": "Pottsville",
              "@id": "https://www.wikidata.org/wiki/Q7235557"
            },
            "serviceType": "Sustainable Dining Mobile Knife Sharpening",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Pottsville Sustainable Dining Knife Sharpening Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Sustainable Restaurant Knife Sharpening Pottsville"
                  },
                  "price": "20.00",
                  "priceCurrency": "AUD",
                  "availability": "https://schema.org/InStock"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Pristine Beach Venue Knife Service Pottsville"
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

      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
        {/* Header Section */}
        <header className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-emerald-900">
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
              Professional Mobile Knife Sharpening in <span className="text-emerald-600">Pottsville NSW</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Expert blade restoration for Pottsville's sustainable dining scene and pristine beach venues. 
              Serving Tweed Shire's 7,209 residents with eco-conscious mobile service. Book online today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/#booking"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Book Pottsville Service
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

        {/* Pottsville Specific Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Pottsville's Sustainable Dining Scene Chooses Our Service
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-emerald-900 mb-6">
                  Serving Pottsville's Eco-Conscious Dining Culture
                </h3>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Pottsville's 7,209 residents in Tweed Shire are renowned for their commitment to sustainable 
                    dining and pristine beach conservation. Our mobile knife sharpening service aligns perfectly 
                    with the town's eco-conscious values and quality dining standards.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Eco-friendly mobile service reducing waste</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Perfect for Pottsville's sustainable dining focus</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Supporting pristine beach venue operations</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Tweed Shire's preferred mobile knife service</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-emerald-50 p-8 rounded-xl">
                <h4 className="text-xl font-semibold text-emerald-900 mb-4">
                  Pottsville Locations We Service:
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Sustainable dining restaurants and cafes</li>
                  <li>• Pristine beach venue establishments</li>
                  <li>• Eco-conscious residential homes throughout 2489</li>
                  <li>• Tweed Shire community dining facilities</li>
                  <li>• Sustainable food operations and markets</li>
                  <li>• Beach-to-table restaurant venues</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Sustainable Focus Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Supporting Pottsville's Sustainable Dining Movement
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="text-xl font-semibold text-emerald-900 mb-4">Sustainable Dining</h3>
                <p className="text-gray-700">
                  Mobile knife sharpening supporting Pottsville's commitment to sustainable 
                  dining practices and eco-conscious restaurant operations.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">🏖️</div>
                <h3 className="text-xl font-semibold text-emerald-900 mb-4">Pristine Beach Venues</h3>
                <p className="text-gray-700">
                  Specialized service for Pottsville's beautiful beach dining venues 
                  and coastal restaurants committed to environmental protection.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">♻️</div>
                <h3 className="text-xl font-semibold text-emerald-900 mb-4">Eco-Conscious Service</h3>
                <p className="text-gray-700">
                  Environmentally responsible mobile service that aligns with 
                  Tweed Shire's conservation values and sustainable practices.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Service Pricing Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Sustainable Pricing for Pottsville Knife Sharpening
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200">
                <h3 className="text-xl font-semibold text-emerald-900 mb-4">Standard Care</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">$20</p>
                <p className="text-gray-600 mb-4">per item</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Razor-sharp edge restoration</li>
                  <li>• Professional sharpening</li>
                  <li>• Quality guaranteed</li>
                  <li>• Eco-friendly process</li>
                </ul>
              </div>
              
              <div className="bg-emerald-600 text-white p-6 rounded-xl shadow-lg transform scale-105">
                <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold mb-4 inline-block">
                  Sustainable Choice
                </div>
                <h3 className="text-xl font-semibold mb-4">Premium Care</h3>
                <p className="text-3xl font-bold mb-2">$22</p>
                <p className="opacity-90 mb-4">per item</p>
                <ul className="text-sm space-y-2">
                  <li>• Mirror polish finish</li>
                  <li>• Rust prevention coating</li>
                  <li>• Lasts 2x longer</li>
                  <li>• Sustainable quality</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200">
                <h3 className="text-xl font-semibold text-emerald-900 mb-4">Traditional Japanese</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">$27</p>
                <p className="text-gray-600 mb-4">per item</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• 4-stone progression</li>
                  <li>• Leather strop finishing</li>
                  <li>• Ultimate edge quality</li>
                  <li>• Premium sustainable grade</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Local Testimonials */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              What Pottsville's Sustainable Community Says
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <p className="text-gray-700 mb-4">
                  "Perfect for our sustainable dining restaurant in Pottsville. The mobile service 
                  aligns with our eco-values and the quality supports our commitment to excellence."
                </p>
                <p className="font-semibold text-emerald-900">- Pottsville Sustainable Restaurant</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <p className="text-gray-700 mb-4">
                  "Love how this service fits our beach venue's environmental values. Professional 
                  results with minimal impact - exactly what Pottsville needs!"
                </p>
                <p className="font-semibold text-emerald-900">- Pristine Beach Venue Owner</p>
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
              <Link href="/knife-sharpening-bangalow" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center">
                <h3 className="font-semibold text-gray-900">Bangalow</h3>
                <p className="text-sm text-gray-600">Professional knife sharpening</p>
              </Link>
              <Link href="/knife-sharpening-suffolk-park" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center">
                <h3 className="font-semibold text-gray-900">Suffolk Park</h3>
                <p className="text-sm text-gray-600">Professional knife sharpening</p>
              </Link>
              <Link href="/knife-sharpening-brunswick-heads" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center">
                <h3 className="font-semibold text-gray-900">Brunswick Heads</h3>
                <p className="text-sm text-gray-600">Professional knife sharpening</p>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-emerald-600 text-white text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">
              Ready for Sustainable Knife Sharpening in Pottsville?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join Pottsville's sustainable dining scene and pristine beach venues who trust our eco-conscious service
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/#booking"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Book Pottsville Service Now
              </Link>
              <Link 
                href="tel:+61451494922"
                className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
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
              Professional Mobile Knife Sharpening Service | Pottsville NSW 2489 | Tweed Shire
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