import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Layout } from "@/components/ui/Layout";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { JsonLd } from "@/components/ui/JsonLd";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | CASA CENTRAL",
    default: "CASA CENTRAL - Your Appliances & Audio",
  },
  description: "Transforming modern homes through smart appliances and beautiful technology.",
  keywords: [
    "appliances",
    "audio systems",
    "smart living",
    "home electronics",
    "homes",
    "premium appliances",
  ],
  authors: [
    {
      name: "CASA CENTRAL",
      url: "https://casacentral.com", // Placeholder URL
    },
  ],
  openGraph: {
    title: "CASA CENTRAL - Premium Appliances & Audio",
    description: "Transforming modern homes through smart appliances and beautiful technology.",
    type: "website",
    locale: "en_PH",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "CASA CENTRAL - Premium Appliances & Audio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CASA CENTRAL - Premium Appliances & Audio",
    description: "Transforming modern homes through smart appliances and beautiful technology.",
    images: [
      "/logo.png",
    ],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <JsonLd />
      </head>
      <body>
        <QueryProvider>
          <Layout>{children}</Layout>
        </QueryProvider>
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
