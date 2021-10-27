# free-exchange-rates-api

A free to use API for currency rates.

## Good to know

- Pull rates from Google Search every 60 minutes.
- Each request is cached for 60 minutes.
- There are no app-based limit as far as I go so you can go ahead and query as much as you want.

## API

| Request type  |  Path                          | Response           |
| --------------|:-------------------------------|:------------------:|
| `GET`         | ``/:from/:to/rate/``           | ``Number`` as JSON |
| `GET`         | ``/:from/:to/:value/convert/`` | ``Number`` as JSON |
