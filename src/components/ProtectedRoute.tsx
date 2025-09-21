'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES, type UserRole } from '@/config/env';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  showLoading?: boolean;
};

export const ProtectedRoute = ({
  children,
  allowedRoles = Object.values(ROLES),
  redirectTo = '/login',
  showLoading = true,
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading, error, clearError } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    const checkAccess = async () => {
      try {
        // If not authenticated, redirect to login
        if (!isAuthenticated || !user) {
          router.push(redirectTo);
          return;
        }

        // Get user role
        const userRole = user.role;

        // If user has no role, wait a bit more
        if (!userRole) {
          const timeout = setTimeout(() => {
            setAccessDenied(true);
            setIsChecking(false);
          }, 3000);
          return () => clearTimeout(timeout);
        }

        // Check if user has required role
        if (!allowedRoles.includes(userRole)) {
          setAccessDenied(true);
          // Redirect to appropriate dashboard based on role
          const redirectPath = userRole === ROLES.STUDENT ? '/student' : 
                            userRole === ROLES.TEACHER ? '/teacher' : 
                            userRole === ROLES.HEAD_TEACHER ? '/head-teacher' : '/';
          router.push(redirectPath);
          return;
        }

        // Access granted
        setAccessDenied(false);
        setIsChecking(false);
      } catch (err) {
        console.error('Error checking access:', err);
        const error = err instanceof Error ? err : new Error('An unknown error occurred');
        clearError(); // Clear any previous errors
        setAccessDenied(true);
      } finally {
        if (!isLoading) {
          setIsChecking(false);
        }
      }
    };

    checkAccess();
  }, [user, isAuthenticated, isLoading, router, redirectTo, allowedRoles, clearError]);

  // Show loading state
  if ((isChecking || isLoading) && showLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Checking permissions...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Authentication Error</h2>
        </div>
        <p className="mt-2 text-center text-muted-foreground">
          {error.message || 'An error occurred while checking your permissions.'}
        </p>
        <button
          onClick={clearError}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show access denied
  if (accessDenied || !user || (user?.role && !allowedRoles.includes(user.role))) {
    const userRole = user?.role || 'Unknown';
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Please contact an administrator if you believe this is an error.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Go to Home
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm font-medium"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
};
