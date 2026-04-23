---
name: managing-users-and-accounts
description: Broad customer and account management workflow for the Newline MCP server. Use when you need to find customers, assess KYC and status, review pools and products, inspect existing synthetic accounts, or create a new synthetic account. Prefer this skill for multi-step setup and account administration tasks across Claude Code, Codex, Pi, and other Agent Skills compatible harnesses.
---

# Managing Users and Accounts

A general-purpose workflow for customer lookup and synthetic account setup.
Use this broader skill when the task spans discovery, eligibility checks, and account creation.
For narrow tasks, the more specific skills `customer-overview` and `new-account-setup`
may be faster.

## Guardrails

- Resolve people and accounts to UIDs before taking action.
- Confirm with the user before calling `create-synthetic-account` or `delete-synthetic-accounts`.
- Use sandbox credentials for testing.
- Treat KYC and locked status as blockers for funding and transfer workflows.

## Step 1 — Find the Customer

If the user gives a UID directly:

```
get-customer  uid=<customer_uid>
```

Otherwise search first:

```
list-customers  (filter by first_name, last_name, email, external_uid, or pool_uid)
```

Record:
- `uid`
- `external_uid`
- `customer_type`
- `status`
- `kyc_status` and `kyc_status_reasons`
- `locked` / lock-related fields if present
- `pool_uids`
- `total_balance`

## Step 2 — Check Whether the Customer Is Eligible for Account Activity

Before opening or using accounts, verify:
- customer `status` is active
- `kyc_status` is approved or otherwise acceptable for the requested workflow
- the customer is not locked

If these checks fail, stop and explain the blocker before attempting account creation or transfers.

## Step 3 — Review Existing Synthetic Accounts

```
get-synthetic-accounts
```

Identify the customer's accounts by matching pool membership, naming, or known UIDs.
If you already know an account UID, inspect it directly:

```
get-synthetic-account  uid=<synthetic_account_uid>
```

For each relevant account, note:
- `uid`, `name`, `status`
- `synthetic_account_type_uid`
- `synthetic_account_category`
- `pool_uid`
- `net_usd_balance`, `net_usd_pending_balance`, `net_usd_available_balance`
- `routing_number`, `account_number_last_four`
- payment rail blocks such as `ach`, `wire`, or `instant_payment`

## Step 4 — Review Available Account Types

```
get-synthetic-account-types
```

Choose the type whose `uid`, `name`, `description`, and `synthetic_account_category`
best match the user's intent.
Examples:
- internal operating or customer account → general category
- linked external bank destination → external checking or savings category

## Step 5 — Review Pools and Products

Use these tools when you need to determine program placement or eligibility:

```
list-pools
list-products
list-customer-products
```

Use the customer's existing `pool_uids` when possible. If multiple pools fit,
ask the user which program or product the account should belong to.

## Step 6 — Gather Account Creation Inputs

For a new synthetic account, collect:
- `name`
- `pool_uid`
- `synthetic_account_type_uid`
- optional `external_uid`
- optional `routing_number` and `account_number`
- optional payment-rail details

Payment-rail blocks supported by this server:

### ACH external account

```
ach: {
  account_type,
  counterparty_name
}
```

### Wire external account

```
wire: {
  counterparty_name
}
```

### Instant payment external account

```
instant_payment: {
  counterparty_name,
  counterparty_address: {
    street_number,
    street1,
    street2,
    city,
    state,
    postal_code,
    country
  }
}
```

## Step 7 — Create the Synthetic Account

Only after user confirmation:

```
create-synthetic-account
  name
  pool_uid
  synthetic_account_type_uid
  external_uid                (optional)
  routing_number              (optional)
  account_number              (optional)
  ach | wire | instant_payment (optional)
```

## Step 8 — Verify the Result

After creation, report:
- new account `uid`
- `status`
- selected type and pool
- whether ACH / wire / instant payment details were attached

If needed, verify with:

```
get-synthetic-account  uid=<new_account_uid>
```

## Step 9 — Optional Cleanup or Follow-On Work

You may next branch into:
- `new-account-setup` for a tighter creation workflow
- `customer-overview` for a full customer summary
- `create-transfer` or `making-payments` once accounts are ready

Delete accounts only with explicit confirmation:

```
delete-synthetic-accounts  uid=<synthetic_account_uid>
```
