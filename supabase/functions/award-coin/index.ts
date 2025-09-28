import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { gameType, completionTimeMs, won } = await req.json();
    console.log(`Award coin request: user=${user.id}, game=${gameType}, time=${completionTimeMs}ms, won=${won}`);

    // Validate completion time (must be under 5 minutes = 300,000ms) and game was won
    if (!won || completionTimeMs > 300000) {
      console.log('Coin award denied: either game not won or exceeded time limit');
      return new Response(JSON.stringify({ 
        awarded: false, 
        reason: won ? 'Time limit exceeded (5 minutes)' : 'Game not completed/won'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate coins based on game type and performance
    let coinsToAward = 10; // Base coins
    if (completionTimeMs < 60000) coinsToAward = 25; // Under 1 minute
    else if (completionTimeMs < 120000) coinsToAward = 20; // Under 2 minutes
    else if (completionTimeMs < 180000) coinsToAward = 15; // Under 3 minutes

    // Atomic update of user's coins
    const { data: updateData, error: updateError } = await supabaseClient
      .rpc('increment_user_coins', { 
        user_id: user.id,
        coin_amount: coinsToAward 
      });

    if (updateError) {
      // If RPC doesn't exist, try direct update
      const { data: currentProfile } = await supabaseClient
        .from('profiles')
        .select('coins')
        .eq('user_id', user.id)
        .single();

      const newCoinTotal = (currentProfile?.coins || 0) + coinsToAward;
      
      const { error: directUpdateError } = await supabaseClient
        .from('profiles')
        .update({ coins: newCoinTotal })
        .eq('user_id', user.id);

      if (directUpdateError) {
        console.error('Coin update error:', directUpdateError);
        throw directUpdateError;
      }

      console.log(`Coins awarded successfully: ${coinsToAward} coins to user ${user.id}`);
      return new Response(JSON.stringify({ 
        awarded: true, 
        coinsAwarded: coinsToAward,
        newTotal: newCoinTotal
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Coins awarded successfully via RPC: ${coinsToAward} coins to user ${user.id}`);
    return new Response(JSON.stringify({ 
      awarded: true, 
      coinsAwarded: coinsToAward
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in award-coin function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});