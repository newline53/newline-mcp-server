---
name: customer-overview
description: Builds a complete snapshot of a Newline customer, including their profile, KYC status, synthetic accounts and balances, recent transactions, and recent activity. Use when asked to look up, summarise, or report on a customer.
---

# Customer Overview

Assembles a full picture of a customer from multiple Newline API resources.

## Step 1 — Find and Retrieve the Customer

If you have the customer UID:

```
get-customer  uid=<customer_uid>
```

If you need to search:

```
list-customers  (filter by first_name, last_name, email, or external_uid)
```

Record from the customer response:
- `uid`, `external_uid`
- `details` — name, phone, business name
- `email`
- `status` — `active`, `locked`, `archived`
- `kyc_status` and `kyc_status_reasons`
- `lock_reason` / `locked_at` — if applicable
- `total_balance`
- `pool_uids` — pools the customer belongs to
- `customer_type` — individual vs. business

## Step 2 — Retrieve Synthetic Accounts

```
get-synthetic-accounts
```

Filter visually or by `pool_uid` to find accounts belonging to this customer's pools.

For each account note:
- `name`, `uid`, `status`
- `synthetic_account_category`
- `net_usd_balance`, `net_usd_pending_balance`, `net_usd_available_balance`
- `routing_number`, `account_number_last_four`
- Payment rail details (`ach`, `wire`, or `instant_payment` block)

## Step 3 — Retrieve Recent Transactions

```
list-transactions  customer_uid=[<customer_uid>]  sort=created_at_desc  limit=10
```

For each transaction note:
- `transaction_type`, `status`, `amount`, `currency`
- `description`
- `transfer_uid` — link to originating transfer if applicable
- `created_at`

## Step 4 — Retrieve Recent Customer Activities

```
list-customer-activities
```

Filter for entries where `customer_uid` matches. These capture login events,
KYC updates, setting changes, and other audit trail entries.

Note any recent `activity_type` values that suggest issues (failed logins,
KYC status changes, locked events).

## Step 5 — Retrieve Customer Products (Optional)

```
list-customer-products
```

Look for products associated with this customer to understand their enrolled
services and product eligibility.

## Step 6 — Summarise

Present a structured summary covering:
1. **Identity** — name, email, type, status, KYC status
2. **Balances** — total balance and per-account breakdown
3. **Accounts** — list of synthetic accounts with status and category
4. **Recent Transactions** — last 10 with amounts and status
5. **Recent Activity** — notable activity log entries
6. **Flags** — any locked status, KYC failures, or pending issues
