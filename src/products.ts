import { fetchData } from "./fetch.js";
import { z } from "zod";

interface ListResponse<T> {
  total_count: number;
  count: number;
  limit: number;
  offset: number;
  data: T[];
}

interface Product {
  uid: string;
  name: string;
  description: string;
  product_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

class ProductsService {
  baseUrl: string;
  authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  private formatProduct(product: Product): string {
    return [
      `UID: ${product.uid}`,
      `Name: ${product.name}`,
      `Description: ${product.description}`,
      `Type: ${product.product_type}`,
      `Status: ${product.status}`,
      `Created At: ${product.created_at}`,
      `Updated At: ${product.updated_at}`,
      "---",
    ].join("\n");
  }

  async listProducts(): Promise<any> {
    const response = await fetchData<ListResponse<Product>>(
      `${this.baseUrl}/products`,
      this.authToken,
    );

    if (!response) {
      return {
        content: [{ type: "text", text: "Failed to retrieve products" }],
      };
    }

    const products = response.data || [];
    if (products.length === 0) {
      return { content: [{ type: "text", text: "No products found" }] };
    }

    const formattedProducts = products.map((product) =>
      this.formatProduct(product),
    );
    return {
      content: [
        {
          type: "text",
          text: `Products (${response.count} of ${
            response.total_count
          }):\n\n${formattedProducts.join("\n")}`,
        },
      ],
    };
  }

  async getProduct(uid: string): Promise<any> {
    const response = await fetchData<Product>(
      `${this.baseUrl}/products/${uid}`,
      this.authToken,
    );

    if (!response) {
      return {
        content: [{ type: "text", text: "Failed to retrieve product" }],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Product Details:\n\n${this.formatProduct(response)}`,
        },
      ],
    };
  }

  register(server: any) {
    server.tool("list-products", "Get a list of products", {}, async () =>
      this.listProducts(),
    );

    server.tool(
      "get-product",
      "Get details for a specific product",
      {
        uid: z.string().describe("The product UID"),
      },
      async ({ uid }: { uid: string }) => this.getProduct(uid),
    );
  }
}

export default ProductsService;
