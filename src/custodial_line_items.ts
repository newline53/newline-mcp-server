import { fetchData } from "./fetch.js";
import { z } from "zod";

interface ListResponse<T> {
  total_count: number;
  count: number;
  limit: number;
  offset: number;
  data: T[];
}

interface CustodialLineItem {
  uid: string;
  custodial_account_uid: string;
  transaction_uid: string;
  amount: string;
  currency: string;
  description: string;
  created_at: string;
  balance_after: string;
}

class CustodialLineItemsService {
  baseUrl: string;
  authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  private formatCustodialLineItem(item: CustodialLineItem): string {
    return [
      `UID: ${item.uid}`,
      `Custodial Account UID: ${item.custodial_account_uid}`,
      `Transaction UID: ${item.transaction_uid}`,
      `Amount: ${item.amount} ${item.currency}`,
      `Description: ${item.description}`,
      `Balance After: ${item.balance_after}`,
      `Created At: ${item.created_at}`,
      "---",
    ].join("\n");
  }

  async listCustodialLineItems(): Promise<any> {
    const response = await fetchData<ListResponse<CustodialLineItem>>(
      `${this.baseUrl}/custodial_line_items`,
      this.authToken,
    );

    if (!response) {
      return {
        content: [
          { type: "text", text: "Failed to retrieve custodial line items" },
        ],
      };
    }

    const items = response.data || [];
    if (items.length === 0) {
      return {
        content: [{ type: "text", text: "No custodial line items found" }],
      };
    }

    const formattedItems = items.map((item) =>
      this.formatCustodialLineItem(item),
    );
    return {
      content: [
        {
          type: "text",
          text: `Custodial Line Items (${response.count} of ${
            response.total_count
          }):\n\n${formattedItems.join("\n")}`,
        },
      ],
    };
  }

  async getCustodialLineItem(uid: string): Promise<any> {
    const response = await fetchData<CustodialLineItem>(
      `${this.baseUrl}/custodial_line_items/${uid}`,
      this.authToken,
    );

    if (!response) {
      return {
        content: [
          { type: "text", text: "Failed to retrieve custodial line item" },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Custodial Line Item Details:\n\n${this.formatCustodialLineItem(
            response,
          )}`,
        },
      ],
    };
  }

  register(server: any) {
    server.tool(
      "list-custodial-line-items",
      "Get a list of custodial line items",
      {},
      async () => this.listCustodialLineItems(),
    );

    server.tool(
      "get-custodial-line-item",
      "Get details for a specific custodial line item",
      {
        uid: z.string().describe("The custodial line item UID"),
      },
      async ({ uid }: { uid: string }) => this.getCustodialLineItem(uid),
    );
  }
}

export default CustodialLineItemsService;
