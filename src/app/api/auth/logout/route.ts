import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    await supabase.auth.signOut();
    
    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch {
    return NextResponse.json(
      { error: 'Failed to log out' },
      { status: 500 }
    );
  }
}
