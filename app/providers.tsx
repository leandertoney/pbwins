"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useState } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [convex] = useState(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    // Use a placeholder URL during build/SSR, will be replaced with real URL on client
    return new ConvexReactClient(url || "https://placeholder.convex.cloud");
  });

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
