import $ from "jquery";
import { useNavigate } from "react-router-dom";
import { BACKEND_ENDPOINT } from "../commons/backend-config";
import { getBackEndTokenObject } from "../auth/AuthenticationConfig";
import { createShortTableName } from "../commons/common-scripts";

/**
 * To display requested tables and column as a Python code ready for review on a real data.
 * @param {*} tablesAndColumns mapping with tables and columns
 * @returns requested tables and column as a Python code ready for review on a real data.
 */
const tablesAndColumnsForWorkbook = (tablesAndColumns) => {
  let selectionArea = "";
  Array.from(tablesAndColumns).map((table) => {
    let tableShortName = createShortTableName(table.table_name);
    selectionArea += `df_${tableShortName} = spark.read.format("delta").load(f"wasbs://{SOURCE_BLOB_NAME}@{SOURCE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${tableShortName}")`;
    // Add all columns that are required
    selectionArea += ".select([";
    Array.from(table.columns).map((column) => {
      selectionArea += `"${column.column_name}", `;
      return null;
    });
    selectionArea += "])";
    // Add a where statement if needed
    if (tablesAndColumns.where_statement) {
      selectionArea += `.where("${tablesAndColumns.where_statement}")`;
    }
    selectionArea += `\ndisplay(df_${tableShortName})\n\n`;
    return null;
  });
  return selectionArea;
};

/**
 * Generates the part for data management of the request
 * @param requestUUID UUID of the task to be scrutinized.
 * @returns part for data management of the request
 */
function RequestDataManager({ requestUUID, tablesAndColumns }) {
  // To redirect to homepage later
  const navigate = useNavigate();
  // Actual REST API submit review of the Data Access Request
  const reviewDataAccessRequest = async (darReviewBody) => {
    const res = await fetch(`${BACKEND_ENDPOINT}/review-request`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getBackEndTokenObject()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(darReviewBody),
    });
    return await res.json();
  };

  return (
    <div className="large-top-margin">
      <h1>Data Management Section</h1>
      <p>
        <em>
          This section focuses on the request itself. It can be either approved or rejected. Both
          decisions require justification.
        </em>
      </p>
      <div className="form-wrapper">
        <label htmlFor="data-python-overview">Python code to simplify the review process:</label>
        <textarea id="data-python-overview" defaultValue={tablesAndColumnsForWorkbook(tablesAndColumns)} disabled></textarea>
        <h2>Your decision</h2>
        <p>
          Dear Data Manager, now, you must decide how to proceed with this request.<sup>*</sup>
        </p>
        <p>
          <label htmlFor="approveDAR">
            <input type="radio" value="approved" id="approveDAR" name="DARdecision" />
            <strong>APPROVE:</strong> I wish to approve this Data Access Request.
          </label>
        </p>
        <p>
          <label htmlFor="rejectDAR">
            <input type="radio" value="rejected" id="rejectDAR" name="DARdecision" />
            <strong>REJECT:</strong> I wish to reject this Data Access Request.
          </label>
        </p>

        <h2>Justification/reasons for decisions</h2>

        <label htmlFor="datarequestdecision">
          What led you to reach this decision?<sup>*</sup>
        </label>
        <textarea
          cols="25"
          rows="5"
          id="datarequestdecision"
          placeholder="Please write your justification here"
        ></textarea>
        <div className="clear"></div>
        <h2>Final confirmation</h2>
        <div className="checkbox-wrapper">
          <label htmlFor="agreech">
            <input type="checkbox" id="agreech" />I confirm that all the information above is
            correct.<sup>*</sup>
          </label>
          <div className="clear"></div>
        </div>
      </div>
      <div className="bottom-menu">
        <div className="clear">&nbsp;</div>
        <a
          href="/"
          className="button greenbutton"
          onClick={(e) => {
            e.preventDefault();
            let errorMessage = "";
            if ($("#datarequestdecision").val() === "") {
              errorMessage += "You need to fill the justification!\n";
            }
            if (!$("#agreech").is(":checked")) {
              errorMessage += "You need to tick the confirmation checkbox!\n";
            }
            if (!($("#approveDAR").is(":checked") || $("#rejectDAR").is(":checked"))) {
              errorMessage += "You need to select the decision (approve or reject)!\n";
            }
            if (errorMessage !== "") {
              alert(errorMessage);
            } else {
              // Get the status
              let status = "approved";
              if ($("#rejectDAR").is(":checked")) {
                status = "rejected";
              }
              let darReviewBody = {
                request_uuid: requestUUID,
                status: status,
                reviewer_decision: $("#datarequestdecision").val(),
              };
              reviewDataAccessRequest(darReviewBody);
              // After everything is send, go to homepage
              navigate("/");
            }
          }}
        >
          SUBMIT DECISION
        </a>
        <div className="clear"></div>
      </div>
    </div>
  );
}

export default RequestDataManager;
