import { PublicClientApplication, EventType } from "@azure/msal-browser";
import {
  AADClientID,
  AADAuthority,
  FrontEndLocationHomeHref,
  FrontEndLocationLogOutHref,
  LogOutHref,
} from "../commons/auth-config";

// Configure MS Authentication
const configuration = {
  auth: {
    clientId: AADClientID,
    authority: AADAuthority,
    redirectUri: FrontEndLocationHomeHref,
    postLogoutRedirectUri: FrontEndLocationLogOutHref,
  },
};

/// Create new PublicClientApplication for MS Authentication
export const authPublicClientApp = new PublicClientApplication(configuration);

// Handles the case that user is already log in
if (!authPublicClientApp.getActiveAccount() && authPublicClientApp.getAllAccounts().length > 0) {
  authPublicClientApp.setActiveAccount(authPublicClientApp.getAllAccounts()[0]);
}

// Add event callback to add active account
authPublicClientApp.addEventCallback((event) => {
  if (
    (event.eventType === EventType.LOGIN_SUCCESS ||
      event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS ||
      event.eventType === EventType.SSO_SILENT_SUCCESS) &&
    event.payload.account
  ) {
    authPublicClientApp.setActiveAccount(event.payload.account);
  }
});

/**
 * Get the Bearer Authentication token for the current user
 * @returns JWS Bearer token object for authentication.
 */
export const getBackEndTokenObject = () => {
  return authPublicClientApp.getActiveAccount().idToken;
};

/**
 * Get roles for active user
 * @returns Array of the active user's roles
 */
export const getActiveUsersRoles = () => {
  // Get the part with Base64 info
  var b64 = getBackEndTokenObject().split(".")[1];
  // Converts to the URL base64
  var b64Std = b64.replace(/-/g, "+").replace(/_/g, "/");
  // Decode base6e
  var stringJSON = decodeURIComponent(
    atob(b64Std)
      .split("")
      .map(function (character) {
        // Decode space character
        return "%" + ("00" + character.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
  // Return an array with roles
  return JSON.parse(stringJSON)["roles"];
};

/**
 * Checks if the user role is Reasearcher
 * @returns If the user has 'Researcher' level, returns true, otherwise false.
 */
export const isResearcher = () => {
  return getActiveUsersRoles(authPublicClientApp).includes("Researcher");
};

/**
 * Checks if the user role is Data Manager
 * @returns If the user has 'Data Manager' level, returns true, otherwise false.
 */
export const isDataManager = () => {
  return getActiveUsersRoles(authPublicClientApp).includes("DataManager");
};

/**
 * Get the parameters of current user
 * @returns Get the parameters of current user
 */
export const getCurrentUser = () => {
  return {
    name: authPublicClientApp.getActiveAccount().name,
    username: authPublicClientApp.getActiveAccount().username,
    roles: getActiveUsersRoles(),
    localAccountId: authPublicClientApp.getActiveAccount().localAccountId,
  };
};

/**
 * Logout link
 * @returns Link to log out
 */
export const logOutLink = () => {
  return LogOutHref;
};
