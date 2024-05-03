from uuid import UUID

from pydantic import BaseModel

from .pd_models import WorkspaceModel


class WorkspacesVisibilityPerUserAndViceVersa(BaseModel):
    """For listing all workspaces available to user and vice versa"""
    user_to_workspaces: dict[UUID, list[UUID]]
    workspace_to_users: dict[UUID, list[UUID]]


class UsersPerWorkspace(BaseModel):
    """Lists all users for the one workspace"""
    available_workspaces: list[UUID]


class WorkspaceWithUsersModel(WorkspaceModel):
    """Define workspace with a field that defines users that can see it (visibility)"""
    visible_for_users: list[UUID]
