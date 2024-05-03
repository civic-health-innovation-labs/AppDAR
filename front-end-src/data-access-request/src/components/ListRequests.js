import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import EmptyTable from "./EmptyTable";
import { createShortUUID, parseDateTime } from "../commons/common-scripts";
import { BACKEND_ENDPOINT } from "../commons/backend-config";
import { AuthIsDataManagerComponent } from "../auth/AuthComponent";
import { getBackEndTokenObject } from "../auth/AuthenticationConfig";

/**
 * Main list of available data access requests
 * @returns page with the list of request
 */
const ListRequests = () => {
  // Contains selected columns and tables
  const [requestsArray, setRequestsArray] = useState([]);

  // Fetch workspaces (REST)
  useEffect(() => {
    const getRequestsArray = async () => {
      const itemsFromServer = await fetchRequestsArray();
      setRequestsArray(itemsFromServer);
    };
    getRequestsArray();
  }, []);

  // Actual REST API call to fetch catalogue items
  const fetchRequestsArray = async () => {
    const res = await fetch(`${BACKEND_ENDPOINT}/requests`, {
      headers: {
        Authorization: `Bearer ${getBackEndTokenObject()}`,
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  };

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Target project (workspace)</th>
            <AuthIsDataManagerComponent>
              <th>Author</th>
            </AuthIsDataManagerComponent>
            <th>Status</th>
            <th>Created on</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requestsArray.map((accessRequest) => (
            <tr key={accessRequest.request_uuid}>
              <td>
                <Link to={`/request-detail.html?request_uuid=${accessRequest.request_uuid}`}>
                  <strong>{accessRequest.title}</strong>
                </Link>
              </td>
              <td>
                <Link to={`/request-detail.html?request_uuid=${accessRequest.request_uuid}`}>
                  {accessRequest.workspace.workspace_name} (
                  {createShortUUID(accessRequest.workspace.workspace_uuid)})
                </Link>
              </td>
              <AuthIsDataManagerComponent>
                <td>{accessRequest.creator.user_full_name}</td>
              </AuthIsDataManagerComponent>
              <td>{accessRequest.status}</td>
              <td>{parseDateTime(accessRequest.created_on)}</td>
              <td>
                {accessRequest.status === "pending" ? (
                  <Link
                    to={`/request-delete.html?request_uuid=${accessRequest.request_uuid}`}
                    className="delete"
                  >
                    X
                  </Link>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {
        /* In the case there are no rows to display */
        requestsArray.length === 0 && (
          <EmptyTable textForEmptyTable={"No access request available"} />
        )
      }
    </>
  );
};

export default ListRequests;
