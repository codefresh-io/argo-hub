import os
import sys
import json
import requests
import logging
import urllib.parse
import time

API_NAMESPACE=409723

def getBaseUrl(instance):
    baseUrl = "%s/api" %(instance);
    logging.debug("baseUrl: %s", baseUrl)
    return baseUrl

#
# export vaiable in /tmp to be used as output parameter
def exportVariable(name, value):
    print(f"   {name}: {value}")
    file=open(f"/tmp/{name}", "w")
    file.write(f"{value}")
    file.close()

def replace_first_line(file_path, new_line):
    with open(file_path, 'r') as file:
        lines = file.readlines()

    if lines:  # Check if the file is not empty
        lines[0] = new_line

        with open(file_path, 'w') as file:
            file.writelines(lines)
    logging.info("Updating Argo Workflow Progress File: %s with %s", file_path, new_line)

def processCallbackResponse(response):
    logging.info("Processing answer from CR creation REST call")
    logging.debug("Callback returned code %s",response.status_code)
    if (response.status_code != 200 and response.status_code != 201):
        logging.critical("Callback creation failed with code %s", response.status_code)
        logging.critical("%s", response.text)
        sys.exit(response.status_code)

    logging.info("Callback creation successful")

def processCreateChangeRequestResponse(response):
    logging.info("Processing answer from CR creation REST call")
    logging.debug("Change Request returned code %s" % (response.status_code))
    if (response.status_code != 200 and response.status_code != 201):
        logging.critical("Change Request creation failed with code %s", response.status_code)
        logging.critical("%s", response.text)
        sys.exit(response.status_code)

    logging.info("Change Request creation successful")
    data=response.json()
    FULL_JSON=json.dumps(data, indent=2)
    CR_NUMBER=data["result"]["number"]["value"]
    CR_SYSID=data["result"]["sys_id"]["value"]
    exportVariable("CR_NUMBER", CR_NUMBER)
    exportVariable("CR_SYSID", CR_SYSID)
    exportVariable("CR_CREATE_JSON", FULL_JSON)
    return CR_NUMBER

#
# Call SNow REST API to create a new Change Request
# Fields required are pasted in the data
def createChangeRequest(user, password, baseUrl, data):

    logging.info("Creating a new Change Request")

    if (bool(data)):
        crBody=data
        logging.debug("Data: %s", json.loads(crBody))
    else:
        crBody= {}
        logging.debug("Data: None")

    # https://www.servicenow.com/docs/bundle/yokohama-api-reference/page/integrate/inbound-rest/concept/change-management-api.html#title_change-GET-change
    url="%s/sn_chg_rest/change" % (baseUrl)

    logging.debug("URL %s:",url)
    logging.debug("User: %s", user)
    logging.info("Data: %s", crBody)

    resp=requests.post(
        url,
        data=crBody,
        headers = {
            "content-type":"application/json",
            "Accept": "application/json"
        },
        auth=(user, password)
    )
    return processCreateChangeRequestResponse(response=resp)


def processSearchStandardTemplateResponse(name, response):
    logging.info("Processing answer from Standard Template search")
    logging.debug("Template search returned code %s" % (response.status_code))
    if (response.status_code != 200 and response.status_code != 201):
        logging.critical("Standard Change Template for '%s' errored out with code %s", name, response.status_code)
        logging.critical("%s" + response.text)
        sys.exit(response.status_code)
    data=response.json()
    logging.debug("Full JSON answer: %s", data)

    if len(data["result"]) ==0 :
        logging.critical("Standard Change Template '%s' was not found", name)
        sys.exit(1)

    logging.info("Standard template search successful")
    STD_SYSID=data["result"][0]["sys_id"]
    return STD_SYSID

def processCreateStandardChangeRequestResponse(response):
    logging.info("Processing answer from standard CR creation REST call")
    logging.debug("Change Request returned code %s" % (response.status_code))
    if (response.status_code != 200 and response.status_code != 201):
        logging.critical("Change Request creation failed with code %s", response.status_code)
        logging.critical("%s", response.text)
        sys.exit(response.status_code)

    logging.info("Change Request creation successful")
    data=response.json()
    FULL_JSON=json.dumps(data, indent=2)
    CR_NUMBER=data["result"][0]["number"]["value"]
    CR_SYSID=data["result"][0]["sys_id"]["value"]
    exportVariable("CR_NUMBER", CR_NUMBER)
    exportVariable("CR_SYSID", CR_SYSID)
    exportVariable("CR_CREATE_JSON", FULL_JSON)
    return CR_NUMBER

# Call SNow REST API to create a new Standard Change Request
# Fields required are pasted in the data
def createStandardChangeRequest(user, password, baseUrl, data, standardName):
    logging.info("Creating a new Standard Change Request using '%s' template", standardName)
    encodedName=urllib.parse.quote_plus(standardName)

    # TODO: /now/table/std_change_template
    url="%s/now/table/std_change_record_producer?sysparm_query=sys_name=%s" % (baseUrl, encodedName)

    logging.debug("Standard Change URL %s:",url)
    resp=requests.get(url,
        headers = {"content-type":"application/json"},
        auth=(user, password))
    sysid=processSearchStandardTemplateResponse(name=standardName, response=resp)
    logging.info("Template found: %s", sysid)

    if (bool(data)):
        crBody=json.loads(data)
        logging.debug("Data: %s", data)
    else:
        crBody= {}
        logging.debug("  Data: None")
    crBody["cf_build_id"] = os.getenv('CF_BUILD_ID')


    # https://www.servicenow.com/docs/bundle/yokohama-api-reference/page/integrate/inbound-rest/concept/change-management-api.html#title_change-POST-standard
    url="%s/sn_chg_rest/change/standard/%s" % (baseUrl, sysid)

    logging.debug("URL %s:",url)
    logging.debug("User: %s", user)
    logging.debug("Body: %s", crBody)

    resp=requests.get(url,
        headers = {"content-type":"application/json"},
        auth=(user, password))
        
    resp=requests.post(url,
        json = crBody,
        headers = {"content-type":"application/json"},
        auth=(user, password))
    return processCreateStandardChangeRequestResponse(response=resp)


def processQueryChangeRequestResponse(response):

    logging.debug("Processing answer from CR %s REST call")
    logging.debug("Query Request returned code %s", response.status_code)
    if (response.status_code != 200 and response.status_code != 201):
        logging.critical("Query Request query failed with code %s", response.status_code)
        logging.critical("%s" + response.text)

    logging.info("Query Change Request successful")
    data=response.json() # json.loads(response.text)

    if (response.status_code != 200 and response.status_code != 201):
        sys.exit(response.status_code)

    return data


def watchChangeRequestState(user, password, baseUrl, sysid, timeout, sleep_interval, resume_state, cancel_state, argo_progress_file, task_name):
    start_time = time.time()

    maximum_loops = round(int(timeout)/int(sleep_interval))
    loop_counter = 0

    new_value = "/".join([str(loop_counter), str(maximum_loops)])

    f = open(argo_progress_file, "x")
    f.write(new_value)
    f.close()

    while True:

        if not task_name:
            data = queryChangeRequest(user, password, baseUrl, sysid)
            state = data['result']['state']['display_value']
            print(f"Current State CR: {state}")
        else:
            while True:
                data = queryChangeRequestTask(user, password, baseUrl, sysid)
                logging.info("Looking for Task with Display Name %s", task_name)
                task_state = None
                for item in data['result']:
                    current = item
                    logging.info(current)
                    current_task_name = current['short_description']['display_value']
                    logging.info("Comparing Current Task Name: %s With Target Task Name: %s", current_task_name, task_name)
                    if current_task_name == task_name:
                        logging.info("%s matches %s", current_task_name, task_name)
                        task_state = item['state']['display_value']
                        logging.info("Current Task State: %s", task_state)
                        logging.info("Expected Task State: %s", resume_state)
                        break
                    else:
                        logging.info("%s does not match %s", current_task_name, task_name)
                    if not item['state']['display_value']:
                        logging.info("No Tasks Matching %s, Sleeping 5 seconds",task_name)
                        time.sleep(5)                       
                if not data['result']:
                    logging.info("No Tasks found for %s, Sleeping 5 seconds",sysid)
                    time.sleep(5)
                if task_state:
                    break
            state = task_state
            print(f"Current State Task: {state}")
            print(f"Expected State Task: {resume_state}")
        
        if state == resume_state:
            logging.info("Resuming Release, State changed to %s",state)
            exit(0)

        if state == cancel_state:
            logging.critical("!!!Cancelling Release, State changed to %s!!!",state)
            exit(1)

        elapsed_time = time.time() - start_time
        logging.info("Elapsed Time %s",elapsed_time)
        logging.info("Timeout %s",timeout)
        if elapsed_time > int(timeout):
            logging.critical("!!!Cancelling Release, Timeout of %s reached!!!ls",timeout)
            exit(1)
        
        loop_counter += 1

        new_value = "/".join([str(loop_counter), str(maximum_loops)])
        replace_first_line(argo_progress_file, new_value)

        logging.info("Sleep %s seconds and retry",sleep_interval)
        time.sleep(int(sleep_interval))


def processModifyChangeRequestResponse(response, action):
    logging.debug("Processing answer from CR %s REST call",  action)
    logging.debug("%s Change Request returned code %s" , action, response.status_code)
    if (response.status_code != 200 and response.status_code != 201):
        logging.critical("%s Change Request creation failed with code %s",action, response.status_code)
        logging.critical("%s" + response.text)

    logging.info("%s Change Request successful", action)
    data=response.json() # json.loads(response.text)
    FULL_JSON=json.dumps(data, indent=2)

    if (action == "close" ):
        exportVariable("CR_CLOSE_JSON", FULL_JSON)
    elif (action == "update" ):
        exportVariable("CR_UPDATE_JSON", FULL_JSON)
    else:
        logging.error("action unknown. Should not be here. Error should have been caught earlier")

    if (response.status_code != 200 and response.status_code != 201):
        sys.exit(response.status_code)

# Call SNow REST API to close a CR
# Fields required are pasted in the data
def closeChangeRequest(user, password, baseUrl, sysid, code, notes, data):
    logging.info("Closing a Change Request: %s", sysid)
    logging.debug("Closure added data: %s", data)
    if (bool(data)):
        crBody=json.loads(data)
    else:
        crBody= {}
    crBody["state"] = 3
    crBody["close_code"] = code
    crBody["close_notes"] = notes
    # https://www.servicenow.com/docs/bundle/yokohama-api-reference/page/integrate/inbound-rest/concept/change-management-api.html#title_change-PATCH-change-sys_id
    url="%ssn_chg_rest/change/%s" % (baseUrl, sysid)
    logging.debug("Closure complete data : %s", crBody)
    resp=requests.patch(url,
        data = crBody,
        headers = {"content-type":"application/json"},
        auth=(user, password))
    processModifyChangeRequestResponse(response=resp, action="close")


# Call SNow REST API to query a CR
# Fields required are pasted in the data
def queryChangeRequest(user, password, baseUrl, sysid):
    logging.info("Querying an existing Change Request: %s", sysid)

    url="%s/sn_chg_rest/change/%s" % (baseUrl, sysid)
    logging.debug("Query CR URL: %s", url)

    resp=requests.get(url,
        headers = {"content-type":"application/json"},
        auth=(user, password))
    
    data = processQueryChangeRequestResponse(response=resp)

    return data

def queryChangeRequestTask(user, password, baseUrl, sysid):
    logging.info("Querying an existing Change Request: %s", sysid)
    # https://www.servicenow.com/docs/bundle/yokohama-api-reference/page/integrate/inbound-rest/concept/change-management-api.html#title_change-GET-c_id-task
    url="%s/sn_chg_rest/change/%s/task" % (baseUrl, sysid)
    logging.debug("Query CR URL: %s", url)

    resp=requests.get(url,
        headers = {"content-type":"application/json"},
        auth=(user, password))
    
    data = processQueryChangeRequestResponse(response=resp)

    return data
   

# Call SNow REST API to update a CR
# Fields required are pasted in the data
def updateChangeRequest(user, password, baseUrl, sysid, data):
    logging.info("Updating an existing Change Request: %", sysid)
    logging.debug("DATA: %s", data)
    if (bool(data)):
        crBody=json.loads(data)
    else:
        crBody= {}
        logging.warning("WARNING: CR_DATA is empty. What are you updating exactly?")

    # https://www.servicenow.com/docs/bundle/yokohama-api-reference/page/integrate/inbound-rest/concept/change-management-api.html#title_change-PATCH-change-sys_id
    url="%s/sn_chg_rest/change/%s" % (baseUrl, sysid)
    logging.debug("Update CR URL: %s", url)
    resp=requests.patch(url,
        json = crBody,
        headers = {"content-type":"application/json"},
        auth=(user, password))
    processModifyChangeRequestResponse(response=resp, action="update")

# Use rest API to call scripted REST API to start a flow that will wait for CR
# to be approved or rejected, then callback Codefreh to approve/deny pipeline
#
def callback(user, password, baseUrl, number, cf_build_id, token, policy):

    logging.debug("Entering callback:")
    logging.debug("CR Number: %s", number)
    logging.debug("CF Build ID: %s", cf_build_id)

    url = "%s/%s/codefresh/callback" % (baseUrl, API_NAMESPACE)
    body = {
        "cr_number": number,
        "cf_build_id": cf_build_id,
        "cf_token": token,
        "cf_url": os.getenv("CF_URL"),
        "cr_policy": policy,
        "ci_system": "workflow",
        "cf_runtime": os.getenv("CF_RUNTIME")
    }
    logging.debug("Calling POST on " + url)
    logging.debug("Data: " + json.dumps(body))

    resp=requests.post(url,
        json = body,
        headers = {"content-type":"application/json"},
        auth=(user, password))
    processCallbackResponse(response=resp)

def checkSysid(sysid):
    logging.debug("Entering checkSysid: ")
    logging.debug("CR_SYSID: %s", sysid)

    if ( sysid == None ):
        logging.critical("CR_SYSID is not defined.")
        sys.exit(1)

def checkToken(token):
    logging.debug("Entering checkToken: ")
    logging.debug("  TOKEN: %s" % (token))

    if ( token == None ):
        logging.error("FATAL: TOKEN is not defined.")
        sys.exit(1)

def checkUser(username):
    logging.debug("Entering checkUser: ")
    logging.debug("  CR_USER: %s" % (username))

    if ( username == None ):
        logging.error("FATAL: CR_USER is not defined.")
        sys.exit(1)

def checkConflictPolicy(policy):
    logging.debug("Entering checkConflictPolicy: ")
    logging.debug("  CR_CONFLICT_POLICY: %s" % (policy))

    if policy == "ignore" or policy == "reject" or policy == "wait":
            return
    else:
        logging.error("FATAL: CR_CONFLICT_POLICY invalid value. Accepted values are ignore, reject or wait.")
        sys.exit(1)

def main():
    ACTION               = os.getenv('ACTION', "createcr").lower()
    USER                 = os.getenv('SN_USER')
    PASSWORD             = os.getenv('SN_PASSWORD')
    INSTANCE             = os.getenv('SN_INSTANCE')
    DATA                 = os.getenv('CR_DATA')
    STD_NAME             = os.getenv('STD_CR_TEMPLATE')
    TOKEN                = os.getenv('TOKEN')
    POLICY               = os.getenv('CR_CONFLICT_POLICY')
    POLLING              = os.getenv('POLLING', default=None)
    LOG_LEVEL            = os.getenv('LOG_LEVEL', "info").upper()
    WATCH_TIMEOUT        = os.getenv('CR_WATCH_TIMEOUT')
    WATCH_SLEEP_INTERVAL = os.getenv('CR_WATCH_SLEEP_INTERVAL')
    WATCH_RESUME_STATE   = os.getenv('CR_WATCH_RESUME_STATE')
    WATCH_CANCEL_STATE   = os.getenv('CR_WATCH_CANCEL_STATE')
    TASK_NAME            = os.getenv('CR_TASK_NAME')
    ARGO_PROGRESS_FILE   = os.getenv('ARGO_PROGRESS_FILE')

    log_format = "%(asctime)s:%(levelname)s:%(name)s.%(funcName)s: %(message)s"
    logging.basicConfig(format = log_format, level = LOG_LEVEL.upper())

    logging.info("Starting ServiceNow plugin for Codefresh")
    logging.debug("ACTION: %s", ACTION)
    logging.debug("DATA: %s", DATA)

    checkUser(USER)

    if ACTION == "createcr":
        # Used only later in the callback but want to check for error early
        checkConflictPolicy(POLICY)

        if STD_NAME:
            cr_number=createStandardChangeRequest(user=USER,
                standardName=STD_NAME,
                password=PASSWORD,
                baseUrl=getBaseUrl(instance=INSTANCE),
                data=DATA
            )
        else:
            cr_number=createChangeRequest(user=USER,
                password=PASSWORD,
                baseUrl=getBaseUrl(instance=INSTANCE),
                data=DATA
            )
            if not polling:
                checkToken(TOKEN)
                callback(user=USER,
                    password=PASSWORD,
                    baseUrl=getBaseUrl(instance=INSTANCE),
                    number=cr_number,
                    token=TOKEN,
                    cf_build_id=os.getenv('WORKFLOW_NAME'),
                    policy=POLICY
                )
    elif ACTION == "closecr":
        CR_SYSID= os.getenv('CR_SYSID')
        CODE=os.getenv('CR_CLOSE_CODE')
        NOTES=os.getenv('CR_CLOSE_NOTES')
        checkSysid(CR_SYSID)

        closeChangeRequest(
            user=USER,
            password=PASSWORD,
            baseUrl=getBaseUrl(instance=INSTANCE),
            sysid=os.getenv('CR_SYSID'),
            code=CODE,
            notes=NOTES,
            data=DATA
        )
    elif ACTION == "watchcr":
        CR_SYSID= os.getenv('CR_SYSID')
        checkSysid(CR_SYSID)

        watchChangeRequestState(
            user=USER,
            password=PASSWORD,
            baseUrl=getBaseUrl(instance=INSTANCE),
            sysid=CR_SYSID,
            timeout=WATCH_TIMEOUT,
            sleep_interval=WATCH_SLEEP_INTERVAL,
            resume_state=WATCH_RESUME_STATE,
            cancel_state=WATCH_CANCEL_STATE,
            argo_progress_file=ARGO_PROGRESS_FILE,
            task_name=TASK_NAME
        )
    elif ACTION == "updatecr":
        CR_SYSID= os.getenv('CR_SYSID')
        checkSysid(CR_SYSID)

        updateChangeRequest(
            user=USER,
            password=PASSWORD,
            baseUrl=getBaseUrl(instance=INSTANCE),
            sysid=CR_SYSID,
            data=DATA
        )
    else:
        logging.critical("Unknown action: %s. Allowed values are createCR, closeCR, watchCR or updateCR.", ACTION)
        sys.exit(1)

if __name__ == "__main__":
    main()
