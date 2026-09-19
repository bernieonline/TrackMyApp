MYBGACCOUNTS — SPECIFICATION ADDENDUM
SECTION 9 (REVISED) — REPORTING / CHARTS
======================================================
Status: Revised — supersedes original Section 9
Last updated: 2026-09-16

------------------------------------------------------
9.1 NAVIGATION TO CHARTS
------------------------------------------------------
- A "Reports" tab switches the page to the chart view
  (same page, same view-swap pattern as Entry/Review —
  NOT a separate browser window/tab, to avoid iPad PWA
  standalone-mode and cross-window data-sharing issues)
- Each row in the Entry/Review data table gets a small
  chart icon alongside its label. Clicking it jumps to
  the Reports view with that row (provider OR one of the
  5 Totals rows) pre-selected
- A dropdown at the top of the Reports view also lists
  all providers + all 5 Totals rows, for browsing without
  needing to go back to the data table first
- Both selection methods set the same underlying "selected
  row" state — not two separate mechanisms

------------------------------------------------------
9.2 TREND CHART (per selected row)
------------------------------------------------------
- Histogram (bar chart) of the monthly value for the
  selected row (provider or Totals row)
- Overlaid with a moving average line
  - Moving average window size: 3m is the default — with options to choose 6m and 12m ave
   number of months before build (e.g. 3-month rolling
   average). Not yet defined.
- Date range control:
  - Quick-select buttons: 3m / 6m / 12m
  - A date-range picker for custom ranges, in addition
   to the quick-select buttons, these will be drop down year and month, not a calendar selection
- When the selected date range exceeds 12 months, the
  chart switches from histogram+moving-average to a
  LINE GRAPH instead (better suited to longer ranges)
- Colour coding:
  - Savings-category rows: saving colour (per existing
   category dot colour, Section 6)
  - Investment-category rows: investment colour
  - Pension-category rows: pension colour
  - Any of the 5 Totals rows: a DISTINCT colour, separate
   from the three category colours above

------------------------------------------------------
9.3 GROWTH RATE (per selected row, per selected range)
------------------------------------------------------
- Simple calculation: % change between the FIRST and LAST
  value in the currently selected date range
- Deliberately NOT compounded/CAGR — true compounded
  return would require knowing contribution timing (when
  money was added vs when it grew), which isn't tracked.
  Simple first-vs-last change is honest and unambiguous
  for this app's purposes.
- This is a DIFFERENT calculation from the existing
  12-consecutive-month FTSE-comparison growth rate in
  Section 8 — that one stays as originally specified
  (gated on 12 consecutive months). This new one is a
  general-purpose rate for whatever range is selected here,
  with no consecutive-months gate — computed on whatever
  data exists within the selected range.
- Displayed prominently within the Reports view alongside
  the chart for the selected row

------------------------------------------------------
9.4 PIE CHARTS
------------------------------------------------------
Chart 1 — Category allocation:
  - % split of Savings / Investments / Pension
  - Defaults to most recent month
  - Option to select a different month

Chart 2 — Per-provider breakdown:
  - Two separate pie charts: one for Savings providers,
   one for Investment providers
  - Colour-coded per provider
  - Flyout/arrow on each slice showing the provider's
   value and % of that pie

------------------------------------------------------
9.5 ADDITIONAL ANALYTICS (agreed additions)
------------------------------------------------------
- Allocation drift over time: a stacked-area chart showing
  the % split (Savings/Investments/Pension) across months,
  rather than just a single most-recent-month snapshot.
  Reuses the same category totals already computed monthly
  for Section 6 — low additional cost.
- Best/worst performing provider: a simple call-out above
  the per-provider chart showing the top and bottom
  performing providers over the currently selected range
  (e.g. "Vanguard Bernard: +6.2%  |  Close Bros ISA Mary:
  -1.1%"), using the same simple growth-rate calc as 9.3.
- Net change per provider, shown in the Entry/Review table
  itself (NOT the Reports view): a small up/down arrow and
  £ delta versus the prior month, visible at a glance
  without opening Reports.
- Portfolio-wide return vs FTSE 100: a single summary figure
  ("Your total investments: +X% | FTSE 100: +Y%") tying
  together the existing per-provider vs FTSE comparison
  (Section 8) into one headline number.

Explicitly OUT OF SCOPE (agreed to skip, to stay pragmatic):
  - Inflation-adjusted values
  - Goal/target projections
  - Compounded/CAGR return calculations

------------------------------------------------------


