import supertest from 'supertest'
import test from 'ava'
import MongoDB from "mongodb"
import { MongoMemoryServer } from 'mongodb-memory-server'
import app_factory from '../src/app.js'

const dateEUR = new Date()
const dateUSD = new Date()

test.beforeEach(async t => {
    const app = app_factory()
    t.context.app = app
    t.context.request = supertest(app)
    const mongoServer = await MongoMemoryServer.create()
    const client = await MongoDB.MongoClient.connect(mongoServer.getUri(), { useUnifiedTopology: true }) 
    const database = client.db("free-exchange-rates-api")
    app.set("database", database)
    app.set("client", client)
    app.set("logger", (data) => console.log(data))
    await database.collection("rates").insertMany([
        { from: "eur", to: "usd", value: 1.09, date: dateEUR },
        { from: "usd", to: "eur", value: 0.92, date: dateUSD }
    ])
})

test('GET /eur/usd', async t => {
    const response = await t.context.request.get('/eur/usd')
    t.is(response.status, 200)
    response.body = { ...response.body, date: new Date(response.body.date) }
    t.deepEqual(response.body, {
        date: dateEUR,
        from: 'eur',
        rate: 1.09,
        to: 'usd',
    })
})

test('GET /eur/usd/15', async t => {
    const response = await t.context.request.get('/eur/usd/15')
    t.is(response.status, 200)
    response.body = { ...response.body, date: new Date(response.body.date) }
    t.deepEqual(response.body,    {
        date: dateEUR,
        from: 'eur',
        result: 16.35,
        to: 'usd',
        value: 15,
    })
})

test('GET /usd/eur', async t => {
    const response = await t.context.request.get('/usd/eur')
    t.is(response.status, 200)
    response.body = { ...response.body, date: new Date(response.body.date) }
    t.deepEqual(response.body, {
        date: dateUSD,
        from: 'usd',
        rate: 0.92,
        to: 'eur',
    })
})

test('GET /usd/eur/15', async t => {
    const response = await t.context.request.get('/usd/eur/15')
    t.is(response.status, 200)
    response.body = { ...response.body, date: new Date(response.body.date) }
    t.deepEqual(response.body, {
        date: dateUSD,
        from: 'usd',
        result: 13.8,
        to: 'eur',
        value: 15,
    })
})

test('GET /eur/whatever', async t => {
    const response = await t.context.request.get('/eur/whatever')
    t.is(response.status, 404)
    t.deepEqual(response.body, {
        error: true,
        reason: 'rate not found',
        code: 1,
    })
})