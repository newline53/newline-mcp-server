import TransfersService from "../transfers.js";

// Mock the fetch module
jest.mock("../fetch", () => ({
  fetchData: jest.fn(),
  postData: jest.fn(),
}));

import { fetchData, postData } from "../fetch.js";

describe("TransfersService Unit Tests", () => {
  let transfersService: TransfersService;
  const mockBaseUrl = "https://test.example.com/api/v1";
  const mockAuthToken = "mock-auth-token";

  beforeEach(() => {
    jest.clearAllMocks();
    transfersService = new TransfersService(mockBaseUrl, mockAuthToken);
  });

  describe("listTransfers", () => {
    it("should return formatted transfers when data is available", async () => {
      const mockResponse = {
        total_count: 1,
        count: 1,
        limit: 5,
        offset: 0,
        data: [
          {
            uid: "test-transfer-uid",
            external_uid: "external-123",
            initiating_customer_uid: "customer-123",
            destination_customer_uid: "dest-customer-123",
            source_synthetic_account_uid: "source-123",
            destination_synthetic_account_uid: "dest-123",
            usd_transfer_amount: "100.00",
            created_at: "2023-01-01T00:00:00Z",
            status: "completed",
            initiator_type: "individual",
            transaction_uids: ["txn-1", "txn-2"],
            wire: null,
            ach: null,
            instant_payment: null,
          },
        ],
      };
      (fetchData as jest.Mock).mockResolvedValue(mockResponse);

      const result = await transfersService.listTransfers();

      expect(fetchData).toHaveBeenCalledWith(
        "https://test.example.com/api/v1/transfers?sort=created_at_desc&limit=5",
        "mock-auth-token",
      );
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("Transfers:");
      expect(result.content[0].text).toContain("test-transfer-uid");
    });

    it("should handle null response from API", async () => {
      (fetchData as jest.Mock).mockResolvedValue(null);

      const result = await transfersService.listTransfers();

      expect(result.content[0].text).toBe("Failed to retrieve transfers");
    });

    it("should handle empty transfers list", async () => {
      const mockResponse = {
        total_count: 0,
        count: 0,
        limit: 5,
        offset: 0,
        data: [],
      };
      (fetchData as jest.Mock).mockResolvedValue(mockResponse);

      const result = await transfersService.listTransfers();

      expect(result.content[0].text).toBe("No transfers found");
    });
  });

  describe("getTransfer", () => {
    const testUid = "test-transfer-uid";

    it("should return formatted transfer when found", async () => {
      const mockResponse = {
        uid: testUid,
        external_uid: "external-123",
        initiating_customer_uid: "customer-123",
        destination_customer_uid: "dest-customer-123",
        source_synthetic_account_uid: "source-123",
        destination_synthetic_account_uid: "dest-123",
        usd_transfer_amount: "100.00",
        created_at: "2023-01-01T00:00:00Z",
        status: "completed",
        initiator_type: "individual",
        transaction_uids: ["txn-1"],
        wire: null,
        ach: null,
        instant_payment: null,
      };
      (fetchData as jest.Mock).mockResolvedValue(mockResponse);

      const result = await transfersService.getTransfer(testUid);

      expect(fetchData).toHaveBeenCalledWith(
        `https://test.example.com/api/v1/transfers/${testUid}`,
        "mock-auth-token",
      );
      expect(result.content[0].text).toContain("Transfers:");
    });

    it("should handle transfer not found", async () => {
      (fetchData as jest.Mock).mockResolvedValue(null);

      const result = await transfersService.getTransfer(testUid);

      expect(result.content[0].text).toBe("Failed to retrieve transfer");
    });
  });

  describe("createTransfer", () => {
    const mockPayload = {
      external_uid: "external-123",
      initiating_customer_uid: "customer-123",
      initiator_type: "individual",
      source_synthetic_account_uid: "source-123",
      destination_synthetic_account_uid: "dest-123",
      usd_transfer_amount: "100.00",
    };

    it("should create transfer successfully", async () => {
      const mockResponse = {
        uid: "new-transfer-uid",
        external_uid: "external-123",
        initiating_customer_uid: "customer-123",
        destination_customer_uid: "dest-customer-123",
        source_synthetic_account_uid: "source-123",
        destination_synthetic_account_uid: "dest-123",
        usd_transfer_amount: "100.00",
        created_at: "2023-01-01T00:00:00Z",
        status: "pending",
        initiator_type: "individual",
        transaction_uids: [],
        wire: null,
        ach: null,
        instant_payment: null,
      };
      (postData as jest.Mock).mockResolvedValue(mockResponse);

      const result = await transfersService.createTransfer(mockPayload);

      expect(postData).toHaveBeenCalledWith(
        "https://test.example.com/api/v1/transfers",
        "mock-auth-token",
        mockPayload,
      );
      expect(result.content[0].text).toContain("Transfer created successfully");
    });

    it("should handle null response from API", async () => {
      (postData as jest.Mock).mockResolvedValue(null);

      const result = await transfersService.createTransfer(mockPayload);

      expect(result.content[0].text).toBe("Failed to create transfer");
    });

    it("should handle API errors", async () => {
      const mockError = new Error("API Error");
      (postData as jest.Mock).mockRejectedValue(mockError);

      const result = await transfersService.createTransfer(mockPayload);

      expect(result.content[0].text).toContain("Failed to create transfer");
    });
  });

  it("should construct TransfersService instance with config", () => {
    expect(transfersService).toBeInstanceOf(TransfersService);
  });
});
