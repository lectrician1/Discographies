import { WikibaseItem, SiteData, ItemQueryVariable, DateQueryVariable, WikibaseClaims, MonolingualTextQueryVariable, QueryVariable, ResultQueryVariable, PropertyQueryVariable, SelectQueryResponse, sparqlQuery } from "./DiscographiesClasses"

export async function startShowDiscography(thisEntityPageData: WikibaseItem, siteData: SiteData) {

	console.log('hi')

    var siteEntities = siteData.entities

	// Add datatables css and js
	$('body').append(`<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.12.1/css/jquery.dataTables.css">
    <script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.12.1/js/jquery.dataTables.js"></script>`)

	const chronologicalDataID = 'chronologicalData'

	// Create chronological data storage element
	$(`#discographies`).append(`<div id="${chronologicalDataID}"></div>`)

	// Prevent chronological data from running on releases whose artists are "various artists"
	if (entityHasStatement(
		siteEntities.properties.performer.id,
		[siteEntities.items.various_artists.id],
		thisEntityPageData.claims
	)) return;

	for (let performer of thisEntityPageData.claims[siteEntities.properties.performer.id]) {

		// Add performer heading
		const performerID = performer.mainsnak.datavalue.value.id
		const performerLabel = $(`#${siteEntities.properties.performer.id}`).find(`a[href='/wiki/${performerID}']`).html()
		const performerSectionID = `${performerID}-chronological-data`

		$(`#${chronologicalDataID}`).append(`<div id="${performerSectionID}">
			<a>Show chronological data for ${performerLabel}</a>
			<span></span>
			<table style="display: none"></table>
		</div>`)

		// Add click event to show chronological data
		$(`#${performerSectionID} a`).one('click', async function () {
			$(`#${performerSectionID} > span`).html('Loading...')

			const userLang = mw.config.get('wgContentLanguage')

			let parentVariable = new ResultQueryVariable('label')

			let queryVariables: QueryVariable[] = [
				parentVariable,
				new ItemQueryVariable(parentVariable, 'release', siteEntities.properties.instance_of, false),
				new ItemQueryVariable(parentVariable, 'release_type', siteEntities.properties.form_of_creative_work, true),
				new DateQueryVariable(parentVariable, 'date', siteEntities.properties.publication_date, true),
				new MonolingualTextQueryVariable(parentVariable, 'title', siteEntities.properties.title, true),
				new ItemQueryVariable(parentVariable, 'language', siteEntities.properties.language_of_work_or_name, true)
			]

			let query = `SELECT DISTINCT `

			for (let queryVariable of queryVariables) {
				query += queryVariable.createGroupQuery()
			}

			query += `WHERE {
        {
            SELECT `

			for (let queryVariable of queryVariables) {
				query += queryVariable.createSelectQuery()
			}

			query += `WHERE {
        SERVICE wikibase:label { bd:serviceParam wikibase:language "${userLang}". }
        VALUES ?performer {wd:${performerID}}
        ?label wdt:${siteEntities.properties.performer.id} ?performer.
        ?release wdt:${siteEntities.properties.subclass_of.id}* wd:${siteEntities.items.release_group.id}.
    `

			for (let queryVariable of queryVariables) {
				if (queryVariable instanceof PropertyQueryVariable) {
					if (queryVariable.optional) {
						query += `OPTIONAL {
                    ${queryVariable.createQuery()}
                }
                `
					}
					else query += queryVariable.createQuery()
				}
			}

			query += `} 
        }
    } GROUP BY ${parentVariable.createSelectQuery()}`

			console.log(query)

			const chronologicalDataResponse = await sparqlQuery(siteData, query) as SelectQueryResponse

			// Add table
			$(`#${performerSectionID} table`).append(`
        <thead>
            <tr></tr>
        </thead>
        <tbody></tbody>`)

			// Add headings
			for (let queryVariable of queryVariables) {
				$(`#${performerSectionID} > table > thead > tr`).append(`<th>${queryVariable.name}</th>`)
			}

			// Add rows
			for (var queryResult of chronologicalDataResponse.results.bindings) {

				$(`#${performerSectionID} > table > tbody`).append(`<tr></tr>`)

				// Add cells
				for (let queryVariable of queryVariables) {
					const cell = queryVariable.resultToTableCell(queryResult)
					$(`#${performerSectionID} > table > tbody > tr`).eq(-1).append(`<td>${cell}</td>`)
				}
			}

			$(`#${performerSectionID} > table`).DataTable();

			$(`#${performerSectionID} > div > table`).show();

			$(`#${performerSectionID} > span`).remove()

			$(`#${performerSectionID} > a`).on('click', function () {
				$(`#${performerSectionID} > div`).slideToggle('fast');
			});


		});
	}
}

// Need to declare outside of main scope since clases use it. 


// Utility functions

function entityHasStatement(property: string, values: Array<string>, entityClaims: WikibaseClaims) {
	for (let claim of entityClaims[property]) {
		if (values.includes(claim.mainsnak.datavalue.value.id))
			return true;
	}
	return false;
}