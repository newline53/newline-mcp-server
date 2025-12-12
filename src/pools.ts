import { fetchData } from "./fetch.js";
import { z } from "zod";

interface ListResponse<T> {
  total_count: number;
  count: number;
  limit: number;
  offset: number;
  data: T[];
}

interface Pool {
  uid: string;
  external_uid: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  customer_uids: string[];
  synthetic_account_uids: string[];
}

class PoolsService {
  baseUrl: string;
  authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  private formatPool(pool: Pool): string {
    return [
      `UID: ${pool.uid}`,
      `External UID: ${pool.external_uid}`,
      `Name: ${pool.name}`,
      `Description: ${pool.description}`,
      `Customer UIDs: ${pool.customer_uids.join(", ") || "None"}`,
      `Synthetic Account UIDs: ${
        pool.synthetic_account_uids.join(", ") || "None"
      }`,
      `Created At: ${pool.created_at}`,
      `Updated At: ${pool.updated_at}`,
      "---",
    ].join("\n");
  }

  async listPools(): Promise<any> {
    const response = await fetchData<ListResponse<Pool>>(
      `${this.baseUrl}/pools`,
      this.authToken,
    );

    if (!response) {
      return { content: [{ type: "text", text: "Failed to retrieve pools" }] };
    }

    const pools = response.data || [];
    if (pools.length === 0) {
      return { content: [{ type: "text", text: "No pools found" }] };
    }

    const formattedPools = pools.map((pool) => this.formatPool(pool));
    return {
      content: [
        {
          type: "text",
          text: `Pools (${response.count} of ${
            response.total_count
          }):\n\n${formattedPools.join("\n")}`,
        },
      ],
    };
  }

  async getPool(uid: string): Promise<any> {
    const response = await fetchData<Pool>(
      `${this.baseUrl}/pools/${uid}`,
      this.authToken,
    );

    if (!response) {
      return { content: [{ type: "text", text: "Failed to retrieve pool" }] };
    }

    return {
      content: [
        {
          type: "text",
          text: `Pool Details:\n\n${this.formatPool(response)}`,
        },
      ],
    };
  }

  register(server: any) {
    server.tool("list-pools", "Get a list of pools", {}, async () =>
      this.listPools(),
    );

    server.tool(
      "get-pool",
      "Get details for a specific pool",
      {
        uid: z.string().describe("The pool UID"),
      },
      async ({ uid }: { uid: string }) => this.getPool(uid),
    );
  }
}

export default PoolsService;
