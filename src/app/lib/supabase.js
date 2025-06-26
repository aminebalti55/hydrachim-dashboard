import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://srxcyvkvntjksrxcpwxw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyeGN5dmt2bnRqa3NyeGNwd3h3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2OTYyNjMsImV4cCI6MjA2NjI3MjI2M30.q15FvIyZY2CwiW2zUPyKYRMYhE7_Fkr0aQWAgKk-oSA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)