/* Landed live room settings.
   Leave both fields empty for demo mode (posts only reach other windows of the same browser).
   To reach other phones, create a free Supabase project, run supabase-setup.sql once,
   then paste the Project URL and the public (anon / publishable) key here.
   This key is meant to be public. The database rules in supabase-setup.sql limit what it can do. */
window.LANDED_CONFIG={
  supabaseUrl:"https://dxejshrujigcfumnrieh.supabase.co",   // e.g. "https://abcdxyz.supabase.co"
  supabaseKey:"sb_publishable_SAVZZGcwd3ATU1eXybZr7g_fIyRUGL9",   // e.g. "eyJhbGciOi…" or "sb_publishable_…"
  room:""           // optional: fixed room code (4–8 letters/digits), otherwise the pitch creates one
};
