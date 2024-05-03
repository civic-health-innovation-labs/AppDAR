from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import CONFIG, ENVIRONMENT
from .routes.catalogue import catalogue_router
from .routes.workspaces import workspaces_router
from .routes.requests import requests_router
from .routes.users import users_router
from . import __title__, __author__, __version__


# ===================================
#         Main web service
# ===================================
service = FastAPI()

# ===================================
#          CORS headers
# ===================================
service.add_middleware(
    CORSMiddleware,
    allow_origins=CONFIG.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===================================
#        Application routes
# ===================================
@service.get("/")
async def display_root():
    """Default informative end-point running on root address"""
    return {
        "title": __title__,
        "version": __version__,
        "author": __author__,
        "environment": ENVIRONMENT,
    }

# Register routes for catalogue
service.include_router(catalogue_router)
# Register routes for workspaces
service.include_router(workspaces_router)
# Register routes for requests
service.include_router(requests_router)
# Register routes for users
service.include_router(users_router)
