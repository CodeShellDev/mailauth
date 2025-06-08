const express = require("express")
const router = express.Router()

const logger = require("../logger")
const config = require("../config")

const db = require("../db")

function GetID(req, insecure = false) {
	let result = req.user?.id

	const insecureRes = req.session?.mail?.id

	if (insecure && insecureRes) {
		result = insecureRes
	}

	return result
}

router.use(async (req, res, next) => {
	const id = GetID(req)

	if (id) {
		const user = await db.GetUserByID(id)

		res.locals.id = id
		res.locals.user = user
	}

	next()
})

router.get("/mailbox", async (req, res, next) => {
	if (!res.locals?.id) {
		const id = GetID(req, true)

		res.locals.user = await db.GetUserByID(id)
	}

	const user = res.locals.user

	if (!user) {
		return next()
	}

	return res.json(user)
})

router.post("/mailbox/edit", async (req, res, next) => {
	const user = res.locals.user

	if (!user) {
		return next()
	}

	const mailbox = req.body.email

	for (let i = 0; i < user.mailboxes.length; i++) {
		const email = user.mailboxes[i].email

		if (email === mailbox) {
			await db.UpdateBy(
				{ "mailboxes.email": email },
				{ "mailboxes.$.name": req.body.name }
			)

			return res.sendStatus(200)
		}
	}

	return next()
})

router.post("/mailbox/delete", async (req, res, next) => {
	const user = res.locals.user

	if (!user) {
		return next()
	}

	const mailbox = req.body.email

	for (let i = 0; i < user.mailboxes.length; i++) {
		const email = user.mailboxes[i].email

		if (email === mailbox) {
			await db.DeleteFromArrayBy(
				{ id: res.locals.id },
				{ mailboxes: { email: email } }
			)

			return res.sendStatus(200)
		}
	}

	return next()
})

router.post("/mailbox/create", async (req, res, next) => {
	if (!req.isAuthenticated()) {
		return res.redirect("/")
	}

	const newMailbox = {
		email: req.body.email,
		name: req.body.name,
	}

	if (!(await db.FindBy({ "mailboxes.email": newMailbox.email }))) {
		await db.AddToArray(
			{ id: res.locals.id },
			{
				mailboxes: newMailbox,
			}
		)

		return res.sendStatus(200)
	}

	return res.redirect("/")
})

router.post("/mailbox/select", async (req, res, next) => {
	const id = GetID(req, true)

	const user = await db.GetUserByID(id)

	if (user && req.body?.email) {
		req.session.mail.selected_mailbox = req.body.email

		return res.json({ url: `${config.PREFIX}/oauth/mail/mailbox` })
	}

	return next()
})

router.use((req, res, next) => {
	return res.sendStatus(500)
})

module.exports = router
