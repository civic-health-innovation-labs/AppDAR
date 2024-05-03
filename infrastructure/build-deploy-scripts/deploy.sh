#!/bin/bash

# Script that deploy the Docker container into the Azure Container Registry (aka ACR)

# make the current shell exit as soon as a command terminates with a non-zero exit status
set -o errexit
# makes a pipe terminate on the first encountered error
set -o pipefail
# causes the shell to indicate an error when it encounters an undefined variable
set -o nounset

# Terminate the script if the environment is equal to local
if [ "${ENVIRONMENT}" = "local" ]; then
  echo "Cannot deploy from the local environment (as there is no config for ACR)"
  exit 1
fi

echo "Log into the Azure Container Registry"
echo "${ACR_PASSWORD}" | \
  docker login "${ACR_LOGIN_SERVER}" --username "${ACR_USERNAME}" --password-stdin
docker tag "${LOCAL_IMAGE_NAME}" "${ACR_IMAGE_FULL_TAG}"

echo "Pushing the container '${ACR_IMAGE_FULL_TAG}' into the Azure Container Registry"
docker push "${ACR_IMAGE_FULL_TAG}"
