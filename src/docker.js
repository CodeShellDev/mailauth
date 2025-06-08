const logger = require("./logger")
const db = require("./db")

module.exports = () => {
	process.on("SIGTERM", async () => {
		logger.log("Received SIGTERM, shutting down gracefully...")

		await db.Close()

		process.exit(0)
	})

	process.on("SIGINT", async () => {
		logger.log("Received SIGINT, shutting down gracefully...")

		await db.Close()

		process.exit(0)
	})
}
