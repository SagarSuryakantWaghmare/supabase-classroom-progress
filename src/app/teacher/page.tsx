'use client';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/ui/StatCard';
import { 
  AcademicCapIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface ClassInfo {
  id: string;
  name: string;
  studentCount: number;
  averageScore: number;
  assignmentsDue: number;
}

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);

  useEffect(() => {
    // Simulate API call
    const fetchTeacherClasses = async () => {
      try {
        setTimeout(() => {
          setClasses([
            { id: '1', name: 'Mathematics 101', studentCount: 32, averageScore: 82, assignmentsDue: 2 },
            { id: '2', name: 'Advanced Calculus', studentCount: 24, averageScore: 78, assignmentsDue: 1 },
            { id: '3', name: 'Linear Algebra', studentCount: 28, averageScore: 85, assignmentsDue: 0 },
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching teacher classes:', error);
        setLoading(false);
      }
    };
    
    fetchTeacherClasses();
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

  return (
    <AppLayout 
      title="Teacher Dashboard"
      headerActions={
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create New Class
        </button>
      }
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Classes"
          value={classes.length}
          icon={<AcademicCapIcon className="h-6 w-6" />}
        />
        <StatCard
          title="Total Students"
          value={classes.reduce((sum, cls) => sum + cls.studentCount, 0)}
          icon={<UserGroupIcon className="h-6 w-6" />}
        />
        <StatCard
          title="Average Class Score"
          value={`${Math.round(classes.reduce((sum, cls) => sum + cls.averageScore, 0) / classes.length)}%`}
          icon={<DocumentTextIcon className="h-6 w-6" />}
        />
        <StatCard
          title="Assignments Due"
          value={classes.reduce((sum, cls) => sum + cls.assignmentsDue, 0)}
          icon={<ClockIcon className="h-6 w-6" />}
          className="bg-amber-50"
        />
      </div>

      {/* Classes List */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">My Classes</h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{cls.name}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {cls.studentCount} students
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Average Score</span>
                    <span className="text-sm font-semibold text-gray-900">{cls.averageScore}%</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${cls.averageScore}%` }}
                    ></div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Assignments Due</span>
                    <span className={`text-sm font-semibold ${cls.assignmentsDue > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                      {cls.assignmentsDue} {cls.assignmentsDue === 1 ? 'assignment' : 'assignments'}
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setSelectedClass(cls)}
                  >
                    View Class
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Upcoming Tasks</h2>
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
          <ul role="list" className="divide-y divide-gray-200">
            {[
              { id: 1, class: 'Mathematics 101', task: 'Grade Quiz #3', due: 'Tomorrow', priority: 'high' },
              { id: 2, class: 'Advanced Calculus', task: 'Prepare lecture on Derivatives', due: 'In 2 days', priority: 'medium' },
              { id: 3, class: 'Linear Algebra', task: 'Update course materials', due: 'Next week', priority: 'low' },
            ].map((task) => (
              <li key={task.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-3 ${
                      task.priority === 'high' ? 'bg-red-500' : 
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-300'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{task.task}</p>
                      <p className="text-sm text-gray-500">{task.class}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">Due {task.due}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Class Details Modal */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{selectedClass.name}</h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => setSelectedClass(null)}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Students</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{selectedClass.studentCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Average Score</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{selectedClass.averageScore}%</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Assignment
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Students
                  </button>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="text-sm font-medium text-gray-500 mb-4">Recent Assignments</h4>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Assignment #{i}</p>
                        <p className="text-xs text-gray-500">Due: {new Date(Date.now() + i * 86400000).toLocaleDateString()}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Grade
                        </button>
                        <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setSelectedClass(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
