import { fetchData } from "./fetch.js";
import { z } from "zod";

interface ListResponse<T> {
  total_count: number;
  count: number;
  limit: number;
  offset: number;
  data: T[];
}

interface CustomerActivity {
  uid: string;
  customer_uid: string;
  activity_type: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

class CustomerActivitiesService {
  baseUrl: string;
  authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  private formatCustomerActivity(activity: CustomerActivity): string {
    return [
      `UID: ${activity.uid}`,
      `Customer UID: ${activity.customer_uid}`,
      `Activity Type: ${activity.activity_type}`,
      `Description: ${activity.description}`,
      `IP Address: ${activity.ip_address || "Unknown"}`,
      `User Agent: ${activity.user_agent || "Unknown"}`,
      `Created At: ${activity.created_at}`,
      `Metadata: ${JSON.stringify(activity.metadata)}`,
      "---",
    ].join("\n");
  }

  async listCustomerActivities(): Promise<any> {
    const response = await fetchData<ListResponse<CustomerActivity>>(
      `${this.baseUrl}/customer_activities`,
      this.authToken,
    );

    if (!response) {
      return {
        content: [
          { type: "text", text: "Failed to retrieve customer activities" },
        ],
      };
    }

    const activities = response.data || [];
    if (activities.length === 0) {
      return {
        content: [{ type: "text", text: "No customer activities found" }],
      };
    }

    const formattedActivities = activities.map((activity) =>
      this.formatCustomerActivity(activity),
    );
    return {
      content: [
        {
          type: "text",
          text: `Customer Activities (${response.count} of ${
            response.total_count
          }):\n\n${formattedActivities.join("\n")}`,
        },
      ],
    };
  }

  async getCustomerActivity(uid: string): Promise<any> {
    const response = await fetchData<CustomerActivity>(
      `${this.baseUrl}/customer_activities/${uid}`,
      this.authToken,
    );

    if (!response) {
      return {
        content: [
          { type: "text", text: "Failed to retrieve customer activity" },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Customer Activity Details:\n\n${this.formatCustomerActivity(
            response,
          )}`,
        },
      ],
    };
  }

  register(server: any) {
    server.tool(
      "list-customer-activities",
      "Get a list of customer activities",
      {},
      async () => this.listCustomerActivities(),
    );

    server.tool(
      "get-customer-activity",
      "Get details for a specific customer activity",
      {
        uid: z.string().describe("The customer activity UID"),
      },
      async ({ uid }: { uid: string }) => this.getCustomerActivity(uid),
    );
  }
}

export default CustomerActivitiesService;
