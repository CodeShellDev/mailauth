// This is only for initializing the db and creating the mailauth user

db = db.getSiblingDB("mailauth")
db.createUser({
	user: "mailauth",
	pwd: "SECURE_PW", // This should match the one in your env
	roles: [{ role: "readWrite", db: "mailauth" }],
})
