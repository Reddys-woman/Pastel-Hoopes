
/* Scratch & Win popup. Locked until signup.
   Winning coupons are saved to Supabase before being confirmed.
*/
(function () {
  const PRIZES = [
    { label: "10% OFF", weight: 25, code: "SCRATCH10", text: "10% off your order" },
    { label: "15% OFF", weight: 20, code: "SCRATCH15", text: "15% off your order" },
    { label: "20% OFF", weight: 10, code: "SCRATCH20", text: "20% off your order" },
    { label: "25% OFF", weight: 5, code: "SCRATCH25", text: "25% off your order" },
    { label: "CLAW CLIP ₹15", weight: 10, code: "SCRATCHCLAW15", text: "a claw clip for just ₹15" },
    { label: "CLAW CLIP ₹15", weight: 10, code: "SCRATCHCLAW15B", text: "a claw clip for just ₹15" },
    { label: "Better luck next time :)", weight: 20, code: null, text: null }
  ];

  const STORE_KEY = "pastelHoopesScratch";
  const SIGNED_KEY = "pastelHoopesSignedUp";

  // Development only: ?reset clears the saved scratch result.
  if (new URLSearchParams(location.search).has("reset")) {
    localStorage.removeItem(STORE_KEY);
  }

  const modal = document.getElementById("scratch-modal");
  const canvas = document.getElementById("scratch-canvas");
  const ctx = canvas.getContext("2d");
  const prizeEl = document.getElementById("scratch-prize");
  const signupModal = document.getElementById("signup-modal");
  const playBox = document.getElementById("scratch-play");
  const resultBox = document.getElementById("scratch-result");
  const signupBtn = document.getElementById("scratch-signup-btn");

  const isSignedUp = () =>
    localStorage.getItem(SIGNED_KEY) === "1";

  let chosen = null;
  let drawing = false;
  let last = null;
  let moves = 0;
  let finished = false;
  let scratchTracked = false;

  function drawCover() {
    ctx.globalCompositeOperation = "source-over";

    const g = ctx.createLinearGradient(
      0, 0, canvas.width, canvas.height
    );

    g.addColorStop(0, "#F4C6CF");
    g.addColorStop(0.5, "#FBE3E8");
    g.addColorStop(1, "#E8B4BF");

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255,255,255,.55)";

    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 3 + 1,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.fillStyle = "#6B1F33";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "600 44px Fraunces, Georgia, serif";
    ctx.fillText("SCRATCH HERE", canvas.width / 2, 170);

    ctx.font = "400 24px Jost, sans-serif";
    ctx.fillText(
      "✦  to reveal your prize  ✦",
      canvas.width / 2,
      220
    );
  }

  function pickPrize() {
    let n = Math.random() * 100;

    for (const p of PRIZES) {
      n -= p.weight;
      if (n < 0) return p;
    }

    return PRIZES[PRIZES.length - 1];
  }

  function updateGate() {
    const ok = isSignedUp();

    canvas.classList.toggle("locked", !ok);
    signupBtn.hidden = ok;

    document.getElementById("scratch-lock").textContent = ok
      ? "You're in! Scratch the card with your finger or mouse."
      : "Sign up first to unlock your card.";
  }

  function showResult(p) {
    const win = !!p.code;

    document.getElementById("scratch-result-title").textContent =
      win ? "Congratulations!" : "Better luck next time :)";

    document.getElementById("scratch-result-text").textContent =
      win
        ? "You won " + p.text + "."
        : "No prize this time, but thanks for playing!";

    const code = document.getElementById("scratch-result-code");
    code.textContent = win ? p.code : "";
    code.hidden = !win;

    document.getElementById("scratch-result-note").hidden = !win;

    playBox.hidden = true;
    resultBox.hidden = false;
  }

  function scratchedShare() {
    const d = ctx.getImageData(
      0, 0, canvas.width, canvas.height
    ).data;

    let clear = 0;
    let total = 0;

    for (let i = 3; i < d.length; i += 64) {
      total++;
      if (d[i] === 0) clear++;
    }

    return total ? clear / total : 0;
  }

  function savePendingPrize() {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        code: chosen.code,
        label: chosen.label,
        date: Date.now(),
        confirmed: false
      })
    );
  }

  async function finish() {
    if (finished || !chosen) return;

    finished = true;
    drawing = false;
    canvas.classList.add("done");

    // Count this play once (even if prize save later fails)
    if (!scratchTracked && window.PastelStats && PastelStats.trackScratch) {
      scratchTracked = true;
      try { await PastelStats.trackScratch(); } catch (e) {
        console.warn("trackScratch failed", e);
        scratchTracked = false; // allow retry of counter
      }
    }

    // Allow the scratch animation to finish.
    await new Promise(resolve => setTimeout(resolve, 1100));

    try {
      if (chosen.code) {
        const customer = JSON.parse(
          sessionStorage.getItem("pastelHoopesCustomer") || "null"
        );

        if (!customer || !customer.name || !customer.whatsapp) {
          throw new Error(
            "Signup details not found. Please sign up again."
          );
        }

        if (!window.PastelPrizeWins) {
          throw new Error("Prize-saving service is unavailable.");
        }

        // Save the winning coupon before displaying it as confirmed.
        await window.PastelPrizeWins.record({
          name: customer.name,
          whatsapp: customer.whatsapp,
          code: chosen.code,
          label: chosen.text,
          source: "scratch"
        });
      }

      // Losing results are stored locally, not in prize_wins.
      localStorage.setItem(
        STORE_KEY,
        JSON.stringify({
          code: chosen.code,
          label: chosen.label,
          date: Date.now(),
          confirmed: true
        })
      );


      showResult(chosen);
    } catch (error) {
      console.error("Could not save scratch prize:", error);

      alert(
        "We couldn't confirm your prize. Please scratch again to retry. Your winning coupon has not been confirmed."
      );

      // Keep the same selected prize so retrying doesn't reroll it.
      finished = false;
      moves = 0;
      canvas.classList.remove("done");
      drawCover();
    }
  }

  function pos(e) {
    const r = canvas.getBoundingClientRect();

    return {
      x: (e.clientX - r.left) * canvas.width / r.width,
      y: (e.clientY - r.top) * canvas.height / r.height
    };
  }

  canvas.addEventListener("pointerdown", e => {
    if (!isSignedUp() || finished) return;

    if (!chosen) {
      // Restore an unfinished prize if one exists; otherwise pick once.
      const saved = JSON.parse(
        localStorage.getItem(STORE_KEY) || "null"
      );

      if (saved && saved.confirmed === false) {
        chosen = PRIZES.find(
          p => p.code === saved.code && p.label === saved.label
        ) || null;
      }

      if (!chosen) {
        chosen = pickPrize();
        savePendingPrize();
      }

      prizeEl.textContent = chosen.label;
    }

    drawing = true;
    last = pos(e);
    canvas.setPointerCapture(e.pointerId);
    scratchTo(last);
  });

  canvas.addEventListener("pointermove", e => {
    if (drawing && last && !finished) {
      scratchTo(pos(e));
    }
  });

  function scratchTo(p) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 46;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x + 0.1, p.y + 0.1);
    ctx.stroke();

    last = p;

    if (++moves % 8 === 0 && scratchedShare() > 0.5) {
      finish();
    }
  }

  function stop() {
    drawing = false;

    if (chosen && !finished && scratchedShare() > 0.5) {
      finish();
    }
  }

  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointercancel", stop);

  function open() {
    updateGate();

    const saved = JSON.parse(
      localStorage.getItem(STORE_KEY) || "null"
    );

    if (saved && saved.confirmed === true) {
      const previousPrize = PRIZES.find(
        p => p.code === saved.code && p.label === saved.label
      );

      if (previousPrize) {
        showResult(previousPrize);
      } else {
        playBox.hidden = false;
        resultBox.hidden = true;
      }
    } else {
      // A pending prize stays hidden until scratching finishes.
      chosen = null;
      finished = false;
      scratchTracked = false;
      moves = 0;
      canvas.classList.remove("done");
      drawCover();
      playBox.hidden = false;
      resultBox.hidden = true;
    }

    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function close() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  signupBtn.addEventListener("click", () => PastelSignup.open());

  document.getElementById("scratch-close")
    .addEventListener("click", close);

  document.getElementById("scratch-keep")
    .addEventListener("click", close);

  modal.addEventListener("click", e => {
    if (e.target === modal && !finished) close();
  });

  document.addEventListener("keydown", e => {
    if (
      e.key === "Escape" &&
      !modal.hidden &&
      signupModal.hidden &&
      !finished
    ) {
      close();
    }
  });

  document.querySelectorAll(".open-scratch").forEach(el => {
    el.addEventListener("click", e => {
      e.preventDefault();
      open();
    });
  });

  // Unlock the card when signup closes successfully.
  new MutationObserver(() => {
    if (signupModal.hidden && !modal.hidden) {
      updateGate();
      document.body.style.overflow = "hidden";
    }
  }).observe(signupModal, {
    attributes: true,
    attributeFilter: ["hidden"]
  });

  drawCover();
})();
