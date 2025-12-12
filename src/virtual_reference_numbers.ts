import { fetchData } from "./fetch.js";
import { z } from "zod";

interface ListResponse<T> {
  total_count: number;
  count: number;
  limit: number;
  offset: number;
  data: T[];
}

interface VirtualReferenceNumber {
  uid: string;
  reference_number: string;
  status: string;
  customer_uid: string;
  synthetic_account_uid: string;
  created_at: string;
  expires_at: string | null;
  locked_at: string | null;
  locked_reason: string | null;
}

class VirtualReferenceNumbersService {
  baseUrl: string;
  authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  private formatVirtualReferenceNumber(vrn: VirtualReferenceNumber): string {
    return [
      `UID: ${vrn.uid}`,
      `Reference Number: ${vrn.reference_number}`,
      `Status: ${vrn.status}`,
      `Customer UID: ${vrn.customer_uid}`,
      `Synthetic Account UID: ${vrn.synthetic_account_uid}`,
      `Created At: ${vrn.created_at}`,
      `Expires At: ${vrn.expires_at || "Never"}`,
      `Locked At: ${vrn.locked_at || "Not locked"}`,
      `Lock Reason: ${vrn.locked_reason || "None"}`,
      "---",
    ].join("\n");
  }

  async listVirtualReferenceNumbers(): Promise<any> {
    const response = await fetchData<ListResponse<VirtualReferenceNumber>>(
      `${this.baseUrl}/virtual_reference_numbers`,
      this.authToken,
    );

    if (!response) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve virtual reference numbers",
          },
        ],
      };
    }

    const vrns = response.data || [];
    if (vrns.length === 0) {
      return {
        content: [{ type: "text", text: "No virtual reference numbers found" }],
      };
    }

    const formattedVrns = vrns.map((vrn) =>
      this.formatVirtualReferenceNumber(vrn),
    );
    return {
      content: [
        {
          type: "text",
          text: `Virtual Reference Numbers (${response.count} of ${
            response.total_count
          }):\n\n${formattedVrns.join("\n")}`,
        },
      ],
    };
  }

  async getVirtualReferenceNumber(uid: string): Promise<any> {
    const response = await fetchData<VirtualReferenceNumber>(
      `${this.baseUrl}/virtual_reference_numbers/${uid}`,
      this.authToken,
    );

    if (!response) {
      return {
        content: [
          { type: "text", text: "Failed to retrieve virtual reference number" },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Virtual Reference Number Details:\n\n${this.formatVirtualReferenceNumber(
            response,
          )}`,
        },
      ],
    };
  }

  register(server: any) {
    server.tool(
      "list-virtual-reference-numbers",
      "Get a list of virtual reference numbers",
      {},
      async () => this.listVirtualReferenceNumbers(),
    );

    server.tool(
      "get-virtual-reference-number",
      "Get details for a specific virtual reference number",
      {
        uid: z.string().describe("The virtual reference number UID"),
      },
      async ({ uid }: { uid: string }) => this.getVirtualReferenceNumber(uid),
    );
  }
}

export default VirtualReferenceNumbersService;
