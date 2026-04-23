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
    it("should throw when required environment variables are missing", () => {
      delete process.env.NEWLINE_BASE_URL;
      delete process.env.NEWLINE_HMAC_KEY;
      delete process.env.NEWLINE_PROGRAM_ID;

      expect(() => getNewlineConfig()).toThrow(
        "Missing required environment variable NEWLINE_HMAC_KEY",
      );
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

    it("should throw when a required environment variable is missing even if base url is set", () => {
      process.env.NEWLINE_BASE_URL = "https://partial.example.com/api/v1";
      delete process.env.NEWLINE_HMAC_KEY;
      process.env.NEWLINE_PROGRAM_ID = "partial_program_id";

      expect(() => getNewlineConfig()).toThrow(
        "Missing required environment variable NEWLINE_HMAC_KEY",
      );
    });

    it("should reject empty string environment variables", () => {
      process.env.NEWLINE_BASE_URL = "";
      process.env.NEWLINE_HMAC_KEY = "";
      process.env.NEWLINE_PROGRAM_ID = "";

      expect(() => getNewlineConfig()).toThrow(
        "Missing required environment variable NEWLINE_HMAC_KEY",
      );
    });

    it("should return proper TypeScript interface type", () => {
      process.env.NEWLINE_HMAC_KEY = "typed_hmac_key";
      process.env.NEWLINE_PROGRAM_ID = "typed_program_id";

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
