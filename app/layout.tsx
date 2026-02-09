import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "MedScanner AI - Intelligent Medicine Insights",
  description: "Get comprehensive information about any medicine by just scanning its image.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased selection:bg-primary/20",
        inter.variable,
        spaceGrotesk.variable
      )}>
        <div className="fixed inset-0 grid-bg -z-10" />
        <div className="fixed inset-0 mesh-gradient -z-20" />
        {children}
      </body>
    </html>
  );
}
