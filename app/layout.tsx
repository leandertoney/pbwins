import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-nunito"
});

export const metadata: Metadata = {
  title: "pbWins - Verified Pickleball Wins Database",
  description: "Track every verified DUPR win in real time. Add your profile to see where you rank.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} ${nunito.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
