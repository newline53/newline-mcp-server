---
name: return-resolution
description: Investigates and resolves a returned Newline banking transfer by tracing the return back to its original transaction and transfer, reviewing the return reason, and checking account balance impact. Use when asked to handle, investigate, or explain a returned payment or ACH return.
---

# Return Resolution

Workflow for understanding and resolving a returned transfer on the Newline platform.

## Step 1 — Identify the Return

If you have the return UID:

```
get-return  uid=<return_uid>
```

If you need to find it:

```
list-returns
```

Record from the return:
- `uid`
- `original_transaction_uid` — the transaction that was returned
- `return_reason` — the return reason code or description
- `amount` and `currency`
- `status` — e.g. `pending`, `processed`
- `processed_at` — when the return was settled (null if still pending)

## Step 2 — Retrieve the Original Transaction

```
get-transaction  uid=<original_transaction_uid>
```

Record:
- `synthetic_account_uid` — the account affected
- `transfer_uid` — the originating transfer (if applicable)
- `transaction_type`, `amount`, `status`
- `custodial_account_uid`
- `balance_after` — the balance after the original transaction posted

## Step 3 — Retrieve the Originating Transfer

If the transaction has a `transfer_uid`:

```
get-newline-transfer  uid=<transfer_uid>
```

Record:
- `source_synthetic_account_uid` and `destination_synthetic_account_uid`
- `initiating_customer_uid`
- Transfer type (`ach`, `wire`, or `instant_payment`) and its fields
- `usd_transfer_amount` and `status`

For ACH returns the `ach.sec_code` and return reason code together
identify the specific NACHA return category (e.g. R01 Insufficient Funds,
R02 Account Closed, R03 No Account).

## Step 4 — Check Transaction Events

```
list-transaction-events
```

Look for events where `transaction_uid` matches the original transaction UID.
A return event will typically show `event_type` containing "return" and the
reason in `description` or `metadata`.

## Step 5 — Check Account Balance Impact

```
get-synthetic-account  uid=<synthetic_account_uid>
```

Compare the current `net_usd_balance` against the `balance_after` recorded in
Step 2. The difference should reflect the return credit/debit.

Also check the synthetic line items for a return credit entry:

```
list-synthetic-line-items
```

Filter for the `synthetic_account_uid` and look for a line item whose
`transaction_uid` corresponds to the return (typically created after the
original transaction).

## Step 6 — Summarise and Recommend

Report:
1. **Return details** — UID, amount, reason code, status
2. **Original transfer** — type, amount, direction, date
3. **Affected accounts** — which synthetic accounts were impacted
4. **Balance impact** — current balance vs. balance before the return
5. **Return reason interpretation** — what the reason code means
6. **Recommended action** based on return reason:
   - *Insufficient funds (R01)* — advise customer to fund account and retry
   - *Account closed (R02)* — update destination account information
   - *No account / unable to locate (R03)* — verify routing and account numbers
   - *Invalid account number (R04)* — correct and resubmit
   - *Unauthorized (R05/R07/R10)* — do not retry; escalate for review
   - *Duplicate (R06)* — investigate for duplicate submission
   - *Other* — review reason description and consult Newline documentation
