// lib/session.ts
import { supabase } from './supabase'; // Ensure this path is correct

interface SessionPayload {
    bookId: string;
    durationSeconds: number;
    // We pass pagesRead as the amount of units read (pages or minutes)
    unitsRead: number; 
    startUnit: number;
    endUnit: number;
    reflection: string;
}

interface SaveResult {
    success: boolean;
    message: string;
    inkGained: number;
    xpGained: number;
}

export async function saveReadingSession({ 
    bookId, 
    durationSeconds, 
    unitsRead, 
    endUnit,
    reflection 
}: SessionPayload): Promise<SaveResult> {
  
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, message: 'User not logged in.', inkGained: 0, xpGained: 0 };
        }

        // --- 1. FETCH REQUIRED METADATA ---
        const { data: profileData } = await supabase
            .from('profiles')
            .select('active_companion_id')
            .eq('id', user.id)
            .single();

        const { data: companionData } = await supabase
            .from('companions')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single();
        
        if (!profileData || !companionData) {
            return { success: false, message: 'Could not find active companion or profile data.', inkGained: 0, xpGained: 0 };
        }

        // --- 2. CALCULATE REWARDS (The Gamification) ---
        // Base XP: 2 XP per unit read (page/min)
        const baseXP = unitsRead * 2;
        // Reflection Bonus: +20 Ink/XP if reflection is meaningful (>10 chars)
        const reflectionBonus = reflection.length > 10 ? 20 : 0; 
        
        const totalXP = baseXP + reflectionBonus;
        const inkGained = totalXP; // For MVP, currency (Ink) = XP

        // --- 3. CALL THE ATOMIC RPC (Single Transaction) ---
        const { error: rpcError } = await supabase.rpc('log_session_atomic', {
            p_user_id: user.id,
            p_book_id: bookId,
            p_active_companion_id: profileData.active_companion_id,
            p_duration_seconds: durationSeconds,
            p_pages_read: unitsRead,
            p_reflection_data: { note: reflection }, // Send reflection as JSONB
            p_ink_gained: inkGained,
            p_xp_gained: totalXP,
            p_new_book_unit: endUnit, // The new page/minute count
        });

        if (rpcError) {
            console.error('RPC Error:', rpcError);
            return { success: false, message: `Database error logging session: ${rpcError.message}`, inkGained: 0, xpGained: 0 };
        }

        return { 
            success: true, 
            message: 'Session saved successfully!', 
            inkGained: inkGained,
            xpGained: totalXP,
        };

    } catch (error) {
        console.error('Unknown Save Error:', error);
        return { success: false, message: 'An unexpected error occurred.', inkGained: 0, xpGained: 0 };
    }
}