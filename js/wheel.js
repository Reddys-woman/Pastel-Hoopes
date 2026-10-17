// Spin & Win popup. Opens automatically after 5-10 seconds.
// NOTE: this runs in the browser, so it's for the demo only.
// Later, Supabase should pick the prize and save the coupon securely.
(function () {
  // weight = chance (they add up to 100). weight 0 = shown on wheel but can never be won.
  const PRIZES = [
    { label: "10% OFF",       weight: 30, code: "HOOPES10",  text: "10% off your order",           bg: "#F9E4E6" },
    { label: "15% OFF",       weight: 28, code: "HOOPES15",  text: "15% off your order",           bg: "#F4C6CF" },
    { label: "90% OFF",       weight: 0,  code: "HOOPES90",  text: "90% off your order",           bg: "#6B1F33", light: true },
    { label: "20% OFF",       weight: 12, code: "HOOPES20",  text: "20% off your order",           bg: "#F9E4E6" },
    { label: "FREE PRODUCT",  weight: 0,  code: "FREEPICK",  text: "a free product",               bg: "#8C3A4F", light: true },
    { label: "25% OFF",       weight: 6,  code: "HOOPES25",  text: "25% off your order",           bg: "#F4C6CF" },
    { label: "CLAW CLIP ₹15", weight: 12, code: "CLAW15",    text: "a claw clip for just ₹15",     bg: "#F9E4E6" },
    { label: "CLAW CLIP ₹15", weight: 12, code: "CLAW15B",   text: "a claw clip for just ₹15",     bg: "#F4C6CF" }
  ];
  const STORE_KEY = "pastelHoopesSpin";
  const modal = document.getElementById("wheel-modal");
  const canvas = document.getElementById("wheel-canvas");
  const spinBtn = document.getElementById("spin-btn");
  const playBox = document.getElementById("wheel-play");
  const resultBox = document.getElementById("wheel-result");
  const seg = 360 / PRIZES.length;
  const SIGNED_KEY = "pastelHoopesSignedUp"; // just a "1" flag, no customer details
  let rotation = 0, spinning = false;
  const isSignedUp = () => localStorage.getItem(SIGNED_KEY) === "1";

  // Locked until the visitor has signed up
  function updateGate() {
    const ok = isSignedUp();
    spinBtn.textContent = ok ? "Spin the wheel" : "Sign up to spin";
    document.getElementById("wheel-lock").textContent = ok ? "You're in! Give the wheel a spin." : "Sign up first to unlock your spin.";
    canvas.classList.toggle("locked", !ok);
  }

  function drawWheel() {
    const ctx = canvas.getContext("2d"), c = canvas.width / 2, r = c - 4, a = (Math.PI * 2) / PRIZES.length;
    PRIZES.forEach((p, i) => {
      const start = -Math.PI / 2 + i * a - a / 2;
      ctx.beginPath(); ctx.moveTo(c, c); ctx.arc(c, c, r, start, start + a); ctx.closePath();
      ctx.fillStyle = p.bg; ctx.fill();
      ctx.strokeStyle = "#FFF8F2"; ctx.lineWidth = 3; ctx.stroke();
      ctx.save(); ctx.translate(c, c); ctx.rotate(i * a); ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = p.light ? "#FFF8F2" : "#6B1F33";
      ctx.font = "600 19px Jost, sans-serif"; ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillText(p.label, r - 18, 0);
      ctx.restore();
    });
    ctx.beginPath(); ctx.arc(c, c, 26, 0, Math.PI * 2); ctx.fillStyle = "#FFF8F2"; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = "#6B1F33"; ctx.stroke();
  }

  function pickPrize() {
    let n = Math.random() * 100;
    for (let i = 0; i < PRIZES.length; i++) { n -= PRIZES[i].weight; if (n < 0) return i; }
    return 0;
  }

  function showResult(p, again) {
    document.getElementById("result-title").textContent = again ? "Your prize" : "Congratulations!";
    document.getElementById("result-text").textContent = "You won " + p.text + ".";
    document.getElementById("result-code").textContent = p.code;
    playBox.hidden = true; resultBox.hidden = false;
  }

  function openModal() {
    updateGate();
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (saved) showResult(PRIZES.find(p => p.code === saved.code) || PRIZES[0], true);
    modal.hidden = false; document.body.style.overflow = "hidden";
  }
  function closeModal() {
    modal.hidden = true; document.body.style.overflow = "";
    sessionStorage.setItem("pastelHoopesWheelClosed", "1");
  }

  spinBtn.addEventListener("click", () => {
    if (spinning) return;
    if (!isSignedUp()) { PastelSignup.open(); return; }
    spinning = true; spinBtn.disabled = true; spinBtn.textContent = "Spinning…";
    const i = pickPrize();
    const jitter = (Math.random() - 0.5) * seg * 0.6;
    const target = (360 - i * seg + jitter + 360) % 360;
    rotation += 5 * 360 + ((target - (rotation % 360) + 360) % 360);
    canvas.style.transform = "rotate(" + rotation + "deg)";
    setTimeout(() => {
      localStorage.setItem(STORE_KEY, JSON.stringify({ code: PRIZES[i].code, date: Date.now() }));
      showResult(PRIZES[i], false); spinning = false;
    }, 5300);
  });

  document.getElementById("wheel-close").addEventListener("click", closeModal);
  document.getElementById("keep-shopping").addEventListener("click", closeModal);
  modal.addEventListener("click", e => { if (e.target === modal && !spinning) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden && !spinning && document.getElementById("signup-modal").hidden) closeModal(); });
  drawWheel();

  // Spin buttons anywhere on the page open the wheel
  document.querySelectorAll(".open-wheel").forEach(el => el.addEventListener("click", e => { e.preventDefault(); openModal(); }));

  // Auto-open after 5-10 seconds (unless they already spun or closed it)
  setTimeout(() => {
    if (!localStorage.getItem(STORE_KEY) && !sessionStorage.getItem("pastelHoopesWheelClosed") && modal.hidden && document.getElementById("signup-modal").hidden) openModal();
  }, 5000 + Math.random() * 5000);

  window.PastelWheel = {
    open: openModal,
    hasSpun: () => !!localStorage.getItem(STORE_KEY),
    isSignedUp,
    unlock() { localStorage.setItem(SIGNED_KEY, "1"); updateGate(); }
  };
})();
