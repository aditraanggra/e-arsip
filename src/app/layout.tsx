import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { MSWProvider } from "@/components/msw-provider";
import { QueryProvider } from "@/lib/providers/query-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
  preload: false,
});
const geistMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "E-Arsip",
  description: "Sistem Elektronik Arsip Surat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.className} ${geistSans.variable} ${geistMono.className} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <MSWProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </QueryProvider>
        </MSWProvider>
      </body>
    </html>
  );
}
