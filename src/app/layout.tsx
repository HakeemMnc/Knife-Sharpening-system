import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mobile Knife Sharpening Northern Rivers NSW | Expert Blade Service Ballina Byron Bay Tweed",
  description: "Professional mobile knife sharpening service in Northern Rivers NSW. Expert blade restoration in Ballina, Byron Bay, Tweed Heads. Book online today! Same-day service available.",
  keywords: "knife sharpening northern rivers, mobile knife sharpening NSW, blade sharpening ballina, knife service byron bay, tweed heads knife sharpening, professional blade restoration",
  authors: [{ name: "Northern Rivers Knife Sharpening" }],
  creator: "Northern Rivers Knife Sharpening",
  publisher: "Northern Rivers Knife Sharpening",
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" }
  ],
  openGraph: {
    type: "website",
    title: "Mobile Knife Sharpening Northern Rivers NSW | Expert Blade Service",
    description: "Professional mobile knife sharpening service in Northern Rivers NSW. Expert blade restoration in Ballina, Byron Bay, Tweed Heads. Book online today! Same-day service available.",
    url: "https://northernriversknifesharpening.com",
    siteName: "Northern Rivers Knife Sharpening",
    locale: "en_AU",
    images: [
      {
        url: "https://northernriversknifesharpening.com/knife-sharpening-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Professional knife sharpening service Northern Rivers NSW - Expert blade restoration",
        type: "image/jpeg",
      },
    ],
    countryName: "Australia",
    emails: ["info@northernriversknifesharpening.com"],
    phoneNumbers: ["+61451494922"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@NorthernRiversKnife",
    creator: "@NorthernRiversKnife",
    title: "Mobile Knife Sharpening Northern Rivers NSW | Expert Blade Service",
    description: "Professional mobile knife sharpening service in Northern Rivers NSW. Expert blade restoration with same-day service. Book online today!",
    images: {
      url: "https://northernriversknifesharpening.com/knife-sharpening-twitter-card.jpg",
      alt: "Professional knife sharpening service Northern Rivers NSW",
      width: 1200,
      height: 630,
    },
  },
  alternates: {
    canonical: "https://northernriversknifesharpening.com",
    languages: {
      "en-AU": "https://northernriversknifesharpening.com",
      "en": "https://northernriversknifesharpening.com",
    },
  },
  verification: {
    google: "google-site-verification-placeholder-12345",
    other: {
      "msvalidate.01": "bing-verification-placeholder-67890",
    },
  },
  other: {
    "geo.region": "AU-NSW",
    "geo.placename": "Northern Rivers, NSW",
    "geo.position": "-28.5062;153.4350",
    "ICBM": "-28.5062, 153.4350",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Northern Rivers Knife Sharpening",
    "application-name": "Northern Rivers Knife Sharpening",
    "format-detection": "telephone=yes",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU">
      <head>
        {/* Performance Optimization - Critical Resource Hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="https://www.facebook.com" />
        <link rel="dns-prefetch" href="https://maps.googleapis.com" />
        
        <link
          href="https://fonts.googleapis.com/css2?family=Comic+Relief:wght@400;700&display=swap"
          rel="stylesheet"
        />
        
        {/* Google Analytics 4 (GA4) Implementation */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              
              // Enhanced GA4 Configuration
              gtag('config', 'G-XXXXXXXXXX', {
                page_title: 'Northern Rivers Knife Sharpening',
                page_location: window.location.href,
                send_page_view: true,
                enhanced_measurement: {
                  scrolls: true,
                  outbound_clicks: true,
                  site_search: true,
                  video_engagement: true,
                  file_downloads: true
                },
                custom_map: {
                  'custom_parameter_1': 'service_type',
                  'custom_parameter_2': 'service_area'
                },
                user_properties: {
                  service_area: 'Northern Rivers NSW',
                  business_type: 'Mobile Knife Sharpening'
                }
              });
              
              // Enhanced Ecommerce Tracking Setup
              gtag('config', 'G-XXXXXXXXXX', {
                enhanced_conversions: true,
                send_page_view: false
              });
              
              // Custom Event Tracking Function
              window.trackEvent = function(eventName, parameters = {}) {
                gtag('event', eventName, {
                  event_category: parameters.category || 'engagement',
                  event_label: parameters.label || '',
                  value: parameters.value || 0,
                  custom_parameter_1: parameters.service_type || '',
                  custom_parameter_2: parameters.service_area || 'Northern Rivers NSW',
                  ...parameters
                });
              };
              
              // Button Click Tracking
              document.addEventListener('DOMContentLoaded', function() {
                // Track all button clicks
                document.querySelectorAll('button, .btn, [role="button"]').forEach(function(button) {
                  button.addEventListener('click', function() {
                    const buttonText = this.textContent || this.innerHTML || 'Unknown';
                    window.trackEvent('button_click', {
                      category: 'user_engagement',
                      label: buttonText.trim(),
                      button_type: this.type || 'button',
                      button_id: this.id || '',
                      button_class: this.className || ''
                    });
                  });
                });
                
                // Track form submissions
                document.querySelectorAll('form').forEach(function(form) {
                  form.addEventListener('submit', function() {
                    window.trackEvent('form_submit', {
                      category: 'lead_generation',
                      label: 'Contact Form',
                      form_id: this.id || '',
                      form_action: this.action || ''
                    });
                  });
                });
                
                // Track phone number clicks
                document.querySelectorAll('a[href^="tel:"]').forEach(function(link) {
                  link.addEventListener('click', function() {
                    window.trackEvent('phone_click', {
                      category: 'contact',
                      label: 'Phone Call',
                      phone_number: this.href.replace('tel:', '')
                    });
                  });
                });
                
                // Track email clicks
                document.querySelectorAll('a[href^="mailto:"]').forEach(function(link) {
                  link.addEventListener('click', function() {
                    window.trackEvent('email_click', {
                      category: 'contact',
                      label: 'Email',
                      email_address: this.href.replace('mailto:', '')
                    });
                  });
                });
              });
              
              // Enhanced Ecommerce Events
              window.trackPurchase = function(transactionId, items, value, currency = 'AUD') {
                gtag('event', 'purchase', {
                  transaction_id: transactionId,
                  value: value,
                  currency: currency,
                  items: items,
                  affiliation: 'Northern Rivers Knife Sharpening',
                  coupon: '',
                  shipping: 0,
                  tax: 0
                });
              };
              
              window.trackAddToCart = function(item) {
                gtag('event', 'add_to_cart', {
                  currency: 'AUD',
                  value: item.price,
                  items: [item]
                });
              };
              
              window.trackViewItem = function(item) {
                gtag('event', 'view_item', {
                  currency: 'AUD',
                  value: item.price,
                  items: [item]
                });
              };
              
              window.trackBeginCheckout = function(items, value) {
                gtag('event', 'begin_checkout', {
                  currency: 'AUD',
                  value: value,
                  items: items
                });
              };
            `
          }}
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

        {/* WebSite Schema for Sitelinks Search Box */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://northernriversknifesharpening.com/#website",
              "name": "Northern Rivers Knife Sharpening",
              "alternateName": "NRKS",
              "url": "https://northernriversknifesharpening.com",
              "description": "Professional mobile knife sharpening service in Northern Rivers NSW. Expert blade restoration with convenient on-site service.",
              "publisher": {
                "@type": "Organization",
                "@id": "https://northernriversknifesharpening.com/#business"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://northernriversknifesharpening.com/search?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              },
              "mainEntity": {
                "@type": "LocalBusiness",
                "@id": "https://northernriversknifesharpening.com/#business"
              },
              "inLanguage": "en-AU",
              "copyrightYear": "2024",
              "copyrightHolder": {
                "@type": "Organization",
                "@id": "https://northernriversknifesharpening.com/#business"
              }
            })
          }}
        />

        {/* Enhanced Business Hours and Rating Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "@id": "https://northernriversknifesharpening.com/#enhanced-business",
              "name": "Northern Rivers Knife Sharpening",
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  "opens": "08:00",
                  "closes": "17:00",
                  "validFrom": "2024-01-01",
                  "validThrough": "2024-12-31"
                },
                {
                  "@type": "OpeningHoursSpecification", 
                  "dayOfWeek": "Saturday",
                  "opens": "08:00",
                  "closes": "15:00",
                  "validFrom": "2024-01-01",
                  "validThrough": "2024-12-31"
                },
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": "Sunday",
                  "opens": "00:00",
                  "closes": "00:00",
                  "validFrom": "2024-01-01",
                  "validThrough": "2024-12-31"
                }
              ],
              "specialOpeningHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "opens": "00:00",
                  "closes": "00:00",
                  "validFrom": "2024-12-25",
                  "validThrough": "2024-12-25"
                },
                {
                  "@type": "OpeningHoursSpecification",
                  "opens": "00:00", 
                  "closes": "00:00",
                  "validFrom": "2024-01-01",
                  "validThrough": "2024-01-01"
                }
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "47",
                "bestRating": "5",
                "worstRating": "1"
              },
              "review": [
                {
                  "@type": "Review",
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5",
                    "bestRating": "5"
                  },
                  "author": {
                    "@type": "Person",
                    "name": "Sarah M."
                  },
                  "datePublished": "2024-09-15",
                  "reviewBody": "Exceptional service! Hakeem came to my home and sharpened all my kitchen knives to perfection. Professional, punctual, and reasonably priced. Highly recommend!",
                  "publisher": {
                    "@type": "Organization",
                    "name": "Northern Rivers Knife Sharpening"
                  }
                },
                {
                  "@type": "Review",
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5",
                    "bestRating": "5"
                  },
                  "author": {
                    "@type": "Person",
                    "name": "James L."
                  },
                  "datePublished": "2024-09-10",
                  "reviewBody": "Amazing work on my Japanese chef knives. The traditional sharpening technique brought them back to life. Will definitely use this service again.",
                  "publisher": {
                    "@type": "Organization",
                    "name": "Northern Rivers Knife Sharpening"
                  }
                },
                {
                  "@type": "Review",
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5",
                    "bestRating": "5"
                  },
                  "author": {
                    "@type": "Person",
                    "name": "Emily R."
                  },
                  "datePublished": "2024-09-05",
                  "reviewBody": "Fast, convenient mobile service. Great communication and my knives are sharper than they've ever been. Perfect for busy restaurant owners!",
                  "publisher": {
                    "@type": "Organization",
                    "name": "Northern Rivers Knife Sharpening"
                  }
                }
              ]
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
