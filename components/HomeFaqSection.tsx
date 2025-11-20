"use client";

import { useState } from "react";
import Link from "next/link";
import { homepageFaqs } from "@/app/(site)/faqData";

export default function HomeFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full py-16 px-4 relative">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-glow/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            A quick look at the most common questions players ask about pbWins.
          </p>
        </div>

        {/* Premium FAQ Container */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
          <div className="space-y-4">
            {homepageFaqs.map((faq, index) => (
              <div
                key={faq.slug}
                className="border border-white/5 rounded-xl bg-black/20 overflow-hidden transition-all duration-300 hover:border-brand/40 hover:shadow-[0_0_20px_rgba(149,232,75,0.15)]"
              >
                {/* Question Button */}
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 transition-colors hover:bg-white/5"
                  aria-expanded={openIndex === index}
                >
                  <span className="font-semibold text-white text-sm sm:text-base">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-brand-light flex-shrink-0 transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
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
                    openIndex === index
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  } overflow-hidden`}
                >
                  <div className="px-6 pb-4 pt-2 text-gray-300 text-sm sm:text-base leading-relaxed border-t border-white/5">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-8 text-center">
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand/10 border border-brand/30 text-brand-light font-semibold text-sm transition-all duration-300 hover:bg-brand/20 hover:border-brand hover:shadow-[0_0_20px_rgba(149,232,75,0.25)]"
            >
              See all FAQs
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
