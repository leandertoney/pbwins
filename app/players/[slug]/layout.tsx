"use client";

import { useEffect } from "react";

export default function PlayerProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Hide the global header on player profile pages
    const header = document.querySelector("header");
    if (header) {
      header.style.display = "none";
    }

    return () => {
      // Restore header when leaving player profile pages
      const header = document.querySelector("header");
      if (header) {
        header.style.display = "";
      }
    };
  }, []);

  return <>{children}</>;
}
