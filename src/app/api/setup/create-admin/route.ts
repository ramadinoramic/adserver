import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// TEMPORARY ROUTE — DELETE AFTER USE
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Find existing user by email
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 400 });
  }

  const existingUser = listData.users.find((u) => u.email === 'dinoramitch@gmail.com');
  if (!existingUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Confirm email and update password
  const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
    email_confirm: true,
    password: 'dino1002',
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, userId: data.user.id });
}
