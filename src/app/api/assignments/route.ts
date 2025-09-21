import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get('classId');
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    let query = supabase
      .from('assignments')
      .select('*');

    if (classId) {
      query = query.eq('class_id', classId);
    }

    const { data, error } = await query.order('due_date', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
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
    const { data } = await supabase
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

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}
