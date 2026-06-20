import { NextRequest, NextResponse } from "next/server";

const PRODUCT_MAP: Record<string, string> = {
  starter: process.env.POLAR_PRODUCT_STARTER!,
  pro:     process.env.POLAR_PRODUCT_PRO!,
  office:  process.env.POLAR_PRODUCT_OFFICE!,
};

export async function POST(req: NextRequest) {
  const { plan } = await req.json();
  const productId = PRODUCT_MAP[plan];

  if (!productId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const res = await fetch("https://api.polar.sh/v1/checkouts/custom", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.POLAR_API_KEY}`,
    },
    body: JSON.stringify({
      product_id: productId,
      success_url: `${appUrl}/auth/kayit?checkout=success&plan=${plan}`,
      metadata: { plan },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Polar checkout error:", err);
    return NextResponse.json({ error: "Checkout creation failed" }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json({ url: data.url });
}
