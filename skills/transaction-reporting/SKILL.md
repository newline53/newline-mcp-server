---
name: transaction-reporting
description: Reporting and audit workflow for the Newline MCP server. Use when you need transaction history, event timelines, account-level posting evidence, customer activity context, or summary reporting for balances and payment status. Prefer this skill for monitoring and operational reporting across Claude Code, Codex, Pi, and other Agent Skills compatible harnesses.
---

# Transaction Reporting

Use this skill to retrieve, monitor, and summarise transaction activity.
It is broader than `investigate-transfer` and works well for reporting, audit,
and dashboard-style questions.

## Step 1 — Define the Reporting Scope

Determine the narrowest useful anchor:
- customer UID
- synthetic account UID
- transfer UID
- transaction UID
- date range or recent activity window

Then choose the appropriate list or get tool.

## Step 2 — Retrieve Transactions

For broad history:

```
list-transactions  (filter by uid, external_uid, synthetic_account_uid, customer_uid, transaction_type, status, transfer_uid, limit, offset, sort)
```

For one specific record:

```
get-transaction  uid=<transaction_uid>
```

Capture:
- `uid`, `external_uid`
- `transaction_type`
- `status`
- `amount`, `currency`
- `synthetic_account_uid`
- `customer_uid`
- `transfer_uid`
- `custodial_account_uid`
- `balance_after`
- timestamps and description

## Step 3 — Monitor Status Over Time

If the user asks whether something has completed, use repeated reads of:

```
get-transaction  uid=<transaction_uid>
```

General timing guidance:
- instant payment: seconds
- wire: same day to next business day
- ACH: often 1–2 business days

If still `queued` or `pending`, report that processing is ongoing rather than assuming failure.

## Step 4 — Pull the Event Timeline

```
list-transaction-events
```

Identify events for the relevant transaction and build a timeline of status changes.
If you need more detail for one event:

```
get-transaction-event  uid=<transaction_event_uid>
```

Use this for audit trails and failure analysis.

## Step 5 — Connect Transactions Back to Transfers

If a transaction has a `transfer_uid`, inspect the parent transfer:

```
get-newline-transfer  uid=<transfer_uid>
```

If you need to find recent transfers first:

```
list-newline-transfers
```

This helps explain direction, counterparties, and rail-specific fields.

## Step 6 — Check Posting Evidence on Accounts

When the user needs proof that funds posted to an account:

```
get-synthetic-account  uid=<synthetic_account_uid>
list-synthetic-line-items
list-custodial-line-items
```

Use:
- `transaction_uid`
- amounts
- `balance_after`
- timestamps

to show where the transaction appears in synthetic and custodial ledgers.

## Step 7 — Add Customer Context When Useful

For customer-level reporting:

```
get-customer  uid=<customer_uid>
list-customer-activities
list-customer-products
```

Use this to explain whether a transaction issue lines up with customer state,
KYC changes, account locks, or recent operational activity.

## Step 8 — Summarise for the User

A strong report usually includes:
1. reporting scope and filters used
2. counts of matching transactions
3. most relevant transaction statuses
4. event timeline for the key transaction(s)
5. related transfer or return linkage
6. balance or ledger impact if requested
7. open questions, blockers, or recommended follow-up
