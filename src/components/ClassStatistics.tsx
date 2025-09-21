'use client';

import { useEffect, useState } from 'react';
import { useClassAverages, type ClassAverage } from '@/hooks/useClassAverages';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { supabase } from '@/lib/supabase';

// Define types for Supabase responses
type User = {
  id: string;
  name: string;
};

type ProgressData = {
  student_id: string;
  average_score: number;
  total_assignments: number;
};

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type StudentData = {
  student_id: string;
  name: string;
  average_score: number;
  total_assignments: number;
};

type ClassStatisticsProps = {
  classId: string;
};

export default function ClassStatistics({ classId }: ClassStatisticsProps) {
  const [students, setStudents] = useState<StudentData[]>([]);
  const { fetchClassAverages, loading, error } = useClassAverages();
  
  // Use the exported ClassAverage type from useClassAverages

  useEffect(() => {
    async function loadData() {
      try {
        // First, fetch the class averages
        const averages = await fetchClassAverages(classId);
        
        if (!averages || averages.length === 0) return;
        
        // Then, fetch student names
        const { data: studentsData, error: studentsError } = await supabase
          .from('users')
          .select('id, name')
          .in('id', averages.map(avg => avg.student_id));
        
        if (studentsError) throw studentsError;
        
        // Combine the data
        const studentMap = new Map(
          (studentsData as User[]).map(student => [student.id, student.name])
        );
        
        const combinedData: StudentData[] = averages.map(avg => ({
          ...avg,
          name: studentMap.get(avg.student_id) || 'Unknown Student',
        }));
        
        setStudents(combinedData);
      } catch (err) {
        console.error('Error loading class statistics:', err);
      }
    }
    
    if (classId) {
      loadData();
    }
  }, [classId, fetchClassAverages]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Error loading class statistics: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
        <p className="mt-1 text-sm text-gray-500">
          No statistics available for this class yet.
        </p>
      </div>
    );
  }

  // Prepare chart data
  const chartData: ChartData<'bar'> = {
    labels: students.map(student => student.name),
    datasets: [
      {
        label: 'Average Score',
        data: students.map(student => student.average_score),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Average Scores by Student',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Average Score (%)',
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Class Performance</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Overview of student performance in this class.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <div className="p-4">
            <Bar data={chartData} options={options} />
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Student Details</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Individual student statistics and performance metrics.
          </p>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignments Completed
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.student_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.average_score.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.total_assignments}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
