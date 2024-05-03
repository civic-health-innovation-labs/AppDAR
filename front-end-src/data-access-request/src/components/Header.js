import { Link } from "react-router-dom";
import { getCurrentUser } from "../auth/AuthenticationConfig";

const Header = () => {
  /** Create page header component (right in the top)
   */
  return (
    <header>
      <Link to="/" id="logo">
        M-RIC Data Access Request
      </Link>
      <Link to="/user-details.html" id="personal-account">
        {getCurrentUser().name}
      </Link>
    </header>
  );
};

export default Header;
