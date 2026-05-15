import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arc Agent Portal — ERC-8183 AI Job Marketplace",
  description:
    "Create, fund, and settle AI agent jobs on Arc Network using ERC-8183 smart contracts and USDC stablecoins.",
  openGraph: {
    title: "Arc Agent Portal",
    description: "AI Agent Payment Infrastructure on Arc Network",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-grid antialiased">
        <div className="scanline" />
        {children}
      </body>
    </html>
  );
}
