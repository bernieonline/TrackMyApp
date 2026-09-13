---
title: Specification.md
updated: 2026-09-12 11:54:14Z
created: 2026-09-12 11:13:18Z
latitude: 53.48095160
longitude: -2.23743270
altitude: 0.0000
---

&nbsp;

MYBGACCOUNTS — SAVINGS & INVESTMENTS TRACKER  
PLAN & SPECIFICATION (v2)  
\======================================================  
Status: Draft  
Last updated: 2026-09-12

\------------------------------------------------------  
1\. OVERVIEW  
\------------------------------------------------------  
App name: MyBGAccounts  
A Progressive Web App (PWA) for monthly logging and review  
of savings, investment, and pension balances across multiple  
providers. Data is encrypted client-side and stored as a  
single file on OneDrive. Runs on iPad (Safari, Add to Home  
Screen) and Windows (browser). Online-only — no offline  
support required.

\------------------------------------------------------  
2\. GOALS  
\------------------------------------------------------  
\- Quick monthly data entry via a provider table  
\- Review mode: page back through historical months  
\- Category-based totals (Savings / Investments / Pension)  
\- Growth-rate comparison for investments vs FTSE 100  
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

\------------------------------------------------------  
4\. DATE DEFAULTING LOGIC  
\------------------------------------------------------  
On load, default Month/Year to:  
  - Current month, IF a record already exists for the  
   previous month  
  - Otherwise, default to the previous month  
This is self-correcting: once the previous month is filled  
in, the app naturally offers the current month next time.  
Easy to adjust later if a fixed-day cutoff is preferred.

\------------------------------------------------------  
5\. PROVIDERS  
\------------------------------------------------------  
\- Each provider is assigned a unique ID at setup time.  
 The ID (not the display label) is the permanent link to  
 historical entries.  
\- Fields per provider:  
  - id (internal, permanent)  
  - label (display name, editable in Edit mode)  
  - category (Investment / Saving / Pension — FIXED  
               for life; see below)  
  - active (boolean — unchecking hides it from new  
               entries, but historical months still show it)  
\- Category is set once at creation and NEVER changed. If a  
 provider's category needs to change, a NEW provider is  
 created instead (e.g. keeps historical totals meaningful  
 and avoids retroactive recalculation).  
\- FTSE 100 is modelled as a provider with category "Index",  
 entered manually each month like any other value. Avoids  
 needing an external market-data API.

Initial provider list (category in brackets):  
  1. Natwest Current (Saving)  
  2. Natwest Credit Card (Saving)  
  3. Starling (Saving)  
  4. Close Bros ISA Mary (Saving)  
  5. Close Bros ISA Bernard (Saving)  
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
  - Category NOT editable once set (Section 5)

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
\- Only providers with a non-zero value in that month are  
 displayed (per the original spec — "featured" providers)  
\- Comments and totals shown alongside each month  
\- Small summary table: totals for the previous 3 months  
\- "Spreadsheet view" button: full last-12-months table,  
 one column per month, one row per provider (pivot-style)  
  - Providers active any time in the last year appear as  
   rows; months with no entry for that provider show £0

\------------------------------------------------------  
8\. GROWTH RATE (INVESTMENTS)  
\------------------------------------------------------  
\- Displayed as a label to the right of the row, ONLY on the  
 most recent month's column (not repeated on every column  
 when viewing history)  
\- Only calculated/shown where a provider has 12 CONSECUTIVE  
 monthly entries — avoids a misleading rate from sparse data  
\- FTSE 100 growth rate calculated the same way, shown  
 alongside investment rows for quick performance comparison  
 against a tracker benchmark

\------------------------------------------------------  
9\. ARCHITECTURE (unchanged from v1)  
\------------------------------------------------------  
\- Frontend: PWA (HTML/JS/CSS), installable via manifest +  
 service worker  
\- Auth: Microsoft Identity Platform (MSAL.js) — OAuth2 for  
 OneDrive access  
\- Storage: Single JSON file on OneDrive via Microsoft Graph  
 API (read-modify-write; dataset stays small)  
\- Encryption: Web Crypto API (AES-GCM), key derived from  
 user passphrase via PBKDF2/Argon2, never persisted to disk

\------------------------------------------------------  
10\. SECURITY NOTES (unchanged from v1)  
\------------------------------------------------------  
\- Passphrase-derived key only; data unrecoverable if lost —  
 plan a physical backup of the passphrase  
\- OAuth token and encryption key kept as separate secrets  
\- Minimal third-party JS dependencies (reduce XSS surface)  
\- Verify ciphertext directly via OneDrive's web viewer  
\- Metadata (filename, size, timestamps) visible to Microsoft  
 regardless of encryption — acceptable given no account  
 numbers are stored

\------------------------------------------------------
11\. DATA INTEGRITY & RECOVERY (from Suggestions.md)
\------------------------------------------------------
11a. Concurrent-edit protection
  - Before uploading, check the OneDrive file's ETag against
   what was loaded. If it has changed, warn the user to reload
   rather than silently overwriting.

11b. Draft autosave
  - Save in-progress form data to browser localStorage as the
   user types. Clear only after a successful OneDrive save.
   Protects against token expiry, accidental tab close, or
   app switch on iPad.

11c. Export decrypted data
  - "Export" button (behind passphrase) to download the full
   dataset as decrypted JSON or CSV. Ensures the user is
   never locked into this specific app.

11d. Passphrase rotation
  - Menu option to change passphrase: decrypt with old key,
   re-encrypt with new key in a single operation.

\------------------------------------------------------
12\. HISTORICAL DATA IMPORT — DEFERRED
\------------------------------------------------------  
\- Source: single-page spreadsheet (last full year), needs  
 cleaning first (provider names, dates, duplicates/gaps)  
\- Cleaning to be done with Claude ahead of build  
\- Output: cleaned CSV/JSON matching final data model  
  (including provider IDs/categories from Section 5)  
\- One-off import script/UI to bulk-load into the encrypted  
 OneDrive file

\------------------------------------------------------
13\. DEVELOPMENT ESTIMATE  
\------------------------------------------------------  
NOTE: This is larger in scope than the original simple entry  
form — provider CRUD, edit mode, review paging, pivot view,  
and growth-rate logic add real build time. Rough estimate:

Core build:  
 - PWA shell + provider table + entry form 1.5-2 days  
 - Provider setup/CRUD + Edit mode (labels, hide,  
  value correction) 1.5-2 days  
 - OneDrive OAuth (MSAL.js) 1-2 days  
 - Client-side encryption (Web Crypto API) 1 day  
 - Read-modify-write logic against OneDrive file 1 day  
 - Review view: paging, comments, 3-month summary,  
  spreadsheet/pivot view 2 days  
 - Growth-rate calculation (12-consecutive-month check,  
  FTSE comparison) 1 day  
 - Historical data import (once spreadsheet cleaned) 0.5-1 day

Polish & testing:  
 - Cross-device testing (iPad Safari, Windows browser) 1 day  
 - Edge cases (token refresh, first-run, bad passphrase) 0.5-1 day

REVISED TOTAL ESTIMATE: ~11-15 working days

\------------------------------------------------------
14\. OPEN QUESTIONS / NEXT STEPS  
\------------------------------------------------------  
\[ \] Confirm full initial provider list is complete  
\[ \] Upload and clean historical spreadsheet (last 12 months)  
\[ \] Decide on Windows-first build/test approach for speed  
\[ \] Decide on PWA shell scaffold as first build step