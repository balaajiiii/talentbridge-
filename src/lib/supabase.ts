import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Profile = {
  id: string;
  full_name: string;
  role: 'talent' | 'organizer';
  city: string | null;
  phone: string | null;
  talent_category: string | null;
  organization_name: string | null;
  created_at: string;
};

export type EventRow = {
  id: string;
  title: string;
  description: string;
  organizer_name: string;
  organizer_id: string | null;
  date: string;
  time: string;
  venue: string;
  city: string;
  budget: string;
  talent_category: string;
  available_slots: number;
  poster_url: string | null;
  created_at: string;
};

export const TALENT_CATEGORIES = [
  'Music',
  'Dance',
  'Photography',
  'Painting',
  'Comedy',
  'Poetry',
  'Theatre',
  'Rap & Hip-hop',
  'DJ',
  'Anchor / Emcee',
];
