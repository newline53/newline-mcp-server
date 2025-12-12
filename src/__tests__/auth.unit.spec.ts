import Auth from "../auth.js";
import { NewlineConfig } from "../config.js";

// Mock the fetch module
jest.mock("../fetch", () => ({
  fetchWithProxy: jest.fn(),
}));

import { fetchWithProxy } from "../fetch.js";

describe("Auth Unit Tests", () => {
  const mockConfig: NewlineConfig = {
    base_url: "https://test.example.com/api/v1",
    hmac_key: "test-hmac-key",
    program_id: "test-program-uid",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should construct Auth instance with config", () => {
    const auth = new Auth(mockConfig);
    expect(auth).toBeInstanceOf(Auth);
  });

  it("should call fetchWithProxy with correct parameters and return token", async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ token: "mock-token-12345" }),
    };
    (fetchWithProxy as jest.Mock).mockResolvedValue(mockResponse);

    const auth = new Auth(mockConfig);
    const token = await auth.getAuthToken();

    expect(fetchWithProxy).toHaveBeenCalledWith(
      "https://test.example.com/api/v1/auth",
      expect.any(String), // JWT token
      expect.any(String), // UUID
      "POST",
    );
    expect(token).toBe("mock-token-12345");
  });

  it("should generate proper JWT token for request", async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ token: "mock-token-12345" }),
    };
    (fetchWithProxy as jest.Mock).mockResolvedValue(mockResponse);

    const auth = new Auth(mockConfig);
    await auth.getAuthToken();

    const callArgs = (fetchWithProxy as jest.Mock).mock.calls[0];
    const jwtToken = callArgs[1];

    // Verify it's a JWT token format (header.payload.signature)
    expect(jwtToken).toMatch(
      /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
    );
  });

  it("should handle HTTP errors gracefully", async () => {
    const mockResponse = {
      ok: false,
      status: 401,
    };
    (fetchWithProxy as jest.Mock).mockResolvedValue(mockResponse);

    const auth = new Auth(mockConfig);

    await expect(auth.getAuthToken()).rejects.toThrow(
      "HTTP error! status: 401",
    );
  });

  it("should handle network errors gracefully", async () => {
    const mockError = new Error("Network Error");
    (fetchWithProxy as jest.Mock).mockRejectedValue(mockError);

    const auth = new Auth(mockConfig);

    await expect(auth.getAuthToken()).rejects.toThrow("Network Error");
  });

  it("should handle JSON parsing errors gracefully", async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
    };
    (fetchWithProxy as jest.Mock).mockResolvedValue(mockResponse);

    const auth = new Auth(mockConfig);

    await expect(auth.getAuthToken()).rejects.toThrow("Invalid JSON");
  });

  it("should make multiple calls with different JWT tokens", async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ token: "mock-token-12345" }),
    };
    (fetchWithProxy as jest.Mock).mockResolvedValue(mockResponse);

    const auth = new Auth(mockConfig);
    await auth.getAuthToken();

    // Add a small delay to ensure different timestamps
    await new Promise((resolve) => setTimeout(resolve, 1001));

    await auth.getAuthToken();

    expect(fetchWithProxy).toHaveBeenCalledTimes(2);

    const firstCall = (fetchWithProxy as jest.Mock).mock.calls[0];
    const firstToken = firstCall[1];

    const secondCall = (fetchWithProxy as jest.Mock).mock.calls[1];
    const secondToken = secondCall[1];

    // Each call should generate a different JWT token (due to timestamp)
    expect(firstToken).not.toBe(secondToken);
  });
});
