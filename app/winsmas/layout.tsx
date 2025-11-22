"use client";

import { useEffect } from "react";

export default function WinsmasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Hide the Winsmas banner on the Winsmas page (redundant since we're already here)
    const banner = document.querySelector('[data-winsmas-banner]');
    if (banner instanceof HTMLElement) {
      banner.style.display = "none";
    }

    // Cleanup: show banner again when leaving the page
    return () => {
      const banner = document.querySelector('[data-winsmas-banner]');
      if (banner instanceof HTMLElement) {
        banner.style.display = "";
      }
    };
  }, []);

  return <>{children}</>;
}
