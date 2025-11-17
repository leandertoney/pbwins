import { ConvexHttpClient } from "convex/browser";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

let client: ConvexHttpClient | null = null;

export function getConvexClient() {
  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  }

  if (!client) {
    client = new ConvexHttpClient(convexUrl);
  }

  return client;
}
