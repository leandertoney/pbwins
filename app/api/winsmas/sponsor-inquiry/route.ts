import { NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || "pbWins <pbwins@pbwins.com>";
const SPONSOR_TO = process.env.WINSMAS_SPONSOR_EMAIL || "support@pbwins.com";

export async function POST(req: Request) {
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
  }

  try {
    const {
      challengeId,
      challengeTitle,
      name,
      brand,
      contactEmail,
      website,
      note,
    } = await req.json();

    if (!challengeId || !challengeTitle) {
      return NextResponse.json({ error: "Missing challenge info" }, { status: 400 });
    }
    if (!name || !contactEmail) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const html = `
      <div style="font-family:Arial,sans-serif;padding:16px;color:#111">
        <p style="margin-bottom:8px;">New sponsorship inquiry for <strong>${challengeTitle}</strong>.</p>
        <ul style="padding-left:18px;margin:0 0 16px 0;">
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Brand:</strong> ${brand || "—"}</li>
          <li><strong>Email:</strong> ${contactEmail}</li>
          <li><strong>Website:</strong> ${website || "—"}</li>
        </ul>
        <p style="white-space:pre-line;margin-top:12px;"><strong>Notes:</strong> ${note || "(none)"}</p>
      </div>
    `;

    const resendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: SPONSOR_TO,
        subject: `Winsmas sponsorship inquiry – ${challengeTitle}`,
        reply_to: contactEmail,
        html,
      }),
    });

    if (!resendResp.ok) {
      const text = await resendResp.text();
      console.error("Resend sponsor inquiry failed", text);
      return NextResponse.json({ error: "Failed to send inquiry" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sponsor inquiry error", error);
    return NextResponse.json({ error: "Failed to send inquiry" }, { status: 500 });
  }
}
