# Changelog

## v0.0.1 (2022-06-08)
by Ted Spinks
### promote-from-src-to-dest-env
Clone a GitOps repo and copy an image or chart value from a YAML file in one environment/directory to a corresponding file in another. Optionally create a GitHub PR to gate the change.
### promote-from-src-to-dest-env-s3
Take a cloned GitOps repo from an S3 artifact and copy an image/chart value from a YAML file in one environment/directory to a corresponding file in another. Optionally create a GitHub PR to gate the change.
### promote-to-env
Clone a GitOps repo and apply a new image/chart value to a YAML file in one of its environment directories. Optionally create a GitHub PR to gate the change.
### promote-to-env-s3
Take a cloned GitOps repo from an S3 artifact and apply a new image/chart value to a YAML file in one of its environment directories. Optionally create a GitHub PR to gate the change.