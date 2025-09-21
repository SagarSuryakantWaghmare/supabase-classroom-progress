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

    if (!data.session) throw new Error('Authentication failed');

    if (!data?.user) throw new Error('No user data returned');
    
    // Get additional user data from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, class_id, name')
      .eq('id', data.user.id)
      .single();

    if (!profile) throw new Error('Profile not found');

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile?.role,
        classId: profile?.class_id,
        name: profile?.name
      },
      session: data.session
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid login credentials' },
      { status: 401 }
    );
  }
}
