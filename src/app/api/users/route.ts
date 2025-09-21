import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Only fetch basic user info, not sensitive data
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, role, class_id')
      .order('name', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { email, password, name, role, class_id } = await request.json();
  
  try {
    // 1. Create auth user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          class_id: class_id || null
        }
      }
    });

    if (signUpError) throw signUpError;

    // 2. Create profile in profiles table
    if (authData.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{ 
          id: authData.user.id,
          email,
          name,
          role,
          class_id: class_id || null
        }])
        .select()
        .single();

      if (profileError) throw profileError;
      return NextResponse.json(profileData, { status: 201 });
    }

    throw new Error('Failed to create user');
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
