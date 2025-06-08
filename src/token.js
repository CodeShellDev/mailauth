const jwt = require("jsonwebtoken")
const fs = require("fs")
const path = require("path")

const privateKey = fs.readFileSync(path.join(__dirname, "./keys/private.key"))

function SignToken(payload) {
	const options = {
		algorithm: "RS256",
		keyid: "middleware-key-1",
	}

	return jwt.sign(payload, privateKey, options)
}

function DecodeToken(idToken) {
	return jwt.decode(idToken)
}

exports.SignToken = SignToken
exports.DecodeToken = DecodeToken
