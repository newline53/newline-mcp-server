---
name: investigate-transfer
description: Investigates a Newline banking transfer end-to-end by drilling through the transfer, its transactions, transaction events, any returns, and the combined transfer view. Use when asked to debug, trace, audit, or check the status of a transfer.
---

# Investigate Transfer

Full drill-down workflow for understanding the state and history of a transfer.

## Step 1 — Get the Transfer

If you have the transfer UID directly:

```
get-newline-transfer  uid=<transfer_uid>
```

If you need to find it first:

```
list-newline-transfers
```

Note from the transfer response:
- `status` — current state of the transfer
- `transaction_uids` — list of associated transaction UIDs
- `source_synthetic_account_uid` and `destination_synthetic_account_uid`
- `initiating_customer_uid` and `destination_customer_uid`
- `usd_transfer_amount`
- `ach`, `wire`, or `instant_payment` block — identifies the transfer type

## Step 2 — Inspect Each Transaction

For every UID in `transaction_uids`, fetch the full transaction:

```
get-transaction  uid=<transaction_uid>
```

Note for each transaction:
- `status` — e.g. `settled`, `pending`, `failed`
- `transaction_type`
- `amount` and `currency`
- `balance_after` — running balance on the synthetic account after this entry
- `custodial_account_uid` — the underlying custodial account

## Step 3 — Check Transaction Events

Transaction events capture lifecycle state changes (initiated, settled, failed, returned, etc.):

```
list-transaction-events
```

Look for events whose `transaction_uid` matches any of the transactions found in Step 2.
Pay attention to `event_type` and `status` for any failure or return indicators.

## Step 4 — Check for Returns

```
list-returns
```

Look for returns where `original_transaction_uid` matches a transaction from Step 2.
If a return is found:
- Note `return_reason`, `amount`, `status`, and `processed_at`
- See the `return-resolution` skill for next steps

## Step 5 — Check the Combined Transfer View (Optional)

If the transfer is part of a batch or grouped operation:

```
list-combined-transfers
```

Look for a combined transfer whose `transfer_uids` includes the transfer UID from Step 1.
The combined transfer shows `total_amount` and overall `status` across all constituent transfers.

## Step 6 — Summarise Findings

Report back:
1. Transfer status and type (Wire / ACH / Instant Payment)
2. Amount and direction (source → destination account)
3. Status of each transaction and whether all are settled
4. Any transaction events indicating failures or state changes
5. Whether any returns exist and their reasons
6. The combined transfer status if applicable
