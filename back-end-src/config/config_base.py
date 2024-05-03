from sqlalchemy.engine import URL


class ConfigBase:
    """Base configuration options for all stacks"""
    # MSSQL Server configuration
    MSSQL_HOST: str
    MSSQL_USER: str
    MSSQL_PASS: str
    MSSQL_PORT: int
    MSSQL_DATABASE: str

    # CORS header list
    CORS_ORIGINS: list[str]

    # AAD Authentication configuration
    #   - a value of "Application (client) ID" in "Azure AD B2C" app
    AAD_APPLICATION_CLIENT_ID: str
    #   - standard Tenant UUID (find in "Tenant" in Azure).
    AAD_TENANT_ID: str
    #   - you can find this in "Expose an API" option of APP (in section "scopes").
    AAD_APPLICATION_ID_URI_SCOPES: str

    # Azure Data Factory (aka ADF) configuration
    #   - subscription ID (UUID) where ADF resource is located
    ADF_SUBSCRIPTION_ID: str
    #   - resource group where ADF resource is located
    ADF_RESOURCE_GROUP: str
    #   - name of the resource (ADF resource name)
    ADF_DATA_FACTORY: str
    #   - name of the pipeline inside ADF that does dataset provisioning
    ADF_PIPELINE_NAME: str

    @classmethod
    @property
    def connection_url(cls) -> URL:
        """Create connection URL for SQLAlchemy engine"""
        return URL.create(
            "mssql+pyodbc",
            username=cls.MSSQL_USER,
            password=cls.MSSQL_PASS,
            host=cls.MSSQL_HOST,
            port=cls.MSSQL_PORT,
            database=cls.MSSQL_DATABASE,
            query={
                "driver": "ODBC Driver 18 for SQL Server",
                "TrustServerCertificate": "yes",
                # "authentication": "ActiveDirectoryIntegrated",
            },
        )
