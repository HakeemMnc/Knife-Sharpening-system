import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mobile Knife Sharpening Northern Rivers NSW | Expert Blade Service Ballina Byron Bay Tweed",
  description: "Professional mobile knife sharpening service in Northern Rivers NSW. Expert blade restoration in Ballina, Byron Bay, Tweed Heads. Book online today! Same-day service available.",
  keywords: "knife sharpening northern rivers, mobile knife sharpening NSW, blade sharpening ballina, knife service byron bay, tweed heads knife sharpening, professional blade restoration",
  authors: [{ name: "Northern Rivers Knife Sharpening" }],
  creator: "Northern Rivers Knife Sharpening",
  publisher: "Northern Rivers Knife Sharpening",
  robots: "index, follow",
  openGraph: {
    type: "website",
    title: "Mobile Knife Sharpening Northern Rivers NSW | Expert Blade Service",
    description: "Professional mobile knife sharpening service in Northern Rivers NSW. Expert blade restoration in Ballina, Byron Bay, Tweed Heads. Book online today!",
    url: "https://northernriversknifesharpening.com",
    siteName: "Northern Rivers Knife Sharpening",
    locale: "en_AU",
    images: [
      {
        url: "/knife-sharpening-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Professional knife sharpening service Northern Rivers NSW",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mobile Knife Sharpening Northern Rivers NSW",
    description: "Professional mobile knife sharpening service. Book online today!",
    images: ["/knife-sharpening-twitter-card.jpg"],
  },
  alternates: {
    canonical: "https://northernriversknifesharpening.com",
  },
  other: {
    "geo.region": "AU-NSW",
    "geo.placename": "Northern Rivers, NSW",
    "geo.position": "-28.5062;153.4350",
    "ICBM": "-28.5062, 153.4350",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Comic+Relief:wght@400;700&display=swap"
          rel="stylesheet"
        />
        
        {/* LocalBusiness Schema Markup - Critical for Local SEO */}
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "@id": "https://northernriversknifesharpening.com/#business",
              "name": "Northern Rivers Knife Sharpening",
              "description": "Professional mobile knife sharpening service in Northern Rivers NSW. Expert blade restoration with convenient on-site service.",
              "url": "https://northernriversknifesharpening.com",
              "telephone": "+61451494922",
              "email": "info@northernriversknifesharpening.com",
              "image": "https://northernriversknifesharpening.com/logo.png",
              "logo": "https://northernriversknifesharpening.com/logo.png",
              "address": {
                "@type": "PostalAddress",
                "addressRegion": "NSW",
                "addressCountry": "AU",
                "addressLocality": "Northern Rivers"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "-28.5062",
                "longitude": "153.4350"
              },
              "areaServed": [
                {
                  "@type": "PostalCodeArea",
                  "postalCode": "2477",
                  "addressRegion": "NSW",
                  "addressCountry": "AU"
                },
                {
                  "@type": "PostalCodeArea", 
                  "postalCode": "2478",
                  "addressRegion": "NSW",
                  "addressCountry": "AU"
                },
                {
                  "@type": "PostalCodeArea",
                  "postalCode": "2479", 
                  "addressRegion": "NSW",
                  "addressCountry": "AU"
                },
                {
                  "@type": "PostalCodeArea",
                  "postalCode": "2481",
                  "addressRegion": "NSW", 
                  "addressCountry": "AU"
                },
                {
                  "@type": "PostalCodeArea",
                  "postalCode": "2482",
                  "addressRegion": "NSW",
                  "addressCountry": "AU" 
                },
                {
                  "@type": "PostalCodeArea",
                  "postalCode": "2483",
                  "addressRegion": "NSW",
                  "addressCountry": "AU"
                },
                {
                  "@type": "PostalCodeArea",
                  "postalCode": "2489", 
                  "addressRegion": "NSW",
                  "addressCountry": "AU"
                }
              ],
              "serviceType": "Mobile Knife Sharpening Service",
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Knife Sharpening Services",
                "itemListElement": [
                  {
                    "@type": "OfferCatalog",
                    "name": "Standard Knife Sharpening",
                    "description": "Professional razor-sharp edge restoration",
                    "offers": {
                      "@type": "Offer",
                      "price": "17.00",
                      "priceCurrency": "AUD",
                      "availability": "https://schema.org/InStock"
                    }
                  },
                  {
                    "@type": "OfferCatalog", 
                    "name": "Premium Knife Care",
                    "description": "Mirror polish finish with rust prevention coating",
                    "offers": {
                      "@type": "Offer",
                      "price": "22.00",
                      "priceCurrency": "AUD", 
                      "availability": "https://schema.org/InStock"
                    }
                  },
                  {
                    "@type": "OfferCatalog",
                    "name": "Traditional Japanese Sharpening",
                    "description": "4-stone progression with leather strop finishing",
                    "offers": {
                      "@type": "Offer",
                      "price": "27.00", 
                      "priceCurrency": "AUD",
                      "availability": "https://schema.org/InStock"
                    }
                  }
                ]
              },
              "priceRange": "$17-$27",
              "paymentAccepted": "Credit Card, Debit Card, Online Payment",
              "currenciesAccepted": "AUD",
              "openingHours": [
                "Mo-Fr 08:00-17:00",
                "Sa 08:00-15:00"
              ],
              "sameAs": [
                "https://facebook.com/northernriversknifesharpening",
                "https://www.instagram.com/northernriversknifesharpening",
                "https://northernriversknifesharpening.com"
              ],
              "founder": {
                "@type": "Person",
                "name": "Hakeem Manco",
                "jobTitle": "Professional Knife Sharpening Specialist",
                "worksFor": {
                  "@type": "Organization", 
                  "name": "Northern Rivers Knife Sharpening"
                }
              },
              "knowsAbout": [
                "Professional Knife Sharpening",
                "Blade Restoration",
                "Kitchen Knife Maintenance", 
                "Japanese Sharpening Techniques",
                "Garden Tool Sharpening",
                "Commercial Kitchen Services"
              ],
              "naics": "811490",
              "isicV4": "9529",
              "vatID": "ABN 61 217 603 910",
              "duns": "",
              "legalName": "Northern Rivers Knife Sharpening",
              "slogan": "Professional Mobile Blade Restoration",
              "brand": {
                "@type": "Brand",
                "name": "Northern Rivers Knife Sharpening",
                "logo": "https://northernriversknifesharpening.com/logo.png"
              },
              "hasCredential": [
                {
                  "@type": "EducationalOccupationalCredential",
                  "credentialCategory": "Professional Certification",
                  "name": "Professional Knife Sharpening Certification"
                }
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "12",
                "bestRating": "5"
              }
            })
          }}
        />

        {/* Enhanced Service Schema for Mobile Service */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "name": "Mobile Knife Sharpening Service",
              "description": "Professional mobile knife and blade sharpening service covering Northern Rivers NSW with same-day service availability",
              "provider": {
                "@type": "LocalBusiness",
                "name": "Northern Rivers Knife Sharpening",
                "@id": "https://northernriversknifesharpening.com/#business",
                "founder": {
                  "@type": "Person",
                  "name": "Hakeem Manco"
                }
              },
              "serviceType": [
                "Mobile Knife Sharpening",
                "Professional Blade Restoration", 
                "Kitchen Tool Maintenance",
                "Garden Tool Sharpening"
              ],
              "category": [
                "Knife Sharpening Service",
                "Mobile Service",
                "Blade Restoration",
                "Kitchen Equipment Maintenance"
              ],
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Comprehensive Mobile Sharpening Services",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Kitchen Knife Sharpening",
                      "description": "Professional restoration of kitchen knives, chef knives, and culinary tools"
                    },
                    "price": "20.00",
                    "priceCurrency": "AUD",
                    "availability": "https://schema.org/InStock"
                  },
                  {
                    "@type": "Offer", 
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Garden Tool Sharpening",
                      "description": "Sharpening service for garden shears, pruning tools, and outdoor equipment"
                    },
                    "price": "20.00",
                    "priceCurrency": "AUD",
                    "availability": "https://schema.org/InStock"
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service", 
                      "name": "Scissors Sharpening",
                      "description": "Professional sharpening for household and professional scissors"
                    },
                    "price": "20.00",
                    "priceCurrency": "AUD",
                    "availability": "https://schema.org/InStock"
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Premium Knife Care Service",
                      "description": "Mirror polish finish with rust prevention coating for superior blade maintenance"
                    },
                    "price": "22.00",
                    "priceCurrency": "AUD",
                    "availability": "https://schema.org/InStock"
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Traditional Japanese Sharpening",
                      "description": "4-stone progression with leather strop finishing using traditional Japanese techniques"
                    },
                    "price": "27.00",
                    "priceCurrency": "AUD",
                    "availability": "https://schema.org/InStock"
                  }
                ]
              },
              "areaServed": [
                {
                  "@type": "PostalCodeArea",
                  "postalCode": "2477",
                  "addressRegion": "NSW",
                  "addressCountry": "AU",
                  "containsPlace": {
                    "@type": "City",
                    "name": "Tweed Heads"
                  }
                },
                {
                  "@type": "PostalCodeArea",
                  "postalCode": "2478",
                  "addressRegion": "NSW", 
                  "addressCountry": "AU",
                  "containsPlace": {
                    "@type": "City",
                    "name": "Alstonville"
                  }
                },
                {
                  "@type": "PostalCodeArea",
                  "postalCode": "2480",
                  "addressRegion": "NSW",
                  "addressCountry": "AU",
                  "containsPlace": {
                    "@type": "City",
                    "name": "Ballina"
                  }
                },
                {
                  "@type": "PostalCodeArea",
                  "postalCode": "2481",
                  "addressRegion": "NSW",
                  "addressCountry": "AU",
                  "containsPlace": {
                    "@type": "City",
                    "name": "Byron Bay"
                  }
                },
                {
                  "@type": "PostalCodeArea",
                  "postalCode": "2482",
                  "addressRegion": "NSW",
                  "addressCountry": "AU",
                  "containsPlace": {
                    "@type": "City",
                    "name": "Mullumbimby"
                  }
                },
                {
                  "@type": "PostalCodeArea",
                  "postalCode": "2483",
                  "addressRegion": "NSW",
                  "addressCountry": "AU",
                  "containsPlace": {
                    "@type": "City",
                    "name": "Brunswick Heads"
                  }
                },
                {
                  "@type": "PostalCodeArea",
                  "postalCode": "2489",
                  "addressRegion": "NSW",
                  "addressCountry": "AU",
                  "containsPlace": {
                    "@type": "City",
                    "name": "Pottsville"
                  }
                }
              ],
              "audience": {
                "@type": "Audience",
                "audienceType": [
                  "Restaurants",
                  "Commercial Kitchens", 
                  "Home Cooks",
                  "Chefs",
                  "Gardening Enthusiasts"
                ]
              },
              "availableChannel": {
                "@type": "ServiceChannel",
                "serviceType": "Mobile Service",
                "availableLanguage": "English"
              }
            })
          }}
        />

        {/* Meta Pixel Code - 2025 Optimized Implementation */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');

              // Initialize Meta Pixel with advanced configuration
              fbq('init', '812571684456581', {
                external_id: 'northern_rivers_knife_sharpening'
              });

              // Track PageView with enhanced data
              fbq('track', 'PageView', {
                content_name: 'Northern Rivers Knife Sharpening',
                content_category: 'mobile_knife_sharpening_service'
              });

              // Set up advanced matching for better attribution
              fbq('init', '812571684456581', {}, {
                "agent": "plNextjs"
              });
            `
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{display: 'none'}}
            src="https://www.facebook.com/tr?id=812571684456581&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        {/* Google Maps script temporarily removed for debugging
        <script
          dangerouslySetInnerHTML={{
            __html: `window.initMap = function() {
              console.log('Google Maps loaded successfully');
              window.googleMapsLoaded = true;
              if (window.onGoogleMapsLoad) window.onGoogleMapsLoad();
            }`
          }}
        />
        <script
          async
          defer
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry&callback=initMap`}
        ></script>
        */}
      </head>
      <body className="antialiased" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
