class PopupMenu {
	constructor({
		title = "Settings",
		description = "",
		endpoint = "/",
		fields = [],
		onSubmit = null,
	}) {
		this.title = title
		this.description = description
		this.endpoint = endpoint
		this.fields = fields
		this.onSubmit = onSubmit
		this.container = this.render()
		this.overlay = this.renderOverlay()
	}

	render() {
		const wrapper = document.createElement("div")
		wrapper.className = "mailbox-popup-menu"

		const html = `
        <h3>${this.title}</h3>
		<p>${this.description}</p>
        <br />
        <form method="post" action="${this.endpoint}">
          ${this.fields.map((field) => this.renderField(field)).join("")}
        </form>
      	`

		wrapper.innerHTML = html
		wrapper.querySelector("form").style.display = "flex"
		wrapper.querySelector("form").style.flexDirection = "row"
		wrapper.querySelector("form").style.justifyContent = "center"
		wrapper.querySelector("form").style.alignItems = "center"
		wrapper.querySelector("form").style.gap = "10px"

		wrapper.querySelector("form").addEventListener("submit", async (e) => {
			e.preventDefault()

			const elements = Array.from(e.target.elements)

			let submit = true

			const data = {}

			for (const [_k, element] of Object.entries(elements)) {
				const name = element?.dataset?.name
				const value = element?.dataset?.value

				if (name && value) {
					if (
						element.type == "submit" &&
						value === "cancel" &&
						(name === "cancel" || element.name === "cancel") &&
						value === e.submitter?.dataset?.value
					) {
						submit = false
						return this.close()
					}

					data[name] = value
				} else if (element.name) {
					data[element.name] = element.value
				}
			}

			if (!submit) return this.close()

			const response = await fetch(this.endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			})

			if (response.status === 200) {
				if (this.onSubmit) {
					this.onSubmit()
				}

				this.close()
			}
		})

		return wrapper
	}

	renderOverlay() {
		const wrapper = document.createElement("div")
		wrapper.className = "overlay"

		wrapper.addEventListener("click", (e) => {
			if (e.target === wrapper) this.close()
		})

		return wrapper
	}

	renderField(data) {
		let dataStr = ""

		const attributes = {
			action: "default",
			name: "",
			label: "",
			type: "text",
			pattern: ".*",
			placeholder: "",
		}

		for (const [key, value] of Object.entries(data)) {
			if (Object.hasOwn(attributes, key)) {
				attributes[key] = value
			} else {
				dataStr = `data-value="${value}" data-name="${key}"`
			}
		}

		return `
        <input 
			type="${attributes.type}" 
			name="${attributes.name}" 
			id="${attributes.name}" 
			value="${attributes.label}" 
			placeholder="${attributes.placeholder}" 
			pattern="${attributes.pattern}"
			data-action="${attributes.action}"
			${dataStr}
		/>
      	`
	}

	open(overwrites = []) {
		const fields = this.fields

		overwrites.forEach((overwrite) => {
			for (let fieldI = 0; fieldI < fields.length; fieldI++) {
				const field = fields[fieldI]

				if (field.name === overwrite.name) {
					for (const [_k, _v] of Object.entries(field)) {
						for (const [key, value] of Object.entries(overwrite)) {
							this.fields[fieldI][key] = value
						}
					}
				}
			}
		})

		this.container = this.render()

		document.body.appendChild(this.overlay)

		document.body.appendChild(this.container)

		this.fields = fields
	}

	close() {
		this.overlay.remove()

		this.container.remove()
	}
}

class Menu {
	constructor({
		title = "Settings",
		endpoint = "/",
		fields = [],
		onSubmit = null,
	}) {
		this.title = title
		this.endpoint = endpoint
		this.fields = fields
		this.onSubmit = onSubmit
		this.container = this.render()
		this.overlay = this.renderOverlay()
	}

	render() {
		const wrapper = document.createElement("div")
		wrapper.className = "mailbox-menu"

		const html = `
        <h3>${this.title}</h3>
        <hr /><br />
        <form method="post" action="${this.endpoint}">
          ${this.fields.map((field) => this.renderField(field)).join("<br />")}
          <hr /><br />
          <input type="submit" value="Submit" />
        </form>
      	`

		wrapper.innerHTML = html

		wrapper.querySelector("form").addEventListener("submit", async (e) => {
			e.preventDefault()

			const data = Object.fromEntries(new FormData(e.target).entries())

			const response = await fetch(this.endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			})

			if (response.status === 200) {
				if (this.onSubmit) {
					this.onSubmit()
				}

				this.close()
			}
		})

		return wrapper
	}

	renderOverlay() {
		const wrapper = document.createElement("div")
		wrapper.className = "overlay"

		wrapper.addEventListener("click", (e) => {
			if (e.target === wrapper) this.close()
		})

		return wrapper
	}

	renderField({
		label = null,
		name = "",
		type = "text",
		value = "",
		placeholder = "",
		pattern = ".*",
	}) {
		let res = `
        <input type="${type}" name="${name}" id="${name}" value="${value}" placeholder="${placeholder}" pattern="${pattern}" />
		<br />
      	`

		if (label) {
			res = `
			${label}
			${res}
			`
		}

		return res
	}

	open(overwrites = []) {
		const fields = this.fields

		overwrites.forEach((overwrite) => {
			for (let fieldI = 0; fieldI < fields.length; fieldI++) {
				const field = fields[fieldI]

				if (field.name === overwrite.name) {
					for (const [_k, _v] of Object.entries(field)) {
						for (const [key, value] of Object.entries(overwrite)) {
							this.fields[fieldI][key] = value
						}
					}
				}
			}
		})

		this.container = this.render()

		document.body.appendChild(this.overlay)

		document.body.appendChild(this.container)

		this.fields = fields
	}

	close() {
		this.overlay.remove()

		this.container.remove()
	}
}

export { Menu, PopupMenu }
