import { v4 as uuidv4 } from "uuid";
import fetch, { Response, RequestInit } from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";
import { getNewlineConfig } from "./config.js";

/**
 * Gets proxy configuration from environment variables
 * @returns Proxy agent if configured, undefined otherwise
 */
function getProxyAgent(): HttpsProxyAgent<string> | undefined {
  const httpsProxy = process.env.https_proxy || process.env.HTTPS_PROXY;
  if (httpsProxy) {
    console.log(`Using proxy: ${httpsProxy}`);
    return new HttpsProxyAgent(httpsProxy);
  }
  return undefined;
}

/**
 * Makes HTTP requests through a proxy with authentication and tracing
 * @param url The URL to fetch
 * @param authToken Authentication token to include in Authorization header
 * @param traceId Trace ID for request tracking
 * @param method HTTP method (GET, POST, or DELETE)
 * @param body Optional request body (for POST requests)
 * @returns Fetch Response
 */
export async function fetchWithProxy(
  url: string,
  authToken: string,
  traceId: string,
  method: "GET" | "POST" | "DELETE",
  body?: any,
): Promise<Response> {
  // Prepare headers
  const headers = {
    Authorization: authToken,
    "X-Trace-ID": traceId,
    "Content-Type": "application/json",
  };

  // Get proxy agent from environment variables
  const proxyAgent = getProxyAgent();

  // Prepare request options
  const options: RequestInit = {
    method,
    headers,
    ...(proxyAgent && { agent: proxyAgent }), // Only add agent if proxy is configured
    // Add a timeout to prevent hanging requests
    signal: AbortSignal.timeout(30000), // 30 second timeout
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    // Make the request with better error handling
    return await fetch(url, options);
  } catch (error) {
    // Enhance the error with more context
    console.error(`Fetch error with proxy for URL ${url}:`, error);
    throw error;
  }
}

export async function fetchData<T>(
  url: string,
  authToken: string,
): Promise<T | null> {
  try {
    const response = await fetchWithProxy(url, authToken, uuidv4(), "GET");
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorBody}`,
      );
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

export async function postData<T>(
  url: string,
  authToken: string,
  body: any,
): Promise<T | null> {
  try {
    const response = await fetchWithProxy(
      url,
      authToken,
      uuidv4(),
      "POST",
      body,
    );
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorBody}`,
      );
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error posting data:", error);
    return null;
  }
}

export async function deleteData(
  url: string,
  authToken: string,
  uid: string,
): Promise<void> {
  try {
    const response = await fetchWithProxy(
      url + "/" + uid,
      authToken,
      uuidv4(),
      "DELETE",
    );
    if (response.status !== 204) {
      const errorBody = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorBody}`,
      );
    }
  } catch (error) {
    console.error("Error deleting data:", error);
  }
}
