// Site traction counters (shared across all visitors).
// API: abacus.jasoncameron.dev
(function () {
  const NS = "pastel-hoopes-hackathon";
  const BASE = "https://abacus.jasoncameron.dev";

  async function hit(name) {
    const res = await fetch(BASE + "/hit/" + NS + "/" + name, { mode: "cors" });
    if (!res.ok) throw new Error("hit failed " + res.status);
    const data = await res.json();
    return Number(data.value);
  }

  async function get(name) {
    const res = await fetch(BASE + "/get/" + NS + "/" + name, { mode: "cors" });
    if (!res.ok) {
      // Key may not exist yet
      return 0;
    }
    const data = await res.json();
    if (data.error) return 0;
    return Number(data.value) || 0;
  }

  function format(n) {
    if (n == null || isNaN(n)) return "—";
    return Number(n).toLocaleString("en-IN");
  }

  function paint(partial) {
    if (partial.visits != null) {
      const el = document.getElementById("stat-visitors");
      if (el) el.textContent = format(partial.visits);
    }
    if (partial.signups != null) {
      const el = document.getElementById("stat-signups");
      if (el) el.textContent = format(partial.signups);
    }
    if (partial.spins != null) {
      const el = document.getElementById("stat-spins");
      if (el) el.textContent = format(partial.spins);
    }
    if (partial.scratches != null) {
      const el = document.getElementById("stat-scratches");
      if (el) el.textContent = format(partial.scratches);
    }
  }

  async function refreshAll() {
    const visits = await get("visits").catch(() => 0);
    const signups = await get("signups").catch(() => 0);
    const spins = await get("spins").catch(() => 0);
    const scratches = await get("scratches").catch(() => 0);
    paint({ visits, signups, spins, scratches });
    return { visits, signups, spins, scratches };
  }

  async function trackVisit() {
    const key = "pastelHoopesVisitedSession";
    try {
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        const visits = await hit("visits");
        paint({ visits });
      }
    } catch (e) {
      console.warn("[PastelStats] visits:", e);
    }
    await refreshAll();
  }

  async function trackSignup() {
    try {
      const signups = await hit("signups");
      paint({ signups });
    } catch (e) {
      console.warn("[PastelStats] signups:", e);
    }
    await refreshAll();
  }

  async function trackSpin() {
    try {
      const spins = await hit("spins");
      paint({ spins });
      console.log("[PastelStats] spins →", spins);
    } catch (e) {
      console.warn("[PastelStats] spins:", e);
    }
  }

  async function trackScratch() {
    try {
      const scratches = await hit("scratches");
      paint({ scratches });
      console.log("[PastelStats] scratches →", scratches);
    } catch (e) {
      console.warn("[PastelStats] scratches:", e);
    }
  }

  window.PastelStats = {
    trackVisit,
    trackSignup,
    trackSpin,
    trackScratch,
    refresh: refreshAll
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", trackVisit);
  } else {
    trackVisit();
  }
})();
