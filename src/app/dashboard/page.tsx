'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/ui/StatCard';
import { 
  UsersIcon, 
  UserGroupIcon, 
  AcademicCapIcon, 
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

interface SchoolStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalAssignments: number;
  averageScore: number;
  classAverages: Array<{
    id: string;
    name: string;
    teacher: string;
    studentCount: number;
    averageScore: number;
  }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SchoolStats | null>(null);

  useEffect(() => {
    const fetchSchoolStats = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setStats({
            totalStudents: 1245,
            totalTeachers: 48,
            totalClasses: 36,
            totalAssignments: 528,
            averageScore: 78.5,
            classAverages: [
              { id: '1', name: 'Mathematics', teacher: 'Dr. Smith', studentCount: 32, averageScore: 82 },
              { id: '2', name: 'Physics', teacher: 'Prof. Johnson', studentCount: 28, averageScore: 78 },
              { id: '3', name: 'Chemistry', teacher: 'Dr. Williams', studentCount: 25, averageScore: 75 },
              { id: '4', name: 'Biology', teacher: 'Dr. Brown', studentCount: 30, averageScore: 85 },
            ]
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching school stats:', error);
        setLoading(false);
      }
    };
    
    fetchSchoolStats();
  }, []);

  if (loading || !stats) {
    return (
      <AppLayout title="Loading...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title="School Overview"
      headerActions={
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Generate Report
        </button>
      }
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents.toLocaleString()}
          icon={<UsersIcon className="h-6 w-6" />}
          trend={{ value: '12%', isPositive: true }}
        />
        <StatCard
          title="Total Teachers"
          value={stats.totalTeachers.toLocaleString()}
          icon={<UserGroupIcon className="h-6 w-6" />}
          trend={{ value: '5%', isPositive: true }}
        />
        <StatCard
          title="Total Classes"
          value={stats.totalClasses}
          icon={<AcademicCapIcon className="h-6 w-6" />}
        />
        <StatCard
          title="Assignments"
          value={stats.totalAssignments.toLocaleString()}
          icon={<DocumentTextIcon className="h-6 w-6" />}
          trend={{ value: '8%', isPositive: true }}
        />
      </div>

      {/* Class Performance */}
      <div className="mt-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h2 className="text-lg font-medium text-gray-900">Class Performance</h2>
            <p className="mt-1 text-sm text-gray-700">
              Average scores and student count for each class
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Class
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Teacher
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Students
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Average Score
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">View</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {stats.classAverages.map((classItem) => (
                      <tr key={classItem.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {classItem.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {classItem.teacher}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {classItem.studentCount}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <span className="font-medium">{classItem.averageScore}%</span>
                            <div className="ml-2 flex items-center">
                              {classItem.averageScore >= 80 ? (
                                <>
                                  <ArrowUpIcon className="h-4 w-4 text-green-500" aria-hidden="true" />
                                  <span className="text-xs text-green-600 ml-0.5">
                                    {Math.floor(Math.random() * 10) + 1}%
                                  </span>
                                </>
                              ) : (
                                <>
                                  <ArrowDownIcon className="h-4 w-4 text-red-500" aria-hidden="true" />
                                  <span className="text-xs text-red-600 ml-0.5">
                                    {Math.floor(Math.random() * 5) + 1}%
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <a href={`/class/${classItem.id}`} className="text-blue-600 hover:text-blue-900">
                            View<span className="sr-only">, {classItem.name}</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
          <ul role="list" className="divide-y divide-gray-200">
            {[
              { id: 1, user: 'John Doe', action: 'submitted', item: 'Math Assignment #5', time: '2 hours ago' },
              { id: 2, user: 'Jane Smith', action: 'graded', item: 'Physics Quiz #3', time: '4 hours ago' },
              { id: 3, user: 'Mike Johnson', action: 'posted', item: 'New announcement in Biology', time: '1 day ago' },
              { id: 4, user: 'Sarah Williams', action: 'commented', item: 'on Chemistry discussion', time: '2 days ago' },
            ].map((activity) => (
              <li key={activity.id} className="px-6 py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {activity.user.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.user}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {activity.action} {activity.item}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
