  Stage 6 Testing Program — Growth Rates & Charts
                                                                                 
  Prerequisites                                                                  
                                                                                 
  - Open https://bernieonline.github.io/TrackMyApp/                              
  - Sign in and unlock with your passphrase so data loads from OneDrive
  - You need at least 2-3 months of data for most charts to work properly

  ---
  1. Reports Tab Navigation

  - Click the Reports tab — the reports view should appear
  - Click Entry and Review tabs to confirm you can switch back and forth
  - Reports tab should remember its state when you return to it

  2. Row Selector (dropdown)

  - Dropdown should show Totals group at the top (Grand Total, Savings +
  Investments, Savings only, Investments only, Pension)
  - Below totals, providers should be grouped by category (Saving, Investment,
  Pension, Index)
  - Default selection should be Grand Total
  - Change selection to a specific provider — trend chart and growth callout
  should update immediately
  - Change to each totals row — verify chart updates each time

  3. Trend Chart (bar/line chart)

  - With 12 months or fewer: displays as bar chart with a dashed red moving
  average line
  - With more than 12 months: switches to a line chart with shaded area fill
  - Y-axis shows £ values with commas
  - Hover/tap a bar or point — tooltip shows £X,XXX formatted value
  - Chart is responsive — resize browser window, chart should adapt

  4. Date Range Buttons (3m / 6m / 12m / Custom)

  - 12m is active (highlighted) by default
  - Click 3m — chart shows only last 3 months, button highlights
  - Click 6m — chart shows last 6 months
  - Click Custom — month/year dropdowns appear
  - Custom range: set a start and end month — chart updates to that range
  - Try setting end before start — it should auto-correct (end snaps to start)
  - Switch back to 12m — custom fields should hide

  5. Moving Average Controls (3m / 6m / 12m)

  - 3m active by default — dashed red line on chart is a 3-month moving average
  - Click 6m — moving average line recalculates (fewer points will have values)
  - Click 12m — only the 12th month onward will show MA values
  - MA line should appear in the legend as "Xm Avg"

  6. Growth Rate Callout

  - Shows above the trend chart as a coloured banner
  - Positive growth: green with ▲ +X.X% and £start → £end
  - Negative growth: red with ▼ -X.X%
  - Select a provider with no data — shows "Insufficient data for growth rate"
  - Verify the percentage is correct: (end - start) / start × 100

  7. Category Allocation Pie Chart

  - Shows a pie with three slices: Savings (green), Investments (blue), Pension
  (purple)
  - Month selector dropdown lists all months with data (most recent first)
  - Change month — pie updates with that month's category totals
  - Hover a slice — tooltip shows £X,XXX (XX.X%)

  8. Provider Breakdown Pies

  - Two pie charts: Savings Providers and Investment Providers
  - Each shows individual providers within that category, using shaded colour
  variants
  - Providers with £0 are excluded from the pie
  - If a category has no data, shows a grey "No data" placeholder
  - Hover — tooltip shows provider name, £ value, and percentage

  9. Allocation Over Time (Stacked Area Chart)

  - Shows savings %, investments %, pension % stacked to 100%
  - Uses the same date range as the trend chart (3m/6m/12m/custom)
  - Y-axis goes to 100% with % labels
  - Colours match category colours (green, blue, purple)
  - With less than 2 months of data — chart should not render

  10. Best/Worst Provider Callout

  - Shows two cards: Best (highest growth %) and Worst (lowest growth %)
  - Growth calculated over the selected date range
  - Index providers are excluded from comparison
  - With less than 2 providers with data — callout is empty
  - Best shows green percentage, worst shows red

  11. FTSE Comparison

  - Only appears if you have an Index category provider (e.g. FTSE 100)
  - Shows three values: Your Investments growth %, Index growth %, Difference in
  percentage points
  - Positive difference (outperforming) shown in green
  - Negative difference (underperforming) shown in red
  - If no Index provider exists — section is empty
  - If insufficient data — shows "Insufficient data for comparison"

  12. Cross-Device Testing

  - Test on iPad Safari — all charts render, touch scrolling works
  - Test on Windows Chrome — charts render at full width
  - Pie charts and trend charts should be touch-friendly (tap for tooltips)

  13. Edge Cases

  - With no data at all — Reports view should show empty charts gracefully, no JS
   errors
  - With only 1 month of data — trend chart shows single bar, growth says
  insufficient data, drift chart hidden
  - Open browser console (F12) — confirm no errors during all interactions above

  ---
  Work through each section and let me know if anything doesn't behave as
  expected.