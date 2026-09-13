\# CLAUDE.md — MyBGAccounts

\## What this is  
A Progressive Web App for monthly logging and review of savings,  
investment, and pension balances. Data is encrypted client-side  
and stored on OneDrive. Runs on iPad (Safari) and Windows (Chrome)  
from a single codebase.

\## Reference documents  
\- Specification.md — full feature spec (data model, views, providers,  
 growth-rate logic, charts, security)  
\- DevelopmentPlan.md — architecture, dev workflow, deployment plan,  
 build estimate
see "D:\TrackMyApp 1.0\Dev Notes\Investments" for planning notes 


Read both before starting work if context is missing. Do not  
duplicate their content here — update them directly instead of  
expanding this file.

\## Stack  
\- Plain HTML/CSS/JavaScript — no framework, no build step  
\- Microsoft Graph API (MSAL.js) for OneDrive, scoped to  
 Files.ReadWrite.AppFolder  
\- Web Crypto API (AES-GCM) for client-side encryption  
\- Chart.js for reporting

\## Non-negotiable constraints  
\- No plaintext data ever leaves the browser — encrypt before upload  
\- No server-side backend — all logic runs client-side  
\- Provider category is immutable once set (create a new provider  
 instead of changing one)  
\- Keep third-party dependencies minimal

## Decisions confirmed (2026-09-13)
- Suggestions.md items 1-4 (ETag conflict detection, localStorage
  draft autosave, export decrypted data, passphrase rotation) are
  all in scope for v1
- Chart pie-chart grouping level: deferred — decide during build
- Date defaulting: use Spec Section 4 logic (current month if
  previous month record exists, otherwise previous month)
- Historical data import: skipped for now

## Build order (staged milestones)
1. Provider data model + data entry screen (in-memory, no persistence)
2. Totals, comments, localStorage draft autosave
3. Encryption module (isolated, Web Crypto AES-GCM)
4. OneDrive auth (MSAL.js) + read/write with ETag conflict check
5. Review/history views (paging, 3-month summary, pivot table)
6. Growth rates + charts (Chart.js)

## Current status
Stage 2 complete. Totals section (5 colour-coded rows,
Index excluded), comments textarea, and localStorage draft
autosave all implemented. Data survives page reloads.
Ready to begin Stage 3 (encryption module).
See "Dev Notes/Investments" for original planning notes.
