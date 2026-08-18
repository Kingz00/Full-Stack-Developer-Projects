import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kingsley-onwupeluonye.netlify.app";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Kingsley Onwupeluonye | Full-Stack Developer",
    template: "%s | Kingsley Onwupeluonye",
  },

  description:
    "Portfolio of Kingsley Onwupeluonye, a full-stack developer building modern, responsive web applications with React, TypeScript, Next.js, and Node.js.",

  keywords: [
    "Kingsley Onwupeluonye",
    "Full-Stack Developer",
    "Web Developer",
    "React Developer",
    "Next.js Developer",
    "TypeScript Developer",
    "JavaScript Developer",
  ],

  authors: [
    {
      name: "Kingsley Onwupeluonye",
    },
  ],

  creator: "Kingsley Onwupeluonye",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Kingsley Onwupeluonye",
    title: "Kingsley Onwupeluonye | Full-Stack Developer",
    description:
      "Full-stack developer building modern, responsive web applications with React, TypeScript, Next.js, and Node.js.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kingsley Onwupeluonye | Full-Stack Developer",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Kingsley Onwupeluonye | Full-Stack Developer",
    description:
      "Full-stack developer building modern, responsive web applications with React, TypeScript, Next.js, and Node.js.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
}

export const viewport = {
  themeColor: "#0a0a0a",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
    >
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
