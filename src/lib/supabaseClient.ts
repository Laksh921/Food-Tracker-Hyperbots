import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wigohlqktyhppzxusbed.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpZ29obHFrdHlocHB6eHVzYmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MzMzMzEsImV4cCI6MjA2NDUwOTMzMX0.tBiSA2kiE7pRjrgZEF56u-P1pWZkudveevOcP25iT1M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
