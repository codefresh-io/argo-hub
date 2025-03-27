import os
import sys
import json
import requests
import logging
import urllib.parse

API_NAMESPACE=409723

def getBaseUrl(instance):
    baseUrl = "%s/api" %(instance);
    logging.debug("baseUrl: %s", baseUrl)
    return baseUrl

def processCallbackResponse(response):
    logging.info("Processing answer from CR creation REST call")
    logging.debug("Callback returned code %s",response.status_code)
    if (response.status_code != 200 and response.status_code != 201):
        logging.critical("Callback creation failed with code %s", response.status_code)
        logging.critical("%s", response.text)
        sys.exit(response.status_code)

    logging.info("Callback creation successful")

#
# export vaiable in /tmp to be used as output parameter
def exportVariable(name, value):
    print(f"   {name}: {value}")
    file=open(f"/tmp/{name}", "w")
    file.write(f"{value}")
    file.close()

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
    CR_NUMBER=data["result"]["number"]
    CR_SYSID=data["result"]["sys_id"]
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
        crBody=json.loads(data)
        logging.debug("Data: %s", data)
    else:
        crBody= {}
        logging.debug("  Data: None")
    crBody["cf_build_id"] = os.getenv('CF_BUILD_ID')


    url="%s/now/table/change_request" % (baseUrl)

    logging.debug("URL %s:",url)
    logging.debug("User: %s", user)
    logging.debug("Body: %s", crBody)

    resp=requests.post(url,
        json = crBody,
        headers = {"content-type":"application/json"},
        auth=(user, password))
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

# Call SNow REST API to create a new Standard Change Request
# Fields required are pasted in the data
def createStandardChangeRequest(user, password, baseUrl, data, standardName):
    logging.info("Creating a new Standard Change Request using '%s' template", standardName)
    encodedName=urllib.parse.quote_plus(standardName)

    url="%s/now/table/std_change_template?sysparm_query=sys_name=%s" % (baseUrl, encodedName)
    logging.debug("Standard Change URL %s:",url)
    resp=requests.get(url,
        headers = {"content-type":"application/json"},
        auth=(user, password))
    sysid=processSearchStandardTemplateResponse(name=standardName, response=resp)
    logging.info("Template found: %s", sysid)
    sys.exit(0)


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
    url="%s/now/table/change_request/%s" % (baseUrl, sysid)
    logging.debug("Closure complete data : %s", crBody)
    resp=requests.patch(url,
        json = crBody,
        headers = {"content-type":"application/json"},
        auth=(user, password))
    processModifyChangeRequestResponse(response=resp, action="close")

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

    url="%s/now/table/change_request/%s" % (baseUrl, sysid)
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
        logging.criticak("CR_SYSID is not defined.")
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
    ACTION   = os.getenv('ACTION', "createcr").lower()
    USER     = os.getenv('SN_USER')
    PASSWORD = os.getenv('SN_PASSWORD')
    INSTANCE = os.getenv('SN_INSTANCE')
    DATA     = os.getenv('CR_DATA')
    STD_NAME = os.getenv('STD_CR_TEMPLATE')
    TOKEN    = os.getenv('TOKEN')
    POLICY   = os.getenv('CR_CONFLICT_POLICY')
    LOG_LEVEL = os.getenv('LOG_LEVEL', "info").upper()

    log_format = "%(asctime)s:%(levelname)s:%(name)s.%(funcName)s: %(message)s"
    logging.basicConfig(format = log_format, level = LOG_LEVEL.upper())

    logging.info("Starting ServiceNow plugin for Codefresh")
    logging.debug("ACTION: %s", ACTION)
    logging.debug("DATA: %s", DATA)

    checkUser(USER)

    if ACTION == "createcr":
        # Used only later in the callback but eant to check for error early
        checkToken(TOKEN)
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
        logging.critical("Unknown action: %s. Allowed values are createCR, closeCR or updateCR.", ACTION)
        sys.exit(1)

if __name__ == "__main__":
    main()
