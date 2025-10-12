
'use server';

import { headers } from 'next/headers';

// This is a simplified server action.
// In a real-world scenario, you would use the PayPal REST API SDK
// to create a subscription plan and an order.

async function getPayPalAccessToken() {
  const clientId = "AdVaZg-x-cbjGyLKeYDaTbUR3U-8QqbBh0QvAy0RyrdamDPrFixJ_dp7ifXKBUebt_BgxXgMJzyhHvLI";
  const clientSecret = "EDwGKLqam7GtXT3RprGHDxaPpzjcBX8qY2uhbIn4thCpI6yemEwSS6XYpQdU_T7TdJRN1EMJ8rHfY032";

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials are not set.');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  const response = await fetch('https://api.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-cache',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("PayPal Auth Error:", errorBody);
    throw new Error('Failed to get PayPal access token.');
  }

  const data = await response.json();
  return data.access_token;
}


export async function createPayPalSubscription(): Promise<{ success: boolean; redirectUrl?: string; error?: string }> {
  
  try {
    const accessToken = await getPayPalAccessToken();
    const origin = headers().get('origin');
    
    // NOTE: This plan was created manually in the PayPal developer dashboard.
    // In a real app, you would create this plan via the API.
    const planId = 'P-3L926792V2313322AMWCSJMI';
    
    const response = await fetch('https://api.sandbox.paypal.com/v1/billing/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        plan_id: planId,
        application_context: {
            brand_name: 'PetLife',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'SUBSCRIBE_NOW',
            return_url: `${origin}/dashboard?payment=success`,
            cancel_url: `${origin}/dashboard?payment=cancel`,
        }
      })
    });
    
    const subscription = await response.json();

    if (subscription.links) {
      const approvalLink = subscription.links.find((link: { rel: string; }) => link.rel === 'approve');
      if (approvalLink) {
        return { success: true, redirectUrl: approvalLink.href };
      }
    }
    
    console.error("PayPal subscription response:", subscription);
    return { success: false, error: 'Could not find PayPal approval link.' };

  } catch (error) {
    console.error("PayPal subscription creation failed:", error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: message };
  }
}
