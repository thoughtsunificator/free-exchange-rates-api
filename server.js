import tracer from "tracer"
import config from "@thoughtsunificator/config-env"
import MongoDB from "mongodb"
import app_factory from "./src/app.js"
import swaggerUi from 'swagger-ui-express'
import cors from "cors"
import fs from "fs"
import apicache from "apicache"
import promMid from "express-prometheus-middleware"

const swaggerDocument = JSON.parse(fs.readFileSync('./openapi.json'))

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
const app = app_factory()
app.set("database", database)
app.set("logger", logger)

app.use(cors())
app.use(promMid({
	metricsPath: '/metrics',
	collectDefaultMetrics: true,
	requestDurationBuckets: [0.1, 0.5, 1, 1.5],
	requestLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
	responseLengthBuckets: [512, 1024, 5120, 10240, 51200, 102400],
}))
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use(apicache.middleware("60 minutes", (req, res) => res.statusCode === 200))

app.listen(config.PORT, function () {
	logger.info(`Ready and listening on ${config.PORT}`)
})
