import { fetchData } from "./fetch.js";
import { z } from "zod";

interface Customer {
  uid: string;
  external_uid: string;
  activated_at: string;
  created_at: string;
  customer_type: string;
  email: string;
  client_verified: boolean;
  kyc_status: string;
  kyc_status_reasons: string[];
  lock_reason: string | null;
  locked_at: string | null;
  pii_confirmed_at: string;
  pool_uids: string[];
  primary_customer_uid: string | null;
  program_uid: string;
  secondary_customer_uids: string[];
  status: string;
  total_balance: string;
  archived_at: string | null;
  details: {
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    phone: string;
    business_name?: string;
  };
}

interface CustomersResponse {
  total_count: number;
  count: number;
  limit: number;
  offset: number;
  data: Customer[];
}

class CustomersService {
  baseUrl: string;
  authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  private formatCustomer(customer: Customer): string {
    return [
      `UID: ${customer.uid}`,
      `External UID: ${customer.external_uid}`,
      `Name: ${customer.details.first_name} ${
        customer.details.middle_name || ""
      } ${customer.details.last_name} ${customer.details.suffix || ""}`.trim(),
      `Email: ${customer.email}`,
      `Customer Type: ${customer.customer_type}`,
      `Status: ${customer.status}`,
      `KYC Status: ${customer.kyc_status}`,
      `Total Balance: $${customer.total_balance}`,
      `Phone: ${customer.details.phone || "None"}`,
      `Business Name: ${customer.details.business_name || "None"}`,
      `Program UID: ${customer.program_uid}`,
      `Pool UIDs: ${customer.pool_uids.join(", ") || "None"}`,
      `Created At: ${customer.created_at}`,
      `Activated At: ${customer.activated_at}`,
      `Locked: ${customer.locked_at ? `Yes (${customer.lock_reason})` : "No"}`,
      "---",
    ].join("\n");
  }

  async listCustomers(params?: {
    uid?: string[];
    status?: string[];
    kyc_status?: string[];
    customer_type?: string[];
    first_name?: string[];
    last_name?: string[];
    email?: string[];
    locked?: boolean;
    program_uid?: string[];
    business_name?: string;
    external_uid?: string[];
    pool_uid?: string[];
    limit?: number;
    offset?: number;
    sort?: string;
    include_initiated?: boolean;
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

    const url = `${this.baseUrl}/customers${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    const response = await fetchData<CustomersResponse>(url, this.authToken);

    if (!response) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve customers",
          },
        ],
      };
    }

    const customers = response.data || [];
    if (customers.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "No customers found",
          },
        ],
      };
    }

    const formattedCustomers = customers.map(this.formatCustomer);
    const customersText = `Customers (${response.count} of ${
      response.total_count
    }):\n\n${formattedCustomers.join("\n")}`;

    return {
      content: [
        {
          type: "text",
          text: customersText,
        },
      ],
    };
  }

  async getCustomer(uid: string): Promise<any> {
    const response = await fetchData<Customer>(
      `${this.baseUrl}/customers/${uid}`,
      this.authToken,
    );

    if (!response) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve customer",
          },
        ],
      };
    }

    const customerText = `Customer Details:\n\n${this.formatCustomer(
      response,
    )}`;

    return {
      content: [
        {
          type: "text",
          text: customerText,
        },
      ],
    };
  }

  register(server: any) {
    server.tool(
      "list-customers",
      "Get a list of customers",
      {
        uid: z.array(z.string()).optional().describe("Filter by customer UIDs"),
        status: z
          .array(z.string())
          .optional()
          .describe("Filter by customer status"),
        kyc_status: z
          .array(z.string())
          .optional()
          .describe("Filter by KYC status"),
        customer_type: z
          .array(z.string())
          .optional()
          .describe("Filter by customer type"),
        first_name: z
          .array(z.string())
          .optional()
          .describe("Filter by first name"),
        last_name: z
          .array(z.string())
          .optional()
          .describe("Filter by last name"),
        email: z.array(z.string()).optional().describe("Filter by email"),
        locked: z.boolean().optional().describe("Filter by locked status"),
        program_uid: z
          .array(z.string())
          .optional()
          .describe("Filter by program UID"),
        business_name: z
          .string()
          .optional()
          .describe("Filter by business name"),
        external_uid: z
          .array(z.string())
          .optional()
          .describe("Filter by external UID"),
        pool_uid: z.array(z.string()).optional().describe("Filter by pool UID"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of items to retrieve"),
        offset: z
          .number()
          .optional()
          .describe("Index of the first item to retrieve"),
        sort: z.string().optional().describe("Sort order"),
        include_initiated: z
          .boolean()
          .optional()
          .describe("Include initiated customers"),
      },
      async (params: any) => this.listCustomers(params),
    );

    server.tool(
      "get-customer",
      "Get details for a specific customer",
      {
        uid: z.string().describe("The customer UID"),
      },
      async ({ uid }: { uid: string }) => this.getCustomer(uid),
    );
  }
}

export default CustomersService;
