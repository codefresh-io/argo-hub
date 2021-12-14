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
    printf(f"   {name}: {value}")
    file=open("/tmp/{name}", "w")
    file.write(f"{name}={value}")
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
    data=response.json() # json.loads(response.text)
    CR_NUMBER=data["result"]["number"]
    CR_SYSID=data["result"]["sys_id"]
    exportVariable("CR_NUMBER", CR_NUMBER)
    exportVariable("CR_SYSID", CR_SYSID)

    if DEBUG:
        FULL_JSON=json.dumps(data, indent=2)
        print( "    Change Request full answer:\n" + FULL_JSON)



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
    else:
        printf("FATAL: Unknown action: {ACTION}. Allowed values are createCR, closeCR or updateCR.")
        sys.exit(1)


if __name__ == "__main__":
    main()
