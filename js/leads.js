// ===== DATABASE LAYER (separate from the form UI) =====
// js/signup.js calls PastelLeads.submit({ name, whatsapp }) and nothing else.
// When Supabase is ready, replace the body of submit() with your insert call.
// Do NOT save customer details in localStorage.
const PastelLeads = {
  // For previewing the wheel flow on your own computer only.
  // Keep this false: when true, nothing is saved anywhere.
  DEV_SKIP_SAVE: false,

  async submit(lead) {
    if (this.DEV_SKIP_SAVE) return;

    // TODO (later): save the lead to Supabase, for example:
    //   const { error } = await supabaseClient.from("leads").insert({ name: lead.name, whatsapp: lead.whatsapp });
    //   if (error) throw new Error("We couldn't save your details. Please try again.");
    throw new Error("Sign-up isn't connected yet, so we can't save your details right now.");
  }
};
