import SyntheticAccounts from "../synthetic_accounts.js";

// Mock the fetch module
jest.mock("../fetch", () => ({
  fetchData: jest.fn(),
  postData: jest.fn(),
  deleteData: jest.fn(),
}));

import { fetchData, postData, deleteData } from "../fetch.js";

describe("SyntheticAccounts Unit Tests", () => {
  let syntheticAccounts: SyntheticAccounts;
  const mockBaseUrl = "https://test.example.com/api/v1";
  const mockAuthToken = "mock-auth-token";

  beforeEach(() => {
    jest.clearAllMocks();
    syntheticAccounts = new SyntheticAccounts(mockBaseUrl, mockAuthToken);
  });

  describe("getSyntheticAccountTypes", () => {
    it("should return formatted account types when data is available", async () => {
      const mockResponse = {
        total_count: 1,
        count: 1,
        limit: 10,
        offset: 0,
        data: [
          {
            description: "Test Account Type",
            name: "Test Type",
            program_id: "test-program-uid",
            synthetic_account_category: "test-category",
            uid: "test-type-uid",
          },
        ],
      };
      (fetchData as jest.Mock).mockResolvedValue(mockResponse);

      const result = await syntheticAccounts.getSyntheticAccountTypes();

      expect(fetchData).toHaveBeenCalledWith(
        "https://test.example.com/api/v1/synthetic_account_types",
        "mock-auth-token",
      );
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain(
        "Active synthetic account types",
      );
      expect(result.content[0].text).toContain("Test Account Type");
    });

    it("should handle null response from API", async () => {
      (fetchData as jest.Mock).mockResolvedValue(null);

      const result = await syntheticAccounts.getSyntheticAccountTypes();

      expect(result.content[0].text).toBe(
        "Failed to retrieve synthetic account types",
      );
    });

    it("should handle empty data array", async () => {
      const mockResponse = {
        total_count: 0,
        count: 0,
        limit: 10,
        offset: 0,
        data: [],
      };
      (fetchData as jest.Mock).mockResolvedValue(mockResponse);

      const result = await syntheticAccounts.getSyntheticAccountTypes();

      expect(result.content[0].text).toBe(
        "No active synthetic account types found",
      );
    });
  });

  describe("getSyntheticAccounts", () => {
    it("should return formatted accounts when data is available", async () => {
      const mockResponse = {
        total_count: 1,
        count: 1,
        limit: 10,
        offset: 0,
        data: [
          {
            uid: "test-account-uid",
            name: "Test Account",
            pool_uid: "test-pool-uid",
            synthetic_account_type_uid: "test-type-uid",
            synthetic_account_category: "test-category",
            status: "active",
            liability: "100.00",
            net_usd_balance: "100.00",
            net_usd_pending_balance: "0.00",
            net_usd_available_balance: "100.00",
            asset_balances: [],
            master_account: "master-123",
            custodial_account_uids: ["custodial-1", "custodial-2"],
            external_uid: "test-external-uid",
            routing_number: "123456789",
            opened_at: "2023-01-01T00:00:00Z",
            created_at: "2023-01-01T00:00:00Z",
            closed_at: null,
            instant_payment: null,
            wire: null,
          },
        ],
      };
      (fetchData as jest.Mock).mockResolvedValue(mockResponse);

      const result = await syntheticAccounts.getSyntheticAccounts();

      expect(fetchData).toHaveBeenCalledWith(
        "https://test.example.com/api/v1/synthetic_accounts",
        "mock-auth-token",
      );
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("Active synthetic accounts");
    });

    it("should handle null response", async () => {
      (fetchData as jest.Mock).mockResolvedValue(null);

      const result = await syntheticAccounts.getSyntheticAccounts();

      expect(result.content[0].text).toBe(
        "Failed to retrieve synthetic accounts",
      );
    });
  });

  describe("createSyntheticAccount", () => {
    const mockPayload = {
      name: "Test Account",
      pool_uid: "test-pool-uid",
      synthetic_account_type_uid: "test-type-uid",
    };

    it("should create account successfully", async () => {
      const mockResponse = {
        uid: "new-account-uid",
        name: "Test Account",
        pool_uid: "test-pool-uid",
        synthetic_account_type_uid: "test-type-uid",
        synthetic_account_category: "test-category",
        status: "active",
        liability: "100.00",
        net_usd_balance: "100.00",
        net_usd_pending_balance: "0.00",
        net_usd_available_balance: "100.00",
        asset_balances: [],
        master_account: "master-123",
        custodial_account_uids: ["custodial-1"],
        external_uid: "test-external-uid",
        routing_number: "123456789",
        opened_at: "2023-01-01T00:00:00Z",
        created_at: "2023-01-01T00:00:00Z",
        closed_at: null,
        instant_payment: null,
        wire: null,
      };
      (postData as jest.Mock).mockResolvedValue(mockResponse);

      const result =
        await syntheticAccounts.createSyntheticAccount(mockPayload);

      expect(postData).toHaveBeenCalledWith(
        "https://test.example.com/api/v1/synthetic_accounts",
        "mock-auth-token",
        mockPayload,
      );
      expect(result.content[0].text).toContain(
        "Synthetic account created successfully",
      );
    });

    it("should handle null response from API", async () => {
      (postData as jest.Mock).mockResolvedValue(null);

      const result =
        await syntheticAccounts.createSyntheticAccount(mockPayload);

      expect(result.content[0].text).toBe("Failed to create synthetic account");
    });

    it("should handle API errors", async () => {
      const mockError = new Error("API Error");
      (postData as jest.Mock).mockRejectedValue(mockError);

      const result =
        await syntheticAccounts.createSyntheticAccount(mockPayload);

      expect(result.content[0].text).toContain(
        "Failed to create synthetic account",
      );
    });
  });

  describe("deleteSyntheticAccount", () => {
    const testUid = "test-account-uid";

    it("should delete account successfully", async () => {
      (deleteData as jest.Mock).mockResolvedValue(undefined);

      const result = await syntheticAccounts.deleteSyntheticAccount(testUid);

      expect(deleteData).toHaveBeenCalledWith(
        "https://test.example.com/api/v1/synthetic_accounts",
        "mock-auth-token",
        testUid,
      );
      expect(result.content[0].text).toBe(
        "Synthetic account deleted successfully",
      );
    });

    it("should handle API errors", async () => {
      const mockError = new Error("Delete failed");
      (deleteData as jest.Mock).mockRejectedValue(mockError);

      const result = await syntheticAccounts.deleteSyntheticAccount(testUid);

      expect(result.content[0].text).toContain(
        "Failed to delete synthetic account",
      );
    });
  });

  describe("getSyntheticAccount", () => {
    const testUid = "test-account-uid";

    it("should return formatted account when found", async () => {
      const mockResponse = {
        uid: testUid,
        name: "Test Account",
        pool_uid: "test-pool-uid",
        synthetic_account_type_uid: "test-type-uid",
        synthetic_account_category: "test-category",
        status: "active",
        liability: "100.00",
        net_usd_balance: "100.00",
        net_usd_pending_balance: "0.00",
        net_usd_available_balance: "100.00",
        asset_balances: [],
        master_account: "master-123",
        custodial_account_uids: ["custodial-1"],
        external_uid: "test-external-uid",
        routing_number: "123456789",
        opened_at: "2023-01-01T00:00:00Z",
        created_at: "2023-01-01T00:00:00Z",
        closed_at: null,
        instant_payment: null,
        wire: null,
      };
      (fetchData as jest.Mock).mockResolvedValue(mockResponse);

      const result = await syntheticAccounts.getSyntheticAccount(testUid);

      expect(fetchData).toHaveBeenCalledWith(
        `https://test.example.com/api/v1/synthetic_accounts/${testUid}`,
        "mock-auth-token",
      );
      expect(result.content[0].text).toContain("Account Detail:");
    });

    it("should handle account not found", async () => {
      (fetchData as jest.Mock).mockResolvedValue(null);

      const result = await syntheticAccounts.getSyntheticAccount(testUid);

      expect(result.content[0].text).toBe(
        "Failed to retrieve synthetic account",
      );
    });
  });
});
