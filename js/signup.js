// ===== FORM UI: open/close, validation, loading state =====
// It never talks to a database directly. It calls PastelLeads.submit() from js/leads.js.
(function () {
  const modal = document.getElementById("signup-modal");
  const form = document.getElementById("signup-form");
  const nameInput = document.getElementById("signup-name");
  const phoneInput = document.getElementById("signup-phone");
  const nameError = document.getElementById("signup-name-error");
  const phoneError = document.getElementById("signup-phone-error");
  const status = document.getElementById("signup-status");
  const submitBtn = document.getElementById("signup-submit");
  const CLOSED_KEY = "pastelHoopesSignupClosed"; // session only: remembers "maybe later", holds no customer data
  let lastFocus = null, busy = false;

  function openSignup() {
    // Returning visitors who already spun just see their prize.
    if (window.PastelWheel && PastelWheel.hasSpun()) return PastelWheel.open();
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(() => nameInput.focus(), 50);
  }
  function closeSignup(remember) {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (remember) sessionStorage.setItem(CLOSED_KEY, "1");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // Returns a clean 10-digit Indian mobile number, or null if it isn't valid.
  function cleanPhone(raw) {
    let d = raw.replace(/\D/g, "");
    if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
    else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
    return /^[6-9]\d{9}$/.test(d) ? d : null;
  }

  function setError(input, el, msg) {
    el.textContent = msg;
    input.setAttribute("aria-invalid", msg ? "true" : "false");
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (busy) return;
    status.textContent = "";
    const name = nameInput.value.trim().replace(/\s+/g, " ");
    const phone = cleanPhone(phoneInput.value);

    setError(nameInput, nameError, name.length < 2 ? "Please enter your name." : "");
    setError(phoneInput, phoneError, phone ? "" : "Enter a valid 10-digit WhatsApp number.");
    if (name.length < 2) return nameInput.focus();
    if (!phone) return phoneInput.focus();

    busy = true; submitBtn.disabled = true; submitBtn.textContent = "Please wait…";
    try {
      await PastelLeads.submit({ name, whatsapp: "+91" + phone });
      form.reset();
      closeSignup(false);
      PastelWheel.open();
    } catch (err) {
      status.textContent = err.message || "Something went wrong. Please try again.";
    } finally {
      busy = false; submitBtn.disabled = false; submitBtn.textContent = "Sign Up & Spin";
    }
  });

  document.getElementById("signup-close").addEventListener("click", () => closeSignup(true));
  document.getElementById("signup-later").addEventListener("click", () => closeSignup(true));
  modal.addEventListener("click", e => { if (e.target === modal && !busy) closeSignup(true); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden && !busy) closeSignup(true); });

  // Every "Spin" button on the page opens the sign-up first
  document.querySelectorAll(".open-wheel").forEach(el =>
    el.addEventListener("click", e => { e.preventDefault(); openSignup(); }));

  // Auto-open after 5-10 seconds, unless they've spun or said "maybe later"
  setTimeout(() => {
    const wheelOpen = !document.getElementById("wheel-modal").hidden;
    if (!sessionStorage.getItem(CLOSED_KEY) && !PastelWheel.hasSpun() && modal.hidden && !wheelOpen) openSignup();
  }, 5000 + Math.random() * 5000);
})();
