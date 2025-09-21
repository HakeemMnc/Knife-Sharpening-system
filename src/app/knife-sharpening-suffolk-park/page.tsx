import type { Metadata } from "next";
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Mobile Knife Sharpening Suffolk Park NSW 2481 | Residential Coastal Service | Byron Bay South",
  description: "Professional mobile knife sharpening service in Suffolk Park NSW. Expert blade restoration for coastal homes 5km south of Byron Bay. Book online today! Servicing 2481 postcode area.",
  keywords: "knife sharpening Suffolk Park, mobile knife sharpening 2481, Suffolk Park residential, Byron Bay South knife sharpening, coastal home knife service Suffolk Park NSW",
  openGraph: {
    title: "Mobile Knife Sharpening Suffolk Park NSW | Residential Coastal Professional Service",
    description: "Professional mobile knife sharpening service in Suffolk Park NSW. Expert blade restoration for coastal homes 5km south of Byron Bay. Book online today!",
    url: "https://northernriversknifesharpening.com/knife-sharpening-suffolk-park",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Professional knife sharpening service Suffolk Park NSW 2481",
      },
    ],
  },
  alternates: {
    canonical: "https://northernriversknifesharpening.com/knife-sharpening-suffolk-park",
  },
  other: {
    "geo.region": "AU-NSW",
    "geo.placename": "Suffolk Park, NSW",
    "geo.position": "-28.689;153.610",
    "ICBM": "-28.689, 153.610",
  },
};

export default function SuffolkParkKnifeSharpeningPage() {
  return (
    <>
      {/* Local Business Schema for Suffolk Park */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": "https://northernriversknifesharpening.com/knife-sharpening-suffolk-park#business",
            "name": "Northern Rivers Knife Sharpening - Suffolk Park",
            "description": "Professional mobile knife sharpening service in Suffolk Park NSW 2481. Expert blade restoration for residential coastal homes 5km south of Byron Bay.",
            "url": "https://northernriversknifesharpening.com/knife-sharpening-suffolk-park",
            "telephone": "+61451494922",
            "email": "info@northernriversknifesharpening.com",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Suffolk Park",
              "addressRegion": "NSW",
              "postalCode": "2481",
              "addressCountry": "AU"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "-28.689",
              "longitude": "153.610"
            },
            "areaServed": {
              "@type": "City",
              "name": "Suffolk Park",
              "@id": "https://www.wikidata.org/wiki/Q7634739"
            },
            "serviceType": "Mobile Knife Sharpening Service",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Suffolk Park Knife Sharpening Services",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Residential Home Knife Sharpening Suffolk Park"
                  },
                  "price": "20.00",
                  "priceCurrency": "AUD",
                  "availability": "https://schema.org/InStock"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Coastal Holiday Home Knife Service"
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
              Professional Mobile Knife Sharpening in <span className="text-teal-600">Suffolk Park NSW</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Expert blade restoration service for Suffolk Park's 4,222 residents. 
              Just 5km south of Byron Bay, we service this residential coastal destination in postcode 2481. Book online today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/#booking"
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Book Suffolk Park Service
              </Link>
              <Link 
                href="tel:+61451494922"
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Call: 0451 494 922
              </Link>
            </div>
          </div>
        </section>

        {/* Suffolk Park Specific Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Suffolk Park Chooses Our Mobile Knife Sharpening Service
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-teal-900 mb-6">
                  Serving Suffolk Park's Residential Coastal Community
                </h3>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Suffolk Park is a premier residential coastal destination just 5km south of Byron Bay. 
                    With 4,222 residents enjoying the relaxed coastal lifestyle, we provide convenient 
                    mobile knife sharpening to homes throughout this beautiful beachside community.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-cyan-500 mr-2">✓</span>
                      <span>Convenient mobile service to your Suffolk Park home</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-cyan-500 mr-2">✓</span>
                      <span>Perfect for coastal home kitchens and entertaining</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-cyan-500 mr-2">✓</span>
                      <span>Serving holiday homes and permanent residents</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-cyan-500 mr-2">✓</span>
                      <span>Same-day service for residential knife care</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-teal-50 p-8 rounded-xl">
                <h4 className="text-xl font-semibold text-teal-900 mb-4">
                  Popular Suffolk Park Areas We Service:
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Suffolk Park beachfront homes and properties</li>
                  <li>• Residential estates throughout Suffolk Park</li>
                  <li>• Holiday homes and coastal retreats</li>
                  <li>• Suffolk Park village center area</li>
                  <li>• Tallow Beach Road residential properties</li>
                  <li>• Broken Head Road coastal homes</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Coastal Lifestyle Section */}
        <section className="py-16 bg-gradient-to-r from-teal-50 to-cyan-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Coastal Home Knife Care in Suffolk Park
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">🏖️</div>
                <h3 className="text-xl font-semibold text-teal-900 mb-4">Beachfront Living</h3>
                <p className="text-gray-700">
                  Professional knife maintenance for Suffolk Park's beachfront 
                  homes and coastal lifestyle kitchens.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">🏡</div>
                <h3 className="text-xl font-semibold text-teal-900 mb-4">Residential Focus</h3>
                <p className="text-gray-700">
                  Mobile service designed for Suffolk Park's 4,222 residents 
                  and their home kitchen needs.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-4xl mb-4">🌊</div>
                <h3 className="text-xl font-semibold text-teal-900 mb-4">Byron Bay South</h3>
                <p className="text-gray-700">
                  Perfectly positioned 5km south of Byron Bay, serving 
                  this premium coastal residential destination.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Service Pricing Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Transparent Pricing for Suffolk Park Home Kitchens
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
                </ul>
              </div>
              
              <div className="bg-teal-600 text-white p-6 rounded-xl shadow-lg transform scale-105">
                <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold mb-4 inline-block">
                  Home Kitchen Favorite
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
                <h3 className="text-xl font-semibold text-teal-900 mb-4">Traditional Japanese</h3>
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
              What Suffolk Park Residents Say
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <p className="text-gray-700 mb-4">
                  "Perfect service for our Suffolk Park home. They come to us which is so convenient, 
                  and the quality is excellent. Great for our coastal kitchen needs!"
                </p>
                <p className="font-semibold text-teal-900">- Suffolk Park Resident</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <p className="text-gray-700 mb-4">
                  "Love the mobile service for our holiday home in Suffolk Park. Professional 
                  results and they understand the local coastal community perfectly."
                </p>
                <p className="font-semibold text-teal-900">- Suffolk Park Holiday Home Owner</p>
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
              <Link href="/knife-sharpening-lennox-head" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-center">
                <h3 className="font-semibold text-gray-900">Lennox Head</h3>
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
        <section className="py-16 bg-teal-600 text-white text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Sharpen Your Knives in Suffolk Park?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join Suffolk Park's coastal community who trust our professional mobile knife sharpening service
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/#booking"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Book Suffolk Park Service Now
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
              Professional Mobile Knife Sharpening Service | Suffolk Park NSW 2481
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