import { fetchData, postData, deleteData } from "./fetch.js";
import { z } from "zod";

interface CounterpartyAddress {
  street_number: number;
  street1: string;
  street2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface InstantPayment {
  counterparty_address: CounterpartyAddress;
  counterparty_name: string;
}

interface Ach {
  account_type: string;
  counterparty_name: string;
}

interface CreateSyntheticAccountPayload {
  instant_payment?: InstantPayment;
  wire?: Wire;
  ach?: Ach;
  external_uid?: string;
  name: string;
  pool_uid: string;
  synthetic_account_type_uid: string;
  routing_number?: string;
  account_number?: string;
}

interface NewlineSA {
  description: string;
  name: string;
  program_uid: string;
  synthetic_account_category: string;
  uid: string;
}

interface ListSyntheticAccountTypesResponse {
  total_count: number;
  count: number;
  limit: number;
  offset: number;
  data: NewlineSA[];
}

interface AssetBalance {
  asset_quantity: string;
  asset_type: string;
  current_usd_value: string;
  custodial_account_uid: string;
  custodial_account_name: string;
  debit: boolean;
}

interface CounterpartyBankAddress {
  line1: string;
  line2: string;
  line3: string | null;
  country: string;
}

interface Wire {
  counterparty_name: string;
  counterparty_bank_address?: CounterpartyBankAddress;
  counterparty_bank_name?: string;
}

interface InstantPayment {
  counterparty_name: string;
}

interface Ach {
  counterparty_name: string;
  account_type: string;
}

interface NewlineSADetail {
  uid: string;
  external_uid: string;
  name: string;
  pool_uid: string;
  synthetic_account_type_uid: string;
  synthetic_account_category: string;
  status: string;
  liability: boolean;
  net_usd_balance: string | null;
  net_usd_pending_balance: string | null;
  net_usd_available_balance: string | null;
  asset_balances: AssetBalance[] | null;
  master_account: boolean;
  custodial_account_uids: string[];
  routing_number: string;
  opened_at: string;
  closed_at: string | null;
  instant_payment: InstantPayment | null;
  wire: Wire | null;
  ach?: Ach;
  account_number?: string;
  account_number_last_four?: string;
}

interface ListSyntheticAccountResponse {
  total_count: number;
  count: number;
  limit: number;
  offset: number;
  data: NewlineSADetail[];
}
class SyntheticAccounts {
  baseUrl: string;
  authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  #formatSyntheticAccountType(acct: NewlineSA): string {
    return [
      `Description: ${acct.description || "Unknown"}`,
      `Name: ${acct.name || "Unknown"}`,
      `Program UID: ${acct.program_uid || "Unknown"}`,
      `Category: ${acct.synthetic_account_category || "Unknown"}`,
      `UID: ${acct.uid || "Unknown"}`,
      "---",
    ].join("\n");
  }

  #formatSyntheticAccount(acct: NewlineSADetail): string {
    const assetBalances = acct.asset_balances
      ? acct.asset_balances
          .map((balance) =>
            [
              `  Asset Quantity: ${balance.asset_quantity}`,
              `  Asset Type: ${balance.asset_type}`,
              `  Current USD Value: ${balance.current_usd_value}`,
              `  Custodial Account UID: ${balance.custodial_account_uid}`,
              `  Custodial Account Name: ${balance.custodial_account_name}`,
              `  Debit: ${balance.debit}`,
            ].join("\n"),
          )
          .join("\n\n")
      : "None";

    const instantPayment = acct.instant_payment
      ? `  Counterparty Name: ${acct.instant_payment.counterparty_name}`
      : "None";

    const wire = acct.wire
      ? [
          `  Counterparty Name: ${acct.wire.counterparty_name}`,
          `  Counterparty Bank Name: ${acct.wire.counterparty_bank_name}`,
          `  Counterparty Bank Address:`,
          `    Line 1: ${acct.wire.counterparty_bank_address?.line1 || "None"}`,
          `    Line 2: ${acct.wire.counterparty_bank_address?.line2 || "None"}`,
          `    Line 3: ${acct.wire.counterparty_bank_address?.line3 || "None"}`,
          `    Country: ${
            acct.wire.counterparty_bank_address?.country || "None"
          }`,
        ].join("\n")
      : "None";

    const ach = acct.ach
      ? [
          `  Counterparty Name: ${acct.ach.counterparty_name}`,
          `  Account Type: ${acct.ach.account_type}`,
        ].join("\n")
      : "None";

    return [
      `UID: ${acct.uid}`,
      `External UID: ${acct.external_uid}`,
      `Name: ${acct.name}`,
      `Pool UID: ${acct.pool_uid}`,
      `Synthetic Account Type UID: ${acct.synthetic_account_type_uid}`,
      `Synthetic Account Category: ${acct.synthetic_account_category}`,
      `Status: ${acct.status}`,
      `Liability: ${acct.liability}`,
      `Net USD Balance: ${acct.net_usd_balance || "None"}`,
      `Net USD Pending Balance: ${acct.net_usd_pending_balance || "None"}`,
      `Net USD Available Balance: ${acct.net_usd_available_balance || "None"}`,
      `Asset Balances: ${assetBalances}`,
      `Master Account: ${acct.master_account}`,
      `Custodial Account UIDs: ${acct.custodial_account_uids.join(", ")}`,
      `Routing Number: ${acct.routing_number}`,
      `Opened At: ${acct.opened_at}`,
      `Closed At: ${acct.closed_at || "None"}`,
      `Instant Payment: ${instantPayment}`,
      `Wire: ${wire}`,
      `ACH: ${ach}`,
      `Account Number: ${acct.account_number || "None"}`,
      `Account Number Last Four: ${acct.account_number_last_four || "None"}`,
      "---",
    ].join("\n");
  }

  async getSyntheticAccountTypes(): Promise<any> {
    const accountData = await fetchData<ListSyntheticAccountTypesResponse>(
      this.baseUrl + "/synthetic_account_types",
      this.authToken,
    );

    if (!accountData) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve synthetic account types",
          },
        ],
      };
    }

    const accountTypes = accountData.data || [];
    if (accountTypes.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No active synthetic account types found`,
          },
        ],
      };
    }

    const formattedTypes = accountTypes.map(this.#formatSyntheticAccountType);
    const accountTypesText = `Active synthetic account types:\n\n${formattedTypes.join(
      "\n",
    )}`;

    return {
      content: [
        {
          type: "text",
          text: accountTypesText,
        },
      ],
    };
  }

  async getSyntheticAccounts(): Promise<any> {
    const accountData = await fetchData<ListSyntheticAccountResponse>(
      this.baseUrl + "/synthetic_accounts",
      this.authToken,
    );

    if (!accountData) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve synthetic accounts",
          },
        ],
      };
    }

    console.log(JSON.stringify(accountData.data, null, 2));

    const accountTypes = accountData.data || [];
    if (accountTypes.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No active synthetic accounts found`,
          },
        ],
      };
    }

    const formattedTypes = accountTypes.map(this.#formatSyntheticAccount);
    const accountsText = `Active synthetic accounts:\n\n${formattedTypes.join(
      "\n",
    )}`;

    return {
      content: [
        {
          type: "text",
          text: accountsText,
        },
      ],
    };
  }

  async getSyntheticAccount(uid: string): Promise<any> {
    const accountData = await fetchData<NewlineSADetail>(
      this.baseUrl + "/synthetic_accounts/" + uid,
      this.authToken,
    );

    if (!accountData) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve synthetic account",
          },
        ],
      };
    }

    const accountsText = `Account Detail:\n\n${this.#formatSyntheticAccount(
      accountData,
    )}`;

    return {
      content: [
        {
          type: "text",
          text: accountsText,
        },
      ],
    };
  }

  async createSyntheticAccount(
    payload: CreateSyntheticAccountPayload,
  ): Promise<any> {
    const url = `${this.baseUrl}/synthetic_accounts`;
    try {
      const response = await postData<NewlineSADetail>(
        url,
        this.authToken,
        payload,
      );
      if (!response) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to create synthetic account`,
            },
          ],
        };
      }
      return {
        content: [
          {
            type: "text",
            text: `Synthetic account created successfully: ${this.#formatSyntheticAccount(
              response,
            )}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to create synthetic account: ${error}`,
          },
        ],
      };
    }
  }

  async deleteSyntheticAccount(uid: string): Promise<any> {
    const url = `${this.baseUrl}/synthetic_accounts`;
    try {
      const response = await deleteData(url, this.authToken, uid);
      return {
        content: [
          {
            type: "text",
            text: `Synthetic account deleted successfully`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to delete synthetic account: ${error}`,
          },
        ],
      };
    }
  }

  register(server: any) {
    server.tool(
      "create-synthetic-account",
      "Create a synthetic account for newline",
      {
        instant_payment: z
          .object({
            counterparty_address: z.object({
              street_number: z.number(),
              street1: z.string(),
              street2: z.string(),
              city: z.string(),
              state: z.string(),
              postal_code: z.string(),
              country: z.string(),
            }),
            counterparty_name: z.string(),
          })
          .optional(),
        wire: z
          .object({
            counterparty_name: z.string(),
          })
          .optional(),
        ach: z
          .object({
            account_type: z.string(),
            counterparty_name: z.string(),
          })
          .optional(),
        external_uid: z.string().optional().describe("External UID"),
        name: z.string(),
        pool_uid: z.string(),
        synthetic_account_type_uid: z.string(),
        routing_number: z.string().optional(),
        account_number: z.string().optional(),
      },
      async (params: CreateSyntheticAccountPayload) =>
        this.createSyntheticAccount(params),
    );
    server.tool(
      "get-synthetic-account-types",
      "Get synthetic account types for newline",
      {},
      async () => this.getSyntheticAccountTypes(),
    );
    server.tool(
      "get-synthetic-accounts",
      "Get your synthetic accounts for newline",
      {},
      async () => this.getSyntheticAccounts(),
    );
    server.tool(
      "delete-synthetic-accounts",
      "delete a synthetic account by uid for newline",
      {
        uid: z.string().describe("The uid of the synthetic account to delete"),
      },
      async (uid: string) => this.deleteSyntheticAccount(uid),
    );
    server.tool(
      "get-synthetic-account",
      "Get synthetic account detail by uid for a newline account",
      {
        uid: z
          .string()
          .describe("The uid of the synthetic account to retrieve"),
      },
      async (uid: string) => this.getSyntheticAccount(uid),
    );
  }
}

export default SyntheticAccounts;
