import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    // Get additional user data from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, class_id, name')
      .eq('id', data.user.id)
      .single();

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || profile?.name,
        role: profile?.role,
        class_id: profile?.class_id
      },
      session: data.session
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid login credentials' },
      { status: 401 }
    );
  }
}
