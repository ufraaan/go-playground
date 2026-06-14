import type { Metadata } from "next";
import { Geist, Geist_Mono, Nabla, Unica_One } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nabla = Nabla({
  variable: "--font-nabla",
  subsets: ["latin"],
});

const unicaOne = Unica_One({
  variable: "--font-unica",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "goblox",
  description: "In-browser Go IDE",
  icons: { icon: "/favicon.webp" },
  openGraph: {
    title: "goblox",
    description: "In-browser Go IDE",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${nabla.variable} ${unicaOne.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
