import type { Metadata } from "next";
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Mobile Knife Sharpening East Ballina NSW 2478 | Professional Area | Residential Suburb",
  description: "Professional mobile knife sharpening service in East Ballina NSW. Expert blade service for professional residences & local businesses. Book online today! Servicing 2478 postcode area.",
  keywords: "knife sharpening East Ballina, mobile knife sharpening 2478, blade sharpening East Ballina NSW, professional area knife service, residential knife sharpening Ballina",
  openGraph: {
    title: "Mobile Knife Sharpening East Ballina NSW | Professional Residential Service",
    description: "Professional mobile knife sharpening service in East Ballina NSW. Expert blade service for professional residences & local businesses.",
    url: "https://northernriversknifesharpening.com/knife-sharpening-east-ballina",
    images: [
      {
        url: "/knife-sharpening-east-ballina-og.jpg",
        width: 1200,
        height: 630,
        alt: "Professional knife sharpening service East Ballina NSW 2478",
      },
    ],
  },
  alternates: {
    canonical: "https://northernriversknifesharpening.com/knife-sharpening-east-ballina",
  },
  other: {
    "geo.region": "AU-NSW",
    "geo.placename": "East Ballina, NSW",
    "geo.position": "-28.8547;153.5798",
    "ICBM": "-28.8547, 153.5798",
  },
};

export default function EastBallinaKnifeSharpeningPage() {
  return (
    <>
      {/* Local Business Schema for East Ballina */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": "https://northernriversknifesharpening.com/knife-sharpening-east-ballina#business",
            "name": "Northern Rivers Knife Sharpening - East Ballina",
            "description": "Professional mobile knife sharpening service in East Ballina NSW 2478. Expert blade restoration for professional residential areas and local business establishments.",
            "url": "https://northernriversknifesharpening.com/knife-sharpening-east-ballina",
            "telephone": "+61451494922",
            "email": "info@northernriversknifesharpening.com",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "East Ballina",
              "addressRegion": "NSW",
              "postalCode": "2478",
              "addressCountry": "AU"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "-28.8547",
              "longitude": "153.5798"
            },
            "areaServed": {
              "@type": "Place",
              "name": "East Ballina",
              "containedInPlace": {
                "@type": "City",
                "name": "Ballina"
              }
            },
            "serviceType": "Professional Residential Mobile Knife Sharpening",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "East Ballina Professional Knife Sharpening Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Professional Home Kitchen Knife Sharpening East Ballina"
                  },
                  "price": "17.00",
                  "priceCurrency": "AUD",
                  "availability": "https://schema.org/InStock"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Local Business Knife Service East Ballina"
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

      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        {/* Header Section */}
        <header className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-purple-900">
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
              Professional Mobile Knife Sharpening in <span className="text-purple-600">East Ballina NSW</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Expert blade restoration for East Ballina's professional residential community and local businesses. 
              Servicing the established 2478 postcode area with premium mobile service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/#booking"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Book East Ballina Service
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

        {/* East Ballina Specific Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why East Ballina's Professional Community Chooses Our Service
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-purple-900 mb-6">
                  Serving East Ballina's Professional Residential Area
                </h3>
                <div className="space-y-4 text-gray-700">
                  <p>
                    East Ballina's 5,882 residents enjoy a professional, established community atmosphere. 
                    As a key residential suburb of greater Ballina, we provide premium knife sharpening 
                    services that match the area's quality standards.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Convenient mobile service to professional residences</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Perfect for East Ballina's quality-focused community</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Supporting local businesses and professional kitchens</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Flexible scheduling for busy professionals</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-purple-50 p-8 rounded-xl">
                <h4 className="text-xl font-semibold text-purple-900 mb-4">
                  East Ballina Areas We Service:
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Professional residential estates</li>
                  <li>• Local business establishments</li>
                  <li>• East Ballina community centers</li>
                  <li>• Professional home kitchens throughout 2478</li>
                  <li>• Small commercial food operations</li>
                  <li>• Established neighborhood areas</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Professional Community Focus Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Professional Service for East Ballina's Quality Community
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">🏘️</div>
                <h3 className="text-xl font-semibold text-purple-900 mb-4">Professional Residences</h3>
                <p className="text-gray-700">
                  Mobile knife sharpening service perfectly suited for East Ballina's 
                  professional residential community and quality home kitchens.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">💼</div>
                <h3 className="text-xl font-semibold text-purple-900 mb-4">Local Business Support</h3>
                <p className="text-gray-700">
                  Specialized service for East Ballina's local businesses, small commercial 
                  operations, and professional food establishments.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">⭐</div>
                <h3 className="text-xl font-semibold text-purple-900 mb-4">Quality Standards</h3>
                <p className="text-gray-700">
                  Premium service quality that matches East Ballina's established 
                  community standards and professional expectations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Service Pricing Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Professional Pricing for East Ballina Knife Sharpening
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200">
                <h3 className="text-xl font-semibold text-purple-900 mb-4">Standard Care</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">$17</p>
                <p className="text-gray-600 mb-4">per item</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Razor-sharp edge restoration</li>
                  <li>• Professional sharpening</li>
                  <li>• Quality guaranteed</li>
                  <li>• Perfect for home kitchens</li>
                </ul>
              </div>
              
              <div className="bg-purple-600 text-white p-6 rounded-xl shadow-lg transform scale-105">
                <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold mb-4 inline-block">
                  Professional Choice
                </div>
                <h3 className="text-xl font-semibold mb-4">Premium Care</h3>
                <p className="text-3xl font-bold mb-2">$22</p>
                <p className="opacity-90 mb-4">per item</p>
                <ul className="text-sm space-y-2">
                  <li>• Mirror polish finish</li>
                  <li>• Rust prevention coating</li>
                  <li>• Lasts 2x longer</li>
                  <li>• Professional quality</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200">
                <h3 className="text-xl font-semibold text-purple-900 mb-4">Traditional Japanese</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">$27</p>
                <p className="text-gray-600 mb-4">per item</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• 4-stone progression</li>
                  <li>• Leather strop finishing</li>
                  <li>• Ultimate edge quality</li>
                  <li>• Premium professional grade</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Local Testimonials */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              What East Ballina Customers Say
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <p className="text-gray-700 mb-4">
                  "Perfect professional service for our East Ballina home. The mobile convenience 
                  fits our busy lifestyle and the quality matches our expectations."
                </p>
                <p className="font-semibold text-purple-900">- East Ballina Professional Resident</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <p className="text-gray-700 mb-4">
                  "Excellent service for our local business in East Ballina. Professional, 
                  reliable, and they understand the community's quality standards."
                </p>
                <p className="font-semibold text-purple-900">- East Ballina Business Owner</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-purple-600 text-white text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">
              Ready for Professional Knife Sharpening in East Ballina?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join East Ballina's professional community who trust our mobile knife sharpening service
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/#booking"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Book East Ballina Service Now
              </Link>
              <Link 
                href="tel:+61451494922"
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
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
              Professional Mobile Knife Sharpening Service | East Ballina NSW 2478
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