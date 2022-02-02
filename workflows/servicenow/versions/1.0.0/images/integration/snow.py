import os
import sys
import json
import requests
import logging

API_NAMESPACE=409723

def getBaseUrl(instance):
    baseUrl = "%s/api" %(instance);
    logging.debug("baseUrl: %s", baseUrl)
    return baseUrl

def processCallbackResponse(response):
    logging.info("Processing answer from CR creation REST call")
    logging.debug("Callback returned code %s",response.status_code)
    if (response.status_code != 200 and response.status_code != 201):
        logging.critical("Callback creation failed with code %s", esponse.status_code)
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
        logging.critical("Change Request creation failed with code %s",response.status_code)
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

    # if LOGLEVEL:
    #
    #     print( "  Change Request full answer:\n" + FULL_JSON)

#
# Call SNow REST API to create a new Change Request
# Fields required are pasted in the data
def createChangeRequest(user, password, baseUrl, data):

    logging.debug("Entering createChangeRequest:")

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
    processCreateChangeRequestResponse(response=resp)

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
    logging.debug("Entering closeChangeRequest:")
    logging.debug("DATA: %s", data)
    if (bool(data)):
        crBody=json.loads(data)
    else:
        crBody= {}
    crBody["state"] = 3
    crBody["close_code"] = code
    crBody["close_notes"] = notes
    url="%s/now/table/change_request/%s" % (baseUrl, sysid)
    resp=requests.patch(url,
        json = crBody,
        headers = {"content-type":"application/json"},
        auth=(user, password))
    processModifyChangeRequestResponse(response=resp, action="close")

# Call SNow REST API to update a CR
# Fields required are pasted in the data
def updateChangeRequest(user, password, baseUrl, sysid, data):
    logging.debug("Entering updateChangeRequest:")
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


def checkSysid(sysid):
    logging.debug("Entering checkSysid: ")
    logging.debug("CR_SYSID: %s", sysid)

    if ( sysid == None ):
        logging.criticak("CR_SYSID is not defined.")
        sys.exit(1)

def main():
    ACTION   = os.getenv('ACTION', "createcr").lower()
    USER     = os.getenv('SN_USER')
    PASSWORD = os.getenv('SN_PASSWORD')
    INSTANCE = os.getenv('SN_INSTANCE')
    DATA     = os.getenv('CR_DATA')
    LOGLEVEL = os.getenv('LOGLEVEL', "info").upper()

    log_format = "%(asctime)s:%(levelname)s:%(name)s.%(funcName)s: %(message)s"
    logging.basicConfig(format = log_format, level = LOGLEVEL.upper())

    logging.info("Starting ServiceNow plugin for Codefresh")
    logging.debug("ACTION: %", ACTION)
    logging.debug("DATA: %s", DATA)


    if ACTION == "createcr":
        createChangeRequest(user=USER,
            password=PASSWORD,
            baseUrl=getBaseUrl(instance=INSTANCE),
            data=DATA
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
