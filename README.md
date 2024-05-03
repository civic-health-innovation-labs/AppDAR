# Data Access Request application
Author: [David Salac](david.salac@liverpool.ac.uk)

## What is Data Access Request application?
Data Access Request application is the full-stack application for requesting data for the Trusted Research Environment workspaces. It integrates basic functionality like a catalogue and request workflow (requesting, approving, and provisioning data requests) and provides various static pages with information. It also contains infrastructure definition (for easier deployment into Azure).

# Software User Manual (installation guide)
This manual provides you with information about the installation of the Data Access Request application.

## Installation guide for the infrastructure provisioning
Pulumi state should be stored inside an Azure Storage Account (Blob).

This Container (blob) needs to be created in advance. To do so, follow the logic:
1. Go to the Azure Portal.
2. Create a storage account:
    1. Optimally, in an independent Resource Group.
    2. Select `Enable public access from all networks` in the `Networking` tab.
    3. Un-tick all soft delete options in the `Data protection` tab (as they are useless).
3. Create a `Container` (aka blob) inside the storage account.
3. Add a `Storage Blob Data Contributor` role for yourself (or whoever is needed) for the blob:
    1. Go into the Container and click Access Control (IAM) in the left menu.
    2. Click `Add role assignment`
    3. Add yourself (or whoever is needed) as a `Storage Blob Data Contributor`.
3. Add a `Storage Blob Data Contributor` role for yourself (or whoever is needed) for the Storage Account:
    1. Use the same logic as for the blob, but on the Storage Account level.

From now on, use docker-compose environment to operate with the state.

### Configure environment for the infrastructure provisioning
Go to the `docker-compose.yml` (in the `infrastructure/pulumi` folder) file and configure the environmental variables:
 - `AZURE_TENANT_ID`: Set it to Azure Tenant where things are to be deployed.
 - `PULUMI_BACKEND_URL`: Set it to `azblob://BLOB_NAME?storage_account=STORAGE_ACOUNT`
    and replace `BLOB_NAME` and `STORAGE_ACOUNT` with values from the previous step.
 - `PULUMI_CONFIG_PASSPHRASE`: stores a passphrase for deployment (optional).

To build an environment locally, use the command `docker-compose build` from inside the `infrastructure/pulumi` folder.

### Start environment
To start an environment locally, use the command `docker-compose up` from inside the `infrastructure/pulumi` folder; and then you need to get inside the container. Use the logic:
1. Run the `docker ps` command to get the container info.
    - This returns you and `CONTAINER ID` for the heifer container.
2. Run the command `docker exec -ti CONTAINER_ID /bin/bash`, replace `CONTAINER_ID`
with the sequence obtained above. You should get into the bash console of the container.

### How to turn on Pulumi
From inside the Pulumi container (see the previous step):
1. Run `az login --use-device-code` and log into the Azure.
2. Select the subscription using the command `az account set -s SUBSCRIPTION_ID`
3. Run `pulumi login`

_Note: The Pulumi password for the project needs to be stored somewhere (preferably in an Azure Key vault instance).
Temporarily, the environmental variable can be used (for development)._

### How to install Pulumi's dependencies
If there are any dependencies to be installed, you need to add them
into a Python's virtual environment. Use:
```bash
source ./venv/bin/activate
```
to start the virtual environment. 
Then, use PIP to install dependencies:
```bash
pip install -r requirements.txt
```
To deactivate (get out of) a virtual environment, use:
```bash
deactivate
```

**Note:** a virtual environment should be created by Pulumi.

### Deployment of the infrastructure
To deploy infrastructure in Azure, run:
```bash
pulumi up
```
this should (for the first time) lead you through process of the new stack creation. Then it should just build whatever changes.

## Deployment of the authentication application (app registration)
This step must be done for both local and prod development, as the application uses the Azure authentication method.

First, ensure you have followed the above manual to have the Pulumi tool ready.

In the `infrastructure/provisioning/__main__.py` file, you need to set up all variables. Then, you need to set the variable `DEPLOY_AUTH_APP_ONLY` to `True`. Then, deploy the infrastructure as described above.

## Local (development) stack/environment for infrastructure
It uses `docker-compose`, so make sure you have it installed and configured.

There are two important Docker-compose stacks. The first is in the root folder, and the other is in the `infrastructure/pulumi` folder. The one in the root folder is dedicated to local development purposes. The one in the `infrastructure/pulumi` folder is for infrastructure provisioning in Azure.

As you need to have Azure App registration ready once you want to develop the app, you need to deploy (using Pulumi's stack) first.

## Assigning user roles
There are two roles in the DAR:

- Data Manager: manages (approves or rejects) data requests.
- Researcher: creates own data requests for own workspaces.

These roles are assigned inside Azure Portal in the `Enterprise applications` - find it there by the name that is defined in `__main__.py` Pulumi file. Then just select `Assign users and groups` and follow the logic.

### Where to find the Application ID?
To find the Application (client) ID, follow the logic above - as when the user role is assigned (it is in the `Overview` window).

## Configuration of the variables
There are many configuration constants that needs to be set:

- In the front-end, you need to set all files ending with `-config.js` in the `commons` folder. All variables are documented (docstring).
- In the back-end you need to configure variables in the `back-end-src/config/config_local.py` file.

### Building and running a local stack
To build a stack, go to the project root folder and run
```shell
docker-compose build
```
to run it, use:
```shell
docker-compose up
```

If you wish to use a front-end application built in a container, first uncomment the line in the `docker-compose.yaml` file (marked by TODO). Alternatively, you can use a local version of NPM and run a `npm run` command.

## Setting up database (for local and production stack)
You also need to create all tables (and users) in the database (Microsoft SQL Server). The simplest way is to use the _Microsoft SQL Server Management Studio_. For _local stack_: log into the `127.0.0.1` host using the `sa` username and password defined in the line of the `docker-compose.yaml` file. In the _production stack_, use the values defined in infrastructure definition file (config class).

Installation scripts (SQL files) are located in the `infrastructure/database` folder. In the local stack: use first `create-database-user.sql` and then `create-tables.sql`. In production, only the second one; just cherry-pick values inside the `IF` statement copy and paste and then run it (once logged as an admin user).

**Note:** in the local environment, database should be set up automatically in 30 seconds (manual above is therefore useful only if the changes are done).

## Building production stack
To build a production stack, you need to create an Azure Container Registry (aka ACR) instance first. It will contain the back-end application (service).

### Setting up the ACR values
Also, you need to set up the environmental variables files. Copy and paste the file `.env.sample` as `.env.WHATEVER` (e.g. `env.local`). Then, change the variables: 

- `ENVIRONMENT` (to `test` or `prod`)
- `ACR_LOGIN_SERVER` to value obtained when ACR is created.
- `ACR_IMAGE_FULL_TAG` to something like `webapptestdsmric.azurecr.io/webapp:latest`.
- `ACR_USERNAME`, `ACR_PASSWORD` to values set when ACR is created.
- `LOCAL_IMAGE_NAME` to `webapp:latest`.

### Building and deploying Docker image
Once all the variables are set, use (use Linux terminal with Bash, e.g. WSL):
```shell
make deploy-docker-image ENV_FILE_PATH=.env.WHATEVER
```
and replace `.env.WHATEVER_PATH` with a correct path. This should build and deploy the container with the web application.

### Building and deploying front-end content
Either from inside the `frontend` container or locally run the command:
```shell
npm build
```
(if you run it locally, you need to have React installed in the latest version).

Then, upload the content of the `build` folder into the Blob `$web` inside the front-end storage account created by Pulumi. For example, use SAS toke and Microsoft Azure Storage Explorer.
