/* ============================================================
   Just a Love Note — digital download delivery (serverless)
   After a successful checkout, the thank-you page calls this
   with the Stripe session id. We confirm the payment actually
   went through, then return the download links for any digital
   items in that order. Links are only handed out once Stripe
   reports the session as paid.
   ------------------------------------------------------------
   Requires env var STRIPE_SECRET_KEY (same as checkout).
   ============================================================ */

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/* id -> { name, file } for every digital product — derived from the
   one shared catalog in site/js/products.js (single source of truth). */
const { PRODUCTS } = require("../../site/js/products.js");
const DIGITAL_FILES = {};
for (const p of PRODUCTS) {
  if (p.type === "digital" && p.file) DIGITAL_FILES[p.id] = { name: p.name, file: p.file };
}

exports.handler = async (event) => {
  if (!process.env.STRIPE_SECRET_KEY)
    return { statusCode: 500, body: JSON.stringify({ error: "Stripe key not configured." }) };

  const sessionId = (event.queryStringParameters && event.queryStringParameters.session_id) || "";
  if (!sessionId)
    return { statusCode: 400, body: JSON.stringify({ error: "Missing session id." }) };

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Only deliver files for genuinely paid orders.
    if (session.payment_status !== "paid")
      return { statusCode: 200, body: JSON.stringify({ paid: false, downloads: [] }) };

    const siteUrl = process.env.SITE_URL || (event.headers.origin || `https://${event.headers.host}`);
    const ids = (session.metadata && session.metadata.digital_ids ? session.metadata.digital_ids.split(",") : [])
      .map(s => s.trim()).filter(Boolean);

    const downloads = ids
      .filter(id => DIGITAL_FILES[id])
      .map(id => ({ name: DIGITAL_FILES[id].name, url: `${siteUrl}/${DIGITAL_FILES[id].file}` }));

    return { statusCode: 200, body: JSON.stringify({ paid: true, downloads }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Could not load downloads." }) };
  }
};
