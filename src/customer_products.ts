import { fetchData } from "./fetch.js";
import { z } from "zod";

interface ListResponse<T> {
  total_count: number;
  count: number;
  limit: number;
  offset: number;
  data: T[];
}

interface CustomerProduct {
  uid: string;
  customer_uid: string;
  product_uid: string;
  status: string;
  created_at: string;
  updated_at: string;
  activated_at: string | null;
}

class CustomerProductsService {
  baseUrl: string;
  authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  private formatCustomerProduct(cp: CustomerProduct): string {
    return [
      `UID: ${cp.uid}`,
      `Customer UID: ${cp.customer_uid}`,
      `Product UID: ${cp.product_uid}`,
      `Status: ${cp.status}`,
      `Created At: ${cp.created_at}`,
      `Updated At: ${cp.updated_at}`,
      `Activated At: ${cp.activated_at || "Not activated"}`,
      "---",
    ].join("\n");
  }

  async listCustomerProducts(): Promise<any> {
    const response = await fetchData<ListResponse<CustomerProduct>>(
      `${this.baseUrl}/customer_products`,
      this.authToken,
    );

    if (!response) {
      return {
        content: [
          { type: "text", text: "Failed to retrieve customer products" },
        ],
      };
    }

    const customerProducts = response.data || [];
    if (customerProducts.length === 0) {
      return {
        content: [{ type: "text", text: "No customer products found" }],
      };
    }

    const formattedCustomerProducts = customerProducts.map((cp) =>
      this.formatCustomerProduct(cp),
    );
    return {
      content: [
        {
          type: "text",
          text: `Customer Products (${response.count} of ${
            response.total_count
          }):\n\n${formattedCustomerProducts.join("\n")}`,
        },
      ],
    };
  }

  async getCustomerProduct(uid: string): Promise<any> {
    const response = await fetchData<CustomerProduct>(
      `${this.baseUrl}/customer_products/${uid}`,
      this.authToken,
    );

    if (!response) {
      return {
        content: [
          { type: "text", text: "Failed to retrieve customer product" },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Customer Product Details:\n\n${this.formatCustomerProduct(
            response,
          )}`,
        },
      ],
    };
  }

  register(server: any) {
    server.tool(
      "list-customer-products",
      "Get a list of customer products",
      {},
      async () => this.listCustomerProducts(),
    );

    server.tool(
      "get-customer-product",
      "Get details for a specific customer product",
      {
        uid: z.string().describe("The customer product UID"),
      },
      async ({ uid }: { uid: string }) => this.getCustomerProduct(uid),
    );
  }
}

export default CustomerProductsService;
