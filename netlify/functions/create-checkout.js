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
   Keep id + priceCents in sync with site/js/products.js.
   `digital: true` means no shipping is charged for that item. */
const CATALOG = {
  // Birthday
  "cassette-classic":      { name: "Cassette Tape Birthday — You're a Classic", priceCents: 600 },
  "monkey-bananas":        { name: "Funny Monkey Birthday — Go Bananas",        priceCents: 600 },
  "cat-birthday":          { name: "Funny Cat Birthday — Kraft Silhouette",     priceCents: 600 },
  "candles-birthday":      { name: "Hand-Drawn Birthday Candles Card",          priceCents: 600 },
  "flowerpot-birthday":    { name: "Hand-Drawn Flower Pot — Happy Birthday",    priceCents: 600 },
  "teacup-birthday":       { name: "Tea Cup Birthday Card — Floral Blooms",     priceCents: 800 },
  "dog-birthday":          { name: "Funny Dog Birthday — Pawfect Day",          priceCents: 600 },
  "pawty-birthday":        { name: "Pawty Time Birthday Card",                  priceCents: 600 },
  "cupcake-shaker":        { name: "Cupcake Shaker Birthday Card",              priceCents: 1300 },
  // Love & Sympathy
  "getwell-dachshund":     { name: "Get Well Soon — Dachshund Scooter",         priceCents: 600 },
  "otter-half":            { name: "You Are My Otter Half",                     priceCents: 600 },
  "i-lava-you":            { name: "I Lava You — Volcano Anniversary",          priceCents: 600 },
  "handmade-with-love":    { name: "Handmade With Love — Floral",               priceCents: 600 },
  "chemistry-anniversary": { name: "Funny Chemistry Anniversary Card",          priceCents: 600 },
  "love-you-a-latte":      { name: "Love You a Latte Coffee Card",              priceCents: 600 },
  "dumpling-valentine":    { name: "Funny Dumpling Valentine Card",             priceCents: 600 },
  "heart-shaker":          { name: "Heart Shaker Card",                         priceCents: 1000 },
  "hedgehog-valentine":    { name: "Hedgehog Valentine — Hedgehugs & Kisses",   priceCents: 600 },
  "i-chews-you":           { name: "I Chews You — Funny Dog Valentine",         priceCents: 600 },
  "you-light-up":          { name: "You Light Up My Life — Anniversary",        priceCents: 600 },
  "mailbox-anniversary":   { name: "Embossed Mailbox Anniversary Card",         priceCents: 700 },
  "dog-sympathy":          { name: "Embossed Dog Sympathy — Pet Loss",          priceCents: 600 },
  "embossed-cross":        { name: "Embossed Cross — Sympathy & Baptism",       priceCents: 700 },
  "floral-cross":          { name: "Floral Cross — Religious Easter & Baptism", priceCents: 700 },
  "bear-hugs":             { name: "Sending Bear Hugs — Thinking of You",       priceCents: 600 },
  // Congrats
  "snailed-it-grad":       { name: "Snailed It Graduation Card",                priceCents: 600 },
  "lightbulb-grad":        { name: "Funny Graduation — Lightbulb Pun",          priceCents: 600 },
  "grad-cap-shaker":       { name: "Graduation Shaker — Grad Cap",              priceCents: 1100 },
  "bright-future-grad":    { name: "Bright Future Grad Thank You",              priceCents: 600 },
  "elephant-baby":         { name: "Elephant Baby Shower Card",                 priceCents: 600 },
  "bridal-shower":         { name: "Bridal Shower Card — White Dress",          priceCents: 600 },
  "bride-groom":           { name: "Bride & Groom — Newlyweds Card",            priceCents: 750 },
  "ski-wedding":           { name: "Ski Wedding Card — Adventurous Couple",     priceCents: 600 },
  "snowboarder-wedding":   { name: "Snowboarder Wedding Card",                  priceCents: 600 },
  "holy-guacamole":        { name: "Holy Guacamole — Funny Congrats",           priceCents: 600 },
  // Thank You
  "thanks-a-latte":        { name: "Thanks a Latte Coffee Card",               priceCents: 600 },
  "thanks-a-bunch":        { name: "Flower Thank You Set — Thanks a Bunch",     priceCents: 600 },
  "watermelon-thankyou":   { name: "Watermelon Thank You Card Set",            priceCents: 600 },
  "thank-ewe":             { name: "Thank Ewe — Funny Sheep Card",             priceCents: 600 },
  "lemon-thankyou":        { name: "Lemon Thank You Card Set",                 priceCents: 600 },
  "teacher-latte-holder":  { name: "Teacher Thanks a Latte — Holder (Set of 4)",priceCents: 1600 },
  // Mom & Dad
  "sunflower-mom":         { name: "Sunflower Mother's Day — Paper Cut",        priceCents: 600 },
  "flowerpot-mom":         { name: "Hand-Drawn Flower Pot — Mother's Day",      priceCents: 600 },
  "elephant-mom":          { name: "Elephant Mother's Day Card",               priceCents: 600 },
  "coffee-cup-mom":        { name: "Floral Coffee Cup — Mother's Day Holder",   priceCents: 600 },
  "watering-can":          { name: "Watering Can Flower Card",                 priceCents: 700 },
  "cherry-blossom-mom":    { name: "Cherry Blossom Mother's Day Card",          priceCents: 800 },
  "daisy-mom":             { name: "Daisy Mother's Day Card — Embossed",        priceCents: 800 },
  "fox-mom":               { name: "Fox Mother's Day Card — New Mom",           priceCents: 600 },
  "hawaiian-shirt":        { name: "3D Hawaiian Shirt Card — Dad & Retirement", priceCents: 700 },
  "deer-dad":              { name: "Embossed Deer Card — Dad & Birthday",       priceCents: 600 },
  // Holidays
  "american-flag":         { name: "Embossed American Flag Card",               priceCents: 800 },
  "hot-cocoa-tags":        { name: "Hot Cocoa Gift Tags — 3D Red Mug Set",      priceCents: 1600 },
  "christmas-tree-tags":   { name: "Christmas Tree Gift Tags — Gold Deer (3)",  priceCents: 850 },
  "embossed-holiday-set":  { name: "Embossed Holiday Cards — Kraft (Set of 3)", priceCents: 1400 },
  "ghost-halloween":       { name: "Cute Ghost Halloween Card",                 priceCents: 600 },
  "hello-pumpkin":         { name: "Hello Pumpkin Halloween Card",              priceCents: 600 },
  "fleece-navidad":        { name: "Fleece Navidad — Funny Sheep Christmas",    priceCents: 600 },
  // Digital downloads (no shipping)
  "printable-dad":          { name: "Printable Father's Day Card — DIY Coloring", priceCents: 299, digital: true },
  "printable-grandma":      { name: "Printable Grandma Birthday Card — DIY",      priceCents: 299, digital: true },
  "printable-auntie":       { name: "Printable Auntie Birthday Card — DIY",       priceCents: 299, digital: true },
  "printable-nana":         { name: "Printable Nana Birthday Card — DIY",         priceCents: 299, digital: true },
  "color-mom":              { name: "Color-Your-Own Mother's Day Card",          priceCents: 299, digital: true },
  "minimalist-thankyou-pdf":{ name: "Minimalist Thank You Card — PDF Template",   priceCents: 299, digital: true },
  "rainbow-love-svg":       { name: "Rainbow Love Card SVG — DIY Pride",         priceCents: 249, digital: true },
  "candy-corn-svg":         { name: "Candy Corn Halloween Card SVG — Cricut",     priceCents: 349, digital: true }
};

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
      line_items.push({
        quantity: qty,
        price_data: {
          currency: "usd",
          unit_amount: product.priceCents,
          product_data: { name: product.name }
        }
      });
    }
    if (line_items.length === 0)
      return { statusCode: 400, body: JSON.stringify({ error: "No valid items in cart." }) };

    const siteUrl = process.env.SITE_URL || (event.headers.origin || `https://${event.headers.host}`);

    const session = {
      mode: "payment",
      line_items,
      metadata: { digital_ids: digitalIds.join(",") },
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
          delivery_estimate: {
            minimum: { unit: "business_day", value: 3 },
            maximum: { unit: "business_day", value: 7 }
          }
        }
      }];
    }

    const created = await stripe.checkout.sessions.create(session);
    return { statusCode: 200, body: JSON.stringify({ url: created.url }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: "Could not start checkout." }) };
  }
};
