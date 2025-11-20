import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'orderId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', orderError);
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Grow settings from site_content
    const { data: settings, error: settingsError } = await supabase
      .from('site_content')
      .select('*')
      .in('key', ['grow_user', 'grow_api_key']);

    if (settingsError || !settings || settings.length === 0) {
      console.error('Grow settings not configured:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Grow payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const growUser = settings.find(s => s.key === 'grow_user')?.value_he;
    const growApiKey = settings.find(s => s.key === 'grow_api_key')?.value_he;

    if (!growUser || !growApiKey) {
      console.error('Grow credentials missing');
      return new Response(
        JSON.stringify({ error: 'Grow credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build absolute URLs for success/cancel redirect
    const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '') || '';
    const successUrl = `${baseUrl}/order/${orderId}?payment=success`;
    const cancelUrl = `${baseUrl}/order/${orderId}?payment=failed`;

    // Build payload according to Grow's API
    const payload = new URLSearchParams({
      user: growUser,
      apiKey: growApiKey,
      sum: order.total.toString(),
      description: `הזמנה #${orderId.substring(0, 8)}`,
      successUrl,
      cancelUrl,
      dynamicFields: JSON.stringify([{ name: 'orderId', value: orderId }]),
    });

    // Call Grow API
    const growResponse = await fetch('https://api.grow-payment.com/v1/payment-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload,
    });

    if (!growResponse.ok) {
      const text = await growResponse.text();
      console.error('Grow payment-link error:', text);
      return new Response(
        JSON.stringify({ error: 'Failed to create Grow payment link' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await growResponse.json();

    // Check if Grow returned a valid payment URL
    if (String(data.status) !== '1' || !data.url) {
      console.error('Grow error payload:', data);
      return new Response(
        JSON.stringify({ error: 'Grow did not return payment URL' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return payment URL to frontend
    return new Response(
      JSON.stringify({ paymentUrl: data.url }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in grow-payment-start:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
