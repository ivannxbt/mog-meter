import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mogmeter.com"),
  title: "MOG Meter — ¿Quién manda en tu grupo?",
  description:
    "Sube el screenshot de tu chat grupal y descubre quién es el verdadero alfa.",
  openGraph: {
    title: "MOG Meter — ¿Quién manda en tu grupo?",
    description:
      "Sube el screenshot de tu chat grupal y descubre quién es el verdadero alfa.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-zinc-50" style={{ backgroundColor: "#0a0a0a" }}>
        {children}
      </body>
    </html>
  );
}
