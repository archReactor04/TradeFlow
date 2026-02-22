---
title: Importing Broker CSVs
nav_order: 1
parent: Guides
---

# Importing Trades from Broker CSVs

This guide walks you through importing trades from your broker's CSV export into TradeFlow.

## Step 1: Export from Your Broker

### TopstepX

1. Log in to your TopstepX account
2. Navigate to the trade history or performance section
3. Export your trades as CSV
4. Save the file to your computer

TopstepX exports contain one row per completed trade with symbol, direction, entry/exit prices, P&L, and timestamps.

### Tradovate

1. Log in to your Tradovate account
2. Go to **Performance** or **Trade History**
3. Export the order fills as CSV
4. Save the file to your computer

Tradovate exports individual order fills (each buy/sell), not completed trades. TradeFlow automatically reconstructs trades from these fills.

## Step 2: Open Bulk Import

Navigate to **Bulk Import** in the TradeFlow sidebar.

## Step 3: Select Your Broker

Choose your broker from the dropdown at the top of the page:
- **TopstepX** — for TopstepX CSV exports
- **Tradovate** — for Tradovate order fill exports

This determines which parser is used to interpret the CSV columns.

## Step 4: Upload the CSV

Click the upload area or drag-and-drop your CSV file. TradeFlow will:
1. Read the file and detect column headers
2. Parse each row according to the selected broker format
3. Display a preview table of all detected trades

### For Tradovate Files

TradeFlow performs additional processing:
- **FIFO Position Reconstruction** — Matches buy and sell fills to form complete trades
- **Contract Multiplier Lookup** — Uses hardcoded multipliers for futures (ES=$50, NQ=$20, etc.) to calculate dollar P&L
- **Duration Calculation** — Computes time from first entry to last exit

## Step 5: Select an Account

Use the **Import to Account** dropdown to assign all imported trades to a specific trading account. If you haven't created accounts yet, go to the [Accounts page]({{ site.baseurl }}/features/accounts) first.

## Step 6: Handle Scale-Outs

If you scaled out of positions, you may see multiple rows for what was logically one trade. To merge them:

1. **Check the boxes** next to the trades you want to combine
2. Click the **Merge** button
3. TradeFlow creates a single trade with:
   - The original entry price from the first trade
   - Multiple **take-profit levels** — each partial exit becomes a TP entry with price, quantity, and date
   - Combined P&L from all partials

{: .tip }
> **Tip**
> Only merge trades that are truly the same position. Don't merge separate trades in the same symbol that happened at different times.

## Step 7: Review and Import

Review the preview table to verify the data looks correct:
- Check that symbols, directions, and P&L values match your broker records
- Verify that merged trades have the correct take-profit levels

Click **Import** to save all trades to your database. They immediately appear in:
- **Trade Log** — as individual trade entries
- **Dashboard** — reflected in all charts and KPI cards

## Troubleshooting

### Trades showing $0 P&L for Tradovate imports

The most likely cause is an unrecognized futures contract. TradeFlow uses a hardcoded multiplier table. If your contract isn't in the table, P&L defaults to the raw price difference without the multiplier.

### Duplicate trades after re-importing

TradeFlow does not automatically de-duplicate CSV imports. If you import the same CSV file twice, you'll get duplicate trades. Delete the duplicates from the Trade Log, or use selective deletion via the Actions menu.

### Missing columns in preview

Ensure you selected the correct broker. TopstepX and Tradovate CSVs have different column structures, and using the wrong parser will result in missing or incorrect data.
