import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
// URL do projeto Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bqiklofbfiatcdpenpyy.supabase.co';

// Chave pública (anon key) - use apenas esta no frontend
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxaWtsb2ZiZmlhdGNkcGVucHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NDgxOTcsImV4cCI6MjA4NDUyNDE5N30._dNpdz9UjPijmx0QumORBYRxvUHcErFtdQ4KiFkpm6s';

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
