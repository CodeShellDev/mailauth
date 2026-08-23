import { FindOrCreate, FindBy, DeleteFromArrayBy } from "#utils/db"
import logger from "#utils/logger"

export async function FindOrCreateUser(id, name) {
	return await FindOrCreate(
		"users",
		{ id: id },
		{
			id: id,
			name: name,
			mailboxes: [],
		},
	)
}

export async function GetUserByID(id) {
	return await FindBy("users", { id: id })
}

export async function DeleteUserByID(id) {
	const res = await DeleteFromArrayBy("users", { id: id })

	logger.warn("Deleted a User")
	return res
}
