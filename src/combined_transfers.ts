import { fetchData } from "./fetch.js";
import { z } from "zod";

interface ListResponse<T> {
  total_count: number;
  count: number;
  limit: number;
  offset: number;
  data: T[];
}

interface CombinedTransfer {
  uid: string;
  external_uid: string;
  transfer_uids: string[];
  status: string;
  total_amount: string;
  currency: string;
  created_at: string;
  completed_at: string | null;
}

class CombinedTransfersService {
  baseUrl: string;
  authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  private formatCombinedTransfer(ct: CombinedTransfer): string {
    return [
      `UID: ${ct.uid}`,
      `External UID: ${ct.external_uid}`,
      `Transfer UIDs: ${ct.transfer_uids.join(", ")}`,
      `Status: ${ct.status}`,
      `Total Amount: ${ct.total_amount} ${ct.currency}`,
      `Created At: ${ct.created_at}`,
      `Completed At: ${ct.completed_at || "Not completed"}`,
      "---",
    ].join("\n");
  }

  async listCombinedTransfers(): Promise<any> {
    const response = await fetchData<ListResponse<CombinedTransfer>>(
      `${this.baseUrl}/combined_transfers`,
      this.authToken,
    );

    if (!response) {
      return {
        content: [
          { type: "text", text: "Failed to retrieve combined transfers" },
        ],
      };
    }

    const transfers = response.data || [];
    if (transfers.length === 0) {
      return {
        content: [{ type: "text", text: "No combined transfers found" }],
      };
    }

    const formattedTransfers = transfers.map((transfer) =>
      this.formatCombinedTransfer(transfer),
    );
    return {
      content: [
        {
          type: "text",
          text: `Combined Transfers (${response.count} of ${
            response.total_count
          }):\n\n${formattedTransfers.join("\n")}`,
        },
      ],
    };
  }

  async getCombinedTransfer(uid: string): Promise<any> {
    const response = await fetchData<CombinedTransfer>(
      `${this.baseUrl}/combined_transfers/${uid}`,
      this.authToken,
    );

    if (!response) {
      return {
        content: [
          { type: "text", text: "Failed to retrieve combined transfer" },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Combined Transfer Details:\n\n${this.formatCombinedTransfer(
            response,
          )}`,
        },
      ],
    };
  }

  register(server: any) {
    server.tool(
      "list-combined-transfers",
      "Get a list of combined transfers",
      {},
      async () => this.listCombinedTransfers(),
    );

    server.tool(
      "get-combined-transfer",
      "Get details for a specific combined transfer",
      {
        uid: z.string().describe("The combined transfer UID"),
      },
      async ({ uid }: { uid: string }) => this.getCombinedTransfer(uid),
    );
  }
}

export default CombinedTransfersService;
