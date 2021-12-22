import os
import sys
import json
import requests

API_NAMESPACE=409723

def getBaseUrl(instance):
    baseUrl = "%s/api" %(instance);
    if DEBUG:
        print("baseUrl: " + baseUrl)
    return baseUrl

def processCallbackResponse(response):
    print("Processing answer from CR creation REST call")
    print("Callback returned code %s" % (response.status_code))
    if (response.status_code != 200 and response.status_code != 201):
        print("Callback creation failed with code %s" % (response.status_code))
        print("Error: " + response.text)
        sys.exit(response.status_code)

    print("Callback creation successful")

#
# export vaiable in /tmp to be used as output parameter
def exportVariable(name, value):
    print(f"   {name}: {value}")
    file=open(f"/tmp/{name}", "w")
    file.write(f"{value}")
    file.close()

def processCreateChangeRequestResponse(response):
    if DEBUG:
        print("Processing answer from CR creation REST call")
        print("  Change Request returned code %s" % (response.status_code))
    if (response.status_code != 200 and response.status_code != 201):
        print("  Change Request creation failed with code %s" % (response.status_code))
        print("  ERROR: " + response.text)
        sys.exit(response.status_code)

    print("  Change Request creation successful")
    data=response.json() 
    FULL_JSON=json.dumps(data, indent=2)
    CR_NUMBER=data["result"]["number"]
    CR_SYSID=data["result"]["sys_id"]
    exportVariable("CR_NUMBER", CR_NUMBER)
    exportVariable("CR_SYSID", CR_SYSID)
    exportVariable("CR_CREATE_JSON", FULL_JSON)

    # if DEBUG:
    #
    #     print( "  Change Request full answer:\n" + FULL_JSON)

#
# Call SNow REST API to create a new Change Request
# Fields required are pasted in the data
def createChangeRequest(user, password, baseUrl, data):

    if DEBUG:
        print("Entering createChangeRequest:")

    if (bool(data)):
        crBody=json.loads(data)
        if DEBUG:
            print("Data: " + data)
    else:
        crBody= {}
        if DEBUG:
            print("  Data: None")
    crBody["cf_build_id"] = os.getenv('CF_BUILD_ID')


    url="%s/now/table/change_request" % (baseUrl)

    if DEBUG:
        print(f"  URL: {url}")
        print(f"  User: {user}")
        print(f"  Body: {crBody}")

    resp=requests.post(url,
        json = crBody,
        headers = {"content-type":"application/json"},
        auth=(user, password))
    processCreateChangeRequestResponse(response=resp)

def processModifyChangeRequestResponse(response, action):

    if DEBUG:
        print("Processing answer from CR %s REST call" %(action))
        print("  %s Change Request returned code %s" % (action,response.status_code))
    if (response.status_code != 200 and response.status_code != 201):
        print("  %s Change Request creation failed with code %s" % (action, response.status_code))
        print("  ERROR: " + response.text)
        sys.exit(response.status_code)

    print("  %s Change Request successful" %(action))
    data=response.json() # json.loads(response.text)
    FULL_JSON=json.dumps(data, indent=2)

    if (action == "close" ):
        exportVariable("CR_CLOSE_JSON", FULL_JSON)
    elif (action == "update" ):
        exportVariable("CR_UPDATE_JSON", FULL_JSON)
    else:
        print("ERROR: action unknown. Should not be here. Error should have been caught earlier")

# Call SNow REST API to close a CR
# Fields required are pasted in the data
def closeChangeRequest(user, password, baseUrl, sysid, code, notes, data):
    if DEBUG:
        print("Entering closeChangeRequest:")
        print(f"DATA: {data}")
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
    if DEBUG:
        print("Entering updateChangeRequest:")
        print(f"DATA: {data}")
    if (bool(data)):
        crBody=json.loads(data)
    else:
        crBody= {}
        print("WARNING: CR_DATA is empty. What are you updating exactly?")

    url="%s/now/table/change_request/%s" % (baseUrl, sysid)
    if DEBUG:
        print(f"  update CR URL: {url}")
    resp=requests.patch(url,
        json = crBody,
        headers = {"content-type":"application/json"},
        auth=(user, password))
    processModifyChangeRequestResponse(response=resp, action="update")


def checkSysid(sysid):
    if DEBUG:
        print("Entering checkSysid: ")
        print("  CR_SYSID: %s" % (sysid))

    if ( sysid == None ):
        print("FATAL: CR_SYSID is not defined.")
        sys.exit(1)

def main():
    global DEBUG

    ACTION   = os.getenv('ACTION').lower()
    USER     = os.getenv('SN_USER')
    PASSWORD = os.getenv('SN_PASSWORD')
    INSTANCE = os.getenv('SN_INSTANCE')
    DATA     = os.getenv('CR_DATA')
    DEBUG    = True if os.getenv('DEBUG', "false").lower() == "true" else False

    if DEBUG:
        print("Starting ServiceNow plugin for Codefresh")
        print(f"  ACTION: {ACTION}")
        print(f"  DATA: {DATA}")
        print("---")

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
        print(f"FATAL: Unknown action: {ACTION}. Allowed values are createCR, closeCR or updateCR.")
        sys.exit(1)

if __name__ == "__main__":
    main()
