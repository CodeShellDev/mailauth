const logger = require("./logger")

function HandleVariable(data, expectedType) {
	const variable = data.value
	const varName = data.name

	if (variable == null || variable == undefined || variable === "") {
		logger.env(`${varName} is not set`)
	} else if (typeof variable != expectedType) {
		logger.env(
			`${varName} is of type ${typeof variable}, expected ${expectedType}`
		)
	} else {
		logger.debug(`${varName} = ${variable}`)
	}

	exports[varName] = variable
	return variable
}

HandleVariable(
	{ name: "LOG_LEVEL", value: parseInt(process.env.LOG_LEVEL) || 1 },
	"number"
)

const HOST = HandleVariable({ name: "HOST", value: process.env.HOST }, "string")

HandleVariable({ name: "PREFIX", value: process.env.PREFIX || "/" }, "string")

HandleVariable(
	{ name: "SESSION_SECRET", value: process.env.SESSION_SECRET },
	"string"
)

HandleVariable({ name: "DB_HOST", value: process.env.DB_HOST }, "string")

HandleVariable({ name: "REDIS_HOST", value: process.env.REDIS_HOST }, "string")

HandleVariable(
	{ name: "DB_NAME", value: process.env.DB_NAME || "mailauth" },
	"string"
)

// |-----------------------------------------------------------------------------------------------------------| \\

HandleVariable({ name: "APP_ISSUER", value: process.env.APP_ISSUER }, "string")
HandleVariable(
	{
		name: "APP_AUTHORIZATION_ENDPOINT",
		value: process.env.APP_AUTHORIZATION_ENDPOINT,
	},
	"string"
)
HandleVariable(
	{ name: "APP_TOKEN_ENDPOINT", value: process.env.APP_TOKEN_ENDPOINT },
	"string"
)
HandleVariable(
	{ name: "APP_USERINFO_ENDPOINT", value: process.env.APP_USERINFO_ENDPOINT },
	"string"
)
HandleVariable(
	{
		name: "APP_REDIRECT_PATH",
		value: process.env.APP_REDIRECT_PATH || `/oauth/app/callback`,
	},
	"string"
)

HandleVariable(
	{ name: "APP_CLIENT_ID", value: process.env.APP_CLIENT_ID },
	"string"
)
HandleVariable(
	{ name: "APP_CLIENT_SECRET", value: process.env.APP_CLIENT_SECRET },
	"string"
)

HandleVariable(
	{ name: "APP_SCOPE", value: process.env.APP_SCOPE || "openid profile email" },
	"string"
)

// |-----------------------------------------------------------------------------------------------------------| \\

HandleVariable(
	{ name: "MAIL_ISSUER", value: process.env.MAIL_ISSUER || HOST },
	"string"
)
HandleVariable(
	{
		name: "MAIL_AUTHORIZATION_ENDPOINT",
		value: process.env.MAIL_AUTHORIZATION_ENDPOINT,
	},
	"string"
)
HandleVariable(
	{ name: "MAIL_TOKEN_ENDPOINT", value: process.env.MAIL_TOKEN_ENDPOINT },
	"string"
)
HandleVariable(
	{ name: "MAIL_USERINFO_ENDPOINT", value: process.env.MAIL_USERINFO_ENDPOINT },
	"string"
)
HandleVariable(
	{
		name: "MAIL_REDIRECT_URIS",
		value: process.env.MAIL_REDIRECT_URIS.split(",") || [
			`${HOST}/oauth/mail/callback`,
		],
	},
	"object"
)

HandleVariable(
	{
		name: "MAIL_CALLBACK_URIS",
		value: process.env.MAIL_CALLBACK_URIS.split(","),
	},
	"object"
)

HandleVariable(
	{ name: "MAIL_CLIENT_ID", value: process.env.MAIL_CLIENT_ID },
	"string"
)
HandleVariable(
	{ name: "MAIL_CLIENT_SECRET", value: process.env.MAIL_CLIENT_SECRET },
	"string"
)
