import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type ClassAverage = {
  student_id: string;
  student_name: string;
  average_score: number;
  total_assignments: number;
};

export const useClassAverages = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<ClassAverage[] | null>(null);

  const fetchClassAverages = useCallback(async (classId: string): Promise<ClassAverage[]> => {
    setLoading(true);
    setError(null);
    
    try {
      // First, get all students in the class
      const { data: students, error: studentsError } = await supabase
        .from('users')
        .select('id, name')
        .eq('class_id', classId)
        .eq('role', 'student');

      if (studentsError) {
        throw studentsError;
      }

      if (!students || students.length === 0) {
        setData([]);
        return [];
      }

      // Get all assignments for the class
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select('id')
        .eq('class_id', classId);

      if (assignmentsError) {
        throw assignmentsError;
      }

      const assignmentIds = assignments?.map(a => a.id) || [];
      const studentIds = students.map(s => s.id);

      // Get all scores for these students and assignments
      const { data: scores, error: scoresError } = await supabase
        .from('scores')
        .select('student_id, assignment_id, score')
        .in('student_id', studentIds)
        .in('assignment_id', assignmentIds);

      if (scoresError) {
        throw scoresError;
      }

      // Calculate averages for each student
      const studentAverages = students.map(student => {
        const studentScores = scores?.filter(s => s.student_id === student.id) || [];
        const totalScore = studentScores.reduce((sum, score) => sum + (score.score || 0), 0);
        const averageScore = studentScores.length > 0 ? totalScore / studentScores.length : 0;
        
        return {
          student_id: student.id,
          student_name: student.name,
          average_score: parseFloat(averageScore.toFixed(2)),
          total_assignments: studentScores.length
        };
      });

      // Sort by average score (highest first)
      const sortedAverages = [...studentAverages].sort((a, b) => b.average_score - a.average_score);
      
      setData(sortedAverages);
      return sortedAverages;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchClassAverages,
    data,
    loading,
    error,
  };
};
