import PropTypes from "prop-types";
import { isDataManager, isResearcher, authPublicClientApp } from "./AuthenticationConfig";

/**
 * Display content only when the current active user is Data Manager
 * @param {children} Represents the content of the tag.
 * @returns Tag content or nothing.
 */
export const AuthIsDataManagerComponent = ({ children }) => {
  return <>{isDataManager(authPublicClientApp) && children}</>;
};

/**
 * Display content only when the current active user is Researcher
 * @param {children} Represents the content of the tag.
 * @returns Tag content or nothing.
 */
export const AuthIsResearcherComponent = ({ children }) => {
  return <>{isResearcher(authPublicClientApp) && children}</>;
};

AuthIsDataManagerComponent.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element.isRequired,
  ]),
};

AuthIsResearcherComponent.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element.isRequired,
  ]),
};
