A few things worth adding to the spec before you start building — none huge, but each is the kind of gap that's much cheaper to design in now than retrofit later:

**1\. Concurrent-edit protection (relevant because you'll use both iPad and Windows)**

- If you open the app on iPad, then also open it on Windows before saving, the "last write wins" pattern in Section 9 means one device could silently overwrite the other's changes.
- Cheap fix: before uploading, check the OneDrive file's ETag/last-modified timestamp against what you loaded. If it's changed since, warn ("data has changed since you loaded it — reload before saving") rather than silently clobbering it.

**2\. Draft autosave for the entry form**

- If your OAuth token expires mid-entry, or you accidentally close the tab/switch apps on iPad, you could lose a half-filled-in month's data with no warning.
- Simple fix: save the in-progress form to browser local storage as you type, independent of the OneDrive round-trip, and clear it only after a successful save. Costs almost nothing to build, saves real annoyance.

**3\. A "get my data out" escape hatch**

- Right now the only way to read your data is through this specific app. A simple "export decrypted JSON/CSV" button (behind your passphrase, obviously) means you're never locked into the tool — useful if you ever want to open the numbers in a spreadsheet, or if the app itself needs rebuilding down the line.

**4\. Passphrase rotation**

- No mechanism yet for changing your passphrase if you want to. Since the key is derived from it, changing it means decrypting with the old one and re-encrypting with the new one in a single operation — worth having as a menu option now rather than realizing you're stuck with your first choice.

**5\. Backup safety net beyond OneDrive's own versioning**

- OneDrive does keep file version history natively, which gives you some protection against a bad overwrite — but it's worth explicitly relying on that (know how to restore a previous version from the OneDrive web UI) rather than assuming the app itself needs to reinvent it.

**6\. FTSE comparison caveat (minor, just a documentation note)**

- Comparing raw index points won't capture dividend reinvestment the way a real FTSE tracker fund would (total return vs price return). Not worth building around, but worth a one-line note in the app or spec so future-you isn't confused why the "FTSE growth rate" doesn't quite match a fund factsheet.

Nothing here changes the architecture — items 1–4 are each maybe an hour or two of extra work, item 5 is just a documentation note, and item 6 is free. I'd fold 1–4 into Specification.md as a short "Data integrity & recovery" section if you want them treated as first-class requirements rather than things Claude Code might skip if not explicitly asked for.