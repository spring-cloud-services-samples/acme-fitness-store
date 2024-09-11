# Cart


> A cart service, because what is a shop without a cart to put stuff in?

The goal of this specific service is to keep track of carts and items in the different carts.

## Prerequisites

There are different dependencies based on whether you want to run a built container, or build a new one.

### Build

* [Python 3.7.2 or higher](https://www.python.org/downloads/)
* [Pip](https://pip.pypa.io/en/stable/installing/)
* pyenv 
### Run

* [Docker](https://www.docker.com/docker-community)
* [Redis](https://hub.docker.com/r/bitnami/redis)

## Installation

### Source

A pyenv `.python-version` configuration file is provided.

You can configure a compatible environment using `pyenv` by running `pyenv install`.

To build the app as a stand-alone executable, run `pip install -r requirements.txt` to install the Python libraries and run `python3 cart.py` after.

By default, the app runs on port 5000 which is used by MacOS for airplay service. If you get a port conflict change the port to `5001` by setting the environment variable `CART_PORT=5001 ptthon3 cart.py`

## Usage

The **cart** service, either running inside a Docker container or as a stand-alone app, relies on the below environment variables:

* **REDIS_HOST**: The hostname or IP address to connect to the Redis server (defaults to `localhost`)
* **REDIS_PORT**: The port to connect to the Redis server (defaults to `6379`)
* **REDIS_PASSWORD**: The password to connect to Redis (defaults to `blank`)
* **CART_PORT**: The port number the cart service will listen to requests (defaults to `5000`)

The docker image of acme-cart can be built using the provided Dockerfile and the following command:

```bash
# Build the acme-cart image
docker build -t acme-cart .
```

The acme-cart image is based on the official Python image.

To run the acme-cart and the redis dependency for local test, use the `docker-compose` file: 

```bash
# docker-compose.yaml is provided in local-development folder
cd ../../local-development

# Run the acme-cart image and Redis container
docker compose up -d cart-redis-db cart-server
```

## API

### HTTP

#### `GET /cart/total/<userid>`

Get total amount in users cart

```bash
curl --request GET \
  --url http://localhost:8085/cart/total/dan
```

```json
{
  "carttotal": 804.5,
  "userid": "dan"
}
```

#### `POST /cart/item/modify/<userid>`

Update an item in the cart of a user

```bash
curl --request POST \
  --url http://localhost:8085/cart/item/modify/dan \
  --header 'content-type: application/json' \
  --data '{"itemid":"sfsdsda3343", "quantity":2}'
```

To modify the item in a cart, the input needs to contain an `itemid` and the new `quantity`

```json
{"itemid":"sfsdsda3343", "quantity":2}
```

A successful update will return the userid

```json
{
  "userid": "dan"
}
```

#### `POST /cart/modify/<userid>`

Modify the contents of a cart

```bash
curl --request POST \
  --url http://localhost:8085/cart/modify/dan \
  --header 'content-type: application/json' \
  --data '{
  "cart": [
    {
      "description": "fitband for any age - even babies",
      "itemid": "sdfsdfsfs",
      "name": "fitband",
      "price": 4.5,
      "quantity": 1
    },
    {
      "description": "the most awesome redpants in the world",
      "itemid": "sfsdsda3343",
      "name": "redpant",
      "price": 400,
      "quantity": 1
    }
  ],
  "userid": "dan"
}'
```

To replace the entire cart, or create a new cart for a user, send a cart object

```json
{
  "cart": [
    {
      "description": "fitband for any age - even babies",
      "itemid": "sdfsdfsfs",
      "name": "fitband",
      "price": 4.5,
      "quantity": 1
    }
  ],
  "userid": "dan"
}
```

A successful update will return the userid

```json
{
  "userid": "dan"
}
```

#### `POST /cart/item/add/<userid>`

Add item to cart

```bash
curl --request POST \
  --url http://localhost:8085/cart/item/add/shri \
  --header 'content-type: application/json' \
  --data '{"itemid":"xyz", "quantity":3}'
```

To add the item in a cart, the input needs to contain an `itemid` and the `quantity`

```json
{"itemid":"xyz", "quantity":3}
```

A successful update will return the userid

```json
{
  "userid": "shri"
}
```

#### `GET /cart/items/total/<userid>`

Get the total number of items in a cart

```bash
curl --request GET \
  --url http://localhost:8085/cart/items/total/shri
```

```json
{
  "cartitemtotal": 5.0,
  "userid": "shri"
}
```

#### `GET /cart/clear/<userid>`

Clear all items from the cart

```bash
curl --request GET \
  --url http://localhost:8085/cart/clear/dan
```

```text
<no payload returned>
```

#### `GET /cart/items/<userid>`

Get all items in a cart

```bash
curl --request GET \
  --url http://localhost:8085/cart/items/dan
```

```json
{
  "cart": [
    {
      "description": "fitband for any age - even babies",
      "itemid": "sdfsdfsfs",
      "name": "fitband",
      "price": 4.5,
      "quantity": 1
    },
    {
      "description": "the most awesome redpants in the world",
      "itemid": "sfsdsda3343",
      "name": "redpant",
      "price": 400,
      "quantity": 1
    }
  ],
  "userid": "dan"
}
```

#### `GET /cart/all`

Get all the carts

```bash
curl --request GET \
  --url http://localhost:8085/cart/all
```

```json
{
  "all carts": [
    {
      "cart": [
        {
          "description": "fitband for any age - even babies",
          "itemid": "sdfsdfsfs",
          "name": "fitband",
          "price": 4.5,
          "quantity": 1
        },
        {
          "description": "the most awesome redpants in the world",
          "itemid": "sfsdsda3343",
          "name": "redpant",
          "price": 400,
          "quantity": 1
        }
      ],
      "id": "shri"
    }
  ]
}
```

## License

See the [LICENSE](../../LICENSE) file in the repository
