import { BrowserRouter, Route, Routes } from "react-router-dom";

/* IMPORT CONCRETE PAGES */
import LogInWaitingPage from "./pages/LogInWaitingPage";
import LogOutPage from "./pages/LogOutPage";

/* AUTHENTICATION IMPORTS */
import { InteractionType } from "@azure/msal-browser";
import { MsalAuthenticationTemplate, MsalProvider } from "@azure/msal-react";
import AuthenticatedPage from "./AuthenticatedPage";
import { authPublicClientApp } from "./auth/AuthenticationConfig";

/**
 * Main application landing zone
 * @returns Fully managed application landing zone
 */
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="*"
          element={
            <MsalProvider instance={authPublicClientApp}>
              <MsalAuthenticationTemplate
                interactionType={InteractionType.Redirect}
                loadingComponent={LogInWaitingPage}
              >
                <AuthenticatedPage />
              </MsalAuthenticationTemplate>
            </MsalProvider>
          }
        />
        <Route path="/logout.html" Component={LogOutPage} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
