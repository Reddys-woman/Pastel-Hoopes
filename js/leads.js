
const SUPABASE_URL = "https://tolntrbxyowrppfzroyv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable__uaHEaG-mipb1hVWljZKhQ_zMwp2YAA"; // Keep your actual key here.

const requestHeaders = {
  "Content-Type": "application/json",
  "apikey": SUPABASE_PUBLISHABLE_KEY,
  "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
};

const PastelLeads = {
  async submit(lead) {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/register-lead`,
      {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify({
          name: lead.name,
          whatsapp: lead.whatsapp
        })
      }
    );

    let result;

    try {
      result = await response.json();
    } catch {
      throw new Error("Unexpected server response. Please try again.");
    }

    if (!response.ok || !result.success) {
      throw new Error(
        result.error || "We couldn't save your details. Please try again."
      );
    }

    return result;
  }
};

const PastelPrizeWins = {
  async record(prize) {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/register-prize-win`,
      {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify({
          name: prize.name,
          whatsapp: prize.whatsapp,
          code: prize.code,
          label: prize.label,
          source: prize.source
        })
      }
    );

    let result;

    try {
      result = await response.json();
    } catch {
      throw new Error("Unexpected server response while saving your prize.");
    }

    if (!response.ok || !result.success) {
      throw new Error(
        result.error || "We couldn't save your prize. Please try again."
      );
    }

    return result;
  }
};

window.PastelLeads = PastelLeads;
window.PastelPrizeWins = PastelPrizeWins;
