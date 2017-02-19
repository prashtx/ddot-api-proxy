# One Bus Away API Proxy

## Setup 

Copy `sample.env` to `.env` and fill in with the correct variables

## Run

`node proxy.js`

## Rate limiting 

These configuration settings have sensible defaults but can be overridden by 
environment variables:

* `MAX_REQUESTS`: Default 30.
* `MS_TIMEOUT`: Default 7000 (7 seconds)

## Tests

`npm test`
