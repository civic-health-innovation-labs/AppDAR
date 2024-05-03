import { getCurrentUser, logOutLink } from "../auth/AuthenticationConfig";

/**
 * Print information about the current user and allows to logout.
 * @returns page with current user info.
 */
const UserDetailsPage = () => {
  return (
    <>
      <h1>User Details</h1>

      <div className="clear"></div>
      <article>
        <p>
          <strong>Full name:</strong> {getCurrentUser().name}
        </p>
        <p>
          <strong>User name:</strong> {getCurrentUser().username}
        </p>
        <p>
          <strong>UUID:</strong> {getCurrentUser().localAccountId}
        </p>
        <p>
          <strong>Roles:</strong> {getCurrentUser().roles.join(", ")}
        </p>
        <p>
          <br />
          <a className="button rosebutton" href={logOutLink()}>
            Log out
          </a>
        </p>
      </article>
    </>
  );
};

export default UserDetailsPage;
