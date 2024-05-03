import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BACKEND_ENDPOINT } from "../commons/backend-config";
import { getBackEndTokenObject } from "../auth/AuthenticationConfig";

/**
 * Returns the number of entries subject to visibility, or zero if the entry is not registered.
 * @param {*} workspaceUserVisibilityArray Mapping of visibility (from workspace to user and vice versa)
 * @param {String} logic Defines whether to go via users to workspaces or in the opposite direction
 * @param {String} objectUUID Which workspace or user is analised
 * @returns Size of the array or zero.
 */
const getTheVisibilityLenghtOrZero = (workspaceUserVisibilityArray, logic, objectUUID) => {
  if (workspaceUserVisibilityArray === null) {
    return 0;
  }
  if (objectUUID in workspaceUserVisibilityArray[logic]) {
    return workspaceUserVisibilityArray[logic][objectUUID].length;
  }
  return 0;
};

/**
 * Display a page for management of users and workspaces
 * @returns page for management of users and workspaces
 */
function ManagementPage() {
  // Contains the list of all users
  const [userListArray, setUserListArray] = useState([]);

  // Fetch users (REST)
  useEffect(() => {
    const getUserListArray = async () => {
      const itemsFromServer = await fetchUserListArray();
      setUserListArray(itemsFromServer);
    };
    getUserListArray();
  }, []);

  // Actual REST API call to fetch users
  const fetchUserListArray = async () => {
    const res = await fetch(`${BACKEND_ENDPOINT}/list-users`, {
      headers: {
        Authorization: `Bearer ${getBackEndTokenObject()}`,
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  };

  // Represents workspaces available for the user
  const [workspaces, setWorkspaces] = useState([]);

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

  // Map of available workspaces for each user and vice versa (based on visibility).
  const [workspaceUserVisibilityArray, setWorkspaceUserVisibilityArray] = useState(null);

  // Fetch workspace-user visibility (REST)
  useEffect(() => {
    const getWorkspaceUserVisibilityArray = async () => {
      const itemsFromServer = await fetchWorkspaceUserVisibilityArray();
      setWorkspaceUserVisibilityArray(itemsFromServer);
    };
    getWorkspaceUserVisibilityArray();
  }, []);

  // Actual REST API call to fetch workspace-user visibility items
  const fetchWorkspaceUserVisibilityArray = async () => {
    const res = await fetch(`${BACKEND_ENDPOINT}/workspaces-visibility-per-user-and-vice-versa`, {
      headers: {
        Authorization: `Bearer ${getBackEndTokenObject()}`,
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  };

  return (
    <>
      <h1>Management section</h1>
      <div className="newrequest-wrap">
        <Link to="/workspace-add.html" className={"button newrequest middle-left-margin"}>
          <span>ADD WORKSPACE</span>
        </Link>
        <Link to="/user-add.html" className={"button newrequest"}>
          <span>ADD USER</span>
        </Link>
        <div className="clear"></div>
      </div>
      <div className="clear"></div>
      <p>
        <em>Management of users and workspaces.</em>
      </p>
      <article>
        <h2>Workspaces</h2>
        <p>List of workspaces and users permitted to use them.</p>
        <table>
          <thead>
            <tr>
              <th>Workspace name</th>
              <th>Workspace UUID</th>
              <th title="Number of researchers that can see this workspace">Nr res.</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {workspaces.map((workspace, pos) => (
              <tr key={pos}>
                <td>
                  <Link to={`/workspace-edit.html?workspace_uuid=${workspace.workspace_uuid}`}>
                    {workspace.workspace_name}
                  </Link>
                </td>
                <td>
                  <Link to={`/workspace-edit.html?workspace_uuid=${workspace.workspace_uuid}`}>
                    {workspace.workspace_uuid}
                  </Link>
                </td>
                <td>
                  {workspaceUserVisibilityArray !== null &&
                    getTheVisibilityLenghtOrZero(
                      workspaceUserVisibilityArray,
                      "workspace_to_users",
                      workspace.workspace_uuid
                    )}
                </td>
                <td>
                  <Link
                    to={`/workspace-delete.html?workspace_uuid=${workspace.workspace_uuid}`}
                    className="delete"
                  >
                    X
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Active users added into the system</h2>
        <p>Simple list of users active in the system.</p>
        <table>
          <thead>
            <tr>
              <th>Full name</th>
              <th>Username</th>
              <th>UUID</th>
              <th title="Number of workspaces visible for each researcher">Nr wsp.</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {userListArray.map((singleUser, pos) => (
              <tr key={pos}>
                <td>
                  <Link to={`/user-edit.html?user_uuid=${singleUser.user_uuid}`}>
                    {singleUser.user_full_name}
                  </Link>
                </td>
                <td>
                  <Link to={`/user-edit.html?user_uuid=${singleUser.user_uuid}`}>
                    {singleUser.user_username}
                  </Link>
                </td>
                <td>
                  <Link to={`/user-edit.html?user_uuid=${singleUser.user_uuid}`}>
                    {singleUser.user_uuid}
                  </Link>
                </td>
                <td>
                  {workspaceUserVisibilityArray !== null &&
                    getTheVisibilityLenghtOrZero(
                      workspaceUserVisibilityArray,
                      "user_to_workspaces",
                      singleUser.user_uuid
                    )}
                </td>
                <td>
                  <Link
                    to={`/user-delete.html?user_uuid=${singleUser.user_uuid}`}
                    className="delete"
                  >
                    X
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </>
  );
}

export default ManagementPage;
