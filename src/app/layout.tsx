// src/app/layout.tsx
import "./globals.css";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { DataProvider } from "@/contexts/DataContext";
// Import the fonts you want to use
import { Montserrat, Lato } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "leaflet/dist/leaflet.css"; // Ensure type declarations are available
config.autoAddCss = false;
// Configure Montserrat font
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"], // Include weights used in your CSS
  variable: "--font-heading", // Matches the CSS variable
  display: "swap", // Optimizes font loading
});

// Configure Lato font
const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"], // Include weights used in your CSS
  variable: "--font-body", // Matches the CSS variable
  display: "swap",
});

export const metadata = {
  title: "Smart Waste Swaraj",
  description: "Revolutionizing Waste Management for a Cleaner India",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${lato.variable}`}>
      <body>
        <DataProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: '1' }}>{children}</main>
            <Footer />
          </div>
        </DataProvider>
      </body>
    </html>
  );
}
