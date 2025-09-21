import { supabase } from '@/lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

export interface IClass {
  id: string;
  name: string;
  academic_year: string;
  teacher_id: string | null;
  created_at: string;
  updated_at: string;
  // These will be populated by joins
  teacher?: {
    id: string;
    name: string;
    email: string;
  };
  student_count?: number;
  average_score?: number;
}

export type NewClass = Omit<IClass, 'id' | 'created_at' | 'updated_at' | 'teacher' | 'student_count' | 'average_score'>;

export type ClassUpdate = Partial<NewClass> & { id: string };

export class ClassService {
  private static readonly TABLE_NAME = 'classes';

  static async create(classData: NewClass): Promise<{ data: IClass | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .insert([classData])
      .select('*')
      .single();

    return { data, error };
  }

  static async getById(id: string): Promise<{ data: IClass | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select(`
        *,
        teacher:teacher_id (id, name, email)
      `)
      .eq('id', id)
      .single();

    return { data, error };
  }

  static async getByTeacher(teacherId: string): Promise<{ data: IClass[] | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select(`
        *,
        teacher:teacher_id (id, name, email),
        student_count:users!users_class_id_fkey (count)
      `)
      .eq('teacher_id', teacherId)
      .order('academic_year', { ascending: false })
      .order('name');

    return { 
      data: data?.map(c => ({
        ...c,
        student_count: c.student_count?.[0]?.count || 0
      })) || null, 
      error 
    };
  }

  static async getAll(): Promise<{ data: IClass[] | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select(`
        *,
        teacher:teacher_id (id, name, email),
        student_count:users!users_class_id_fkey (count)
      `)
      .order('academic_year', { ascending: false })
      .order('name');

    return { 
      data: data?.map(c => ({
        ...c,
        student_count: c.student_count?.[0]?.count || 0
      })) || null, 
      error 
    };
  }

  static async update(
    id: string, 
    updates: Partial<NewClass>
  ): Promise<{ data: IClass | null; error: PostgrestError | null }> {
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

  // Get classes with student progress statistics
  static async getClassesWithStats(teacherId?: string): Promise<{ 
    data: Array<IClass & { student_count: number; average_score: number }> | null; 
    error: PostgrestError | null 
  }> {
    let query = supabase
      .from(this.TABLE_NAME)
      .select(`
        *,
        teacher:teacher_id (id, name, email),
        students:users!users_class_id_fkey (
          id,
          progress:progresses (score)
        )
      `);

    if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    }

    const { data, error } = await query;

    if (error) return { data: null, error };

    interface ClassWithStudents extends IClass {
      students?: Array<{
        id: string;
        progress?: Array<{ score: number | null }>;
      }>;
    }

    const classesWithStats = data.map((cls: ClassWithStudents) => {
      interface StudentWithProgress {
        id: string;
        progress?: Array<{ score: number | null }>;
      }

      const students: StudentWithProgress[] = cls.students || [];
      const validScores = students
        .flatMap((s: StudentWithProgress) => s.progress || [])
        .map((p: { score: number | null }) => p.score)
        .filter((score: number | null): score is number => score !== null && !isNaN(score));

      const averageScore = validScores.length > 0 
        ? validScores.reduce((a: number, b: number) => a + b, 0) / validScores.length 
        : 0;

      return {
        ...cls,
        student_count: students.length,
        average_score: parseFloat(averageScore.toFixed(2)),
      };
    });

    return { data: classesWithStats, error: null };
  }
}
