(function execute(inputs, outputs) {
  /*
  	This funtion  retrieve the IngressHost URL
    Then terminate or resume the workflow
  */

  // Inputs
  var url=inputs['cf_url'] + '/2.0/api/graphql';
  var token=inputs['token'];
  var workflowName=inputs['workflow_name'];
  var runtime=inputs['runtime'];
  var action=inputs['action'];

  /*
    action value is oringally from the Classic side so approve or deny
    It needs to be translated into workflow action: resumeWorkflow or terminateWorkflow
  */
  if (action == "approve"){
    action="resumeWorkflow"
  } else {
    action="terminateWorkflow"
  }

  // Variables
  var requestBody;
  var responseBody;
  var status;
  var sm;
  var data;
  var ingressHost;  // the URL of the runtime ingress
  var namespace;    // the namespace where the runtime is installed as
                    // it could be different
  /*
  		Getting the ingress host
  */
  try {
	  sm = new sn_ws.RESTMessageV2();
  	sm.setEndpoint(url);
  	sm.setHttpMethod("post");
	  sm.setRequestHeader("Authorization", token);
  	sm.setRequestHeader("Content-type", "application/json");
    data=JSON.stringify({
     "query": "query getRuntime($runtime: String!) { runtime(name: \$runtime) { metadata {\n name\n namespace}\n ingressHost}}",
     "variables": {
        "runtime": runtime
     }
    });
  	sm.setRequestBody(data);
  	response = sm.execute();  //Might throw exception if http connection timed out or some issue with sending request itself because of encryption/decryption of password.
  	responseBody = response.haveError() ? response.getErrorMessage() : response.getBody();
  	status = response.getStatusCode();
  } catch(ex) {
  	responseBody = ex.getMessage();
  	status = '500';
  } finally {
	   requestBody = sm ? sm.getRequestBody():null;
  }
  gs.info("Response ingress: " + responseBody);
  gs.info("HTTP Status: " + status);

  ingressHost=JSON.parse(responseBody).data.runtime.ingressHost
  namespace=JSON.parse(responseBody).data.runtime.metadata.namespace

  /*
  		Stopping or resuming the workflow
  */
  try{
	sm = new sn_ws.RESTMessageV2();
  	sm.setEndpoint(ingressHost + '/app-proxy/api/graphql');
  	sm.setHttpMethod("post");
	  sm.setRequestHeader("Authorization",token);
  	sm.setRequestHeader("Content-type", "application/json");
    data=JSON.stringify({
     "query": "mutation " + action +"($namespace: String!, $workflowName: String!) { " + action + "(namespace: \$namespace, workflowName: \$workflowName)}",
     "variables": {
        "namespace": namespace,
        "workflowName": workflowName
     }
    });
  	sm.setRequestBody(data);

  	response = sm.execute();  //Might throw exception if http connection timed out or some issue with sending request itself because of encryption/decryption of password.
  	responseBody = response.haveError() ? response.getErrorMessage() : response.getBody();
  	status = response.getStatusCode();
  } catch(ex) {
  	responseBody = ex.getMessage();
  	status = '500';
  } finally {
	   requestBody = sm ? sm.getRequestBody():null;
  }
  gs.info("Request Body: " + requestBody);
  gs.info("Response: " + responseBody);
  gs.info("HTTP Status: " + status);

})(inputs, outputs);
