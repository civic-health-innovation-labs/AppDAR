import json
import uuid
from base64 import b64encode as base64_encode_byte_array

from azure.identity import DefaultAzureCredential
from azure.mgmt.datafactory import DataFactoryManagementClient

from config import CONFIG


def run_data_pipeline(request_def: dict, target_workspace: uuid.UUID) -> str:
    """Run the requested pipeline in Azure Data Factory pipeline.
    Args:
        request_def (dict): Mapping with tables and columns to be serialized and run.
            following the logic:
            table_name -> {"columns" -> [col_1, ...], "where_statement" -> "condition" | None}
        target_workspace (uuid.UUID): UUID of the target workspace.
    Returns:
        str: URL to Azure Data Factory pipeline run.
    """
    # Authentication for ADF
    data_factory_client = DataFactoryManagementClient(
        DefaultAzureCredential(),
        CONFIG.ADF_SUBSCRIPTION_ID
    )

    # Run the pipeline
    response = data_factory_client.pipelines.create_run(
        parameters={
            # Create a query and encode it as a base64 (to safe transfer)
            "query_base64": base64_encode_byte_array(
                json.dumps(request_def).encode('ascii')
            ).decode('ascii'),
            "workspace_uuid": str(target_workspace),
        },
        resource_group_name=CONFIG.ADF_RESOURCE_GROUP,
        factory_name=CONFIG.ADF_DATA_FACTORY,
        pipeline_name=CONFIG.ADF_PIPELINE_NAME,
    )

    # Construct the link to the ADF resource and return
    return f'https://adf.azure.com/en/monitoring/pipelineruns/{response.run_id}?factory=%2F' \
           f'subscriptions%2F' \
           f'{CONFIG.ADF_SUBSCRIPTION_ID}%2F' \
           f'resourceGroups%2F' \
           f'{CONFIG.ADF_RESOURCE_GROUP}%2F' \
           f'providers%2F' \
           f'Microsoft.DataFactory%2F' \
           f'factories%2F' \
           f'{CONFIG.ADF_DATA_FACTORY}'
