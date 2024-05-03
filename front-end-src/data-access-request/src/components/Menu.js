import { Link, useLocation } from "react-router-dom";
import { AzureTREWebsiteURL } from "../commons/front-end-config";
import { AuthIsDataManagerComponent } from "../auth/AuthComponent";

const Menu = () => {
  const location = useLocation();
  return (
    <aside>
      <ul>
        <li
          className={
            location.pathname === "/" ||
            location.pathname === "/new-data-access-request.html" ||
            location.pathname === "/request-detail.html" ||
            location.pathname === "/request-delete.html"
              ? "selected"
              : ""
          }
        >
          <Link to="/">Data Access Requests</Link>
        </li>

        <li className={location.pathname === "/catalogue.html" ? "selected" : ""}>
          <Link to="catalogue.html">Catalogue</Link>
        </li>
        <li className={location.pathname === "/faq.html" ? "selected" : ""}>
          <Link to="faq.html">FAQ</Link>
        </li>
        <li className={location.pathname === "/terms-of-use.html" ? "selected" : ""}>
          <Link to="terms-of-use.html">Terms of Use</Link>
        </li>
        <AuthIsDataManagerComponent>
          <li className={location.pathname === "/management.html" ? "selected" : ""}>
            <Link to="management.html">Management</Link>
          </li>
        </AuthIsDataManagerComponent>
        <li>
          <a href={AzureTREWebsiteURL}>Back to TRE</a>
        </li>
      </ul>
    </aside>
  );
};

export default Menu;
