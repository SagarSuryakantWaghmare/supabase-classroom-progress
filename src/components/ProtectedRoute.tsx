'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES, type UserRole } from '@/config/env';
import { Loader2, AlertCircle } from 'lucide-react';

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
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    const checkAccess = async () => {
      try {
        // If no user data yet, redirect to login
        if (!user) {
          await router.push(redirectTo);
          return;
        }

        // Check if user has required role
        if (user.role && !allowedRoles.includes(user.role)) {
          setAccessDenied(true);
          return;
        }

        // Access granted
        setAccessDenied(false);
      } catch (err) {
        console.error('Error checking access:', err);
        setAccessDenied(true);
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [user, isLoading, router, redirectTo, allowedRoles]);

  // Show loading state
  if ((isChecking || isLoading) && showLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Checking permissions...</p>
      </div>
    );
  }

  // Show access denied
  if (accessDenied || !user || (user?.role && !allowedRoles.includes(user.role))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md text-center">
          <AlertCircle className="w-12 h-12 mb-4 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-center mb-4">
            You don&apos;t have permission to access this page. Please contact an administrator if you believe this is an error.
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
