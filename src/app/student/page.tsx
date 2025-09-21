'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/ui/StatCard';
import { 
  AcademicCapIcon, 
  BookOpenIcon, 
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'submitted' | 'pending' | 'overdue';
  score?: number;
  maxScore: number;
}

interface ClassInfo {
  id: string;
  name: string;
  teacher: string;
  progress: number;
  grade: string;
}

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchStudentData = async () => {
      try {
        setTimeout(() => {
          setAssignments([
            { 
              id: '1', 
              title: 'Algebra Quiz', 
              subject: 'Mathematics', 
              dueDate: '2023-11-15',
              status: 'submitted',
              score: 45,
              maxScore: 50
            },
            { 
              id: '2', 
              title: 'Lab Report', 
              subject: 'Physics', 
              dueDate: '2023-11-17',
              status: 'pending',
              maxScore: 30
            },
            { 
              id: '3', 
              title: 'Research Paper', 
              subject: 'Literature', 
              dueDate: '2023-11-10',
              status: 'overdue',
              maxScore: 100
            },
          ]);

          setClasses([
            { id: '1', name: 'Mathematics', teacher: 'Dr. Smith', progress: 78, grade: 'A-' },
            { id: '2', name: 'Physics', teacher: 'Prof. Johnson', progress: 85, grade: 'A' },
            { id: '3', name: 'Literature', teacher: 'Dr. Williams', progress: 65, grade: 'B' },
            { id: '4', name: 'Chemistry', teacher: 'Dr. Brown', progress: 92, grade: 'A+' },
          ]);

          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching student data:', error);
        setLoading(false);
      }
    };
    
    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <AppLayout title="Loading...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AppLayout>
    );
  }

  const upcomingAssignments = assignments.filter(a => a.status !== 'submitted');
  const completedAssignments = assignments.filter(a => a.status === 'submitted');
  const overallAverage = classes.length > 0 
    ? Math.round(classes.reduce((sum, cls) => sum + cls.progress, 0) / classes.length)
    : 0;

  return (
    <AppLayout 
      title="My Dashboard"
      headerActions={
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          View Report Card
        </button>
      }
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Overall Average"
          value={`${overallAverage}%`}
          icon={<ChartBarIcon className="h-6 w-6" />}
        />
        <StatCard
          title="Classes Enrolled"
          value={classes.length}
          icon={<AcademicCapIcon className="h-6 w-6" />}
        />
        <StatCard
          title="Assignments Due"
          value={upcomingAssignments.length}
          icon={<ClockIcon className="h-6 w-6" />}
          className={upcomingAssignments.length > 0 ? 'bg-amber-50' : ''}
        />
        <StatCard
          title="Completed"
          value={`${completedAssignments.length} of ${assignments.length}`}
          icon={<CheckCircleIcon className="h-6 w-6" />}
        />
      </div>

      {/* Upcoming Assignments */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Upcoming Assignments</h2>
          <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
        </div>
        
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
          {upcomingAssignments.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {upcomingAssignments.map((assignment) => (
                <li key={assignment.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {assignment.title}
                        </p>
                        <p className="text-sm text-gray-500">{assignment.subject}</p>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          assignment.status === 'overdue' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {assignment.status === 'overdue' ? 'Overdue' : 'Due'} {assignment.dueDate}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <div className="flex items-center">
                        <BookOpenIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500">
                          {assignment.maxScore} points
                        </span>
                      </div>
                      <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        {assignment.status === 'overdue' ? 'Submit Now' : 'Start Assignment'}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No upcoming assignments. Great job!</p>
            </div>
          )}
        </div>
      </div>

      {/* My Classes */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">My Classes</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900">{cls.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{cls.teacher}</p>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span className="font-medium">{cls.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${cls.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Current Grade</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    cls.grade === 'A+' || cls.grade === 'A' ? 'bg-green-100 text-green-800' :
                    cls.grade === 'A-' || cls.grade === 'B+' ? 'bg-blue-100 text-blue-800' :
                    cls.grade === 'B' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {cls.grade}
                  </span>
                </div>
                
                <div className="mt-4">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Class
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Grades */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Recent Grades</h2>
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {completedAssignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                    <div className="text-sm text-gray-500">{assignment.dueDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{assignment.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {assignment.score} / {assignment.maxScore} 
                      <span className="ml-1 text-gray-500">
                        ({(assignment.score! / assignment.maxScore * 100).toFixed(1)}%)
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Graded
                    </span>
                  </td>
                </tr>
              ))}
              {completedAssignments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No graded assignments yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
