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
│  ├─ success.html           ← shown after a successful purchase (+ digital downloads)
│  ├─ cancel.html            ← shown if checkout is abandoned
│  ├─ css/styles.css         ← all the styling
│  ├─ downloads/             ← your printable/SVG files live here (see its README.txt)
│  └─ js/
│     ├─ products.js         ← YOUR CARD LIST (edit this to add/remove cards)
│     └─ cart.js             ← cart + checkout logic
├─ netlify/functions/
│  ├─ create-checkout.js     ← the secure Stripe checkout (server-side prices)
│  └─ get-downloads.js       ← delivers digital downloads after payment
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

### Real photos instead of emoji
1. Make a folder `site/img/` and drop in your photos.
2. In a product, add `image: "img/your-photo.jpg"` (the page uses the photo
   automatically when it's there). Square images (1000×1000px) look best.

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

## Contact / custom-order form — already wired up ✅

`contact.html` uses **Netlify Forms** (free). Once the site is on Netlify, every
submission shows up under **Netlify → Forms**, and you can turn on email alerts
at **Forms → Settings & usage → Form notifications** so a copy lands in your
inbox. No code or third-party account needed.

## Optional but recommended later

- **Order emails to you:** Stripe can email you on every sale
  (Dashboard → Settings → Notifications). For branded customer emails, look at
  Stripe's receipts settings.
- **Sales tax:** Stripe Tax can auto-calculate it — enable in the dashboard and
  add `automatic_tax: { enabled: true }` to the session in `create-checkout.js`.
- **Stronger download protection:** the printable links are public file paths
  (fine for low-cost items). For pricier digital goods, ask about expiring,
  single-use download links.

---

## Costs summary

- Hosting (Netlify): **free** for a shop this size.
- Domain: what you already paid (~$12/yr).
- Stripe: **no monthly fee** — about **2.9% + $0.30 per sale**.

Questions or want me to add a feature? Just ask. 💌
