import express from "express"
import rateRouter from "./rate.router.js"

export default function() {

	const app = express()
	app.use(rateRouter)
	return app
}