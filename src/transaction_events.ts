import { fetchData } from "./fetch.js";
import { z } from "zod";

interface ListResponse<T> {
  total_count: number;
  count: number;
  limit: number;
  offset: number;
  data: T[];
}

interface TransactionEvent {
  uid: string;
  transaction_uid: string;
  event_type: string;
  status: string;
  description: string;
  created_at: string;
  metadata: Record<string, any>;
}

class TransactionEventsService {
  baseUrl: string;
  authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  private formatTransactionEvent(event: TransactionEvent): string {
    return [
      `UID: ${event.uid}`,
      `Transaction UID: ${event.transaction_uid}`,
      `Event Type: ${event.event_type}`,
      `Status: ${event.status}`,
      `Description: ${event.description}`,
      `Created At: ${event.created_at}`,
      `Metadata: ${JSON.stringify(event.metadata)}`,
      "---",
    ].join("\n");
  }

  async listTransactionEvents(): Promise<any> {
    const response = await fetchData<ListResponse<TransactionEvent>>(
      `${this.baseUrl}/transaction_events`,
      this.authToken,
    );

    if (!response) {
      return {
        content: [
          { type: "text", text: "Failed to retrieve transaction events" },
        ],
      };
    }

    const events = response.data || [];
    if (events.length === 0) {
      return {
        content: [{ type: "text", text: "No transaction events found" }],
      };
    }

    const formattedEvents = events.map((event) =>
      this.formatTransactionEvent(event),
    );
    return {
      content: [
        {
          type: "text",
          text: `Transaction Events (${response.count} of ${
            response.total_count
          }):\n\n${formattedEvents.join("\n")}`,
        },
      ],
    };
  }

  async getTransactionEvent(uid: string): Promise<any> {
    const response = await fetchData<TransactionEvent>(
      `${this.baseUrl}/transaction_events/${uid}`,
      this.authToken,
    );

    if (!response) {
      return {
        content: [
          { type: "text", text: "Failed to retrieve transaction event" },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Transaction Event Details:\n\n${this.formatTransactionEvent(
            response,
          )}`,
        },
      ],
    };
  }

  register(server: any) {
    server.tool(
      "list-transaction-events",
      "Get a list of transaction events",
      {},
      async () => this.listTransactionEvents(),
    );

    server.tool(
      "get-transaction-event",
      "Get details for a specific transaction event",
      {
        uid: z.string().describe("The transaction event UID"),
      },
      async ({ uid }: { uid: string }) => this.getTransactionEvent(uid),
    );
  }
}

export default TransactionEventsService;
