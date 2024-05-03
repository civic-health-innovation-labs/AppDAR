import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { createShortDescription, parseDateTime } from "../commons/common-scripts";
import { BACKEND_ENDPOINT } from "../commons/backend-config";
import { AuthIsDataManagerComponent } from "../auth/AuthComponent";
import { getBackEndTokenObject } from "../auth/AuthenticationConfig";
import RequestDataManager from "../components/RequestDataManager";
import RequestRunPipeline from "../components/RequestRunPipeline";

/**
 * Displays a detail about the concrete Data Access Request
 * @returns page with a detail about the concrete Data Access Request
 */
const RequestDetailPage = () => {
  /// To find the UUID of the page
  const [requestParams] = useSearchParams();

  /// Details of the Data Access Request to be displayed
  const [dataAccessRequestDetail, setDataAccessRequestDetail] = useState({});

  /// Fetch data access request details (REST)
  useEffect(() => {
    const getDataAccessRequestDetail = async (darUUID) => {
      const itemsFromServer = await fetchDataAccessRequestDetail(darUUID);
      setDataAccessRequestDetail(itemsFromServer);
    };
    getDataAccessRequestDetail(requestParams.get("request_uuid"));
  }, [requestParams]);

  /// Actual REST API call to fetch DAR
  const fetchDataAccessRequestDetail = async (darUUID) => {
    const res = await fetch(`${BACKEND_ENDPOINT}/request?request_uuid=${darUUID}`, {
      headers: {
        Authorization: `Bearer ${getBackEndTokenObject()}`,
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  };

  return (
    <>
      {Object.keys(dataAccessRequestDetail).length > 0 ? (
        <>
          <h1>Data Access Request detail</h1>
          <div className="clear"></div>
          <p>
            <em>This is a summary of the concrete Data Access Request.</em>
          </p>
          <h3>Details about the target workspace</h3>
          <ul>
            <li>
              <strong>Target workspace name:</strong>{" "}
              {dataAccessRequestDetail.workspace.workspace_uuid}
            </li>
            <li>
              <strong>Target workspace ID:</strong>{" "}
              {dataAccessRequestDetail.workspace.workspace_name}
            </li>
            <li>
              <strong>Title for the Data Access Request:</strong> {dataAccessRequestDetail.title}
            </li>
            <li>
              <strong>Description / Justification of the Data Access Request:</strong>
              <p className="no-top-margin">{dataAccessRequestDetail.justification}</p>
            </li>
          </ul>
          <h3>Tables and columns</h3>
          <p>Tables and columns selected.</p>
          <ul>
            {Array.from(dataAccessRequestDetail.tables_and_columns).map((table, table_pos) => (
              <li key={table_pos}>
                <strong>{table.table_name}: </strong>
                <em>{createShortDescription(table.table_description)}</em>
                <ul>
                  {Array.from(table.columns).map((column, col_pos) => (
                    <li key={col_pos}>
                      <strong>{column.column_name}:</strong>{" "}
                      {createShortDescription(column.column_description)}
                    </li>
                  ))}
                  {table.where_statement && (
                    <li>
                      <strong>
                        <em>WHERE condition: </em> {table.where_statement}
                      </strong>
                    </li>
                  )}
                </ul>
              </li>
            ))}
          </ul>

          {dataAccessRequestDetail.comment && (
            <>
              <h3>Comments</h3>
              <p>{dataAccessRequestDetail.comment}</p>
            </>
          )}

          <h2>Status</h2>
          <p>
            Current status of the request: <strong>{dataAccessRequestDetail.status}</strong>
          </p>
          {dataAccessRequestDetail.status !== "pending" && (
            <>
              <h3>Decision</h3>
              <p>{dataAccessRequestDetail.reviewer_decision}</p>
              <p>
                <strong>Reviewed at:</strong> {parseDateTime(dataAccessRequestDetail.reviewed_on)}
              </p>
              <p>
                <strong>Reviewer:</strong> {dataAccessRequestDetail.reviewer.user_full_name}
              </p>
            </>
          )}

          <div className="bottom-menu">
            <div className="clear">&nbsp;</div>
            {dataAccessRequestDetail.status === "pending" ? (
              <Link
                to={`/request-delete.html?request_uuid=${dataAccessRequestDetail.request_uuid}`}
                className="button deletestep rosebutton"
              >
                DELETE
              </Link>
            ) : (
              <></>
            )}
            <div className="clear"></div>
          </div>
          {dataAccessRequestDetail.status === "pending" && (
            <AuthIsDataManagerComponent>
              <RequestDataManager
                requestUUID={dataAccessRequestDetail.request_uuid}
                tablesAndColumns={dataAccessRequestDetail.tables_and_columns}
              />
            </AuthIsDataManagerComponent>
          )}
          {dataAccessRequestDetail.status === "approved" && (
            <AuthIsDataManagerComponent>
              <RequestRunPipeline
                requestUUID={dataAccessRequestDetail.request_uuid}
                workspaceUUID={dataAccessRequestDetail.workspace_uuid}
                adfLink={dataAccessRequestDetail.adf_link}
              />
            </AuthIsDataManagerComponent>
          )}
        </>
      ) : (
        <p>Loading ...</p>
      )}
    </>
  );
};

export default RequestDetailPage;
