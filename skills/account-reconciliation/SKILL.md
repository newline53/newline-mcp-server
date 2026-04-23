---
name: account-reconciliation
description: Reconciles a Newline synthetic account against its underlying custodial account by comparing balances, synthetic line items, and custodial line items. Use when asked to reconcile, audit, or verify that account balances match across the synthetic and custodial layers.
---

# Account Reconciliation

Compares the synthetic and custodial views of an account to surface any discrepancies.

## Step 1 — Get the Synthetic Account

If you have the synthetic account UID:

```
get-synthetic-account  uid=<synthetic_account_uid>
```

If you need to find it:

```
get-synthetic-accounts
```

Record from the synthetic account:
- `uid`
- `net_usd_balance` — the reported balance on the synthetic layer
- `net_usd_pending_balance`
- `net_usd_available_balance`
- `custodial_account_uids` — the underlying custodial accounts
- `asset_balances` — per-asset breakdown including `current_usd_value` per custodial account

## Step 2 — Get the Custodial Account(s)

For each UID in `custodial_account_uids`:

```
get-custodial-account  uid=<custodial_account_uid>
```

Record the custodial account's reported balance for comparison.

If you need to find custodial accounts:

```
list-custodial-accounts
```

## Step 3 — Pull Synthetic Line Items

```
list-synthetic-line-items
```

Filter for entries where `synthetic_account_uid` matches the account from Step 1.

For each line item record:
- `amount`, `currency`
- `description`
- `balance_after` — running balance after this entry
- `transaction_uid` — back-reference to the originating transaction
- `created_at`

The final `balance_after` in chronological order should equal `net_usd_balance`
from Step 1.

## Step 4 — Pull Custodial Line Items

```
list-custodial-line-items
```

Filter for entries where `custodial_account_uid` matches the account from Step 2.

For each line item record:
- `amount`, `currency`
- `description`
- `balance_after`
- `transaction_uid`
- `created_at`

## Step 5 — Cross-Reference Transactions

For any `transaction_uid` that appears in synthetic line items but not custodial
line items (or vice versa), fetch the full transaction:

```
get-transaction  uid=<transaction_uid>
```

Check the transaction `status` — pending transactions may not yet appear on
both sides.

## Step 6 — Compare and Report

| Check | Expected |
|-------|----------|
| Synthetic `net_usd_balance` | Equals sum of synthetic line item amounts |
| Custodial balance | Equals sum of custodial line item amounts |
| Synthetic balance vs. custodial balance | Should match (within pending amounts) |
| Every synthetic line item has a matching custodial line item | Yes, via `transaction_uid` |
| No unmatched custodial line items | Confirm no orphaned custodial entries |

Report:
1. The synthetic balance and the custodial balance
2. Whether they agree (or the delta if not)
3. Any line items present on one side but not the other
4. Any transactions still in `pending` status that explain timing differences
