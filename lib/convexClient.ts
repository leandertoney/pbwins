import { ConvexHttpClient } from "convex/browser";

const convexUrl =
  process.env.NEXT_PUBLIC_CONVEX_URL || "http://localhost:8888";

const client = new ConvexHttpClient(convexUrl);

export function getConvexClient() {
  return client;
}
