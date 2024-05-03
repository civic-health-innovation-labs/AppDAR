from fastapi import APIRouter, Depends

from riocatalogue.catalogue import CATALOGUE
from riocatalogue.catalogue_search import CATALOGUE_SEARCH
from ..pydantic_models.pd_aad_auth_models import AADUserModel
from ..authentication.role_validators import validator_is_researcher_or_data_manager

catalogue_router = APIRouter()


@catalogue_router.get("/catalogue")
async def get_catalogue(search: str | None = None,
                        user: AADUserModel = Depends(validator_is_researcher_or_data_manager)):
    """Return user catalogue (GET) with a possibility for full text search filter."""
    if search:
        search_lower = search.lower()
        matching_tables = set()
        for _table, _search_str in CATALOGUE_SEARCH.items():
            if search_lower in _search_str:
                matching_tables.add(_table)
        return {_k: _v for _k, _v in CATALOGUE.items() if _k in matching_tables}
    return CATALOGUE
