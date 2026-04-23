---
name: new-account-setup
description: Sets up a new Newline synthetic account for a customer. Walks through selecting the correct account type, pool, and payment-rail options before calling create-synthetic-account. Use when asked to open, create, or provision a new account for a customer.
---

# New Account Setup

Step-by-step workflow for creating a synthetic account for a customer.

## Step 1 — Identify the Customer

If you don't already have the customer UID:

```
list-customers  (filter by name, email, or external_uid as needed)
get-customer  uid=<customer_uid>
```

Note the customer's:
- `uid` — needed when associating the account
- `pool_uids` — the pools this customer already belongs to
- `kyc_status` — account creation may fail if KYC is not approved
- `status` — customer must be active

## Step 2 — Select an Account Type

List all available synthetic account types for the program:

```
get-synthetic-account-types
```

Each type has:
- `uid` — the `synthetic_account_type_uid` required at creation
- `name` and `description` — what the account is for
- `synthetic_account_category` — e.g. `general`, `external_checking`, `external_savings`

Choose the type that matches the intended use. If the user has not specified a type,
ask them or infer from context (e.g. "checking account" → `external_checking` category).

## Step 3 — Select a Pool

List available pools:

```
list-pools
```

Choose the pool that:
- The customer already belongs to (their `pool_uids` from Step 1), **or**
- Matches the intended product/program context

Note the pool `uid` — this becomes `pool_uid` at creation.

## Step 4 — Check Product Eligibility (Optional)

If you want to confirm the customer is eligible for a product before opening an account:

```
list-products
list-customer-products  (to see what the customer already has)
```

This step is informational — product eligibility is enforced by the API at creation time.

## Step 5 — Determine Payment Rail Fields

Depending on the account type and use case, include the appropriate optional block:

### ACH External Account
Include an `ach` block:
- `account_type` — `checking` or `savings`
- `counterparty_name` — name on the external account
- `routing_number` and `account_number` — external bank details

### Wire External Account
Include a `wire` block:
- `counterparty_name` — name on the external account
- Optionally `counterparty_bank_name` and `counterparty_bank_address`

### Instant Payment External Account
Include an `instant_payment` block:
- `counterparty_name`
- `counterparty_address` — street_number, street1, street2, city, state, postal_code, country

Internal/program accounts typically need no payment-rail block.

## Step 6 — Create the Account

```
create-synthetic-account
  name                        — human-readable account name
  pool_uid                    — from Step 3
  synthetic_account_type_uid  — from Step 2
  external_uid                — optional, your own identifier for idempotency
  routing_number              — optional, if applicable
  account_number              — optional, if applicable
  ach | wire | instant_payment — optional, from Step 5
```

## Step 7 — Confirm

The response includes the new account's `uid`, `status`, and balance fields (initially zero).
Share the new account UID with the user and confirm the account is `active`.

## Notes

- A customer must have an approved `kyc_status` before accounts can be funded.
- Deleting an account is permanent — use `delete-synthetic-accounts` with care.
- The `master_account` flag on existing accounts indicates the primary program account; do not delete it.
