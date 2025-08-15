import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Northern Rivers Knife Sharpening",
  description: "Professional knife sharpening service for Northern Rivers region",
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
