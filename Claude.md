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
Stage 5 complete. Review/history views added:
- Entry/Review toggle tabs in the UI
- Review mode: read-only month view with arrow navigation,
  only non-zero providers shown, comments, totals
- 3-month summary table below review view
- Spreadsheet/pivot view: 12-month table, all providers,
  horizontally scrollable, sticky headers and provider column
- OneDrive stores file at MyBGAccounts/mybgaccounts.dat
  (changed from AppFolder to visible root folder)
- Scope changed from Files.ReadWrite.AppFolder to Files.ReadWrite
- Deployed to GitHub Pages: https://bernieonline.github.io/TrackMyApp/
- Repo is public; Azure SPA redirect URI configured for Pages URL
- No Live Server dependency — both PC and iPad use the Pages URL
Ready to begin Stage 6 (growth rates + charts).
