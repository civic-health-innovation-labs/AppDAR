import $ from "jquery";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { BACKEND_ENDPOINT } from "../commons/backend-config";
import { getBackEndTokenObject } from "../auth/AuthenticationConfig";

function ManageUserPage() {
  // To allow redirection
  const navigate = useNavigate();

  // To find the UUID of the page
  const [requestParams] = useSearchParams();

  // Contains the info about user (for editing)
  const [userDetails, setUserDetails] = useState(null);

  // Fetch user (REST)
  useEffect(() => {
    const getUser = async (user_uuid) => {
      const itemsFromServer = await fetchUser(user_uuid);
      setUserDetails(itemsFromServer);
    };
    if (requestParams.has("user_uuid")) {
      getUser(requestParams.get("user_uuid"));
    }
  }, [requestParams]);

  // Actual REST API call to fetch users
  const fetchUser = async (user_uuid) => {
    const res = await fetch(`${BACKEND_ENDPOINT}/user?user_uuid=${user_uuid}`, {
      headers: {
        Authorization: `Bearer ${getBackEndTokenObject()}`,
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  };

  /**
   * Actual server call to either update (PUT) or create (POST) user.
   * @param {*} requestDefinition Definition of the user (either new or existing to update)
   * @param {*} method Either PUT (for update) or POST (for create)
   * @returns Server's response
   */
  const createOrUpdateUser = async (requestDefinition, method = "POST") => {
    const res = await fetch(
      `${BACKEND_ENDPOINT}/user${method === "POST" ? "" : "?user_uuid=" + userDetails.user_uuid}`,
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
      <h1>{userDetails !== null ? "Edit existing" : "Add new"} user</h1>
      <div className="clear"></div>
      <article>
        <form
          className="form-wrapper"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <h2 className="no-bottom-margin">Details about the user</h2>
          <p>
            <em>These details about the user need to match the one on the TRE (Azure) level.</em>
          </p>
          <label htmlFor="useruuid">
            UUID of the user:<sup>*</sup>
          </label>
          <input
            type="text"
            placeholder="User's UUID (c98218cd-7482-49ba-b50c-ebe22d8fa015)"
            maxLength={40}
            defaultValue={userDetails !== null ? userDetails.user_uuid : ""}
            id="useruuid"
            pattern="[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
            disabled={userDetails !== null}
          ></input>
          <label htmlFor="userfullname">
            Full name of the user:<sup>*</sup>
          </label>
          <input
            type="text"
            placeholder="Full name (John Example)"
            maxLength={1024}
            defaultValue={userDetails !== null ? userDetails.user_full_name : ""}
            id="userfullname"
          ></input>
          <label htmlFor="userusername">
            Username of the user:<sup>*</sup>
          </label>
          <input
            type="text"
            placeholder="Username (john.example@onmicrosoft.com)"
            maxLength={1024}
            defaultValue={userDetails !== null ? userDetails.user_username : ""}
            id="userusername"
          ></input>

          <div className="clear">&nbsp;</div>
          <input
            type="submit"
            className={"button newrequest"}
            value={"SUBMIT"}
            onClick={(e) => {
              e.preventDefault();
              if (
                $("#useruuid").val() === "" ||
                $("#userfullname").val() === "" ||
                $("#userusername").val() === ""
              ) {
                alert("All entries have to be filled!");
              } else if (window.confirm("Do you wish to add/edit a user?")) {
                let editedUserDetails = {
                  user_uuid: $("#useruuid").val(),
                  user_full_name: $("#userfullname").val(),
                  user_username: $("#userusername").val(),
                };
                let method = "POST";
                if (userDetails !== null) {
                  method = "PUT";
                }
                createOrUpdateUser(editedUserDetails, method);
                navigate("/management.html");
              }
            }}
          />
          <div className="clear">&nbsp;</div>
        </form>
      </article>
    </>
  );
}

export default ManageUserPage;
