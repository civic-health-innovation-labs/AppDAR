.PHONY: help
SHELL:=/bin/bash

# Full Makefile file path and creation of list of cases (for help)
MAKEFILE_FULLPATH := $(abspath $(lastword $(MAKEFILE_LIST)))
# Directory of this Makefile (to relative addressing)
MAKEFILE_DIR := $(dir $(MAKEFILE_FULLPATH))

help:  ## Show the help for this Makefile
	@echo
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%s\033[0m|%s\n", $$1, $$2}' \
        | column -t -s '|'
	@echo

deploy-docker-image: build-docker-image  ## Build and deploy this app into Azure Container Registry, starting with building (usage: make deploy-docker-image ENV_FILE_PATH=pathToDotEnvFile)
	echo "Deploying this web app container (make)." \
	&& . ${MAKEFILE_DIR}/infrastructure/build-deploy-scripts/load_variables.sh \
	&& ${MAKEFILE_DIR}/infrastructure/build-deploy-scripts/deploy.sh

build-docker-image:  ## Build the Docker image locally (usage: make build-docker-image ENV_FILE_PATH=pathToDotEnvFile)
	echo "Building this web app container (make)." \
	&& . ${MAKEFILE_DIR}/infrastructure/build-deploy-scripts/load_variables.sh \
	&& ${MAKEFILE_DIR}/infrastructure/build-deploy-scripts/build.sh
