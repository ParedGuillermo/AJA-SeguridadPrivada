import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qatlgeotqkbxscwhrzjp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFhdGxnZW90cWtieHNjd2hyempwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNDkyOTEsImV4cCI6MjA2NjcyNTI5MX0.zPmG9lEL8dS5TjbyV0PHvTMZ0e5_KBoP4gdCimoGC9k'

export const supabase = createClient(supabaseUrl, supabaseKey)
