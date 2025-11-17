/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { fetchPlayerBySlug } from "@/lib/players";

export const runtime = "edge";
export const revalidate = 3600;

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const player = await fetchPlayerBySlug(params.slug);
  const name = player ? (player.firstName || player.lastName ? `${player.firstName ?? ""} ${player.lastName ?? ""}`.trim() : player.name) : "pbWins Player";
  const city = player?.city ? `${player.city}${player?.state ? `, ${player.state}` : ""}` : "Pickleball arena";
  const rating = player?.duprRating ?? player?.rating ?? "—";
  const wins = Array.isArray(player?.wins) ? player?.wins.length : player?.wins ?? 0;

  const image = player?.imageUrl ?? "https://pbwins.com/pbwins-logo.png";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          background: "radial-gradient(circle at top, #0d1117 0%, #050506 60%)",
          color: "white",
          padding: "60px",
          fontFamily: "Sora",
          justifyContent: "space-between",
        }}
      >
        <div style={{ width: "60%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 22, letterSpacing: 12, textTransform: "uppercase", color: "#95e84b" }}>pbWins</div>
            <div style={{ fontSize: 68, fontWeight: 600, marginTop: 20 }}>{name}</div>
            <div style={{ fontSize: 32, color: "#9ca3af" }}>{city}</div>
          </div>
          <div style={{ display: "flex", gap: 32, marginTop: 40 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 20, color: "#95e84b" }}>DUPR Rating</span>
              <span style={{ fontSize: 48, fontWeight: 600 }}>{rating}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 20, color: "#95e84b" }}>Total wins</span>
              <span style={{ fontSize: 48, fontWeight: 600 }}>{wins}</span>
            </div>
          </div>
        </div>
        <div
          style={{
            width: 250,
            height: 250,
            borderRadius: "50%",
            border: "8px solid #95e84b",
            boxShadow: "0 0 60px rgba(123,255,74,0.4)",
            overflow: "hidden",
          }}
        >
          <img src={image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
