import { Link } from "react-router-dom";
import ListRequests from "../components/ListRequests";

/**
 * Display main homepage (Data Access Request Overview)
 * @returns main homepage
 */
const HomePage = () => {
  return (
    <>
      <h1>Data Access Requests overview</h1>
      <div className="newrequest-wrap">
        <Link to="/new-data-access-request.html" className={"button newrequest"}>
          <span>NEW REQUEST</span>
        </Link>
        <div className="clear"></div>
      </div>
      <div className="clear"></div>
      <p>
        <em>The following table shows an overview of your data access requests.</em>
      </p>
      <article>
        <ListRequests />
      </article>
    </>
  );
};

export default HomePage;
