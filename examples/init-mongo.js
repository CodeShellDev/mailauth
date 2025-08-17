const PASSWORD = process.env.MONGO_PW
const USER = process.env.MONGO_USER
const DB = process.env.MONGO_INITDB_DATABASE

db = db.getSiblingDB(DB) // Switch to your target database
db.createUser({
	user: USER,
	pwd: PASSWORD,
	roles: [
		{ role: "readWrite", db: DB }, // Give read/write access to 'mailauth'
	],
})
