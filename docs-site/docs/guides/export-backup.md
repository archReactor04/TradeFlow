---
sidebar_position: 2
title: Export & Backup
---

# Exporting and Backing Up Your Data

TradeFlow provides two export formats: CSV for spreadsheet analysis and ZIP snapshots for full data portability.

## CSV Export

### What's Included
- All trade fields in tabular format
- Strategy and account names (resolved from IDs)
- Tags as comma-separated values
- Fees, commissions, and duration

### What's NOT Included
- Chart images (CSV is text-only)
- Take-profit sub-records
- Database IDs

### How to Export

1. Go to the **Trade Log**
2. Click the **Actions** dropdown button
3. Choose one of:
   - **Export CSV (all)** — exports all trades (or all filtered trades if filters are active)
   - **Export Selected CSV** — exports only the trades you've selected via checkboxes

A `.csv` file downloads to your computer that can be opened in Excel, Google Sheets, or any spreadsheet application.

## ZIP Database Snapshot

The ZIP snapshot is TradeFlow's full backup format. It preserves everything including chart images.

### What's Included

The `.zip` file contains:

```
TradeFlow-backup-YYYY-MM-DD.zip
├── manifest.json          # Metadata: version, date, counts
├── data/
│   ├── trades.json        # All trades (image data replaced with filenames)
│   ├── accounts.json      # All accounts
│   └── strategies.json    # All strategies
└── images/
    ├── <tradeId>-0.jpg    # First chart image for a trade
    └── <tradeId>-1.jpg    # Second chart image for a trade
```

- **Images are extracted** from the base64 data and stored as separate JPEG files for efficiency
- **Trade records reference** image filenames instead of containing the base64 data
- **Manifest** records the backup version, creation date, and record counts

### How to Create a Backup

1. Go to the **Trade Log**
2. Click the **Actions** dropdown button
3. Choose one of:
   - **Full Backup (.zip)** — exports the entire database
   - **Export Selected Backup** — exports only selected trades (with their images, plus all accounts and strategies)

### Exporting Selected Trades

1. Select trades using the checkboxes in the Trade Log
2. The Actions button shows a badge with the selection count
3. Choose **Export Selected CSV** or **Export Selected Backup**
4. Only the selected trades are included in the export

## Restoring from a Backup

### For Your Own Data

1. Go to **Bulk Import**
2. In the **Restore Backup** section at the top, select your `.zip` file
3. The manifest details are displayed (trade count, accounts, strategies)
4. Click **Import**

The restore uses **merge-only** mode:
- New records are added
- Records with matching IDs are skipped (no duplicates, no overwrites)
- Image filenames are resolved back to base64 data and stored in IndexedDB

### For Student Data (Mentor Mode)

1. Go to **Mentor Mode** and select a student
2. Click **Import Backup**
3. Select the student's `.zip` backup file
4. Trades and strategies are imported with the student's ID
5. Accounts in the backup are ignored (accounts are mentor-only)

## Backup Best Practices

:::tip Regular Backups
Since TradeFlow stores data in the browser's IndexedDB, clearing browser data or switching browsers will lose your data. Create regular backups, especially before:
- Clearing browser cache/data
- Switching to a different browser or computer
- Updating TradeFlow to a new version
:::

:::tip Transferring Between Devices
To move your journal to another computer:
1. Create a Full Backup on the source machine
2. Install TradeFlow on the target machine
3. Restore the backup via Bulk Import
:::
