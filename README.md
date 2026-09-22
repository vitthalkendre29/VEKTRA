# VEKTRA

A personal finance dashboard that sits on top of your **Ledger** expense
tracker. Rebuilt on Next.js (App Router) + MongoDB, replacing the old
Express + JSON-array backend.

## What changed from the old version

- **One database, not two.** VEKTRA no longer has its own `VEKTRA_DB_NAME`.
  Everything lives in the same MongoDB database as Ledger. VEKTRA adds its
  own collections (all prefixed `vektra_`) and reuses Ledger's own `User`,
  `Category`, `PaymentMethod`, `Expense` and `Budget` collections directly.
- **Expenses are never copied.** The old server synced/imported Ledger
  expenses into VEKTRA's own array. Now the Transactions view, Dashboard,
  Analytics and Budgets all read Ledger's `Expense` collection **live** —
  there's no import step, no sync button, and no stale copies to reconcile.
  VEKTRA only ever *writes* its own data for income, transfers,
  investments and savings — never expenses.
- **Budgets live in Ledger's own `Budget` collection**, extended with one
  additive `alertPercent` field, instead of a separate VEKTRA schema.
- **Proper collections, not JSON blobs.** Accounts, transactions, goals,
  holdings, loans, bills, net worth snapshots, assets and liabilities are
  now indexed Mongoose collections with targeted writes (e.g. a single
  `$inc` on an account's balance) instead of rewriting one big state
  document on every change.
- **Cookie-based auth.** Login still authenticates against Ledger's own
  `User` collection with the same email/password, but the session is now
  an httpOnly JWT cookie instead of a token in `localStorage`.
- **Real routes.** Every view (`/dashboard`, `/transactions`, `/budgets`,
  …) is its own Next.js route instead of a hash-based single page, so the
  browser back button and bookmarks work as expected.

## Setup

```bash
npm install
cp .env.example .env
```


Fill in `.env`:

- `MONGODB_URI` — the **same** connection string your Ledger app uses
  (same cluster, same database name — just don't point this at a
  different database).
- `JWT_SECRET` — generate one with `openssl rand -base64 32`.

```bash
npm run dev      # http://localhost:3000
npm run build && npm run start   # production
```

Log in with the email/password of an existing Ledger account. First login
seeds a starter "Cash" account and two Emergency Fund goals if you don't
already have any — Ledger categories/payment methods are only seeded if
your Ledger account genuinely has none yet.

## Project layout

```
src/
  app/
    login/                the login page
    (app)/                 everything behind auth: dashboard, transactions, …
    api/                   route handlers (REST-ish, one per resource)
  components/              Shell, forms, shared UI pieces
  lib/                     db connection, auth, calc engine, fetch helper
  models/
    ledger/                User, Category, PaymentMethod, Expense, Budget,
                            RecurringExpense — Ledger's own schemas, reused as-is
    vektra/                Profile, Account, Transaction, Goal, Holding,
                            Loan, Bill, NetWorthSnapshot, Asset, Liability
```

## Bringing data from the old VEKTRA

Settings → "Import old VEKTRA backup" accepts a JSON export from the
previous version. It recreates accounts, goals, budgets, holdings, loans,
bills, assets, liabilities and manual transactions. Expense entries in
the old export are skipped on purpose — they're already in Ledger.
