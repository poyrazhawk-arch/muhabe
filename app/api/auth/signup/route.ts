import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { email, password, fullName, officeName } = await request.json();

  if (!email || !password || !fullName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Create user with email already confirmed — no verification email sent
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      office_name: officeName || null,
    },
  });

  if (error) {
    if (error.message.includes("already been registered") || error.message.includes("already exists")) {
      return NextResponse.json({ error: "This email is already registered. Sign in instead." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, userId: data.user?.id });
}
