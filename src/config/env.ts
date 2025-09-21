// Environment configuration
export const config = {
  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  // MongoDB
  mongo: {
    uri: process.env.MONGODB_URI || '',
    dbName: process.env.MONGODB_DB_NAME || 'classroom_tracker',
  },
  // App configuration
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};

export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  HEAD_TEACHER: 'head_teacher',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];
