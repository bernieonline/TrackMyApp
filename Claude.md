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

\## Current status  
Pre-build. Spec and dev plan finalised. 
see "D:\TrackMyApp 1.0\Dev Notes\Investments" for planning notes 


