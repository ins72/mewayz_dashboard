import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: corsHeaders
        });
    }

    try {
        // Get the authorization token from the request headers
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('Missing Authorization header');
        }

        // Create a Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
        const supabase = createClient(supabaseUrl, supabaseKey, {
            global: { headers: { Authorization: authHeader } }
        });

        // Create a Stripe client
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
        const stripe = new Stripe(stripeKey);

        // Get the request body
        const requestData = await req.json();
        const { workspaceId, planId, billingCycle, selectedFeatureCount, userId } = requestData;

        // Validate input data
        if (!workspaceId || !planId || !billingCycle || !userId) {
            throw new Error('Missing required parameters');
        }

        // Get subscription plan details
        const { data: plan, error: planError } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('id', planId)
            .single();

        if (planError || !plan) {
            throw new Error('Subscription plan not found');
        }

        // Calculate pricing
        const isYearly = billingCycle === 'yearly';
        let basePrice = isYearly ? plan.base_price_yearly : plan.base_price_monthly;
        let featurePrice = 0;

        if (plan.pricing_model === 'feature_based') {
            const featureCost = isYearly ? plan.feature_price_yearly : plan.feature_price_monthly;
            featurePrice = featureCost * selectedFeatureCount;
        }

        const totalPrice = basePrice + featurePrice;
        const amountInCents = Math.round(totalPrice * 100);

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${plan.name} Plan - ${billingCycle}`,
                            description: plan.description,
                        },
                        unit_amount: amountInCents,
                        recurring: {
                            interval: billingCycle === 'yearly' ? 'year' : 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${req.headers.get('origin')}/workspace-setup-wizard-branding?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get('origin')}/workspace-setup-wizard-subscription-plan`,
            metadata: {
                workspaceId,
                planId,
                billingCycle,
                selectedFeatureCount: selectedFeatureCount.toString(),
                userId
            }
        });

        // Return the session
        return new Response(JSON.stringify({
            sessionId: session.id,
            url: session.url
        }), {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            },
            status: 200
        });
    } catch (error) {
        console.log('Create checkout session error:', error.message);
        return new Response(JSON.stringify({
            error: error.message
        }), {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            },
            status: 400
        });
    }
});