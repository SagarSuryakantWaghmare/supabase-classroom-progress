import { createClient } from '@supabase/supabase-js';
import { config } from '@/config/env';
import { NextApiRequest, NextApiResponse } from 'next';

// Create a single supabase client for interacting with your database
const supabase = createClient(config.supabase.url, config.supabase.anonKey);

// Export the supabase client for direct use
export { supabase };

type HandlerFunction = (
  req: NextApiRequest,
  res: NextApiResponse,
  context: { supabase: typeof supabase }
) => Promise<void> | void;

// For backward compatibility with existing code
export function withDatabase(handler: HandlerFunction) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      return await handler(req, res, { supabase });
    } catch (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
}
