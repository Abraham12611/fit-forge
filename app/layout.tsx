import React from "react";
import "@/styles/globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/navbar";

export const metadata = {
  title: "FitForge",
  description: "Your fitness planner powered by AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ position: "fixed", top: 0, left: 0, zIndex: 9999, background: "red", color: "white", padding: "5px" }}>
          DEBUG: Layout with Navbar
        </div>

        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <footer className="py-4 text-center">
              <p>Powered by FitForge</p>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
