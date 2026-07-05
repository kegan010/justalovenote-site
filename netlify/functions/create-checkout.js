/* ============================================================
   Just a Love Note — Stripe Checkout (serverless)
   Runs on Netlify Functions. The browser sends a list of
   { id, qty }. We look up the REAL price here on the server
   (never trusting the price the browser sends), build a Stripe
   Checkout Session, add shipping for physical orders, and return
   the checkout URL. Digital items are flagged so the thank-you
   page can hand over the download links after payment.
   ------------------------------------------------------------
   Required environment variable (set in Netlify dashboard):
     STRIPE_SECRET_KEY  =  sk_live_...  (or sk_test_... while testing)
   Optional:
     SITE_URL           =  https://justalovenote.com
   ============================================================ */

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/* ---- server-side source of truth ----
   The catalog lives in ONE place: site/js/products.js.
   We read it here so prices can never drift out of sync with the
   website, and buyers still can't tamper with them (the server
   only ever charges what this file says). */
const { PRODUCTS } = require("../../site/js/products.js");
const CATALOG = {};
for (const p of PRODUCTS) {
  CATALOG[p.id] = {
    name: p.name,
    priceCents: p.priceCents,
    digital: p.type === "digital"
  };
}

const SHIP_FLAT_CENTS = 400;   // $4.00 flat shipping (physical orders)
const SHIP_FREE_OVER  = 2500;  // free shipping at/over $25.00

exports.handler = async (event) => {
  if (event.httpMethod !== "POST")
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  if (!process.env.STRIPE_SECRET_KEY)
    return { statusCode: 500, body: JSON.stringify({ error: "Stripe key not configured. Set STRIPE_SECRET_KEY in Netlify." }) };

  try {
    const { items } = JSON.parse(event.body || "{}");
    if (!Array.isArray(items) || items.length === 0)
      return { statusCode: 400, body: JSON.stringify({ error: "Cart is empty." }) };

    let subtotal = 0;
    let hasPhysical = false;
    const digitalIds = [];
    const line_items = [];

    for (const it of items) {
      const product = CATALOG[it.id];
      if (!product) continue; // ignore unknown ids
      const qty = Math.max(1, Math.min(99, parseInt(it.qty, 10) || 1));
      subtotal += product.priceCents * qty;
      if (product.digital) { if (!digitalIds.includes(it.id)) digitalIds.push(it.id); }
      else hasPhysical = true;
      // Tax classification for Stripe Tax:
      //  physical cards -> General / Tangible Goods
      //  digital printables & SVG cut files -> Digital images (downloaded, permanent)
      const taxCode = product.digital ? "txcd_10501000" : "txcd_99999999";
      line_items.push({
        quantity: qty,
        price_data: {
          currency: "usd",
          unit_amount: product.priceCents,
          tax_behavior: "exclusive", // sales tax is added on top of the listed price
          product_data: { name: product.name, tax_code: taxCode }
        }
      });
    }
    if (line_items.length === 0)
      return { statusCode: 400, body: JSON.stringify({ error: "No valid items in cart." }) };

    const siteUrl = process.env.SITE_URL || (event.headers.origin || `https://${event.headers.host}`);

    const session = {
      mode: "payment",
      // Lets buyers enter promo codes (e.g. WELCOME10) at checkout.
      // Create the codes themselves in Stripe Dashboard → Products → Coupons.
      allow_promotion_codes: true,
      line_items,
      metadata: { digital_ids: digitalIds.join(",") },
      // Stripe Tax calculates sales tax from the buyer's address — but ONLY when
      // you switch it on with the STRIPE_TAX_ENABLED=true environment variable in
      // Netlify. Leave it off (unset) while testing so checkout works before Tax
      // is fully configured. Turn it on once you're on your LIVE key with your
      // California registration active in the Stripe dashboard.
      automatic_tax: { enabled: process.env.STRIPE_TAX_ENABLED === "true" },
      success_url: `${siteUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cancel.html`
    };

    // Only collect a shipping address + charge shipping when something is mailed.
    if (hasPhysical) {
      const shipCents = subtotal >= SHIP_FREE_OVER ? 0 : SHIP_FLAT_CENTS;
      session.shipping_address_collection = { allowed_countries: ["US"] };
      session.shipping_options = [{
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: shipCents, currency: "usd" },
          display_name: shipCents === 0 ? "Free shipping" : "Standard shipping",
          tax_behavior: "exclusive",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 3 },
            maximum: { unit: "business_day", value: 7 }
          }
        }
      }];
    } else {
      // Digital-only orders have no shipping address, so collect a billing
      // address instead — Stripe Tax needs an address to calculate tax.
      session.billing_address_collection = "required";
    }

    const created = await stripe.checkout.sessions.create(session);
    return { statusCode: 200, body: JSON.stringify({ url: created.url }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Could not start checkout." }) };
  }
};
