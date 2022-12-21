/**
 * THIS IS A COMPILED TYPESCRIPT FILE
 * SEE THE ACTUAL SOURCE CODE AT User:Lectrician1/discographies.js/ts.js
 * 
 * Name: discographies.js
 * Description: Shows useful discography data and functions on 
 *  discography items
 * Note: Only meant to work on page refresh. This is because the 
 *  lag time between creating a statement like "publication date"
 *  and it showing up in BlazeGraph and then by this script is high.
 * Author: Lectrician1
 * License: CC0
 * Functions taken from: 
 *  https://www.wikidata.org/wiki/User:Nikki/ExMusica.js
 *  https://www.wikidata.org/wiki/User:Magnus_Manske/duplicate_item.js
 */

import { SiteData, SiteEntities, WikibaseItem, WikibaseStatement, WikibaseItemProperty, WikibaseDateProperty, WikibaseQuantityProperty, WikibaseMonolingualTextProperty, sparqlQuery, AskQueryResponse } from "./DiscographiesClasses";
import { showCreateRelease } from './CreateRelease'
import { startShowDiscography } from './ShowDiscography'
import { showCreateTrack } from './CreateTrack'

mw.hook("wikibase.entityPage.entityLoaded").add(async function (thisEntityPageData: WikibaseItem) {

	let siteData = getSiteData()

	var siteEntities = siteData.entities

	// Script run conditions
	if (thisEntityPageData.type !== "item")
		return;

	if (!thisEntityPageData.claims.hasOwnProperty(siteEntities.properties.instance_of.id))
		return;

	let thisEntityID = thisEntityPageData.title

	const ifReleaseGroupQuery = `ASK {
        wd:${thisEntityID} wdt:${siteEntities.properties.instance_of.id}/wdt:${siteEntities.properties.subclass_of.id}* wd:${siteEntities.items.release_group.id};
        wdt:${siteEntities.properties.performer.id} [].
    }`;

	$('#toc').after(`<div id="discographies"></div>`)

	// Run 
	if ((await sparqlQuery(siteData, ifReleaseGroupQuery) as AskQueryResponse).boolean) {
		await startShowDiscography(thisEntityPageData, siteData)
		await showCreateRelease(thisEntityPageData, siteData)
	}

	let isMusicalWork = (p31Value: WikibaseStatement) => {
		return p31Value.mainsnak.datavalue.value.id === siteEntities.items.musical_work_composition.id
	}

	if (thisEntityPageData.claims['P31'].find(isMusicalWork)) {
		showCreateTrack(thisEntityID, siteEntities)
	}
})

function getSiteData() {
	var siteData: SiteData

	switch (window.location.hostname) {
		case 'www.wikidata.org':
			siteData = {
				sparqlEndpoint: 'https://query.wikidata.org/sparql?format=json',
				entities: {
					items: {
						release_group: {
							id: 'Q108346082'
						},
						release: {
							id: 'Q2031291'
						},
						various_artists: {
							id: 'Q3108914'
						},
						musical_work_composition: {
							id: 'Q105543609'
						},
						song: {
							id: 'Q7366'
						},
						audio_track: {
							id: 'Q7302866'
						},
						music_track_with_vocals: {
							id: 'Q55850593'
						},
						music_track_without_vocals: {
							id: 'Q55850643'
						}
					},
					properties: {
						instance_of: new WikibaseItemProperty('P31', 'instance_of'),
						subclass_of: new WikibaseItemProperty('P279', 'subclass_of'),
						title: new WikibaseMonolingualTextProperty('P1476', 'title'),
						genre: new WikibaseItemProperty('P136', 'genre'),
						performer: new WikibaseItemProperty('P175', 'performer'),
						record_label: new WikibaseItemProperty('P264', 'record_label'),
						publication_date: new WikibaseDateProperty('P577', 'publication_date'),
						number_of_parts_of_this_work: new WikibaseQuantityProperty('P2635', 'number_of_parts_of_this_work'),
						tracklist: new WikibaseItemProperty('P658', 'tracklist'),
						release_of: new WikibaseItemProperty('P9831', 'release_of'),
						form_of_creative_work: new WikibaseItemProperty('P7937', 'form_of_creative_work'),
						language_of_work_or_name: new WikibaseItemProperty('P407', 'language_of_work_or_name'),
						recording_performance_of: new WikibaseItemProperty('P2550', 'recording_performance_of'),
					}
				}
			}
			break
		default:
			throw (new Error('This script is not supported on this site. Please add siteData'))
	}

	return siteData
}