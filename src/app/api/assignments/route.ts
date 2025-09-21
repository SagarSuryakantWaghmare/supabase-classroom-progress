import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data } = await supabase
      .from('assignments')
      .select('*')
      .eq('class_id', classId)
      .order('due_date', { ascending: true });

    if (!data) throw new Error('No data returned');
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { title, description, due_date, max_score, class_id } = await request.json();
  
  try {
    const { data, error: insertError } = await supabase
      .from('assignments')
      .insert([{ 
        title, 
        description, 
        due_date, 
        max_score: Number(max_score),
        class_id 
      }])
      .select()
      .single();

    if (insertError) throw insertError;
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}
