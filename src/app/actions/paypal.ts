
'use server';

import { headers } from 'next/headers';

// This is a simplified server action.
// In a real-world scenario, you would use the PayPal REST API SDK
// to create a subscription plan and an order.

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials are not set in environment variables.');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  const response = await fetch('https://api.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}


export async function createPayPalSubscription(): Promise<{ success: boolean; redirectUrl?: string; error?: string }> {
  
  // NOTE: This is a simulation. A real implementation would be more complex.
  // It would involve creating a product, a plan, and then a subscription with the PayPal API.
  // For this demo, we'll just create a one-time order and simulate the subscription flow.

  try {
    const accessToken = await getPayPalAccessToken();
    const origin = headers().get('origin');
    
    const response = await fetch('https://api.sandbox.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'EUR',
            value: '10.00'
          },
          description: 'Abonnement PetLife Pro'
        }],
        application_context: {
            return_url: `${origin}/dashboard?payment=success`,
            cancel_url: `${origin}/dashboard?payment=cancel`,
            brand_name: 'PetLife',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'SUBSCRIBE_NOW',
        }
      })
    });
    
    const order = await response.json();

    if (order.links) {
      const approvalLink = order.links.find((link: { rel: string; }) => link.rel === 'approve');
      if (approvalLink) {
        return { success: true, redirectUrl: approvalLink.href };
      }
    }
    
    console.error("PayPal order response:", order);
    return { success: false, error: 'Could not find PayPal approval link.' };

  } catch (error) {
    console.error("PayPal subscription creation failed:", error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: message };
  }
}
