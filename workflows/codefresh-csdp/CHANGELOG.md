# Changelog

## v0.0.7 (29.03.2022)

### image-enricher-git-info
Added information about commits to the image

## v0.0.6 (14.2.2022)

### report-image-info
Add DOCKER_CONFIG_FILE_PATH, DOCKER_CONFIG_SECRET to authenticate registry using docker config json

## v0.0.6 (25.1.2022)

Changed icon and rename to CSDP-metadata

## v0.0.6 (12.1.2022)

### report-image-info
Added AWS_ROLE_SECRET to retrieve credentials for ECR using STS

## v0.0.6 (7.1.2022)

### image-enricher-jira-info
Add additional variables to allow users to select the keys in the secrets they are referencing

### image-enricher-git-info 
Add additional variables to allow users to select the keys in the secrets they are referencing

### report-image-info
Add additional variables to allow users to select the keys in the secrets they are referencing

## v0.0.5 (3.1.2022)

### report-image-info

Added volume for gcr key file
All registry secrets parameters were set to optional

## v0.0.4 (30.12.2021)

### image-enricher-jira-info

Enrich images with jira avatarURL

### report-image-info

Default value for secret parameters was removed
Added parameters validation

## v0.0.3 (21.12.2021)

### report-image-info

Report image info to argo platform.

## v0.0.2 (20.12.2021)

### image-enricher-git-info

Enrich images with metadata and annotation such as PR, commits, committers

### image-enricher-jira-info

Enrich images with metadata and annotation such as ticket number, title, assignee, status

## v0.0.1 (14.12.2021)

### image-enricher-git

Enrich codefresh image with PRs and Issues info. Adds pull request information to an image.
