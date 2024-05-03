#!/bin/bash

# Makes environment variables located in .env.SMTH file available
#   Accept argument ENV_FILE_PATH with path to the .env.SMTH

# make the current shell exit as soon as a command terminates with a non-zero exit status
set -o errexit
# makes a pipe terminate on the first encountered error
set -o pipefail
# causes the shell to indicate an error when it encounters an undefined variable
set -o nounset

if [[ -v ENV_FILE_PATH ]]; then
  # This applies only if there are arguments of the command line
  if [ -f "$ENV_FILE_PATH" ]; then
    # Set all environmental variables located in the file
    set -a
    source "$ENV_FILE_PATH"
    set +a
  fi
fi
