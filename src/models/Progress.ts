import { supabase } from '@/lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

export interface IProgress {
  id: string;
  student_id: string;
  class_id: string;
  assignment_id: string;
  score: number | null;
  feedback: string | null;
  submitted_at: string;
  updated_at: string;
  // These will be populated by joins
  student?: {
    id: string;
    name: string;
    email: string;
  };
  assignment?: {
    id: string;
    title: string;
    max_score: number;
    due_date: string;
  };
  class?: {
    id: string;
    name: string;
  };
}

export type NewProgress = Omit<IProgress, 'id' | 'submitted_at' | 'updated_at' | 'student' | 'assignment' | 'class'>;

export type ProgressUpdate = Partial<Omit<IProgress, 'id' | 'student_id' | 'class_id' | 'assignment_id' | 'submitted_at' | 'student' | 'assignment' | 'class'>> & { id: string };

export class ProgressService {
  private static readonly TABLE_NAME = 'progresses';

  static async create(progressData: NewProgress): Promise<{ data: IProgress | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .insert([progressData])
      .select('*')
      .single();

    return { data, error };
  }

  static async getById(id: string): Promise<{ data: IProgress | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select(`
        *,
        student:student_id (id, name, email),
        assignment:assignment_id (id, title, max_score, due_date),
        class:class_id (id, name)
      `)
      .eq('id', id)
      .single();

    return { data, error };
  }

  static async getByStudent(studentId: string): Promise<{ data: IProgress[] | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select(`
        *,
        assignment:assignment_id (id, title, max_score, due_date),
        class:class_id (id, name, teacher:teacher_id (id, name))
      `)
      .eq('student_id', studentId)
      .order('submitted_at', { ascending: false });

    return { data, error };
  }

  static async getByClass(classId: string): Promise<{ data: IProgress[] | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select(`
        *,
        student:student_id (id, name, email),
        assignment:assignment_id (id, title, max_score, due_date)
      `)
      .eq('class_id', classId)
      .order('submitted_at', { ascending: false });

    return { data, error };
  }

  static async getByAssignment(assignmentId: string): Promise<{ data: IProgress[] | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select(`
        *,
        student:student_id (id, name, email),
        class:class_id (id, name)
      `)
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false });

    return { data, error };
  }

  static async update(
    id: string, 
    updates: ProgressUpdate
  ): Promise<{ data: IProgress | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    return { data, error };
  }

  static async delete(id: string): Promise<{ error: PostgrestError | null }> {
    const { error } = await supabase
      .from(this.TABLE_NAME)
      .delete()
      .eq('id', id);

    return { error };
  }

  // Get student's average score in a class
  static async getStudentAverage(
    studentId: string, 
    classId: string
  ): Promise<{ data: number | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('score')
      .eq('student_id', studentId)
      .eq('class_id', classId)
      .not('score', 'is', null);

    if (error) return { data: null, error };
    if (!data || data.length === 0) return { data: null, error: null };

    const scores = data.map(item => item.score as number);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    return { data: parseFloat(average.toFixed(2)), error: null };
  }

  // Get class average for an assignment
  static async getClassAverage(
    classId: string, 
    assignmentId: string
  ): Promise<{ data: number | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('score')
      .eq('class_id', classId)
      .eq('assignment_id', assignmentId)
      .not('score', 'is', null);

    if (error) return { data: null, error };
    if (!data || data.length === 0) return { data: null, error: null };

    const scores = data.map(item => item.score as number);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    return { data: parseFloat(average.toFixed(2)), error: null };
  }

  // Get student's ranking in a class
  static async getStudentRanking(
    studentId: string, 
    classId: string
  ): Promise<{ data: { rank: number; total: number } | null; error: PostgrestError | null }> {
    // First get all students' average scores in the class
    const { data: studentsData, error } = await supabase.rpc('get_class_ranking', {
      p_class_id: classId
    });

    if (error) return { data: null, error };
    
    // Define interface for student data
    interface StudentData {
      student_id: string;
      [key: string]: unknown;
    }

    // Find the student's rank
    const studentRank = studentsData.findIndex((s: StudentData) => s.student_id === studentId) + 1;
    
    return { 
      data: studentRank > 0 ? { 
        rank: studentRank, 
        total: studentsData.length 
      } : null, 
      error: null 
    };
  }
}
