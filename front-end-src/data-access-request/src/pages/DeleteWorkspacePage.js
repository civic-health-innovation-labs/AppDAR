import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BACKEND_ENDPOINT } from "../commons/backend-config";
import { getBackEndTokenObject } from "../auth/AuthenticationConfig";
import { useNavigate } from "react-router-dom";

function DeleteWorkspacePage() {
  // To redirect later
  const navigate = useNavigate();

  // To find the ID from URL
  const [requestParams] = useSearchParams();

  // Search filter content
  const [workspaceDetail, setWorkspaceDetail] = useState(null);

  // Fetch workspace details (REST)
  useEffect(() => {
    const getWorkspaceDetail = async (workspaceUUID) => {
      const itemsFromServer = await fetchWorkspaceDetail(workspaceUUID);
      setWorkspaceDetail(itemsFromServer);
    };
    getWorkspaceDetail(requestParams.get("workspace_uuid"));
  }, [requestParams]);

  // Actual REST API call to fetch a single workspace
  const fetchWorkspaceDetail = async (workspaceUUID) => {
    const res = await fetch(`${BACKEND_ENDPOINT}/workspace?workspace_uuid=${workspaceUUID}`, {
      headers: {
        Authorization: `Bearer ${getBackEndTokenObject()}`,
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  };

  // Actual REST API delete workspace
  const deleteWorkspace = async (workspaceUUID) => {
    const res = await fetch(`${BACKEND_ENDPOINT}/workspace?workspace_uuid=${workspaceUUID}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getBackEndTokenObject()}`,
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  };

  return (
    <>
      {workspaceDetail !== null ? (
        <>
          <h1>Delete workspace from the system</h1>
          <div className="clear"></div>
          <p>
            <em>Are you sure you want to delete the following workspace?</em> Be aware that it does not
            delete the workspace on the Azure level.
          </p>
          <h3>Details about the workspace</h3>
          <ul>
            <li>
              <strong>UUID of the workspace:</strong> {workspaceDetail.workspace_uuid}
            </li>
            <li>
              <strong>Name of the workspace:</strong> {workspaceDetail.workspace_name}
            </li>
          </ul>

          <div className="bottom-menu">
            <div className="clear">&nbsp;</div>
            <a
              className="button previousstep greenbutton"
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
              }}
            >
              <span>No</span>
            </a>

            <a
              className="button nexticon rosebutton"
              href="/"
              onClick={(e) => {
                e.preventDefault();

                deleteWorkspace(workspaceDetail.workspace_uuid);
                // After everything is send:
                navigate("/management.html");
              }}
            >
              <span>Yes</span>
            </a>
            <div className="clear"></div>
          </div>
        </>
      ) : (
        <p>Loading ...</p>
      )}
    </>
  );
}

export default DeleteWorkspacePage;
