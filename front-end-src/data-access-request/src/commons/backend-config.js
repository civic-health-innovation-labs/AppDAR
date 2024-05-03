import { ENVIRONMENT } from "./environment-config";

/// Production end-point for backend (default value)
let backendEndpoint = "https://TODO";
if (ENVIRONMENT === "local") {
  // For development purposes (address from docker compose)
  backendEndpoint = "http://TODO";
}
/// Defines endpoint location for REST
export const BACKEND_ENDPOINT = backendEndpoint;
