const express = require("express")
const router = express.Router()

router.get("/", (req, res, next) => {
	if (!req.isAuthenticated()) {
		return res.redirect("/oauth/app")
	}

	return res.render("home", {
		prefix: req.baseUrl,
	})
})

router.get("/select", async (req, res, next) => {
	return res.render("select", {
		prefix: req.baseUrl,
	})
})

module.exports = router
