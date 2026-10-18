# Pastel Hoopes

**Cute hair accessories for everyday joy.**

Pastel Hoopes is a small Indian brand that sells soft, pretty hair accessories — claw clips, hair clips, scrunchies, mini clips, and curated hampers. This repository contains the complete online storefront built for the business: a lightweight, fast, mobile-friendly shop where customers can browse products, play Spin & Win / Scratch & Win, apply coupons, and place orders via WhatsApp.

---

## What We Sell

| Category        | Description                                      | Price range |
|-----------------|--------------------------------------------------|-------------|
| **Claw Clips**  | Glass-like transparent flower claw clips (Big & Medium) in multiple pastel colours | ₹15 – ₹25 |
| **Hair Clips**  | Elegant pearl & gem clips, black-silver flower clips | ₹20 – ₹30 |
| **Scrunchies**  | Soft satin scrunchies in champagne, cream, pink, blue, black, etc. | ₹25 (pair) |
| **Mini Clips**  | Cute star-shaped mini claw clips (pack of 5)     | ₹15 |
| **Hampers**     | Curated sets of 4–6 accessories                  | Always ₹99 |

Hampers are fixed-price bundles and are **never discounted**.

---

## Why This Project Exists

We wanted a simple online presence that:
- Looks soft and on-brand (pastel pinks, clean product photography)
- Lets customers discover products and play small games for discounts
- Sends orders straight to WhatsApp (no complicated checkout)
- Costs almost nothing to run

So we built a pure front-end shop that feels polished but stays easy to maintain.

---

## Tech Stack

| Layer              | Technology                          | Notes |
|--------------------|-------------------------------------|-------|
| **Markup**         | HTML5                               | Semantic, accessible |
| **Styling**        | CSS3 (custom properties, flex/grid) | Soft pastel theme, no heavy framework |
| **Logic**          | Vanilla JavaScript (ES6+)           | No React/Vue — keeps the site tiny |
| **Storage**        | `localStorage` + `sessionStorage`   | Cart, coupons, signup state |
| **Optional Backend**| Supabase (Edge Functions)           | Lead capture & prize recording (optional) |
| **Hosting**        | Netlify (static)                    | Free tier is enough |
| **Orders**         | WhatsApp deep links                 | Customer taps “Order” → chat opens with pre-filled message |

No build step, no npm, no bundler. Open `index.html` and it works.

---

## Project Structure

```
Pastel-Hoopes/
├── index.html              ← Main shop page (homepage)
├── css/
│   ├── style.css           ← Core layout, cards, typography
│   ├── wheel.css           ← Spin & Win modal
│   ├── scratch.css         ← Scratch & Win card
│   ├── auth.css            ← Signup modal styles
│   ├── decor.css           ← Decorative elements
│   └── gallery.css         ← Gallery page
├── js/
│   ├── products.js         ← Product catalogue + multi-image carousel
│   ├── cart.js             ← Cart, coupons, totals, WhatsApp order
│   ├── signup.js           ← Signup form UI & validation
│   ├── leads.js            ← Supabase lead / prize API calls
│   ├── wheel.js            ← Spin & Win logic
│   ├── scratch.js          ← Scratch & Win logic
│   ├── stats.js            ← Simple visitor / signup counters
│   ├── gallery.js          ← Gallery page behaviour
│   └── ...
├── pages/
│   ├── cart.html           ← Cart / checkout page
│   └── gallery.html        ← Photo gallery
└── public/
    └── images/
        ├── logo.png
        ├── products/       ← All product photos (organised by category)
        │   ├── claw-clips/
        │   ├── hair-clips/
        │   ├── scrunchies/
        │   ├── mini-clips/
        │   ├── jewelry/
        │   └── hampers/
        └── gallery/
```

---

## How Everything Works

### 1. Product Catalogue
Products live in `js/products.js` as a simple array. Each product can have **multiple images**.  
On desktop, hovering a product card starts a gentle left-to-right (then reverse) slideshow.  
On mobile/tablet, left/right arrows appear so customers can swipe through photos.

### 2. Cart
- Stored in `localStorage` so it survives page reloads
- Quantity steppers on product cards and cart page
- Live badge count in the header

### 3. Discounts & Coupons
Two kinds of rewards can be won:
- **% off coupons** → apply only to regular products (never to hampers)
- **Claw clip @ ₹15** → one eligible claw clip in the cart becomes ₹15

Hampers are **always ₹99**. The pricing logic in `cart.js` explicitly excludes them from every discount.

### 4. Spin & Win / Scratch & Win
- Locked until the customer signs up (name + WhatsApp)
- After signup, the games unlock
- Winning codes are saved in `localStorage` and automatically appear on the cart page

### 5. Signup
- Collects name + 10-digit Indian WhatsApp number
- Optionally sends the lead to Supabase (`js/leads.js`)
- Even if Supabase is not configured, the customer can still play the games in that browser session

### 6. Placing an Order
When the customer is ready, the cart page generates a pre-filled WhatsApp message containing:
- Every item + quantity
- Applied coupons and savings
- Final payable amount

One tap opens WhatsApp with the message ready to send.

---

## Architecture (Simple View)

```
Browser
  │
  ├── index.html (shop)
  ├── pages/cart.html
  ├── pages/gallery.html
  │
  ├── localStorage / sessionStorage
  │     • cart
  │     • won coupons
  │     • signup details (session)
  │
  └── (optional) Supabase Edge Functions
        • register-lead
        • register-prize-win
        • list-my-rewards
```

No server-side rendering, no database required for the core shopping experience.

---

## Deployment

This site is hosted on Netlify which you can visit through this link:
https://pastel-hoopes.netlify.app/

---

## Local Development

Just open `index.html` in a browser, or run any simple static server:

```bash
npx serve .
# or
python3 -m http.server 3000
```

No install, no build, no environment variables needed for the basic shop.

---

## Business Notes

- All product photography uses a consistent soft pastel background so the site feels cohesive.
- Hampers are positioned as fixed-price value bundles (₹99) and are deliberately excluded from discounts.
- Orders flow to WhatsApp so the team can confirm stock, address, and payment personally — perfect for a small business.

---

## Credits

- Shruti Sharma - Developer, Coder, Deployer.
- Sankeerth Reddy - Ideation, Design, Brainstorming and Planning.

---

*Last updated: 2026*
