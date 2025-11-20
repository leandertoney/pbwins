import { Metadata } from "next";
import FAQPageClient from "./FAQPageClient";

export const metadata: Metadata = {
  title: "pbWins FAQ – Verified Pickleball Rankings & Player Stats",
  description: "Answers about verified pickleball wins, rankings, DUPR differences, club verification, and player pages.",
  openGraph: {
    title: "pbWins FAQ – Verified Pickleball Rankings & Player Stats",
    description: "Answers about verified pickleball wins, rankings, DUPR differences, club verification, and player pages.",
    url: `${process.env.NEXT_PUBLIC_APP_URL || "https://pbwins.com"}/faq`,
  },
  alternates: {
    canonical: "/faq",
  },
};

export default function FAQPage() {
  return <FAQPageClient />;
}
