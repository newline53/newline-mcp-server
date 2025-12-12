import { fetchData, postData, deleteData } from "../fetch.js";

// Mock the fetch implementation directly
jest.mock("node-fetch", () => jest.fn());
import fetch from "node-fetch";
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe("Fetch Utility Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchData", () => {
    it("should make GET request and return data", async () => {
      const mockResponse = { data: "test" };
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await fetchData("https://test.com/api", "Bearer token");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://test.com/api",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Authorization: "Bearer token",
          }),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle HTTP errors gracefully", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue("Not found"),
      } as any);

      const result = await fetchData("https://test.com/api", "Bearer token");
      expect(result).toBeNull();
    });

    it("should handle network errors gracefully", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const result = await fetchData("https://test.com/api", "Bearer token");
      expect(result).toBeNull();
    });
  });

  describe("postData", () => {
    it("should make POST request with data", async () => {
      const requestData = { name: "test" };
      const mockResponse = { id: "123" };
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await postData(
        "https://test.com/api",
        "Bearer token",
        requestData,
      );

      expect(mockFetch).toHaveBeenCalledWith(
        "https://test.com/api",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer token",
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(requestData),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle HTTP errors gracefully", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: jest.fn().mockResolvedValue("Bad request"),
      } as any);

      const result = await postData("https://test.com/api", "Bearer token", {});
      expect(result).toBeNull();
    });
  });

  describe("deleteData", () => {
    it("should make DELETE request", async () => {
      mockFetch.mockResolvedValue({
        status: 204,
        ok: true,
      } as any);

      await deleteData("https://test.com/api", "Bearer token", "123");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://test.com/api/123",
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({
            Authorization: "Bearer token",
          }),
        }),
      );
    });

    it("should handle errors gracefully", async () => {
      mockFetch.mockResolvedValue({
        status: 404,
        ok: false,
        text: jest.fn().mockResolvedValue("Not found"),
      } as any);

      // Should not throw - errors are logged but not thrown
      await expect(
        deleteData("https://test.com/api", "Bearer token", "123"),
      ).resolves.not.toThrow();
    });
  });
});
