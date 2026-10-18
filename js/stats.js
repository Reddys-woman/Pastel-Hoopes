// Site traction counters (shared across all visitors — no backend of yours required).
// Primary: abacus.jasoncameron.dev (public countapi-style API)
// Visitor: +1 once per browser session. Sign-ups / spins / scratches: +1 on each event.
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
    if (!res.ok) throw new Error("get failed " + res.status);
    const data = await res.json();
    return Number(data.value);
  }

  function format(n) {
    if (n == null || isNaN(n)) return "—";
    return Number(n).toLocaleString("en-IN");
  }

  function paint(visits, signups, spins, scratches) {
    const v = document.getElementById("stat-visitors");
    const s = document.getElementById("stat-signups");
    const sp = document.getElementById("stat-spins");
    const sc = document.getElementById("stat-scratches");
    if (v) v.textContent = format(visits);
    if (s) s.textContent = format(signups);
    if (sp) sp.textContent = format(spins);
    if (sc) sc.textContent = format(scratches);
  }

  async function refreshAll() {
    let visits = null, signups = null, spins = null, scratches = null;
    try { visits = await get("visits"); } catch (_) { visits = 0; }
    try { signups = await get("signups"); } catch (_) { signups = 0; }
    try { spins = await get("spins"); } catch (_) { spins = 0; }
    try { scratches = await get("scratches"); } catch (_) { scratches = 0; }
    paint(visits, signups, spins, scratches);
    return { visits, signups, spins, scratches };
  }

  async function trackVisit() {
    const key = "pastelHoopesVisitedSession";
    try {
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        await hit("visits");
      }
    } catch (e) {
      console.warn("[PastelStats] visits:", e);
    }
    await refreshAll();
  }

  async function trackSignup() {
    try {
      await hit("signups");
    } catch (e) {
      console.warn("[PastelStats] signups hit:", e);
    }
    await refreshAll();
  }

  async function trackSpin() {
    try {
      await hit("spins");
    } catch (e) {
      console.warn("[PastelStats] spins hit:", e);
    }
    await refreshAll();
  }

  async function trackScratch() {
    try {
      await hit("scratches");
    } catch (e) {
      console.warn("[PastelStats] scratches hit:", e);
    }
    await refreshAll();
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
