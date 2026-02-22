---
sidebar_position: 3
title: Mentor Setup Guide
---

# Setting Up Mentor Mode

This guide walks through configuring Mentor Mode for coaching and reviewing students' trades.

## Prerequisites

- TradeFlow installed and running
- Students using TradeFlow and able to export their data as `.zip` backups

## Step 1: Navigate to Mentor Mode

Click **Mentor Mode** in the sidebar. You'll see the student list view (initially empty).

## Step 2: Add Students

1. Click **Add Student**
2. Enter the student's name
3. Optionally add notes (e.g., "Futures trader, started Jan 2026")
4. Click Save

The student appears as a card showing their name, notes, and creation date.

## Step 3: Receive Student Data

Ask your student to export their TradeFlow data:

1. Student opens their TradeFlow instance
2. Goes to **Trade Log** → **Actions** → **Full Backup (.zip)**
3. Sends you the `.zip` file (email, Slack, cloud drive, etc.)

## Step 4: Import Student Trades

1. Click on the student's card to enter their detail view
2. Click **Import Backup**
3. Select the `.zip` file from the student
4. TradeFlow imports:
   - All trades → stored in `studentTrades` table with this student's ID
   - All strategies → stored in `studentStrategies` table with this student's ID
   - Accounts are skipped (accounts are mentor-only)
   - Chart images are restored to the correct trades

:::info Duplicate Protection
If you import the same backup file twice, duplicate records are skipped. Only new trades and strategies are added.
:::

## Step 5: Review Student Trades

In the student detail view, you have access to:

### Trade Table
- Full sortable table with all the student's trades
- Filter by symbol, direction, win/loss, or strategy
- Sort by date, direction, or P&L

### Accordion Details
Click any trade row to expand and see:
- Entry/exit prices and position size
- Trade duration, fees, commissions
- Notes the student wrote
- Take-profit levels
- Chart screenshots

### Student Stats
The header shows real-time metrics:
- Total trade count
- Total P&L
- Win rate

## Step 6: Ongoing Review

As students continue trading and send updated backups:

1. Import the new backup for the same student
2. Only new trades are added (existing ones are skipped by ID matching)
3. Review the latest trades and track progress over time

## Data Isolation Reminder

Your personal trading data is completely separate from student data:

| Your Data | Student Data |
|-----------|-------------|
| `trades` table | `studentTrades` table |
| `strategies` table | `studentStrategies` table |
| `accounts` table | No student accounts |
| Visible on Dashboard, Trade Log | Visible only in Mentor Mode |

Deleting a student cascades: all their trades and strategies are removed, but your data is unaffected.
