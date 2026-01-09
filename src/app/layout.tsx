import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { Providers } from "./components/Providers";


export const metadata: Metadata = {
  title: "TOTD AT Tracker",
  description: "Tracking players with most TOTD ATs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script defer src="https://umami.socr.am/script.js" data-website-id="554a0dc1-0b89-4a54-9820-bcaddf180564"></script>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
      suppressHydrationWarning 
        className={`antialiased`}
      >
        <Navbar />
        <Providers>{children}</Providers>
      </body>
      <footer style={{ zIndex: 99 }}>
        <p className="ml-[8px] font-bold">This project is WIP</p>
        <p className="mr-[8px] font-bold">by @socramdavid</p>
      </footer>
    </html>
  );
}
