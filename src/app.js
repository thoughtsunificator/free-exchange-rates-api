import express from "express"
import cors from "cors"
import fs from "fs"
import apicache from "apicache"
import promMid from "express-prometheus-middleware"
import swaggerUi from 'swagger-ui-express'

const swaggerDocument = JSON.parse(fs.readFileSync('./openapi.json'))
const app = express()

app.use(promMid({
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  requestDurationBuckets: [0.1, 0.5, 1, 1.5],
  requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
  responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
}))
app.use(apicache.middleware("60 minutes", (req, res) => res.statusCode === 200))
app.use(cors())

app.get("/:from/:to", async function (req, res) {
	try {
		const { from, to } = req.params
		const rate = await app.settings.database.collection("rates").findOne({
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
			res.status(404).json({ error: true, reason: "rate not found", code: 1 })
		}
	} catch(ex) {
		logger.error(ex)
		res.status(500).json({ error: true, code: 2 })
	}
})

app.get("/:from/:to/:value", async function (req, res) {
	try {
		const { value, from, to } = req.params
		if(isNaN(value)) {
			res.status(400).json({ error: true, reason: "value is not a number", code: 3 })
		} else {
			const rate = await app.settings.database.collection("rates").findOne({
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
				res.status(404).json({ error: true, reason: "rate not found", code: 1 })
			}
		}
	} catch(ex) {
		logger.error(ex)
		res.status(500).json({ error: true, code: 2 })
	}
})

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

export default app