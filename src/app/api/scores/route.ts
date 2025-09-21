import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const assignmentId = searchParams.get('assignmentId');
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data } = await supabase
      .from('scores')
      .select(`
        *,
        assignments (*),
        profiles!scores_student_id_fkey (name)
      `)
      .eq('assignment_id', assignmentId);

    if (!data) throw new Error('No data returned');
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
      .upsert({
        student_id,
        assignment_id,
        score: Number(score),
        submitted_at: new Date().toISOString(),
        ...(feedback && { feedback })
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned');
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500 }
    );
  }
}
