import uuid
from collections import defaultdict

import sqlalchemy
from fastapi import APIRouter, Depends, HTTPException

from ..pydantic_models.pd_aad_auth_models import AADUserModel
from ..pydantic_models.pd_models import UserModel
from ..authentication.role_validators import (
    validator_is_researcher_or_data_manager,
    validator_is_data_manager,
)
from ..sql_models.db_models import (
    DataAccessRequestUser,
    DataAccessRequestWorkspaceVisibility,
)
from ..utils.session_manager import SessionManager
from ..pydantic_models.pd_management_models import (
    WorkspacesVisibilityPerUserAndViceVersa,
    UsersPerWorkspace,
)

users_router = APIRouter()


@users_router.get("/current-user")
async def get_user(
    user: AADUserModel = Depends(validator_is_researcher_or_data_manager)
) -> AADUserModel:
    """Route mainly for testing purposes."""
    return user


@users_router.get("/list-users")
async def get_list_users(
    user: AADUserModel = Depends(validator_is_data_manager)
) -> list[UserModel]:
    """List all users in the system."""
    with SessionManager() as session:
        return session.query(DataAccessRequestUser).all()


@users_router.get("/workspaces-visibility-per-user-and-vice-versa")
async def get_workspaces_visibility_per_user_and_vice_versa(
    user: AADUserModel = Depends(validator_is_data_manager)
) -> WorkspacesVisibilityPerUserAndViceVersa:
    """Get the map of available workspaces for each user and vice versa (based on visibility).
    """
    with SessionManager() as session:
        user_to_workspaces = defaultdict(list)
        workspace_to_users = defaultdict(list)
        visibility_list = session.query(DataAccessRequestWorkspaceVisibility).all()
        for visibility_entry in visibility_list:
            user_to_workspaces[visibility_entry.user_uuid].append(visibility_entry.workspace_uuid)
            workspace_to_users[visibility_entry.workspace_uuid].append(visibility_entry.user_uuid)
        return {
            "user_to_workspaces": user_to_workspaces,
            "workspace_to_users": workspace_to_users,
        }


@users_router.get("/user")
async def get_user(
    user_uuid: uuid.UUID,
    user: AADUserModel = Depends(validator_is_data_manager)
) -> UserModel:
    with SessionManager() as session:
        select_users = session.query(
            DataAccessRequestUser
        ).filter(DataAccessRequestUser.user_uuid == user_uuid)
        if select_users.count() < 1:
            raise HTTPException(status_code=404, detail="not found")
        return select_users.first()


@users_router.put("/user")
async def put_user(
    user_uuid: uuid.UUID,
    user_body: UserModel,
    user: AADUserModel = Depends(validator_is_data_manager)
):
    with SessionManager() as session:
        select_users = session.query(
            DataAccessRequestUser
        ).filter(DataAccessRequestUser.user_uuid == user_uuid)
        if select_users.count() < 1:
            raise HTTPException(status_code=404, detail="not found")
        # Perform update
        data_to_update = user_body.model_dump(exclude={'user_uuid'})
        session.execute(
            sqlalchemy.update(
                DataAccessRequestUser
            ).where(
                DataAccessRequestUser.user_uuid == user_uuid
            ).values(**data_to_update)
        )
        session.commit()


@users_router.post("/user")
async def post_user(
    user_body: UserModel,
    user: AADUserModel = Depends(validator_is_data_manager)
):
    with SessionManager() as session:
        # Perform update
        data_to_update = user_body.model_dump()
        session.add(DataAccessRequestUser(**data_to_update))
        session.commit()


@users_router.get("/users-per-workspace")
async def get_users_per_workspace(
    workspace_uuid: uuid.UUID,
    user: AADUserModel = Depends(validator_is_data_manager)
) -> UsersPerWorkspace:
    """Get the list of users that can see a concrete workspace.
    """
    with SessionManager() as session:
        workspace_to_users = []
        visibility_list = session.query(DataAccessRequestWorkspaceVisibility).filter(
            DataAccessRequestWorkspaceVisibility.workspace_uuid == workspace_uuid
        ).all()
        for visibility_entry in visibility_list:
            workspace_to_users.append(visibility_entry.user_uuid)
        return {
            "available_workspaces": workspace_to_users,
        }


@users_router.delete("/user")
async def delete_user(
    user_uuid: uuid.UUID,
    user: AADUserModel = Depends(validator_is_data_manager)
):
    with SessionManager() as session:
        # Perform delete
        session.execute(
            sqlalchemy.delete(DataAccessRequestUser).where(
                DataAccessRequestUser.user_uuid == user_uuid
            )
            # Note: everything should be delete by cascade
        )
        session.commit()
