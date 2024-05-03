# Build and deploy scripts
These scripts are for building and deploying the Docker image
with the app into Azure.

## Available scripts:
 - `deploy.sh`: Do the standard deployment of already build Docker image into the Azure Container Registry.
 - `build.sh`: Build the Docker container using ARM64 environment (by force, works even on Mac)
