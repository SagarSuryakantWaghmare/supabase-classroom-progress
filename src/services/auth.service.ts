import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { IUser, UserRole } from '@/models/User';

export interface AuthResponse {
  user: IUser | null;
  error: Error | null;
  session: Session | null;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  class_id?: string; // Optional for students
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  // Sign up a new user
  static async signUp(userData: SignUpData): Promise<AuthResponse> {
    try {
      // 1. Sign up the user with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // 2. Create a user profile in the database
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            class_id: userData.role === 'student' ? userData.class_id : null,
          },
        ])
        .select('*')
        .single();

      if (profileError) {
        // If profile creation fails, try to delete the auth user to keep data consistent
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(`Failed to create user profile: ${profileError.message}`);
      }

      return {
        user: userProfile as IUser,
        error: null,
        session: authData.session,
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        user: null,
        error: error instanceof Error ? error : new Error('An unknown error occurred during sign up'),
        session: null,
      };
    }
  }

  // Sign in an existing user
  static async signIn(credentials: LoginData): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw error;
      }

      if (!data.session) {
        throw new Error('No session returned after sign in');
      }

      // Get the user profile with role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError || !userData) {
        // Sign out if we can't get the user profile
        await this.signOut();
        throw new Error('Failed to load user profile');
      }

      return {
        user: userData as IUser,
        error: null,
        session: data.session,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        user: null,
        error: error instanceof Error ? error : new Error('An unknown error occurred during sign in'),
        session: null,
      };
    }
  }

  // Sign out the current user
  static async signOut(): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  // Get the current user's session
  static async getSession() {
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
      return { session: null, error };
    }

    // Get the full user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.session.user.id)
      .single();

    if (userError || !userData) {
      return { session: null, error: userError || new Error('User not found') };
    }

    return {
      session: {
        ...data.session,
        user: {
          ...data.session.user,
          ...userData,
        },
      },
      error: null,
    };
  }

  // Listen for auth state changes
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Get the full user profile
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userData) {
          session.user = {
            ...session.user,
            ...userData,
          };
        }
      }
      callback(event, session);
    });
  }

  // Request password reset
  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  }

  // Update user password
  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  }
}

export default AuthService;
