import Airtable from 'airtable';

/* ---------------------------------------------------------------------------
   SECURITY NOTE

   REACT_APP_* variables are inlined into the JavaScript bundle at build time,
   so this key is readable by anyone who opens the deployed site — and an
   Airtable personal access token grants read, write and delete on the base.

   There is no way to keep a key secret in a client-only app. The real fix is
   to move these calls behind a small server that holds the token and exposes
   only the operations this app needs. Until then, treat the key as public:
   scope it to just this base, and rotate it, since any bundle already
   deployed has exposed it.
   --------------------------------------------------------------------------- */

const API_KEY = process.env.REACT_APP_AIRTABLE_API_KEY;
const BASE_ID = process.env.REACT_APP_AIRTABLE_BASE_ID || 'app2Zq6DikKlO4AV3';
const TABLE = 'Team List';

export const isConfigured = Boolean(API_KEY);

// Built once at module load rather than on every render.
const base = isConfigured ? new Airtable({ apiKey: API_KEY }).base(BASE_ID) : null;

export function teamTable() {
  if (!base) {
    throw new Error(
      'Airtable is not configured — set REACT_APP_AIRTABLE_API_KEY and restart the dev server.'
    );
  }
  return base(TABLE);
}
