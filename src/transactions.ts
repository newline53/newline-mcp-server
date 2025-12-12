import { fetchData } from "./fetch.js";
import { z } from "zod";

interface Transaction {
  uid: string;
  external_uid: string | null;
  synthetic_account_uid: string;
  customer_uid: string;
  transaction_type: string;
  status: string;
  amount: string;
  currency: string;
  description: string;
  created_at: string;
  updated_at: string;
  custodial_account_uid: string;
  transfer_uid: string | null;
  balance_after: string | null;
  metadata: Record<string, any>;
}

interface TransactionsResponse {
  total_count: number;
  count: number;
  limit: number;
  offset: number;
  data: Transaction[];
}

class TransactionsService {
  baseUrl: string;
  authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  private formatTransaction(transaction: Transaction): string {
    return [
      `UID: ${transaction.uid}`,
      `External UID: ${transaction.external_uid || "None"}`,
      `Synthetic Account UID: ${transaction.synthetic_account_uid}`,
      `Customer UID: ${transaction.customer_uid}`,
      `Type: ${transaction.transaction_type}`,
      `Status: ${transaction.status}`,
      `Amount: ${transaction.amount} ${transaction.currency}`,
      `Description: ${transaction.description}`,
      `Transfer UID: ${transaction.transfer_uid || "None"}`,
      `Custodial Account UID: ${transaction.custodial_account_uid}`,
      `Balance After: ${transaction.balance_after || "Unknown"}`,
      `Created At: ${transaction.created_at}`,
      `Updated At: ${transaction.updated_at}`,
      "---",
    ].join("\n");
  }

  async listTransactions(params?: {
    uid?: string[];
    external_uid?: string[];
    synthetic_account_uid?: string[];
    customer_uid?: string[];
    transaction_type?: string[];
    status?: string[];
    transfer_uid?: string[];
    limit?: number;
    offset?: number;
    sort?: string;
  }): Promise<any> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(`${key}[]`, v));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
    }

    const url = `${this.baseUrl}/transactions${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    const response = await fetchData<TransactionsResponse>(url, this.authToken);

    if (!response) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve transactions",
          },
        ],
      };
    }

    const transactions = response.data || [];
    if (transactions.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No transactions found",
          },
        ],
      };
    }

    const formattedTransactions = transactions.map(this.formatTransaction);
    const transactionsText = `Transactions (${response.count} of ${
      response.total_count
    }):\n\n${formattedTransactions.join("\n")}`;

    return {
      content: [
        {
          type: "text",
          text: transactionsText,
        },
      ],
    };
  }

  async getTransaction(uid: string): Promise<any> {
    const response = await fetchData<Transaction>(
      `${this.baseUrl}/transactions/${uid}`,
      this.authToken,
    );

    if (!response) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve transaction",
          },
        ],
      };
    }

    const transactionText = `Transaction Details:\n\n${this.formatTransaction(
      response,
    )}`;

    return {
      content: [
        {
          type: "text",
          text: transactionText,
        },
      ],
    };
  }

  register(server: any) {
    server.tool(
      "list-transactions",
      "Get a list of transactions",
      {
        uid: z
          .array(z.string())
          .optional()
          .describe("Filter by transaction UIDs"),
        external_uid: z
          .array(z.string())
          .optional()
          .describe("Filter by external UIDs"),
        synthetic_account_uid: z
          .array(z.string())
          .optional()
          .describe("Filter by synthetic account UIDs"),
        customer_uid: z
          .array(z.string())
          .optional()
          .describe("Filter by customer UIDs"),
        transaction_type: z
          .array(z.string())
          .optional()
          .describe("Filter by transaction type"),
        status: z.array(z.string()).optional().describe("Filter by status"),
        transfer_uid: z
          .array(z.string())
          .optional()
          .describe("Filter by transfer UIDs"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of items to retrieve"),
        offset: z
          .number()
          .optional()
          .describe("Index of the first item to retrieve"),
        sort: z.string().optional().describe("Sort order"),
      },
      async (params: any) => this.listTransactions(params),
    );

    server.tool(
      "get-transaction",
      "Get details for a specific transaction",
      {
        uid: z.string().describe("The transaction UID"),
      },
      async ({ uid }: { uid: string }) => this.getTransaction(uid),
    );
  }
}

export default TransactionsService;
