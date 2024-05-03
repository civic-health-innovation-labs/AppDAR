/**
 * Display a page with FAQ
 * @returns a page with FAQ
 */
const FAQPage = () => {
  return (
    <>
      <h1>FAQ</h1>

      <div className="clear"></div>
      <article>
        <h2>Frequently Asked Questions</h2>
        <h4>Classification of tables</h4>
        <p>
          There are the following categories for each table:
          <ul>
            <li>Data table: a table containing sensitive patient records.</li>
            <li>Code list: auxiliary table for data tables (like types of records, etc.).</li>
            <li>
              Code list with identifiables: auxiliary table for data tables (like types of records,
              etc.) which might contain identifiable records.
            </li>
          </ul>
        </p>
        <h4>Classification of columns</h4>
        <p>
          There are the following categories for each column:
          <ul>
            <li>free-text: a free text field (like progress notes, comments, etc.).</li>
            <li>sensitive: sensitive information (like NIN).</li>
            <li>client-id: ID of the client in the system (hashed value).</li>
            <li>date-time: Date and time value (like appointment time).</li>
            <li>date: Date of the year value (like day of birth/death).</li>
          </ul>
        </p>
      </article>
    </>
  );
};

export default FAQPage;
