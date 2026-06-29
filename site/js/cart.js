/* ============================================================
   Just a Love Note — cart + checkout (client side)
   Cart is stored in the browser (localStorage). Prices shown
   here are for display only; the serverless function re-checks
   every price before charging, so nothing can be tampered with.
   ============================================================ */

const SHIP_FLAT_CENTS = 400;    // $4.00 flat shipping
const SHIP_FREE_OVER  = 2500;   // free shipping over $25.00
const CART_KEY = "jaln_cart";

const money = c => "$" + (c / 100).toFixed(2);
const byId  = id => PRODUCTS.find(p => p.id === id);

function getCart()  { try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch { return {}; } }
function saveCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); renderCart(); updateCount(); }

function addToCart(id, qty = 1) {
  const cart = getCart();
  cart[id] = (cart[id] || 0) + qty;
  saveCart(cart);
  toast(`Added “${byId(id).name}” to cart`);
  openCart();
}
function setQty(id, qty) {
  const cart = getCart();
  if (qty <= 0) delete cart[id]; else cart[id] = qty;
  saveCart(cart);
}
function removeItem(id){ const c = getCart(); delete c[id]; saveCart(c); }

function cartCount(){ return Object.values(getCart()).reduce((a, b) => a + b, 0); }
function subtotalCents(){
  const cart = getCart();
  return Object.entries(cart).reduce((sum, [id, q]) => {
    const p = byId(id); return p ? sum + p.priceCents * q : sum;
  }, 0);
}
function hasPhysical(){
  return Object.keys(getCart()).some(id => { const p = byId(id); return p && p.type !== "digital"; });
}
function shippingCents(){
  const sub = subtotalCents();
  if (sub === 0 || !hasPhysical()) return 0; // digital-only orders ship nothing
  return sub >= SHIP_FREE_OVER ? 0 : SHIP_FLAT_CENTS;
}

function updateCount(){
  document.querySelectorAll(".cart-count").forEach(el => el.textContent = cartCount());
}

/* ---------- render the drawer ---------- */
function renderCart(){
  const wrap = document.getElementById("cartItems");
  const foot = document.getElementById("cartFoot");
  if (!wrap) return;
  const cart = getCart();
  const ids = Object.keys(cart);

  if (ids.length === 0){
    wrap.innerHTML = `<div class="cart-empty"><div style="font-size:2.4rem">🧺</div>
      <p>Your cart is empty.<br>Time to find a card to love.</p>
      <a href="shop.html" class="btn btn-ghost" style="margin-top:16px">Browse cards →</a></div>`;
    foot.style.display = "none";
    return;
  }

  wrap.innerHTML = ids.map(id => {
    const p = byId(id); if (!p) return "";
    const q = cart[id];
    const art = p.image ? `<img src="${p.image}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:10px">` : p.emoji;
    return `<div class="citem">
      <div class="ci-art" style="background:${p.bg}">${art}</div>
      <div class="ci-info">
        <b>${p.name}</b>
        <div class="ci-price">${money(p.priceCents)}</div>
        <div class="ci-qty">
          <button onclick="setQty('${id}', ${q - 1})" aria-label="decrease">−</button>
          <span>${q}</span>
          <button onclick="setQty('${id}', ${q + 1})" aria-label="increase">+</button>
        </div>
        <button class="ci-remove" onclick="removeItem('${id}')">Remove</button>
      </div>
    </div>`;
  }).join("");

  const sub = subtotalCents(), ship = shippingCents();
  const toFree = SHIP_FREE_OVER - sub;
  const shipNote = !hasPhysical()
    ? `<div class="ship-note">Instant downloads — no shipping needed ✨</div>`
    : (toFree > 0
        ? `<div class="ship-note">Add ${money(toFree)} more for free shipping ✨</div>`
        : `<div class="ship-note">You've earned free shipping! 🎉</div>`);
  foot.style.display = "block";
  foot.innerHTML = `
    <div class="cart-row"><span>Subtotal</span><span>${money(sub)}</span></div>
    <div class="cart-row"><span>Shipping</span><span>${ship === 0 ? "FREE" : money(ship)}</span></div>
    ${shipNote}
    <div class="cart-row total"><span>Total</span><span>${money(sub + ship)}</span></div>
    <button class="btn btn-primary" id="checkoutBtn" onclick="checkout()">Checkout securely →</button>
    <p style="font-size:.74rem;color:var(--ink-soft);text-align:center;margin-top:10px">Secure payment by Stripe</p>`;
}

/* ---------- drawer open/close ---------- */
function openCart(){ document.getElementById("cartDrawer")?.classList.add("open"); document.getElementById("cartOverlay")?.classList.add("open"); }
function closeCart(){ document.getElementById("cartDrawer")?.classList.remove("open"); document.getElementById("cartOverlay")?.classList.remove("open"); }

/* ---------- toast ---------- */
let toastTimer;
function toast(msg){
  let t = document.getElementById("toast");
  if (!t){ t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
  t.innerHTML = "💌 " + msg;
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- checkout via serverless function ---------- */
async function checkout(){
  const btn = document.getElementById("checkoutBtn");
  const cart = getCart();
  const items = Object.entries(cart).map(([id, qty]) => ({ id, qty }));
  if (items.length === 0) return;
  if (btn){ btn.disabled = true; btn.textContent = "Sending you to checkout…"; }
  try {
    const res = await fetch("/.netlify/functions/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items })
    });
    const data = await res.json();
    if (data.url) { window.location.href = data.url; }
    else { throw new Error(data.error || "Checkout failed"); }
  } catch (e) {
    toast("Sorry — checkout isn't connected yet.");
    if (btn){ btn.disabled = false; btn.textContent = "Checkout securely →"; }
    console.error(e);
  }
}

/* ---------- inject drawer markup + wire nav ---------- */
function injectCart(){
  const html = `
    <div class="cart-overlay" id="cartOverlay" onclick="closeCart()"></div>
    <aside class="cart-drawer" id="cartDrawer" aria-label="Shopping cart">
      <div class="cart-head"><h3>Your Cart</h3><button class="cart-close" onclick="closeCart()" aria-label="close">×</button></div>
      <div class="cart-items" id="cartItems"></div>
      <div class="cart-foot" id="cartFoot"></div>
    </aside>`;
  document.body.insertAdjacentHTML("beforeend", html);
  document.querySelectorAll("[data-open-cart]").forEach(el => el.addEventListener("click", e => { e.preventDefault(); openCart(); }));
  renderCart(); updateCount();
}

document.addEventListener("DOMContentLoaded", injectCart);
