import supertest from 'supertest'
import app from '../src/app.js'
import test from 'ava'
import MongoDB from "mongodb"
import { MongoMemoryServer } from 'mongodb-memory-server'

const request = supertest(app)
const mongoServer = await MongoMemoryServer.create()

const client = await MongoDB.MongoClient.connect(mongoServer.getUri(), { useUnifiedTopology: true })
const database = client.db("free-exchange-rates-api")
app.set("database", database)
app.set("client", client)
const dateEUR = new Date()
const dateUSD = new Date()
await database.collection("rates").insertMany([
    { from: "eur", to: "usd", value: 1.09, date: dateEUR },
    { from: "usd", to: "eur", value: 0.92, date: dateUSD }
])

test('/api', async t => {
    t.is((await request.get('/api')).status, 200)
})

test('/metrics', async t => {
    t.is((await request.get('/metrics')).status, 200)
})

test('/eur/usd', async t => {
    const response = await request.get('/eur/usd')
    t.is(response.status, 200)
    response.body = { ...response.body, date: new Date(response.body.date) }
    t.deepEqual(response.body, {
        date: dateEUR,
        from: 'eur',
        rate: 1.09,
        to: 'usd',
    })
})

test('/eur/usd/15', async t => {
    const response = await request.get('/eur/usd/15')
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

test('/usd/eur', async t => {
    const response = await request.get('/usd/eur')
    t.is(response.status, 200)
    response.body = { ...response.body, date: new Date(response.body.date) }
    t.deepEqual(response.body, {
        date: dateUSD,
        from: 'usd',
        rate: 0.92,
        to: 'eur',
    })
})

test('/usd/eur/15', async t => {
    const response = await request.get('/usd/eur/15')
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