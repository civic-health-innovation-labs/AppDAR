import PropTypes from "prop-types";

const EmptyTable = ({ textForEmptyTable }) => {
  /** Placeholder for empty table (including CSS)
   * Arguments:
   *    textForEmptyTable: Text which is displayed.
   */
  return (
    <div className="empty-table">
      <em>{textForEmptyTable}</em>
    </div>
  );
};

// Default value
EmptyTable.defaultProps = {
  textForEmptyTable: "Empty",
};
// Type checking
EmptyTable.propTypes = {
  textForEmptyTable: PropTypes.string,
};

export default EmptyTable;
