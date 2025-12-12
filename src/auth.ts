import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { fetchWithProxy } from "./fetch.js";
import { NewlineConfig } from "./config.js";

interface JwtPayload {
  iat: number;
  sub: string;
}

class Auth {
  private program_id: string;
  private hmac: string;
  private baseUrl: string;

  constructor({ program_id, hmac_key, base_url }: NewlineConfig) {
    this.program_id = program_id;
    this.hmac = hmac_key;
    this.baseUrl = base_url;
  }

  private generateSignedToken(): string {
    // Prepare timestamp in seconds
    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Set payload data
    const payload: JwtPayload = {
      iat: currentTimestamp,
      sub: this.program_id,
    };

    // Set header options
    const options: jwt.SignOptions = {
      algorithm: "HS512",
      header: {
        typ: "JWT",
        alg: "HS512",
      },
    };

    // Generate and return the signed token
    return jwt.sign(payload, this.hmac, options);
  }

  public async getAuthToken(): Promise<string> {
    const token = this.generateSignedToken();
    const url = `${this.baseUrl}/auth`;

    try {
      const response = await fetchWithProxy(url, token, uuidv4(), "POST");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.token; // Assuming the response contains a token field
    } catch (error) {
      console.error("Error fetching auth token:", error);
      throw error; // Re-throw the error instead of returning empty string
    }
  }
}

export default Auth;
