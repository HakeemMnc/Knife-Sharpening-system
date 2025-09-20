import type { Metadata } from "next";
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Mobile Knife Sharpening Ocean Shores NSW 2483 | Professional Coastal Service | Same Day",
  description: "Professional mobile knife sharpening service in Ocean Shores NSW. Expert blade restoration for coastal homes, cafes & golf course. Book online today! Servicing 2483 postcode area.",
  keywords: "knife sharpening Ocean Shores, mobile knife sharpening 2483, blade sharpening Ocean Shores NSW, professional knife service Ocean Shores, chef knife sharpening Ocean Shores, coastal knife sharpening",
  openGraph: {
    title: "Mobile Knife Sharpening Ocean Shores NSW | Professional Coastal Service",
    description: "Professional mobile knife sharpening service in Ocean Shores NSW. Expert blade restoration for coastal homes, cafes & golf course. Book online today!",
    url: "https://northernriversknifesharpening.com/knife-sharpening-ocean-shores",
    images: [
      {
        url: "/knife-sharpening-ocean-shores-og.jpg",
        width: 1200,
        height: 630,
        alt: "Professional knife sharpening service Ocean Shores NSW 2483",
      },
    ],
  },
  alternates: {
    canonical: "https://northernriversknifesharpening.com/knife-sharpening-ocean-shores",
  },
  other: {
    "geo.region": "AU-NSW",
    "geo.placename": "Ocean Shores, NSW",
    "geo.position": "-28.5093;153.5376",
    "ICBM": "-28.5093, 153.5376",
  },
};

export default function OceanShoresKnifeSharpeningPage() {
  return (
    <>
      {/* Local Business Schema for Ocean Shores */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": "https://northernriversknifesharpening.com/knife-sharpening-ocean-shores#business",
            "name": "Northern Rivers Knife Sharpening - Ocean Shores",
            "description": "Professional mobile knife sharpening service in Ocean Shores NSW 2483. Expert blade restoration for coastal homes, cafes, and golf course facilities.",
            "url": "https://northernriversknifesharpening.com/knife-sharpening-ocean-shores",
            "telephone": "+61451494922",
            "email": "info@northernriversknifesharpening.com",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Ocean Shores",
              "addressRegion": "NSW",
              "postalCode": "2483",
              "addressCountry": "AU"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "-28.5093",
              "longitude": "153.5376"
            },
            "areaServed": {
              "@type": "City",
              "name": "Ocean Shores",
              "@id": "https://www.wikidata.org/wiki/Q7075588"
            },
            "serviceType": "Mobile Knife Sharpening Service",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Ocean Shores Knife Sharpening Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Coastal Home Knife Sharpening Ocean Shores"
                  },
                  "price": "17.00",
                  "priceCurrency": "AUD",
                  "availability": "https://schema.org/InStock"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Golf Course Kitchen Knife Sharpening Ocean Shores"
                  },
                  "price": "17.00",
                  "priceCurrency": "AUD",
                  "availability": "https://schema.org/InStock"
                }
              ]
            },
            "priceRange": "$17-$27",
            "openingHours": ["Mo-Fr 08:00-17:00", "Sa 08:00-15:00"],
            "sameAs": ["https://facebook.com/northernriversknifesharpening"]
          })
        }}
      />

      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
        {/* Header Section */}
        <header className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-cyan-900">
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
              Professional Mobile Knife Sharpening in <span className="text-cyan-600">Ocean Shores NSW</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Expert blade restoration service for Ocean Shores' coastal homes, cafes, and golf course facilities. 
              Servicing postcode 2483 with same-day mobile service. Book online today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/#booking"
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Book Ocean Shores Service
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

        {/* Ocean Shores Specific Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Ocean Shores Chooses Our Mobile Knife Sharpening Service
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-cyan-900 mb-6">
                  Serving Ocean Shores' Coastal Community
                </h3>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Ocean Shores' 4,818 residents enjoy a relaxed coastal lifestyle with golf, dining, and beach living. 
                    From the Ocean Shores Golf Course kitchen to local tavern and cafes, we keep your blades 
                    performing at their peak in this beautiful coastal community.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-teal-500 mr-2">✓</span>
                      <span>Convenient mobile service to your Ocean Shores location</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal-500 mr-2">✓</span>
                      <span>Perfect for coastal home kitchens and entertaining</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal-500 mr-2">✓</span>
                      <span>Supporting Ocean Shores' golf course and hospitality venues</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-teal-500 mr-2">✓</span>
                      <span>Same-day service for residential and commercial needs</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-cyan-50 p-8 rounded-xl">
                <h4 className="text-xl font-semibold text-cyan-900 mb-4">
                  Popular Ocean Shores Locations We Service:
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Ocean Shores Golf Course kitchen facilities</li>
                  <li>• Ocean Shores Tavern and local cafes</li>
                  <li>• Residential homes throughout Ocean Shores estate</li>
                  <li>• Beachfront properties and holiday homes</li>
                  <li>• Local food establishments along Orana Road</li>
                  <li>• Coastal accommodation kitchen facilities</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Coastal Features Section */}
        <section className="py-16 bg-gradient-to-r from-cyan-50 to-teal-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Coastal Community Knife Care in Ocean Shores
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">🏌️</div>
                <h3 className="text-xl font-semibold text-cyan-900 mb-4">Golf Course Service</h3>
                <p className="text-gray-700">
                  Professional knife maintenance for Ocean Shores Golf Course kitchen 
                  and hospitality facilities.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">🏖️</div>
                <h3 className="text-xl font-semibold text-cyan-900 mb-4">Coastal Homes</h3>
                <p className="text-gray-700">
                  Mobile service perfect for Ocean Shores' residential coastal 
                  community and beachfront properties.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-cyan-900 mb-4">Local Dining</h3>
                <p className="text-gray-700">
                  Supporting Ocean Shores' tavern, cafes, and local food 
                  establishments with professional blade maintenance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Service Pricing Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Transparent Pricing for Ocean Shores Knife Sharpening
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200">
                <h3 className="text-xl font-semibold text-cyan-900 mb-4">Standard Care</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">$17</p>
                <p className="text-gray-600 mb-4">per item</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Razor-sharp edge restoration</li>
                  <li>• Professional sharpening</li>
                  <li>• Quality guaranteed</li>
                </ul>
              </div>
              
              <div className="bg-cyan-600 text-white p-6 rounded-xl shadow-lg transform scale-105">
                <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold mb-4 inline-block">
                  Most Popular
                </div>
                <h3 className="text-xl font-semibold mb-4">Premium Care</h3>
                <p className="text-3xl font-bold mb-2">$22</p>
                <p className="opacity-90 mb-4">per item</p>
                <ul className="text-sm space-y-2">
                  <li>• Mirror polish finish</li>
                  <li>• Rust prevention coating</li>
                  <li>• Lasts 2x longer</li>
                  <li>• Perfect for coastal conditions</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200">
                <h3 className="text-xl font-semibold text-cyan-900 mb-4">Traditional Japanese</h3>
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
              What Ocean Shores Customers Say
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <p className="text-gray-700 mb-4">
                  "Perfect service for our Ocean Shores home. The mobile service is so convenient 
                  and they understand our coastal community needs. Professional results every time!"
                </p>
                <p className="font-semibold text-cyan-900">- Ocean Shores Resident</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <p className="text-gray-700 mb-4">
                  "Great service for our golf course kitchen. They come to us which means no downtime 
                  for our hospitality operations. Highly recommended for Ocean Shores businesses."
                </p>
                <p className="font-semibold text-cyan-900">- Ocean Shores Golf Course</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-cyan-600 text-white text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Sharpen Your Knives in Ocean Shores?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join Ocean Shores' residents and businesses who trust our mobile knife sharpening service
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/#booking"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Book Ocean Shores Service Now
              </Link>
              <Link 
                href="tel:+61451494922"
                className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
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
              Professional Mobile Knife Sharpening Service | Ocean Shores NSW 2483
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