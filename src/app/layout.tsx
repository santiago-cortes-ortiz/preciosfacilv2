import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://preciosfacil.co'),
  title: {
    default: "PreciosFacil - Compara Precios entre Falabella y Éxito | Ahorra en Colombia",
    template: "%s | PreciosFacil"
  },
  description: "Compara precios en tiempo real entre Falabella y Éxito. Encuentra las mejores ofertas en celulares, laptops, electrodomésticos y más. Ahorra dinero en tus compras online.",
  keywords: [
    "comparador de precios",
    "precios colombia",
    "falabella colombia",
    "exito colombia",
    "ofertas online",
    "compras online",
    "ahorro",
    "mejores precios",
    "celulares baratos",
    "electrodomésticos",
    "laptops",
    "televisores"
  ],
  authors: [{ name: "PreciosFacil" }],
  creator: "PreciosFacil",
  publisher: "PreciosFacil",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: 'https://preciosfacil.co',
    siteName: 'PreciosFacil',
    title: 'PreciosFacil - Compara Precios entre Falabella y Éxito',
    description: 'Encuentra las mejores ofertas comparando precios en tiempo real entre las tiendas más grandes de Colombia',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PreciosFacil - Comparador de Precios',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PreciosFacil - Compara Precios',
    description: 'Compara precios entre Falabella y Éxito y ahorra en tus compras online',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://preciosfacil.co',
  },
  verification: {
    google: 'tu-codigo-de-verificacion-aqui',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#667eea' },
    { media: '(prefers-color-scheme: dark)', color: '#764ba2' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "PreciosFacil",
              "description": "Comparador de precios online entre Falabella y Éxito en Colombia",
              "url": "https://preciosfacil.co",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://preciosfacil.co?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "PreciosFacil",
                "url": "https://preciosfacil.co"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "PreciosFacil",
              "url": "https://preciosfacil.co",
              "logo": "https://preciosfacil.co/logo.png",
              "sameAs": [
                "https://facebook.com/preciosfacil",
                "https://twitter.com/preciosfacil",
                "https://instagram.com/preciosfacil"
              ]
            })
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
