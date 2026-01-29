import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LayoutProvider } from "@/context/LayoutContext";
import "./globals.css";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RetainAI - AI-Powered Retention Platform",
  description: "Plataforma de retención potenciada por IA para prevenir churn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LayoutProvider>
          <Navigation />
          {children}
        </LayoutProvider>
      </body>
    </html>
  );
}
