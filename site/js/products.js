/* ============================================================
   Just a Love Note — product catalog
   ------------------------------------------------------------
   To add a card: copy a block, give it a unique `id`, set the
   `priceCents` (e.g. 600 = $6.00), category, and emoji/photo.
   IMPORTANT: every id + priceCents here must also be mirrored in
   netlify/functions/create-checkout.js (the server validates
   prices so buyers can't tamper with them). Keep them in sync.

   `type`: "physical" (default) ships in the mail, or "digital"
   for instant-download printables (no shipping; delivered on the
   thank-you page after payment). Digital items also need a
   `file` here AND in the server's DIGITAL_FILES map.

   Swap `emoji` for `image: "img/your-photo.jpg"` when you have
   real product photos — the pages use the photo if present.
   ============================================================ */

const CATEGORIES = [
  { id: "birthday", label: "Birthday",        emoji: "🎂", bg: "#f5e6df" },
  { id: "love",     label: "Love & Sympathy", emoji: "💕", bg: "#efe2d4" },
  { id: "congrats", label: "Congrats",        emoji: "🎉", bg: "#e6ece1" },
  { id: "thankyou", label: "Thank You",       emoji: "🙏", bg: "#f3e7df" },
  { id: "parents",  label: "Mom & Dad",       emoji: "🌷", bg: "#f0e4dc" },
  { id: "holiday",  label: "Holidays",        emoji: "🎄", bg: "#e9e3d6" },
  { id: "digital",  label: "Digital Downloads", emoji: "⬇️", bg: "#eef0e6" }
];

const PRODUCTS = [
  /* ---------------- BIRTHDAY ---------------- */
  { id:"cassette-classic", name:"Cassette Tape Birthday — You're a Classic", priceCents:600, category:"birthday", emoji:"📼", bg:"#f3e2d6", tag:"", rating:5.0, reviews:16, desc:"A retro cassette-tape birthday card for the timeless person in your life. You're a classic!" },
  { id:"monkey-bananas", name:"Funny Monkey Birthday — Go Bananas", priceCents:600, category:"birthday", emoji:"🐵", bg:"#efe7d6", tag:"New", rating:5.0, reviews:9, desc:"A cheeky monkey card to tell someone to go bananas on their big day. Blank inside." },
  { id:"cat-birthday", name:"Funny Cat Birthday — Kraft Silhouette", priceCents:600, category:"birthday", emoji:"🐱", bg:"#eee2cf", tag:"", rating:5.0, reviews:31, desc:"A black-cat silhouette on warm kraft cardstock. Understated, funny, purr-fect for cat people." },
  { id:"candles-birthday", name:"Hand-Drawn Birthday Candles Card", priceCents:600, category:"birthday", emoji:"🕯️", bg:"#f5e6df", tag:"", rating:5.0, reviews:7, desc:"Colorful hand-drawn candles for a cheerful happy-birthday message." },
  { id:"flowerpot-birthday", name:"Hand-Drawn Flower Pot — Happy Birthday", priceCents:600, category:"birthday", emoji:"🪴", bg:"#eef0e6", tag:"", rating:5.0, reviews:6, desc:"A charming hand-drawn flower pot birthday card for any plant or flower lover." },
  { id:"teacup-birthday", name:"Tea Cup Birthday Card — Floral Blooms", priceCents:800, category:"birthday", emoji:"🍵", bg:"#f0e4dc", tag:"", rating:5.0, reviews:8, desc:"A delicate teacup overflowing with floral blooms. Sweet for the tea lover's birthday." },
  { id:"dog-birthday", name:"Funny Dog Birthday — Pawfect Day", priceCents:600, category:"birthday", emoji:"🐶", bg:"#f3e2d6", tag:"", rating:5.0, reviews:12, desc:"Wish them a pawfect day with this dog-lover birthday card." },
  { id:"pawty-birthday", name:"Pawty Time Birthday Card", priceCents:600, category:"birthday", emoji:"🐾", bg:"#f5e6df", tag:"", rating:5.0, reviews:5, desc:"A hand-drawn pet-celebration card — it's pawty time!" },
  { id:"cupcake-shaker", name:"Cupcake Shaker Birthday Card", priceCents:1300, category:"birthday", emoji:"🧁", bg:"#f6e7e3", tag:"Interactive", rating:5.0, reviews:22, desc:"An embossed, interactive shaker cupcake card that's as fun to hold as it is to give." },

  /* ---------------- LOVE & SYMPATHY ---------------- */
  { id:"getwell-dachshund", name:"Get Well Soon — Dachshund Scooter", priceCents:600, category:"love", emoji:"🐶", bg:"#f3e2d6", tag:"Bestseller", rating:5.0, reviews:38, desc:"A humorous get-well card featuring a determined little dachshund on a scooter. Blank inside." },
  { id:"otter-half", name:"You Are My Otter Half", priceCents:600, category:"love", emoji:"🦦", bg:"#e6ece1", tag:"", rating:5.0, reviews:21, desc:"A punny anniversary and love card for your favorite person. Original paper-cut otter design." },
  { id:"i-lava-you", name:"I Lava You — Volcano Anniversary", priceCents:600, category:"love", emoji:"🌋", bg:"#f6e7e3", tag:"", rating:5.0, reviews:24, desc:"An erupting-with-love volcano card. A funny, heartfelt pick for anniversaries and Valentine's Day." },
  { id:"handmade-with-love", name:"Handmade With Love — Floral", priceCents:600, category:"love", emoji:"💐", bg:"#f5e6df", tag:"", rating:5.0, reviews:11, desc:"A floral anniversary and Valentine's card, handmade with love." },
  { id:"chemistry-anniversary", name:"Funny Chemistry Anniversary Card", priceCents:600, category:"love", emoji:"⚗️", bg:"#e6ece1", tag:"", rating:5.0, reviews:9, desc:"A nerdy chemistry-pun card for the chemist or science lover you adore." },
  { id:"love-you-a-latte", name:"Love You a Latte Coffee Card", priceCents:600, category:"love", emoji:"☕", bg:"#f6e7e3", tag:"", rating:5.0, reviews:14, desc:"A coffee-pun anniversary card for the one you love a whole latte." },
  { id:"dumpling-valentine", name:"Funny Dumpling Valentine Card", priceCents:600, category:"love", emoji:"🥟", bg:"#f0e4dc", tag:"", rating:5.0, reviews:6, desc:"A foodie anniversary and Valentine's card for your favorite dumpling." },
  { id:"heart-shaker", name:"Heart Shaker Card", priceCents:1000, category:"love", emoji:"❤️", bg:"#f6e7e3", tag:"Interactive", rating:5.0, reviews:13, desc:"A handmade shaker card for Valentine's Day or an anniversary — full of moving hearts." },
  { id:"hedgehog-valentine", name:"Hedgehog Valentine — Hedgehugs & Kisses", priceCents:600, category:"love", emoji:"🦔", bg:"#efe7d6", tag:"", rating:5.0, reviews:7, desc:"Hedgehugs and kisses! An adorable hedgehog Valentine's and anniversary card." },
  { id:"i-chews-you", name:"I Chews You — Funny Dog Valentine", priceCents:600, category:"love", emoji:"🐕", bg:"#f3e2d6", tag:"", rating:5.0, reviews:5, desc:"A funny dog Valentine and anniversary card — I chews you!" },
  { id:"you-light-up", name:"You Light Up My Life — Anniversary", priceCents:600, category:"love", emoji:"💡", bg:"#f3e7df", tag:"", rating:5.0, reviews:4, desc:"A warm 'you light up my life' anniversary card." },
  { id:"mailbox-anniversary", name:"Embossed Mailbox Anniversary Card", priceCents:700, category:"love", emoji:"📫", bg:"#e9e3d6", tag:"Embossed", rating:5.0, reviews:8, desc:"An embossed love-letter mailbox card for anniversaries and just-because notes." },
  { id:"dog-sympathy", name:"Embossed Dog Sympathy — Pet Loss", priceCents:600, category:"love", emoji:"🐾", bg:"#eee2cf", tag:"Embossed", rating:5.0, reviews:10, desc:"A gentle embossed sympathy card for the loss of a beloved dog." },
  { id:"embossed-cross", name:"Embossed Cross — Sympathy & Baptism", priceCents:700, category:"love", emoji:"✝️", bg:"#e9e3d6", tag:"Embossed", rating:5.0, reviews:12, desc:"An elegant embossed cross card for sympathy, baptism, and christening occasions." },
  { id:"floral-cross", name:"Floral Cross — Religious Easter & Baptism", priceCents:700, category:"love", emoji:"🌸", bg:"#f5e6df", tag:"", rating:5.0, reviews:9, desc:"A handmade floral cross card for Easter, baptism, and sympathy." },
  { id:"bear-hugs", name:"Sending Bear Hugs — Thinking of You", priceCents:600, category:"love", emoji:"🐻", bg:"#efe7d6", tag:"", rating:5.0, reviews:6, desc:"A cute bear card to send hugs and let someone know you're thinking of them." },

  /* ---------------- CONGRATS (weddings, baby, grads) ---------------- */
  { id:"snailed-it-grad", name:"Snailed It Graduation Card", priceCents:600, category:"congrats", emoji:"🐌", bg:"#e6ece1", tag:"New", rating:5.0, reviews:11, desc:"A funny congrats card for new grads who finally snailed it." },
  { id:"lightbulb-grad", name:"Funny Graduation — Lightbulb Pun", priceCents:600, category:"congrats", emoji:"💡", bg:"#f3e7df", tag:"", rating:5.0, reviews:5, desc:"A bright idea for the new grad — a lightbulb-pun congrats card." },
  { id:"grad-cap-shaker", name:"Graduation Shaker — Grad Cap", priceCents:1100, category:"congrats", emoji:"🎓", bg:"#eef0e6", tag:"Interactive", rating:5.0, reviews:8, desc:"An interactive shaker grad-cap card to celebrate the big achievement." },
  { id:"bright-future-grad", name:"Bright Future Grad Thank You", priceCents:600, category:"congrats", emoji:"🎓", bg:"#e6ece1", tag:"", rating:5.0, reviews:4, desc:"A thank-you card for the teacher, professor, or counselor who lit the way." },
  { id:"elephant-baby", name:"Elephant Baby Shower Card", priceCents:600, category:"congrats", emoji:"🐘", bg:"#eef0e6", tag:"", rating:5.0, reviews:8, desc:"A hand-drawn elephant card to welcome a new baby. Sweet and gender-neutral." },
  { id:"bridal-shower", name:"Bridal Shower Card — White Dress", priceCents:600, category:"congrats", emoji:"👗", bg:"#f5e6df", tag:"", rating:5.0, reviews:6, desc:"A handmade bridal shower card with a flower-trimmed white dress." },
  { id:"bride-groom", name:"Bride & Groom — Newlyweds Card", priceCents:750, category:"congrats", emoji:"💍", bg:"#f0e4dc", tag:"", rating:5.0, reviews:7, desc:"A congrats card for engagements, bridal showers, and newlyweds." },
  { id:"ski-wedding", name:"Ski Wedding Card — Adventurous Couple", priceCents:600, category:"congrats", emoji:"🎿", bg:"#e6ece1", tag:"", rating:5.0, reviews:9, desc:"A unique hand-drawn wedding card for the couple who loves to ski." },
  { id:"snowboarder-wedding", name:"Snowboarder Wedding Card", priceCents:600, category:"congrats", emoji:"🏂", bg:"#e9e3d6", tag:"", rating:5.0, reviews:5, desc:"An adventurous engagement and wedding card for snowboarding couples." },
  { id:"holy-guacamole", name:"Holy Guacamole — Funny Congrats", priceCents:600, category:"congrats", emoji:"🥑", bg:"#e6ece1", tag:"", rating:5.0, reviews:6, desc:"A personalizable avocado congrats card — holy guacamole!" },

  /* ---------------- THANK YOU ---------------- */
  { id:"thanks-a-latte", name:"Thanks a Latte Coffee Card", priceCents:600, category:"thankyou", emoji:"☕", bg:"#f6e7e3", tag:"", rating:5.0, reviews:17, desc:"Say thank you a latte with this handmade coffee-pun card." },
  { id:"thanks-a-bunch", name:"Flower Thank You Set — Thanks a Bunch", priceCents:600, category:"thankyou", emoji:"💐", bg:"#f0e4dc", tag:"Set", rating:5.0, reviews:19, desc:"A handmade flower card set on kraft cardstock. Thanks a bunch!" },
  { id:"watermelon-thankyou", name:"Watermelon Thank You Card Set", priceCents:600, category:"thankyou", emoji:"🍉", bg:"#f5e6df", tag:"Set", rating:5.0, reviews:8, desc:"A funny summer-fruit thank-you card set — one in a melon." },
  { id:"thank-ewe", name:"Thank Ewe — Funny Sheep Card", priceCents:600, category:"thankyou", emoji:"🐑", bg:"#eef0e6", tag:"", rating:5.0, reviews:7, desc:"A punny sheep thank-you note. Thank ewe so much!" },
  { id:"lemon-thankyou", name:"Lemon Thank You Card Set", priceCents:600, category:"thankyou", emoji:"🍋", bg:"#f3e7df", tag:"Set", rating:5.0, reviews:6, desc:"A bright, funny fruit thank-you card set." },
  { id:"teacher-latte-holder", name:"Teacher Thanks a Latte — Gift Card Holder (Set of 4)", priceCents:1600, category:"thankyou", emoji:"☕", bg:"#f6e7e3", tag:"Set", rating:5.0, reviews:9, desc:"A set of four coffee-cup gift-card holders for teacher appreciation." },

  /* ---------------- MOM & DAD ---------------- */
  { id:"sunflower-mom", name:"Sunflower Mother's Day — Paper Cut", priceCents:600, category:"parents", emoji:"🌻", bg:"#f0e4dc", tag:"", rating:5.0, reviews:14, desc:"A layered paper-cut sunflower card for Mom. Bright and cheerful." },
  { id:"flowerpot-mom", name:"Hand-Drawn Flower Pot — Mother's Day", priceCents:600, category:"parents", emoji:"🪴", bg:"#eef0e6", tag:"", rating:5.0, reviews:6, desc:"A charming hand-drawn flower pot card for Mom or any flower lover." },
  { id:"elephant-mom", name:"Elephant Mother's Day Card", priceCents:600, category:"parents", emoji:"🐘", bg:"#eef0e6", tag:"", rating:5.0, reviews:7, desc:"An elephant card for Mother's Day, a new mom, or a baby shower." },
  { id:"coffee-cup-mom", name:"Floral Coffee Cup — Mother's Day Gift Card Holder", priceCents:600, category:"parents", emoji:"☕", bg:"#f6e7e3", tag:"", rating:5.0, reviews:8, desc:"A handmade floral coffee-cup gift-card holder for Mom." },
  { id:"watering-can", name:"Watering Can Flower Card", priceCents:700, category:"parents", emoji:"🌼", bg:"#eef0e6", tag:"", rating:5.0, reviews:10, desc:"A handmade watering-can flower card for Mother's Day or a birthday." },
  { id:"cherry-blossom-mom", name:"Cherry Blossom Mother's Day Card", priceCents:800, category:"parents", emoji:"🌸", bg:"#f5e6df", tag:"", rating:5.0, reviews:6, desc:"A floral cherry-blossom card on kraft cardstock for Mom." },
  { id:"daisy-mom", name:"Daisy Mother's Day Card — Embossed", priceCents:800, category:"parents", emoji:"🌼", bg:"#f0e4dc", tag:"Embossed", rating:5.0, reviews:5, desc:"An embossed floral daisy card for Mother's Day." },
  { id:"fox-mom", name:"Fox Mother's Day Card — New Mom", priceCents:600, category:"parents", emoji:"🦊", bg:"#f3e2d6", tag:"", rating:5.0, reviews:4, desc:"A cute fox card for Mother's Day or a new mom." },
  { id:"hawaiian-shirt", name:"3D Hawaiian Shirt Card — Dad & Retirement", priceCents:700, category:"parents", emoji:"🌺", bg:"#f6e7e3", tag:"3D", rating:5.0, reviews:9, desc:"A handmade 3D Hawaiian-shirt card for a birthday, Father's Day, or retirement." },
  { id:"deer-dad", name:"Embossed Deer Card — Dad & Birthday", priceCents:600, category:"parents", emoji:"🦌", bg:"#e9e3d6", tag:"Embossed", rating:5.0, reviews:7, desc:"An embossed deer card for a birthday or Father's Day." },

  /* ---------------- HOLIDAYS ---------------- */
  { id:"american-flag", name:"Embossed American Flag Card", priceCents:800, category:"holiday", emoji:"🇺🇸", bg:"#e9e3d6", tag:"Embossed", rating:5.0, reviews:10, desc:"An embossed American-flag card for the 4th of July or a new-citizenship celebration." },
  { id:"hot-cocoa-tags", name:"Hot Cocoa Gift Tags — 3D Red Mug Set", priceCents:1600, category:"holiday", emoji:"☕", bg:"#f3e2d6", tag:"Set", rating:5.0, reviews:6, desc:"A handmade set of 3D red-mug hot-cocoa holiday gift tags." },
  { id:"christmas-tree-tags", name:"Christmas Tree Gift Tags — Gold Deer (Set of 3)", priceCents:850, category:"holiday", emoji:"🎄", bg:"#e6ece1", tag:"Set", rating:5.0, reviews:7, desc:"A set of three gold-deer Christmas-tree gift tags." },
  { id:"embossed-holiday-set", name:"Embossed Holiday Cards — Kraft (Set of 3)", priceCents:1400, category:"holiday", emoji:"🎄", bg:"#e9e3d6", tag:"Set", rating:5.0, reviews:8, desc:"A set of three embossed kraft holiday cards." },
  { id:"ghost-halloween", name:"Cute Ghost Halloween Card", priceCents:600, category:"holiday", emoji:"👻", bg:"#efe7d6", tag:"", rating:5.0, reviews:5, desc:"A cute ghost card with friendly fall greetings." },
  { id:"hello-pumpkin", name:"Hello Pumpkin Halloween Card", priceCents:600, category:"holiday", emoji:"🎃", bg:"#f3e2d6", tag:"", rating:5.0, reviews:6, desc:"A cute 'hello pumpkin' Halloween greeting card." },
  { id:"fleece-navidad", name:"Fleece Navidad — Funny Sheep Christmas", priceCents:600, category:"holiday", emoji:"🐑", bg:"#e6ece1", tag:"", rating:5.0, reviews:7, desc:"A punny sheep Christmas card — fleece navidad!" },

  /* ---------------- DIGITAL DOWNLOADS ---------------- */
  { id:"printable-dad", name:"Printable Father's Day Card — DIY Coloring", priceCents:299, category:"digital", type:"digital", file:"downloads/printable-fathers-day.pdf", emoji:"🖍️", bg:"#f3e7df", tag:"Digital", rating:5.0, reviews:6, desc:"An instant-download printable coloring card for Dad. Print at home, color, and give." },
  { id:"printable-grandma", name:"Printable Grandma Birthday Card — DIY Coloring", priceCents:299, category:"digital", type:"digital", file:"downloads/printable-grandma-birthday.pdf", emoji:"🖍️", bg:"#f5e6df", tag:"Digital", rating:5.0, reviews:5, desc:"A printable DIY coloring-page birthday card for Grandma. Instant download." },
  { id:"printable-auntie", name:"Printable Auntie Birthday Card — DIY Coloring", priceCents:299, category:"digital", type:"digital", file:"downloads/printable-auntie-birthday.pdf", emoji:"🖍️", bg:"#f0e4dc", tag:"Digital", rating:5.0, reviews:4, desc:"A printable DIY coloring-page birthday card for an aunt. Instant download." },
  { id:"printable-nana", name:"Printable Nana Birthday Card — DIY Coloring", priceCents:299, category:"digital", type:"digital", file:"downloads/printable-nana-birthday.pdf", emoji:"🖍️", bg:"#eef0e6", tag:"Digital", rating:5.0, reviews:4, desc:"A printable DIY coloring-page birthday card for Nana. Instant download." },
  { id:"color-mom", name:"Color-Your-Own Mother's Day Card — Floral MOM", priceCents:299, category:"digital", type:"digital", file:"downloads/color-your-own-mothers-day.pdf", emoji:"🖍️", bg:"#f5e6df", tag:"Digital", rating:5.0, reviews:5, desc:"A color-your-own floral 'MOM' Mother's Day card. Instant printable download." },
  { id:"minimalist-thankyou-pdf", name:"Minimalist Thank You Card — PDF Template", priceCents:299, category:"digital", type:"digital", file:"downloads/minimalist-thank-you.pdf", emoji:"📄", bg:"#e9e3d6", tag:"Digital", rating:5.0, reviews:7, desc:"A hand-drawn minimalist thank-you card you can print at home. Instant PDF." },
  { id:"rainbow-love-svg", name:"Rainbow Love Card SVG — DIY Pride", priceCents:249, category:"digital", type:"digital", file:"downloads/rainbow-love-card-svg.zip", emoji:"🌈", bg:"#f6e7e3", tag:"SVG", rating:5.0, reviews:8, desc:"A DIY rainbow love card SVG with envelope, ready for your Cricut or cutter." },
  { id:"candy-corn-svg", name:"Candy Corn Halloween Card SVG — Cricut", priceCents:349, category:"digital", type:"digital", file:"downloads/candy-corn-card-svg.zip", emoji:"🍬", bg:"#f3e2d6", tag:"SVG", rating:5.0, reviews:5, desc:"A candy-corn Halloween card SVG template for Cricut and other cutting machines." }
];

/* ------------------------------------------------------------
   Photo with automatic emoji fallback.
   Each product looks for a photo at  img/<id>.jpg  (or a custom
   path set in the product's `image` field). If that file isn't
   there yet, the emoji shows instead — so you can add photos one
   at a time just by dropping correctly-named files into site/img/.
   See site/img/README.txt for the exact filename for each card.
   ------------------------------------------------------------ */
function coverArt(p) {
  const src = p.image || `img/${p.id}.jpg`;
  const name = (p.name || "").replace(/"/g, "&quot;");
  return `<span class="art-emoji">${p.emoji}</span>` +
         `<img class="art-photo" src="${src}" alt="${name}" loading="lazy" onerror="this.remove()">`;
}
function isDigital(p){ return p && p.type === "digital"; }
