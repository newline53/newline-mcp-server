---
name: payment-operations
description: Broad post-payment operations workflow for the Newline MCP server. Use when you need to investigate transfer failures, inspect transaction lifecycles, review returns, reconcile related records, or explain what happened after a payment was initiated. Prefer this skill for operational support across Claude Code, Codex, Pi, and other Agent Skills compatible harnesses.
---

# Payment Operations

A general operations skill for transfer follow-up, exceptions, and issue resolution.
Use this when the user is asking what happened after a payment was created.

## Guardrails

- Do not assume a newly created transfer should already be settled.
- Investigate by UID whenever possible: transfer UID, transaction UID, return UID.
- Use returns and transaction events to explain failures before suggesting retries.
- If remediation would require creating another transfer, get user confirmation first.

## Step 1 — Start from the Best Identifier Available

### If you have a transfer UID

```
get-newline-transfer  uid=<transfer_uid>
```

### If you have a transaction UID

```
get-transaction  uid=<transaction_uid>
```

### If you have a return UID

```
get-return  uid=<return_uid>
```

### If you only have rough context

Use list endpoints to find the right record:

```
list-newline-transfers
list-transactions
list-returns
list-combined-transfers
```

## Step 2 — Inspect the Transfer Record

From the transfer, capture:
- `uid`, `status`, `created_at`
- `source_synthetic_account_uid`
- `destination_synthetic_account_uid`
- `initiating_customer_uid`
- `destination_customer_uid`
- `usd_transfer_amount`
- `transaction_uids`
- which rail block is populated: `wire`, `ach`, or `instant_payment`

If there is no transfer, continue from the transaction or return path instead.

## Step 3 — Inspect Related Transactions

For each related UID:

```
get-transaction  uid=<transaction_uid>
```

Record:
- `status`
- `transaction_type`
- `amount`, `currency`
- `synthetic_account_uid`
- `custodial_account_uid`
- `transfer_uid`
- `balance_after`
- timestamps and description

If you need broader context:

```
list-transactions  transfer_uid=[<transfer_uid>]
```

## Step 4 — Inspect Transaction Events

```
list-transaction-events
```

Filter for events tied to the transaction UID(s). Focus on:
- settlement progress
- failure states
- return-related events
- timing gaps between queued, pending, and settled states

If needed, inspect a specific event:

```
get-transaction-event  uid=<transaction_event_uid>
```

## Step 5 — Check for Returns

```
list-returns
```

Look for returns tied to the original transaction. If one exists, capture:
- `uid`
- `original_transaction_uid`
- `return_reason`
- `amount`, `currency`
- `status`
- `processed_at`

Then branch into the more focused `return-resolution` skill if the user needs next steps.

## Step 6 — Check Grouped or Batch Context

Some issues are easier to understand via grouped transfers:

```
list-combined-transfers
get-combined-transfer  uid=<combined_transfer_uid>
```

Use this to determine whether the transfer is part of a wider batch and whether
other sibling transfers share the same issue.

## Step 7 — Check Balance Impact When Needed

If the user asks whether funds moved or balances changed:

```
get-synthetic-account  uid=<synthetic_account_uid>
list-synthetic-line-items
list-custodial-line-items
```

Use `transaction_uid` and `balance_after` to connect the payment to account-level impact.

## Step 8 — Summarise Clearly

Explain:
1. what record you started from
2. current transfer and transaction status
3. whether the payment is still processing, settled, failed, or returned
4. what events support that conclusion
5. whether balances or line items show the funds movement
6. the safest next action

Typical next actions:
- wait and re-check later if still pending
- correct destination details before retrying
- review return reason and update account info
- escalate when the API shows inconsistent states
