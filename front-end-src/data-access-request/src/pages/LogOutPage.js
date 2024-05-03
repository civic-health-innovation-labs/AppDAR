/**
 * Full page shown when user is logged out of the system.
 * @returns Full page shown when user is logged out of the system.
 */
const LogOutPage = () => {
  return (
    <main>
      <section>
        <h1>You have been successfully logged out.</h1>

        <div className="clear"></div>
        <article>
          <p>Please close the browser window.</p>
        </article>
      </section>
    </main>
  );
};

export default LogOutPage;
