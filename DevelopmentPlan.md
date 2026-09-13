---
title: DevelopmentPlan.md
updated: 2026-09-12 11:40:33Z
created: 2026-09-12 11:35:48Z
latitude: 53.48095160
longitude: -2.23743270
altitude: 0.0000
---

MYBGACCOUNTS — PROJECT STATEMENT  
SAVINGS & INVESTMENTS TRACKER (PWA)  
\======================================================  
Status: Draft — ready for build  
Last updated: 2026-09-12

\------------------------------------------------------  
1\. OVERVIEW  
\------------------------------------------------------  
App name: MyBGAccounts  
A Progressive Web App (PWA) for monthly logging and review  
of savings, investment, and pension balances across multiple  
providers, with reporting/charts. Data is encrypted client-  
side and stored as a single file on OneDrive. Runs on iPad  
(Safari, Add to Home Screen) and Windows (Chrome). Online-  
only — no offline support required.

\------------------------------------------------------  
2\. GOALS  
\------------------------------------------------------  
\- Quick monthly data entry via a provider table  
\- Review mode: page back through historical months  
\- Category-based totals (Savings / Investments / Pension)  
\- Growth-rate comparison for investments vs FTSE 100  
\- Reporting charts: trend lines and pie chart(s)  
\- One encrypted data file stored in the user's own OneDrive  
\- Cross-platform: iPad + Windows, single codebase  
\- Import cleaned historical data (last full year) from spreadsheet

\------------------------------------------------------  
3\. NON-GOALS (for v1)  
\------------------------------------------------------  
\- Offline support / sync conflict handling  
\- Multi-user access  
\- Automated bank/provider/index API feeds (FTSE entered manually)  
\- Mobile phone optimisation (iPad + Windows only)  
\- Retroactive category changes (see Section 5)  
\- Native iPad app / separate Swift codebase (ruled out —  
 single PWA codebase covers both platforms)  
\- iCloud/CloudKit as storage backend (ruled out — staying  
 with OneDrive; would have required a separate code path)

\------------------------------------------------------  
4\. DATE DEFAULTING LOGIC  
\------------------------------------------------------  
On load, default Month/Year to:  
  - Current month, IF a record already exists for the  
   previous month  
  - Otherwise, default to the previous month  
Self-correcting behaviour; easy to change later if a fixed-  
day cutoff is preferred instead.

\------------------------------------------------------  
5\. PROVIDERS  
\------------------------------------------------------  
\- Each provider is assigned a unique ID at setup time.  
 The ID (not the display label) is the permanent link to  
 historical entries.  
\- Fields per provider:  
  - id (internal, permanent)  
  - label (display name, editable in Edit mode)  
  - category (Investment / Saving / Pension / Index —  
               FIXED for life, see below)  
  - active (boolean — unchecking hides it from new  
               entries, but historical months still show it)  
\- Category is set once at creation and NEVER changed. If a  
 provider's category needs to change, a NEW provider is  
 created instead.  
\- FTSE 100 is modelled as a provider with category "Index",  
 entered manually each month — avoids needing an external  
 market-data API/dependency.

Initial provider list (category in brackets):  
  1. Natwest Current (Saving)  
  2. Natwest Credit Card (Saving)  
  3. Starling (Saving)  
  4. Close Bros ISA Mary (Investment)  
  5. Close Bros ISA Bernard (Investment)  
  6. Nationwide (Saving)  
  7. Marcus Bernard (Saving)  
  8. Vanguard Bernard (Investment)  
  9. Aviva ISA Mary (Investment)  
  10. Aviva ISA Bernard (Investment)  
  11. Aviva Pension Valuation (Pension)  
  12. Leeds ISA Mary (Investment)  
  13. Leeds ISA Bernard (Investment)  
  14. Santander Mary (Saving)  
  15. Santander Bernard (Saving)  
  16. FTSE 100 (Index)

\------------------------------------------------------  
6\. DATA ENTRY VIEW  
\------------------------------------------------------  
\- Header: "Savings and Investments"  
\- Month/Year selector (dropdowns), defaulted per Section 4  
\- Table of active providers, one row each:  
  - Alternating row background colour for readability  
  - Provider label  
  - £ value entry field, 2 decimal places  
\- Add new provider (assigns ID, sets label + category)  
\- Edit mode:  
  - Checkbox per row — unchecked = hidden from new entries  
   (historical data preserved)  
  - Provider labels editable  
  - Previously entered £ values editable (error correction)  
  - Category NOT editable once set

Totals (below entry table, each row colour-coded):  
  Row 1: Total of all Savings + Investments  
  Row 2: Total of all Savings only  
  Row 3: Total of all Investments only  
  Row 4: Total Pension value  
  Row 5: Grand Total (all items incl. Pension)

Comments box: free text, below totals.

\------------------------------------------------------  
7\. REVIEW / HISTORY VIEW  
\------------------------------------------------------  
\- Left/right buttons to step backwards/forwards through  
 past months  
\- Only providers with a non-zero value in that month shown  
\- Comments and totals shown alongside each month  
\- Small summary table: totals for the previous 3 months  
\- "Spreadsheet view" button: full last-12-months pivot table,  
 one column per month, one row per provider  
  - Providers active any time in the last year appear as  
   rows; months with no entry show £0

\------------------------------------------------------  
8\. GROWTH RATE (INVESTMENTS)  
\------------------------------------------------------  
\- Shown as a label to the right of the row, ONLY on the most  
 recent month's column  
\- Only calculated where a provider has 12 CONSECUTIVE monthly  
 entries — avoids a misleading rate from sparse data  
\- FTSE 100 growth rate calculated the same way, shown  
 alongside for quick performance comparison

\------------------------------------------------------  
9\. REPORTING / CHARTS  
\------------------------------------------------------  
Library: Chart.js (via CDN script tag, no build step)

\- Monthly totals trend (line chart): Grand Total + category  
 lines (Savings/Investments/Pension), with a SELECTABLE  
 date range (presets or picker — not fixed to 12 months)  
\- Pie chart — current allocation: grouping level (3 categories  
 vs per-provider vs toggle) TO BE DECIDED during build  
\- Investment growth vs FTSE 100 (line chart): visualises the  
 Section 8 comparison over time

\------------------------------------------------------  
10\. ARCHITECTURE  
\------------------------------------------------------  
\- Frontend: PWA (HTML/JS/CSS), installable via manifest +  
 service worker  
\- No framework (no React/Vue/build step) — plain JavaScript,  
 in keeping with minimal-maintenance approach  
\- Auth: Microsoft Identity Platform (MSAL.js) — OAuth2 for  
 OneDrive access  
  - Scope: Files.ReadWrite.AppFolder (restricts token to a  
   single dedicated app folder, NOT full OneDrive access)  
\- Storage: Single JSON file on OneDrive via Microsoft Graph  
 API (read-modify-write; dataset stays small)  
\- Encryption: Web Crypto API (AES-GCM), key derived from  
 user passphrase via PBKDF2/Argon2, never persisted to disk  
\- Charts: Chart.js

\------------------------------------------------------  
11\. SECURITY NOTES  
\------------------------------------------------------  
\- Passphrase-derived key only; data unrecoverable if lost —  
 plan a physical backup of the passphrase  
\- OAuth token and encryption key kept as separate secrets  
\- OneDrive OAuth scoped to app folder only (Section 10)  
\- Minimal third-party JS dependencies (reduce XSS surface)  
\- Verify ciphertext directly via OneDrive's web viewer  
\- Metadata (filename, size, timestamps) visible to Microsoft  
 regardless of encryption — acceptable given no account  
 numbers are stored

\------------------------------------------------------  
12\. DEVELOPMENT ENVIRONMENT & WORKFLOW  
\------------------------------------------------------  
\- IDE: VS Code (Windows) for all coding  
\- Language: HTML / CSS / vanilla JavaScript (no framework)  
\- Local dev server: VS Code "Live Server" extension  
  - Phase 1 (UI/logic build): serve at localhost (Chrome/  
   Windows) and via LAN IP for Safari on Mac/iPad — plain  
   HTTP is fine, no OAuth/service-worker testing yet  
  - Phase 2 (OAuth + PWA installability testing): tunnel  
   Live Server via ngrok or Cloudflare Tunnel to get a real  
   HTTPS URL (required for MS login flow + service workers).  
   Same URL works from Chrome/Windows and Safari/Mac/iPad.  
   Register this URL as the Azure app OAuth redirect URI.  
\- Debugging on iPad: use the Mac's Safari Web Inspector  
 (connect iPad via USB/Wi-Fi) for full console/network  
 visibility — removes the "debugging blind" risk. Desktop  
 Safari on the Mac (same WebKit engine) also useful for  
 quick iteration without the physical iPad.  
\- Apple developer account: not required for this project  
 (PWA install needs no signing) — noted as unused here.

\------------------------------------------------------  
13\. DEPLOYMENT (FINISHED APP)  
\------------------------------------------------------  
\- Static host required (no server-side logic — all logic  
 runs client-side, storage is via OneDrive API)  
\- Candidates: GitHub Pages, Cloudflare Pages, Netlify (all  
 free, all support private-repo deploys except GitHub Pages  
 free tier which requires public — use Cloudflare Pages or  
 Netlify if repo must stay private)  
\- Repo should be PRIVATE (provider list, OAuth client ID,  
 and UI logic shouldn't be public even though actual data  
 stays encrypted on OneDrive, not in the repo)  
\- Update Azure OAuth redirect URI to the permanent deployed  
 URL once hosting is live  
\- End result: one HTTPS link, opened identically in Chrome/  
 Windows and Safari/iPad, no dev machine dependency

\------------------------------------------------------  
14\. HISTORICAL DATA IMPORT  
\------------------------------------------------------  
\- Source: single-page spreadsheet (last full year), needs  
 cleaning first (provider names, dates, duplicates/gaps)  
\- Cleaning to be done with Claude ahead of build  
\- Output: cleaned CSV/JSON matching final data model  
  (including provider IDs/categories from Section 5)  
\- One-off import script/UI to bulk-load into the encrypted  
 OneDrive file

\------------------------------------------------------  
15\. DEVELOPMENT ESTIMATE  
\------------------------------------------------------  
Core build:  
 - PWA shell + provider table + entry form 1.5-2 days  
 - Provider setup/CRUD + Edit mode 1.5-2 days  
 - OneDrive OAuth (MSAL.js, AppFolder scope) 1-2 days  
 - Client-side encryption (Web Crypto API) 1 day  
 - Read-modify-write logic against OneDrive file 1 day  
 - Review view: paging, comments, 3-month summary,  
  spreadsheet/pivot view 2 days  
 - Growth-rate calculation (12-consecutive-month check,  
  FTSE comparison) 1 day  
 - Reporting/charts (Chart.js, date-range picker) 1-1.5 days  
 - Historical data import (once spreadsheet cleaned) 0.5-1 day

Polish & testing:  
 - Cross-device testing (iPad Safari, Windows Chrome) 1 day  
 - Edge cases (token refresh, first-run, bad passphrase) 0.5-1 day

TOTAL ESTIMATE: ~12-16.5 working days (spread flexibly)

\------------------------------------------------------  
16\. OPEN QUESTIONS / NEXT STEPS  
\------------------------------------------------------  
\[ \] Confirm full initial provider list is complete  
\[ \] Decide pie chart grouping level (categories vs per-  
   provider vs toggle)  
\[ \] Upload and clean historical spreadsheet (last 12 months)  
\[ \] Register Azure app (OAuth client ID, redirect URIs)  
\[ \] Choose static host (Cloudflare Pages or Netlify for  
   private-repo support)  
\[ \] Decide on PWA shell scaffold as first build step