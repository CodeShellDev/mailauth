const express = require("express")
const router = express.Router()

const { DecodeToken, SignToken } = require("../token")

const logger = require("../logger")
const config = require("../config")
const db = require("../db")

const { parse: ParseUrl } = require("tldts")

const qs = require("querystring")

const axios = require("axios")

async function TokenExchange(
	endpoint,
	code,
	id,
	secret,
	grantType,
	redirectURI
) {
	try {
		const data = {
			grant_type: "authorization_code",
			code: code,
			redirect_uri: redirectURI,
			client_id: id,
			client_secret: secret,
		}

		const formData = qs.stringify(data)

		const response = await axios.post(endpoint, formData, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		})

		logger.debug(`Token Exchange:\n`, response.data)

		return response.data
	} catch (error) {
		logger.err(`Error during Token Exchange:`, error)
	}
}

async function GetUserInfo(endpoint, token) {
	try {
		const response = await axios.get(endpoint, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})

		logger.debug(`Userinfo:\n`, response.data)

		return response.data
	} catch (error) {
		logger.err(`Error while getting Userinfo:`, error)
	}
}

async function IsOwnedByUser(id, email) {
	let user = await db.GetUserByID(id)

	if (user) {
		for (let i = 0; i < user.mailboxes.length; i++) {
			const mailbox = user.mailboxes[i]

			if (mailbox.email === email) {
				return true
			}
		}
	}

	return false
}

function GetBaseUrl(req, overwriteHost = null) {
	const prot = req.protocol
	let host = req.get("host")

	if (overwriteHost) {
		host = overwriteHost
	}

	return `${prot}://${host}`
}

function GetMatchingRedirectUri(req, redirectUris, host = null) {
	const baseUrl = GetBaseUrl(req, host)

	const rootDomain = ParseUrl(baseUrl).domain

	let candidates = []

	for (let i = 0; i < redirectUris.length; i++) {
		const uri = redirectUris[i]

		const uriRoot = ParseUrl(uri).domain

		if (uriRoot === rootDomain) {
			candidates.push(uri)
		}
	}

	if (candidates.length > 1) {
		const subdomain = ParseUrl(baseUrl).subdomain

		for (let i = 0; i < candidates.length; i++) {
			const uri = candidates[i]

			const uriSubdomain = ParseUrl(uri).subdomain

			if (uriSubdomain === subdomain) {
				candidates = [uri]

				break
			}
		}
	}

	return candidates[0]
}

router.get("/authorize", async (req, res, next) => {
	const originalUrl = req.get("Referer")

	const originalHost = new URL(originalUrl).host

	const queryString = Object.entries(req.query)
		.map(
			([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`
		)
		.join("&")

	if (ParseUrl(GetBaseUrl(req)).domain !== ParseUrl(originalUrl).domain) {
		const newUrl = `${GetMatchingRedirectUri(
			req,
			config.MAIL_REDIRECT_URIS,
			originalHost
		).replace("callback", "authorize")}?${queryString}`

		await db.WriteToCache(`state:${req.query.state}`, originalHost)

		return res.redirect(newUrl)
	}

	const newUrl = `${config.MAIL_AUTHORIZATION_ENDPOINT}?${queryString}`

	await db.WriteToCache(`state:${req.query.state}`, req.get("host"))

	return res.redirect(newUrl)
})

router.get("/callback", async (req, res, next) => {
	const originalHost = await db.GetFromCache(`state:${req.query.state}`)

	logger.debug(originalHost)

	const tokenRes = await TokenExchange(
		config.MAIL_TOKEN_ENDPOINT,
		req.query.code,
		config.MAIL_CLIENT_ID,
		config.MAIL_CLIENT_SECRET,
		"authorization_code",
		GetMatchingRedirectUri(req, config.MAIL_REDIRECT_URIS, originalHost)
	)

	await db.WriteToCache(`code:${req.query.code}`, tokenRes, true)

	const idToken = DecodeToken(tokenRes.id_token)

	await db.WriteToCache(`access:${tokenRes.access_token}`, idToken.sub)

	req.session.mail = {
		code: req.query.code,
		state: req.query.state,
		id: idToken.sub,
	}

	return res.redirect("/select")
})

router.get("/mailbox", async (req, res, next) => {
	const mailData = req.session.mail

	const originalHost = await db.GetFromCache(`state:${mailData.state}`)

	req.session.mail = {}

	const tokenRes = await db.GetFromCache(`code:${mailData.code}`, true)

	const idToken = DecodeToken(tokenRes.id_token)

	await db.WriteToCache(`id:${idToken.sub}`, mailData.selected_mailbox)

	return res.redirect(
		`${GetMatchingRedirectUri(
			req,
			config.MAIL_CALLBACK_URIS,
			originalHost
		)}?code=${mailData.code}&state=${mailData.state}`
	)
})

router.post("/token", async (req, res, next) => {
	const tokenRes = await db.GetFromCache(`code:${req.body.code}`, true)

	await db.DeleteFromCache(`code:${req.body.code}`)

	const idToken = tokenRes.id_token
	const accessToken = tokenRes.access_token

	const decoded = DecodeToken(idToken)

	let newPayload = decoded

	const id = await db.GetFromCache(`access:${accessToken}`)

	const mailbox = await db.GetFromCache(`id:${id}`)

	if (await IsOwnedByUser(id, mailbox)) {
		newPayload.email = mailbox
	}

	newPayload.iss = config.MAIL_ISSUER

	const newIdToken = SignToken(newPayload)

	const responseBody = {
		access_token: accessToken,
		token_type: "Bearer",
		expires_in: 300,
		id_token: newIdToken,
		scope: tokenRes.scope,
	}

	return res.status(200).json(responseBody)
})

router.get("/userinfo", async (req, res, next) => {
	const accessToken = req.headers["authorization"].split("Bearer ")[1]

	let userinfo = await GetUserInfo(config.MAIL_USERINFO_ENDPOINT, accessToken)

	if (userinfo) {
		const id = await db.GetFromCache(`access:${accessToken}`)

		const mailbox = await db.GetFromCache(`id:${id}`)

		if (await IsOwnedByUser(id, mailbox)) {
			userinfo.email = mailbox
		}

		await db.DeleteFromCache(`access:${accessToken}`)
		await db.DeleteFromCache(`id:${id}`)

		return res.status(200).json(userinfo)
	} else {
		throw Error("Userinfo undefined")
	}
})

module.exports = router
