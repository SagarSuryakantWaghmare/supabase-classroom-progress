'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/ui/StatCard';
import { 
  UsersIcon, 
  AcademicCapIcon, 
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { dashboardService } from '@/services/classroomService';

interface DashboardData {
  isTeacher: boolean;
  totalClasses: number;
  totalStudents?: number;
  totalAssignments?: number;
  overallAverage?: number;
  submissionsNeedingGrading?: number;
  recentAssignments: Array<{
    id: string;
    title: string;
    due_date: string;
    class_id: string;
    class?: {
      name: string;
    };
  }>;
  recentGrades: Array<{
    id: string;
    grade: number;
    assignment: {
      id: string;
      title: string;
      total_points: number;
      class: {
        id: string;
        name: string;
      };
    };
  }>;
  classProgress: Array<{
    id: string;
    class_id: string;
    student_id: string;
    total_assignments: number;
    completed_assignments: number;
    average_score: number;
    current_grade: string;
    last_updated: string;
    class_name?: string;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        if (!user) {
          throw new Error('User not authenticated');
        }

        if (user.role === 'teacher') {
          const teacherData = await dashboardService.getTeacherDashboard(user.id);
          setDashboardData({
            isTeacher: true,
            totalClasses: teacherData.totalClasses,
            totalStudents: teacherData.totalStudents,
            totalAssignments: teacherData.totalAssignments,
            submissionsNeedingGrading: teacherData.submissionsNeedingGrading,
            recentAssignments: teacherData.recentAssignments,
            recentGrades: [],
            classProgress: []
          });
        } else {
          const studentData = await dashboardService.getStudentDashboard(user.id);
          setDashboardData({
            isTeacher: false,
            totalClasses: studentData.totalClasses,
            overallAverage: studentData.overallAverage,
            recentAssignments: studentData.recentAssignments,
            recentGrades: studentData.recentGrades,
            classProgress: studentData.classProgress
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  if (loading || !dashboardData) {
    return (
      <AppLayout title="Loading...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Error">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!dashboardData) return null;
  
  const isTeacher = dashboardData.isTeacher;
  const hasRecentAssignments = dashboardData.recentAssignments.length > 0;
  const hasRecentGrades = dashboardData.recentGrades.length > 0;
  const hasClassProgress = dashboardData.classProgress.length > 0;

  return (
    <AppLayout 
      title={isTeacher ? 'Teacher Dashboard' : 'My Dashboard'}
      headerActions={
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isTeacher ? 'Generate Report' : 'View All'}
        </button>
      }
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4">
        {isTeacher ? (
          <>
            <StatCard
              title="Total Classes"
              value={dashboardData.totalClasses.toString()}
              icon={<AcademicCapIcon className="h-6 w-6" />}
            />
            <StatCard
              title="Total Students"
              value={dashboardData.totalStudents?.toString() || '0'}
              icon={<UsersIcon className="h-6 w-6" />}
            />
            <StatCard
              title="Assignments"
              value={dashboardData.totalAssignments?.toString() || '0'}
              icon={<DocumentTextIcon className="h-6 w-6" />}
            />
            <StatCard
              title="To Grade"
              value={dashboardData.submissionsNeedingGrading?.toString() || '0'}
              icon={<ClockIcon className="h-6 w-6" />}
              className={dashboardData.submissionsNeedingGrading ? 'bg-amber-50' : ''}
            />
          </>
        ) : (
          <>
            <StatCard
              title="My Classes"
              value={dashboardData.totalClasses.toString()}
              icon={<AcademicCapIcon className="h-6 w-6" />}
            />
            <StatCard
              title="Overall Average"
              value={`${dashboardData.overallAverage?.toFixed(1) || '0'}%`}
              icon={<DocumentTextIcon className="h-6 w-6" />}
            />
            <StatCard
              title="Upcoming Assignments"
              value={dashboardData.recentAssignments?.length.toString() || '0'}
              icon={<ClockIcon className="h-6 w-6" />}
            />
            <StatCard
              title="Recent Grades"
              value={dashboardData.recentGrades?.length.toString() || '0'}
              icon={<DocumentTextIcon className="h-6 w-6" />}
            />
          </>
        )}
      </div>

      {/* Upcoming Assignments */}
      {hasRecentAssignments && (
        <div className="mt-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h2 className="text-lg font-medium text-gray-900">
                {isTeacher ? 'Recent Assignments' : 'Upcoming Assignments'}
              </h2>
              <p className="mt-1 text-sm text-gray-700">
                {isTeacher 
                  ? 'Recently created assignments across your classes' 
                  : 'Your upcoming assignment deadlines'}
              </p>
            </div>
          </div>
          <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {dashboardData.recentAssignments.map((assignment) => (
                <li key={assignment.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {assignment.title}
                      </p>
                      {assignment.class?.name && (
                        <p className="text-sm text-gray-500">
                          {assignment.class.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-4">
                        Due {new Date(assignment.due_date).toLocaleDateString()}
                      </span>
                      <a 
                        href={`/assignments/${assignment.id}`} 
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        View
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {!hasRecentAssignments && (
              <div className="px-6 py-4 text-center text-sm text-gray-500">
                {isTeacher ? 'No recent assignments' : 'No upcoming assignments'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Grades (Student View) */}
      {!isTeacher && hasRecentGrades && (
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
                    Class
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentGrades?.map((grade) => (
                  <tr key={grade.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {grade.assignment.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {grade.assignment.class?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.grade}/{grade.assignment.total_points} 
                      <span className="text-gray-500">
                        ({(grade.grade / grade.assignment.total_points * 100).toFixed(1)}%)
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href={`/assignments/${grade.id}`} className="text-blue-600 hover:text-blue-900">
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Class Progress (Student View) */}
      {!isTeacher && hasClassProgress && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Class Progress</h2>
          <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Grade
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.classProgress?.map((classItem) => (
                  <tr key={classItem.class_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {classItem.class_name || 'Unnamed Class'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${classItem.average_score}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 inline-block">
                        {classItem.average_score.toFixed(1)}% Complete
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        classItem.current_grade === 'A' ? 'bg-green-100 text-green-800' :
                        classItem.current_grade === 'B' ? 'bg-blue-100 text-blue-800' :
                        classItem.current_grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {classItem.current_grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href={`/classes/${classItem.class_id}`} className="text-blue-600 hover:text-blue-900">
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submissions Needing Grading (Teacher View) */}
      {isTeacher && dashboardData.submissionsNeedingGrading ? (
        <div className="mt-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h2 className="text-lg font-medium text-gray-900">Submissions Needing Grading</h2>
              <p className="mt-1 text-sm text-gray-700">
                {dashboardData.submissionsNeedingGrading} assignments waiting for your review
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <a
                href="/grading"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
              >
                Grade Now
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </AppLayout>
  );
}
