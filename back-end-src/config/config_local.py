from .config_base import ConfigBase


class ConfigLocal(ConfigBase):
    """Local stack configuration"""
    MSSQL_HOST: str = "database"
    MSSQL_USER: str = "mrictest"
    MSSQL_PASS: str = "TeZRoglILDh5"
    MSSQL_PORT: int = 1433
    MSSQL_DATABASE: str = "mrictestdb"

    CORS_ORIGINS: list[str] = ["*"]

    AAD_APPLICATION_CLIENT_ID: str = "TODO"
    AAD_TENANT_ID: str = "TODO"
    AAD_APPLICATION_ID_URI_SCOPES: str = "api://TODO/user_impersonation"

    ADF_SUBSCRIPTION_ID: str = "TODO"
    ADF_RESOURCE_GROUP: str = "TODO"
    ADF_DATA_FACTORY: str = "TODO"
    ADF_PIPELINE_NAME: str = "DatasetProvisioning"
