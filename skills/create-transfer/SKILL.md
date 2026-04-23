---
name: create-transfer
description: Creates a Newline banking transfer between two synthetic accounts. Handles all three transfer types: Wire, ACH, and Instant Payment. Use this skill when asked to send money, initiate a transfer, move funds, or create any Wire/ACH/Instant Payment between accounts.
---

# Create Transfer

Guide for creating a Wire, ACH, or Instant Payment transfer via the Newline Banking API.
All three types share a common set of required fields, plus type-specific fields.

## Step 1 — Identify the Initiating Customer

If you don't already have the customer UID, find it first:

```
list-customers  (filter by name, email, or external_uid as needed)
```

Note the customer's `uid` — this becomes `initiating_customer_uid`.

## Step 2 — Identify Source and Destination Accounts

Retrieve the synthetic accounts involved in the transfer:

```
get-synthetic-accounts
```

Note the `uid` of each account:
- `source_synthetic_account_uid` — the account funds leave from
- `destination_synthetic_account_uid` — the account funds arrive at

If you only have one side, also check the destination customer's accounts:

```
list-customers  (find destination customer)
get-synthetic-accounts
```

## Step 3 — Choose Transfer Type and Gather Type-Specific Fields

### Wire Transfer
Requires a `wire` object with:
- `wire_instructions` — free-text wire routing instructions

### ACH Transfer
Requires an `ach` object with:
- `sec_code` — Standard Entry Class code (e.g. `PPD`, `CCD`, `WEB`)
- `service_processing` — `STANDARD` or `SAME_DAY`
- `originator_name` — name of the originating entity
- `company_id` — ACH company identifier
- `prenote` — `true` to send a prenote, `false` for a live entry
- `entry_description` — up to 10-character description (e.g. `PAYROLL`)
- `effective_entry_date` — desired settlement date (`YYYY-MM-DD`)
- `id_number` — individual identification number

### Instant Payment Transfer
Requires an `instant_payment` object with:
- `memo` — payment memo / message to recipient
- `instant_payment_transmitter` — object containing:
  - `name`, `transmitter_identifier`
  - `street_number` (integer), `street1`, `street2`, `city`, `state`, `postal_code`, `country`

## Step 4 — Create the Transfer

Call `create-newline-transfer` with all required fields:

```
create-newline-transfer
  external_uid              — your own unique identifier for idempotency
  initiating_customer_uid   — from Step 1
  initiator_type            — "customer" in most cases
  source_synthetic_account_uid       — from Step 2
  destination_synthetic_account_uid  — from Step 2
  usd_transfer_amount       — amount as a string (e.g. "100.00")
  wire | ach | instant_payment       — exactly one, from Step 3
```

## Step 5 — Confirm

The response includes the new transfer's `uid` and initial `status`.
Share the transfer UID and status with the user. If the status is not yet
`settled`, advise that it will update asynchronously.

## Notes

- Only one of `wire`, `ach`, or `instant_payment` should be provided per transfer.
- `usd_transfer_amount` is a string, not a number (e.g. `"250.00"`).
- Use a unique `external_uid` per request to prevent duplicate transfers.
