const tracer = require("tracer")
const express = require("express")
const cors = require("cors")
const MongoDB = require("mongodb")
const apicache = require("apicache")

const config = require("./lib/config.js")

const consoleLogger = tracer.colorConsole({	format : "{{message}}" })

const tracerOptions = {
	root: "./logs",
	maxLogFiles: 10,
	format: "{{timestamp}} {{message}}",
	dateformat: "HH:MM:ss",
	splitFormat: "yyyymmdd",
	allLogsFileName: "server"
}

if(process.env.NODE_ENV !== "production") {
	tracerOptions.transport = function (data) {
		consoleLogger[data.title](data.output)
	}
}

const logger = tracer.dailyfile(tracerOptions);

logger.log("[database] Loading ...")
const client = await MongoDB.MongoClient.connect(config.DATABASE_URL, { useUnifiedTopology: true })
const database = client.db(config.DATABASE_NAME)
const collection = database.collection("rates")

const app = express()

app.use(apicache.middleware("60 minutes"))
app.use(cors())

app.get("/:from/:to/rate", async function (req, res) {
	try {
		const { from, to } = req.params
		const rate = await collection.findOne({
			from,
			to,
			date: {
				$gte: new Date(new Date().getTime() - ((5 * 60) * 60000))
			}
		})
		if(rate) {
			res.json(rate.value)
		} else {
			res.json({ error: true, reason: "rate not found", code: 1 })
		}
	} catch(ex) {
		logger.error(ex)
		res.json({ error: true, code: 2 })
	}
})

app.get("/:from/:to/:value/convert", async function (req, res) {
	try {
		const { value, from, to } = req.params
		const rate = await collection.findOne({
			from,
			to,
			date: {
				$gte: new Date(new Date().getTime() - ((5 * 60) * 60000))
			}
		})
		if(rate) {
			res.json(new Number(value * rate.value).toFixed(2))
		} else {
			res.json({ error: true, reason: "rate not found", code: 1 })
		}
	} catch(ex) {
		logger.error(ex)
		res.json({ error: true, code: 2 })
	}
})

app.listen(config.PORT, function () {
	logger.info(`Ready and listening on ${config.PORT}`)
})