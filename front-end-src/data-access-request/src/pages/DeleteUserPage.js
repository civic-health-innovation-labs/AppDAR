import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BACKEND_ENDPOINT } from "../commons/backend-config";
import { getBackEndTokenObject } from "../auth/AuthenticationConfig";
import { useNavigate } from "react-router-dom";

function DeleteUserPage() {
  // To redirect later
  const navigate = useNavigate();

  // To find the ID from URL
  const [requestParams] = useSearchParams();

  // Search filter content
  const [userDetail, setUserDetail] = useState(null);

  // Fetch user details (REST)
  useEffect(() => {
    const getUserDetail = async (userUUID) => {
      const itemsFromServer = await fetchUserDetail(userUUID);
      setUserDetail(itemsFromServer);
    };
    getUserDetail(requestParams.get("user_uuid"));
  }, [requestParams]);

  // Actual REST API call to fetch a single user
  const fetchUserDetail = async (userUUID) => {
    const res = await fetch(`${BACKEND_ENDPOINT}/user?user_uuid=${userUUID}`, {
      headers: {
        Authorization: `Bearer ${getBackEndTokenObject()}`,
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  };

  // Actual REST API delete user
  const deleteUser = async (userUUID) => {
    const res = await fetch(`${BACKEND_ENDPOINT}/user?user_uuid=${userUUID}`, {
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
      {userDetail !== null ? (
        <>
          <h1>Delete user from the system</h1>
          <div className="clear"></div>
          <p>
            <em>Are you sure you want to delete the following user?</em> Be aware that it does not
            delete the user on the Azure level.
          </p>
          <h3>Details about the user</h3>
          <ul>
            <li>
              <strong>UUID of the user:</strong> {userDetail.user_uuid}
            </li>
            <li>
              <strong>Full name of the user:</strong> {userDetail.user_full_name}
            </li>
            <li>
              <strong>Username of the user:</strong> {userDetail.user_username}
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

                deleteUser(userDetail.user_uuid);
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

export default DeleteUserPage;
