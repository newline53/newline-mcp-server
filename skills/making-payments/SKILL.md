---
name: making-payments
description: General payment initiation workflow for the Newline MCP server. Use when you need to prepare and create a wire, ACH, or instant payment transfer, validate the source and destination accounts, and explain rail-specific requirements. Prefer this skill for end-to-end payment execution across Claude Code, Codex, Pi, and other Agent Skills compatible harnesses.
---

# Making Payments

A broad skill for preparing and initiating Newline transfers.
For a narrower transfer-only flow, `create-transfer` may be sufficient.

## Guardrails

- Confirm with the user before calling `create-newline-transfer`.
- Resolve names and emails to customer and account UIDs first.
- Verify the initiating customer is active and KYC-approved before sending funds.
- Transfers are asynchronous; initial status may be `queued` or `pending`.

## Step 1 — Identify the Initiating Customer

If you have the UID:

```
get-customer  uid=<customer_uid>
```

Otherwise search first:

```
list-customers  (filter by first_name, last_name, email, external_uid, or pool_uid)
```

Record:
- `uid` → `initiating_customer_uid`
- `status`
- `kyc_status`
- `pool_uids`

Stop if the customer is not in a valid state to initiate payments.

## Step 2 — Identify the Source Account

Inspect available synthetic accounts:

```
get-synthetic-accounts
```

If needed, drill into a known account:

```
get-synthetic-account  uid=<source_synthetic_account_uid>
```

Confirm:
- the account belongs to the correct customer or pool
- the account is active
- the available balance is sufficient
- the relevant payment rail details exist for the intended use

## Step 3 — Identify the Destination Account

This server creates transfers between two synthetic accounts, so you need a
`destination_synthetic_account_uid`.

To find one:

```
get-synthetic-accounts
```

If the destination belongs to another known customer, resolve them first:

```
list-customers
get-customer  uid=<destination_customer_uid>
get-synthetic-accounts
```

If no destination synthetic account exists yet, switch to `new-account-setup` or
`managing-users-and-accounts` before proceeding.

## Step 4 — Choose the Transfer Rail

Exactly one of these blocks must be supplied.

### Wire

```
wire: {
  wire_instructions
}
```

Use for traditional wire transfers when the user provides routing instructions.

### ACH

```
ach: {
  sec_code,
  service_processing,
  originator_name,
  company_id,
  prenote,
  entry_description,
  effective_entry_date,
  id_number
}
```

Collect all ACH fields up front. Keep `entry_description` short and business-appropriate.

### Instant Payment

```
instant_payment: {
  memo,
  instant_payment_transmitter: {
    name,
    transmitter_identifier,
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

Use for immediate payment workflows that require transmitter identity and address details.

## Step 5 — Gather Common Transfer Inputs

Every transfer requires:
- `external_uid` — unique idempotency identifier
- `initiating_customer_uid`
- `initiator_type` — usually `customer`
- `source_synthetic_account_uid`
- `destination_synthetic_account_uid`
- `usd_transfer_amount` — string value such as `"100.00"`
- exactly one of `wire`, `ach`, or `instant_payment`

## Step 6 — Create the Transfer

Only after confirmation:

```
create-newline-transfer
  external_uid
  initiating_customer_uid
  initiator_type
  source_synthetic_account_uid
  destination_synthetic_account_uid
  usd_transfer_amount
  wire | ach | instant_payment
```

## Step 7 — Verify and Communicate Status

After creation, report:
- transfer `uid`
- `status`
- transfer type
- amount
- source and destination account UIDs
- any associated `transaction_uids`

If needed, re-check with:

```
get-newline-transfer  uid=<transfer_uid>
```

## Step 8 — Hand Off to Monitoring or Investigation

For follow-up work, use:
- `investigate-transfer` for one transfer deep-dives
- `payment-operations` for returns and post-payment issues
- `transaction-reporting` for status tracking and audit history
