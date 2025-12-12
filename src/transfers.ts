import { fetchData, postData } from "./fetch.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

interface WireTransfer {
  wire_instructions: string;
}

interface AchTransfer {
  sec_code: string;
  service_processing: string;
  originator_name: string;
  company_id: string;
  prenote: boolean;
  entry_description: string;
  effective_entry_date: string;
  id_number: string;
}

interface InstantPaymentTransfer {
  instant_payment_transmitter: InstantPaymentTransmitter;
  memo: string;
}

interface CreateTransferPayload {
  wire?: WireTransfer;
  ach?: AchTransfer;
  instant_payment?: InstantPaymentTransfer;
  external_uid: string;
  initiating_customer_uid: string;
  initiator_type: string;
  source_synthetic_account_uid: string;
  destination_synthetic_account_uid: string;
  usd_transfer_amount: string;
}

interface IntermediaryBankAddress {
  line1: string | null;
  line2: string | null;
  line3: string | null;
  country: string | null;
}

interface WireTransmitter {
  name: string;
  transmitter_identifier: string;
  street_number: number;
  street1: string;
  city: string;
  state: string;
  postal_code: string;
}

interface Wire {
  intermediary_bank_address: IntermediaryBankAddress;
  intermediary_bank_name: string | null;
  intermediary_bank_routing_number: string | null;
  wire_transmitter: WireTransmitter | null;
}

interface InstantPaymentTransmitter {
  name: string;
  transmitter_identifier: string;
  street_number: number;
  street1: string;
  city: string;
  state: string;
  postal_code: string;
}

interface InstantPayment {
  instant_payment_transmitter: InstantPaymentTransmitter;
  memo: string;
}

interface Ach {
  originator_name: string;
  company_id: string;
  company_discretionary_data: string;
  prenote: boolean;
  sec_code: string;
  payment_type: string;
  entry_description: string;
  service_processing: string;
  effective_entry_date: string;
  id_number: string;
  addenda: string;
}

interface Transfer {
  uid: string;
  external_uid: string | null;
  source_synthetic_account_uid: string;
  destination_synthetic_account_uid: string;
  initiating_customer_uid: string;
  destination_customer_uid: string;
  status: string;
  initiator_type: string;
  created_at: string;
  transaction_uids: string[];
  usd_transfer_amount: number;
  wire?: Wire | null;
  instant_payment?: InstantPayment | null;
  ach?: Ach | null;
}

interface TransferResponse {
  total_count: number;
  count: number;
  limit: number;
  offset: number;
  data: Transfer[];
}

function formatListTransfersResponse(response: TransferResponse): string {
  return [
    `Total Count: ${response.total_count}`,
    `Count: ${response.count}`,
    `Limit: ${response.limit}`,
    `Offset: ${response.offset}`,
    `Data:`,
    ...response.data.map(formatTransfer),
  ].join("\n");
}

function formatTransfer(transfer: Transfer): string {
  return [
    `  UID: ${transfer.uid}`,
    `  External UID: ${transfer.external_uid || "None"}`,
    `  Source Synthetic Account UID: ${transfer.source_synthetic_account_uid}`,
    `  Destination Synthetic Account UID: ${transfer.destination_synthetic_account_uid}`,
    `  Initiating Customer UID: ${transfer.initiating_customer_uid}`,
    `  Destination Customer UID: ${transfer.destination_customer_uid}`,
    `  Status: ${transfer.status}`,
    `  Initiator Type: ${transfer.initiator_type}`,
    `  Created At: ${transfer.created_at}`,
    `  Transaction UIDs: ${transfer.transaction_uids.join(", ") || "None"}`,
    `  USD Transfer Amount: ${transfer.usd_transfer_amount}`,
    `  Wire: ${transfer.wire ? formatWire(transfer.wire) : "None"}`,
    `  Instant Payment: ${
      transfer.instant_payment
        ? formatInstantPayment(transfer.instant_payment)
        : "None"
    }`,
    `  ACH: ${transfer.ach ? formatAch(transfer.ach) : "None"}`,
    `  ---`,
  ].join("\n");
}

function formatWire(wire: Wire): string {
  return [
    `    Intermediary Bank Address:`,
    `      Line 1: ${wire.intermediary_bank_address.line1 || "None"}`,
    `      Line 2: ${wire.intermediary_bank_address.line2 || "None"}`,
    `      Line 3: ${wire.intermediary_bank_address.line3 || "None"}`,
    `      Country: ${wire.intermediary_bank_address.country || "None"}`,
    `    Intermediary Bank Name: ${wire.intermediary_bank_name || "None"}`,
    `    Intermediary Bank Routing Number: ${
      wire.intermediary_bank_routing_number || "None"
    }`,
    `    Wire Transmitter: ${
      wire.wire_transmitter
        ? formatWireTransmitter(wire.wire_transmitter)
        : "None"
    }`,
  ].join("\n");
}

function formatWireTransmitter(transmitter: WireTransmitter): string {
  return [
    `      Name: ${transmitter.name}`,
    `      Transmitter Identifier: ${transmitter.transmitter_identifier}`,
    `      Street Number: ${transmitter.street_number}`,
    `      Street 1: ${transmitter.street1}`,
    `      City: ${transmitter.city}`,
    `      State: ${transmitter.state}`,
    `      Postal Code: ${transmitter.postal_code}`,
  ].join("\n");
}

function formatInstantPayment(instantPayment: InstantPayment): string {
  return [
    `    Instant Payment Transmitter:`,
    `      Name: ${instantPayment.instant_payment_transmitter.name}`,
    `      Transmitter Identifier: ${instantPayment.instant_payment_transmitter.transmitter_identifier}`,
    `      Street Number: ${instantPayment.instant_payment_transmitter.street_number}`,
    `      Street 1: ${instantPayment.instant_payment_transmitter.street1}`,
    `      City: ${instantPayment.instant_payment_transmitter.city}`,
    `      State: ${instantPayment.instant_payment_transmitter.state}`,
    `      Postal Code: ${instantPayment.instant_payment_transmitter.postal_code}`,
    `    Memo: ${instantPayment.memo}`,
  ].join("\n");
}

function formatAch(ach: Ach): string {
  return [
    `    Originator Name: ${ach.originator_name}`,
    `    Company ID: ${ach.company_id}`,
    `    Company Discretionary Data: ${ach.company_discretionary_data}`,
    `    Prenote: ${ach.prenote}`,
    `    SEC Code: ${ach.sec_code}`,
    `    Payment Type: ${ach.payment_type}`,
    `    Entry Description: ${ach.entry_description}`,
    `    Service Processing: ${ach.service_processing}`,
    `    Effective Entry Date: ${ach.effective_entry_date}`,
    `    ID Number: ${ach.id_number}`,
    `    Addenda: ${ach.addenda}`,
  ].join("\n");
}

class TransfersService {
  baseUrl: string;
  authToken: string;
  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  async listTransfers(): Promise<any> {
    const listTransfersResp = await fetchData<TransferResponse>(
      this.baseUrl + "/transfers?sort=created_at_desc&limit=5",
      this.authToken,
    );
    if (!listTransfersResp) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve transfers",
          },
        ],
      };
    }

    const transfers = listTransfersResp.data || [];
    if (transfers.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No transfers found`,
          },
        ],
      };
    }

    try {
      const formattedTransfers = transfers.map(formatTransfer);
      const listTransfersText = `Transfers:\n\n${formattedTransfers.join(
        "\n",
      )}`;

      return {
        content: [
          {
            type: "text",
            text: listTransfersText,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to format transfers response: ${error}: ${JSON.stringify(
              transfers,
              null,
              2,
            )}`,
          },
        ],
      };
    }
  }

  async getTransfer(uid: string): Promise<any> {
    const getTransferResp = await fetchData<Transfer>(
      this.baseUrl + "/transfers/" + uid,
      this.authToken,
    );
    if (!getTransferResp) {
      return {
        content: [
          {
            type: "text",
            text: "Failed to retrieve transfer",
          },
        ],
      };
    }

    try {
      const listTransfersText = `Transfers:\n\n${formatTransfer(
        getTransferResp,
      )}`;

      return {
        content: [
          {
            type: "text",
            text: listTransfersText,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to format transfers response: ${error}: ${JSON.stringify(
              getTransferResp,
              null,
              2,
            )}`,
          },
        ],
      };
    }
  }

  async createTransfer(payload: CreateTransferPayload): Promise<any> {
    const url = `${this.baseUrl}/transfers`;
    try {
      const response = await postData<Transfer>(url, this.authToken, payload);
      if (!response) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to create transfer`,
            },
          ],
        };
      }
      return {
        content: [
          {
            type: "text",
            text: `Transfer created successfully: ${formatTransfer(response)}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to create transfer: ${error}`,
          },
        ],
      };
    }
  }

  register(server: McpServer) {
    server.tool(
      "list-newline-transfers",
      "Get a list of transfers for newline",
      {},
      async () => this.listTransfers(),
    );
    server.tool(
      "get-newline-transfer",
      "Get detailed information about a transfer for newline",
      {
        uid: z.string().describe("The transfer UID"),
      },
      async ({ uid }) => this.getTransfer(uid),
    );
    server.tool(
      "create-newline-transfer",
      "Create a transfer for newline",
      {
        wire: z
          .object({
            wire_instructions: z.string(),
          })
          .optional(),
        ach: z
          .object({
            sec_code: z.string(),
            service_processing: z.string(),
            originator_name: z.string(),
            company_id: z.string(),
            prenote: z.boolean(),
            entry_description: z.string(),
            effective_entry_date: z.string(),
            id_number: z.string(),
          })
          .optional(),
        instant_payment: z
          .object({
            instant_payment_transmitter: z.object({
              name: z.string(),
              transmitter_identifier: z.string(),
              street_number: z.number(),
              street1: z.string(),
              street2: z.string(),
              city: z.string(),
              state: z.string(),
              postal_code: z.string(),
              country: z.string(),
            }),
            memo: z.string(),
          })
          .optional(),
        external_uid: z.string(),
        initiating_customer_uid: z.string(),
        initiator_type: z.string(),
        source_synthetic_account_uid: z.string(),
        destination_synthetic_account_uid: z.string(),
        usd_transfer_amount: z.string(),
      },
      async (params: CreateTransferPayload) => this.createTransfer(params),
    );
  }
}

export default TransfersService;
