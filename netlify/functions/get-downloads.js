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

/* id -> { name, file } for every digital product.
   `file` is a path inside site/ (served as the public website). */
const DIGITAL_FILES = {
  "printable-dad":          { name: "Printable Father's Day Card",  file: "downloads/printable-fathers-day.pdf" },
  "printable-grandma":      { name: "Printable Grandma Birthday",   file: "downloads/printable-grandma-birthday.pdf" },
  "printable-auntie":       { name: "Printable Auntie Birthday",    file: "downloads/printable-auntie-birthday.pdf" },
  "printable-nana":         { name: "Printable Nana Birthday",      file: "downloads/printable-nana-birthday.pdf" },
  "color-mom":              { name: "Color-Your-Own Mother's Day",  file: "downloads/color-your-own-mothers-day.pdf" },
  "minimalist-thankyou-pdf":{ name: "Minimalist Thank You (PDF)",   file: "downloads/minimalist-thank-you.pdf" },
  "rainbow-love-svg":       { name: "Rainbow Love Card (SVG)",      file: "downloads/rainbow-love-card-svg.zip" },
  "candy-corn-svg":         { name: "Candy Corn Card (SVG)",        file: "downloads/candy-corn-card-svg.zip" }
};

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
