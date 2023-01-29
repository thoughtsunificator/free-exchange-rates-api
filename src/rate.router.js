import express from "express"
import * as controller from "./rate.controller.js"

const router = express.Router()
router.get("/:from/:to", controller.getRate)
router.get("/:from/:to/:value", controller.convert)

export default router