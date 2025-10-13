
'use server';

// Clés de PRODUCTION pour l'API PayPal.
const PAYPAL_CLIENT_ID = 'AVIdbqPDhsyPeIQ_OocwT6TPGCPe4unkE3SVRLmaitVU26e3OM6riELntVqe0AepevnGv1Qwj_ERVBf1';
const PAYPAL_SECRET = 'EPDVudbtFZlFHrHmicMPtn13CNTe8jvShUhUg5G0yMDazRM3ZMF4Xa95MWdHWVi-QwS57tdYg2uyx7KI';
const PAYPAL_API_BASE = 'https://api-m.paypal.com'; // URL de PRODUCTION

// Fonction pour obtenir un jeton d'accès OAuth2 auprès de PayPal.
async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-cache', // Empêche la mise en cache de la requête de jeton.
  });

  if (!response.ok) {
    console.error('PayPal Auth Error:', await response.text());
    throw new Error('Failed to get PayPal access token.');
  }

  const data = await response.json();
  return data.access_token;
}

// Action serveur pour créer une commande PayPal.
export async function createPayPalOrder(): Promise<{ success: boolean; link?: string; error?: string }> {
  try {
    const accessToken = await getPayPalAccessToken();

    const orderPayload = {
      intent: 'CAPTURE', // 'CAPTURE' pour un paiement unique.
      purchase_units: [
        {
          amount: {
            currency_code: 'EUR',
            value: '10.00', // Le montant de l'abonnement
          },
          description: 'Abonnement PetLife Pro',
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
      cache: 'no-cache', // Empêche la mise en cache de la requête de création de commande.
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
