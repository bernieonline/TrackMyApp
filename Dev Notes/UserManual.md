# TrackMyApp - User Manual


## Overview


TrackMyApp is a personal finance tracking application for recording monthly savings, investment, and pension balances. By entering your provider balances each month, the app builds a historical record that reveals trends, growth rates, and allocation changes over time.


The app runs entirely in your web browser -- there is no server-side processing and no traditional installation. Your financial data is encrypted before it leaves your device and is stored as a single encrypted file on your personal OneDrive. Nobody -- not Microsoft, not GitHub, not anyone who accesses the source code -- can read your data without your passphrase.


TrackMyApp is designed for use on **PC (Chrome)** and **iPad (Safari)**. It also works on Mac browsers.


### Running the App


Open the following URL in your browser:


**https://bernieonline.github.io/TrackMyApp/**


There is nothing to install. On iPad you can use Safari's "Add to Home Screen" option to create a shortcut that opens the app like a native application.


### Technical Architecture


For a detailed explanation of how the app uses Azure, GitHub Pages, and OneDrive, see the separate document **Azure-Github Notes.md** included with the project files.


---


## Signing In


When you first open the app you will see a **Sign In** button in the top-right corner of the header.


1. Tap **Sign In** -- a Microsoft login popup will appear.
2. Sign in with your personal Microsoft account (the same account linked to your OneDrive).
3. On first use, Microsoft will ask you to grant the app permission to read and write files on your OneDrive. Accept this.
4. The app will download your encrypted data file from OneDrive (or create one if this is your first time).
5. You will be prompted to enter your **passphrase** to decrypt the data (see Security below).


Once signed in, your name appears in the header and the lock indicator changes from "Locked" to "Unlocked".


To **sign out**, tap the **Sign Out** button that replaces the Sign In button after authentication. Any unsaved changes remain in your local browser draft. You must click Save before signing out. Just to be clear, as you enter data it is saved locally but only gets written to OneDrive when SAVE is clicked.


---


## Security and Your Passphrase


All data is encrypted in your browser using AES-256-GCM encryption before it is uploaded to OneDrive. Your passphrase is the key to this encryption and **never leaves your device**. Neither Microsoft, GitHub, nor anyone else can decrypt your data without it. You cant read the file in OneDrive. As a backup see the Export option where Json records are written to text files. Establish a habit for doing this.


**Important**: There is no password reset facility. If you forget your passphrase, your data cannot be recovered.


### Setting a Passphrase


- On first use, you will be asked to create a passphrase. Choose something memorable but strong.
- The passphrase is used to derive an encryption key using PBKDF2 with 600,000 iterations, making brute-force attacks impractical.


### Changing Your Passphrase


- Tap the **Passphrase** button in the header.
- If you are already unlocked, you will be asked for your current passphrase and then a new one.
- If you are signed in to OneDrive, the data file will be re-encrypted with the new passphrase and saved automatically.


### Lock Indicator


The header shows a lock indicator:
- **Locked** -- no passphrase has been entered this session; data cannot be read or saved.
- **Unlocked** -- your passphrase is active and data is accessible.


---


## The Entry Page


When you open the app, the Entry page is displayed. This is where you record your current monthly balances. The page has the following components:


### Header Controls


- **Sign In / Sign Out** -- Authenticate with your Microsoft account (see Signing In above).
- **Passphrase** -- Enter or change your encryption passphrase.
- **Lock Indicator** -- Shows whether the session is locked or unlocked.


### View Tabs


Below the header are three tabs:


- **Entry** -- The data entry page (shown by default).
- **Review** -- A read-only view for browsing historical records.
- **Reports** -- Charts and analytics.


Alongside the tabs:


- **Save** -- Encrypts your data and saves it to OneDrive. You must be signed in and unlocked. A brief "Saved" confirmation appears on success.
- **Export** -- Downloads a decrypted copy of all your data as a JSON file. Useful for backup or for viewing your raw data outside the app.


### Month and Year Selectors


Use the **Month** and **Year** dropdown selectors to choose which period to work with:


- **To enter data for a new month**: Select the month and year. An empty page will be generated. Enter your balances and tap Save.
- **To edit a previous month**: Select that month and year. The existing data for that period will load. Make your changes and tap Save.


The app automatically defaults to the most logical month: if a record exists for the previous month it defaults to the current month; otherwise it defaults to the previous month.


### The Edit Button


Tap **Edit** to enter edit mode. In this mode:


- **Show/hide providers**: Each provider row displays a checkbox. Tick the providers you want to appear on your entry page; untick those you want to hide. Hidden providers are not deleted -- their historical data is preserved and they still appear in Review mode where data exists.
- **Rename providers**: Provider names become editable text fields in edit mode. Change the name as needed. Internally each provider is tracked by a unique ID, so renaming is safe -- all historical data remains linked correctly and the new name will appear across all views including past months. This is useful for correcting typos or reflecting provider rebranding (e.g. "Scottish Widows" to "Schroders"). Note that the old name will no longer appear anywhere; if you need to preserve the distinction, create a new provider instead.
- **View categories**: Each provider's category (Saving, Investment, Pension, Index) is displayed. Categories cannot be changed after creation because historical totals and reports depend on the category classification.
- **Cash flow adjustments**: A "Cash flow" column appears for Pension and Investment providers:
  - **Pension providers** -- Enter the monthly gross withdrawal amount (e.g. a regular pension drawdown). This figure is used in the Reports charts to show an adjusted trend line reflecting what the pot value would have been had the withdrawal not occurred. This is an indicator of real investment performance rather than the declining balance caused by regular income.
  - **Investment providers** -- Enter any cash additions (positive) or withdrawals (negative) for the selected month. This works the same way, allowing the charts to show performance independent of money flowing in or out.


  The adjustment is not corrected for lost interest but provides a useful indicator of underlying performance.


Tap **Done** when finished editing.


### Add Provider


Tap **Add Provider** to create a new provider entry:


1. Enter a **Provider Name** (e.g. "Barclays ISA").
2. Select a **Category**:
   - **Saving** -- Bank accounts, cash ISAs, savings accounts.
   - **Investment** -- Stocks and shares ISAs, investment platforms.
   - **Pension** -- Pension pots and drawdown accounts.
   - **Index** -- Market indices such as FTSE 100 (entered manually for comparison purposes).
3. Tap **Add**.


Providers are colour-coded by category on the entry page. You cannot change a provider's category after creation -- if needed, create a new provider with the correct category instead.


### Entering Data


Each active provider is listed with a value input field:


- Enter the current balance (in pounds) for each provider.
- Press **Tab** or **Enter** to move to the next field.
- A small change indicator arrow appears next to each value showing the movement since the previous month (green up arrow for gains, red down arrow for losses).
- A small chart icon appears on each row -- tap it to jump directly to the Reports view for that provider.


### Totals


Below the provider list, the following totals are calculated automatically:


- **Savings + Investments** -- Combined total of all Saving and Investment providers.
- **Savings only** -- Total of Saving providers.
- **Investments only** -- Total of Investment providers.
- **Pension** -- Total of Pension providers.
- **Grand Total** -- Sum of all providers (excluding Index entries).


Each total row also has a chart icon to jump to its trend report.


### Comments


Below the totals is a **Comments** text box where you can record any notes about the month's activity -- income, expenditure, significant events, or anything else relevant.


---


## The Review Tab


Tap the **Review** tab to switch to a read-only view of your historical data.


### Month Navigation


The heading shows the currently displayed month with **Prev** and **Next** buttons to scroll backwards and forwards through your records.


### Provider List


All providers that had data entered for the displayed month are shown, including providers that have since been hidden from the Entry page. This ensures you always have a complete picture of any historical month.


### Totals and Comments


The same totals breakdown and any comments recorded for that month are displayed below the provider list.


### 3-Month Summary


Below the comments is a summary table showing the savings totals for the current month and the two preceding months, giving a quick snapshot of recent trends.


### Spreadsheet View


Tap the **Spreadsheet View** button to open a horizontally scrollable table displaying the last 12 months of data. This pivot table shows all providers as rows with monthly columns, complete with totals. The provider column and header row remain fixed while you scroll. Tap **Close Spreadsheet** to return to the standard review layout.


---


## Reports


Tap the **Reports** tab to view charts and analytics for your data.


### Selecting What to Display


At the top is a **Show** dropdown that lets you select which data series to chart. You can choose any individual provider or any of the totals rows (Savings + Investments, Savings only, Investments only, Pension, Grand Total).


### Date Range


Below the selector are quick date-range buttons:


- **3m** -- Last 3 months.
- **6m** -- Last 6 months.
- **12m** -- Last 12 months (default).
- **Custom** -- Opens month/year selectors for both start and end dates, giving you full control over the range.


### Growth Indicator


Below the date range is a callout showing the change between the first and last values in the selected range, expressed as both a monetary amount and a percentage growth figure.


### Trend Chart


The main chart displays your selected data as a **bar chart** overlaid with a **moving average** trend line. Below the chart are toggle buttons to change the moving average period:


- **3m** -- 3-month moving average (default).
- **6m** -- 6-month moving average.
- **12m** -- 12-month moving average.


#### Adjusted Trend Line


If you have entered cash flow adjustments for the selected provider (pension drawdowns or investment additions/withdrawals), a **Show adjusted** button appears. Tapping it overlays a second trend line on the chart showing the adjusted values -- i.e. what the balance would have been without the cash flows. This helps you assess genuine investment performance separately from the impact of money moving in or out.


### Pie Charts


Below the trend chart are pie charts for the selected period:


- **Category Allocation** -- Shows how your total is split across Saving, Investment, and Pension categories for a selected month (with its own month selector).
- **Provider Breakdown** -- Two separate pie charts break down the individual providers within the Savings category and the Investments category.


### Allocation Over Time


A **stacked bar chart** shows how the total allocation across categories has changed month by month over the selected range. Each bar represents a month, with coloured segments for Savings, Investments, and Pensions.


### Best and Worst Performers


Below the allocation chart is a callout identifying the **best performing** and **worst performing** providers over the selected period, based on percentage change.


### FTSE 100 Comparison


At the bottom of the Reports page, your portfolio performance is compared against the FTSE 100 index change over the same period (provided you have been entering FTSE 100 values as an Index provider). This gives you a benchmark to assess how your investments are performing relative to the market.


---


## Tips and Notes


- **Regular saving**: The app works best when you enter data consistently each month. Even approximate values are better than gaps.
- **Local draft**: Your data is automatically saved to your browser's local storage as you type, so you won't lose work if you accidentally close the tab. However, this draft is only on the device you're using -- tap **Save** to persist to OneDrive so the data is available on all your devices.
- **Conflict detection**: If the OneDrive file has been modified by another device since you loaded it, the app will warn you rather than silently overwriting those changes.
- **Index providers**: The FTSE 100 (or any other index) is entered manually like any other provider. The app does not fetch live market data.
- **Export regularly**: Use the Export button periodically to keep a decrypted backup of your data in JSON format.



