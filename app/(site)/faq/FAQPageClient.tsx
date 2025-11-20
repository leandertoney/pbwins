"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import { fullFaqs } from "@/app/(site)/faqData";

export default function FAQPageClient() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleFaq = (slug: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(slug)) {
        newSet.delete(slug);
      } else {
        newSet.add(slug);
      }
      return newSet;
    });
  };

  const scrollToCategory = (categorySlug: string) => {
    const element = document.getElementById(categorySlug);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": fullFaqs.flatMap((category) =>
      category.items.map((faq) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer,
        },
      }))
    ),
  };

  return (
    <>
      {/* Inject structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-white relative">
        {/* Central glow effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-glow/15 rounded-full blur-[120px]" />
        </div>

        <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 py-12 sm:py-16">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/pbwins-logo.png"
                alt="pbWins"
                width={120}
                height={120}
                className="rounded-full"
                priority
              />
            </Link>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">pbWins FAQ</h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
              Everything you need to know about verified pickleball rankings & player stats.
            </p>
          </div>

          {/* Table of Contents */}
          <nav className="mb-12 bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            <h2 className="text-xl font-semibold mb-4 text-white">Quick Navigation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {fullFaqs.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => scrollToCategory(category.slug)}
                  className="text-left px-4 py-3 rounded-lg bg-black/30 border border-white/5 text-sm font-medium text-brand-light hover:bg-black/50 hover:border-brand/40 transition-all duration-200 hover:shadow-[0_0_15px_rgba(149,232,75,0.2)]"
                >
                  {category.title}
                </button>
              ))}
            </div>
          </nav>

          {/* FAQ Categories */}
          <div className="space-y-12">
            {fullFaqs.map((category) => (
              <section
                key={category.slug}
                id={category.slug}
                className="scroll-mt-8"
              >
                {/* Category Header */}
                <div className="mb-6">
                  <h2 className="text-3xl font-bold mb-2 text-white">
                    {category.title}
                  </h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-brand to-brand-glow rounded-full" />
                </div>

                {/* Category Items */}
                <div className="space-y-4">
                  {category.items.map((faq) => (
                    <div
                      key={faq.slug}
                      id={faq.slug}
                      className="bg-black/40 border border-white/5 rounded-xl overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-brand/40 hover:shadow-[0_0_20px_rgba(149,232,75,0.15)]"
                    >
                      {/* Question Button */}
                      <button
                        onClick={() => toggleFaq(faq.slug)}
                        className="w-full text-left px-6 py-5 flex items-start justify-between gap-4 transition-colors hover:bg-white/5"
                        aria-expanded={openItems.has(faq.slug)}
                      >
                        <h3 className="font-semibold text-white text-base sm:text-lg pr-4">
                          {faq.question}
                        </h3>
                        <svg
                          className={`w-6 h-6 text-brand-light flex-shrink-0 transition-transform duration-300 ${
                            openItems.has(faq.slug) ? "rotate-180" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {/* Answer */}
                      <div
                        className={`transition-all duration-300 ease-in-out ${
                          openItems.has(faq.slug)
                            ? "max-h-[1000px] opacity-100"
                            : "max-h-0 opacity-0"
                        } overflow-hidden`}
                      >
                        <div className="px-6 pb-5 pt-2 text-gray-300 text-sm sm:text-base leading-relaxed border-t border-white/5">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center bg-black/40 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            <h2 className="text-2xl font-bold mb-3 text-white">
              Ready to see your verified wins?
            </h2>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto">
              Join thousands of players tracking their pickleball journey on pbWins.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-brand text-black font-semibold text-base transition-all duration-300 hover:bg-brand-light hover:shadow-[0_0_30px_rgba(149,232,75,0.4)]"
            >
              View Leaderboard
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
