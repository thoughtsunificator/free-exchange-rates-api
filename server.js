import tracer from "tracer"
import express from "express"
import cors from "cors"
import MongoDB from "mongodb"
import apicache from "apicache"
import config from "@thoughtsunificator/config-env"

const consoleLogger = tracer.colorConsole({	format : "{{message}}" })

const logger = tracer.dailyfile({
	root: "./logs",
	maxLogFiles: 10,
	format: "{{timestamp}} {{message}}",
	dateformat: "HH:MM:ss",
	splitFormat: "yyyymmdd",
	allLogsFileName: "server",
	transport: function (data) {
		consoleLogger[data.title](data.output)
	}
})

logger.log("[database] Loading ...")
const client = await MongoDB.MongoClient.connect(config.DATABASE_URL, { useUnifiedTopology: true })
const database = client.db(config.DATABASE_NAME)
const collection = database.collection("rates")

const app = express()

app.use(apicache.middleware("60 minutes"))
app.use(cors())
app.use(express.static('public'))

app.get("/:from/:to", async function (req, res) {
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
			res.json({
				from,
				to,
				rate: rate.value,
				date: rate.date
			})
		} else {
			res.json({ error: true, reason: "rate not found", code: 1 })
		}
	} catch(ex) {
		logger.error(ex)
		res.json({ error: true, code: 2 })
	}
})

app.get("/:from/:to/:value", async function (req, res) {
	try {
		const { value, from, to } = req.params
		if(isNaN(value)) {
			res.json({ error: true, reason: "value is not a number", code: 3 })
		} else {
			const rate = await collection.findOne({
				from,
				to,
				date: {
					$gte: new Date(new Date().getTime() - ((5 * 60) * 60000))
				}
			})
			if(rate) {
				res.json({
					from,
					to,
					value: parseFloat(value),
					result: parseFloat(value * rate.value),
					date: rate.date
				})
			} else {
				res.json({ error: true, reason: "rate not found", code: 1 })
			}
		}
	} catch(ex) {
		logger.error(ex)
		res.json({ error: true, code: 2 })
	}
})

app.listen(config.PORT, function () {
	logger.info(`Ready and listening on ${config.PORT}`)
})
