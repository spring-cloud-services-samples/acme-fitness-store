#!/usr/bin/python
from os import environ
import json
import requests

CREDHUB_URI = 'https://credhub.service.cf.internal:8844/api/v1/interpolate'
VCAP_SERVICES_KEY = 'VCAP_SERVICES'
CF_KEY_PATH = 'CF_INSTANCE_KEY'
CF_CERT_PATH = 'CF_INSTANCE_CERT'

def credhub_secret(key):
    # Marketplace service labels for the same offering have varied across foundations/eras
    # (e.g. "p-redis" vs "p.redis"), so accept either a single key or a list of candidates.
    if environ.get(VCAP_SERVICES_KEY) not in (None, ''):
        key_path = environ[CF_KEY_PATH]
        cert_path = environ[CF_CERT_PATH]
        vcap_services_json = json.loads(environ[VCAP_SERVICES_KEY])
        interpolated_vcap_services = requests.post(CREDHUB_URI,cert=(cert_path, key_path), verify='/etc/ssl/certs/ca-certificates.crt', json=vcap_services_json).json()
        for candidate in (key if isinstance(key, (list, tuple)) else (key,)):
            service_json = interpolated_vcap_services.get(candidate)
            if service_json not in (None, ''):
                return service_json[0]['credentials']
    return None
