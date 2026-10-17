// Simple cart saved in the browser (localStorage). Supabase orders come later.
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
    if (qty <= 0) {
      items = items.filter(i => i.id !== id);
    } else {
      const found = items.find(i => i.id === id);
      if (found) found.qty = qty;
    }
    this.save(items);
  },
  count() { return this.get().reduce((sum, i) => sum + i.qty, 0); },
  updateBadge() {
    const el = document.getElementById("cart-count");
    if (el) el.textContent = this.count();
  }
};
document.addEventListener("DOMContentLoaded", () => Cart.updateBadge());
