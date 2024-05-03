from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel


class AADUserRoles(StrEnum):
    """Defines roles for each user in AAD object"""
    data_manager = "DataManager"
    researcher = "Researcher"


class AADUserModel(BaseModel):
    """Represents the object for User returned through AAD"""
    # Local User's ID
    oid: UUID
    # List of Roles
    roles: list[str]
    # Full name for the user
    name: str
    # Full username
    preferred_username: str

    @property
    def is_researcher(self) -> bool:
        """Add a simple flag to make logic simpler.
        Returns:
            bool: True if this user is researcher (has Researcher role).
        """
        return AADUserRoles.researcher in self.roles

    @property
    def is_data_manager(self) -> bool:
        """Add a simple flag to make logic simpler.
        Returns:
            bool: True if this user is data manager (has DataManager role).
        """
        return AADUserRoles.data_manager in self.roles

    @property
    def user_uuid(self) -> UUID:
        """To unify interface.
        Returns:
            UUID: Current user UUID
        """
        return self.oid

    @property
    def user_full_name(self) -> str:
        """To unify interface.
        Returns:
            str: Full name of user
        """
        return self.name

    @property
    def user_username(self) -> str:
        """To unify interface.
        Returns:
            str: Username of the user
        """
        return self.preferred_username
