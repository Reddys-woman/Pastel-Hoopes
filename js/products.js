// Shop page logic: sample products, filters, add to cart.
// TO REPLACE LATER: swap `image` with a real path like "../public/images/my-clip.jpg".
const PRODUCTS = [
  { id: 1,  name: "Blush Petal Claw Clip",   category: "Claw Clips", price: 349, tag: "Bestseller", color: "#F4C6CF" },
  { id: 2,  name: "Cream Pearl Claw Clip",   category: "Claw Clips", price: 399, tag: "",           color: "#F3E6D8" },
  { id: 3,  name: "Burgundy Matte Claw Clip",category: "Claw Clips", price: 379, tag: "New",        color: "#9B4A5E" },
  { id: 4,  name: "Rose Mini Claw Clip",     category: "Claw Clips", price: 249, tag: "",           color: "#EBA9B6" },
  { id: 5,  name: "Pearl Snap Clip Set",     category: "Hair Clips", price: 299, tag: "Set of 4",   color: "#F9E4E6" },
  { id: 6,  name: "Satin Barrette",          category: "Hair Clips", price: 279, tag: "",           color: "#E8B4BF" },
  { id: 7,  name: "Heart Bobby Pin Set",     category: "Hair Clips", price: 199, tag: "New",        color: "#F4C6CF" },
  { id: 8,  name: "Ballet Satin Bow",        category: "Bows",       price: 329, tag: "Bestseller", color: "#F4C6CF" },
  { id: 9,  name: "Velvet Burgundy Bow",     category: "Bows",       price: 359, tag: "",           color: "#8C3A4F" },
  { id: 10, name: "Cream Ribbon Bow",        category: "Bows",       price: 299, tag: "",           color: "#F3E6D8" },
  { id: 11, name: "Silk Blush Scrunchie",    category: "Scrunchies", price: 249, tag: "",           color: "#F4C6CF" },
  { id: 12, name: "Velvet Wine Scrunchie",   category: "Scrunchies", price: 229, tag: "New",        color: "#7A2A40" },
  { id: 13, name: "Mini Bow Hamper",         category: "Hampers",    price: 349, tag: "Gift idea",  color: "#F4C6CF" },
  { id: 14, name: "Claw Clip Duo Hamper",    category: "Hampers",    price: 599, tag: "Bestseller", color: "#E8B4BF" },
  { id: 15, name: "Everything Pretty Hamper",category: "Hampers",    price: 899, tag: "",           color: "#8C3A4F" }
];

// Draws a soft placeholder picture so you don't need image files yet.
function placeholderImage(category, color) {
  const shapes = {
    "Claw Clips": `<path d="M60 150 Q150 60 240 150" fill="none" stroke="${color}" stroke-width="30" stroke-linecap="round"/><g stroke="${color}" stroke-width="10" stroke-linecap="round"><path d="M80 160v30M110 140v50M140 132v58M170 132v58M200 140v50M220 160v30"/></g>`,
    "Hair Clips": `<rect x="60" y="125" width="180" height="50" rx="25" fill="${color}"/><rect x="75" y="138" width="150" height="10" rx="5" fill="#fff" opacity=".45"/>`,
    "Bows": `<path d="M150 150 L70 100 Q50 150 70 200 Z" fill="${color}"/><path d="M150 150 L230 100 Q250 150 230 200 Z" fill="${color}"/><rect x="132" y="130" width="36" height="40" rx="12" fill="${color}" stroke="#fff" stroke-opacity=".5" stroke-width="4"/>`,
    "Hampers": `<rect x="70" y="130" width="160" height="110" rx="14" fill="${color}"/><rect x="60" y="105" width="180" height="40" rx="12" fill="${color}" stroke="#fff" stroke-opacity=".5" stroke-width="4"/><rect x="138" y="105" width="24" height="135" fill="#FFF8F2" opacity=".8"/><path d="M150 105 Q110 60 100 95 Q120 110 150 105 Q180 110 200 95 Q190 60 150 105" fill="#FFF8F2" opacity=".9"/>`,
    "Scrunchies": `<circle cx="150" cy="150" r="62" fill="none" stroke="${color}" stroke-width="36" stroke-dasharray="22 8" stroke-linecap="round"/>`
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><defs><radialGradient id="g" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#FFF8F2"/><stop offset="1" stop-color="#F9E4E6"/></radialGradient></defs><rect width="300" height="300" fill="url(#g)"/>${shapes[category]}</svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
PRODUCTS.forEach(p => { p.image = placeholderImage(p.category, p.color); });

const grid = document.getElementById("product-grid");
const countEl = document.getElementById("result-count");
let activeCategory = "all";

function renderProducts() {
  const list = PRODUCTS.filter(p => activeCategory === "all" || p.category === activeCategory);
  countEl.textContent = list.length + (list.length === 1 ? " item" : " items");
  grid.innerHTML = list.map(p => `
    <article class="card">
      <div class="card-img">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        ${p.tag ? `<span class="tag">${p.tag}</span>` : ""}
      </div>
      <div class="card-body">
        <span class="card-cat">${p.category}</span>
        <h3 class="card-name">${p.name}</h3>
        <div class="card-foot">
          <span class="price">₹${p.price}</span>
          <button class="add-btn" data-id="${p.id}">Add to cart</button>
        </div>
      </div>
    </article>`).join("");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2000);
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

// Add to cart
grid.addEventListener("click", e => {
  const btn = e.target.closest(".add-btn");
  if (!btn) return;
  const product = PRODUCTS.find(p => p.id === Number(btn.dataset.id));
  Cart.add(product);
  showToast(product.name + " added to cart");
  btn.textContent = "Added ✓";
  btn.classList.add("added");
  setTimeout(() => { btn.textContent = "Add to cart"; btn.classList.remove("added"); }, 1500);
});

// Mobile menu
const menu = document.getElementById("menu");
const toggle = document.getElementById("menu-toggle");
toggle.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
menu.addEventListener("click", e => { if (e.target.tagName === "A") menu.classList.remove("open"); });

document.getElementById("year").textContent = new Date().getFullYear();
renderProducts();
