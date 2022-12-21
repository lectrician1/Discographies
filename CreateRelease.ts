import { copyItem, WikibaseItem, SiteData, sparqlQuery, SelectQueryResponse, linkToID, addItemStatement } from "./DiscographiesClasses"

export async function showCreateRelease(thisEntityPageData: WikibaseItem, siteData: SiteData) {

	let siteEntities = siteData.entities

	let thisEntityID = thisEntityPageData.title

	// Create release button
	$('#discographies').append(`<a id="createRelease">Create release</a>`)

	$('#createRelease').on('click', async function () {

		let releaseQueryVariable = 'release'

		// Get release type item of this release group type
		const releaseGroupReleaseQuery = `SELECT ?release WHERE {
                    ?${releaseQueryVariable} wdt:${siteEntities.properties.release_of.id} wd:${thisEntityPageData.claims.P31[0].mainsnak.datavalue.value.id};
                             wdt:${siteEntities.properties.subclass_of.id}* wd:${siteEntities.items.release.id}.
                  }`

		var releaseGroupReleaseResponse = await sparqlQuery(siteData, releaseGroupReleaseQuery) as SelectQueryResponse

		var propertiesToKeep: string[] = [
			siteEntities.properties.performer,
			siteEntities.properties.genre,
			siteEntities.properties.number_of_parts_of_this_work,
			siteEntities.properties.publication_date,
			siteEntities.properties.record_label,
			siteEntities.properties.title,
			siteEntities.properties.tracklist
		].map(property => property.id)

		var releaseTypeID = linkToID((releaseGroupReleaseResponse.results.bindings)[0][releaseQueryVariable].value)

		var claimsToAdd = {
			...addItemStatement(siteEntities.properties.release_of.id, thisEntityID),
			...addItemStatement(siteEntities.properties.instance_of.id, releaseTypeID)
		}

		await copyItem(thisEntityID, propertiesToKeep, claimsToAdd)
	})
}