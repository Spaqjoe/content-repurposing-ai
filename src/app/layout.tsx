import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Content AI | Repurpose one idea into platform-ready content",
  description:
    "Turn one source into carousel outlines, Reel hooks, captions, and more with Content AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <SiteHeader />
        <main className="min-h-[calc(100dvh-4rem)] pt-16">{children}</main>
      </body>
    </html>
  );
}
