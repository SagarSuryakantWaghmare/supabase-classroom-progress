'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/config/env';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, role, signOut } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role) {
      setLoading(false);
    }
  }, [role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const renderDashboardContent = () => {
    switch (role) {
      case ROLES.STUDENT:
        return <StudentDashboard />;
      case ROLES.TEACHER:
        return <TeacherDashboard />;
      case ROLES.HEAD_TEACHER:
        return <HeadTeacherDashboard />;
      default:
        return <div>Unauthorized</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Classroom Tracker</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/dashboard" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </Link>
                {role === ROLES.TEACHER || role === ROLES.HEAD_TEACHER ? (
                  <Link href="/classes" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    My Classes
                  </Link>
                ) : null}
                {role === ROLES.HEAD_TEACHER && (
                  <Link href="/admin" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Admin
                  </Link>
                )}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <button
                onClick={signOut}
                className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="sr-only">Sign out</span>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {renderDashboardContent()}
        </div>
      </main>
    </div>
  );
}

function StudentDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900">Student Dashboard</h2>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Add student-specific widgets here */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">My Progress</h3>
            <p className="mt-2 text-sm text-gray-500">View your academic progress and grades.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TeacherDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900">Teacher Dashboard</h2>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Add teacher-specific widgets here */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">My Classes</h3>
            <p className="mt-2 text-sm text-gray-500">Manage your classes and students.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeadTeacherDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900">Head Teacher Dashboard</h2>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Add head-teacher-specific widgets here */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">School Overview</h3>
            <p className="mt-2 text-sm text-gray-500">View school-wide statistics and reports.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
