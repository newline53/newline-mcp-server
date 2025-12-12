export interface NewlineConfig {
  base_url: string;
  hmac_key: string;
  program_id: string;
}

export function getNewlineConfig(): NewlineConfig {
  const baseUrl =
    process.env.NEWLINE_BASE_URL || "https://sandbox.newline53.com/api/v1";
  const hmacKey = process.env.NEWLINE_HMAC_KEY || "default_hmac_key";
  const programId = process.env.NEWLINE_PROGRAM_ID || "default_program_id";

  return {
    base_url: baseUrl,
    hmac_key: hmacKey,
    program_id: programId,
  };
}
