export async function getRate(req, res) {
    try {
        const { from, to } = req.params
        const rate = await req.app.settings.database.collection("rates").findOne({
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
        req.app.settings.logger.error(ex)
        res.status(500).json({ error: true, code: 2 })
    }
}

export async function convert(req, res) {
    try {
        const { value, from, to } = req.params
        if(isNaN(value)) {
            res.status(400).json({ error: true, reason: "value is not a number", code: 3 })
        } else {
            const rate = await req.app.settings.database.collection("rates").findOne({
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
        req.app.settings.logger.error(ex)
        res.status(500).json({ error: true, code: 2 })
    }
}