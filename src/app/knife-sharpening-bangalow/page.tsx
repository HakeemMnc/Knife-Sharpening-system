import type { Metadata } from "next";
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Mobile Knife Sharpening Bangalow NSW 2479 | Professional Blade Service | Heritage Town",
  description: "Professional mobile knife sharpening service in Bangalow NSW 2479. Expert blade restoration for heritage boutique town restaurants, cafes & homes. Saturday farmers market service!",
  keywords: "knife sharpening Bangalow, mobile knife sharpening 2479, blade sharpening Bangalow NSW, professional knife service Bangalow, boutique restaurant knife sharpening, farmers market knife service",
  openGraph: {
    title: "Mobile Knife Sharpening Bangalow NSW | Professional Blade Service",
    description: "Professional mobile knife sharpening service in Bangalow NSW 2479. Expert blade restoration for heritage boutique town restaurants, cafes & homes.",
    url: "https://northernriversknifesharpening.com/knife-sharpening-bangalow",
    images: [
      {
        url: "/knife-sharpening-bangalow-og.jpg",
        width: 1200,
        height: 630,
        alt: "Professional knife sharpening service Bangalow NSW 2479",
      },
    ],
  },
  alternates: {
    canonical: "https://northernriversknifesharpening.com/knife-sharpening-bangalow",
  },
  other: {
    "geo.region": "AU-NSW",
    "geo.placename": "Bangalow, NSW",
    "geo.position": "-28.6872;153.5215",
    "ICBM": "-28.6872, 153.5215",
  },
};

export default function BangalowKnifeSharpeningPage() {
  return (
    <>
      {/* Local Business Schema for Bangalow */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": "https://northernriversknifesharpening.com/knife-sharpening-bangalow#business",
            "name": "Northern Rivers Knife Sharpening - Bangalow",
            "description": "Professional mobile knife sharpening service in Bangalow NSW 2479. Expert blade restoration for heritage boutique town restaurants, cafes, and residential customers.",
            "url": "https://northernriversknifesharpening.com/knife-sharpening-bangalow",
            "telephone": "+61451494922",
            "email": "info@northernriversknifesharpening.com",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Bangalow",
              "addressRegion": "NSW",
              "postalCode": "2479",
              "addressCountry": "AU"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "-28.6872",
              "longitude": "153.5215"
            },
            "areaServed": {
              "@type": "City",
              "name": "Bangalow",
              "@id": "https://www.wikidata.org/wiki/Q2411983"
            },
            "serviceType": "Mobile Knife Sharpening Service",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Bangalow Knife Sharpening Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Boutique Restaurant Knife Sharpening Bangalow"
                  },
                  "price": "17.00",
                  "priceCurrency": "AUD",
                  "availability": "https://schema.org/InStock"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Heritage Cafe Knife Sharpening Bangalow"
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

      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        {/* Header Section */}
        <header className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-amber-900">
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
              Professional Mobile Knife Sharpening in <span className="text-amber-600">Bangalow NSW</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Expert blade restoration service for Bangalow's heritage boutique restaurants and cafes. 
              Servicing postcode 2479 with same-day mobile service. Perfect for Sample Food Festival venues!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/#booking"
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Book Bangalow Service
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

        {/* Bangalow Specific Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Bangalow's Heritage Food Scene Chooses Our Service
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-amber-900 mb-6">
                  Serving Bangalow's Boutique Heritage Restaurant Scene
                </h3>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Bangalow's 2,021 residents support an exceptional heritage boutique food scene featuring 
                    award-winning restaurants, artisan cafes, and the renowned Saturday farmers market. 
                    Our mobile service ensures your blades are always festival-ready.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Convenient mobile service throughout Bangalow 2479</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Perfect for boutique restaurants and heritage cafes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Supporting Sample Food Festival participating venues</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Same-day service for farmers market vendors</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-amber-50 p-8 rounded-xl">
                <h4 className="text-xl font-semibold text-amber-900 mb-4">
                  Popular Bangalow Locations We Service:
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Heritage Byron Street restaurant precinct</li>
                  <li>• Saturday Farmers Market (weekly)</li>
                  <li>• Sample Food Festival participating venues</li>
                  <li>• Boutique cafes and artisan food producers</li>
                  <li>• Residential homes throughout 2479 postcode</li>
                  <li>• Heritage buildings converted to dining spaces</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Service Pricing Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Transparent Pricing for Bangalow Knife Sharpening
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-amber-900 mb-4">Standard Care</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">$17</p>
                <p className="text-gray-600 mb-4">per item</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Razor-sharp edge restoration</li>
                  <li>• Professional sharpening</li>
                  <li>• Quality guaranteed</li>
                </ul>
              </div>
              
              <div className="bg-amber-600 text-white p-6 rounded-xl shadow-lg transform scale-105">
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
                <h3 className="text-xl font-semibold text-amber-900 mb-4">Traditional Japanese</h3>
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
              What Bangalow Customers Say
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-gray-700 mb-4">
                  "Exceptional service for our heritage restaurant in Bangalow. The mobile service is perfect 
                  for our boutique operation and they understand fine dining knife requirements!"
                </p>
                <p className="font-semibold text-amber-900">- Local Bangalow Restaurant</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-gray-700 mb-4">
                  "Love that they come to us in beautiful Bangalow. Perfect for our heritage home kitchen 
                  and they always deliver before the Saturday markets."
                </p>
                <p className="font-semibold text-amber-900">- Bangalow Resident</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-amber-600 text-white text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Sharpen Your Knives in Bangalow?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join Bangalow's boutique restaurants and heritage cafes who trust our mobile knife sharpening service
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/#booking"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Book Bangalow Service Now
              </Link>
              <Link 
                href="tel:+61451494922"
                className="bg-white text-amber-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
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
              Professional Mobile Knife Sharpening Service | Bangalow NSW 2479
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