import { fetchData } from "./fetch.js";
import { z } from "zod";

interface ListResponse<T> {
  total_count: number;
  count: number;
  limit: number;
  offset: number;
  data: T[];
}

interface SyntheticLineItem {
  uid: string;
  synthetic_account_uid: string;
  transaction_uid: string;
  amount: string;
  currency: string;
  description: string;
  created_at: string;
  balance_after: string;
}

class SyntheticLineItemsService {
  baseUrl: string;
  authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  private formatSyntheticLineItem(item: SyntheticLineItem): string {
    return [
      `UID: ${item.uid}`,
      `Synthetic Account UID: ${item.synthetic_account_uid}`,
      `Transaction UID: ${item.transaction_uid}`,
      `Amount: ${item.amount} ${item.currency}`,
      `Description: ${item.description}`,
      `Balance After: ${item.balance_after}`,
      `Created At: ${item.created_at}`,
      "---",
    ].join("\n");
  }

  async listSyntheticLineItems(): Promise<any> {
    const response = await fetchData<ListResponse<SyntheticLineItem>>(
      `${this.baseUrl}/synthetic_line_items`,
      this.authToken,
    );

    if (!response) {
      return {
        content: [
          { type: "text", text: "Failed to retrieve synthetic line items" },
        ],
      };
    }

    const items = response.data || [];
    if (items.length === 0) {
      return {
        content: [{ type: "text", text: "No synthetic line items found" }],
      };
    }

    const formattedItems = items.map((item) =>
      this.formatSyntheticLineItem(item),
    );
    return {
      content: [
        {
          type: "text",
          text: `Synthetic Line Items (${response.count} of ${
            response.total_count
          }):\n\n${formattedItems.join("\n")}`,
        },
      ],
    };
  }

  async getSyntheticLineItem(uid: string): Promise<any> {
    const response = await fetchData<SyntheticLineItem>(
      `${this.baseUrl}/synthetic_line_items/${uid}`,
      this.authToken,
    );

    if (!response) {
      return {
        content: [
          { type: "text", text: "Failed to retrieve synthetic line item" },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Synthetic Line Item Details:\n\n${this.formatSyntheticLineItem(
            response,
          )}`,
        },
      ],
    };
  }

  register(server: any) {
    server.tool(
      "list-synthetic-line-items",
      "Get a list of synthetic line items",
      {},
      async () => this.listSyntheticLineItems(),
    );

    server.tool(
      "get-synthetic-line-item",
      "Get details for a specific synthetic line item",
      {
        uid: z.string().describe("The synthetic line item UID"),
      },
      async ({ uid }: { uid: string }) => this.getSyntheticLineItem(uid),
    );
  }
}

export default SyntheticLineItemsService;
