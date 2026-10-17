// Shop page logic: products, filters, add to cart with qty stepper.
// TO REPLACE LATER: swap `image` with a real path like "../public/images/my-clip.jpg".
const PRODUCTS = [
  { id: 1, name: "Glass-like transparent Premium Big Claw Clip", category: "Claw Clips", price: 25, tag: "", color: "#E8B4BF" },
  { id: 2, name: "Glass-like transparent Premium Medium-size Claw clip", category: "Claw Clips", price: 20, tag: "", color: "#F4C6CF" },
  { id: 3, name: "Cute, adorable mini claw clips, Pack of 5", category: "Claw Clips", price: 15, tag: "Pack of 5", color: "#F9E4E6" },
  { id: 4, name: "Elegant Hair clip, Shiny dusty yellow color — pair of 2 clips", category: "Hair Clips", price: 20, tag: "Pair of 2", color: "#E8D4A8" },
  { id: 5, name: "Premium and stylish Black-silver color big hair clips, Pair of 2", category: "Hair Clips", price: 30, tag: "Pair of 2", color: "#5A5A5A" },
  { id: 6, name: "Standard Quality premium Hair Scrunchy, pair of 2", category: "Scrunchies", price: 25, tag: "Pair of 2", color: "#F4C6CF" },
  { id: 7, name: "Multiverse Special Hamper — Pair of 6 accessories (Big claw clip, 2 medium claw clips, 2 Scrunchies & Yellow Hair clip)", category: "Hampers", price: 99, tag: "Hamper", color: "#8C3A4F" },
  { id: 8, name: "Rainbow Claw clip Arena Hamper — Pair of 6 Claw clips (3 Big, 2 Medium, 1 Mini)", category: "Hampers", price: 99, tag: "Hamper", color: "#E8B4BF" },
  { id: 9, name: "Hair clips voyagers Hamper — Pair of 4 Hair clips (2 Big Black-Silver, 2 Yellow)", category: "Hampers", price: 99, tag: "Hamper", color: "#6B1F33" }
];

function placeholderImage(category, color) {
  const shapes = {
    "Claw Clips": `<path d="M60 150 Q150 60 240 150" fill="none" stroke="${color}" stroke-width="30" stroke-linecap="round"/><g stroke="${color}" stroke-width="10" stroke-linecap="round"><path d="M80 160v30M110 140v50M140 132v58M170 132v58M200 140v50M220 160v30"/></g>`,
    "Hair Clips": `<rect x="60" y="125" width="180" height="50" rx="25" fill="${color}"/><rect x="75" y="138" width="150" height="10" rx="5" fill="#fff" opacity=".45"/>`,
    "Bows": `<path d="M150 150 L70 100 Q50 150 70 200 Z" fill="${color}"/><path d="M150 150 L230 100 Q250 150 230 200 Z" fill="${color}"/><rect x="132" y="130" width="36" height="40" rx="12" fill="${color}" stroke="#fff" stroke-opacity=".5" stroke-width="4"/>`,
    "Hampers": `<rect x="70" y="130" width="160" height="110" rx="14" fill="${color}"/><rect x="60" y="105" width="180" height="40" rx="12" fill="${color}" stroke="#fff" stroke-opacity=".5" stroke-width="4"/><rect x="138" y="105" width="24" height="135" fill="#FFF8F2" opacity=".8"/><path d="M150 105 Q110 60 100 95 Q120 110 150 105 Q180 110 200 95 Q190 60 150 105" fill="#FFF8F2" opacity=".9"/>`,
    "Scrunchies": `<circle cx="150" cy="150" r="62" fill="none" stroke="${color}" stroke-width="36" stroke-dasharray="22 8" stroke-linecap="round"/>`
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><defs><radialGradient id="g" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#FFF8F2"/><stop offset="1" stop-color="#F9E4E6"/></radialGradient></defs><rect width="300" height="300" fill="url(#g)"/>${shapes[category] || shapes["Claw Clips"]}</svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
PRODUCTS.forEach(p => { p.image = placeholderImage(p.category, p.color); });

const grid = document.getElementById("product-grid");
const countEl = document.getElementById("result-count");
let activeCategory = "all";

function qtyInCart(id) {
  const item = Cart.get().find(i => i.id === id);
  return item ? item.qty : 0;
}

function cardControls(p) {
  const qty = qtyInCart(p.id);
  if (qty > 0) {
    return `
      <div class="qty-stepper" data-id="${p.id}">
        <button type="button" class="qty-btn qty-minus" aria-label="Decrease quantity">−</button>
        <span class="qty-val">${qty}</span>
        <button type="button" class="qty-btn qty-plus" aria-label="Increase quantity">+</button>
      </div>`;
  }
  return `<button class="add-btn" data-id="${p.id}">Add to cart</button>`;
}

function renderProducts() {
  const list = PRODUCTS.filter(p => activeCategory === "all" || p.category === activeCategory);
  countEl.textContent = list.length + (list.length === 1 ? " item" : " items");
  grid.innerHTML = list.map(p => `
    <article class="card" data-product-id="${p.id}">
      <div class="card-img">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        ${p.tag ? `<span class="tag">${p.tag}</span>` : ""}
      </div>
      <div class="card-body">
        <span class="card-cat">${p.category}</span>
        <h3 class="card-name">${p.name}</h3>
        <div class="card-foot">
          <span class="price">₹${p.price}</span>
          ${cardControls(p)}
        </div>
      </div>
    </article>`).join("");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2000);
}

function refreshCard(id) {
  const card = grid.querySelector(`[data-product-id="${id}"]`);
  if (!card) return;
  const product = PRODUCTS.find(p => p.id === id);
  const foot = card.querySelector(".card-foot");
  if (foot && product) {
    foot.innerHTML = `<span class="price">₹${product.price}</span>${cardControls(product)}`;
  }
}

// Category filters
document.getElementById("filters").addEventListener("click", e => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
  chip.classList.add("active");
  activeCategory = chip.dataset.category;
  renderProducts();
});

// Add / qty controls
grid.addEventListener("click", e => {
  const addBtn = e.target.closest(".add-btn");
  if (addBtn) {
    const product = PRODUCTS.find(p => p.id === Number(addBtn.dataset.id));
    if (!product) return;
    Cart.add(product);
    showToast(product.name + " added to cart");
    refreshCard(product.id);
    return;
  }
  const minus = e.target.closest(".qty-minus");
  const plus = e.target.closest(".qty-plus");
  if (!minus && !plus) return;
  const stepper = e.target.closest(".qty-stepper");
  if (!stepper) return;
  const id = Number(stepper.dataset.id);
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  if (plus) {
    Cart.add(product);
    showToast(product.name + " — quantity updated");
  } else if (minus) {
    Cart.setQty(id, qtyInCart(id) - 1);
    showToast(product.name + " — quantity updated");
  }
  refreshCard(id);
});

// Mobile menu
const menu = document.getElementById("menu");
const toggle = document.getElementById("menu-toggle");
if (toggle && menu) {
  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  menu.addEventListener("click", e => { if (e.target.tagName === "A") menu.classList.remove("open"); });
}

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
renderProducts();
