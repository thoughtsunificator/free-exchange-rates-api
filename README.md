# free-exchange-rates-api

A free to use API for currency rates.

## Good to know

- Rates are pulled from Google Search every 60 minutes.
- Each request is cached for 60 minutes.
- There are no app-based limit as far as I go so you can go ahead and query as much as you want.

## API

| Request type  |  Path                                | Description | Example
| --------------|:-------------------------------|:------------------:|:------------------:|
| `GET`         | ``/:from/:to``           |   Retrieves the rate of a currency pair |  https://free-exchange-rates-api.herokuapp.com/EUR/USD
```json
{ "from": "EUR",
  "to": "USD",
  "rate": 1.15993,
  "date": "2021-10-27T15:10:47.616Z"
}
```
| Request type  |  Path                                | Description | Example
| --------------|:-------------------------------|:------------------:|:------------------:|
| `GET`         | ``/:from/:to/:value``    | Convert currency pair  | https://free-exchange-rates-api.herokuapp.com/EUR/USD/15
```json
{
  "from": "EUR",
  "to": "USD",
  "value": 250, 
  "result": 289.98249999999996, 
  "date": "2021-10-27T15:10:47.616Z"
}
```
