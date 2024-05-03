import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { createShortDescription } from "../commons/common-scripts";
import { BACKEND_ENDPOINT } from "../commons/backend-config";
import { getBackEndTokenObject } from "../auth/AuthenticationConfig";
import { useNavigate } from "react-router-dom";

/**
 * Page for detail of DAR delete (allows to go back or submit the delete request).
 * @returns Delete Data Access Request (DAR) page layout.
 */
const DeleteRequestPage = () => {
  // To redirect to homepage later
  const navigate = useNavigate();

  // To find the ID from URL
  const [requestParams] = useSearchParams();

  // Details about request to display
  const [dataAccessRequestDetail, setDataAccessRequestDetail] = useState({});

  // Fetch Data Access Request to be deleted (REST)
  useEffect(() => {
    const getDataAccessRequestDetail = async (darUUID) => {
      const itemsFromServer = await fetchDataAccessRequestDetail(darUUID);
      setDataAccessRequestDetail(itemsFromServer);
    };
    getDataAccessRequestDetail(requestParams.get("request_uuid"));
  }, [requestParams]);

  // Actual REST API call to fetch a single data access request
  const fetchDataAccessRequestDetail = async (darUUID) => {
    const res = await fetch(`${BACKEND_ENDPOINT}/request?request_uuid=${darUUID}`, {
      headers: {
        Authorization: `Bearer ${getBackEndTokenObject()}`,
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  };

  // Actual REST API delete Data Access Request
  const deleteDataAccessRequest = async (requestUUID) => {
    const res = await fetch(`${BACKEND_ENDPOINT}/request?request_uuid=${requestUUID}`, {
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
      {Object.keys(dataAccessRequestDetail).length > 0 ? (
        <>
          <h1>Delete Data Access Request</h1>
          <div className="clear"></div>
          <p>
            <em>Are you sure you want to delete the following Data Access Request?</em>
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
              <p className="no-top-margin">
                {createShortDescription(dataAccessRequestDetail.justification)}
              </p>
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
              href="index.html"
              onClick={(e) => {
                e.preventDefault();

                deleteDataAccessRequest(dataAccessRequestDetail.request_uuid);
                // After everything is send, go to homepage
                navigate("/");
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
};

export default DeleteRequestPage;
