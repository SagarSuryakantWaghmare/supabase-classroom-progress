import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data } = await supabase
      .from('classes')
      .select('*')
      .order('name', { ascending: true });

    if (!data) throw new Error('No data returned');

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { name, description } = await request.json();
  
  try {
    const { data } = await supabase
      .from('classes')
      .insert([{ name, description }])
      .select()
      .single();

    if (!data) throw new Error('No data returned');

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    );
  }
}
