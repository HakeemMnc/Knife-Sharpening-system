import type { Metadata } from "next";
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Mobile Knife Sharpening Mullumbimby NSW 2482 | Professional Blade Service | Biggest Little Town",
  description: "Professional mobile knife sharpening service in Mullumbimby NSW 2482. Expert blade restoration for restaurants, cafes & homes. Servicing the Biggest Little Town with same-day service!",
  keywords: "knife sharpening Mullumbimby, mobile knife sharpening 2482, blade sharpening Mullumbimby NSW, professional knife service Mullumbimby, chef knife sharpening Mullumbimby, farmers market knife service",
  openGraph: {
    title: "Mobile Knife Sharpening Mullumbimby NSW | Professional Blade Service",
    description: "Professional mobile knife sharpening service in Mullumbimby NSW 2482. Expert blade restoration for restaurants, cafes & homes. Servicing the Biggest Little Town!",
    url: "https://northernriversknifesharpening.com/knife-sharpening-mullumbimby",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Professional knife sharpening service Mullumbimby NSW 2482",
      },
    ],
  },
  alternates: {
    canonical: "https://northernriversknifesharpening.com/knife-sharpening-mullumbimby",
  },
  other: {
    "geo.region": "AU-NSW",
    "geo.placename": "Mullumbimby, NSW",
    "geo.position": "-28.5536;153.4969",
    "ICBM": "-28.5536, 153.4969",
  },
};

export default function MullumbimbyKnifeSharpeningPage() {
  return (
    <>
      {/* Local Business Schema for Mullumbimby */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": "https://northernriversknifesharpening.com/knife-sharpening-mullumbimby#business",
            "name": "Northern Rivers Knife Sharpening - Mullumbimby",
            "description": "Professional mobile knife sharpening service in Mullumbimby NSW 2482. Expert blade restoration for the Biggest Little Town's restaurants, cafes, and residential customers.",
            "url": "https://northernriversknifesharpening.com/knife-sharpening-mullumbimby",
            "telephone": "+61451494922",
            "email": "info@northernriversknifesharpening.com",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Mullumbimby",
              "addressRegion": "NSW",
              "postalCode": "2482",
              "addressCountry": "AU"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "-28.5536",
              "longitude": "153.4969"
            },
            "areaServed": {
              "@type": "City",
              "name": "Mullumbimby",
              "@id": "https://www.wikidata.org/wiki/Q2435892"
            },
            "serviceType": "Mobile Knife Sharpening Service",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Mullumbimby Knife Sharpening Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Restaurant Knife Sharpening Mullumbimby"
                  },
                  "price": "20.00",
                  "priceCurrency": "AUD",
                  "availability": "https://schema.org/InStock"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Farmers Market Knife Sharpening Mullumbimby"
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

      {/* Breadcrumb Schema for Mullumbimby */}
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
                "name": "Mullumbimby",
                "item": "https://northernriversknifesharpening.com/knife-sharpening-mullumbimby"
              }
            ]
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
              Professional Mobile Knife Sharpening in <span className="text-purple-600">Mullumbimby NSW</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Expert blade restoration service for Mullumbimby's vibrant food scene. 
              Servicing the "Biggest Little Town" postcode 2482 with same-day mobile service. Book online today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/#booking"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Book Mullumbimby Service
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

        {/* Mullumbimby Specific Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Mullumbimby's Counter-Culture Food Scene Chooses Our Service
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-purple-900 mb-6">
                  Serving the Biggest Little Town's Unique Food Culture
                </h3>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Mullumbimby's 4,180 residents support a thriving counter-culture food scene with organic cafes, 
                    artisan restaurants, and the famous weekly farmers market. We keep your blades razor-sharp 
                    for all your culinary adventures.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Convenient mobile service throughout Mullumbimby 2482</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Perfect for organic and sustainable food preparation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Supporting Mullumbimby's local food movement</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Same-day service for farmers market vendors</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-purple-50 p-8 rounded-xl">
                <h4 className="text-xl font-semibold text-purple-900 mb-4">
                  Popular Mullumbimby Locations We Service:
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Mullumbimby Town Center (Burringbar Street)</li>
                  <li>• Weekly Farmers Market (Thursday mornings)</li>
                  <li>• Counter-culture cafes and organic restaurants</li>
                  <li>• Residential homes throughout 2482 postcode</li>
                  <li>• Artisan food producers and home kitchens</li>
                  <li>• Community gardens and food cooperatives</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Service Pricing Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Transparent Pricing for Mullumbimby Knife Sharpening
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-purple-900 mb-4">Standard Care</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">$20</p>
                <p className="text-gray-600 mb-4">per item</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Razor-sharp edge restoration</li>
                  <li>• Professional sharpening</li>
                  <li>• Quality guaranteed</li>
                </ul>
              </div>
              
              <div className="bg-purple-600 text-white p-6 rounded-xl shadow-lg transform scale-105">
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
                <h3 className="text-xl font-semibold text-purple-900 mb-4">Traditional Japanese</h3>
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
              What Mullumbimby Customers Say
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-gray-700 mb-4">
                  "Perfect service for our organic cafe in Mullumbimby. The mobile service is so convenient 
                  and they really understand our commitment to quality food preparation!"
                </p>
                <p className="font-semibold text-purple-900">- Local Mullumbimby Cafe</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-gray-700 mb-4">
                  "Love that they come to us in the Biggest Little Town. Perfect for our home kitchen 
                  and they support our local food culture beautifully."
                </p>
                <p className="font-semibold text-purple-900">- Mullumbimby Resident</p>
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
              <Link href="/knife-sharpening-brunswick-heads" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center">
                <h3 className="font-semibold text-gray-900">Brunswick Heads</h3>
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
        <section className="py-16 bg-purple-600 text-white text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Sharpen Your Knives in Mullumbimby?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join Mullumbimby's organic cafes and home cooks who trust our mobile knife sharpening service
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/#booking"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Book Mullumbimby Service Now
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
              Professional Mobile Knife Sharpening Service | Mullumbimby NSW 2482
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