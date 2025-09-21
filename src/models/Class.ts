export interface IClass {
  id?: string; // Supabase uses UUID by default
  name: string;
  teacher_id: string; // References users table
  students?: string[]; // Array of user IDs
  created_at?: string;
  updated_at?: string;
}

// For TypeScript type when inserting a new class (omits the auto-generated fields)
export type ClassInsert = Omit<IClass, 'id' | 'created_at' | 'updated_at'>;

// For TypeScript type when updating a class (makes all fields optional and omits some)
export type ClassUpdate = Partial<Omit<IClass, 'id' | 'created_at'>> & { id: string };
