# JIRA-SCAN-WORKFLOW

## Summary

This Workflow Template is used to create a CI/CD pipeline that clones both a source repository and deployment repository, builds an image, runs tests, scans and upgrades the image, and conduct a canary rollout all while creating and updating a jira during each step. 

## Templates

1. [jira-sonar-template](https://github.com/codefresh-io/argo-hub/blob/main/workflows/jira-scan-template/versions/0.0.1/docs/jira-sonar-template.md) 

## Security

Minimal required permissions

[Full rbac permissions list](https://github.com/codefresh-io/argo-hub/blob/main/workflows/jira-scan-template/versions/0.0.1/rbac.yaml)
