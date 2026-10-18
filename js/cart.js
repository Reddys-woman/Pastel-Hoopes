// Cart + rewards + WhatsApp checkout.
// Rewards come from what Spin / Scratch already saved in this browser (localStorage).
// Supabase still stores wins for your dashboard log — cart does not need a new API for that.
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
    else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category || "",
        qty: 1
      });
    }
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

const PCT_CODES = {
  HOOPES10: 10, HOOPES15: 15, HOOPES20: 20, HOOPES25: 25,
  SCRATCH10: 10, SCRATCH15: 15, SCRATCH20: 20, SCRATCH25: 25
};
const CLAW_CODES = new Set(["CLAW15", "CLAW15B", "SCRATCHCLAW15", "SCRATCHCLAW15B"]);
const INVALID_CODES = new Set(["HOOPES90", "FREEPICK"]);
const APPLIED_KEY = "pastelHoopesAppliedRewards";

function getCustomer() {
  try {
    const raw = sessionStorage.getItem("pastelHoopesCustomer");
    if (!raw) return null;
    const c = JSON.parse(raw);
    if (!c || !c.whatsapp) return null;
    return { name: c.name || "", whatsapp: c.whatsapp };
  } catch {
    return null;
  }
}

/** Read coupons this browser already won (Spin + Scratch localStorage). */
function loadLocalRewards() {
  const list = [];
  const keys = [
    { key: "pastelHoopesSpin", source: "spin" },
    { key: "pastelHoopesScratch", source: "scratch" }
  ];
  keys.forEach(({ key, source }) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data || !data.code) return;
      const code = String(data.code).toUpperCase();
      if (INVALID_CODES.has(code)) return;

      if (PCT_CODES[code] != null) {
        list.push({
          id: source + "-pct-" + code,
          code,
          label: PCT_CODES[code] + "% off your order",
          source,
          type: "percent",
          pct: PCT_CODES[code]
        });
      } else if (CLAW_CODES.has(code)) {
        list.push({
          id: source + "-claw-" + code,
          code,
          label: "Claw clip for ₹15",
          source,
          type: "claw"
        });
      }
    } catch (_) {}
  });
  return list;
}

function isEligibleClawItem(item) {
  const cat = (item.category || "").toLowerCase();
  const name = (item.name || "").toLowerCase();
  const isClaw =
    cat === "claw clips" ||
    (name.includes("claw") && !name.includes("hamper"));
  return isClaw && Number(item.price) > 15;
}

function findClawTarget(items) {
  let best = null;
  for (const item of items) {
    if (!isEligibleClawItem(item) || item.qty < 1) continue;
    if (!best || item.price > best.price) best = item;
  }
  return best;
}

function calculateTotals(items, appliedPct, appliedClaw) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  let clawDiscount = 0;
  let clawTargetName = null;
  let clawOriginal = 0;

  if (appliedClaw) {
    const target = findClawTarget(items);
    if (target) {
      clawOriginal = target.price;
      clawDiscount = target.price - 15;
      clawTargetName = target.name;
    }
  }

  const otherSubtotal = Math.max(
    0,
    subtotal - (appliedClaw && clawDiscount > 0 ? clawOriginal : 0)
  );
  let pctDiscount = 0;
  if (appliedPct && appliedPct.pct > 0) {
    pctDiscount = Math.round(otherSubtotal * appliedPct.pct / 100);
  }

  const payable = Math.max(
    0,
    otherSubtotal - pctDiscount + (appliedClaw && clawDiscount > 0 ? 15 : 0)
  );

  return {
    subtotal,
    clawDiscount,
    clawTargetName,
    clawOriginal,
    pctDiscount,
    pctCode: appliedPct ? appliedPct.code : null,
    pctValue: appliedPct ? appliedPct.pct : 0,
    clawCode: appliedClaw && clawDiscount > 0 ? appliedClaw.code : null,
    total: payable,
    clawApplied: !!(appliedClaw && clawDiscount > 0)
  };
}

function loadAppliedIds() {
  try {
    return JSON.parse(sessionStorage.getItem(APPLIED_KEY) || "{}") || {};
  } catch {
    return {};
  }
}
function saveAppliedIds(obj) {
  sessionStorage.setItem(APPLIED_KEY, JSON.stringify(obj));
}

document.addEventListener("DOMContentLoaded", () => Cart.updateBadge());

(function () {
  const root = document.getElementById("cart-root");
  if (!root) return;

  const WA_NUMBER = "919211805755";
  let rewards = loadLocalRewards();
  let applied = loadAppliedIds();

  function money(n) { return "₹" + n; }

  function getAppliedPct() {
    if (!applied.pctId) return null;
    return rewards.find(r => r.type === "percent" && r.id === applied.pctId) || null;
  }
  function getAppliedClaw() {
    if (!applied.clawId) return null;
    return rewards.find(r => r.type === "claw" && r.id === applied.clawId) || null;
  }

  function renderRewardsPanel() {
    const panel = document.getElementById("rewards-panel");
    if (!panel) return;

    rewards = loadLocalRewards();

    // Drop applied ids that no longer exist
    if (applied.pctId && !rewards.some(r => r.id === applied.pctId)) applied.pctId = null;
    if (applied.clawId && !rewards.some(r => r.id === applied.clawId)) applied.clawId = null;
    saveAppliedIds(applied);

    if (!rewards.length) {
      panel.innerHTML = `
        <div class="rewards-box">
          <h3>Your rewards</h3>
          <p class="muted small">No coupon in this browser yet. Sign up, then play <strong>Spin &amp; Win</strong> or <strong>Scratch &amp; Win</strong>. When you win, your coupon will show up here.</p>
        </div>`;
      return;
    }

    const pctList = rewards.filter(r => r.type === "percent");
    const clawList = rewards.filter(r => r.type === "claw");
    const items = Cart.get();
    const hasClawItem = !!findClawTarget(items);

    let html = `<div class="rewards-box"><h3>Your rewards</h3>
      <p class="muted small rewards-hint">Pick one % coupon. You can also add Claw clip @ ₹15 if you have that offer and a claw clip in the cart.</p>`;

    if (pctList.length) {
      html += `<div class="reward-group"><p class="reward-group-title">Percentage off</p>`;
      pctList.forEach(r => {
        const on = applied.pctId === r.id;
        html += `
          <label class="reward-option ${on ? "is-on" : ""}">
            <input type="radio" name="reward-pct" value="${r.id}" ${on ? "checked" : ""}>
            <span>
              <strong>${r.code}</strong> — ${r.pct}% off
              <small>From ${r.source}</small>
            </span>
          </label>`;
      });
      html += `<button type="button" class="link-btn" id="clear-pct" ${applied.pctId ? "" : "hidden"}>Remove % coupon</button></div>`;
    }

    if (clawList.length) {
      html += `<div class="reward-group"><p class="reward-group-title">Claw clip @ ₹15</p>`;
      if (!hasClawItem) {
        html += `<p class="muted small">Add a claw clip (price above ₹15) to use this.</p>`;
      }
      clawList.forEach(r => {
        const on = applied.clawId === r.id;
        html += `
          <label class="reward-option ${on ? "is-on" : ""} ${!hasClawItem ? "is-disabled" : ""}">
            <input type="radio" name="reward-claw" value="${r.id}" ${on ? "checked" : ""} ${!hasClawItem ? "disabled" : ""}>
            <span>
              <strong>${r.code}</strong> — Claw clip @ ₹15
              <small>From ${r.source}</small>
            </span>
          </label>`;
      });
      html += `<button type="button" class="link-btn" id="clear-claw" ${applied.clawId ? "" : "hidden"}>Remove claw offer</button></div>`;
    }

    html += `</div>`;
    panel.innerHTML = html;
  }

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
    const totals = calculateTotals(items, getAppliedPct(), getAppliedClaw());

    list.innerHTML = items.map(i => {
      let unitNote = `₹${i.price} each`;
      let lineTotal = i.price * i.qty;
      let specialBadge = "";
      if (totals.clawApplied && totals.clawTargetName === i.name) {
        const rest = i.qty - 1;
        lineTotal = 15 + rest * i.price;
        unitNote = rest > 0
          ? `1 × ₹15 (offer) + ${rest} × ₹${i.price}`
          : `₹15 with claw offer (was ₹${i.price})`;
        specialBadge = `<span class="tag-offer">Claw offer</span>`;
      }
      return `
      <article class="cart-item" data-id="${i.id}">
        <div class="cart-item-img"><img src="${i.image || ""}" alt=""></div>
        <div class="cart-item-info">
          <h3 class="cart-item-name">${i.name} ${specialBadge}</h3>
          <p class="cart-item-unit">${unitNote}</p>
          <div class="cart-item-row">
            <div class="qty-stepper" data-id="${i.id}">
              <button type="button" class="qty-btn qty-minus" aria-label="Decrease">−</button>
              <span class="qty-val">${i.qty}</span>
              <button type="button" class="qty-btn qty-plus" aria-label="Increase">+</button>
            </div>
            <span class="cart-item-line">₹${lineTotal}</span>
            <button type="button" class="cart-remove" data-id="${i.id}" aria-label="Remove">Remove</button>
          </div>
        </div>
      </article>`;
    }).join("");

    document.getElementById("cart-subtotal").textContent = money(totals.subtotal);

    const clawRow = document.getElementById("cart-claw-row");
    const pctRow = document.getElementById("cart-coupon-row");
    const discountRow = document.getElementById("cart-discount-row");

    if (totals.clawApplied) {
      clawRow.hidden = false;
      document.getElementById("cart-claw-code").textContent =
        totals.clawCode + " — one claw clip @ ₹15 (was ₹" + totals.clawOriginal + ")";
      document.getElementById("cart-claw-amount").textContent = "−" + money(totals.clawDiscount);
    } else {
      clawRow.hidden = true;
    }

    if (totals.pctDiscount > 0 && totals.pctCode) {
      pctRow.hidden = false;
      discountRow.hidden = false;
      document.getElementById("cart-coupon-code").textContent =
        totals.pctCode + " (" + totals.pctValue + "% OFF on other items)";
      document.getElementById("cart-discount").textContent = "−" + money(totals.pctDiscount);
    } else {
      pctRow.hidden = true;
      discountRow.hidden = true;
    }

    document.getElementById("cart-total").textContent = money(totals.total);
    Cart.updateBadge();
    renderRewardsPanel();
  }

  function fulfillment() {
    const checked = document.querySelector('input[name="fulfillment"]:checked');
    return checked ? checked.value : "pickup";
  }

  function buildWhatsAppMessage() {
    const items = Cart.get();
    const customer = getCustomer();
    const totals = calculateTotals(items, getAppliedPct(), getAppliedClaw());
    const lines = [];

    if (customer) {
      lines.push("Order from: " + (customer.name || "Customer") + " (" + customer.whatsapp + ")");
      lines.push("");
    }

    items.forEach(i => {
      if (totals.clawApplied && totals.clawTargetName === i.name) {
        if (i.qty === 1) {
          lines.push(`${i.name} — 15 inr (claw offer, was ${i.price} inr)`);
        } else {
          lines.push(`${i.name} × 1 — 15 inr (claw offer, was ${i.price} inr)`);
          lines.push(`${i.name} × ${i.qty - 1} — ${(i.qty - 1) * i.price} inr`);
        }
      } else {
        const lineTotal = i.price * i.qty;
        if (i.qty > 1) lines.push(`${i.name} × ${i.qty} — ${lineTotal} inr`);
        else lines.push(`${i.name} — ${i.price} inr`);
      }
    });

    lines.push("");
    lines.push(`Subtotal = ${totals.subtotal} inr`);
    if (totals.clawApplied) {
      lines.push(`Coupon ${totals.clawCode} — Claw clip @ 15 inr (save ${totals.clawDiscount} inr)`);
    }
    if (totals.pctDiscount > 0 && totals.pctCode) {
      lines.push(`Coupon ${totals.pctCode} — ${totals.pctValue}% off other products (save ${totals.pctDiscount} inr)`);
    }
    lines.push(`Total to pay = ${totals.total} inr`);
    lines.push("");
    if (fulfillment() === "delivery") lines.push("Home delivery please");
    else lines.push("I will pick-up on myself");

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
      return;
    }
    if (e.target.id === "clear-pct") {
      applied.pctId = null;
      saveAppliedIds(applied);
      render();
      return;
    }
    if (e.target.id === "clear-claw") {
      applied.clawId = null;
      saveAppliedIds(applied);
      render();
    }
  });

  root.addEventListener("change", e => {
    if (e.target.name === "reward-pct") {
      applied.pctId = e.target.value;
      saveAppliedIds(applied);
      render();
    }
    if (e.target.name === "reward-claw") {
      applied.clawId = e.target.value;
      saveAppliedIds(applied);
      render();
    }
  });

  const orderBtn = document.getElementById("order-whatsapp");
  if (orderBtn) {
    orderBtn.addEventListener("click", () => {
      if (!Cart.get().length) return;
      const msg = buildWhatsAppMessage();
      window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
    });
  }

  render();
})();
