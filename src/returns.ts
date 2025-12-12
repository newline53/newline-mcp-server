import { fetchData } from "./fetch.js";
import { z } from "zod";

interface ListResponse<T> {
  total_count: number;
  count: number;
  limit: number;
  offset: number;
  data: T[];
}

interface Return {
  uid: string;
  external_uid: string;
  original_transaction_uid: string;
  return_reason: string;
  amount: string;
  currency: string;
  status: string;
  created_at: string;
  processed_at: string | null;
}

class ReturnsService {
  baseUrl: string;
  authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  private formatReturn(returnItem: Return): string {
    return [
      `UID: ${returnItem.uid}`,
      `External UID: ${returnItem.external_uid}`,
      `Original Transaction UID: ${returnItem.original_transaction_uid}`,
      `Return Reason: ${returnItem.return_reason}`,
      `Amount: ${returnItem.amount} ${returnItem.currency}`,
      `Status: ${returnItem.status}`,
      `Created At: ${returnItem.created_at}`,
      `Processed At: ${returnItem.processed_at || "Not processed"}`,
      "---",
    ].join("\n");
  }

  async listReturns(): Promise<any> {
    const response = await fetchData<ListResponse<Return>>(
      `${this.baseUrl}/returns`,
      this.authToken,
    );

    if (!response) {
      return {
        content: [{ type: "text", text: "Failed to retrieve returns" }],
      };
    }

    const returns = response.data || [];
    if (returns.length === 0) {
      return { content: [{ type: "text", text: "No returns found" }] };
    }

    const formattedReturns = returns.map((ret) => this.formatReturn(ret));
    return {
      content: [
        {
          type: "text",
          text: `Returns (${response.count} of ${
            response.total_count
          }):\n\n${formattedReturns.join("\n")}`,
        },
      ],
    };
  }

  async getReturn(uid: string): Promise<any> {
    const response = await fetchData<Return>(
      `${this.baseUrl}/returns/${uid}`,
      this.authToken,
    );

    if (!response) {
      return { content: [{ type: "text", text: "Failed to retrieve return" }] };
    }

    return {
      content: [
        {
          type: "text",
          text: `Return Details:\n\n${this.formatReturn(response)}`,
        },
      ],
    };
  }

  register(server: any) {
    server.tool("list-returns", "Get a list of returns", {}, async () =>
      this.listReturns(),
    );

    server.tool(
      "get-return",
      "Get details for a specific return",
      {
        uid: z.string().describe("The return UID"),
      },
      async ({ uid }: { uid: string }) => this.getReturn(uid),
    );
  }
}

export default ReturnsService;
