import type { Metadata } from "next";
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Mobile Knife Sharpening Alstonville NSW 2477 | Commercial & Industrial | Macadamia Capital",
  description: "Professional mobile knife sharpening service in Alstonville NSW 2477. Expert blade restoration for industrial estate, rural services & residential customers. Macadamia capital knife service!",
  keywords: "knife sharpening Alstonville, mobile knife sharpening 2477, industrial knife sharpening Alstonville NSW, macadamia processing knife service, rural knife sharpening Alstonville",
  openGraph: {
    title: "Mobile Knife Sharpening Alstonville NSW | Industrial & Rural Service",
    description: "Professional mobile knife sharpening service in Alstonville NSW 2477. Expert blade restoration for industrial estate, rural services & residential customers.",
    url: "https://northernriversknifesharpening.com/knife-sharpening-alstonville",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Professional knife sharpening service Alstonville NSW 2477",
      },
    ],
  },
  alternates: {
    canonical: "https://northernriversknifesharpening.com/knife-sharpening-alstonville",
  },
  other: {
    "geo.region": "AU-NSW",
    "geo.placename": "Alstonville, NSW",
    "geo.position": "-28.8473;153.4365",
    "ICBM": "-28.8473, 153.4365",
  },
};

export default function AlstonvilleKnifeSharpeningPage() {
  return (
    <>
      {/* Local Business Schema for Alstonville */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": "https://northernriversknifesharpening.com/knife-sharpening-alstonville#business",
            "name": "Northern Rivers Knife Sharpening - Alstonville",
            "description": "Professional mobile knife sharpening service in Alstonville NSW 2477. Expert blade restoration for the macadamia capital's industrial estate, rural services, and residential customers.",
            "url": "https://northernriversknifesharpening.com/knife-sharpening-alstonville",
            "telephone": "+61451494922",
            "email": "info@northernriversknifesharpening.com",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Alstonville",
              "addressRegion": "NSW",
              "postalCode": "2477",
              "addressCountry": "AU"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "-28.8473",
              "longitude": "153.4365"
            },
            "areaServed": [
              {
                "@type": "City",
                "name": "Alstonville",
                "@id": "https://www.wikidata.org/wiki/Q2843816"
              },
              {
                "@type": "Place",
                "name": "Alstonville Industrial Estate"
              },
              {
                "@type": "Place",
                "name": "Macadamia Processing Facilities"
              }
            ],
            "serviceType": "Industrial & Rural Mobile Knife Sharpening",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Alstonville Industrial Knife Sharpening Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Industrial Knife Sharpening Alstonville"
                  },
                  "price": "20.00",
                  "priceCurrency": "AUD",
                  "availability": "https://schema.org/InStock"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Macadamia Processing Knife Service Alstonville"
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
              Professional Mobile Knife Sharpening in <span className="text-emerald-600">Alstonville NSW</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Expert blade restoration service for Alstonville's industrial estate, rural services, and residential customers. 
              Servicing the macadamia capital postcode 2477 with specialized commercial solutions!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/#booking"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Book Alstonville Service
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

        {/* Alstonville Specific Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Alstonville's Industrial & Rural Services Choose Our Mobile Knife Sharpening
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-emerald-900 mb-6">
                  Serving the Macadamia Capital's Industrial Operations
                </h3>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Alstonville's 5,182 residents support extensive industrial operations including macadamia processing, 
                    rural services, and the busy industrial estate. We provide specialized mobile knife sharpening 
                    for commercial food processing and residential customers.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Mobile service to industrial estate and processing facilities</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Specialized service for macadamia processing operations</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Bulk pricing for large commercial operations</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Same-day service for urgent industrial needs</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-emerald-50 p-8 rounded-xl">
                <h4 className="text-xl font-semibold text-emerald-900 mb-4">
                  Major Alstonville Areas We Service:
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Alstonville Industrial Estate facilities</li>
                  <li>• Macadamia processing and packaging plants</li>
                  <li>• Rural services and agricultural operations</li>
                  <li>• Commercial food preparation facilities</li>
                  <li>• Residential homes throughout 2477 postcode</li>
                  <li>• Local restaurants and cafes</li>
                  <li>• Agricultural and farming operations</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Industrial Focus Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Industrial & Agricultural Solutions in Alstonville
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">🏭</div>
                <h3 className="text-xl font-semibold text-emerald-900 mb-4">Industrial Estate</h3>
                <p className="text-gray-700">
                  Specialized mobile service for Alstonville Industrial Estate 
                  food processing and commercial kitchen facilities.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">🌰</div>
                <h3 className="text-xl font-semibold text-emerald-900 mb-4">Macadamia Processing</h3>
                <p className="text-gray-700">
                  Expert knife maintenance for macadamia processing facilities 
                  and agricultural food preparation operations.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">🚜</div>
                <h3 className="text-xl font-semibold text-emerald-900 mb-4">Rural Services</h3>
                <p className="text-gray-700">
                  Mobile knife sharpening perfect for rural and agricultural 
                  operations throughout the Alstonville region.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Service Pricing Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Professional Pricing for Alstonville Industrial & Residential
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
                  <li>• Perfect for home kitchens</li>
                </ul>
              </div>
              
              <div className="bg-emerald-600 text-white p-6 rounded-xl shadow-lg transform scale-105">
                <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold mb-4 inline-block">
                  Industrial Favorite
                </div>
                <h3 className="text-xl font-semibold mb-4">Premium Care</h3>
                <p className="text-3xl font-bold mb-2">$22</p>
                <p className="opacity-90 mb-4">per item</p>
                <ul className="text-sm space-y-2">
                  <li>• Mirror polish finish</li>
                  <li>• Rust prevention coating</li>
                  <li>• Lasts 2x longer</li>
                  <li>• Industrial quality</li>
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
                  <li>• Premium commercial grade</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Local Testimonials */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              What Alstonville Businesses Say
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <p className="text-gray-700 mb-4">
                  "Essential service for our macadamia processing facility in Alstonville. The mobile convenience 
                  keeps our production lines running smoothly. Professional results every time!"
                </p>
                <p className="font-semibold text-emerald-900">- Alstonville Processing Facility</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <p className="text-gray-700 mb-4">
                  "Perfect for our industrial estate operation. They understand commercial knife requirements 
                  and deliver quality service right to our door."
                </p>
                <p className="font-semibold text-emerald-900">- Alstonville Industrial Estate Business</p>
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
              <Link href="/knife-sharpening-ballina" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center">
                <h3 className="font-semibold text-gray-900">Ballina</h3>
                <p className="text-sm text-gray-600">Professional knife sharpening</p>
              </Link>
              <Link href="/knife-sharpening-east-ballina" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center">
                <h3 className="font-semibold text-gray-900">East Ballina</h3>
                <p className="text-sm text-gray-600">Professional knife sharpening</p>
              </Link>
              <Link href="/knife-sharpening-west-ballina" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center">
                <h3 className="font-semibold text-gray-900">West Ballina</h3>
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
        <section className="py-16 bg-emerald-600 text-white text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">
              Ready for Professional Knife Sharpening in Alstonville?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join Alstonville's industrial operations and residents who trust our mobile knife sharpening service
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/#booking"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Book Alstonville Service Now
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
              Professional Mobile Knife Sharpening Service | Alstonville NSW 2477
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