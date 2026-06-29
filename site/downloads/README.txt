YOUR DIGITAL DOWNLOAD FILES GO HERE
===================================

When someone buys a digital/printable card, the website hands them a link to a
file in THIS folder. The placeholder files here are just stand-ins so you can
test the flow — replace each one with your real printable, keeping the EXACT
same filename.

Required filenames (must match exactly):

  printable-fathers-day.pdf        ← Printable Father's Day Card
  printable-grandma-birthday.pdf   ← Printable Grandma Birthday Card
  printable-auntie-birthday.pdf    ← Printable Auntie Birthday Card
  printable-nana-birthday.pdf      ← Printable Nana Birthday Card
  color-your-own-mothers-day.pdf   ← Color-Your-Own Mother's Day Card
  minimalist-thank-you.pdf         ← Minimalist Thank You PDF Template
  rainbow-love-card-svg.zip        ← Rainbow Love Card SVG (zip the SVG + envelope)
  candy-corn-card-svg.zip          ← Candy Corn Halloween Card SVG (zip the files)

To add a NEW digital product later:
  1. Drop the file in this folder.
  2. Add the product in  site/js/products.js  with  type:"digital"  and
     file:"downloads/your-file.pdf".
  3. Mirror it in  netlify/functions/create-checkout.js  (CATALOG, with digital:true)
     and in  netlify/functions/get-downloads.js  (DIGITAL_FILES).

Note on protection: these links point to files served by your site, so they are
not heavily locked down — fine for low-cost printables. If you ever sell
higher-priced digital goods and want expiring/single-use links, ask and we can
upgrade the delivery to signed URLs.
