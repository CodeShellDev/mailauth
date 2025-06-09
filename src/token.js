const jwt = require("jsonwebtoken")
const fs = require("fs")
const path = require("path")

const logger = require("./logger")

const { generateKeyPairSync } = require("crypto")

const keyPath = path.join(__dirname, "../secrets/private_key.pem")

let privateKey

function CheckForKey() {
	if (fs.existsSync(keyPath)) {
		privateKey = fs.readFileSync(keyPath, "utf8")

		logger.log("Loaded existing RSA private key")
	} else {
		const { privateKey: genPrivKey, publicKey: genPubKey } =
			generateKeyPairSync("rsa", {
				modulusLength: 2048,
				publicKeyEncoding: {
					type: "spki",
					format: "pem",
				},
				privateKeyEncoding: {
					type: "pkcs8",
					format: "pem",
				},
			})

		fs.mkdirSync(path.dirname(keyPath), { recursive: true })
		fs.writeFileSync(keyPath, genPrivKey)
		fs.writeFileSync(
			path.join(__dirname, "../secrets/public_key.pem"),
			genPubKey
		)
		privateKey = genPrivKey

		logger.log("Generated new RSA key pair")
	}
}

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

CheckForKey()

exports.SignToken = SignToken
exports.DecodeToken = DecodeToken
exports.CheckForKey = CheckForKey
