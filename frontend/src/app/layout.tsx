import type { Metadata } from "next";
import { Space_Mono, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import IdentityGate from "@/components/IdentityGate";

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "VERITAS — Case File System",
  description: "Logic Detective Platform. Phá án bằng suy luận, không bằng may mắn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${spaceMono.variable} ${inter.variable}`} suppressHydrationWarning>
        <div className="vignette-overlay" />
        <div className="crt-scanlines" />
        <IdentityGate />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
