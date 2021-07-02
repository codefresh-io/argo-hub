#Codefresh pipeline runner

##How to use the Codefresh pipeline runner

```
argo submit -n argo steps.yaml -p 'CF_API_KEY=****' -p 'PIPELINE_NAME=****'
```

###Env variables
* A secret with name CF_API_KEY and value your Codefresh API token ( https://codefresh.io/docs/docs/integrations/codefresh-api/#authentication-instructions )
* An environment variable called PIPELINE_NAME with a value of <project_name>/<pipeline_name>
* An optional environment variable called TRIGGER_NAME with trigger name attached to this pipeline. See the triggers section for more information
* An optional environment variable called CF_BRANCH with branch name .
