import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// User related types are now defined in the models/User.ts file


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

    const { data: users } = await supabase
      .from('users')
      .select('*');

    if (!users) throw new Error('No users found');
    return NextResponse.json(users);
  } catch {
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
    const { data: authData, error: createUserError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        class_id
      }
    });

    if (createUserError) throw createUserError;
    
    const user = authData?.user;

    // 2. Create profile in profiles table
    if (!user) {
      throw new Error('User creation failed');
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([{ 
        id: user.id,
        email,
        name,
        role,
        class_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (profileError) throw profileError;
    return NextResponse.json(profileData, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
