#!/bin/sh
# Clones a GitOps repo and copies an image or chart value from a YAML file in one environment/directory to a
# corresponding file in another. Can also apply a new image or chart value directly, without copying it from a
# source environment. Optionally creates a PR to gate the change.
#
# See the argo-hub.gitops-promotion Workflow Template for a complete list of input environment variables and full
# README documentaiton.
#
# ted.spinks@codefresh.io

# exit when any command fails
set -e

function main()
{
    validate_input_vars
    clone_git_repo
    # For each microservice in the list, apply the new image/values/chart value to the destination
    for SVC_NAME in ${SVC_NAME_LIST}
    do
        # Figure out the source + destination files, and their yaml keys or image transformers
        interpolate_file_paths "${SVC_NAME}"
        interpolate_image_tf_names "${SVC_NAME}"
        interpolate_yaml_keys "${SVC_NAME}"
        interpolate_helm_dep "${SVC_NAME}"

        # If no input value was provided to apply directly to the dest, then copy it from the source key/image
        if [ -z "${VALUE_FROM_INPUT}" ]; then
            read_value_from_src_file
        else
            VALUE="${VALUE_FROM_INPUT}"
        fi
        echo "Value to promote: ${VALUE}"
        write_value_to_dest_file
        echo "Dest file successfully updated"
    done
    commit_and_push_to_git
    if [ "${CREATE_GITHUB_PR}" = "true" ]; then
        create_github_pr
    fi
}

function validate_input_vars()
# Validate that any critical inputs were provided
{
    if [ "${PROMOTION_TYPE}" != "kustomize-image" ] && [ "${PROMOTION_TYPE}" != "helm-value" ] && \
       [ "${PROMOTION_TYPE}" != "helm-dependency" ] && [ "${PROMOTION_TYPE}" != "yaml-key" ]; then
        echo "Env variable PROMOTION_TYPE must be one of: kustomize-image, helm-value, helm-dependency, yaml-key" >&2
        exit 1
    fi
}

function clone_git_repo()
# Clone the Git repo (or use the artifact repo if present), cd into it, and create branch if not main/master
{
    echo "Inserting Git token into URL..."
    local GIT_REPO_TOKEN_URL=$(echo ${GIT_REPO_URL} | sed -e "s+https://+https://${GIT_TOKEN}@+g")
    echo "Configuring Git user details..."
    git config --global user.name "${GIT_USER_NAME}"
    git config --global user.email "${GIT_USER_EMAIL}"
    # Check if an Argo Workflows "artifact repo" was mounted - if so use it, otherwise clone the git URL
    if [ -d "/tmp/s3-artifact/clone" ]; then
        echo "Using Git clone directory provided by S3 artifact..."
        cd /tmp/s3-artifact/clone
        git checkout ${GIT_CLONE_BRANCH}
        git remote set-url origin "${GIT_REPO_TOKEN_URL}"
    else
        echo "S3 artifact with Git clone directory was not found."
        echo "Cloning ${GIT_CLONE_BRANCH} branch of git repo..."
        git clone --branch ${GIT_CLONE_BRANCH} ${GIT_REPO_TOKEN_URL}
        local GIT_DIR=$(basename "$GIT_REPO_URL" .git)
        echo Changing directory to ${GIT_DIR}
        cd ${GIT_DIR}
    fi
    # Create new branch if needed
    if [ "${GIT_CHECKOUT_BRANCH}" != "main" ] && [ "${GIT_CHECKOUT_BRANCH}" != "master" ] && \
       [ "${GIT_CLONE_BRANCH}" != "${GIT_CHECKOUT_BRANCH}" ]; then
        git checkout -b ${GIT_CHECKOUT_BRANCH}
    else
        echo "Staying on ${GIT_CHECKOUT_BRANCH} branch"
    fi
}

function verify_file_exists()
# Parameters: 1) file path to verify, 2) whether the file is "source" or "destination"
{
    local FILE_PATH=$1
    local FILE_TYPE=$2
    if [ ! -f "${FILE_PATH}" ]; then
        echo "Error: ${FILE_TYPE} file \"${FILE_PATH}\" does not exist." >&2
        exit 1
    fi
}

function interpolate_file_paths()
# Interpolate file paths, yaml keys, and image transformer names
# Parameter: $SVC_NAME - the service to promote
# Outputs: $SRC_FILE_PATH, $DEST_FILE_PATH
{
    local SVC_NAME=$1
    local FILE_PATH=$(echo ${FILE_PATH_PATTERN} | sed -e "s+\[\[SVC_NAME\]\]+${SVC_NAME}+g")
    local FILE_PATH=$(echo ${FILE_PATH} | sed -e "s+\[\[OTHER\]\]+${OTHER}+g")
    SRC_FILE_PATH=$(echo ${FILE_PATH} | sed -e "s+\[\[ENV\]\]+${ENV_SRC}+g")
    DEST_FILE_PATH=$(echo ${FILE_PATH} | sed -e "s+\[\[ENV\]\]+${ENV_DEST}+g")
}

function interpolate_yaml_keys()
# Interpolate yaml keys
# Parameter: $SVC_NAME - the service to promote
# Outputs: $SRC_KEY, $DEST_KEY
{
    local SVC_NAME=$1
    local YAML_KEY=$(echo ${YAML_KEY_PATTERN} | sed -e "s+\[\[SVC_NAME\]\]+${SVC_NAME}+g")
    local YAML_KEY=$(echo ${YAML_KEY} | sed -e "s+\[\[OTHER\]\]+${OTHER}+g")
    SRC_KEY=$(echo ${YAML_KEY} | sed -e "s+\[\[ENV\]\]+${ENV_SRC}+g")
    DEST_KEY=$(echo ${YAML_KEY} | sed -e "s+\[\[ENV\]\]+${ENV_DEST}+g")
}

function interpolate_helm_dep()
# Interpolate the helm dependency subchart names
# Parameter: $SVC_NAME - the service to promote
# Outputs: $SRC_DEP, $DEST_DEP
{
    local SVC_NAME=$1
    local DEP=$(echo ${HELM_DEP_PATTERN} | sed -e "s+\[\[SVC_NAME\]\]+${SVC_NAME}+g")
    local DEP=$(echo ${DEP} | sed -e "s+\[\[OTHER\]\]+${OTHER}+g")
    SRC_DEP=$(echo ${DEP} | sed -e "s+\[\[ENV\]\]+${ENV_SRC}+g")
    DEST_DEP=$(echo ${DEP} | sed -e "s+\[\[ENV\]\]+${ENV_DEST}+g")
}

function interpolate_image_tf_names()
# Interpolate the Kustomize image transformer names
# Parameter: $SVC_NAME - the service to promote
# Outputs: $SRC_IMAGE, $DEST_IMAGE
{
    local SVC_NAME=$1
    local IMAGE=$(echo ${KUST_IMAGE_PATTERN} | sed -e "s+\[\[SVC_NAME\]\]+${SVC_NAME}+g")
    local IMAGE=$(echo ${IMAGE} | sed -e "s+\[\[OTHER\]\]+${OTHER}+g")
    SRC_IMAGE=$(echo ${IMAGE} | sed -e "s+\[\[ENV\]\]+${ENV_SRC}+g")
    DEST_IMAGE=$(echo ${IMAGE} | sed -e "s+\[\[ENV\]\]+${ENV_DEST}+g")
}

function validate_value()
{
    if [ -z "$1" ] || [ "$1" = "null" ]; then
        echo "Error: Unable to retrieve value, double check the yq command's expression." >&2
        exit 1
    fi
}

function read_value_from_src_file()
# Output: $VALUE
{
    verify_file_exists "${SRC_FILE_PATH}" "Source"
    if [ "${PROMOTION_TYPE}" == "kustomize-image" ]; then
        echo "Reading Image Transformer \"${SRC_IMAGE}\" from source file ${SRC_FILE_PATH}"
        set -o xtrace  # print commands before running them
        VALUE=$(yq eval ".images[] | select(.name == \"${SRC_IMAGE}\") | .newTag" ${SRC_FILE_PATH})
        set +o xtrace  # stop printing commands
    elif [ "${PROMOTION_TYPE}" == "helm-dependency" ]; then
        echo "Reading Helm Dependency \"${SRC_DEP}\" from source file ${SRC_FILE_PATH}"
        set -o xtrace  # print commands before running them
        VALUE=$(yq eval ".dependencies[] | select(.name == \"${SRC_DEP}\") | .version" ${SRC_FILE_PATH})
        set +o xtrace  # stop printing commands
    else  # else type is helm-value or yaml-key
        echo "Reading YAML key \"${SRC_KEY}\" from source file ${SRC_FILE_PATH}"
        set -o xtrace  # print commands before running them
        VALUE=$(yq eval "${SRC_KEY}" ${SRC_FILE_PATH})
        set +o xtrace  # stop printing commands
    fi
    validate_value "${VALUE}"
}

function write_value_to_dest_file()
{
    verify_file_exists "${DEST_FILE_PATH}" "Destination"
    if [ "${PROMOTION_TYPE}" == "kustomize-image" ]; then
        echo "Updating Image Transformer \"${DEST_IMAGE}\" in destination file ${DEST_FILE_PATH}"
        set -o xtrace  # print commands before running them
        yq eval "( .images[] | select(.name == \"${DEST_IMAGE}\") | .newTag ) = \"${VALUE}\"" ${DEST_FILE_PATH} -i
        set +o xtrace  # stop printing commands
        echo "Double checking dest file..."
        cat ${DEST_FILE_PATH} | grep newTag | grep ${VALUE}
    elif [ "${PROMOTION_TYPE}" == "helm-dependency" ]; then
        echo "Updating Helm Dependency \"${DEST_DEP}\" in destination file ${DEST_FILE_PATH}"
        set -o xtrace  # print commands before running them
        yq eval "( .dependencies[] | select(.name == \"${DEST_DEP}\") | .version ) = \"${VALUE}\"" ${DEST_FILE_PATH} -i
        set +o xtrace  # stop printing commands
        echo "Double checking dest file..."
        cat ${DEST_FILE_PATH} | grep version | grep ${VALUE}
    else  # else type is helm-value or yaml-key
        echo "Updating YAML key \"${DEST_KEY}\" in destination file ${DEST_FILE_PATH}"
        set -o xtrace  # print commands before running them
        yq eval "${DEST_KEY} = \"${VALUE}\"" ${DEST_FILE_PATH} -i
        set +o xtrace  # stop printing commands
        echo "Double checking dest file..."
        cat ${DEST_FILE_PATH} | grep ${VALUE}
    fi
}

function commit_and_push_to_git()
# Commit the destination file in Git and push it
# Output: $GIT_COMMIT_MSG
{
    echo Committing and pushing to Git repo...
    # Generate commit message if one wasn't passed in as an input var
    if [ -z "${GIT_COMMIT_MSG}" ]; then
        if [ ! -z "${ENV_SRC}" ]; then FROM="from ${ENV_SRC} "; fi
        GIT_COMMIT_MSG="Promote ${FROM}to ${ENV_DEST}: ${SVC_NAME_LIST}"
    fi
    set -o xtrace  # print commands before running them
    git add ${DEST_FILE_PATH}
    git commit -m "${GIT_COMMIT_MSG}"
    git push --set-upstream origin $GIT_CHECKOUT_BRANCH
    set +o xtrace  # stop printing commands
}

function create_github_pr()
{
    # Documentation:
    # https://cli.github.com/manual/gh_auth_login
    # https://cli.github.com/manual/gh_pr_create

    if [ "${GIT_CHECKOUT_BRANCH}" = "main" ] || [ "${GIT_CHECKOUT_BRANCH}" = "master" ]; then
        echo "Cannot open a PR when the PR branch is the same as ${GIT_CHECKOUT_BRANCH}" >&2
        exit 1            
    fi
    echo Creating PR in GitHub...
    # If a title wasn't provided, use the commit message
    if [ -z "${PR_TITLE}" ]; then
        PR_TITLE="${GIT_COMMIT_MSG}"
    fi
    echo ${GIT_TOKEN} | gh auth login --with-token
    local LABEL="pr-workflow=${PR_WORKFLOW_UID}"
    gh label create "${LABEL}"
    # This command must be run from the github-managed directory
    gh pr create --fill --title "${PR_TITLE}" --label "${LABEL}" | tee /tmp/pr-url.txt
}


main
