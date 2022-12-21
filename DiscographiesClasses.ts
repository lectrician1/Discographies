// Utility classes for representing entities
interface WikibaseEntity {
	id: string
}

abstract class WikibaseProperty implements WikibaseEntity {
	constructor(public id, public label) {
		this.id = id
		this.label = label
	}
}

export class WikibaseItemProperty extends WikibaseProperty { }

export class WikibaseDateProperty extends WikibaseProperty { }

export class WikibaseQuantityProperty extends WikibaseDateProperty {}

export class WikibaseMonolingualTextProperty extends WikibaseProperty { }

// Utility classes for representing entities in a particular site
export interface SiteData {
	sparqlEndpoint: string

	// Store entity ids used by the script in a labeled object so that they are easily understood in the codebase
	entities: SiteEntities
}

export interface SiteEntities {
	items: {
		release_group: WikibaseEntity
		release: WikibaseEntity
		various_artists: WikibaseEntity
		musical_work_composition: WikibaseEntity
		song: WikibaseEntity
		audio_track: WikibaseEntity
		music_track_with_vocals: WikibaseEntity
		music_track_without_vocals: WikibaseEntity
	}
	properties: {
		instance_of: WikibaseItemProperty
		subclass_of: WikibaseItemProperty
		title: WikibaseMonolingualTextProperty
		genre: WikibaseItemProperty
		performer: WikibaseItemProperty
		record_label: WikibaseItemProperty
		publication_date: WikibaseDateProperty
		number_of_parts_of_this_work: WikibaseEntity
		tracklist: WikibaseEntity
		release_of: WikibaseItemProperty
		form_of_creative_work: WikibaseItemProperty
		language_of_work_or_name: WikibaseItemProperty
		recording_performance_of: WikibaseItemProperty
	}
}

// Wikibase API interfaces
export interface WikibaseItem {
	title: string
	type: string
	claims: WikibaseClaims
}

export interface WikibaseStatement {
	mainsnak: {
		snaktype: string
		property: string
		datatype: string
		datavalue: {
			value: {
				'entity-type': string
				id: string
			}
			type: string
		}
	}
	type: string
	rank: string
}

export interface WikibaseClaims {
	[property: string]: [WikibaseStatement]
}

// Sparql query response structures

export interface AskQueryResponse {
	boolean: boolean
	head: {}
}

export interface SelectQueryResponse {
	results: {
		bindings: [{
			[queryVariable: string]: {
				value: string
			}
		}]
	}
}

// Utility classes for representing query variables
export abstract class QueryVariable {
	name: string
	variables: string[]
	constructor(name) {
		this.name = name
	}

	abstract createGroupQuery()

	abstract createSelectQuery()

	abstract resultToTableCell(result: object)
}

export abstract class PropertyQueryVariable extends QueryVariable {
    parentVariable: QueryVariable
	property: WikibaseProperty
	optional: boolean
	constructor(parentVariable, name, property: WikibaseProperty, optional: boolean) {
		super(name)
        this.parentVariable = parentVariable
		this.property = property
		this.optional = optional
	}

	abstract createGroupQuery(): string

	abstract createSelectQuery()

	abstract createQuery()
}

export class ResultQueryVariable extends QueryVariable {
	constructor(name) {
		super(name)
	}
	createGroupQuery() {
		return `?${this.name} ?${this.name}Label `
	}

	createSelectQuery() {
		return `?${this.name} ?${this.name}Label `
	}

	resultToTableCell(result: object) {
		return entityHTML(result[this.name].value, result[`${this.name}Label`].value)
	}
}

export class ItemQueryVariable extends PropertyQueryVariable {
	constructor(parentVariable: QueryVariable, name, property: WikibaseItemProperty, optional: boolean) {
		super(parentVariable, name, property, optional)
	}

	createGroupQuery() {
		return `(GROUP_CONCAT (DISTINCT ?${this.name}; SEPARATOR = "|") AS ?${this.name}s)
(GROUP_CONCAT (DISTINCT ?${this.name}Label; SEPARATOR = "|") AS ?${this.name}Labels)
`
	}

	createSelectQuery() {
		return `?${this.name} ?${this.name}Label `
	}

	createQuery() {
		return `?${this.parentVariable.name} wdt:${this.property.id} ?${this.name}.
`
	}

	resultToTableCell(result: object) {
		let links = result[`${this.name}s`]
		let labels = result[`${this.name}Labels`]

		if (links.value === '') return ''

		const splitLinks = links.value.split('|')
		const splitLabels = labels.value.split('|')
		return splitLinks.map((link, index) => entityHTML(link, splitLabels[index])).join(', ')
	}
}

export class DateQueryVariable extends PropertyQueryVariable {
	constructor(parentVariable: QueryVariable, name, property: WikibaseDateProperty, optional: boolean) {
		super(parentVariable, name, property, optional)
	}

	createGroupQuery() {
		return `(GROUP_CONCAT (DISTINCT ?${this.name}; SEPARATOR = "|") AS ?${this.name}s)
`
	}

	createSelectQuery() {
		return `?${this.name} `
	}

	createQuery() {
		return `?${this.parentVariable.name} wdt:${this.property.id} ?${this.name}.
`
	}

	resultToTableCell(result: object) {
		let dates = result[`${this.name}s`]
		if (dates.value === '') return ''
		const splitDates = dates.value.split('|')
		const prettyDates = splitDates.map((date) => new Date(date).toISOString().split('T')[0])
		return prettyDates.join(', ')
	}
}

export class MonolingualTextQueryVariable extends PropertyQueryVariable {
	constructor(parentVariable: QueryVariable, name, property: WikibaseMonolingualTextProperty, optional: boolean) {
		super(parentVariable, name, property, optional)
	}

	createGroupQuery() {
		return `(GROUP_CONCAT (?${this.name}; SEPARATOR = "|") AS ?${this.name}s)
(GROUP_CONCAT (?${this.name}Language; SEPARATOR = "|") AS ?${this.name}Languages)
`
	}

	createSelectQuery() {
		return `?${this.name} ?${this.name}Language `
	}

	createQuery() {
		return `?${this.parentVariable.name} wdt:${this.property.id} ?${this.name}.
BIND ( lang(?${this.name}) AS ?${this.name}Language )
`
	}

	resultToTableCell(result: object) {
		let titles = result[`${this.name}s`]
		let languages = result[`${this.name}Languages`]

		if (titles.value === '') return ''
		const splitTitles = titles.value.split('|')
		const splitLanguages = languages ? languages.value.split('|') : []
		const titlesWithLang = splitTitles.map((title, index) => `${title} (${splitLanguages[index]})`)
		return titlesWithLang.join(', ')
	}
}

// Utility functions

export async function sparqlQuery(siteData: SiteData, query: string) {
	return await $.post(siteData.sparqlEndpoint, { query: query })
}

export var linkToID = (link: string): string => link.replace(/.*\//, "")

export var entityHTML = (link: string, label: string) => `<a href="${link}">${label}</a>`

// Editing items functions

export async function copyItem(thisEntityID: string, propertiesToKeep: string[], claimsToAdd: WikibaseClaims) {
	const d = await $.get('/w/api.php', {
		action: 'wbgetentities',
		ids: thisEntityID,
		format: 'json'
	})
	var eNow = d.entities[thisEntityID];

	$.each(eNow.claims, function (propertyID, statement) {
		if (propertiesToKeep.includes(String(propertyID))) $.each(statement, (i, c) => {
			delete c.id
		});
		else delete eNow.claims[propertyID]
	});

	var data = {
		claims: {
			...eNow.claims,
			...claimsToAdd
		}
	};

	console.log(data)

	await createNewItem(thisEntityID, data);
}

async function createNewItem(itemCreatedFromID: string, itemData) {
	await getEditToken(async function (token) {
		const d = await $.post('/w/api.php', {
			action: 'wbeditentity',
			new: 'item',
			data: JSON.stringify(itemData),
			token: token,
			summary: 'Item release created from ' + itemCreatedFromID,
			format: 'json'
		})
		if (d.success == 1) {
			var nq = d.entity.id
			var url = "/wiki/" + nq;
			window.open(url, '_blank');
		} else {
			console.log(d);
			alert("A problem occurred, check JavaScript console for errors");
		}
	});
}

async function getEditToken(callback) {
	const d = await $.get('/w/api.php', {
		action: 'query',
		meta: 'tokens',
		format: 'json'
	})
	var token = d.query.tokens.csrftoken;
	if (typeof token == 'undefined') {
		alert("Problem getting edit token");
		return;
	}
	await callback(token);
}

export const addItemStatement = (propID: string, valueID: string): WikibaseClaims => ({
	[propID]: [
		{
			"mainsnak": {
				"snaktype": "value",
				"property": propID,
				"datavalue": {
					"value": {
						"entity-type": "item",
						"id": valueID
					},
					"type": "wikibase-entityid"
				},
				"datatype": "wikibase-item"
			},
			"type": "statement",
			"rank": "normal"
		}
	]
})

