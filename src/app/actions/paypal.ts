
'use server';

// PRODUCTION keys for PayPal API.
const PAYPAL_CLIENT_ID = 'AVIdbqPDhsyPeIQ_OocwT6TPGCPe4unkE3SVRLmaitVU26e3OM6riELntVqe0AepevnGv1Qwj_ERVBf1';
const PAYPAL_SECRET = 'EPDVudbtFZlFHrHmicMPtn13CNTe8jvShUhUg5G0yMDazRM3ZMF4Xa95MWdHWVi-QwS57tdYg2uyx7KI';
const PAYPAL_API_BASE = 'https://api-m.paypal.com'; // PRODUCTION URL

// Function to get an OAuth2 access token from PayPal.
async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-cache', // Prevents caching of the token request.
  });

  if (!response.ok) {
    console.error('PayPal Auth Error:', await response.text());
    throw new Error('Failed to get PayPal access token.');
  }

  const data = await response.json();
  return data.access_token;
}

// Server action to create a PayPal order.
export async function createPayPalOrder(): Promise<{ success: boolean; link?: string; error?: string }> {
  try {
    const accessToken = await getPayPalAccessToken();

    const orderPayload = {
      intent: 'CAPTURE', // 'CAPTURE' for a one-time payment.
      purchase_units: [
        {
          amount: {
            currency_code: 'EUR',
            value: '10.00', // The subscription amount
          },
          description: 'PetLife Pro Subscription',
        },
      ],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/dashboard?payment=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'}/dashboard?payment=cancel`,
        brand_name: 'PetLife',
        user_action: 'PAY_NOW',
      },
    };

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderPayload),
      cache: 'no-cache', // Prevents caching of the order creation request.
    });

    if (!response.ok) {
      console.error('PayPal Order Error:', await response.text());
      throw new Error('Failed to create PayPal order.');
    }

    const order = await response.json();
    const approvalLink = order.links?.find((link: any) => link.rel === 'approve');

    if (approvalLink) {
      return { success: true, link: approvalLink.href };
    } else {
      console.error('Could not find PayPal approval link in response:', order);
      return { success: false, error: 'Could not find PayPal approval link.' };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('PayPal creation error:', message);
    return { success: false, error: message };
  }
}
