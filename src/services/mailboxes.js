import { AddToArray, DeleteFromArrayBy, UpdateBy, FindBy } from "#utils/db"

export async function EditMailbox(id, email, { name }) {
	await UpdateBy(
		"users",
		{ id: id, "mailboxes.email": email },
		{ "mailboxes.$.name": name },
	)
}

export async function CreateMailbox(id, { email, name }) {
	await AddToArray("users", { id: id }, { mailboxes: { email, name } })
}

export async function DeleteMailbox(id, email) {
	await DeleteFromArrayBy("users", { id: id }, { mailboxes: { email: email } })
}

export async function GetMailboxByEmail(email) {
	return await FindBy("users", { "mailboxes.email": email })
}
