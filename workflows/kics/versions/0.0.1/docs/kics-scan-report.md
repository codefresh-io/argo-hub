# KICS scan report

## Summary
Run KICS against your IaC project/file and generate a KICS report

## Inputs/Outputs

### Inputs

#### Parameters
* PATH (required) - paths or directories to scan
* BOM (optional) - include bill of materials (BoM) in results output
* DISABLE_FULL_DESCRIPTIONS (optional) - disable request for full descriptions and use default vulnerability descriptions
* DISABLE_SECRETS (optional) - disable secrets scanning
* EXCLUDE_CATEGORIES (optional) - exclude categories by providing its name; cannot be provided with query inclusion flags
* EXCLUDE_PATHS (optional) - exclude paths from scan
* EXCLUDE_QUERIES (optional) - exclude queries by providing the query ID; cannot be provided with query inclusion flags
* EXCLUDE_RESULTS (optional) - exclude results by providing the similarity ID of a result
* EXCLUDE_SEVERITIES (optional) - exclude results by providing the severity of a result
* FAIL_ON (optional) - which kind of results should return an exit code different from 0 [default: high,medium,low,info]
* IGNORE_ON_EXIT (optional) - defines which kind of non-zero exits code should be ignored (all, results, errors, none)
* INCLUDE_QUERIES (optional) - include queries by providing the query ID; cannot be provided with query exclusion flags
* LIBRARIES_PATH (optional) - path to directory with libraries
* LOG_LEVEL (optional) - determines log level (TRACE,DEBUG,INFO,WARN,ERROR,FATAL) [default: INFO]
* OUTPUT_FORMATS (optional) - formats in which the results will be exported (all, asff, csv, cyclonedx, glsast, html, json, junit, pdf, sarif, sonarqube) [default: json]
* OUTPUT_PATH (optional) - directory path to store reports
* PAYLOAD_PATH (optional) - path to store internal representation JSON file
* PROFILING (optional) - enables performance profiler that prints resource consumption metrics in the logs during the execution (CPU, MEM)
* QUERIES_PATH (optional) - paths to directory with queries
* SECRETS_REGEXES_PATH (optional) - path to secrets regex rules configuration file
* TIME_OUT (optional) - number of seconds the query has to execute before being canceled [default: 60s]
* TYPES (optional) - case insensitive list of platform types to scan (Ansible, AzureResourceManager, Buildah, CloudFormation, DockerCompose, Dockerfile, GRPC, GoogleDeploymentManager, Kubernetes, OpenAPI, Terraform)
* VERBOSE (optional) - write logs to stdout

### Outputs
* results - A folder with the KICS results

## Examples

### kics-scan-report Example
```
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: kics-
spec:
  entrypoint: kics
  templates:
    - name: kics
      dag:
        tasks:
          - name: kics
            templateRef:
              name: argo-hub.kics.0.0.1
              template: kics-scan-report
            arguments:
              parameters:
                - name: PATH
                  value: git::https://github.com/rafaela-soares/secrets
                - name: VERBOSE
                  value: true
                - name: DISABLE_SECRETS
                  value: true
                - name: IGNORE_ON_EXIT
                  value: results
                - name: OUTPUT_PATH
                  value: my-results
                - name: REPORT_FORMATS
                  value: all
                - name: TYPES
                  value: terraform,ansible,cloudformation
                - name: LOG_LEVEL
                  value: DEBUG
                - name: PROFILING
                  value: CPU
                - name: EXCLUDE_SEVERITIES
                  value: info
                - name: EXCLUDE_CATEGORIES
                  value: Insecure Configurations,Encryption
```

**Note:** You can find more detailed information about the KICS flags in the [KICS documentation](https://github.com/Checkmarx/kics/tree/master/docs)
