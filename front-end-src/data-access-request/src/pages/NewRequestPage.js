import $ from "jquery";
import { useEffect, useState } from "react";
import Catalogue from "../components/Catalogue";
import { createShortDescription, createShortUUID } from "../commons/common-scripts";
import { BACKEND_ENDPOINT } from "../commons/backend-config";
import { getBackEndTokenObject } from "../auth/AuthenticationConfig";
import { useNavigate } from "react-router-dom";

/**
 * Construct list with selected tables and columns (for visualisation and REST).
 * @param {*} items Catalogue with description of tables and columns.
 * @param {*} whereStatementPerTable Dictionary with logic tableName -> WhereStatement.
 * @param {*} selectedColumnsTables Dictionary with selected columns, logic tableName -> listOfCols.
 * @returns list of mapping with logic tableParams -> value (especially list of cols).
 */
function constructTablesAndColumnsDictionary(
  items,
  whereStatementPerTable,
  selectedColumnsTables
) {
  let tablesAndColumnsList = [];

  Object.keys(selectedColumnsTables).map((tableName) => {
    let tablesAndColumnsDict = {};
    tablesAndColumnsDict["table_name"] = tableName;
    tablesAndColumnsDict["table_description"] = items[tableName]["table_description"];
    tablesAndColumnsDict["where_statement"] = whereStatementPerTable[tableName];
    tablesAndColumnsDict["columns"] = [];
    Array.from(selectedColumnsTables[tableName]).map((columnName) => {
      tablesAndColumnsDict["columns"].push({
        column_name: columnName,
        column_description: items[tableName]["columns"][columnName]["description"],
      });
      return null; // To remove warnings
    });
    tablesAndColumnsList.push(tablesAndColumnsDict);
    return null; // To remove warnings
  });

  return tablesAndColumnsList;
}

/**
 * To display a page for the new Data Access Request (aka DAR)
 * @param {*} setRequestOverview (setter) when true this page is hide and overview is displayed.

 * @param {*} setRequestTitle (setter) title for the new request.
 * @param {*} setRequestWorkspaceName (setter) name of the workspace.
 * @param {*} setRequestWorkspaceUUID (setter) UUID of the workspace.
 * @param {*} setRequestJustification (setter) justification for this DAR.
 * @param {*} requestTitle title for the DAR
 * @param {*} requestJustification justification for this DAR.
 * @param {*} requestWorkspaceUUID UUID of the workspace.

 * @param {*} selectedColumnsTables mapping with logic tableName -> arrayOfCols for setting cols checkboxes.
 * @param {*} setSelectedColumnsTables (setter) mapping with logic tableName -> arrayOfCols for setting cols checkboxes.

 * @param {*} items catalogue items.
 * @param {*} setSearchString (setter) for searching inside catalogue items (not in use).

 * @param {*} whereStatementPerTable mapping with where statements for each table, logic: tableName -> whereStm.
 * @param {*} setWhereStatementPerTable (setter) mapping with where statements for each table, logic: tableName -> whereStm.

 * @param {*} workspaces list of available workspaces.
 * @returns element (page) with new request
 */
const NewRequest = ({
  setRequestOverview,

  setRequestTitle,
  setRequestWorkspaceName,
  setRequestWorkspaceUUID,
  setRequestJustification,

  requestTitle,
  requestJustification,
  requestWorkspaceUUID,

  selectedColumnsTables,
  setSelectedColumnsTables,

  items,
  setSearchString,

  whereStatementPerTable,
  setWhereStatementPerTable,

  workspaces,
}) => {
  return (
    <>
      <h1>New Data Access Request</h1>
      <div className="clear"></div>
      <article>
        <form
          className="form-wrapper"
          onSubmit={(e) => {
            e.preventDefault();
            // Verification of inputs (and error message)
            var alert_text = "Error: ";
            if ($("#datarequestitle").val() === "") {
              alert_text += "Title is missing; \n";
            }
            if ($("#datarequestjustification").val() === "") {
              alert_text += "Justification is missing; \n";
            }
            if ($("#targetworkspace").find(":selected").val() === "_DEFAULT_") {
              alert_text += "Target workspace is missing; \n";
            }
            if (
              // Check if at least one table/column is selected
              $(`.chbox-column:checkbox:checked`).length === 0
            ) {
              alert_text += "At least one table/column has to be selected; \n";
            }
            if (alert_text !== "Error: ") {
              // Log error as a window
              alert(alert_text);
            } else {
              // Move to overview
              setRequestTitle($("#datarequestitle").val());
              setRequestWorkspaceName($("#targetworkspace").find(":selected").attr("title"));
              setRequestWorkspaceUUID($("#targetworkspace").find(":selected").val());
              setRequestJustification($("#datarequestjustification").val());

              // Serialize
              $(".where-statement").each((pos, whereStmObj) => {
                whereStatementPerTable[whereStmObj.title] =
                  whereStmObj.value === "" ? null : whereStmObj.value;
              });
              setWhereStatementPerTable(whereStatementPerTable);
              setRequestOverview(true);
            }
          }}
        >
          <h2 className="no-bottom-margin">Details about the target workspace</h2>
          <p>
            <em>
              In this section, please provide concrete details about your request and the workspace
              where the data should be provided.
            </em>
          </p>
          <label htmlFor="targetworkspace">
            Target workspace (and UUID):<sup>*</sup>
            <em> (Where the required data should be provided?)</em>
          </label>
          <select
            id="targetworkspace"
            defaultValue={requestWorkspaceUUID ? requestWorkspaceUUID : "_DEFAULT_"}
          >
            <option value={"_DEFAULT_"} disabled="disabled">
              Please select the target project and workspace.
            </option>
            {Array.from(workspaces).map((workspace) => (
              <option
                key={workspace.workspace_uuid}
                value={workspace.workspace_uuid}
                title={workspace.workspace_name}
              >
                {workspace.workspace_name} ({createShortUUID(workspace.workspace_uuid)})
              </option>
            ))}
          </select>
          <label htmlFor="datarequestitle">
            Title for the Data Access Request:<sup>*</sup>
          </label>
          <input
            type="text"
            placeholder="Data Request Title"
            defaultValue={requestTitle}
            maxLength={1024}
            id="datarequestitle"
          ></input>
          <label htmlFor="datarequestjustification">
            Description / Justification of the Data Access Request:<sup>*</sup>
          </label>
          <textarea
            cols="25"
            rows="5"
            id="datarequestjustification"
            placeholder="Data Access Request justification"
            defaultValue={requestJustification}
          ></textarea>

          <Catalogue
            formSelection={true}
            headerText={"Select the required tables and columns"}
            subHeaderText={
              "In this section, please select the concrete tables and columns you want to have provided from the RiO Data Source."
            }
            selectedColumnsTables={selectedColumnsTables}
            setSelectedColumnsTables={setSelectedColumnsTables}
            items={items}
            setSearchString={setSearchString}
            whereStatementPerTable={whereStatementPerTable}
            setWhereStatementPerTable={setWhereStatementPerTable}
          />
          <input type="submit" className={"button newrequest"} value={"NEXT"} />
        </form>
      </article>
    </>
  );
};

/**
 * Create a page for overview of the request (to confirming submit and adding comment)
 * @param {*} setRequestOverview (setter) when false this page is hide and new DAR form is displayed.
 * @param {*} requestTitle title for the DAR
 * @param {*} requestJustification justification for this DAR.
 * @param {*} requestWorkspaceUUID UUID of the workspace.
 * @param {*} requestWorkspaceName name of the workspace.
 * @param {*} selectedColumnsTables mapping with logic tableName -> arrayOfCols for setting cols checkboxes.
 * @param {*} items catalogue items.
 * @param {*} whereStatementPerTable mapping with where statements for each table, logic: tableName -> whereStm.
 * @param {*} commentState comment comming together with the request.
 * @param {*} setCommentState (setter) comment comming together with the request.
 * @returns page for overview of the request (to confirming submit and adding comment).
 */
const NewRequestOverview = ({
  setRequestOverview,
  requestTitle,
  requestJustification,
  requestWorkspaceName,
  requestWorkspaceUUID,
  selectedColumnsTables,
  whereStatementPerTable,
  items,
  commentState,
  setCommentState,
}) => {
  // To allow redirection to homepage
  const navigate = useNavigate();

  // Actual REST API post Data Access Request
  const postDataAccessRequest = async (requestDefinition) => {
    const res = await fetch(`${BACKEND_ENDPOINT}/request`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getBackEndTokenObject()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestDefinition),
    });
    return await res.json();
  };

  return (
    <>
      <h1>New Data Access Request Overview</h1>
      <div className="clear"></div>
      <p>
        <em>
          This is a summary of your new Data Access Request. Please verify if all the information
          is correct.
        </em>
      </p>
      <h2>Details about the target workspace</h2>
      <ul>
        <li>
          <strong>Target workspace name:</strong> {requestWorkspaceName}
        </li>
        <li>
          <strong>Target workspace ID:</strong> {requestWorkspaceUUID}
        </li>
        <li>
          <strong>Title for the Data Access Request:</strong> {requestTitle}
        </li>
        <li>
          <strong>Description / Justification of the Data Access Request:</strong>
          <p className="no-top-margin">{requestJustification}</p>
        </li>
      </ul>
      <h2>Select tables and columns</h2>
      <p>Please verify all selected tables and columns.</p>
      <ul>
        {Object.keys(selectedColumnsTables).map((table_name, pos) => (
          <li key={pos}>
            <strong>{table_name}: </strong>
            <em>{createShortDescription(items[table_name]["table_description"])}</em>
            <ul>
              {Array.from(selectedColumnsTables[table_name]).map((col_name, col_pos) => (
                <li key={col_pos}>
                  <strong>{col_name}:</strong>{" "}
                  {createShortDescription(items[table_name]["columns"][col_name]["description"])}
                </li>
              ))}
              {whereStatementPerTable[table_name] && (
                <li>
                  <strong>
                    <em>WHERE condition: </em> {whereStatementPerTable[table_name]}
                  </strong>
                </li>
              )}
            </ul>
          </li>
        ))}
      </ul>

      <h2>Comments</h2>
      <div className="form-wrapper">
        <label htmlFor="datarequestcomment">Any additional comments?</label>
        <textarea
          cols="25"
          rows="5"
          id="datarequestcomment"
          placeholder="Please write any additional comments if needed."
          defaultValue={commentState}
        ></textarea>
        <div className="clear"></div>
        <h2>Final confirmation</h2>
        <div className="checkbox-wrapper">
          <label htmlFor="agreech">
            <input type="checkbox" id="agreech" />I confirm that all the information above is
            correct.
          </label>
          <div className="clear"></div>
        </div>
      </div>

      <div className="bottom-menu">
        <div className="clear">&nbsp;</div>
        <a
          className="button previousstep rosebutton"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            setCommentState($("#datarequestcomment").val());
            setRequestOverview(false);
          }}
        >
          <span>Back</span>
        </a>

        <a
          className="button nexticon greenbutton"
          href="index.html"
          onClick={(e) => {
            e.preventDefault();
            if ($("#agreech:checkbox:checked").length > 0) {
              // Prepare request to be sent
              var request = {
                title: requestTitle,
                justification: requestJustification,
                workspace: {
                  workspace_name: requestWorkspaceName,
                  workspace_uuid: requestWorkspaceUUID,
                },
                comment:
                  $("#datarequestcomment").val() === "" ? null : $("#datarequestcomment").val(),
                tables_and_columns: constructTablesAndColumnsDictionary(
                  items,
                  whereStatementPerTable,
                  selectedColumnsTables
                ),
              };
              postDataAccessRequest(request);
              // After everything is send, go to homepage
              navigate("/");
            } else {
              // Log error
              alert("You have to tick the confirmation checkbox above!");
            }
          }}
        >
          <span>Submit</span>
        </a>
        <div className="clear"></div>
      </div>
    </>
  );
};

/**
 * Layout for the new Data Access Request page (using elements for overview and new request above).
 * @returns Page laout for the new DAR.
 */
const NewRequestPage = () => {
  // If true, overview page is displayed, if false, new request page is displayed
  const [isRequestOverview, setRequestOverview] = useState(false);
  // Title for the new request
  const [requestTitle, setRequestTitle] = useState("");
  // Workspace name for the new DAR
  const [requestWorkspaceName, setRequestWorkspaceName] = useState("");
  // Workspace UUID for the new DAR
  const [requestWorkspaceUUID, setRequestWorkspaceUUID] = useState("");
  // Justification of the new DAR
  const [requestJustification, setRequestJustification] = useState("");
  // To keep comment when comming back (comment for the new DAR)
  const [commentState, setCommentState] = useState("");
  // Contains selected columns and tables
  const [selectedColumnsTables, setSelectedColumnsTables] = useState({});
  // Represents workspaces available for the user
  const [workspaces, setWorkspaces] = useState([]);
  // Contains WHERE statements
  const [whereStatementPerTable, setWhereStatementPerTable] = useState({});
  // Contains the list of catalogue items
  const [items, setItems] = useState([]);
  // Search filter content
  const [searchString, setSearchString] = useState("");

  // Fetch workspaces (REST)
  useEffect(() => {
    const getWorkspaces = async () => {
      const itemsFromServer = await fetchWorkspaces();
      setWorkspaces(itemsFromServer);
    };
    getWorkspaces();
  }, []);

  // Actual REST API call to fetch workspaces items
  const fetchWorkspaces = async () => {
    const res = await fetch(`${BACKEND_ENDPOINT}/workspaces`, {
      headers: {
        Authorization: `Bearer ${getBackEndTokenObject()}`,
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  };

  // Fetch catalogue items (REST)
  useEffect(() => {
    const getItems = async (searchString) => {
      const itemsFromServer = await fetchItems(searchString);
      setItems(itemsFromServer);
    };
    getItems(searchString);
  }, [searchString]);

  // Actual REST API call to fetch catalogue items
  const fetchItems = async (searchString) => {
    const res = await fetch(
      `${BACKEND_ENDPOINT}/catalogue${searchString && `?search=${searchString}`}`,
      {
        headers: {
          Authorization: `Bearer ${getBackEndTokenObject()}`,
          "Content-Type": "application/json",
        },
      }
    );
    return await res.json();
  };

  return (
    <>
      {isRequestOverview ? (
        <NewRequestOverview
          setRequestOverview={setRequestOverview}
          requestTitle={requestTitle}
          requestJustification={requestJustification}
          requestWorkspaceName={requestWorkspaceName}
          requestWorkspaceUUID={requestWorkspaceUUID}
          selectedColumnsTables={selectedColumnsTables}
          items={items}
          whereStatementPerTable={whereStatementPerTable}
          commentState={commentState}
          setCommentState={setCommentState}
        />
      ) : (
        <NewRequest
          setRequestOverview={setRequestOverview}
          setRequestTitle={setRequestTitle}
          setRequestWorkspaceName={setRequestWorkspaceName}
          setRequestWorkspaceUUID={setRequestWorkspaceUUID}
          setRequestJustification={setRequestJustification}
          setSelectedColumnsTables={setSelectedColumnsTables}
          requestTitle={requestTitle}
          requestJustification={requestJustification}
          requestWorkspaceUUID={requestWorkspaceUUID}
          selectedColumnsTables={selectedColumnsTables}
          workspaces={workspaces}
          items={items}
          setSearchString={setSearchString}
          whereStatementPerTable={whereStatementPerTable}
          setWhereStatementPerTable={setWhereStatementPerTable}
        />
      )}
      <div className="clear">&nbsp;</div>
    </>
  );
};

export default NewRequestPage;
