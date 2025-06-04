import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bjkdywykviuubzvpnrtm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqa2R5d3lrdml1dWJ6dnBucnRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMzAwNzksImV4cCI6MjA2NDYwNjA3OX0.3STGDMfjbsoWplR64f_wkA1IdMc5sWnOPM9viUJ3t6c';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
