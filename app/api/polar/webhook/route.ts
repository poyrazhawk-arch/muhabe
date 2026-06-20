import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
}

export async function POST(req: NextRequest) {
  const payload   = await req.text();
  const signature = req.headers.get("webhook-signature") ?? "";
  const secret    = process.env.POLAR_WEBHOOK_SECRET ?? "";

  if (secret && !verifySignature(payload, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(payload);
  const type  = event.type as string;

  if (type === "subscription.created" || type === "subscription.active") {
    const sub        = event.data;
    const customerEmail = sub.customer?.email;
    const productId     = sub.product_id;
    const status        = sub.status;

    console.log(`[Polar] ${type}: ${customerEmail} → product ${productId} (${status})`);
    // TODO: update user subscription tier in Supabase based on productId
  }

  if (type === "subscription.canceled" || type === "subscription.revoked") {
    const sub           = event.data;
    const customerEmail = sub.customer?.email;
    console.log(`[Polar] ${type}: ${customerEmail} subscription ended`);
    // TODO: downgrade user to free tier
  }

  return NextResponse.json({ received: true });
}
