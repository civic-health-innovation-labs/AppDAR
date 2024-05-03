import { useLocation } from "react-router-dom";

const createNavLocation = (location) => {
  /**Create a description of the current location
   * Args:
   *    location: Where is the current location (type useLocation)
   */
  switch (location.pathname) {
    case "/catalogue.html":
      return "Data Catalogue";
    case "/faq.html":
      return "Frequently Asked Questions";
    case "/terms-of-use.html":
      return "Terms Of Use";
    case "/new-data-access-request.html":
      return "New Data Access Request";
    case "/request-detail.html":
      return "Data Access Request detail";
    case "/request-delete.html":
      return "Delete Data Access Request";
    case "/user-details.html":
      return "User details";
    default:
      return "Data Access Request";
  }
};

const Nav = () => {
  const location = useLocation();
  return (
    <nav>
      <p>{createNavLocation(location)}</p>
    </nav>
  );
};

export default Nav;
