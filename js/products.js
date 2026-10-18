// Shop page logic: products, filters, add to cart with qty stepper.
// Real product images with multi-image hover carousel.
const PRODUCTS = [
  {
    id: 1,
    name: "Glass-like transparent Premium Big Claw Clip",
    category: "Claw Clips",
    price: 25,
    tag: "",
    color: "#E8B4BF",
    images: [
      "public/images/products/claw-clips/big/01_clear.png",
      "public/images/products/claw-clips/big/02_dark.png",
      "public/images/products/claw-clips/big/03_peach.png",
      "public/images/products/claw-clips/big/04_blue.png",
      "public/images/products/claw-clips/big/05_amber.png"
    ]
  },
  {
    id: 2,
    name: "Glass-like transparent Premium Medium-size Claw clip",
    category: "Claw Clips",
    price: 20,
    tag: "",
    color: "#F4C6CF",
    images: [
      "public/images/products/claw-clips/medium/05_peach.png",
      "public/images/products/claw-clips/medium/02_pink.png",
      "public/images/products/claw-clips/medium/01_green.png",
      "public/images/products/claw-clips/medium/04_yellow.png",
      "public/images/products/claw-clips/medium/03_gray.png"
    ]
  },
  {
    id: 3,
    name: "Cute, adorable mini claw clips, Pack of 5",
    category: "Claw Clips",
    price: 15,
    tag: "Pack of 5",
    color: "#F9E4E6",
    images: [
      "public/images/products/mini-clips/01_blue_stars_pack.png",
      "public/images/products/mini-clips/02_star_showcase.png"
    ]
  },
  {
    id: 4,
    name: "Elegant Hair clip, Shiny dusty yellow color — pair of 2 clips",
    category: "Hair Clips",
    price: 20,
    tag: "Pair of 2",
    color: "#E8D4A8",
    images: [
      "public/images/products/hair-clips/01_yellow_pearl.png"
    ]
  },
  {
    id: 5,
    name: "Premium and stylish Black-silver color big hair clips, Pair of 2",
    category: "Hair Clips",
    price: 30,
    tag: "Pair of 2",
    color: "#5A5A5A",
    images: [
      "public/images/products/jewelry/03_black_flower_clear.png",
      "public/images/products/jewelry/02_black_flower_iridescent.png",
      "public/images/products/jewelry/01_dark_gem_drops.png",
      "public/images/products/jewelry/05_dark_gem_multi.png",
      "public/images/products/jewelry/04_heart_gee_im_full.png"
    ]
  },
  {
    id: 6,
    name: "Standard Quality premium Hair Scrunchy, pair of 2",
    category: "Scrunchies",
    price: 25,
    tag: "Pair of 2",
    color: "#F4C6CF",
    images: [
      "public/images/products/scrunchies/scrunchie-5-pink.png",
      "public/images/products/scrunchies/scrunchie-3-cream.png",
      "public/images/products/scrunchies/scrunchie-1-champagne.png",
      "public/images/products/scrunchies/scrunchie-6-sky-blue.png",
      "public/images/products/scrunchies/scrunchie-4-royal-blue.png",
      "public/images/products/scrunchies/scrunchie-2-black.png"
    ]
  },
  {
    id: 7,
    name: "Multiverse Special Hamper — Pair of 6 accessories (Big claw clip, 2 medium claw clips, 2 Scrunchies & Yellow Hair clip)",
    category: "Hampers",
    price: 99,
    tag: "Hamper",
    color: "#8C3A4F",
    images: [
      "public/images/products/hampers/multiverse_1.png",
      "public/images/products/hampers/multiverse_2.png"
    ]
  },
  {
    id: 8,
    name: "Rainbow Claw clip Arena Hamper — Pair of 6 Claw clips (3 Big, 2 Medium, 1 Mini)",
    category: "Hampers",
    price: 99,
    tag: "Hamper",
    color: "#E8B4BF",
    images: [
      "public/images/products/hampers/rainbow_1.png",
      "public/images/products/hampers/rainbow_2.png"
    ]
  },
  {
    id: 9,
    name: "Hair clips voyagers Hamper — Pair of 4 Hair clips (2 Big Black-Silver, 2 Yellow)",
    category: "Hampers",
    price: 99,
    tag: "Hamper",
    color: "#6B1F33",
    images: [
      "public/images/products/hampers/voyagers_1.png",
      "public/images/products/hampers/voyagers_2.png"
    ]
  }
];

// Ensure every product has a primary image (first in array)
PRODUCTS.forEach(p => {
  p.image = p.images && p.images.length ? p.images[0] : "";
});

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

function buildCardImage(p) {
  const imgs = p.images && p.images.length ? p.images : [p.image];
  const slides = imgs.map((src, i) =>
    `<img class="slide${i === 0 ? " active" : ""}" src="${src}" alt="${p.name}" loading="${i === 0 ? "eager" : "lazy"}" data-index="${i}">`
  ).join("");

  const arrows = imgs.length > 1 ? `
    <button type="button" class="img-arrow img-prev" aria-label="Previous image">‹</button>
    <button type="button" class="img-arrow img-next" aria-label="Next image">›</button>
  ` : "";

  const dots = imgs.length > 1 ? `
    <div class="img-dots">
      ${imgs.map((_, i) => `<span class="dot${i === 0 ? " active" : ""}" data-index="${i}"></span>`).join("")}
    </div>
  ` : "";

  return `
    <div class="card-img" data-count="${imgs.length}">
      <div class="slides-wrap">${slides}</div>
      ${arrows}
      ${dots}
      ${p.tag ? `<span class="tag">${p.tag}</span>` : ""}
    </div>`;
}

function renderProducts() {
  const list = PRODUCTS.filter(p => activeCategory === "all" || p.category === activeCategory);
  countEl.textContent = list.length + (list.length === 1 ? " item" : " items");
  grid.innerHTML = list.map(p => `
    <article class="card" data-product-id="${p.id}">
      ${buildCardImage(p)}
      <div class="card-body">
        <span class="card-cat">${p.category}</span>
        <h3 class="card-name">${p.name}</h3>
        <div class="card-foot">
          <span class="price">₹${p.price}</span>
          ${cardControls(p)}
        </div>
      </div>
    </article>`).join("");

  initImageCarousels();
}

function initImageCarousels() {
  document.querySelectorAll(".card-img").forEach(container => {
    const slides = Array.from(container.querySelectorAll(".slide"));
    const dots = Array.from(container.querySelectorAll(".dot"));
    if (slides.length <= 1) return;

    let index = 0;
    let direction = 1; // 1 = left-to-right (next), -1 = reverse
    let hoverTimer = null;

    function show(i, animateDir = 1) {
      const prev = index;
      index = (i + slides.length) % slides.length;

      slides.forEach((s, n) => {
        s.classList.remove("active", "from-left", "from-right", "to-left", "to-right");
        if (n === index) {
          s.classList.add("active");
          s.classList.add(animateDir > 0 ? "from-right" : "from-left");
        } else if (n === prev) {
          s.classList.add(animateDir > 0 ? "to-left" : "to-right");
        }
      });
      dots.forEach((d, n) => d.classList.toggle("active", n === index));
    }

    function next() {
      if (index === slides.length - 1) direction = -1;
      else if (index === 0) direction = 1;
      show(index + direction, direction);
    }

    function prev() {
      if (index === 0) direction = 1;
      else if (index === slides.length - 1) direction = -1;
      show(index - direction, -direction);
    }

    // Desktop hover: auto-cycle
    container.addEventListener("mouseenter", () => {
      hoverTimer = setInterval(next, 1200);
    });
    container.addEventListener("mouseleave", () => {
      clearInterval(hoverTimer);
      hoverTimer = null;
      // reset to first image
      show(0, -1);
      direction = 1;
    });

    // Arrows (mobile / tablet / always available)
    const prevBtn = container.querySelector(".img-prev");
    const nextBtn = container.querySelector(".img-next");
    if (prevBtn) prevBtn.addEventListener("click", e => { e.stopPropagation(); prev(); });
    if (nextBtn) nextBtn.addEventListener("click", e => { e.stopPropagation(); next(); });

    // Dots
    dots.forEach(d => {
      d.addEventListener("click", e => {
        e.stopPropagation();
        const target = Number(d.dataset.index);
        const dir = target > index ? 1 : -1;
        show(target, dir);
      });
    });
  });
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
