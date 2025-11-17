"use client";

import { useEffect, useRef } from "react";
import { trackFAQToggle } from "@/lib/analytics";

interface FAQItemProps {
  question: string;
  answer: string | React.ReactNode;
  location: "leaderboard" | "player-profile";
}

export default function FAQItem({ question, answer, location }: FAQItemProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const details = detailsRef.current;
    if (!details) return;

    const handleToggle = () => {
      const isOpen = details.open;
      trackFAQToggle(question, isOpen, location);
    };

    details.addEventListener("toggle", handleToggle);
    return () => details.removeEventListener("toggle", handleToggle);
  }, [question, location]);

  return (
    <details
      ref={detailsRef}
      className="group bg-black/20 rounded-xl border border-white/5 p-5 transition-all duration-300 hover:bg-black/30 hover:border-brand-muted/20"
    >
      <summary className="cursor-pointer text-lg font-medium flex justify-between items-center">
        {question}
        <span className="transition-transform duration-300 group-open:rotate-180">⌄</span>
      </summary>
      <div className="mt-3 text-white/70 leading-relaxed animate-fadeIn">
        {typeof answer === "string" ? <p>{answer}</p> : answer}
      </div>
    </details>
  );
}
