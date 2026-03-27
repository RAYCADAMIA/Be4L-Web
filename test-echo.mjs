import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data, error } = await supabase.from('echoes').insert({
        type: 'lobby',
        context_id: '123e4567-e89b-12d3-a456-426614174000',
        context_type: 'QUEST',
        participant_ids: ['123e4567-e89b-12d3-a456-426614174000'],
        name: 'Test Lobby',
        last_message_at: new Date().toISOString(),
        last_message_preview: 'Test'
    }).select();
    console.log("Insert result:", { data, error });
}

checkSchema();
