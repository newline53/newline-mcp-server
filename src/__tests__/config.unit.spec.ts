import { getNewlineConfig, NewlineConfig } from "../config.js";

describe("Config Unit Tests", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("getNewlineConfig", () => {
    it("should return default values when no environment variables are set", () => {
      delete process.env.NEWLINE_BASE_URL;
      delete process.env.NEWLINE_HMAC_KEY;
      delete process.env.NEWLINE_PROGRAM_ID;

      const config = getNewlineConfig();

      expect(config).toEqual({
        base_url: "https://sandbox.newline53.com/api/v1",
        hmac_key: "default_hmac_key",
        program_id: "default_program_id",
      });
    });

    it("should use environment variables when set", () => {
      process.env.NEWLINE_BASE_URL = "https://custom.example.com/api/v2";
      process.env.NEWLINE_HMAC_KEY = "custom_hmac_key";
      process.env.NEWLINE_PROGRAM_ID = "custom_program_id";

      const config = getNewlineConfig();

      expect(config).toEqual({
        base_url: "https://custom.example.com/api/v2",
        hmac_key: "custom_hmac_key",
        program_id: "custom_program_id",
      });
    });

    it("should use partial environment variables with defaults for missing ones", () => {
      process.env.NEWLINE_BASE_URL = "https://partial.example.com/api/v1";
      delete process.env.NEWLINE_HMAC_KEY;
      process.env.NEWLINE_PROGRAM_ID = "partial_program_id";

      const config = getNewlineConfig();

      expect(config).toEqual({
        base_url: "https://partial.example.com/api/v1",
        hmac_key: "default_hmac_key",
        program_id: "partial_program_id",
      });
    });

    it("should handle empty string environment variables (falsy, so use defaults)", () => {
      process.env.NEWLINE_BASE_URL = "";
      process.env.NEWLINE_HMAC_KEY = "";
      process.env.NEWLINE_PROGRAM_ID = "";

      const config = getNewlineConfig();

      // Empty strings are falsy in JavaScript, so the || operator falls back to defaults
      expect(config).toEqual({
        base_url: "https://sandbox.newline53.com/api/v1",
        hmac_key: "default_hmac_key",
        program_id: "default_program_id",
      });
    });

    it("should return proper TypeScript interface type", () => {
      const config = getNewlineConfig();

      expect(typeof config.base_url).toBe("string");
      expect(typeof config.hmac_key).toBe("string");
      expect(typeof config.program_id).toBe("string");
    });
  });

  describe("NewlineConfig interface", () => {
    it("should accept valid config objects", () => {
      const validConfig: NewlineConfig = {
        base_url: "https://test.example.com/api/v1",
        hmac_key: "test_hmac_key",
        program_id: "test_program_id",
      };

      expect(validConfig.base_url).toBe("https://test.example.com/api/v1");
      expect(validConfig.hmac_key).toBe("test_hmac_key");
      expect(validConfig.program_id).toBe("test_program_id");
    });
  });
});
