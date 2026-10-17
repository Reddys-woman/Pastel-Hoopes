
const SUPABASE_URL = "https://tolntrbxyowrppfzroyv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable__uaHEaG-mipb1hVWljZKhQ_zMwp2YAA";

const PastelLeads = {
  async submit(lead) {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/register-lead`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_PUBLISHABLE_KEY,
          "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
        },
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

window.PastelLeads = PastelLeads;
