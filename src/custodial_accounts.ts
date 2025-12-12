import { fetchData } from "./fetch.js";
import { z } from "zod";

interface ListResponse<T> {
  total_count: number;
  count: number;
  limit: number;
  offset: number;
  data: T[];
}

interface CustodialAccount {
  uid: string;
  external_uid: string;
  name: string;
  account_number: string;
  routing_number: string;
  account_type: string;
  status: string;
  balance: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

class CustodialAccountsService {
  baseUrl: string;
  authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  private formatCustodialAccount(ca: CustodialAccount): string {
    return [
      `UID: ${ca.uid}`,
      `External UID: ${ca.external_uid}`,
      `Name: ${ca.name}`,
      `Account Number: ${ca.account_number}`,
      `Routing Number: ${ca.routing_number}`,
      `Account Type: ${ca.account_type}`,
      `Status: ${ca.status}`,
      `Balance: ${ca.balance} ${ca.currency}`,
      `Created At: ${ca.created_at}`,
      `Updated At: ${ca.updated_at}`,
      "---",
    ].join("\n");
  }

  async listCustodialAccounts(): Promise<any> {
    const response = await fetchData<ListResponse<CustodialAccount>>(
      `${this.baseUrl}/custodial_accounts`,
      this.authToken,
    );

    if (!response) {
      return {
        content: [
          { type: "text", text: "Failed to retrieve custodial accounts" },
        ],
      };
    }

    const accounts = response.data || [];
    if (accounts.length === 0) {
      return {
        content: [{ type: "text", text: "No custodial accounts found" }],
      };
    }

    const formattedAccounts = accounts.map((account) =>
      this.formatCustodialAccount(account),
    );
    return {
      content: [
        {
          type: "text",
          text: `Custodial Accounts (${response.count} of ${
            response.total_count
          }):\n\n${formattedAccounts.join("\n")}`,
        },
      ],
    };
  }

  async getCustodialAccount(uid: string): Promise<any> {
    const response = await fetchData<CustodialAccount>(
      `${this.baseUrl}/custodial_accounts/${uid}`,
      this.authToken,
    );

    if (!response) {
      return {
        content: [
          { type: "text", text: "Failed to retrieve custodial account" },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Custodial Account Details:\n\n${this.formatCustodialAccount(
            response,
          )}`,
        },
      ],
    };
  }

  register(server: any) {
    server.tool(
      "list-custodial-accounts",
      "Get a list of custodial accounts",
      {},
      async () => this.listCustodialAccounts(),
    );

    server.tool(
      "get-custodial-account",
      "Get details for a specific custodial account",
      {
        uid: z.string().describe("The custodial account UID"),
      },
      async ({ uid }: { uid: string }) => this.getCustodialAccount(uid),
    );
  }
}

export default CustodialAccountsService;
