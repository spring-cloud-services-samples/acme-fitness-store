#!/usr/bin/python
import os
import redis
from redislite import Redis
from os import environ
from credhub import credhub_secret
from distutils.util import strtobool

def redis_connection(logger):
    if environ.get('VCAP_SERVICES') not in (None, ''):
        redis_creds = credhub_secret(('p-redis', 'p.redis'))
        redis_host = redis_creds['host']
        redis_password = redis_creds['password']
        # Not every p-redis plan exposes a TLS port (e.g. shared-vm plans are plaintext-only);
        # use it when present, otherwise fall back to the plain port without TLS.
        redis_tls_port = redis_creds.get('tls_port')
        redis_port = redis_tls_port if redis_tls_port is not None else redis_creds['port']
        redis_tls = redis_tls_port is not None

        logger.info('initiating redis connection with password')
        redis_conn = redis.StrictRedis(host=redis_host, port=redis_port, password=redis_password, db=0, ssl=redis_tls)
    else:
        redis_conn_str = None
        redis_host = environ['REDIS_HOST'] if environ.get('REDIS_HOST') not in (None, '') else None
        redis_port = environ['REDIS_PORT'] if environ.get('REDIS_PORT') not in (None, '') else 6380
        redis_password = environ['REDIS_PASSWORD'] if environ.get('REDIS_PASSWORD') not in (None, '') else None
        tlsEnabledEnv = auth_url = environ['REDIS_TLS_ENABLED'] if environ.get('REDIS_TLS_ENABLED') not in (None, '') else 'true'
        tlsEnabled = strtobool(tlsEnabledEnv)
        logger.info('Redis TLS setting %s', tlsEnabled)
        if redis_conn_str not in (None, ''):
             logger.info('initiating redis connection using connection string')
             redis_conn = redis.from_url(redis_conn_str)
        elif redis_password is not None:
             logger.info('initiating redis connection with password')
             redis_conn = redis.StrictRedis(host=redis_host, port=redis_port, password=redis_password, db=0, ssl=tlsEnabled)
        elif redis_host not in (None, ''):
             logger.info('initiating redis connection with no password')
             redis_conn = redis.StrictRedis(host=redis_host, port=redis_port, password=None, db=0)
        else:
             logger.info('initiating redis connection with no host or password (using redislite)')
             redis_conn = Redis('redis.db')
    try:
        logger.info('initiated redis connection %s', redis_conn)
        redis_conn.ping()
        logger.info('Connected to redis')
        return redis_conn
    except Exception as ex:
        logger.error('Error for redis connection %s', ex)
        exit('Failed to connect, terminating')
