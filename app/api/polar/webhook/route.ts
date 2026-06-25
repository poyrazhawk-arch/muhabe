import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PRODUCT_PLAN: Record<string, string> = {
  [process.env.POLAR_PRODUCT_STARTER ?? ""]: "starter",
  [process.env.POLAR_PRODUCT_PRO     ?? ""]: "pro",
  [process.env.POLAR_PRODUCT_OFFICE  ?? ""]: "office",
};

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
    const sub   = event.data;
    const email = sub.customer?.email as string | undefined;
    const plan  = PRODUCT_PLAN[sub.product_id] ?? "starter";

    if (email) {
      await supabase
        .from("accountants")
        .update({
          plan: plan,
          polar_subscription_id: sub.id,
          polar_customer_email: email,
        })
        .eq("email", email);
    }
  }

  if (type === "subscription.canceled" || type === "subscription.revoked") {
    const sub   = event.data;
    const email = sub.customer?.email as string | undefined;

    if (email) {
      await supabase
        .from("accountants")
        .update({ plan: "free", polar_subscription_id: null })
        .eq("email", email);
    }
  }

  return NextResponse.json({ received: true });
}
