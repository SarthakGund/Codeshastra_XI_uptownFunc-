import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import NavbarAuth from "@/components/NavbarAuth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Developer Tools",
  description: "A collection of tools for developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white h-screen w-screen`} suppressHydrationWarning
      >
        <AuthProvider>
          <nav className="flex justify-between items-center bg-black text-white h-16 px-4 sticky top-0 z-50 border-b border-white/10">
            <div className="flex items-center">
              <Image
                src="/assets/logo.svg"
                alt="Company Logo"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
            <NavbarAuth />
          </nav>

          <div className="flex h-[calc(100vh-4rem)] overflow-y-hidden">
            <Sidebar companyName="Your Company Name" />
            <main className="flex-1 overflow-y-auto p-6 transition-all duration-300 ease-in-out">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
