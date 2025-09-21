import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const assignmentId = searchParams.get('assignmentId');
  const studentId = searchParams.get('studentId');
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    let query = supabase
      .from('scores')
      .select(`
        *,
        assignments(*),
        profiles!scores_student_id_fkey(*)
      `);

    if (assignmentId) {
      query = query.eq('assignment_id', assignmentId);
    }
    
    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch scores' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { assignment_id, student_id, score, feedback } = await request.json();
  
  try {
    const { data, error } = await supabase
      .from('scores')
      .upsert(
        { 
          assignment_id,
          student_id,
          score: Number(score),
          feedback,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'assignment_id,student_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500 }
    );
  }
}
