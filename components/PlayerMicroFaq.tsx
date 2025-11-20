"use client";

import { useState } from "react";
import Link from "next/link";
import { playerFaqs } from "@/app/(site)/faqData";

export default function PlayerMicroFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full">
      {/* Compact Header */}
      <h3 className="text-xl font-bold mb-4 text-white">Player FAQs</h3>

      {/* Compact FAQ Container */}
      <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-3">
        {playerFaqs.map((faq, index) => (
          <div
            key={faq.slug}
            className="border border-brand/20 rounded-lg bg-black/20 overflow-hidden transition-all duration-300 hover:border-brand/50 hover:bg-black/30"
          >
            {/* Question Button - Compact */}
            <button
              onClick={() => toggleFaq(index)}
              className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors"
              aria-expanded={openIndex === index}
            >
              <span className="font-medium text-white text-sm">
                {faq.question}
              </span>
              <svg
                className={`w-4 h-4 text-brand flex-shrink-0 transition-transform duration-300 ${
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

            {/* Answer - Compact */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                openIndex === index
                  ? "max-h-80 opacity-100"
                  : "max-h-0 opacity-0"
              } overflow-hidden`}
            >
              <div className="px-4 pb-3 pt-1 text-gray-400 text-xs leading-relaxed border-t border-white/5">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}

        {/* Compact CTA Link */}
        <div className="pt-2 text-center">
          <Link
            href="/faq"
            className="inline-flex items-center gap-1.5 text-xs text-brand-light hover:text-brand transition-colors font-medium"
          >
            View full FAQ page
            <svg
              className="w-3 h-3"
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
    </section>
  );
}
