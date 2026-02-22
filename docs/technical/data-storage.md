---
title: Data Storage
nav_order: 2
parent: Technical Reference
---

# Data Storage

TradeFlow uses **IndexedDB** via the **Dexie.js** library for all data persistence. This provides structured, queryable storage directly in the browser with no server required.

## Why IndexedDB?

- **Persistent** — Data survives browser restarts (unlike in-memory state)
- **Structured** — Supports indexes, queries, and transactions (unlike localStorage)
- **Large capacity** — Can store megabytes of data including images (unlike localStorage's ~5MB limit)
- **No server needed** — Everything runs client-side

## Database Schema

The database is named `TradeFlowDB` and has evolved through 5 schema versions:

### Version 1 — Core Tables

```javascript
trades:     'id, symbol, direction, entryDate, exitDate, strategyId, accountId'
accounts:   'id, name'
strategies: 'id, name'
```

### Version 2 — Financial Fields

Added `fees`, `commissions`, and `tradeDuration` to existing trades with migration logic:

- `fees` and `commissions` default to `0`
- `tradeDuration` is computed from `entryDate` and `exitDate` (in seconds)

### Version 3 — Settings Table

```javascript
settings: 'key'
```

Used for storing the OpenAI API key and model selection.

### Version 4 — Trade Images

Added `images` array to trades (default `[]`). Existing trades are migrated to include an empty images array.

### Version 5 — Mentor Mode Tables

```javascript
students:           'id, name'
studentTrades:      'id, studentId, symbol, direction, entryDate, exitDate, strategyId'
studentStrategies:  'id, studentId, name'
```

Complete data isolation for mentor-student relationships.

## Table Details

### trades

The primary table storing all of the mentor's own trades.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID primary key |
| `symbol` | string | Ticker symbol |
| `direction` | string | "long" or "short" |
| `entryPrice` | number | Entry price |
| `exitPrice` | number | Exit price |
| `entryDate` | string | ISO date-time of entry |
| `exitDate` | string | ISO date-time of exit |
| `positionSize` | number | Contracts/shares |
| `pnl` | number | Profit or loss |
| `strategyId` | string | FK to strategies table |
| `accountId` | string | FK to accounts table |
| `tags` | array | Array of tag strings |
| `notes` | string | Free-text notes |
| `takeProfits` | array | Array of `{price, quantity, date}` |
| `fees` | number | Trading fees |
| `commissions` | number | Broker commissions |
| `tradeDuration` | number | Duration in seconds |
| `images` | array | Array of base64 JPEG strings |

### accounts

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID primary key |
| `name` | string | Account display name |

### strategies

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID primary key |
| `name` | string | Strategy display name |

### settings

| Field | Type | Description |
|-------|------|-------------|
| `key` | string | Setting identifier (primary key) |
| `value` | any | Setting value |

Currently stores: `openai_api_key`, `openai_model`.

### students

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID primary key |
| `name` | string | Student name |
| `notes` | string | Optional notes |
| `createdAt` | string | ISO date-time |

### studentTrades

Same schema as `trades` but with an additional `studentId` field. Indexed by `studentId` for efficient per-student queries.

### studentStrategies

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID primary key |
| `studentId` | string | FK to students table |
| `name` | string | Strategy display name |

## Reactive Queries

TradeFlow uses Dexie's `useLiveQuery` hook for reactive data binding:

```javascript
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';

const trades = useLiveQuery(() => db.trades.toArray());
```

When any operation modifies the `trades` table, all components using a `useLiveQuery` on that table automatically re-render. This eliminates the need for manual state synchronization or Redux-style stores.

## Versioning and Migrations

Dexie handles schema versioning automatically. Each `db.version(n)` call can include an `.upgrade()` function that runs once when a user's database is at a lower version. This ensures:

- Existing users get new fields added to their data
- Default values are applied to existing records
- No data is lost during upgrades

## Backup Format

See the [Export & Backup Guide]({{ site.baseurl }}/guides/export-backup) for details on the ZIP snapshot format used for data portability.
