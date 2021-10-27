# free-exchange-rates-api

A free to use API for currency rates.

## Good to know

- Rates are pulled from Google Search every 60 minutes.
- Each request is cached for 60 minutes.
- There are no app-based limit as far as I go so you can go ahead and query as much as you want.

## API

| Request type  |  Path                        | Response           | Description | Example
| --------------|:-------------------------------|:------------------:|:------------------:|:------------------:|
| `GET`         | ``/:from/:to``           | ``Number`` as JSON | Retrieves the rate of a currency pair |  https://free-exchange-rates-api.herokuapp.com/EUR/USD
| `GET`         | ``/:from/:to/:value``   | ``Number`` as JSON | Convert currency pair  | https://free-exchange-rates-api.herokuapp.com/EUR/USD/15
