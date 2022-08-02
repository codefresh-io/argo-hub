import json
import os
import requests
import sys
import subprocess
import base64
import urllib.parse

def run_command(full_command):
    proc = subprocess.Popen(full_command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=True)
    output = proc.communicate()
    print(output)
    if proc.returncode != 0:
        sys.exit(1)
    return b''.join(output).strip().decode()  # only save stdout into output, ignore stderr


def create_annotation_list(json_data):
    annotations = []
    annotation_list = ''
    for key, value in json_data.items():
        annotations.append("-l AQUA_CVE_COUNTS_{}={}".format(key.upper(), value))
        annotation_list = ' '.join(annotations)
    return annotation_list


def annotate_image(docker_image_id, annotation_list):

    annotate_image_exec = ("codefresh annotate image {} {}"
                           .format(docker_image_id,
                                   annotation_list
                                   )
                           )

    run_command(annotate_image_exec)


def main():
    aqua_host = os.getenv('AQUA_HOST')
    aqua_password =  os.getenv('AQUA_PASSWORD')
    aqua_username =  os.getenv('AQUA_USERNAME')
    cf_account = os.getenv('CF_ACCOUNT')
    registry = os.getenv('REGISTRY', cf_account) 
    image = os.getenv('IMAGE')
    tag = os.getenv('TAG')

    # Auth to Aqua Console
        # POST /api/v1/login HTTP/1.1
        # Accept: application/json
        # Content-Length: 47
        # Content-Type: application/json
        # Host: localhost:8080

        # {
        # "id": "administrator",
        # "password": "SuperSecret"
        # }

    aqua_login_endpoint = '{}/api/v1/login'.format(aqua_host)

    headers = {"Content-Type": "application/json"}

    r = requests.post(aqua_login_endpoint, json={'id':aqua_username,'password':aqua_password}, headers=headers)

    json_data = json.loads(r.text)

    jwt_token = json_data['token']

    headers = {"Authorization": "Bearer {}".format(jwt_token)}
    
    full_docker_image = '{}/{}'.format(cf_account, image)
    encoded_docker_image = urllib.parse.quote(full_docker_image, safe='')

    aqua_endpoint = '{}/api/v1/scanner/registry/{}/image/{}:{}'.format(aqua_host, registry, encoded_docker_image, tag)

    print(aqua_endpoint)

    # Initiate Aqua Scan on Console
        # POST /api/v1/scanner/registry/Docker%20Hub/image/mongo:latest/scan HTTP/1.1
        # Accept: application/json

    r = requests.post('{}/scan'.format(aqua_endpoint), headers=headers)
    json_data = json.loads(r.text)

    # Wait for Scan to Complete
        # GET /api/v1/scanner/registry/Docker%20Hub/image/mongo:latest/status HTTP/1.1
        # Accept: application/json

    status = False

    while not status:
        r = requests.get('{}/status'.format(aqua_endpoint), headers=headers)
        json_data = json.loads(r.text)
        if json_data['status'] == 'Scanned':
            status = True
        else:
            status = False

    # Get Scan Results
        # GET /api/v1/scanner/registry/Docker%20Hub/image/mongo:latest/scan_result
        # Accept: application/json

    r = requests.get('{}/scan_result'.format(aqua_endpoint), headers=headers)
    json_data = json.loads(r.text)

    annotation_list = create_annotation_list(json_data['cves_counts'])

    uri_docker_image = '{}~2F{}/{}'.format(cf_account, image.replace('/', '~2F'), tag)

    annotations = '-l AQUA_REPORT="{}/ng#!/app/images/{}/{}" {}'.format(aqua_host, registry, uri_docker_image, annotation_list)

    full_docker_image = '{}:{}'.format(image, tag)
    annotate_image(full_docker_image, annotations)

    disallowed_response = json_data['disallowed']

    if disallowed_response:
        print('DISALLOWED!!!')
        print('REASON: {}'.format(json_data['disallow_reason']))
        print('DESCRIPTION: {}'.format(json_data['disallow_description']))
        annotations = '-l DISALLOWED_REASON="{}" -l DISALLOWED_DESCRIPTION="{}" -l SECURITY_SCAN=false'.format(json_data['disallow_reason'], json_data['disallow_description'])
        annotate_image(full_docker_image, annotations)
        sys.exit(1)
    else:
        annotations = '-l SECURITY_SCAN=true'
        annotate_image(full_docker_image, annotations)
        sys.exit(0)


if __name__ == "__main__":
    main()
