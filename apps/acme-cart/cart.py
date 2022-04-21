#!/usr/bin/python

# general imports
import json
import os
import time
# Logging initialization
from logging.config import dictConfig

import opentracing
import sentry_sdk

from lib.tracing import init_tracer

# sentry_sdk.init("https://c0f58a327f2c4cd8b29e8cd0a606f0e9@sentry.io/1722363")

dictConfig({
    'version': 1,
    'formatters': {'default': {
        'format': '[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
    }},
    'handlers': {'wsgi': {
        'class': 'logging.StreamHandler',
        'stream': 'ext://flask.logging.wsgi_errors_stream',
        'formatter': 'default'
    }},
    'root': {
        'level': 'DEBUG',
        'handlers': ['wsgi'],
        'propagate': True,
    }
})

# set variables with env variables
from os import environ
from azure.keyvault.secrets import SecretClient
from azure.identity import DefaultAzureCredential

if environ.get('REDIS_HOST') is not None:
    if os.environ['REDIS_HOST'] != "":
        redishost = os.environ['REDIS_HOST']
    else:
        redishost = 'localhost'
else:
    redishost = 'localhost'

if environ.get('REDIS_PORT') is not None:
    if os.environ['REDIS_PORT'] != "":
        redisport = os.environ['REDIS_PORT']
    else:
        redisport = 6380
else:
    redisport = 6380

if environ.get('REDIS_PASSWORD') is not None:
    if os.environ['REDIS_PASSWORD'] != "":
        redispassword = os.environ['REDIS_PASSWORD']
    else:
        redispassword = None
else:
    redispassword = None

if environ.get('CART_PORT') is not None:
    if os.environ['CART_PORT'] != "":
        cartport = os.environ['CART_PORT']
    else:
        cartport = 5000
else:
    cartport = 5000

if environ.get('AUTH_URL') is not None:
    if os.environ['AUTH_URL'] != "":
        auth_url = os.environ['AUTH_URL']
    else:
        auth_url = ""
else:
    auth_url = ""

if environ.get('AUTH_MODE') is not None:
    if os.environ['AUTH_MODE'] != "":
        authmode = int(os.environ['AUTH_MODE'])
        print("user service is ", authmode)
    else:
        authmode = 1
else:
    authmode = 1

if environ.get('INSTRUMENTATION_KEY') is not None:
    if os.environ['INSTRUMENTATION_KEY'] != "":
        instrumentationKey = os.environ['INSTRUMENTATION_KEY']
    else:
        instrumentationKey = ''
else:
    instrumentationKey = ''

if environ.get('REDIS_CONNECTIONSTRING') is not None:
    if os.environ['REDIS_CONNECTIONSTRING'] != "":
        redisConnStr = str(os.environ['REDIS_CONNECTIONSTRING'])
    else:
        redisConnStr = ''
else:
    redisConnStr = ''

if environ.get('KEYVAULT_URI') is not None:
    if os.environ['KEYVAULT_URI'] != "":
        keyvaultUri = os.environ['KEYVAULT_URI']
        credential = DefaultAzureCredential()
        client = SecretClient(vault_url=keyvaultUri, credential=credential)
        redisConnStr = client.get_secret('CART-REDIS-CONNECTION-STRING').value


# Uncomment below to turnon statsd
# from statsd import StatsClient
# statsd = StatsClient(host='localhost',
#                     port=8125,
#                     prefix='fitcycle-api-server',
#                     maxudpsize=512)

# initializing requests
import requests

# initializing flask
from flask import render_template, jsonify
from flask import request
from flask_httpauth import HTTPTokenAuth
from sentry_sdk.integrations.flask import FlaskIntegration
from flask import Flask
from opencensus.ext.azure.trace_exporter import AzureExporter
from opencensus.ext.flask.flask_middleware import FlaskMiddleware
from opencensus.trace.samplers import ProbabilitySampler

app = Flask(__name__)


def set_cloud_role(envelope):
    envelope.tags['ai.cloud.role'] = 'cart-service'


if instrumentationKey != "":
    middleware = FlaskMiddleware(
        app,
        exporter=AzureExporter(connection_string=instrumentationKey),
        sampler=ProbabilitySampler(rate=1.0),
    )
    middleware.exporter.add_telemetry_processor(set_cloud_role)

app.debug = True
auth = HTTPTokenAuth('Bearer')

sentry_sdk.init(
    dsn="https://c0f58a327f2c4cd8b29e8cd0a606f0e9@sentry.io/1722363",
    integrations=[FlaskIntegration()]
)

cart_tracer = init_tracer('cart')
# flask_tracer = FlaskTracing(opentracing_tracer, True, app)


# initializing redis connections on localhost and port 6379
# If error terminates process- entire cart is shut down

import redis

# import redis_opentracing


try:
    if redisConnStr != "":
        rConn = redis.from_url(redisConnStr)
    else:
        if redispassword is not None:
            app.logger.info('initiating redis connection with password %s', redispassword)
            rConn = redis.StrictRedis(host=redishost, port=redisport, password=redispassword, db=0, ssl=True)
        else:
            app.logger.info('initiating redis connection with no password %s', redispassword)
            rConn = redis.StrictRedis(host=redishost, port=redisport, password=None, db=0)
    app.logger.info('initiated redis connection %s', rConn)
    rConn.ping()
    app.logger.info('Connected to redis')
except Exception as ex:
    app.logger.error('Error for redis connection %s', ex)
    exit('Failed to connect, terminating')


# redis_opentracing.init_tracing(cart_tracer)

# errorhandler for specific responses
class FoundIssue(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv


@auth.verify_token
def verify_token(token):
    global authmode

    headers = {'content-type': 'application/json'}
    verify_token_url = auth_url + "/verify-token"
    login_url = auth_url + "/login"

    app.logger.info("user service mode in verify_token is %s", authmode)
    if authmode == 2:
        print("using local version of user for test - getting token")

        data1 = json.dumps({"username": "eric", "password": "vmware1!"})

        r = requests.post(login_url, headers=headers, data=data1)

        if r.status_code == 200:
            verify_token_payload = json.dumps({"access_token": json.loads(r.content)["access_token"]})
            r = requests.post(verify_token_url, headers=headers, data=verify_token_payload)
            if r.status_code == 200:
                app.logger.info('Authorized %s', json.loads(r.content)["message"])
                return True
            else:
                app.logger.info('Un-authorized %s', json.loads(r.content)["message"])
                return False
        else:
            app.logger.info('Bad user or password %s', json.loads(r.content)["message"])
            return False

    elif authmode == 1:
        if token == "":
            app.logger.info("No Bearer token sent")
            return False
        else:
            verify_token_payload = json.dumps({"access_token": token})
            r = requests.post(verify_token_url, headers=headers, data=verify_token_payload)
            if r.status_code == 200:
                app.logger.info('Authorized %s', str(r.content))
                return True
            else:
                app.logger.info('Un-authorized %s', str(r.content))
                return False

    else:
        return True

    return False


#    if token == '':
#        app.logger.info('No Authorization Token available or in wrong format')
#        return False
#    else:
#        token="eyJhbGciOiJIUzI1NiIsImtpZCI6InNpZ25pbl8xIiwidHlwIjoiSldUIn0.eyJVc2VybmFtZSI6ImVyaWMiLCJleHAiOjE1Nzg5NDM4NjIsInN1YiI6IjVlMWNiZGM3ZjNkNDkzNmYxMDY0NTZhZiJ9.-RfrYegtYWsF_Y0yzXlBri1PetwNAmAxOt_1WcFhq8M"
#        url="http://localhost:8081/verify-token"
#        data=json.dumps('access_token':token)
#        print("Token is:", token)
#        return True

#    return False


@app.errorhandler(FoundIssue)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


# initialization of redis with fake data from the San Francisco legal offices of Shri, Dan and Bill SDB.
def insertData():
    app.logger.info('inserting data')

    rConn.flushall()

    keys = ['bill', 'dan', 'shri']

    data = [
        {'itemid': 'sdfsdfsfs', 'name': 'fitband', 'description': 'fitband for any age - even babies', 'quantity': 1,
         'price': 4.5},
        {'itemid': 'sfsdsda3343', 'name': 'redpant', 'description': 'the most awesome redpants in the world',
         'quantity': 1, 'price': 400},
    ]

    payload = json.dumps(data)

    for x in keys:
        rConn.set(x, payload)


# Gets all items from a specific userid
def getitems(userid, spanC):
    #    redis_opentracing.init_tracing(cart_tracer, trace_all_classes=False)

    functionName = '/cart/getItems/function'

    with cart_tracer.start_span(functionName, child_of=spanC) as span:
        app.logger.info('/cart/getItems')

        with cart_tracer.start_span('/redis/extract/get', child_of=span) as redis_span:
            if rConn.exists(userid):
                unpacked_data = json.loads(rConn.get(userid).decode('utf-8'))
                app.logger.info('got data')
            else:
                app.logger.info('empty - no data for key %s', userid)
                unpacked_data = 0

    return unpacked_data


# convert string to number
def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False


# http call to gets all Items from a cart (userid)
# If successful this returns the cart and items, if not successfull (the user id is non-existant) - 204 returned

# @statsd.timer('getCartItems')
@app.route('/cart/items/<userid>', methods=['GET'])
@auth.login_required
def getCartItems(userid):
    span_ctx = cart_tracer.extract(opentracing.Format.HTTP_HEADERS, carrier=request.headers)
    app.logger.info('the request headers are %s', str(request.headers))
    functionName = '/cart/items'
    returnValue = '200'
    if span_ctx is None:
        app.logger.info('there is no context being passed for tracing or tracing if off')
    else:
        app.logger.info('there is context being passed %s', str(span_ctx))

    with cart_tracer.start_span(functionName, child_of=span_ctx) as span:

        span.set_tag("user", userid)
        app.logger.info('getting all items on cart for user %s', userid)
        PPTable = getitems(userid, span)
        if PPTable:
            packed_data = jsonify({"userid": userid, "cart": PPTable})
        else:
            app.logger.info('no items in cart found for %s', userid)
            output_message = "no cart found for " + userid
            packed_data = jsonify({"userid": userid, "cart": PPTable})
            returnValue = '204'

    return (packed_data, returnValue)


# gets total items in users cart
@app.route('/cart/items/total/<userid>', methods=['GET', 'POST'])
@auth.login_required
def cartItemsTotal(userid):
    span_ctx = cart_tracer.extract(opentracing.Format.HTTP_HEADERS, request.headers)

    functionName = '/cart/items/total'

    with cart_tracer.start_span(functionName, child_of=span_ctx) as span:
        span.set_tag("user", userid)
        app.logger.info('getting total for %s cart', userid)
        jsonobj = getitems(userid, span)

        keylist = []
        for item in jsonobj:
            keylist.append(list(item.keys())[0])

        keyindex = 0
        total = 0

        while keyindex < len(jsonobj):
            quantity = jsonobj[keyindex]['quantity']
            if is_number(quantity):
                total = total + float(quantity)
            else:
                total = total + 0
            keyindex += 1

        app.logger.info("The total number of items is %s", str(total))
        totaljson = {"userid": userid, "cartitemtotal": total}

    return jsonify(totaljson)


# http call to get all carts and their values
# @statsd.timer('getAllCarts')
@app.route('/cart/all', methods=['GET'])
@auth.login_required
def getAllCarts():
    span_ctx = cart_tracer.extract(opentracing.Format.HTTP_HEADERS, request.headers)

    functionName = 'cart/all'

    with cart_tracer.start_span(functionName, child_of=span_ctx) as span:
        app.logger.info('getting carts')

        carts = []
        cart = {}

        for x in rConn.keys():
            cleankey = x.decode('utf-8')
            cart['id'] = cleankey
            cart['cart'] = json.loads(rConn.get(cleankey).decode('utf-8'))
            carts.append(cart)
            cart = {}

    return jsonify({'all carts': carts})


# http call to add an item - if user id non-existant - this will add the user into the database or it will concatenate the item to the existing carts
# example curl call to test: curl --header "Content-Type: application/json" --request POST --data '{"mytext":"xyz", "idname":"1234"}' http://34.215.155.50:5000/additem/bill
# If add is positive returns the userid
# @statsd.timer('addItem')
@app.route('/cart/item/add/<userid>', methods=['GET', 'POST'])
@auth.login_required
def addItem(userid):
    span_ctx = cart_tracer.extract(opentracing.Format.HTTP_HEADERS, request.headers)

    functionName = '/cart/items/add'

    with cart_tracer.start_span(functionName, child_of=span_ctx) as span:

        span.set_tag("userid", userid)

        content = request.json

        app.logger.info('the content to add is %s', content)

        jsonobj = getitems(userid, span)

        if (jsonobj):

            keyindex = 0
            while keyindex < len(jsonobj):
                if (jsonobj[keyindex]['itemid'] == content['itemid']):
                    jsonobj[keyindex]['quantity'] = int(jsonobj[keyindex]['quantity']) + int(content['quantity'])
                    keyindex = len(jsonobj) + 1
                    payload = json.dumps(jsonobj)
                    try:
                        app.logger.info('inserting cart for %s with following contents %s', userid, json.dumps(content))
                        rConn.set(userid, payload)
                    except Exception as e:
                        app.logger.error('Could not insert data %s into redis, error is %s', json.dumps(content), e)
                else:
                    keyindex += 1

            if keyindex <= len(jsonobj):
                jsonobj.append(content)
                payload = json.dumps(jsonobj)
                try:
                    app.logger.info('inserting cart for %s with following contents %s', userid, json.dumps(content))
                    rConn.set(userid, payload)
                except Exception as e:
                    app.logger.error('Could not insert data %s into redis, error is %s', json.dumps(content), e)

        else:
            payload = []
            payload.append(content)
            app.logger.info("added to payload for new insert %s", json.dumps(payload))
            try:
                rConn.set(userid, json.dumps(payload))
            except Exception as e:
                app.logger.error('Could not insert data %s into redis, error is %s', json.dumps(content), e)

    return jsonify({"userid": userid})


# Call to modify entire cart
#
# Must be in following format
#    "cart": [
#        {
#            "description": "red is awesome",
#            "itemid": "250",
#            "name": "redpants",
#            "price": 100,
#            "quantity": 22
#        },
#        {
#            "description": "blue is better than red",
#            "itemid": "7943xxx3659",
#            "name": "bluepants",
#            "price": 10,
#            "quantity": 12
#        }
#    ]
# }
#########


@app.route('/cart/modify/<userid>', methods=['GET', 'POST'])
@auth.login_required
def replaceCart(userid):
    span_ctx = cart_tracer.extract(opentracing.Format.HTTP_HEADERS, request.headers)

    functionName = '/cart/modify'

    with cart_tracer.start_span(functionName, child_of=span_ctx) as span:
        span.set_tag("userid", userid)

        content = request.json

        app.logger.info('the content to modify is %s', content)

        jsonobj = getitems(userid, span)

        payload = []
        for item in content['cart']:
            payload.append(item)

        app.logger.info("added to payload for new insert %s", json.dumps(payload))
        try:
            rConn.set(userid, json.dumps(payload))
        except Exception as e:
            app.logger.error('Could not insert data %s into redis, error is %s', json.dumps(content), e)

    return jsonify({"userid": userid})


# clear item from cart
# minimum content must be {"itemid":"shjhjssr", "quantity":"x"}
@app.route('/cart/item/modify/<userid>', methods=['GET', 'POST'])
@auth.login_required
def deleteItem(userid):
    span_ctx = cart_tracer.extract(opentracing.Format.HTTP_HEADERS, request.headers)

    functionName = '/cart/items/modify'

    with cart_tracer.start_span(functionName, child_of=span_ctx) as span:
        span.set_tag("userid", userid)

        content = request.json

        app.logger.info('the item to delete is %s', content)

        jsonobj = getitems(userid, span)
        if (jsonobj):
            keyindex = 0
            while keyindex < len(jsonobj):
                if (jsonobj[keyindex]['itemid'] == content['itemid']) and (content['quantity'] == 0):
                    del jsonobj[keyindex]
                    payload = json.dumps(jsonobj)
                    try:
                        app.logger.info('removing item for %s with following contents %s', userid, json.dumps(content))
                        rConn.set(userid, payload)
                    except Exception as e:
                        app.logger.error('Could not remove data %s into redis, error is %s', json.dumps(content), e)
                    keyindex = len(jsonobj)
                elif (jsonobj[keyindex]['itemid'] == content['itemid']):
                    jsonobj[keyindex]['quantity'] = content['quantity']
                    payload = json.dumps(jsonobj)
                    try:
                        app.logger.info('modifying cart for %s with following contents %s', userid, json.dumps(content))
                        rConn.set(userid, payload)
                        app.logger.info('finished setting %s with following contents %s', userid, json.dumps(content))
                    except Exception as e:
                        app.logger.error('Could not modify cart %s into redis, error is %s', json.dumps(content), e)
                    keyindex = len(jsonobj)
                else:
                    keyindex += 1
        else:
            app.logger.info('no items in cart found for %s', userid)
            output_message = "no cart found for " + userid
            raise FoundIssue(str(output_message), status_code=204)

    return jsonify({"userid": userid})


# clear cart
@app.route('/cart/clear/<userid>', methods=['GET', 'POST'])
@auth.login_required
def clearCart(userid):
    span_ctx = cart_tracer.extract(opentracing.Format.HTTP_HEADERS, request.headers)

    functionName = '/cart/clear'

    with cart_tracer.start_span(functionName, child_of=span_ctx) as span:
        span.set_tag("userid", userid)

        try:
            app.logger.info("clearing cart for %s", userid)
            rConn.delete(userid)
        except Exception as e:
            app.logger.error('Could not delete %s cart due to %s', userid, e)
            raise FoundIssue(str(e), status_code=500)
    #        return('',500)

    return ('', 200)


# placeholder for call to order
@app.route('/order/userid')
def order(userid):
    return render_template('hello.html')


# get total amount in users cart
@app.route('/cart/total/<userid>', methods=['GET', 'POST'])
@auth.login_required
def cartTotal(userid):
    span_ctx = cart_tracer.extract(opentracing.Format.HTTP_HEADERS, request.headers)

    functionName = 'carttotal'

    with cart_tracer.start_span(functionName, child_of=span_ctx) as span:
        span.set_tag("userid", userid)

        app.logger.info('getting total for %s cart', userid)

        jsonobj = getitems(userid, span)

        keylist = []
        for item in jsonobj:
            keylist.append(list(item.keys())[0])

        keyindex = 0
        total = 0

        while keyindex < len(jsonobj):
            quantity = jsonobj[keyindex]['quantity']
            price = jsonobj[keyindex]['price']
            #        quantity=jsonobj[keyindex][keylist[keyindex]]['quantity']
            #        price=jsonobj[keyindex][keylist[keyindex]]['price']
            if is_number(quantity) and is_number(price):
                total = total + (float(quantity) * float(price))
            else:
                total = total + 0
            keyindex += 1

        app.logger.info("The total calculated is %s", str(total))

        totaljson = {"userid": userid, "carttotal": total}

    return jsonify(totaljson)


# baseline route to check is server is live ;-)
@app.route('/')
def hello_world(name=None):
    return render_template('hello.html')


@app.route('/env', methods=['GET'])
def get_env():
    return jsonify({'redis_info': rConn.info()})


if __name__ == '__main__':
    insertData()  # initialize the database with some baseline
    app.run(host='0.0.0.0', port=cartport)
    time.sleep(2)
    cart_tracer.close()
#    redis_tracer.close()
