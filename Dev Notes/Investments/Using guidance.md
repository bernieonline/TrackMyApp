Using guidance

Based on how you've worked with Claude Code before (the staged-milestone model from Desktop Workspaces), here's the shape I'd suggest carrying over to MyBGAccounts:

**1\. Work in small, verifiable stages — you already do this well**  
Your Desktop Workspaces approach (API proof → persistence → minimal UI → expansion → automation) is the right pattern here too. For MyBGAccounts, something like: provider table + entry form (no OneDrive yet) → encryption round-trip in isolation → OneDrive read/write → edit mode → review/pivot views → charts. Each stage has a clear "does this work" checkpoint before moving on, so Claude Code never gets more than one stage ahead of something you've actually verified.

**2\. Use Plan Mode before letting it touch files**  
For anything non-trivial, ask Claude Code to plan first (it has a read-only planning mode) rather than diving straight into edits. You review the plan, correct anything off-base, *then* let it implement. This is the main lever for retaining control without slowing things down much — catching a wrong approach at the plan stage costs a minute; catching it after 200 lines of code costs more.

**3\. Review diffs, don't just accept**  
Ask it to show you what changed after each meaningful step rather than batching many changes into one giant review. Given your comment preference for unfamiliar libraries (Web Crypto API, MSAL.js, Chart.js are all likely new to you), explicitly remind it of that preference in your CLAUDE.md or early prompt — it should already be generous with "why" comments on non-obvious calls, but worth reinforcing on the OAuth/crypto sections especially, since that's where a misunderstood parameter has real consequences.

**4\. Keep git commits granular**  
A commit per working stage (not per file, not one giant commit at the end) gives you cheap rollback points. If a later change breaks something, you're reverting one stage, not untangling a week of work.

**5\. Let Claude Code write its own tests where it makes sense**  
Especially for the growth-rate calculation (12-consecutive-month logic) and the totals math — these have clear right/wrong answers, so having it write a few test cases as it builds catches regressions automatically rather than you manually re-checking totals every session.

**6\. Model/effort escalation, not default-high**  
Per the earlier discussion: run Opus 5 at default effort for most of this. If something is clearly stuck (same bug survives two fix attempts, or a design decision keeps flip-flopping), that's your signal to either bump effort or hand that one piece to Fable — not something to pre-emptively reach for.

**7\. Reference your docs explicitly, don't assume it'll find them**  
Since Specification.md and DevelopmentPlan.md live in the project folder, tell it to read them at the start of a session rather than relying on it noticing — CLAUDE.md points to them, but an explicit "check Specification.md section 8 before implementing growth rate" at the point of use avoids it improvising against stale assumptions if it's working from a compacted context.

The overall principle: you set the destination and check the map at each junction (plan mode, staged commits, diff review); Claude Code drives between junctions. That's roughly what worked for Desktop Workspaces, and nothing about MyBGAccounts changes the shape of it.