#!/usr/bin/env python3
# This script and Dockerfile are for use in an Argo Workflows template, to parse the GitHub Event Payload (JSON).
# Output the most useful payload fields as artifact files, which can be mapped into global workflow outputs, and then
# consumed by any subsequent templates. The list of fields closely matches the pipeline variables that were previously 
# established in Codefresh's Classic platform: https://codefresh.io/docs/docs/codefresh-yaml/variables

import os
import json

INPUT_PAYLOAD_JSON_ENV_VAR = "GITHUB_JSON"
OUTPUT_DIR = "/tmp/gitvars/"

def main():
    # Read json from env var into a dictionary
    payload_json = os.getenv(INPUT_PAYLOAD_JSON_ENV_VAR)
    # print(payload_json)
    payload_dict = json.loads(payload_json)

    # Create output dir
    os.makedirs(OUTPUT_DIR, exist_ok = True)

    # Generate output files from payload
    output_common_git_vars(payload_dict)
    output_common_pr_vars(payload_dict)
    output_github_release_vars(payload_dict)
    output_github_pr_vars(payload_dict)


def output_common_git_vars(payload_dict):
    # Duplicated from Classic: https://codefresh.io/docs/docs/codefresh-yaml/variables/#system-provided-variables
    write_var_file("CF_REPO_OWNER", payload_dict["repository"]["owner"]["name"])
    write_var_file("CF_REPO_NAME", payload_dict["repository"]["name"])
    ref = payload_dict["ref"]
    write_var_file("CF_BRANCH", ref.replace("refs/heads/", ""))
    write_var_file("CF_BASE_BRANCH", payload_dict["base_ref"])
    write_var_file("CF_COMMIT_AUTHOR", payload_dict["head_commit"]["author"]["name"])
    write_var_file("CF_COMMIT_USERNAME", payload_dict["head_commit"]["author"]["username"])
    write_var_file("CF_COMMIT_EMAIL", payload_dict["head_commit"]["author"]["email"])
    write_var_file("CF_COMMIT_URL", payload_dict["head_commit"]["url"])
    write_var_file("CF_COMMIT_MESSAGE", payload_dict["head_commit"]["message"])
    sha = payload_dict["after"]
    write_var_file("CF_REVISION", sha)
    write_var_file("CF_SHORT_REVISION", sha[0:7])


def output_common_pr_vars(payload_dict):
    # Duplicated from Classic: https://codefresh.io/docs/docs/codefresh-yaml/variables/#system-provided-variables
    if payload_dict["X-GitHub-Event"] == "pull_request":
        print("Not a PR event - PR outputs will be empty")
        write_var_file("CF_PULL_REQUEST_ACTION", payload_dict["action"])
        write_var_file("CF_PULL_REQUEST_TARGET", payload_dict["pull_request"]["base"]["ref"])
        write_var_file("CF_PULL_REQUEST_NUMBER", payload_dict["number"])
        write_var_file("CF_PULL_REQUEST_ID", payload_dict["pull_request"]["id"])
        write_var_file("CF_PULL_REQUEST_LABELS", payload_dict["pull_request"]["labels"])
    else:
        write_var_file("CF_PULL_REQUEST_ACTION", "")
        write_var_file("CF_PULL_REQUEST_TARGET", "")
        write_var_file("CF_PULL_REQUEST_NUMBER", "")
        write_var_file("CF_PULL_REQUEST_ID", "")
        write_var_file("CF_PULL_REQUEST_LABELS", "")


def output_github_release_vars(payload_dict):
    # Duplicated from Classic: https://codefresh.io/docs/docs/codefresh-yaml/variables/#github-release-variables
    if payload_dict["X-GitHub-Event"] == "release":
        write_var_file("CF_RELEASE_NAME", payload_dict["release"]["name"])
        write_var_file("CF_RELEASE_TAG", payload_dict["release"]["tag_name"])
        write_var_file("CF_RELEASE_ID", payload_dict["release"]["id"])
        write_var_file("CF_PRERELEASE_FLAG", payload_dict["release"]["prerelease"])
    else:
        write_var_file("CF_RELEASE_NAME", "")
        write_var_file("CF_RELEASE_TAG", "")
        write_var_file("CF_RELEASE_ID", "")
        write_var_file("CF_PRERELEASE_FLAG", "")


def output_github_pr_vars(payload_dict):
    # Duplicated from Classic: https://codefresh.io/docs/docs/codefresh-yaml/variables/#github-pull-request-variables
    if payload_dict["X-GitHub-Event"] == "pull_request":
        write_var_file("CF_PULL_REQUEST_MERGED", payload_dict["pull_request"]["merged"])
        write_var_file("CF_PULL_REQUEST_HEAD_BRANCH", payload_dict["pull_request"]["head"]["ref"])
        write_var_file("CF_PULL_REQUEST_MERGED_COMMIT_SHA", payload_dict["pull_request"]["merge_commit_sha"])
        write_var_file("CF_PULL_REQUEST_HEAD_COMMIT_SHA", payload_dict["pull_request"]["head"]["sha"])
    else:
        write_var_file("CF_PULL_REQUEST_MERGED", "")
        write_var_file("CF_PULL_REQUEST_HEAD_BRANCH", "")
        write_var_file("CF_PULL_REQUEST_MERGED_COMMIT_SHA", "")
        write_var_file("CF_PULL_REQUEST_HEAD_COMMIT_SHA", "")


def write_var_file(name, value):
    # Make sure value isn't null
    if not value:
        value = ""
    # Cast array and boolean values to string
    value_str = str(value)
    # Write the value to output file
    with open(OUTPUT_DIR + name, 'w') as file:
        file.write(value_str)
    print(name + "=" + value_str)

    
if __name__ == "__main__":
    main()
