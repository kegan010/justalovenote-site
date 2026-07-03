/* ============================================================
   Just a Love Note — "order received" email notification
   ------------------------------------------------------------
   Stripe calls this function every time a checkout is paid. We
   verify the call really came from Stripe, read the order (items
   + shipping address), and email you a tidy summary via Resend
   so you can pack and ship without opening the dashboard.
   ------------------------------------------------------------
   Environment variables needed in Netlify:
     STRIPE_SECRET_KEY      sk_live_... (or sk_test_... for testing)
     STRIPE_WEBHOOK_SECRET  whsec_...   (from the Stripe webhook you create)
     RESEND_API_KEY         re_...      (from resend.com)
     ORDER_EMAIL_TO         where to send order alerts (e.g. your Gmail)
     ORDER_EMAIL_FROM       (optional) defaults to onboarding@resend.dev
   ============================================================ */

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const money = (cents, cur = "usd") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: cur }).format((cents || 0) / 100);

exports.handler = async (event) => {
  // 1) Verify the event really came from Stripe (using the raw body).
  let stripeEvent;
  try {
    const sig = event.headers["stripe-signature"];
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString("utf8")
      : event.body;
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  // 2) We only care about completed, paid checkouts.
  if (stripeEvent.type !== "checkout.session.completed") {
    return { statusCode: 200, body: "ignored" };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(
      stripeEvent.data.object.id,
      { expand: ["line_items"] }
    );

    if (session.payment_status !== "paid") {
      return { statusCode: 200, body: "not paid yet" };
    }

    // 3) Gather the order details.
    const items = (session.line_items && session.line_items.data) || [];
    const rows = items.map(li =>
      `<tr>
         <td style="padding:6px 10px;border-bottom:1px solid #eee">${li.quantity} ×</td>
         <td style="padding:6px 10px;border-bottom:1px solid #eee">${li.description}</td>
         <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right">${money(li.amount_total, session.currency)}</td>
       </tr>`).join("");

    // Shipping details have lived under a couple of field names across Stripe
    // API versions — check the common ones.
    const ship = session.shipping_details
      || session.shipping
      || (session.collected_information && session.collected_information.shipping_details);
    const cust = session.customer_details || {};
    const digitalIds = (session.metadata && session.metadata.digital_ids) || "";
    const hasDigital = digitalIds.trim().length > 0;

    const shipBlock = ship && ship.address
      ? `<p style="margin:0 0 4px"><b>Ship to:</b><br>
           ${ship.name || ""}<br>
           ${ship.address.line1 || ""}${ship.address.line2 ? "<br>" + ship.address.line2 : ""}<br>
           ${ship.address.city || ""}, ${ship.address.state || ""} ${ship.address.postal_code || ""}<br>
           ${ship.address.country || ""}
         </p>`
      : `<p style="margin:0 0 4px"><b>Ship to:</b> — (digital-only order, nothing to mail)</p>`;

    const totals = `
      <p style="margin:10px 0 0">
        Subtotal: ${money(session.amount_subtotal, session.currency)}<br>
        ${session.total_details && session.total_details.amount_shipping ? `Shipping: ${money(session.total_details.amount_shipping, session.currency)}<br>` : ""}
        ${session.total_details && session.total_details.amount_tax ? `Tax: ${money(session.total_details.amount_tax, session.currency)}<br>` : ""}
        <b>Total: ${money(session.amount_total, session.currency)}</b>
      </p>`;

    const customerName = (ship && ship.name) || cust.name || "a customer";
    const subject = `🎉 New order from ${customerName} — ${money(session.amount_total, session.currency)}`;

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#4a4036;max-width:560px">
        <h2 style="color:#cf7a6e">💌 New order received!</h2>
        <table style="border-collapse:collapse;width:100%;margin:10px 0 16px">${rows}</table>
        ${totals}
        <hr style="border:none;border-top:1px solid #eee;margin:16px 0">
        ${shipBlock}
        <p style="margin:6px 0"><b>Customer email:</b> ${cust.email || "—"}</p>
        ${hasDigital ? `<p style="margin:6px 0;color:#73876a"><b>Note:</b> includes digital download(s) — the customer got their file(s) on the thank-you page automatically.</p>` : ""}
        <p style="margin:14px 0 0;font-size:12px;color:#7a6f60">Order ID: ${session.id}</p>
      </div>`;

    // 4) Build the customer's branded confirmation email.
    const isShipped = !!(ship && ship.address);
    const customerHtml = `
      <div style="font-family:Georgia,'Times New Roman',serif;color:#4a4036;max-width:560px;margin:0 auto">
        <div style="text-align:center;padding:8px 0 4px">
          <div style="font-size:40px">💌</div>
          <div style="font-family:Arial,Helvetica,sans-serif;letter-spacing:.2em;font-size:11px;color:#7a6f60;text-transform:uppercase">Just a Love Note</div>
        </div>
        <h2 style="color:#cf7a6e;text-align:center;font-weight:normal">Thank you for your order!</h2>
        <p>Hi ${customerName},</p>
        <p>Your order is confirmed — thank you so much for supporting handmade. 🌸 Every card is hand-cut and assembled with love in Orange, California.</p>
        <table style="border-collapse:collapse;width:100%;margin:14px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px">${rows}</table>
        ${totals}
        ${isShipped
          ? `<p style="margin:14px 0 0">I'll get this made and shipped within <b>1–3 business days</b>; U.S. delivery usually takes another 3–7 days.</p>`
          : ``}
        ${hasDigital
          ? `<p style="margin:14px 0 0">Your digital download(s) were available on the confirmation page right after checkout. If you missed them or need them again, just reply to this email and I'll resend them.</p>`
          : ``}
        <p style="margin:16px 0 0">With love,<br><span style="font-style:italic;color:#cf7a6e">Lauren — Just a Love Note</span></p>
        <hr style="border:none;border-top:1px solid #eee;margin:18px 0">
        <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#7a6f60;text-align:center">
          Questions about your order? Just reply to this email.<br>
          justalovenote.com &nbsp;•&nbsp; @justalovenote_
        </p>
      </div>`;

    // 5) Send via Resend (plain HTTPS call — no extra package needed).
    // ORDER_EMAIL_TO may list several inboxes separated by commas, e.g.
    //   "you@gmail.com, partner@gmail.com"  — all of them get the order alert.
    const orderEmailsTo = (process.env.ORDER_EMAIL_TO || "")
      .split(",").map(s => s.trim()).filter(Boolean);

    if (!process.env.RESEND_API_KEY || orderEmailsTo.length === 0) {
      console.error("Missing RESEND_API_KEY or ORDER_EMAIL_TO — cannot send order email.");
      return { statusCode: 200, body: "order ok, email not configured" };
    }

    const sendEmail = (to, mailSubject, mailHtml, replyTo) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: process.env.ORDER_EMAIL_FROM || "Just a Love Note <onboarding@resend.dev>",
          to: Array.isArray(to) ? to : [to],
          reply_to: replyTo || undefined,
          subject: mailSubject,
          html: mailHtml
        })
      });

    // 5a) Your own "new order" alert (goes to every address in ORDER_EMAIL_TO).
    const ownerResp = await sendEmail(orderEmailsTo, subject, html, cust.email);
    if (!ownerResp.ok) console.error("Owner email failed:", ownerResp.status, await ownerResp.text());

    // 5b) Customer confirmation — only if we have a verified sending domain
    //     (ORDER_EMAIL_FROM). Resend's default address can't email customers,
    //     so this is skipped until you verify justalovenote.com in Resend.
    if (process.env.ORDER_EMAIL_FROM && cust.email) {
      const custResp = await sendEmail(cust.email, "Your Just a Love Note order 💌", customerHtml, orderEmailsTo[0]);
      if (!custResp.ok) console.error("Customer email failed:", custResp.status, await custResp.text());
    }

    return { statusCode: 200, body: "order emailed" };
  } catch (err) {
    console.error("Webhook handling error:", err);
    return { statusCode: 500, body: "error" };
  }
};
