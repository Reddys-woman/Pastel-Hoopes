// Cart + WhatsApp checkout. Shared on shop and cart pages.
const Cart = {
  KEY: "pastelHoopesCart",
  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch { return []; }
  },
  save(items) { localStorage.setItem(this.KEY, JSON.stringify(items)); this.updateBadge(); },
  add(product) {
    const items = this.get();
    const found = items.find(i => i.id === product.id);
    if (found) found.qty += 1;
    else items.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty: 1 });
    this.save(items);
  },
  setQty(id, qty) {
    let items = this.get();
    if (qty <= 0) items = items.filter(i => i.id !== id);
    else {
      const found = items.find(i => i.id === id);
      if (found) found.qty = qty;
    }
    this.save(items);
  },
  remove(id) {
    this.save(this.get().filter(i => i.id !== id));
  },
  clear() { this.save([]); },
  count() { return this.get().reduce((sum, i) => sum + i.qty, 0); },
  subtotal() { return this.get().reduce((sum, i) => sum + i.price * i.qty, 0); },
  updateBadge() {
    const el = document.getElementById("cart-count");
    if (el) el.textContent = this.count();
  }
};

// Coupon helpers — reads spin / scratch prize from localStorage
const COUPON_MAP = {
  HOOPES10: 10, HOOPES15: 15, HOOPES20: 20, HOOPES25: 25,
  SCRATCH10: 10, SCRATCH15: 15, SCRATCH20: 20, SCRATCH25: 25
};

function getActiveCoupon() {
  // Prefer the better % discount if both exist
  const sources = ["pastelHoopesSpin", "pastelHoopesScratch"];
  let best = null;
  for (const key of sources) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const data = JSON.parse(raw);
      if (!data || !data.code) continue;
      const pct = COUPON_MAP[data.code];
      if (pct && (!best || pct > best.pct)) {
        best = { code: data.code, pct, label: pct + "% OFF" };
      }
    } catch (_) {}
  }
  return best;
}

document.addEventListener("DOMContentLoaded", () => Cart.updateBadge());

/* ========== Cart page UI (only runs when #cart-root exists) ========== */
(function () {
  const root = document.getElementById("cart-root");
  if (!root) return;

  const WA_NUMBER = "919211805755"; // +91 92118 05755

  function money(n) { return "₹" + n; }

  function render() {
    const items = Cart.get();
    const empty = document.getElementById("cart-empty");
    const filled = document.getElementById("cart-filled");
    if (!items.length) {
      empty.hidden = false;
      filled.hidden = true;
      Cart.updateBadge();
      return;
    }
    empty.hidden = true;
    filled.hidden = false;

    const list = document.getElementById("cart-items");
    list.innerHTML = items.map(i => `
      <article class="cart-item" data-id="${i.id}">
        <div class="cart-item-img"><img src="${i.image || ""}" alt=""></div>
        <div class="cart-item-info">
          <h3 class="cart-item-name">${i.name}</h3>
          <p class="cart-item-unit">₹${i.price} each</p>
          <div class="cart-item-row">
            <div class="qty-stepper" data-id="${i.id}">
              <button type="button" class="qty-btn qty-minus" aria-label="Decrease">−</button>
              <span class="qty-val">${i.qty}</span>
              <button type="button" class="qty-btn qty-plus" aria-label="Increase">+</button>
            </div>
            <span class="cart-item-line">₹${i.price * i.qty}</span>
            <button type="button" class="cart-remove" data-id="${i.id}" aria-label="Remove">Remove</button>
          </div>
        </div>
      </article>
    `).join("");

    const sub = Cart.subtotal();
    const coupon = getActiveCoupon();
    let discount = 0;
    let total = sub;
    const couponRow = document.getElementById("cart-coupon-row");
    const discountRow = document.getElementById("cart-discount-row");

    if (coupon) {
      discount = Math.round(sub * coupon.pct / 100);
      total = sub - discount;
      couponRow.hidden = false;
      discountRow.hidden = false;
      document.getElementById("cart-coupon-code").textContent = coupon.code + " (" + coupon.label + ")";
      document.getElementById("cart-discount").textContent = "−" + money(discount);
    } else {
      couponRow.hidden = true;
      discountRow.hidden = true;
    }

    document.getElementById("cart-subtotal").textContent = money(sub);
    document.getElementById("cart-total").textContent = money(total);

    Cart.updateBadge();
  }

  function fulfillment() {
    const checked = document.querySelector('input[name="fulfillment"]:checked');
    return checked ? checked.value : "pickup";
  }

  function buildWhatsAppMessage() {
    const items = Cart.get();
    const coupon = getActiveCoupon();
    const sub = Cart.subtotal();
    let discount = 0;
    let total = sub;
    if (coupon) {
      discount = Math.round(sub * coupon.pct / 100);
      total = sub - discount;
    }

    const lines = items.map(i => {
      const lineTotal = i.price * i.qty;
      if (i.qty > 1) return `${i.name} × ${i.qty} — ${lineTotal} inr`;
      return `${i.name} — ${i.price} inr`;
    });

    lines.push("");
    if (coupon && discount > 0) {
      lines.push(`Subtotal = ${sub} inr`);
      lines.push(`Discount (${coupon.code} ${coupon.pct}% OFF) = −${discount} inr`);
      lines.push(`Total = ${total} inr`);
    } else {
      lines.push(`Total = ${total} inr`);
    }
    lines.push("");
    if (fulfillment() === "delivery") {
      lines.push("Home delivery please");
    } else {
      lines.push("I will pick-up on myself");
    }

    return lines.join("\n");
  }

  root.addEventListener("click", e => {
    const minus = e.target.closest(".qty-minus");
    const plus = e.target.closest(".qty-plus");
    const remove = e.target.closest(".cart-remove");
    if (minus || plus) {
      const stepper = e.target.closest(".qty-stepper");
      const id = Number(stepper.dataset.id);
      const item = Cart.get().find(i => i.id === id);
      if (!item) return;
      if (plus) Cart.setQty(id, item.qty + 1);
      else Cart.setQty(id, item.qty - 1);
      render();
      return;
    }
    if (remove) {
      Cart.remove(Number(remove.dataset.id));
      render();
    }
  });

  document.querySelectorAll('input[name="fulfillment"]').forEach(r => {
    r.addEventListener("change", () => {});
  });

  const orderBtn = document.getElementById("order-whatsapp");
  if (orderBtn) {
    orderBtn.addEventListener("click", () => {
      if (!Cart.get().length) return;
      const msg = buildWhatsAppMessage();
      const url = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);
      window.open(url, "_blank", "noopener");
    });
  }

  render();
})();
