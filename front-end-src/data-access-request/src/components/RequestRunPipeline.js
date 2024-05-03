import { useState } from "react";
import { BACKEND_ENDPOINT } from "../commons/backend-config";
import { getBackEndTokenObject } from "../auth/AuthenticationConfig";

/**
 * Component for running of the Dataset Provisioning pipeline
 * @param requestUUID UUID of the DAR
 * @param workspaceUUID UUID of the workspace
 * @param adfLink
 * @returns component for running of the Dataset Provisioning pipeline
 */
function RequestRunPipeline({ requestUUID, workspaceUUID, adfLink }) {
  const [adfPipelineLink, setAdfPipelineLink] = useState(adfLink);
  // Actual REST API triggers the Dataset Provisioning pipeline
  const triggerDatasetProvisioningPipeline = async () => {
    const res = await fetch(`${BACKEND_ENDPOINT}/request-adf-commit?request_uuid=${requestUUID}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getBackEndTokenObject()}`,
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  };

  return (
    <div className="large-top-margin">
      <h1>Dataset Provisioning pipeline</h1>
      {adfPipelineLink === null ? (
        <p>
          <em>
            The pipeline for actual dataset provisioning into the workspaces can be triggered here.
          </em>
        </p>
      ) : (
        ""
      )}
      <p>
        Pipeline link:{" "}
        {adfPipelineLink ? (
          <strong><a href={adfPipelineLink}>{adfPipelineLink}</a></strong>
        ) : (
          <span>N/A</span>
        )}
      </p>
      <div className="bottom-menu">
        <div className="clear">&nbsp;</div>
        {!adfPipelineLink ? (
          <a
            href="/"
            className="button left-button greenbutton"
            onClick={(e) => {
              e.preventDefault();
              // Set the ADF link
              setAdfPipelineLink(triggerDatasetProvisioningPipeline().adf_link);
            }}
          >
            RUN ADF PIPELINE
          </a>
        ) : (
          ""
        )}
        <div className="clear"></div>
      </div>
    </div>
  );
}

export default RequestRunPipeline;
