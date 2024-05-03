import secrets
import string
import os

import pulumi
from pulumi_azure_native import storage, resources, sql, authorization
import pulumi_azure
import pulumi_azuread


# >>> Expected environmental variables
#   - CORS_ORIGINS: if not set, ["*"] is used. Defines CORS for back-end webapp.
#   - MSSQL_USER: Microsoft SQL Server admin username. If not set, 'mricdaradmin' is used.
#   - MSSQL_PASS: Microsoft SQL Server admin username. If not set, random string is generated.


# === MISCELLANEOUS ===
# Auxiliary variable for generating strong passwords
_alphabet = string.ascii_letters + string.digits
# Variable to have details about client (person logged in using az login)
_client_config = pulumi_azuread.get_client_config()
# =====================


# == Get information about current client (person who is deploying, probably you) ==
CURRENT_CLIENT = authorization.get_client_config()
# ==================================================================================


class ConfigDAR:
    """Configuration class for Data Access Request webapp"""
    # Name of the environment/stack (typically test, prod, staging)
    ENVIRONMENT: str = "TODO"
    # Deploy auth-app only
    #   TODO: needs to be set to True in the first round (to have values for configuration vars).
    DEPLOY_AUTH_APP_ONLY: bool = False
    # Name of the back-end web application/service, used as a domain:
    #   https://BACK_END_APP_NAME.azurewebsites.net/
    BACK_END_APP_NAME: str = "TODO"
    # Resource group name
    MAIN_RESOURCE_GROUP_NAME: str = "TODO"
    # Location (Azure)
    LOCATION: str = "TODO"
    # Storage account name for front-end app
    FE_STORAGE_ACCOUNT_NAME: str = "TODO"
    # Name for static storage container-based website (for front-end web app).
    FE_STATIC_WEBSITE_NAME: str = "TODO"
    # SQL Server login, try to fetch from env var or generate a new one
    SQL_SERVER_ADMIN_LOGIN: str = os.getenv("MSSQL_USER", "mricdaradmin")
    # SQL Server password, try to fetch from env var or generate a new one
    SQL_SERVER_ADMIN_PASSWORD: str = os.getenv(
        "MSSQL_PASS", ''.join(secrets.choice(_alphabet) for _ in range(20)) + "!"
    )
    # SQL Server resource name
    SQL_SERVER_RESOURCE_NAME: str = "TODO"
    # SQL Database name to be created
    SQL_SERVER_DATABASE: str = "TODO"
    # SQL Port
    SQL_SERVER_PORT: int = 1433
    # Web app name
    WEBAPP_NAME: str = "TODO"
    # Web app slot name
    WEBAPP_SLOT_NAME: str = "TODO"
    # Web app additional URIs (additional URLs where to redirect, typically various localhost)
    WEBAPP_ADDITIONAL_REDIRECT_URIS: list[str] = ["http://localhost:3000/",
                                                  "http://localhost:8080/",
                                                  "http://localhost:8000/"]  # TODO: REMOVE IN PROD
    # UUID of the OAuth2 permission scope (Auth APP)
    AD_APP_OATH2_SCOPE_UUID: str = "TODO"
    # Application roles definition
    AD_APP_ROLES: list[pulumi_azuread.ApplicationAppRoleArgs] = [
        pulumi_azuread.ApplicationAppRoleArgs(
            id="TODO",  # Must be unique everywhere! (UUID)
            value="DataManager",
            display_name="Data Manager",
            description="Manager of the DAR and researchers.",
            allowed_member_types=["User", "Application"],
            enabled=True,
        ),
        pulumi_azuread.ApplicationAppRoleArgs(
            id="TODO",  # Must be unique everywhere! (UUID)
            value="Researcher",
            display_name="Researcher",
            description="A person that can create a DAR.",
            allowed_member_types=["User", "Application"],
            enabled=True,
        )
    ]
    # Webapp configuration
    WEBAPP_PORT: int = 8000

    # -- Link to Azure Data Factory (aka ADF) with Dataset Provisioning pipeline --
    #   - ID of the subscription where ADF is located
    ADF_SUBSCRIPTION_ID: str = CURRENT_CLIENT.subscription_id
    #   - Resource group name where ADF is located
    ADF_RESOURCE_GROUP_NAME: str = "TODO"
    #   - ADF resource name
    ADF_DATA_FACTORY_NAME: str = "TODO"
    #   - Pipeline with Dataset Provisioning inside ADF resource
    ADF_PIPELINE_NAME: str = "TODO"
    # -----------------------------------------------------------------------------

    # -- Location of the Docker Container Registry with Web App code --
    DOCKER_REGISTRY_SERVER_URL: str = "https://TODO"
    DOCKER_REGISTRY_SERVER_USERNAME: str = "TODO"
    DOCKER_REGISTRY_SERVER_PASSWORD: str = "TODO"
    # -----------------------------------------------------------------


# === RESOURCE GROUP FOR THE DATA ACCESS REQUEST APP ===
# Create a resource group for Data Access Request app
rg_dar_app = resources.ResourceGroup(
    resource_name=ConfigDAR.MAIN_RESOURCE_GROUP_NAME,
    location=ConfigDAR.LOCATION
)
# ======================================================


# === FRONT-END BLOB STORAGE ===
# Create a blob for front-end (Storage Account)
stg_fe_dar = storage.StorageAccount(
    resource_name=ConfigDAR.FE_STORAGE_ACCOUNT_NAME,
    resource_group_name=rg_dar_app.name,
    location=rg_dar_app.location,
    sku=storage.SkuArgs(
        name=storage.SkuName.STANDARD_LRS,
    ),
    kind=storage.Kind.STORAGE_V2,
    tags={
        "data-access-request": "front-end-storage",
    },
)

# Enable static website container (blob) for the front-end build
web_fe_dar = storage.StorageAccountStaticWebsite(
    resource_name=ConfigDAR.FE_STATIC_WEBSITE_NAME,
    account_name=stg_fe_dar.name,
    resource_group_name=rg_dar_app.name,
    index_document="index.html",
    error404_document="index.html",
)

# Web endpoint to the website
pulumi.export("FE-endpoint", stg_fe_dar.primary_endpoints.web)
# ==============================


# === AZURE AAD APPLICATION ===
# this is the authentication app on Azure with all roles (DataManager, Researcher) and scopes
adapp_roles_and_scopes_dar = pulumi_azuread.Application(
    resource_name=ConfigDAR.WEBAPP_NAME,
    display_name=ConfigDAR.WEBAPP_NAME,
    owners=[_client_config.object_id],
    identifier_uris=[f"api://{ConfigDAR.WEBAPP_NAME}"],
    api=pulumi_azuread.ApplicationApiArgs(
        oauth2_permission_scopes=[
            pulumi_azuread.ApplicationApiOauth2PermissionScopeArgs(
                admin_consent_description=f"Do you want to access Data Access Request app?",
                admin_consent_display_name=f"Access DAR",
                enabled=True,
                id=ConfigDAR.AD_APP_OATH2_SCOPE_UUID,
                type="User",
                user_consent_description=f"Do you want to access Data Access Request app?",
                user_consent_display_name=f"Access DAR",
                value="user_impersonation",
            )
        ]
    ),
    feature_tags=[
        pulumi_azuread.ApplicationFeatureTagArgs(
            enterprise=True,
            gallery=True,
        )
    ],
    # All URLs that are in use by the app needs to be added here
    single_page_application=pulumi_azuread.ApplicationSinglePageApplicationArgs(
        redirect_uris=[
            # MANDATORY, back-end URL:
            f"https://{ConfigDAR.BACK_END_APP_NAME}.azurewebsites.net/",
            # MANDATORY, front-end URL
            stg_fe_dar.primary_endpoints.apply(lambda _ep: _ep.web),
            # OPTIONAL, additional URLs for debugging etc.
            *ConfigDAR.WEBAPP_ADDITIONAL_REDIRECT_URIS
        ]
    ),
    # Add 'Researcher' and 'DataManger' application roles
    app_roles=ConfigDAR.AD_APP_ROLES,
)
# Service principal needs to be created to allow roles assignment
adapp_service_principal_dar = pulumi_azuread.ServicePrincipal(
    "dar-app-serpr",
    application_id=adapp_roles_and_scopes_dar.client_id,
    use_existing=True,
    owners=[_client_config.object_id],
    feature_tags=[
        pulumi_azuread.ServicePrincipalFeatureTagArgs(
            enterprise=True,
            gallery=True,
        )
    ],
)
# =============================


if ConfigDAR.DEPLOY_AUTH_APP_ONLY:
    # There is a need to deploy in two steps, as the following code requires to have certain
    #   configuration variables (constants) set.
    exit(0)


# === AZURE SQL SERVER FOR BACK-END ===
sql_dar_be_sql_server = sql.Server(
    resource_name=ConfigDAR.SQL_SERVER_RESOURCE_NAME,
    resource_group_name=rg_dar_app.name,
    location=rg_dar_app.location,
    version="12.0",
    administrator_login=ConfigDAR.SQL_SERVER_ADMIN_LOGIN,
    administrator_login_password=ConfigDAR.SQL_SERVER_ADMIN_PASSWORD,
    tags={
        "data-access-request": "be-sql-server",
    },
    server_name=ConfigDAR.SQL_SERVER_RESOURCE_NAME
)

# Add database into the server
sql_dar_be_sql_db = sql.Database(
    resource_name=ConfigDAR.SQL_SERVER_DATABASE,
    resource_group_name=rg_dar_app.name,
    location=rg_dar_app.location,
    sku=sql.SkuArgs(
        capacity=20,
        name="S1",
    ),
    server_name=ConfigDAR.SQL_SERVER_RESOURCE_NAME,
    opts=pulumi.ResourceOptions(depends_on=[sql_dar_be_sql_server]),
)

# Set firewall rules to allow communication from Azure
_sql_dar_be_sql_firewall_name: str = "sql-dar-be-sql-firewall-rule"
sql_dar_be_sql_firewall = sql.FirewallRule(
    resource_name=_sql_dar_be_sql_firewall_name,
    start_ip_address="0.0.0.0",
    end_ip_address="0.0.0.0",
    firewall_rule_name=_sql_dar_be_sql_firewall_name,
    resource_group_name=rg_dar_app.name,
    server_name=sql_dar_be_sql_server.name,
)
# =====================================


# === AZURE WEBAPP FOR BACK-END ===
# App service plan for the back-end web application
service_plan_webapp_dar = pulumi_azure.appservice.ServicePlan(
    resource_name="dar-app-ser-plan",
    opts=pulumi.ResourceOptions(depends_on=stg_fe_dar),
    resource_group_name=rg_dar_app.name,
    location=rg_dar_app.location,
    os_type="Linux",
    sku_name="P1v2",
)

# Shared app settings (to configure the docker container)
_app_settings = {
    # Generic parameters for configuration of the Azure resource
    "DOCKER_REGISTRY_SERVER_URL": ConfigDAR.DOCKER_REGISTRY_SERVER_URL,
    "DOCKER_REGISTRY_SERVER_USERNAME": ConfigDAR.DOCKER_REGISTRY_SERVER_USERNAME,
    "DOCKER_REGISTRY_SERVER_PASSWORD": ConfigDAR.DOCKER_REGISTRY_SERVER_PASSWORD,
    "WEBSITES_PORT": ConfigDAR.WEBAPP_PORT,
    # Specific parameters for the web application
    "ENVIRONMENT": ConfigDAR.ENVIRONMENT,
    "MSSQL_HOST": sql_dar_be_sql_server.fully_qualified_domain_name.apply(lambda _name: _name),
    "MSSQL_USER": ConfigDAR.SQL_SERVER_ADMIN_LOGIN,
    "MSSQL_PASS": ConfigDAR.SQL_SERVER_ADMIN_PASSWORD,
    "MSSQL_PORT": ConfigDAR.SQL_SERVER_PORT,
    "MSSQL_DATABASE": sql_dar_be_sql_db.name.apply(lambda _db_name: _db_name),
    "AAD_APPLICATION_CLIENT_ID": adapp_roles_and_scopes_dar.client_id.apply(lambda _id: _id),
    "AAD_TENANT_ID": CURRENT_CLIENT.tenant_id,
    "AAD_APPLICATION_ID_URI_SCOPES": f"api://{ConfigDAR.WEBAPP_NAME}/user_impersonation",
    "ADF_SUBSCRIPTION_ID": ConfigDAR.ADF_SUBSCRIPTION_ID,
    "ADF_RESOURCE_GROUP": ConfigDAR.ADF_RESOURCE_GROUP_NAME,
    "ADF_DATA_FACTORY": ConfigDAR.ADF_DATA_FACTORY_NAME,
    "ADF_PIPELINE_NAME": ConfigDAR.ADF_PIPELINE_NAME,
    "CORS_ORIGINS": os.getenv("CORS_ORIGINS", '["*"]'),
}

# Shared site config
_site_config = pulumi_azure.appservice.LinuxWebAppSlotSiteConfigArgs(
    application_stack=pulumi_azure.appservice.LinuxWebAppSiteConfigApplicationStackArgs(
        docker_image_name="webapp:latest"
    ),
)

# Deploy actual web application inside the service plan
linux_web_app_dar = pulumi_azure.appservice.LinuxWebApp(
    resource_name=ConfigDAR.BACK_END_APP_NAME,
    name=ConfigDAR.BACK_END_APP_NAME,
    resource_group_name=rg_dar_app.name,
    location=rg_dar_app.location,
    service_plan_id=service_plan_webapp_dar.id,
    site_config=_site_config,
    app_settings=_app_settings,
    # auth_settings=pulumi_azure.appservice.LinuxWebAppAuthSettingsArgs(
    #     enabled=True,
    #     issuer=f"https://login.microsoftonline.com/{CURRENT_CLIENT.tenant_id}/v2.0",
    # ),
)

# Deploy the slot for the webapp
linux_web_app_dar_slot = pulumi_azure.appservice.LinuxWebAppSlot(
    resource_name=ConfigDAR.WEBAPP_SLOT_NAME,
    app_service_id=linux_web_app_dar.id,
    # opts=pulumi.ResourceOptions(parent=linux_web_app_dar),
    site_config=_site_config,
    app_settings=_app_settings,
    # auth_settings=pulumi_azure.appservice.LinuxWebAppAuthSettingsArgs(
    #     enabled=True,
    #     issuer=f"https://login.microsoftonline.com/{CURRENT_CLIENT.tenant_id}/v2.0",
    # ),
)
pulumi.export("BE-endpoint", linux_web_app_dar.default_hostname)
# =================================
