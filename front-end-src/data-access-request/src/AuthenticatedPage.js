import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Nav from "./components/Nav";
import Menu from "./components/Menu";
/* IMPORT CONCRETE PAGES */
import FAQPage from "./pages/FaqPage";
import CataloguePage from "./pages/CataloguePage";
import HomePage from "./pages/HomePage";
import TermsOfUsePage from "./pages/TermsOfUsePage";
import NewRequestPage from "./pages/NewRequestPage";
import RequestDetailPage from "./pages/RequestDetailPage";
import DeleteRequestPage from "./pages/DeleteRequestPage";
import UserDetailsPage from "./pages/UserDetailsPage";
import ManagementPage from "./pages/ManagementPage";
import WorkspacePage from "./pages/WorkspacePage";
import ManageUserPage from "./pages/ManageUserPage";
import DeleteUserPage from "./pages/DeleteUserPage";
import DeleteWorkspacePage from "./pages/DeleteWorkspacePage";

/**
 * Application as loaded if authentication works
 * @returns Application for authenticated users
 */
const AuthenticatedPage = () => {
  return (
    <>
      <Header />
      <Nav />
      <main>
        <Menu />
        <section>
          <Routes>
            <Route path="/" exact Component={HomePage} />
            <Route path="/faq.html" Component={FAQPage} />
            <Route path="/terms-of-use.html" Component={TermsOfUsePage} />
            <Route path="/catalogue.html" Component={CataloguePage} />
            <Route path="/new-data-access-request.html" Component={NewRequestPage} />
            <Route path="/request-detail.html" Component={RequestDetailPage} />
            <Route path="/request-delete.html" Component={DeleteRequestPage} />
            <Route path="/user-details.html" Component={UserDetailsPage} />
            <Route path="/management.html" Component={ManagementPage} />
            <Route path="/workspace-add.html" Component={WorkspacePage} />
            <Route path="/workspace-edit.html" Component={WorkspacePage} />
            <Route path="/user-add.html" Component={ManageUserPage} />
            <Route path="/user-edit.html" Component={ManageUserPage} />
            <Route path="/user-delete.html" Component={DeleteUserPage} />
            <Route path="/workspace-delete.html" Component={DeleteWorkspacePage} />
          </Routes>
        </section>
        <div className="clear"></div>
      </main>
    </>
  );
};

export default AuthenticatedPage;
