
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oualxsrxlmdxqgvancdr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_oWzOHkccaw88DTuEjKu-TQ_NZunlEDt';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
