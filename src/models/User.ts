import { ROLES } from '@/config/env';

export type UserRole = typeof ROLES[keyof typeof ROLES];
import { supabase } from '@/lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

export interface IUser {
  id: string;  // Matches Supabase auth.users.id
  email: string;
  name: string;
  role: UserRole;
  class_id?: string | null;  // References classes.id
  created_at: string;
  updated_at: string;
}

export type NewUser = {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  class_id?: string | null;
};

export type UserUpdate = Partial<Omit<IUser, 'id' | 'created_at' | 'updated_at'>> & { id: string };

export class UserService {
  private static readonly TABLE_NAME = 'users';

  static async create(userData: NewUser): Promise<{ data: IUser | null; error: PostgrestError | Error | null }> {
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Then create the user profile
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert([
          {
            id: authData.user.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            class_id: userData.class_id || null,
          },
        ])
        .select('*')
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating user:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to create user') 
      };
    }
  }

  static async getById(id: string): Promise<{ data: IUser | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  }

  static async getByEmail(email: string): Promise<{ data: IUser | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('email', email)
      .single();

    return { data, error };
  }

  static async update(
    id: string, 
    updates: Partial<Omit<IUser, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<{ data: IUser | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    return { data, error };
  }

  static async delete(id: string): Promise<{ error: PostgrestError | null }> {
    const { error } = await supabase
      .from(this.TABLE_NAME)
      .delete()
      .eq('id', id);

    return { error };
  }

  // Get all users (only accessible by head teachers)
  static async getAll(): Promise<{ data: IUser[] | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .order('name');

    return { data, error };
  }

  // Get users by role
  static async getByRole(role: UserRole): Promise<{ data: IUser[] | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('role', role)
      .order('name');

    return { data, error };
  }

  // Get students in a class
  static async getStudentsByClass(classId: string): Promise<{ data: IUser[] | null; error: PostgrestError | null }> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('role', 'student')
      .eq('class_id', classId)
      .order('name');

    return { data, error };
  }
}
