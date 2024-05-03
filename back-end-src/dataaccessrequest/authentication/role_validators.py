from fastapi import Depends
from fastapi_azure_auth import SingleTenantAzureAuthorizationCodeBearer
from fastapi_azure_auth.user import User
from fastapi_azure_auth.exceptions import InvalidAuth

from config import CONFIG
from ..pydantic_models.pd_aad_auth_models import AADUserModel, AADUserRoles

# === AZURE SINGLE TENANT CODE BEARER ===
AAD_CODE_BEARER = SingleTenantAzureAuthorizationCodeBearer(
    app_client_id=CONFIG.AAD_APPLICATION_CLIENT_ID,
    tenant_id=CONFIG.AAD_TENANT_ID,
    allow_guest_users=True,
    scopes={
        CONFIG.AAD_APPLICATION_ID_URI_SCOPES: 'user_impersonation',
    }
)
# =======================================


# === CONCRETE VALIDATORS ===
async def validator_is_researcher_or_data_manager(
    user: User = Depends(AAD_CODE_BEARER)
) -> AADUserModel:
    """Check if the user has DataManager or Researcher role (or both).
    Args:
        user (User): Authenticated user.
    Raises:
        InvalidAuth: In the case that user does not have required role. Causes 401 error later.
    Returns:
        AADUserModel: Details about user.
    """
    if AADUserRoles.researcher in user.roles or AADUserRoles.data_manager in user.roles:
        return AADUserModel(**user.model_dump())
    raise InvalidAuth('user must have Researcher or DataManager role')


async def validator_is_researcher(
    user: User = Depends(AAD_CODE_BEARER)
) -> AADUserModel:
    """Check if the user has a Researcher role.
    Args:
        user (User): Authenticated user.
    Raises:
        InvalidAuth: In the case that user does not have required role. Causes 401 error later.
    Returns:
        AADUserModel: Details about user.
    """
    if AADUserRoles.researcher in user.roles:
        return AADUserModel(**user.model_dump())
    raise InvalidAuth('user must have Researcher role')


async def validator_is_data_manager(
    user: User = Depends(AAD_CODE_BEARER)
) -> AADUserModel:
    """Check if the user has a DataManager role.
    Args:
        user (User): Authenticated user.
    Raises:
        InvalidAuth: In the case that user does not have required role. Causes 401 error later.
    Returns:
        AADUserModel: Details about user.
    """
    if AADUserRoles.data_manager in user.roles:
        return AADUserModel(**user.model_dump())
    raise InvalidAuth('user must have DataManager role')

# ===========================
