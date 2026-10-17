// Scratch & Win popup. Same rules as the wheel: locked until the visitor signs up.
// NOTE: runs in the browser, so it's for the demo only. Later, Supabase should pick
// the prize and save the coupon securely.
(function () {
  // weight = chance (they add up to 100). No 50% / 90% / free-product prizes here.
  const PRIZES = [
    { label: "10% OFF",           weight: 25, code: "SCRATCH10",       text: "10% off your order" },
    { label: "15% OFF",           weight: 20, code: "SCRATCH15",       text: "15% off your order" },
    { label: "20% OFF",           weight: 10, code: "SCRATCH20",       text: "20% off your order" },
    { label: "25% OFF",           weight: 5,  code: "SCRATCH25",       text: "25% off your order" },
    { label: "CLAW CLIP ₹15",     weight: 10, code: "SCRATCHCLAW15",   text: "a claw clip for just ₹15" },
    { label: "CLAW CLIP ₹15",     weight: 10, code: "SCRATCHCLAW15B",  text: "a claw clip for just ₹15" },
    { label: "Better luck next time :)", weight: 20, code: null, text: null }
  ];
  const STORE_KEY = "pastelHoopesScratch"; // saves only the prize code, no customer details
  const SIGNED_KEY = "pastelHoopesSignedUp";
  if (new URLSearchParams(location.search).has("reset")) localStorage.removeItem(STORE_KEY); // dev only

  const modal = document.getElementById("scratch-modal");
  const canvas = document.getElementById("scratch-canvas");
  const ctx = canvas.getContext("2d");
  const prizeEl = document.getElementById("scratch-prize");
  const signupModal = document.getElementById("signup-modal");
  const playBox = document.getElementById("scratch-play");
  const resultBox = document.getElementById("scratch-result");
  const signupBtn = document.getElementById("scratch-signup-btn");
  const isSignedUp = () => localStorage.getItem(SIGNED_KEY) === "1";
  let chosen = null, drawing = false, last = null, moves = 0, finished = false;

  function drawCover() {
    ctx.globalCompositeOperation = "source-over";
    const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    g.addColorStop(0, "#F4C6CF"); g.addColorStop(0.5, "#FBE3E8"); g.addColorStop(1, "#E8B4BF");
    ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255,255,255,.55)";
    for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc(Math.random() * 600, Math.random() * 360, Math.random() * 3 + 1, 0, 6.3); ctx.fill(); }
    ctx.fillStyle = "#6B1F33"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "600 44px Fraunces, Georgia, serif"; ctx.fillText("SCRATCH HERE", 300, 170);
    ctx.font = "400 24px Jost, sans-serif"; ctx.fillText("✦  to reveal your prize  ✦", 300, 220);
  }

  function pickPrize() {
    let n = Math.random() * 100;
    for (const p of PRIZES) { n -= p.weight; if (n < 0) return p; }
    return PRIZES[PRIZES.length - 1];
  }

  function updateGate() {
    const ok = isSignedUp();
    canvas.classList.toggle("locked", !ok);
    signupBtn.hidden = ok;
    document.getElementById("scratch-lock").textContent = ok ? "You're in! Scratch the card with your finger or mouse." : "Sign up first to unlock your card.";
  }

  function showResult(p) {
    const win = !!p.code;
    document.getElementById("scratch-result-title").textContent = win ? "Congratulations!" : "Better luck next time :)";
    document.getElementById("scratch-result-text").textContent = win ? "You won " + p.text + "." : "No prize this time, but thanks for playing!";
    const code = document.getElementById("scratch-result-code");
    code.textContent = win ? p.code : ""; code.hidden = !win;
    document.getElementById("scratch-result-note").hidden = !win;
    playBox.hidden = true; resultBox.hidden = false;
  }

  function scratchedShare() {
    const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let clear = 0, total = 0;
    for (let i = 3; i < d.length; i += 64) { total++; if (d[i] === 0) clear++; }
    return clear / total;
  }
  function finish() {
    if (finished) return;
    finished = true; canvas.classList.add("done");
    setTimeout(() => showResult(chosen), 1100);
  }

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * canvas.width / r.width, y: (e.clientY - r.top) * canvas.height / r.height };
  }
  canvas.addEventListener("pointerdown", e => {
    if (!isSignedUp() || finished) return;
    if (!chosen) { // first scratch: decide the prize and remember it so a refresh can't re-roll
      chosen = pickPrize();
      localStorage.setItem(STORE_KEY, JSON.stringify({ code: chosen.code, label: chosen.label, date: Date.now() }));
      prizeEl.textContent = chosen.label;
    }
    drawing = true; last = pos(e); canvas.setPointerCapture(e.pointerId); scratchTo(last);
  });
  canvas.addEventListener("pointermove", e => { if (drawing) scratchTo(pos(e)); });
  function scratchTo(p) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 46; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x + 0.1, p.y + 0.1); ctx.stroke();
    last = p;
    if (++moves % 8 === 0 && scratchedShare() > 0.5) finish();
  }
  function stop() { drawing = false; if (chosen && scratchedShare() > 0.5) finish(); }
  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointercancel", stop);

  function open() {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (saved) showResult(PRIZES.find(p => p.code === saved.code && p.label === saved.label) || PRIZES[PRIZES.length - 1]);
    else updateGate();
    modal.hidden = false; document.body.style.overflow = "hidden";
  }
  function close() { modal.hidden = true; document.body.style.overflow = ""; }

  signupBtn.addEventListener("click", () => PastelSignup.open());
  document.getElementById("scratch-close").addEventListener("click", close);
  document.getElementById("scratch-keep").addEventListener("click", close);
  modal.addEventListener("click", e => { if (e.target === modal) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden && signupModal.hidden) close(); });
  document.querySelectorAll(".open-scratch").forEach(el => el.addEventListener("click", e => { e.preventDefault(); open(); }));

  // When the sign-up popup closes (after a successful sign-up), unlock the card
  new MutationObserver(() => {
    if (signupModal.hidden && !modal.hidden) { updateGate(); document.body.style.overflow = "hidden"; }
  }).observe(signupModal, { attributes: true, attributeFilter: ["hidden"] });

  drawCover();
})();
