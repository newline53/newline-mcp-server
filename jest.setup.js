const path = require("path");
const dotenv = require("dotenv");

// Load environment variables from .env file
const result = dotenv.config({ path: path.resolve(process.cwd(), ".env") });

if (result.error) {
  console.warn(
    "Warning: .env file not found or has syntax errors:",
    result.error.message
  );
}

console.log("Environment variables loaded for tests");
