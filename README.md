
# Newline Model Context Protocol (MCP) Server

Let your AI agents interact with the Newline Banking API by using our MCP server.

The Newline Model Context Protocol (MCP) server provides a comprehensive set of tools that AI agents can use to interact with the Newline Banking API for managing synthetic accounts, transfers, customers, transactions, and other banking operations.

## Connect to Newline's MCP Server

### Cursor

Add the following to your `~/.cursor/mcp.json` file. To learn more, see the Cursor [documentation](https://docs.cursor.com/context/model-context-protocol).

```json
{
  "mcpServers": {
    "newline": {
      "command": "npx",
      "args": ["-y", "git+https://github.com/newline53/newline-mcp-server"],
      "env": {
        "NEWLINE_HMAC_KEY": "<<YOUR_HMAC_KEY>>",
        "NEWLINE_PROGRAM_ID": "<<YOUR_PROGRAM_ID>>",
        "NEWLINE_BASE_URL": "https://sandbox.newline53.com/api/v1"
      }
    }
  }
}
```

The code editor agent automatically detects all the available tools, calling the relevant tool when you post a related question in the chat.

### VS Code

Add the following to your `.vscode/mcp.json` file in your workspace. To learn more, see the VS Code [documentation](https://code.visualstudio.com/docs/copilot/chat/mcp-servers).

> Using  promptStrings - this will prompt for input

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "hmac-key",
      "description": "Newline HMAC API key",
      "password": true
    },
    {
      "type": "promptString",
      "id": "program-id",
      "description": "Newline program ID",
      "password": true
    },
    {
      "type": "promptString",
      "id": "base-url",
      "description": "Newline API base URL",
      "default": "https://sandbox.newline53.com/api/v1"
    }
  ],
  "servers": {
    "newline": {
      "command": "npx",
      "args": ["-y", "git+https://github.com/newline53/newline-mcp-server"],
      "env": {
        "NEWLINE_HMAC_KEY": "${input:hmac-key}",
        "NEWLINE_PROGRAM_ID": "${input:program-id}",
        "NEWLINE_BASE_URL": "${input:base-url}"
      }
    }
  }
}
```

> Using Environment Variables

```json
{
  "servers": {
    "special-mcp-server": {
      "command": "npx",
      "args": ["git+https://github.com/newline53/newline-mcp-server"],
      "env": {
        "NEWLINE_HMAC_KEY": "${env:NEWLINE_HMAC_KEY}",
        "NEWLINE_PROGRAM_ID": "${env:NEWLINE_PROGRAM_ID}",
        "NEWLINE_BASE_URL": "${env:NEWLINE_BASE_URL}"
      }
    }
  }
}
``` 

### Windsurf

Add the following to your `~/.codeium/windsurf/mcp_config.json` file. To learn more, see the Windsurf [documentation](https://docs.windsurf.com/windsurf/cascade/mcp).

```json
{
  "mcpServers": {
    "newline": {
      "command": "npx",
      "args": ["-y", "git+https://github.com/newline53/newline-mcp-server"],
      "env": {
        "NEWLINE_HMAC_KEY": "<<YOUR_HMAC_KEY>>",
        "NEWLINE_PROGRAM_ID": "<<YOUR_PROGRAM_ID>>",
        "NEWLINE_BASE_URL": "https://sandbox.newline53.com/api/v1"
      }
    }
  }
}
```

### Claude Desktop

Add the following to your `claude_desktop_config.json` file. To learn more, see the Claude Desktop [documentation](https://modelcontextprotocol.io/quickstart/user).

```json
{
  "mcpServers": {
    "newline": {
      "command": "npx",
      "args": ["-y", "git+https://github.com/newline53/newline-mcp-server"],
      "env": {
        "NEWLINE_HMAC_KEY": "<<YOUR_HMAC_KEY>>",
        "NEWLINE_PROGRAM_ID": "<<YOUR_PROGRAM_ID>>",
        "NEWLINE_BASE_URL": "https://sandbox.newline53.com/api/v1"
      }
    }
  }
}
```

### CLI

Start the MCP server locally with this command:

```bash
NEWLINE_HMAC_KEY="<<YOUR_HMAC_KEY>>" \
NEWLINE_PROGRAM_ID="<<YOUR_PROGRAM_ID>>" \
NEWLINE_BASE_URL="https://sandbox.newline53.com/api/v1" \
npx -y git+https://github.com/newline53/newline-mcp-server
```

Or install globally:

```bash 
npm install -g git+https://github.com/newline53/newline-mcp-server

# Run the server
NEWLINE_HMAC_KEY="<<YOUR_HMAC_KEY>>" \
NEWLINE_PROGRAM_ID="<<YOUR_PROGRAM_ID>>" \
NEWLINE_BASE_URL="https://sandbox.newline53.com/api/v1" \
newline
```

## Configuration

The Newline MCP server requires the following environment variables:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEWLINE_HMAC_KEY` | Your Newline API HMAC authentication key | Yes | - |
| `NEWLINE_PROGRAM_ID` | Your Newline program identifier | Yes | - |
| `NEWLINE_BASE_URL` | Newline API base URL | No | `https://sandbox.newline53.com/api/v1` |
| `https_proxy` / `HTTPS_PROXY` | HTTPS proxy URL (optional) | No | - |

### API Environments

- **Sandbox**: `https://sandbox.newline53.com/api/v1` (default)
- **Production**: Contact Newline for production endpoint details

### Security Considerations

We strongly recommend:
- Never commit credentials to version control
- Use environment variables or secure credential management
- Regularly rotate your HMAC keys
- Use different credentials for development and production environments
- Enable human confirmation of tools when using the MCP server to avoid unintended operations

## Tools

The server exposes 35+ [MCP tools](https://modelcontextprotocol.io/docs/concepts/tools) for interacting with the Newline Banking API. We recommend enabling human confirmation of tools and exercising caution when using the Newline MCP with other servers to avoid prompt injection attacks.

| Resource | Tool | Description |
|----------|------|-------------|
| **Synthetic Accounts** | `get-synthetic-account-types` | List all available account types |
| | `get-synthetic-accounts` | List all synthetic accounts |
| | `get-synthetic-account` | Get details of a specific account |
| | `create-synthetic-account` | Create a new synthetic account |
| | `delete-synthetic-accounts` | Delete a synthetic account |
| **Transfers** | `list-newline-transfers` | List all transfers |
| | `get-newline-transfer` | Get details of a specific transfer |
| | `create-newline-transfer` | Create a new transfer (Wire, ACH, Instant Payment) |
| **Customers** | `list-customers` | List all customers |
| | `get-customer` | Get details of a specific customer |
| **Transactions** | `list-transactions` | List all transactions |
| | `get-transaction` | Get details of a specific transaction |
| **Pools** | `list-pools` | List all pools |
| | `get-pool` | Get details of a specific pool |
| **Products** | `list-products` | List all products |
| | `get-product` | Get details of a specific product |
| **Customer Products** | `list-customer-products` | List all customer products |
| | `get-customer-product` | Get details of a specific customer product |
| **Custodial Accounts** | `list-custodial-accounts` | List all custodial accounts |
| | `get-custodial-account` | Get details of a specific custodial account |
| **Transaction Events** | `list-transaction-events` | List all transaction events |
| | `get-transaction-event` | Get details of a specific transaction event |
| **Synthetic Line Items** | `list-synthetic-line-items` | List all synthetic line items |
| | `get-synthetic-line-item` | Get details of a specific synthetic line item |
| **Custodial Line Items** | `list-custodial-line-items` | List all custodial line items |
| | `get-custodial-line-item` | Get details of a specific custodial line item |
| **Virtual Reference Numbers** | `list-virtual-reference-numbers` | List all virtual reference numbers |
| | `get-virtual-reference-number` | Get details of a specific virtual reference number |
| **Returns** | `list-returns` | List all returns |
| | `get-return` | Get details of a specific return |
| **Combined Transfers** | `list-combined-transfers` | List all combined transfers |
| | `get-combined-transfer` | Get details of a specific combined transfer |
| **Customer Activities** | `list-customer-activities` | List all customer activities |
| | `get-customer-activity` | Get details of a specific customer activity |

## Skills

This server ships with ten bundled **agent skills** in the `skills/` directory. Skills are
workflow guides that an AI agent loads on-demand to execute common multi-step banking
operations correctly — they encode the right sequence of tool calls, required parameters,
and decision logic for each scenario so you don't have to prompt the agent from scratch.

The first six are focused task skills; the additional four are broader, reusable workflow
skills adapted for general Agent Skills compatible harnesses such as Pi, Claude Code, and
OpenAI Codex.

For installation and usage guidance across different agent harnesses, see
[`skills/README.md`](skills/README.md).

| Skill | When to use it |
|---|---|
| `create-transfer` | Send money, initiate a transfer, or move funds between accounts (Wire, ACH, or Instant Payment) |
| `investigate-transfer` | Debug, trace, audit, or check the status and history of a transfer |
| `new-account-setup` | Open, create, or provision a new synthetic account for a customer |
| `customer-overview` | Get a full summary or profile of a customer |
| `account-reconciliation` | Verify that balances match between the synthetic and custodial layers |
| `return-resolution` | Handle, investigate, or understand a returned payment |
| `managing-users-and-accounts` | Broad customer/account workflow for lookup, KYC review, pool/type selection, and synthetic account creation |
| `making-payments` | Broad payment workflow for validating parties and creating wire, ACH, or instant payment transfers |
| `payment-operations` | Post-payment operations workflow for failures, returns, lifecycle review, and grouped transfer analysis |
| `transaction-reporting` | Reporting workflow for transaction history, event timelines, balance posting evidence, and audit summaries |

### Compatibility

Skills follow the [Agent Skills open standard](https://agentskills.io/specification) and
work with any compatible agent harness:

- **Pi** — skills in `skills/` are auto-discovered as a package; no configuration needed.
  Force-load a skill with `/skill:<name>` (e.g. `/skill:create-transfer`).
- **Claude Code / OpenAI Codex / other harnesses** — point your harness at the `skills/`
  directory in its settings, or copy individual skill directories into your global skills
  folder (e.g. `~/.agents/skills/`). These skills are plain Agent Skills directories and do
  not rely on Pi-only metadata.

### Example prompts

Once your agent harness has loaded the skills, use natural language:

```
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

The agent will automatically load the relevant skill and follow its step-by-step
instructions using the MCP tools.

## Docker Usage

You can also run the Newline MCP server in a Docker container.

### Build the Docker Image

First, build the Docker image from the root directory of the project:

```bash
docker build -t newline-mcp-server:latest .
```

### Run the Container

Then run the container with your credentials:

```bash
docker run \
  -e NEWLINE_HMAC_KEY="<<YOUR_HMAC_KEY>>" \
  -e NEWLINE_PROGRAM_ID="<<YOUR_PROGRAM_ID>>" \
  -e NEWLINE_BASE_URL="https://sandbox.newline53.com/api/v1" \
  newline-mcp-server:latest
```

### MCP Configuration with Docker

Add the following to your MCP configuration:

```json
{
  "servers": {
    "newline-docker": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e", "NEWLINE_HMAC_KEY=<<YOUR_HMAC_KEY>>",
        "-e", "NEWLINE_PROGRAM_ID=<<YOUR_PROGRAM_ID>>",
        "-e", "NEWLINE_BASE_URL=https://sandbox.newline53.com/api/v1",
        "newline-mcp-server:latest"
      ]
    }
  }
}
```

## Example Usage

Here are some example prompts you can use with AI assistants connected to the Newline MCP server:

### Account Management
- "List all synthetic account types available"
- "Show me all my synthetic accounts"
- "Create a new checking account for customer John Doe"
- "Get details for synthetic account with ID abc123"

### Transfer Operations
- "List all recent transfers"
- "Create a wire transfer of $1000 from account A to account B"
- "Show me the status of transfer xyz789"
- "List all ACH transfers from last month"

### Customer Information
- "List all customers"
- "Find customer details for john.doe@example.com"
- "Show me all customers created this week"

### Transaction Queries
- "List all transactions for account abc123"
- "Show me transaction details for txn_456"
- "Get all transactions over $5000"

### Resource Management
- "List all available pools"
- "Show me all products"
- "Get custodial account information"

## Troubleshooting

### Authentication Errors

If you receive authentication errors, verify:
- Your `NEWLINE_HMAC_KEY` is correct and active
- Your `NEWLINE_PROGRAM_ID` matches your Newline program
- You're using the correct `NEWLINE_BASE_URL` for your environment

### Connection Issues

If the MCP server fails to connect:
- Check your network connectivity
- Verify any proxy settings if required (`https_proxy` environment variable)
- Ensure the Newline API endpoint is accessible from your network

### Tool Execution Errors

If tools fail to execute:
- Verify you have the necessary permissions for the operation
- Check that required parameters are provided
- Review the error message for specific guidance
- Ensure your API credentials have access to the requested resources

## Autonomous Agents

If you're building agentic software, you can integrate the Newline MCP server into your autonomous workflows. The server supports standard MCP protocol and can be used with frameworks like:

- OpenAI's Responses API
- LangChain
- AutoGPT
- Custom agent implementations

Example integration with environment variables:

```python
import os

mcp_config = {
    "command": "npx",
    "args": ["-y", "git+https://github.com/newline53/newline-mcp-server"],
    "env": {
        "NEWLINE_HMAC_KEY": os.getenv("NEWLINE_HMAC_KEY"),
        "NEWLINE_PROGRAM_ID": os.getenv("NEWLINE_PROGRAM_ID"),
        "NEWLINE_BASE_URL": os.getenv("NEWLINE_BASE_URL", "https://sandbox.newline53.com/api/v1")
    }
}
```

## Development and Testing

### Local Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/newline53/newline-mcp-server.git
cd newline-mcp-server
npm install
```

Build the project:

```bash
npm run build
```

Run tests:

```bash
npm test
```

### Running Locally

After building, you can run the server locally:

```bash
node dist/index.js
```

Or use the development configuration in your MCP client:

```json
{
  "servers": {
    "newline-local": {
      "command": "node",
      "args": ["/path/to/newline-mcp-server/dist/index.js"],
      "env": {
        "NEWLINE_HMAC_KEY": "<<YOUR_HMAC_KEY>>",
        "NEWLINE_PROGRAM_ID": "<<YOUR_PROGRAM_ID>>",
        "NEWLINE_BASE_URL": "https://sandbox.newline53.com/api/v1"
      }
    }
  }
}
```

## Features

- **🔐 Secure Authentication**: JWT-based authentication with HMAC signing
- **🏦 Banking Operations**: Comprehensive tools for account and transfer management
- **👥 Customer Management**: List and retrieve customer information
- **💰 Transaction Tracking**: Access transaction data and events
- **📊 Resource Management**: Manage pools, products, and custodial accounts
- **🔄 Transfer Types**: Support for Wire, ACH, and Instant Payment transfers
- **🌐 Proxy Support**: Configurable HTTPS proxy for corporate environments
- **📝 Type Safety**: Full TypeScript support with type definitions
- **✅ Validation**: Input validation using Zod schemas
- **🛡️ Error Handling**: Comprehensive error handling and logging

## Support

For issues, questions, or feature requests:
- Email: VulnerabilityManagement.Bancorp@53.com
- GitHub Issues: https://github.com/newline53/newline-mcp-server/issues
- Documentation: https://github.com/newline53/newline-mcp-server#readme

## License

Apache 2.0

## See Also

- [Newline API Documentation](https://developers.newline53.com)
- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [Building with MCP](https://modelcontextprotocol.io/docs)
