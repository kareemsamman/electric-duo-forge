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
    const payload = await req.json();
    console.log('Grow webhook payload:', payload);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Grow webhook key from environment variables (Supabase Secrets)
    const growWebhookKey = Deno.env.get('GROW_WEBHOOK_KEY');

    // Validate webhook key
    if (!payload.webhookKey || payload.webhookKey !== growWebhookKey) {
      console.warn('Invalid Grow webhook key');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = payload.data || payload;

    // Extract orderId from dynamicFields
    let orderId: string | undefined;
    if (Array.isArray(data.dynamicFields)) {
      const orderField = data.dynamicFields.find(
        (f: any) => f.name === 'orderId'
      );
      if (orderField) orderId = String(orderField.value);
    }

    if (!orderId) {
      console.error('No orderId in webhook payload');
      return new Response(
        JSON.stringify({ error: 'Missing orderId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the order first
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    // Check if payment was successful
    // Grow examples: statusCode "2" + status "שולם" = paid
    const isSuccess =
      String(payload.status) === '1' &&
      (String(data.statusCode) === '2' || String(data.status) === 'שולם');

    const asmachta = data.asmachta || data.transactionCode;

    if (isSuccess) {
      // Update order as paid
      const notesWithPayment = existingOrder?.customer_notes 
        ? `${existingOrder.customer_notes}\nתשלום אושר - אסמכתא: ${asmachta}`
        : `תשלום אושר - אסמכתא: ${asmachta}`;

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          payment_status: 'paid',
          customer_notes: notesWithPayment,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order:', updateError);
      } else {
        console.log('Order marked as paid:', orderId);
      }
    } else {
      // Mark order as failed
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          payment_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order:', updateError);
      } else {
        console.log('Order marked as failed:', orderId);
      }
    }

    // Always reply 200 if processed
    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Grow webhook error:', error);
    // Still send 200 so Grow doesn't spam retries
    return new Response(
      JSON.stringify({ ok: false }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
