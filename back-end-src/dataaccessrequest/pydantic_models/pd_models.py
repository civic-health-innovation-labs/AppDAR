from uuid import UUID
from enum import StrEnum
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class RequestStatusOptions(StrEnum):
    """Statuses for DAR"""
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class WorkspaceModel(BaseModel):
    """Provides info about concrete workspace"""
    # UUID of workspace where data should be provided
    workspace_uuid: UUID
    # Name of workspace where data should be provided
    workspace_name: str


class UserModel(BaseModel):
    """Provides info about concrete user in the system"""
    # UUID of the user (as in Azure)
    user_uuid: UUID
    # Full name of the user
    user_full_name: str
    # Username of the user (email in Azure)
    user_username: str


class RequestColumnsSubModel(BaseModel):
    """Model for describing single selected columns in the table."""
    # Exact name of selected column inside table
    column_name: str
    # Description (as the catalogue might change in the future)
    column_description: str


class RequestTablesAndColumnsSubModel(BaseModel):
    """Model for describing single selected table and columns."""
    # Selected table
    table_name: str
    # Description of the table
    table_description: str
    # If any filtration is about to be applied, this defines WHERE SQL statement
    where_statement: str | None
    # List of columns
    columns: list[RequestColumnsSubModel]


class RequestBasicModel(BaseModel):
    """Basic model for Data Access Request (aka DAR)"""
    model_config = ConfigDict(
        # To allow restrictions for status column
        use_enum_values=True
    )

    # Title for the new data access request
    title: str
    # UUID of workspace where data should be provided
    workspace: WorkspaceModel


class SystemSpecificFieldsMixin(BaseModel):
    """Add automatically generated fields into the model"""
    # UUID of the request (PK)
    request_uuid: UUID
    # Status in which request is
    status: RequestStatusOptions
    # Date and time of creation
    created_on: datetime


class RequestListModel(RequestBasicModel, SystemSpecificFieldsMixin):
    """Basic model for Data Access Request list (aka DAR)"""
    creator: UserModel


class RequestInsertModel(RequestBasicModel):
    """Basic model for Data Access Request insert (aka DAR)"""
    # Justification or description of DAR
    justification: str
    # Additional comments added to the DAR
    comment: str | None
    # List of tables to be provided (and columns, etc.)
    tables_and_columns: list[RequestTablesAndColumnsSubModel]


class RequestDetailModel(RequestListModel, RequestInsertModel):
    """Model for detail view"""
    # Decision of the reviewer (when approved or rejected)
    reviewer_decision: str | None
    reviewer: UserModel | None
    reviewed_on: datetime | None
    adf_link: str | None


class RequestSendReviewerDecision(BaseModel):
    """A separate model for sending Data Manager's decision about the DAR"""
    model_config = ConfigDict(
        # To allow restrictions for status column
        use_enum_values=True
    )
    # UUID of the request (PK) that is the subject of decision
    request_uuid: UUID
    # What the decision is
    status: RequestStatusOptions
    # Justification for the decision
    reviewer_decision: str


class RequestADFCommitModel(BaseModel):
    """Returns Azure Data Factory link for commited ADF pipeline for dataset provisioning."""
    # UUID of the request (PK) that is the subject of decision
    request_uuid: UUID
    # Link to the Azure Data Factory pipeline
    adf_link: str
