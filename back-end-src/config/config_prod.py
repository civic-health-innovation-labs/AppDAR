from os import getenv
import json

from .config_base import ConfigBase


class ConfigProd(ConfigBase):
    """Local stack configuration"""
    MSSQL_HOST: str = getenv("MSSQL_HOST", None)
    MSSQL_USER: str = getenv("MSSQL_USER", None)
    MSSQL_PASS: str = getenv("MSSQL_PASS", None)
    MSSQL_PORT: int = int(getenv("MSSQL_PORT", -1))
    MSSQL_DATABASE: str = getenv("MSSQL_DATABASE", None)

    # This requires to have env variable in the form: ["Origin1", "Origin2", ...]
    CORS_ORIGINS: list[str] = json.loads(getenv("CORS_ORIGINS", "[]"))

    AAD_APPLICATION_CLIENT_ID: str = getenv("AAD_APPLICATION_CLIENT_ID", None)
    AAD_TENANT_ID: str = getenv("AAD_TENANT_ID", None)
    AAD_APPLICATION_ID_URI_SCOPES: str = getenv("AAD_APPLICATION_ID_URI_SCOPES", None)

    ADF_SUBSCRIPTION_ID: str = getenv("ADF_SUBSCRIPTION_ID", None)
    ADF_RESOURCE_GROUP: str = getenv("ADF_RESOURCE_GROUP", None)
    ADF_DATA_FACTORY: str = getenv("ADF_DATA_FACTORY", None)
    ADF_PIPELINE_NAME: str = getenv("ADF_PIPELINE_NAME", None)
