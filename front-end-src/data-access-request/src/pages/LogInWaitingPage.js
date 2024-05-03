/**
 * Page that is displayed when user is waiting for redirection to MS Authentication.
 * @returns Page that is displayed when user is waiting for redirection to MS Authentication.
 */
const LogInWaitingPage = () => {
  return (
    <main>
      <section>
        <h1>Waiting for the log-in procedure.</h1>

        <div className="clear"></div>
        <article>
          <p>If it takes more than five seconds, please refresh the page.</p>
        </article>
      </section>
    </main>
  );
};

export default LogInWaitingPage;
