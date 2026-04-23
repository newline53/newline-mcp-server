#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import Auth from "./auth.js";
import SyntheticAccounts from "./synthetic_accounts.js";
import TransfersService from "./transfers.js";
import CustomersService from "./customers.js";
import TransactionsService from "./transactions.js";
import PoolsService from "./pools.js";
import ProductsService from "./products.js";
import CustomerProductsService from "./customer_products.js";
import CustodialAccountsService from "./custodial_accounts.js";
import TransactionEventsService from "./transaction_events.js";
import SyntheticLineItemsService from "./synthetic_line_items.js";
import CustodialLineItemsService from "./custodial_line_items.js";
import VirtualReferenceNumbersService from "./virtual_reference_numbers.js";
import ReturnsService from "./returns.js";
import CombinedTransfersService from "./combined_transfers.js";
import CustomerActivitiesService from "./customer_activities.js";
import { getNewlineConfig } from "./config.js";

// Create server instance
const server = new McpServer({
  name: "newline",
  version: "1.0.0",
});

async function main() {
  const transport = new StdioServerTransport();
  const config = getNewlineConfig();
  const auth = new Auth(config);
  const token = await auth.getAuthToken();
  const baseNewlineUrl = config.base_url;

  // Initialize services
  const syntheticAccounts = new SyntheticAccounts(baseNewlineUrl, token);
  const transfers = new TransfersService(baseNewlineUrl, token);
  const customers = new CustomersService(baseNewlineUrl, token);
  const transactions = new TransactionsService(baseNewlineUrl, token);
  const pools = new PoolsService(baseNewlineUrl, token);
  const products = new ProductsService(baseNewlineUrl, token);
  const customerProducts = new CustomerProductsService(baseNewlineUrl, token);
  const custodialAccounts = new CustodialAccountsService(baseNewlineUrl, token);
  const transactionEvents = new TransactionEventsService(baseNewlineUrl, token);
  const syntheticLineItems = new SyntheticLineItemsService(
    baseNewlineUrl,
    token,
  );
  const custodialLineItems = new CustodialLineItemsService(
    baseNewlineUrl,
    token,
  );
  const virtualReferenceNumbers = new VirtualReferenceNumbersService(
    baseNewlineUrl,
    token,
  );
  const returns = new ReturnsService(baseNewlineUrl, token);
  const combinedTransfers = new CombinedTransfersService(baseNewlineUrl, token);
  const customerActivities = new CustomerActivitiesService(
    baseNewlineUrl,
    token,
  );

  // Register services
  syntheticAccounts.register(server);
  transfers.register(server);
  customers.register(server);
  transactions.register(server);
  pools.register(server);
  products.register(server);
  customerProducts.register(server);
  custodialAccounts.register(server);
  transactionEvents.register(server);
  syntheticLineItems.register(server);
  custodialLineItems.register(server);
  virtualReferenceNumbers.register(server);
  returns.register(server);
  combinedTransfers.register(server);
  customerActivities.register(server);

  await server.connect(transport);
  console.error("Newline MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
