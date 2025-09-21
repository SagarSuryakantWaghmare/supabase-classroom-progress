import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export type ClassAverage = {
  student_id: string;
  average_score: number;
  total_assignments: number;
};

type ApiResponse = {
  data: ClassAverage[];
  error?: string;
};

export const useClassAverages = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<ClassAverage[] | null>(null);

  const fetchClassAverages = async (classId: string): Promise<ClassAverage[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/class-averages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ classId }),
      });

      if (!response.ok) {
        const errorData: { error?: string } = await response.json();
        throw new Error(errorData?.error || 'Failed to fetch class averages');
      }

      const result: ApiResponse = await response.json();
      const averages = result.data || [];
      setData(averages);
      return averages;
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
