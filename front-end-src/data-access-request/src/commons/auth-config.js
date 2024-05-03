import { ENVIRONMENT } from "./environment-config";

/// Application (client) ID (from Azure AD B2C)
export const AADClientID = "TODO";
/// Standard Azure Tenant ID
export const AADTenantID = "TODO";
/// URL to the login page by Microsoft
export const AADAuthority = `https://login.microsoftonline.com/${AADTenantID}`;
/// Config for the location (where to redirect if success log-in)
let frontEndLocationHomeHref = "https://TODO/";
/// Where to redirect after logout
let frontEndLocationLogOutHref = "https://TODO/logout.html";
if (ENVIRONMENT === "local") {
  // For development purposes (address from docker compose)
  frontEndLocationHomeHref = "http://TODO";
  frontEndLocationLogOutHref = "http://TODO/logout.html";
}
/// Config for the location (where to redirect if success log-in)
export const FrontEndLocationHomeHref = frontEndLocationHomeHref;
/// Where to redirect after logout
export const FrontEndLocationLogOutHref = frontEndLocationLogOutHref;
/// Location for log out activity
export const LogOutHref = "https://login.microsoftonline.com/logout.srf";
