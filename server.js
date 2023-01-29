import tracer from "tracer"
import config from "@thoughtsunificator/config-env"
import MongoDB from "mongodb"
import app from "./src/app.js"

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
app.set("database", database)

app.listen(config.PORT, function () {
	logger.info(`Ready and listening on ${config.PORT}`)
})
