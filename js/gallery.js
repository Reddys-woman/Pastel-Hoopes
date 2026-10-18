// Gallery page: builds the collage, handles the pop-up viewer (photos + videos).
// To add a photo or video: put the file in public/images/gallery/ (or public/videos/gallery/ + a poster .jpg
// with the same name in public/images/gallery/) and add one line to ITEMS below.
// d = desktop position [column, row, columns wide, rows tall] on a 12-column grid
// m = mobile size [columns wide (1-2), rows tall]
const IMG = "../public/images/gallery/";
const VID = "../public/videos/gallery/";
const ITEMS = [
  { type: "video", file: "memory-11", dur: "0:08", d: [1, 1, 4, 7], m: [1, 4], pos: "50% 40%", alt: "Video: a happy customer at our stall" },
  { type: "image", file: "photo-03", d: [5, 1, 4, 4], m: [1, 2], pos: "50% 60%", alt: "Our pink basket and clips under the festive street lights" },
  { type: "image", file: "photo-05", d: [5, 5, 4, 3], m: [1, 2], pos: "50% 50%", alt: "Our full table of clips, scrunchies and bows" },
  { type: "video", file: "memory-03", dur: "0:03", d: [9, 1, 4, 7], m: [1, 4], pos: "50% 45%", alt: "Video: customers browsing our stall" },
  { type: "video", file: "memory-12", dur: "0:13", d: [7, 8, 3, 6], m: [1, 4], pos: "50% 40%", alt: "Video: a customer showing her Pastel Hoopes prize slip" },
  { type: "image", file: "photo-01", d: [1, 8, 6, 6], m: [2, 4], pos: "50% 55%", alt: "A hand holding a green flower claw clip" },
  { type: "video", file: "memory-13", dur: "0:12", d: [10, 8, 3, 3], m: [1, 3], pos: "50% 35%", alt: "Video: scratching a prize at our stall" },
  { type: "video", file: "memory-04", dur: "0:09", d: [10, 11, 3, 3], m: [1, 3], pos: "50% 50%", alt: "Video: our pink basket full of prize slips" },
  { type: "image", file: "photo-02", d: [1, 14, 3, 4], m: [1, 3], pos: "50% 70%", alt: "Our stall glowing under the festival lights" },
  { type: "video", file: "memory-09", dur: "2:14", d: [4, 14, 4, 7], m: [1, 3], pos: "50% 40%", alt: "Video: two girls looking at our accessories" },
  { type: "video", file: "memory-08", dur: "0:07", d: [8, 14, 5, 4], m: [2, 3], pos: "50% 50%", alt: "Video: close-up of our table" },
  { type: "video", file: "memory-10", dur: "0:02", d: [1, 18, 3, 3], m: [1, 3], pos: "50% 55%", alt: "Video: a quick look at our table" },
  { type: "video", file: "memory-14", dur: "0:37", d: [8, 18, 5, 3], m: [1, 3], pos: "50% 60%", alt: "Video: our table of clips and scrunchies" },
  { type: "video", file: "memory-06", dur: "0:16", d: [1, 21, 4, 6], m: [1, 4], pos: "50% 40%", alt: "Video: packing a customer order" },
  { type: "image", file: "photo-04", d: [9, 21, 4, 6], m: [1, 4], pos: "50% 40%", alt: "Customers browsing at our stall" },
  { type: "video", file: "memory-01", dur: "0:16", d: [5, 21, 4, 3], m: [1, 3], pos: "50% 45%", alt: "Video: our full table from above" },
  { type: "video", file: "memory-05", dur: "0:05", d: [5, 24, 4, 3], m: [1, 3], pos: "50% 45%", alt: "Video: our table and cups" },
  { type: "video", file: "memory-02", dur: "0:36", d: [1, 27, 6, 3], m: [2, 3], pos: "50% 40%", alt: "Video: our table and pink basket" },
  { type: "video", file: "memory-07", dur: "0:13", d: [7, 27, 6, 3], m: [2, 3], pos: "50% 40%", alt: "Video: reaching into the prize basket" },
];

const grid = document.getElementById("gallery-grid");
const lb = document.getElementById("lightbox");
const stage = document.getElementById("lb-stage");
const counter = document.getElementById("lb-counter");
let current = 0, touchX = null;

// ----- build the collage -----
ITEMS.forEach((it, i) => {
  const tile = document.createElement("button");
  tile.className = "tile" + (it.type === "video" ? " is-video" : "");
  tile.type = "button";
  tile.setAttribute("aria-label", (it.type === "video" ? "Play " : "View ") + it.alt);
  tile.style.cssText = `--col:${it.d[0]};--row:${it.d[1]};--cs:${it.d[2]};--rs:${it.d[3]};--mcs:${it.m[0]};--mrs:${it.m[1]};--pos:${it.pos};--delay:${(i % 4) * 70}ms`;
  tile.innerHTML = `<img src="${IMG}${it.file}.jpg" alt="${it.alt}" loading="lazy">` +
    (it.type === "video" ? `<span class="play" aria-hidden="true"></span><span class="dur">${it.dur}</span>` : "");
  tile.addEventListener("click", () => openViewer(i));
  grid.appendChild(tile);
});

// gentle fade-in as tiles scroll into view
const io = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: 0.08 }) : null;
grid.querySelectorAll(".tile").forEach(t => io ? io.observe(t) : t.classList.add("in"));

// ----- pop-up viewer -----
function show(i) {
  current = (i + ITEMS.length) % ITEMS.length;
  const it = ITEMS[current];
  stage.innerHTML = "";
  let el;
  if (it.type === "video") {
    el = document.createElement("video");
    el.src = VID + it.file + ".mp4";
    el.poster = IMG + it.file + ".jpg";
    el.controls = true; el.autoplay = true; el.playsInline = true; el.preload = "auto";
  } else {
    el = document.createElement("img");
    el.src = IMG + it.file + ".jpg"; el.alt = it.alt;
  }
  stage.appendChild(el);
  counter.textContent = (current + 1) + " / " + ITEMS.length;
}
function openViewer(i) {
  show(i);
  lb.hidden = false;
  document.body.style.overflow = "hidden";
  document.getElementById("lb-close").focus();
}
function closeViewer() {
  stage.innerHTML = "";            // also stops any playing video
  lb.hidden = true;
  document.body.style.overflow = "";
}
document.getElementById("lb-close").addEventListener("click", closeViewer);
document.getElementById("lb-prev").addEventListener("click", () => show(current - 1));
document.getElementById("lb-next").addEventListener("click", () => show(current + 1));
lb.addEventListener("click", e => { if (e.target === lb || e.target === stage) closeViewer(); });
document.addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "Escape") closeViewer();
  if (e.key === "ArrowLeft") show(current - 1);
  if (e.key === "ArrowRight") show(current + 1);
});
// swipe on phones
lb.addEventListener("touchstart", e => { touchX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener("touchend", e => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX; touchX = null;
  if (Math.abs(dx) > 60) show(current + (dx < 0 ? 1 : -1));
});

// ----- mobile menu + footer year -----
const menu = document.getElementById("menu"), toggle = document.getElementById("menu-toggle");
toggle.addEventListener("click", () => { const o = menu.classList.toggle("open"); toggle.setAttribute("aria-expanded", o); });
document.getElementById("year").textContent = new Date().getFullYear();
