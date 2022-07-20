# Changelog

## v0.0.1 7/19/2022

This CI pipeline builds a clones a git repo and git manifest repo, creates a jira that gets updated as the workflow progresses, builds a docker image using Kaniko, scans the image, and deploys the image through a canary rollout.

