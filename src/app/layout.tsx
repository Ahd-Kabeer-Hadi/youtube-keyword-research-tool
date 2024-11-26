import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Youker - Keyword Research Tool for YouTube",
  description: "The Best YouTube Keyword Research Tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <SessionProvider>
        <body className={inter.className}>
          <Header />
          {children}
        </body>
      </SessionProvider>
    </html>
  );
}
