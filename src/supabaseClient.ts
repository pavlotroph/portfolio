// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = 'https://isglxygpyiuszrsqfttp.supabase.co';
const supabaseAnon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZ2x4eWdweWl1c3pyc3FmdHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwOTY1NDcsImV4cCI6MjA2MjY3MjU0N30.BTMA8nSggN3Ia6Ud_RgssY6dMwWl-h1t7_T7e-ct6sg';

export const supabase = createClient(supabaseUrl, supabaseAnon)
