'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { IUser } from '@/models/User';
import AuthService, { type SignUpData, type LoginData } from '@/services/auth.service';

type AuthContextType = {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (credentials: LoginData) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  const clearError = useCallback(() => setError(null), []);

  // Handle successful authentication
  const handleAuthSuccess = useCallback((userData: IUser | null) => {
    if (!userData) {
      setUser(null);
      return;
    }
    setUser(userData);
    setError(null);
  }, []);

  // Handle authentication errors
  const handleAuthError = useCallback((error: Error) => {
    console.error('Auth error:', error);
    setError(error);
    setUser(null);
  }, []);

  // Check for active session on mount
  const checkSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const { session, error: sessionError } = await AuthService.getSession();
      
      if (sessionError) {
        throw sessionError;
      }

      if (session?.user) {
        handleAuthSuccess(session.user);
      } else {
        handleAuthSuccess(null);
      }
    } catch (err) {
      handleAuthError(err instanceof Error ? err : new Error('Failed to check session'));
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthSuccess, handleAuthError]);

  // Set up auth state listener
  useEffect(() => {
    // Check initial session
    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Get the full user profile
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError) {
            console.error('Error fetching user profile:', userError);
            handleAuthError(new Error('Failed to load user profile'));
            return;
          }

          handleAuthSuccess({
            ...session.user,
            ...userData,
          });
        } else {
          handleAuthSuccess(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [checkSession, handleAuthSuccess, handleAuthError]);

  // Sign up a new user
  const signUp = useCallback(async (data: SignUpData) => {
    try {
      setIsLoading(true);
      const { user, error: signUpError } = await AuthService.signUp(data);
      
      if (signUpError) {
        throw signUpError;
      }
      
      if (user) {
        handleAuthSuccess(user);
        router.push('/dashboard');
      }
    } catch (err) {
      handleAuthError(err instanceof Error ? err : new Error('Failed to sign up'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthSuccess, handleAuthError, router]);

  // Sign in a user
  const signIn = useCallback(async (credentials: LoginData) => {
    try {
      setIsLoading(true);
      const { user, error: signInError } = await AuthService.signIn(credentials);
      
      if (signInError) {
        throw signInError;
      }
      
      if (user) {
        handleAuthSuccess(user);
        router.push('/dashboard');
      }
    } catch (err) {
      handleAuthError(err instanceof Error ? err : new Error('Failed to sign in'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthSuccess, handleAuthError, router]);

  // Sign out the current user
  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      const { error } = await AuthService.signOut();
      
      if (error) {
        throw error;
      }
      
      handleAuthSuccess(null);
      router.push('/login');
    } catch (err) {
      handleAuthError(err instanceof Error ? err : new Error('Failed to sign out'));
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthSuccess, handleAuthError, router]);

  // Refresh the current session
  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      await checkSession();
    } catch (err) {
      handleAuthError(err instanceof Error ? err : new Error('Failed to refresh session'));
    } finally {
      setIsLoading(false);
    }
  }, [checkSession, handleAuthError]);

  // Context value
  const contextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    signUp,
    signIn,
    signOut,
    clearError,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
