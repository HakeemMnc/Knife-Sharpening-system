import type { Metadata } from "next";
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Mobile Knife Sharpening Byron Bay NSW 2481 | Professional Blade Service | Same Day",
  description: "Professional mobile knife sharpening service in Byron Bay NSW. Expert blade restoration for restaurants, cafes & homes. Book online today! Servicing 2481 postcode area.",
  keywords: "knife sharpening Byron Bay, mobile knife sharpening 2481, blade sharpening Byron Bay NSW, professional knife service Byron, chef knife sharpening Byron Bay, restaurant knife sharpening",
  openGraph: {
    title: "Mobile Knife Sharpening Byron Bay NSW | Professional Blade Service",
    description: "Professional mobile knife sharpening service in Byron Bay NSW. Expert blade restoration for restaurants, cafes & homes. Book online today!",
    url: "https://northernriversknifesharpening.com/knife-sharpening-byron-bay",
    images: [
      {
        url: "/knife-sharpening-byron-bay-og.jpg",
        width: 1200,
        height: 630,
        alt: "Professional knife sharpening service Byron Bay NSW 2481",
      },
    ],
  },
  alternates: {
    canonical: "https://northernriversknifesharpening.com/knife-sharpening-byron-bay",
  },
  other: {
    "geo.region": "AU-NSW",
    "geo.placename": "Byron Bay, NSW",
    "geo.position": "-28.6474;153.6020",
    "ICBM": "-28.6474, 153.6020",
  },
};

export default function ByronBayKnifeSharpeningPage() {
  return (
    <>
      {/* Local Business Schema for Byron Bay */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": "https://northernriversknifesharpening.com/knife-sharpening-byron-bay#business",
            "name": "Northern Rivers Knife Sharpening - Byron Bay",
            "description": "Professional mobile knife sharpening service in Byron Bay NSW 2481. Expert blade restoration for restaurants, cafes, and residential customers.",
            "url": "https://northernriversknifesharpening.com/knife-sharpening-byron-bay",
            "telephone": "+61451494922",
            "email": "info@northernriversknifesharpening.com",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Byron Bay",
              "addressRegion": "NSW",
              "postalCode": "2481",
              "addressCountry": "AU"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "-28.6474",
              "longitude": "153.6020"
            },
            "areaServed": {
              "@type": "City",
              "name": "Byron Bay",
              "@id": "https://www.wikidata.org/wiki/Q894287"
            },
            "serviceType": "Mobile Knife Sharpening Service",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Byron Bay Knife Sharpening Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Restaurant Knife Sharpening Byron Bay"
                  },
                  "price": "17.00",
                  "priceCurrency": "AUD",
                  "availability": "https://schema.org/InStock"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Home Kitchen Knife Sharpening Byron Bay"
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
              Professional Mobile Knife Sharpening in <span className="text-blue-600">Byron Bay NSW</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Expert blade restoration service for Byron Bay's restaurants, cafes, and homes. 
              Servicing postcode 2481 with same-day mobile service. Book online today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/#booking"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Book Byron Bay Service
              </Link>
              <Link 
                href="tel:+61451494922"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Call: 0451 494 922
              </Link>
            </div>
          </div>
        </section>

        {/* Byron Bay Specific Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Byron Bay Chooses Our Mobile Knife Sharpening Service
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-blue-900 mb-6">
                  Serving Byron Bay's Thriving Food Scene
                </h3>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Byron Bay's 25+ restaurants and cafes demand razor-sharp knives for their busy kitchens. 
                    From the bustling Byron Bay Markets to award-winning establishments, we keep your blades 
                    performing at their peak.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Convenient mobile service to your Byron Bay location</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Perfect for Byron's organic and wellness-focused food culture</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Supporting Byron Bay's sustainable dining movement</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Same-day service for urgent restaurant needs</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-50 p-8 rounded-xl">
                <h4 className="text-xl font-semibold text-blue-900 mb-4">
                  Popular Byron Bay Locations We Service:
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Byron Bay Town Center (main restaurant strip)</li>
                  <li>• Byron Bay Markets (1st Sunday monthly)</li>
                  <li>• Arts & Industry Estate commercial kitchens</li>
                  <li>• Residential homes throughout 2481 postcode</li>
                  <li>• Suffolk Park area (5km south)</li>
                  <li>• Byron Bay Industrial Estate</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Service Pricing Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Transparent Pricing for Byron Bay Knife Sharpening
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">Standard Care</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">$17</p>
                <p className="text-gray-600 mb-4">per item</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Razor-sharp edge restoration</li>
                  <li>• Professional sharpening</li>
                  <li>• Quality guaranteed</li>
                </ul>
              </div>
              
              <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg transform scale-105">
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
                  <li>• Restaurant quality</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
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
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              What Byron Bay Customers Say
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-gray-700 mb-4">
                  "Perfect service for our Byron Bay restaurant. The mobile service means we don't lose 
                  knives during busy periods. Professional results every time!"
                </p>
                <p className="font-semibold text-blue-900">- Local Byron Bay Restaurant</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-gray-700 mb-4">
                  "Love that they come to us in Byron Bay. Perfect for our home kitchen and they 
                  understand the local food culture here."
                </p>
                <p className="font-semibold text-blue-900">- Byron Bay Resident</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-600 text-white text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Sharpen Your Knives in Byron Bay?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join Byron Bay's top restaurants and home cooks who trust our mobile knife sharpening service
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/#booking"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Book Byron Bay Service Now
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
              Professional Mobile Knife Sharpening Service | Byron Bay NSW 2481
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