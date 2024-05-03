import $ from "jquery";
import { useState, useEffect } from "react";
import ReactDomServer from "react-dom/server";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { BACKEND_ENDPOINT } from "../commons/backend-config";
import { getBackEndTokenObject } from "../auth/AuthenticationConfig";

/**
 * Display a manager mode for workspace modification or adding
 * @returns page for manager mode for workspace modification or adding
 */
function WorkspacePage() {
  // To allow redirection
  const navigate = useNavigate();

  // To find the UUID of the page
  const [requestParams] = useSearchParams();

  // Number of users to be linked
  const [numberOfUsersToBeLinked, setNumberOfUsersToBeLinked] = useState(0);

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

  // Contains the info about workspace (for editing)
  const [workspaceDetails, setWorkspaceDetails] = useState(null);

  // Contains the info about workspace (for editing)
  const [usersPerWorkspace, setUsersPerWorkspace] = useState([]);

  // Fetch workspace (REST)
  useEffect(() => {
    const getWorkspace = async (workspace_uuid) => {
      const itemsFromServer = await fetchWorkspace(workspace_uuid);
      setWorkspaceDetails(itemsFromServer);
    };

    const getUsersPerWorkspace = async (workspace_uuid) => {
      const itemsFromServer = await fetchUsersPerWorkspace(workspace_uuid);
      setUsersPerWorkspace(itemsFromServer.available_workspaces);
      setNumberOfUsersToBeLinked(itemsFromServer.available_workspaces.length);
    };
    if (requestParams.has("workspace_uuid")) {
      getWorkspace(requestParams.get("workspace_uuid"));
      getUsersPerWorkspace(requestParams.get("workspace_uuid"));
    }
  }, [requestParams]);

  // Actual REST API call to fetch workspace
  const fetchWorkspace = async (workspace_uuid) => {
    const res = await fetch(`${BACKEND_ENDPOINT}/workspace?workspace_uuid=${workspace_uuid}`, {
      headers: {
        Authorization: `Bearer ${getBackEndTokenObject()}`,
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  };

  // Actual REST API call to users that can see a concrete workspace
  const fetchUsersPerWorkspace = async (workspace_uuid) => {
    const res = await fetch(
      `${BACKEND_ENDPOINT}/users-per-workspace?workspace_uuid=${workspace_uuid}`,
      {
        headers: {
          Authorization: `Bearer ${getBackEndTokenObject()}`,
          "Content-Type": "application/json",
        },
      }
    );
    return await res.json();
  };

  /**
   * Actual server call to either update (PUT) or create (POST) workspace.
   * @param {*} requestDefinition Definition of the user (either new or existing to update)
   * @param {*} method Either PUT (for update) or POST (for create)
   * @returns Server's response
   */
  const createOrUpdateWorkspace = async (requestDefinition, method = "POST") => {
    const res = await fetch(
      `${BACKEND_ENDPOINT}/workspace${
        method === "POST" ? "" : "?workspace_uuid=" + requestDefinition.workspace_uuid
      }`,
      {
        method: method,
        headers: {
          Authorization: `Bearer ${getBackEndTokenObject()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestDefinition),
      }
    );
    return await res.json();
  };

  return (
    <>
      <h1>Workspace</h1>
      <div className="clear"></div>
      <article>
        <form
          className="form-wrapper"
          onSubmit={(e) => {
            e.preventDefault();
            if ($("#workspacename").val() === "" || $("#workspaceuuid").val() === "") {
              alert("All fields need to be filled!");
            } else {
              let arrayOfUsers = new Set();
              $(".linkedUsersClass").each((pos, linkedUsersVal) => {
                if (linkedUsersVal.value !== "_DEFAULT_") {
                  arrayOfUsers.add(linkedUsersVal.value);
                }
              });
              let workspaceObj = {
                workspace_name: $("#workspacename").val(),
                workspace_uuid: $("#workspaceuuid").val(),
                visible_for_users: Array.from(arrayOfUsers),
              };

              let method = "POST";
              if (workspaceDetails !== null) {
                method = "PUT";
              }
              createOrUpdateWorkspace(workspaceObj, method);
              navigate("/management.html");
            }
          }}
        >
          <h2 className="no-bottom-margin">Details about workspace</h2>
          <p>
            <em>These details about the workspace need to match the one on the TRE level.</em>
          </p>
          <label htmlFor="workspaceuuid">
            UUID of the workspace:<sup>*</sup>
          </label>
          <input
            type="text"
            placeholder="Workspace UUID"
            maxLength={40}
            defaultValue={workspaceDetails !== null ? workspaceDetails.workspace_uuid : ""}
            id="workspaceuuid"
            pattern="[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
            disabled={workspaceDetails !== null}
          ></input>
          <label htmlFor="workspacename">
            Name of the workspace:<sup>*</sup>
          </label>
          <input
            type="text"
            placeholder="Workspace Name"
            maxLength={1024}
            defaultValue={workspaceDetails !== null ? workspaceDetails.workspace_name : ""}
            id="workspacename"
          ></input>

          <div id="linkedUsers">
            {Array.from(usersPerWorkspace).map((selectedUser, pos) => (
              <div key={pos}>
                <label htmlFor={`linkedUser${pos + 1}`}>
                  Select a researcher (number {pos + 1}) that has access to this workspace:
                </label>
                <select
                  id={`linkedUser${pos + 1}`}
                  defaultValue={selectedUser}
                  className="linkedUsersClass"
                >
                  <option value={"_DEFAULT_"}>Remove this researcher.</option>
                  {Array.from(userListArray).map((singleUser) => (
                    <option
                      key={singleUser.user_uuid}
                      value={singleUser.user_uuid}
                      title={singleUser.user_full_name}
                    >
                      {singleUser.user_full_name} [{singleUser.user_username}] (
                      {singleUser.user_uuid})
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="clear">&nbsp;</div>
          <input
            type="button"
            className={"button newrequest"}
            value={"ADD A USER"}
            onClick={(e) => {
              e.preventDefault();
              if (userListArray.length > 0) {
                let newElement = ReactDomServer.renderToString(
                  <>
                    <label htmlFor={`linkedUser${numberOfUsersToBeLinked + 1}`}>
                      Select a researcher (number {numberOfUsersToBeLinked + 1}) that has access to
                      this workspace:
                    </label>
                    <select
                      id={`linkedUser${numberOfUsersToBeLinked + 1}`}
                      className="linkedUsersClass"
                      defaultValue={"_DEFAULT_"}
                    >
                      <option value={"_DEFAULT_"}>Please select the researcher.</option>
                      {Array.from(userListArray).map((singleUser) => (
                        <option
                          key={singleUser.user_uuid}
                          value={singleUser.user_uuid}
                          title={singleUser.user_full_name}
                        >
                          {singleUser.user_full_name} [{singleUser.user_username}] (
                          {singleUser.user_uuid})
                        </option>
                      ))}
                    </select>
                  </>
                );
                $("#linkedUsers").append(newElement);
                setNumberOfUsersToBeLinked(numberOfUsersToBeLinked + 1);
              }
            }}
          />
          <div className="clear">&nbsp;</div>
          <input type="submit" className={"button newrequest"} value={"SUBMIT"} />
          <div className="clear">&nbsp;</div>
        </form>
      </article>
    </>
  );
}

export default WorkspacePage;
