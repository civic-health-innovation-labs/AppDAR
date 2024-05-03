import datetime
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi import status as HTTPStatusCode

import sqlalchemy

from ..pydantic_models.pd_models import (
    RequestDetailModel,
    RequestListModel,
    RequestInsertModel,
    RequestSendReviewerDecision,
    RequestADFCommitModel,
    RequestStatusOptions,
)
from ..sql_models.db_models import (
    DataAccessRequest,
    DataAccessRequestTables,
    DataAccessRequestColumns,
    DataAccessRequestWorkspaceVisibility,
    DataAccessRequestUser,
)
from ..utils.session_manager import SessionManager
from ..pydantic_models.pd_aad_auth_models import AADUserModel
from ..authentication.role_validators import (
    validator_is_researcher_or_data_manager,
    validator_is_data_manager,
)
from ..adf_pipeline.data_pipeline import run_data_pipeline

requests_router = APIRouter()


@requests_router.get("/requests")
async def get_requests(
    user: AADUserModel = Depends(validator_is_researcher_or_data_manager)
) -> list[RequestListModel]:
    with SessionManager() as session:
        if user.is_data_manager:
            # Data manager can see all requests
            return session.query(DataAccessRequest).all()
        elif user.is_researcher:
            # Researcher can only see requests where the researcher is creator
            return session.query(DataAccessRequest).filter(
                DataAccessRequest.creator_uuid == user.user_uuid
            ).all()
        # no more options


@requests_router.get("/request")
async def get_request(
    request_uuid: uuid.UUID,
    user: AADUserModel = Depends(validator_is_researcher_or_data_manager)
) -> RequestDetailModel:
    with SessionManager() as session:
        if user.is_data_manager:
            # Raise error if nothing is found
            if session.query(DataAccessRequest).filter(
                DataAccessRequest.request_uuid == request_uuid
            ).count() < 1:
                raise HTTPException(status_code=404, detail="not found")
            # Find and return the item if exits
            selected_request = session.query(DataAccessRequest).filter(
                DataAccessRequest.request_uuid == request_uuid
            ).first()
        elif user.is_researcher:
            # Raise error if nothing is found
            if session.query(DataAccessRequest).filter(
                    DataAccessRequest.request_uuid == request_uuid,
                    DataAccessRequest.creator_uuid == user.user_uuid
            ).count() < 1:
                raise HTTPException(status_code=404, detail="not found")
            # Find and return the item if exits
            selected_request = session.query(DataAccessRequest).filter(
                DataAccessRequest.request_uuid == request_uuid,
                DataAccessRequest.creator_uuid == user.user_uuid
            ).first()
            # Remove info about Azure Data Factory link (as it is only for Data Managers).
            selected_request.adf_link = None

        return selected_request


@requests_router.post("/request")
async def post_request(
    request: RequestInsertModel,
    user: AADUserModel = Depends(validator_is_researcher_or_data_manager)
) -> RequestInsertModel:
    """Insert the new data access request"""
    with SessionManager() as session:
        # Check if the Data Manager is registered as a user and create a DM entry in system
        if user.is_data_manager and session.query(DataAccessRequestUser).filter(
                DataAccessRequestUser.user_uuid == user.user_uuid
        ).count() < 1:
            # If needed, create a new entry for the data manager as a user in the system
            session.add(DataAccessRequestUser(
                user_uuid=user.user_uuid,
                user_full_name=user.user_full_name,
                user_username=user.user_username,
            ))
            session.commit()
        # Verify if the user has a permission on the workspace level
        if user.is_researcher and not user.is_data_manager:
            if session.query(DataAccessRequestWorkspaceVisibility).filter(
                    DataAccessRequestWorkspaceVisibility.user_uuid == user.user_uuid,
                    DataAccessRequestWorkspaceVisibility.workspace_uuid ==
                    request.workspace.workspace_uuid
            ).count() < 1:
                raise HTTPException(status_code=403, detail="forbidden")
        # Create a new DAR UUID for the new DAR
        request_uuid = uuid.uuid4()
        # 1) Insert DAR
        dump_dar = request.model_dump()
        # remove nested values for tables and columns
        del dump_dar["tables_and_columns"]

        # Re-format workspace
        workspace_uuid = dump_dar['workspace']['workspace_uuid']
        del dump_dar['workspace']
        dump_dar['workspace_uuid'] = workspace_uuid

        # Use NULL value for the adf_link entity
        dump_dar['creator_uuid'] = None

        # Add info about the creator user
        dump_dar['creator_uuid'] = user.user_uuid

        # Add info about Request UUID:
        dump_dar['request_uuid'] = request_uuid

        # Insert new DataAccessRequest
        session.add(DataAccessRequest(**dump_dar))
        session.commit()

        # 2) Insert requested tables
        dump_tables = request.model_dump()['tables_and_columns']
        # remove related columns and prepare fields of DataAccessRequestTables objects
        dar_tables_orm = []
        # Contains UUID generated for each table
        dar_table_uuids = []
        # The following contains lists of list of columns for each table
        dar_columns_list = []
        for _dump_table in dump_tables:
            dar_columns_list.append(_dump_table["columns"])
            del _dump_table["columns"]
            # Generate the new UUID for the table
            dar_table_uuid = uuid.uuid4()
            dar_tables_orm.append(
                DataAccessRequestTables(
                    **_dump_table, request_uuid=request_uuid, dar_tables_uuid=dar_table_uuid
                )
            )
            dar_table_uuids.append(dar_table_uuid)
        # insert new DataAccessRequestTables tables
        session.add_all(dar_tables_orm)
        session.commit()

        # 3) Insert requested columns
        # create the list of DataAccessRequestColumns objects to be inserted
        dar_columns_orm = []
        for table_index, dar_columns in enumerate(dar_columns_list):
            for dar_column in dar_columns:
                dar_columns_orm.append(
                    DataAccessRequestColumns(
                        **(dar_column | {
                            "dar_tables_uuid": dar_table_uuids[table_index],
                            "dar_columns_uuid": uuid.uuid4()
                        })
                    )
                )

        # insert new DataAccessRequestColumns tables
        session.add_all(dar_columns_orm)
        session.commit()

    return request


@requests_router.delete("/request")
async def delete_request(
    request_uuid: uuid.UUID,
    user: AADUserModel = Depends(validator_is_researcher_or_data_manager),
    status_code=HTTPStatusCode.HTTP_204_NO_CONTENT
):
    with SessionManager() as session:
        if user.is_data_manager:
            # Raise error if nothing is found
            if session.query(DataAccessRequest).filter(
                DataAccessRequest.request_uuid == request_uuid
            ).count() < 1:
                raise HTTPException(status_code=404, detail="not found")
        elif user.is_researcher:
            # Raise error if nothing is found
            if session.query(DataAccessRequest).filter(
                    DataAccessRequest.request_uuid == request_uuid,
                    DataAccessRequest.creator_uuid == user.user_uuid
            ).count() < 1:
                raise HTTPException(status_code=404, detail="not found")
        # If everything is alright permission wise, perform the delete operation
        session.execute(
            sqlalchemy.delete(DataAccessRequest).where(
                DataAccessRequest.request_uuid == request_uuid
            )
            # Note: everything should be delete by cascade
        )
        session.commit()


@requests_router.put("/review-request")
async def review_request(
    review_decision: RequestSendReviewerDecision,
    user: AADUserModel = Depends(validator_is_data_manager),
    status_code=HTTPStatusCode.HTTP_204_NO_CONTENT
):
    """Submits the reviewer decision on the request"""
    submitted_on = datetime.datetime.now().isoformat(' ')
    with SessionManager() as session:
        # Check if the reviewer is registered as a user and create a DM entry in system
        if session.query(DataAccessRequestUser).filter(
                DataAccessRequestUser.user_uuid == user.user_uuid
        ).count() < 1:
            # If needed, create a new entry for the data manager as a user in the system
            session.add(DataAccessRequestUser(
                user_uuid=user.user_uuid,
                user_full_name=user.user_full_name,
                user_username=user.user_username,
            ))
            session.commit()
        # Double check that user is DataManager
        if not user.is_data_manager:
            raise HTTPException(status_code=403, detail="not permitted")
        # Prepare the values to be updated
        decision = review_decision.model_dump()
        decision["reviewed_on"] = submitted_on
        decision["reviewer_uuid"] = user.user_uuid
        request_uuid = decision.pop("request_uuid")
        # Perform update
        session.execute(
            sqlalchemy.update(
                DataAccessRequest
            ).where(
                DataAccessRequest.request_uuid == request_uuid
            ).values(**decision)
        )
        session.commit()


@requests_router.put("/request-adf-commit")
async def put_request_commit_adf(
    request_uuid: uuid.UUID,
    user: AADUserModel = Depends(validator_is_data_manager)
) -> RequestADFCommitModel:
    """This request commits the Azure Data Factory (aka ADF) and returns the ADF link."""
    # Double check that user is DataManager
    if not user.is_data_manager:
        raise HTTPException(status_code=403, detail="not permitted")

    with SessionManager() as session:
        # Find the related DAR
        _dar = session.query(DataAccessRequest).filter(
            DataAccessRequest.request_uuid == request_uuid,
            DataAccessRequest.status == str(RequestStatusOptions.approved)
        )
        # Raise error if nothing is found or is not reviewed
        if _dar.count() < 1:
            raise HTTPException(status_code=404, detail="not found")
        # Selects the DAR
        _request = _dar.first()
        # Select the related tables and columns
        _requested_tables = _request.tables_and_columns
        request_definition = {}
        for _requested_table in _requested_tables:
            _table_cols_req_def = {
                "columns": [_col.column_name for _col in _requested_table.columns],
                "where_statement": _requested_table.where_statement
            }
            request_definition[_requested_table.table_name] = _table_cols_req_def
        # Run the ADF pipeline
        adf_link: str = run_data_pipeline(request_definition, _request.workspace_uuid)
        # Perform update of the table
        session.execute(
            sqlalchemy.update(
                DataAccessRequest
            ).where(
                DataAccessRequest.request_uuid == request_uuid
            ).values(adf_link=adf_link)
        )
        session.commit()
        # Serialize and return
        return {
            "request_uuid": request_uuid,
            "adf_link": adf_link,
        }
