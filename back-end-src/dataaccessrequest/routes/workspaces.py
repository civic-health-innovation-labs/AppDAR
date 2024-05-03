import uuid

import sqlalchemy
from fastapi import APIRouter, Depends, HTTPException
from fastapi import status as HTTPStatusCode

from ..utils.session_manager import SessionManager

from ..pydantic_models.pd_models import WorkspaceModel
from ..pydantic_models.pd_management_models import WorkspaceWithUsersModel
from ..sql_models.db_models import (
    DataAccessRequestWorkspace,
    DataAccessRequestUser,
    DataAccessRequestWorkspaceVisibility,
)
from ..pydantic_models.pd_aad_auth_models import AADUserModel
from ..authentication.role_validators import (
    validator_is_researcher_or_data_manager,
    validator_is_data_manager,
)

workspaces_router = APIRouter()


@workspaces_router.get("/workspaces")
async def get_workspaces(
    user: AADUserModel = Depends(validator_is_researcher_or_data_manager)
) -> list[WorkspaceModel]:
    """Returns the list of workspaces"""
    with SessionManager() as session:
        if user.is_data_manager:
            return session.query(DataAccessRequestWorkspace).all()
        elif user.is_researcher:
            if session.query(DataAccessRequestUser).filter(
                    DataAccessRequestUser.user_uuid == user.user_uuid
            ).count() < 1:
                return []
            # Select only workspaces where user has permission
            return session.query(
                DataAccessRequestWorkspace
            ).join(
                DataAccessRequestWorkspaceVisibility
            ).filter(
                DataAccessRequestWorkspaceVisibility.user_uuid == user.user_uuid
            ).filter(
                DataAccessRequestWorkspace.workspace_uuid ==
                DataAccessRequestWorkspaceVisibility.workspace_uuid
            ).all()
        # no more options


@workspaces_router.get("/workspace")
async def get_workspace(
    workspace_uuid: uuid.UUID,
    user: AADUserModel = Depends(validator_is_data_manager)
) -> WorkspaceModel:
    with SessionManager() as session:
        select_workspaces = session.query(
            DataAccessRequestWorkspace
        ).filter(DataAccessRequestWorkspace.workspace_uuid == workspace_uuid)
        if select_workspaces.count() < 1:
            raise HTTPException(status_code=404, detail="not found")
        return select_workspaces.first()


@workspaces_router.post("/workspace")
async def post_workspace(
    workspace: WorkspaceWithUsersModel,
    user: AADUserModel = Depends(validator_is_data_manager),
    status_code=HTTPStatusCode.HTTP_204_NO_CONTENT
):
    with SessionManager() as session:
        session.add(DataAccessRequestWorkspace(
            **workspace.model_dump(exclude={'visible_for_users'})
        ))
        session.commit()
        # Now add users that can view this workspace
        #   a) remove all existing visibility conditions
        session.execute(
            sqlalchemy.delete(DataAccessRequestWorkspaceVisibility).where(
                DataAccessRequestWorkspaceVisibility.workspace_uuid == workspace.workspace_uuid
            )
        )
        session.commit()
        #   b) insert new values
        visibility_values = []
        for user_uuid_visible in workspace.visible_for_users:
            visibility_values.append(
                DataAccessRequestWorkspaceVisibility(
                    workspace_uuid=workspace.workspace_uuid,
                    user_uuid=user_uuid_visible
                )
            )
        if visibility_values:
            session.add_all(visibility_values)
            session.commit()


@workspaces_router.put("/workspace")
async def put_workspace(
    workspace_uuid: uuid.UUID,
    workspace: WorkspaceWithUsersModel,
    user: AADUserModel = Depends(validator_is_data_manager),
    status_code=HTTPStatusCode.HTTP_204_NO_CONTENT
):
    with SessionManager() as session:
        select_workspace = session.query(
            DataAccessRequestWorkspace
        ).filter(DataAccessRequestWorkspace.workspace_uuid == workspace_uuid)
        if select_workspace.count() < 1:
            raise HTTPException(status_code=404, detail="not found")
        # Perform update
        data_to_update = workspace.model_dump(exclude={'workspace_uuid', 'visible_for_users'})
        session.execute(
            sqlalchemy.update(
                DataAccessRequestWorkspace
            ).where(
                DataAccessRequestWorkspace.workspace_uuid == workspace_uuid
            ).values(**data_to_update)
        )
        session.commit()

        # Now add users that can view this workspace
        #   a) remove all existing visibility conditions
        session.execute(
            sqlalchemy.delete(DataAccessRequestWorkspaceVisibility).where(
                DataAccessRequestWorkspaceVisibility.workspace_uuid == workspace.workspace_uuid
            )
        )
        session.commit()
        #   b) insert new values
        visibility_values = []
        for user_uuid_visible in workspace.visible_for_users:
            visibility_values.append(
                DataAccessRequestWorkspaceVisibility(
                    workspace_uuid=workspace.workspace_uuid,
                    user_uuid=user_uuid_visible
                )
            )
        if visibility_values:
            session.add_all(visibility_values)
            session.commit()


@workspaces_router.delete("/workspace")
async def delete_workspace(
    workspace_uuid: uuid.UUID,
    user: AADUserModel = Depends(validator_is_data_manager)
):
    with SessionManager() as session:
        # Perform delete
        session.execute(
            sqlalchemy.delete(DataAccessRequestWorkspace).where(
                DataAccessRequestWorkspace.workspace_uuid == workspace_uuid
            )
            # Note: everything should be delete by cascade
        )
        session.commit()
