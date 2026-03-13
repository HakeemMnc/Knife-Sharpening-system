import type { Metadata } from "next";
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Mobile Knife Sharpening West Ballina NSW 2478 | Residential Area | Family Neighborhoods",
  description: "Professional mobile knife sharpening service in West Ballina NSW. Expert blade service for established residential families & local community. Book online today! Servicing 2478 postcode.",
  keywords: "knife sharpening West Ballina, mobile knife sharpening 2478, residential knife sharpening West Ballina, family neighborhood knife service, established Ballina suburbs",
  openGraph: {
    title: "Mobile Knife Sharpening West Ballina NSW | Residential Family Service",
    description: "Professional mobile knife sharpening service in West Ballina NSW. Expert blade service for established residential families & local community.",
    url: "https://northernriversknifesharpening.com/knife-sharpening-west-ballina",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Professional knife sharpening service West Ballina NSW 2478",
      },
    ],
  },
  alternates: {
    canonical: "https://northernriversknifesharpening.com/knife-sharpening-west-ballina",
  },
  other: {
    "geo.region": "AU-NSW",
    "geo.placename": "West Ballina, NSW",
    "geo.position": "-28.8747;153.5517",
    "ICBM": "-28.8747, 153.5517",
  },
};

export default function WestBallinaKnifeSharpeningPage() {
  return (
    <>
      {/* Local Business Schema for West Ballina */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": "https://northernriversknifesharpening.com/knife-sharpening-west-ballina#business",
            "name": "Northern Rivers Knife Sharpening - West Ballina",
            "description": "Professional mobile knife sharpening service in West Ballina NSW 2478. Expert blade restoration for established residential families and community households.",
            "url": "https://northernriversknifesharpening.com/knife-sharpening-west-ballina",
            "telephone": "+61451494922",
            "email": "info@northernriversknifesharpening.com",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "West Ballina",
              "addressRegion": "NSW",
              "postalCode": "2478",
              "addressCountry": "AU"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "-28.8747",
              "longitude": "153.5517"
            },
            "areaServed": {
              "@type": "Place",
              "name": "West Ballina",
              "containedInPlace": {
                "@type": "City",
                "name": "Ballina"
              }
            },
            "serviceType": "Residential Family Mobile Knife Sharpening",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "West Ballina Residential Knife Sharpening Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Family Home Kitchen Knife Sharpening West Ballina"
                  },
                  "price": "20.00",
                  "priceCurrency": "AUD",
                  "availability": "https://schema.org/InStock"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Residential Community Knife Service West Ballina"
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

      <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
        {/* Header Section */}
        <header className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-teal-900">
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
              Professional Mobile Knife Sharpening in <span className="text-teal-600">West Ballina NSW</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Expert blade restoration for West Ballina&apos;s established residential community and family neighborhoods. 
              Convenient mobile service for the 3,023 residents of greater Ballina&apos;s western suburbs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/#booking"
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Book West Ballina Service
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

        {/* West Ballina Specific Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why West Ballina Families Choose Our Mobile Service
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-teal-900 mb-6">
                  Serving West Ballina&apos;s Established Residential Community
                </h3>
                <div className="space-y-4 text-gray-700">
                  <p>
                    West Ballina&apos;s 3,023 residents enjoy an established, family-friendly community atmosphere. 
                    As an integral part of greater Ballina, we provide reliable knife sharpening services 
                    that fit seamlessly into busy family life and residential routines.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Convenient at-home service for busy families</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Perfect for West Ballina&apos;s established neighborhoods</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Flexible scheduling for family-friendly timing</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Supporting the local residential community</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-teal-50 p-8 rounded-xl">
                <h4 className="text-xl font-semibold text-teal-900 mb-4">
                  West Ballina Areas We Service:
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Established family neighborhoods</li>
                  <li>• Residential streets throughout West Ballina</li>
                  <li>• Local community centers and facilities</li>
                  <li>• Family homes across 2478 postcode</li>
                  <li>• Suburban residential estates</li>
                  <li>• Quiet residential pockets of greater Ballina</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Residential Community Focus Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Family-Friendly Service for West Ballina&apos;s Residential Community
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
                <h3 className="text-xl font-semibold text-teal-900 mb-4">Family Households</h3>
                <p className="text-gray-700">
                  Mobile knife sharpening designed for busy family life in West Ballina&apos;s 
                  established residential neighborhoods and family-friendly community.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-teal-900 mb-4">Established Neighborhoods</h3>
                <p className="text-gray-700">
                  Reliable service for West Ballina&apos;s mature residential areas, 
                  supporting the established community&apos;s home cooking needs.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold text-teal-900 mb-4">Community Focus</h3>
                <p className="text-gray-700">
                  Personalized service that understands West Ballina&apos;s community values 
                  and residential lifestyle preferences.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Service Pricing Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Family-Friendly Pricing for West Ballina Knife Sharpening
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200">
                <h3 className="text-xl font-semibold text-teal-900 mb-4">Standard Care</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">$20</p>
                <p className="text-gray-600 mb-4">per item</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Razor-sharp edge restoration</li>
                  <li>• Professional sharpening</li>
                  <li>• Quality guaranteed</li>
                  <li>• Perfect for family kitchens</li>
                </ul>
              </div>
              
              <div className="bg-teal-600 text-white p-6 rounded-xl shadow-lg transform scale-105">
                <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold mb-4 inline-block">
                  Family Favorite
                </div>
                <h3 className="text-xl font-semibold mb-4">Premium Care</h3>
                <p className="text-3xl font-bold mb-2">$22</p>
                <p className="opacity-90 mb-4">per item</p>
                <ul className="text-sm space-y-2">
                  <li>• Mirror polish finish</li>
                  <li>• Rust prevention coating</li>
                  <li>• Lasts 2x longer</li>
                  <li>• Family kitchen quality</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200">
                <h3 className="text-xl font-semibold text-teal-900 mb-4">Traditional Japanese</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">$27</p>
                <p className="text-gray-600 mb-4">per item</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• 4-stone progression</li>
                  <li>• Leather strop finishing</li>
                  <li>• Ultimate edge quality</li>
                  <li>• Premium family grade</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Local Testimonials */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              What West Ballina Families Say
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <p className="text-gray-700 mb-4">
                  &quot;Perfect service for our West Ballina family home. The mobile convenience 
                  means we don&apos;t have to disrupt our routine. Great quality and reliable!&quot;
                </p>
                <p className="font-semibold text-teal-900">- West Ballina Family</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <p className="text-gray-700 mb-4">
                  &quot;Love the family-friendly approach and flexible scheduling. They understand 
                  our established neighborhood and deliver exactly what we need.&quot;
                </p>
                <p className="font-semibold text-teal-900">- West Ballina Resident</p>
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
        <section className="py-16 bg-teal-600 text-white text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">
              Ready for Family-Friendly Knife Sharpening in West Ballina?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join West Ballina&apos;s established residential community who trust our mobile service
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/#booking"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Book West Ballina Service Now
              </Link>
              <Link 
                href="tel:+61451494922"
                className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
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
              Professional Mobile Knife Sharpening Service | West Ballina NSW 2478
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