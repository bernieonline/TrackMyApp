# User Manual — Issues & Improvements

## Open Items

### 1. Forgotten passphrase — recovery approach agreed
**Problem**: If the user forgets their passphrase, all encrypted data
is unrecoverable AND the app becomes unusable — the existing OneDrive
file cannot be decrypted or overwritten with a fresh dataset.
There is no recovery path and no way to start over.

**Agreed design**:

*Auto local backup*
- On every Save to OneDrive, silently write a decrypted JSON backup
  to localStorage or IndexedDB on the device
- No user action required — always keeps a recent copy available
- Tied to the device and browser; lost if browser data is cleared

*Wipe and restart*
- If passphrase is forgotten, user re-authenticates with Microsoft
- App offers to delete the encrypted OneDrive file and start fresh
  with a new passphrase
- Prevents the app from being permanently bricked

*Restore from backup*
- After a wipe, user can import from the local auto-backup if
  available, or from a previously downloaded manual export file
- Data is restored under the new passphrase

*Manual export unchanged*
- Export button remains for downloading a JSON file the user can
  store externally (second device, USB, cloud folder, etc.)

*Manual guidance*
- User manual to strongly recommend storing the passphrase in a
  password manager or written down securely
- Emphasise regular manual exports as an additional safety net

**Status**: Agreed — ready to build

### 2. Cash flow adjustments — redesign agreed
**Problem**: Pension withdrawals are stored as a single fixed amount on
the provider object, applied uniformly to every month in the chart.
If the withdrawal amount changes over time (e.g. annual increase),
there is no way to record the old rate — the current value overwrites
history. Investment cash flows are already per-month but this isn't
obvious to the user, and the two provider types behave inconsistently.
Cash flow values are currently only accessible in Edit mode, making
them invisible during normal data entry and review.

**Agreed design**:

*Data model*
- Both pension and investment cash flows stored per-month in the
  entry's cashFlows object (pension moves off the provider object)
- Pension: auto-populates new months with previous month's value
  (carry forward); user overrides when the amount changes
- Investment: defaults to zero each month; user enters the net
  figure manually (e.g. £500 in and £200 out = enter £300)
- Historical records: user will backfill manually

*Entry page*
- Each Investment/Pension provider row gets a small "Add/Withdraw"
  toggle button that reveals a cash flow input field on that row
- Field is hidden by default to keep the page clean; toggle state
  does not persist (UI convenience only)
- No changes to totals rows — totals remain pure balance figures

*Review page*
- Where a non-zero cash flow exists for a month, show it as a
  secondary indented line within the provider row:
    Provider Name          £45,000  ▲
      Add/Withdraw            £500
- Muted styling, only appears when data exists
- Totals remain unchanged — cash flows are context for explaining
  sudden changes, not part of the balance picture

*Reports*
- No change needed — calculateAdjustedGrowth, best/worst performers,
  and FTSE comparison already use per-month cash flow data; they will
  automatically pick up the new pension per-month values once migrated

**Status**: Agreed — ready to build

### 3. Spreadsheet view limited to last 12 months
**Limitation**: The spreadsheet/pivot view is hardcoded to show only
the last 12 months of data. Once the dataset grows beyond 12 months,
earlier records are not accessible in this view (they remain visible
via the Review tab's month-by-month navigation).

**Consideration**: A date range selector or paging control could be
added in a future version to allow browsing the full history in
spreadsheet format.

**Status**: Further consideration
