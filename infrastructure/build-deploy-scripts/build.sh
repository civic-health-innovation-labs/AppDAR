#!/bin/bash

# This scripts builds the local Docker image

# make the current shell exit as soon as a command terminates with a non-zero exit status
set -o errexit
# makes a pipe terminate on the first encountered error
set -o pipefail
# causes the shell to indicate an error when it encounters an undefined variable
set -o nounset

# Get the current directory (where this script is located)
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# Different for building on Mac (not a x86 CPU) and the rest
ARCHITECTURE=$(uname -m)

if [ "${ARCHITECTURE}" == "arm64" ]; then
  # When not x86 architecture is in use (typically on Mac)
  DOCKER_BUILD_COMMAND="docker buildx build --platform linux/amd64"
else
  # When x86 architecture is in use
  DOCKER_BUILD_COMMAND="docker build"
fi

echo "Building '${LOCAL_IMAGE_NAME}' for AMD64..."

# File path to the Dockerfile with definition of the web application
DOCKER_FILE_LOCATION="./infrastructure/deployment/Dockerfile"
# Run the command to build
eval "${DOCKER_BUILD_COMMAND} . -f ${DOCKER_FILE_LOCATION} -t ${LOCAL_IMAGE_NAME}"
cd -
