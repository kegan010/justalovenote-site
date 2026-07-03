# Just a Love Note — Website

A custom storefront for your handmade paper-cut cards, with a real shopping cart
and secure Stripe checkout. Built as plain HTML/CSS/JS plus one small serverless
function, hosted free on Netlify.

---

## What's in this folder

```
justalovenote-site/
├─ site/                     ← the website itself (this is what visitors see)
│  ├─ index.html             ← homepage
│  ├─ shop.html              ← all cards + category filters
│  ├─ product.html           ← single-card page
│  ├─ contact.html           ← contact + custom-order form
│  ├─ contact-thanks.html    ← shown after the form is sent
│  ├─ faq.html               ← FAQ, shipping & policies page
│  ├─ img/                   ← product photos go here (see its README.txt)
│  ├─ success.html           ← shown after a successful purchase (+ digital downloads)
│  ├─ cancel.html            ← shown if checkout is abandoned
│  ├─ css/styles.css         ← all the styling
│  ├─ downloads/             ← your printable/SVG files live here (see its README.txt)
│  └─ js/
│     ├─ products.js         ← YOUR CARD LIST (edit this to add/remove cards)
│     └─ cart.js             ← cart + checkout logic
├─ netlify/functions/
│  ├─ create-checkout.js     ← the secure Stripe checkout (server-side prices)
│  ├─ get-downloads.js       ← delivers digital downloads after payment
│  └─ stripe-webhook.js      ← emails you an order summary when a sale completes
├─ netlify.toml              ← hosting config
└─ package.json              ← lists the Stripe dependency
```

You'll mostly only ever touch **`site/js/products.js`** (your cards) and add
photos to **`site/img/`**.

---

## Before you start, two free accounts

1. **Stripe** — https://stripe.com — this is how you get paid. Sign up, then in
   the dashboard go to **Developers → API keys** and copy your **Secret key**
   (starts with `sk_`). Use the **test** key (`sk_test_…`) first; switch to the
   **live** key when you're ready for real money.
2. **Netlify** — https://netlify.com — free hosting. Sign up (the GitHub or email
   option is fine).

---

## Launch in 6 steps

### 1. Put the site on Netlify
The easy, no-tools way:
- Go to https://app.netlify.com → **Add new site → Deploy manually**.
- Drag the **entire `justalovenote-site` folder** onto the upload box.
- Netlify gives you a temporary address like `something-lovely.netlify.app`.

### 2. Add your Stripe key
- In Netlify: **Site configuration → Environment variables → Add a variable**.
- Key: `STRIPE_SECRET_KEY`  Value: your `sk_test_…` key.
- (Optional) Add `SITE_URL` = `https://justalovenote.com` once your domain is connected.
- Click **Deploy** again (Deploys → Trigger deploy) so the key takes effect.

### 3. Test the whole flow
- Open your `.netlify.app` address, add a few cards, hit **Checkout**.
- On Stripe's test page use card number **4242 4242 4242 4242**, any future
  expiry, any CVC, any ZIP. You should land on the "Thank you" page.
- Check **Stripe Dashboard → Payments** to confirm the test order appears with
  the right total and shipping.

### 4. Connect justalovenote.com
- In Netlify: **Domain management → Add a custom domain** → type
  `justalovenote.com`.
- Netlify shows you DNS records (or offers to handle DNS for you). Log in to
  wherever you bought the domain and either point the nameservers to Netlify or
  add the records Netlify lists. SSL (the padlock) turns on automatically within
  an hour or so.

### 5. Go live with real payments
- Swap the Netlify environment variable `STRIPE_SECRET_KEY` to your **live**
  key (`sk_live_…`) and redeploy.
- Do one real purchase of one card on yourself to confirm money lands in Stripe,
  then refund it from the Stripe dashboard.

### 6. You're open! 🎉

---

## Day-to-day: adding or changing cards

Open **`site/js/products.js`** and copy one block:

```js
{ id: "unique-name", name: "Card Title", priceCents: 600, category: "birthday",
  emoji: "🎂", bg: "#f5e6df", tag: "New", rating: 5.0, reviews: 0,
  desc: "A short description of the card." },
```

- `id` must be unique and lowercase-with-dashes.
- `priceCents`: 600 = $6.00, 700 = $7.00, etc.
- `category`: one of `birthday, love, congrats, thankyou, parents, holiday`.
- `tag`: a little badge like "New" or "Bestseller" (leave `""` for none).

**Important — prices live in two places for security.** After editing a card's
`id` or `priceCents`, mirror it in **`netlify/functions/create-checkout.js`** in
the `CATALOG` list. The website shows prices from `products.js`, but the server
only charges what's in `create-checkout.js`, so buyers can never change a price.
Keep the two lists matching.

### Real photos instead of emoji (drop-in — no code editing)
Every card automatically looks for a photo at `site/img/<id>.jpg`. If the file
is there, the photo shows; if not, the emoji shows. So you can add photos one at
a time, in any order:
1. Save/export your card photo (square, ~1000×1000px works best).
2. Rename it to the card's id, e.g. `getwell-dachshund.jpg`.
3. Drop it in **`site/img/`** and upload to GitHub — it appears on the site.

The full list of exact filenames for every card is in `site/img/README.txt`.

**Multiple photos per card:** the product page shows an image gallery with
left/right arrows. The main photo is `<id>.jpg`; add extra angles as
`<id>-2.jpg`, `<id>-3.jpg`, … (up to `-6`) and they become slides automatically.

---

## Things you can change easily

| What | Where |
|---|---|
| Shipping price / free-shipping threshold | top of `site/js/cart.js` **and** `netlify/functions/create-checkout.js` (keep them equal) |
| Announcement bar text | the `.announce` line near the top of each `.html` page |
| Your story / about text | `index.html`, the "STORY" section |
| Reviews shown on the homepage | `index.html`, the "REVIEWS" section |
| Contact email | search the files for `hello@justalovenote.com` and replace |
| Ship to more countries | `allowed_countries` in `create-checkout.js` |

---

## Digital downloads (printables) — already wired up ✅

Your printable/SVG cards work like this: when someone buys one, the thank-you
page shows them a **Download** button after payment is confirmed. To finish:

1. Put your real files in **`site/downloads/`**, using the exact filenames listed
   in `site/downloads/README.txt` (placeholders are there now so you can test).
2. That's it — digital-only orders skip shipping and the address form
   automatically.

To add a new printable later, see the instructions in `site/downloads/README.txt`.

## Order-received emails — setup (one-time)

You'll get a nicely formatted email (items + shipping address) for every order.
It uses **Resend** to send the email and a **Stripe webhook** to trigger it.

**A. Get a Resend key (free)**
1. Sign up at **resend.com**.
2. Go to **API Keys → Create API Key**, copy it (starts with `re_`).
3. (Optional but nicer) Under **Domains**, add `justalovenote.com` and add the
   DNS records it gives you in Netlify DNS — then you can send from
   `orders@justalovenote.com`. If you skip this, the email just comes from
   Resend's default address, which is fine for alerts to yourself.

**B. Add these Netlify environment variables**
   (Site configuration → Environment variables)
   - `RESEND_API_KEY`   = your `re_…` key
   - `ORDER_EMAIL_TO`   = the inbox where you want order alerts (e.g. your Gmail).
     To send alerts to **more than one** inbox, separate them with commas:
     `you@gmail.com, partner@gmail.com`
   - `ORDER_EMAIL_FROM` = *(optional)* `Just a Love Note <orders@justalovenote.com>`
     once your domain is verified; otherwise leave it unset.

**C. Create the Stripe webhook**
1. In Stripe: **Developers → Webhooks → Add endpoint**.
2. Endpoint URL: `https://justalovenote.com/.netlify/functions/stripe-webhook`
3. Under "Select events," choose **`checkout.session.completed`**. Create it.
4. Copy the endpoint's **Signing secret** (`whsec_…`) and add it in Netlify as
   `STRIPE_WEBHOOK_SECRET`.
5. Redeploy.

**D. Test it:** place a test order — an order email should hit your inbox within
a few seconds.

> Note: Stripe webhooks are per-mode. Set the webhook up in **test** mode to test
> (its signing secret differs), then create a **live**-mode webhook the same way
> before you go live, and update `STRIPE_WEBHOOK_SECRET` to the live one.

**Customer confirmation email.** The same webhook also sends the *buyer* a branded
"thank you for your order" email. This only sends once you've **verified
justalovenote.com in Resend** and set `ORDER_EMAIL_FROM` — because Resend (like
all email services) won't let you email customers from its shared default
address. Your own order alerts work right away regardless; the customer email
simply switches on after domain verification. So: to get *both* emails, do the
optional domain step (A3) and set `ORDER_EMAIL_FROM`.

## Contact / custom-order form — already wired up ✅

`contact.html` uses **Netlify Forms** (free). Once the site is on Netlify, every
submission shows up under **Netlify → Forms**, and you can turn on email alerts
at **Forms → Settings & usage → Form notifications** so a copy lands in your
inbox. No code or third-party account needed.

## Optional but recommended later

- **Order emails to you:** Stripe can email you on every sale
  (Dashboard → Settings → Notifications). For branded customer emails, look at
  Stripe's receipts settings.
## Sales tax — code is ready, needs 3 clicks in Stripe ✅

Your checkout can calculate sales tax automatically, but it's **off by default**
so you can test freely. Turn it on only after the steps below — otherwise Stripe
has nothing configured and checkout will error.

1. Get a **California seller's permit** — it's free at the CDTFA website
   (cdtfa.ca.gov). You collect CA sales tax on orders shipped to California; you
   generally don't owe tax in other states until you're doing $100k+/yr into that
   state, so a small shop realistically only deals with California.
2. In Stripe (on your **live** account), go to **Settings → Tax**, turn on
   **Stripe Tax**, and set your **origin address** (your business address).
3. Add your **registration** for California (Settings → Tax → Registrations).
4. In **Netlify → Environment variables**, add `STRIPE_TAX_ENABLED` = `true`,
   then redeploy. This is the switch that actually turns tax on at checkout.
   (Leave this variable unset — or delete it — to test checkout without tax.)

That's it — tax then appears as its own line at checkout, calculated from the
buyer's address. Digital downloads are handled too: the checkout code tags each
item with a Stripe tax code (physical cards = `txcd_99999999` General/Tangible
Goods, digital = `txcd_10501000` downloaded digital images), so Stripe applies
each state's rule correctly with no dashboard changes. Stripe charges a small fee
per taxed transaction. *(This isn't tax advice — confirm specifics with CDTFA or
an accountant.)*

> Heads up: until you complete steps 1–3, leave real (live) checkout off, or
> Stripe will simply calculate $0 tax. It won't break anything, but you want tax
> turned on before you start taking real California orders.
- **Stronger download protection:** the printable links are public file paths
  (fine for low-cost items). For pricier digital goods, ask about expiring,
  single-use download links.

---

## Costs summary

- Hosting (Netlify): **free** for a shop this size.
- Domain: what you already paid (~$12/yr).
- Stripe: **no monthly fee** — about **2.9% + $0.30 per sale**.

Questions or want me to add a feature? Just ask. 💌
