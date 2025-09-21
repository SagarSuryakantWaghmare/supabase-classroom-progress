import { supabase } from '@/lib/supabase';

// Types
type User = {
  id: string;
  email: string;
  full_name: string;
  user_type: 'student' | 'teacher' | 'admin';
  created_at: string;
};

type Class = {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  grade_level: string | null;
  academic_year: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
};


type Assignment = {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  total_points: number;
  assignment_type: string;
  created_at: string;
  updated_at: string;
};

type Submission = {
  id: string;
  assignment_id: string;
  student_id: string;
  submission_text: string | null;
  attachment_url: string | null;
  submitted_at: string;
  status: 'draft' | 'submitted' | 'late' | 'graded';
  grade: number | null;
  feedback: string | null;
  graded_by: string | null;
  graded_at: string | null;
};

type StudentProgress = {
  id: string;
  student_id: string;
  class_id: string;
  total_assignments: number;
  completed_assignments: number;
  average_score: number;
  current_grade: string | null;
  last_updated: string;
};

// User related functions
export const userService = {
  // Get current user profile
  getCurrentUser: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error) throw error;
    return data as User;
  },

  // Update user profile
  updateProfile: async (userId: string, updates: Partial<User>) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);
      
    if (error) throw error;
    return data;
  },
};

// Class related functions
export const classService = {
  // Get all classes for a teacher
  getTeacherClasses: async (teacherId: string): Promise<Class[]> => {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data as Class[];
  },

  // Get class by ID with enrolled students
  getClassWithStudents: async (classId: string) => {
    const { data, error } = await supabase
      .from('class_enrollments')
      .select(`
        *,
        student:users!student_id(*)
      `)
      .eq('class_id', classId);
      
    if (error) throw error;
    return data;
  },

  // Create a new class
  createClass: async (classData: Omit<Class, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('classes')
      .insert([classData])
      .select()
      .single();
      
    if (error) throw error;
    return data as Class;
  },
};

// Assignment related functions
export const assignmentService = {
  // Get assignments for a class
  getClassAssignments: async (classId: string): Promise<Assignment[]> => {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('class_id', classId)
      .order('due_date', { ascending: true });
      
    if (error) throw error;
    return data as Assignment[];
  },

  // Create a new assignment
  createAssignment: async (assignmentData: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('assignments')
      .insert([assignmentData])
      .select()
      .single();
      
    if (error) throw error;
    return data as Assignment;
  },

  // Update an assignment
  updateAssignment: async (assignmentId: string, updates: Partial<Assignment>) => {
    const { data, error } = await supabase
      .from('assignments')
      .update(updates)
      .eq('id', assignmentId)
      .select()
      .single();
      
    if (error) throw error;
    return data as Assignment;
  },
};

// Submission related functions
export const submissionService = {
  // Get student submissions for an assignment
  getAssignmentSubmissions: async (assignmentId: string): Promise<Submission[]> => {
    const { data, error } = await supabase
      .from('submissions')
      .select(`
        *,
        student:users!student_id(*)
      `)
      .eq('assignment_id', assignmentId);
      
    if (error) throw error;
    return data as unknown as Submission[];
  },

  // Submit an assignment
  submitAssignment: async (submissionData: Omit<Submission, 'id' | 'submitted_at'>) => {
    const { data, error } = await supabase
      .from('submissions')
      .insert([{
        ...submissionData,
        submitted_at: new Date().toISOString(),
        status: 'submitted'
      }])
      .select()
      .single();
      
    if (error) throw error;
    return data as Submission;
  },

  // Grade a submission
  gradeSubmission: async (submissionId: string, grade: number, feedback: string, gradedById: string) => {
    const { data, error } = await supabase
      .from('submissions')
      .update({
        grade,
        feedback,
        graded_by: gradedById,
        graded_at: new Date().toISOString(),
        status: 'graded'
      })
      .eq('id', submissionId)
      .select()
      .single();
      
    if (error) throw error;
    return data as Submission;
  },
};

// Progress related functions
export const progressService = {
  // Get student progress for a class
  getStudentProgress: async (studentId: string, classId: string): Promise<StudentProgress | null> => {
    const { data, error } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', studentId)
      .eq('class_id', classId)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    return data as StudentProgress;
  },

  // Calculate and update student progress
  updateStudentProgress: async (studentId: string, classId: string) => {
    // Get all assignments for the class
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select('id, total_points')
      .eq('class_id', classId);
      
    if (assignmentsError) throw assignmentsError;
    
    // Get all submissions for the student in this class
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('assignment_id, grade, status')
      .eq('student_id', studentId)
      .in('assignment_id', assignments?.map(a => a.id) || []);
      
    if (submissionsError) throw submissionsError;
    
    // Calculate progress
    const totalAssignments = assignments?.length || 0;
    const completedAssignments = submissions?.filter(s => s.status === 'graded').length || 0;
    const gradedSubmissions = submissions?.filter(s => s.grade !== null) || [];
    const averageScore = gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum, sub) => {
          const assignment = assignments?.find(a => a.id === sub.assignment_id);
          const maxPoints = assignment?.total_points || 100;
          const grade = sub.grade || 0;
          return sum + (grade / maxPoints * 100);
        }, 0) / gradedSubmissions.length
      : 0;
    
    // Calculate letter grade (simple example, adjust as needed)
    const calculateLetterGrade = (score: number): string => {
      if (score >= 90) return 'A';
      if (score >= 80) return 'B';
      if (score >= 70) return 'C';
      if (score >= 60) return 'D';
      return 'F';
    };
    
    const currentGrade = calculateLetterGrade(averageScore);
    
    // Update or insert progress
    const { data: progress, error: progressError } = await supabase
      .from('student_progress')
      .upsert({
        student_id: studentId,
        class_id: classId,
        total_assignments: totalAssignments,
        completed_assignments: completedAssignments,
        average_score: parseFloat(averageScore.toFixed(2)),
        current_grade: currentGrade,
        last_updated: new Date().toISOString()
      })
      .select()
      .single();
      
    if (progressError) throw progressError;
    return progress as StudentProgress;
  },
};

// Types for dashboard service
type TeacherDashboardData = {
  totalClasses: number;
  totalStudents: number;
  totalAssignments: number;
  submissionsNeedingGrading: number;
  recentAssignments: Array<Assignment & { class?: { name: string } }>;
};

type StudentDashboardData = {
  totalClasses: number;
  overallAverage: number;
  upcomingAssignments: Array<Assignment & { class?: { name: string } }>;
  recentGrades: Array<{
    id: string;
    grade: number;
    assignment: Assignment & {
      class: {
        name: string;
      };
    };
  }>;
  classProgress: Array<{
    id: string;
    class_id: string;
    class_name?: string;
    student_id: string;
    total_assignments: number;
    completed_assignments: number;
    average_score: number;
    current_grade: string;
    last_updated: string;
  }>;
};

// Dashboard related functions
export const dashboardService = {
  // Get dashboard data for a teacher
  getTeacherDashboard: async (teacherId: string): Promise<TeacherDashboardData> => {
    // Get teacher's classes
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacherId);
      
    if (classesError) throw classesError;
    
    // Get total students across all classes
    const classIds = classes?.map(c => c.id) || [];
    let totalStudents = 0;
    
    if (classIds.length > 0) {
      const { count, error: countError } = await supabase
        .from('class_enrollments')
        .select('*', { count: 'exact', head: true })
        .in('class_id', classIds);
        
      if (countError) throw countError;
      totalStudents = count || 0;
    }
    
    // Get recent assignments with class names
    const { data: recentAssignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select(`
        *,
        class:classes(name)
      `)
      .in('class_id', classIds)
      .order('due_date', { ascending: true })
      .limit(5);
      
    if (assignmentsError) throw assignmentsError;
    
    // Get recent submissions that need grading
    const assignmentIds = recentAssignments?.map(a => a.id) || [];
    let submissionsNeedingGrading = 0;
    
    if (assignmentIds.length > 0) {
      const { count, error: countError } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .in('assignment_id', assignmentIds)
        .eq('status', 'submitted');
        
      if (countError) throw countError;
      submissionsNeedingGrading = count || 0;
    }
    
    return {
      totalClasses: classes?.length || 0,
      totalStudents,
      totalAssignments: recentAssignments?.length || 0,
      submissionsNeedingGrading,
      recentAssignments: recentAssignments || []
    };
  },
  
  // Get dashboard data for a student
  getStudentDashboard: async (studentId: string): Promise<StudentDashboardData> => {
    // Get student's class enrollments
    interface EnrollmentWithClass {
      class: {
        id: string;
        name: string;
      } | null;
    }

    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('class:classes(*)')
      .eq('student_id', studentId)
      .eq('status', 'active');
      
    if (enrollmentsError) throw enrollmentsError;
    
    // Type assertion to ensure we have the correct shape
    const typedEnrollments = enrollments as unknown as Array<{ class: { id: string } | null }>;
    const classIds = typedEnrollments
      .map(e => e.class?.id)
      .filter((id): id is string => Boolean(id));
    
    // Get upcoming assignments
    let upcomingAssignments: Array<Assignment & { class?: { name: string } }> = [];
    
    if (classIds.length > 0) {
      // Get upcoming assignments with class names
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          *,
          class:classes(name)
        `)
        .in('class_id', classIds)
        .gte('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })
        .limit(5);
        
      if (assignmentsError) throw assignmentsError;
      upcomingAssignments = assignments || [];
    }
    
    // Get recent grades with assignment and class info
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select(`
        id,
        grade,
        assignment:assignments(
          *,
          class:classes(name)
        )
      `)
      .eq('student_id', studentId)
      .eq('status', 'graded')
      .order('graded_at', { ascending: false })
      .limit(5);
      
    if (submissionsError) throw submissionsError;
    
    // Get overall progress
    const { data: progress, error: progressError } = await supabase
      .from('student_progress')
      .select('*')
      .eq('student_id', studentId);
      
    if (progressError) throw progressError;
    
    const overallAverage = progress && progress.length > 0
      ? progress.reduce((sum, p) => sum + (p.average_score || 0), 0) / progress.length
      : 0;
    
    // Transform progress data to include class names
    const classProgress = await Promise.all(
      (progress || []).map(async (item) => {
        const { data: classData } = await supabase
          .from('classes')
          .select('name')
          .eq('id', item.class_id)
          .single();
          
        return {
          ...item,
          class_name: classData?.name
        };
      })
    );
    
    return {
      totalClasses: enrollments?.length || 0,
      overallAverage: parseFloat(overallAverage.toFixed(2)),
      upcomingAssignments,
      recentGrades: (submissions || []) as unknown as StudentDashboardData['recentGrades'],
      classProgress
    };
  },
};
