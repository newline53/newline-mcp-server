# Newline MCP Server Skills

This directory contains reusable [Agent Skills](https://agentskills.io/specification) for the Newline MCP server.
They are written to work with general skill-compatible agent harnesses, including:

- Pi
- Claude Code
- OpenAI Codex
- other Agent Skills compatible tools

Each skill is a self-contained directory with a `SKILL.md` file.

## Included skills

| Skill | Purpose |
|---|---|
| `account-reconciliation` | Reconcile synthetic and custodial balances and line items |
| `create-transfer` | Create a wire, ACH, or instant payment transfer |
| `customer-overview` | Build a customer summary including status, accounts, and activity |
| `investigate-transfer` | Drill into one transfer, its transactions, events, and returns |
| `making-payments` | Broad payment initiation workflow with validation steps |
| `managing-users-and-accounts` | Broad customer/account setup and account administration workflow |
| `new-account-setup` | Create a new synthetic account for a customer |
| `payment-operations` | Post-payment lifecycle, failure, and return investigation workflow |
| `return-resolution` | Investigate and explain returned payments |
| `transaction-reporting` | Reporting, monitoring, event timeline, and ledger evidence workflow |

## How to use these skills

## Pi

Pi auto-discovers skills in this repository.
You can invoke them directly with:

```text
/skill:create-transfer
/skill:investigate-transfer
/skill:new-account-setup
/skill:customer-overview
/skill:account-reconciliation
/skill:return-resolution
/skill:managing-users-and-accounts
/skill:making-payments
/skill:payment-operations
/skill:transaction-reporting
```

Or simply ask for a task naturally and let the agent load the right skill.

## Claude Code / Codex / other harnesses

Point your harness at this `skills/` directory, or copy one or more skill directories into
your global skills folder, for example:

```bash
~/.agents/skills/
```

Typical options:
- configure the harness to scan this repo’s `skills/` directory directly
- copy selected skill folders into your personal/shared skills location
- vendor these skill directories into another project that uses the same Newline MCP tools

## Important assumptions

These skills are written for the tool names exposed by this repository’s MCP server, including:

- `list-customers`
- `get-customer`
- `get-synthetic-account-types`
- `get-synthetic-accounts`
- `get-synthetic-account`
- `create-synthetic-account`
- `list-newline-transfers`
- `get-newline-transfer`
- `create-newline-transfer`
- `list-transactions`
- `get-transaction`
- `list-transaction-events`
- `get-transaction-event`
- `list-returns`
- `get-return`
- `list-pools`
- `list-products`
- `list-customer-products`
- `list-customer-activities`
- `list-synthetic-line-items`
- `list-custodial-line-items`
- `list-combined-transfers`
- `get-combined-transfer`

If you use these skills with a different MCP server or an older fork, verify that the tool names and parameters match.

## Safety notes

- Confirm with the user before creating or deleting resources.
- Use sandbox credentials for development and testing.
- Resolve names/emails to UIDs before acting.
- Check customer KYC status before account funding or transfer workflows.
- Remember that transfers are asynchronous and may remain `queued` or `pending` for some time.

## Example prompts

```text
Create an ACH transfer of $250 from account A to account B
What happened to transfer uid_abc123?
Open a new checking account for Jane Doe
Give me a full overview of customer john@example.com
Reconcile synthetic account uid_xyz789
Why was return uid_ret456 issued and what should I do?
Walk me through setting up a customer and account for future payments
Help me trace a payment failure from the transfer to the underlying transactions
Show me the event timeline and ledger impact for transaction txn_456
```
