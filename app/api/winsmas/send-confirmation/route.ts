import { NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || "pbwins@pbwins.com";

export async function POST(req: Request) {
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
  }

  try {
    const { email, playerName, challengeId } = await req.json();
    if (!email || !challengeId) {
      return NextResponse.json({ error: "Missing email or challengeId" }, { status: 400 });
    }

    const challengeLabel =
      challengeId === "winsmas-10"
        ? "10-Win Challenge"
        : challengeId === "winsmas-15"
        ? "15-Win Challenge"
        : challengeId === "winsmas-25"
        ? "25-Win Challenge"
        : "Winsmas Challenge";

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 16px;">
        <p style="font-size:14px; color:#444">Hi ${playerName || "player"},</p>
        <p style="font-size:16px; font-weight:600;">You're in for the ${challengeLabel}.</p>
        <p style="font-size:14px; color:#555;">We'll track your verified December wins automatically. Keep playing—every verified DUPR win counts.</p>
        <p style="font-size:14px; color:#555;">Check your progress anytime at <a href="https://pbwins.com/winsmas">pbwins.com/winsmas</a>.</p>
        <p style="margin-top:24px; font-size:12px; color:#888;">pbWins • Verified Wins Leaderboard</p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: email,
        subject: `You're in: ${challengeLabel}`,
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Resend error", text);
      return NextResponse.json({ error: "Failed to send" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
