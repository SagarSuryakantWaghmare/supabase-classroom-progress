'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES, type UserRole } from '@/config/env';

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
};

export const ProtectedRoute = ({
  children,
  allowedRoles = Object.values(ROLES),
  redirectTo = '/login',
}: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Redirect to login if not authenticated
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // Check if user has required role
    if (role && !allowedRoles.includes(role)) {
      // Redirect to unauthorized or dashboard based on user role
      const redirectPath = role === ROLES.STUDENT ? '/student' : 
                         role === ROLES.TEACHER ? '/teacher' : 
                         role === ROLES.HEAD_TEACHER ? '/head-teacher' : '/';
      router.push(redirectPath);
    }
  }, [user, role, loading, allowedRoles, router, redirectTo]);

  if (loading || !user || (role && !allowedRoles.includes(role))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
};
