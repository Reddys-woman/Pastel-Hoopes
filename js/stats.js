// Site traction counters (shared across all visitors — no backend of yours required).
// Primary: abacus.jasoncameron.dev (public countapi-style API)
// Visitor: +1 once per browser session. Sign-ups: +1 after successful form submit.
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

  function paint(visits, signups) {
    const v = document.getElementById("stat-visitors");
    const s = document.getElementById("stat-signups");
    if (v) v.textContent = format(visits);
    if (s) s.textContent = format(signups);
  }

  async function trackVisit() {
    const key = "pastelHoopesVisitedSession";
    let visits = null;
    let signups = null;
    try {
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        visits = await hit("visits");
      } else {
        visits = await get("visits");
      }
    } catch (e) {
      console.warn("[PastelStats] visits:", e);
    }
    try {
      signups = await get("signups");
    } catch (e) {
      console.warn("[PastelStats] signups get:", e);
      // key may not exist yet — treat as 0
      signups = 0;
    }
    paint(visits, signups);
  }

  async function trackSignup() {
    let signups = null;
    let visits = null;
    try {
      signups = await hit("signups");
    } catch (e) {
      console.warn("[PastelStats] signups hit:", e);
    }
    try {
      visits = await get("visits");
    } catch (_) {}
    paint(visits, signups);
    return signups;
  }

  window.PastelStats = { trackVisit, trackSignup, refresh: trackVisit };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", trackVisit);
  } else {
    trackVisit();
  }
})();
