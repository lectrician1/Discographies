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

// Wikibase API interfaces
interface WikibaseItem {
    title: string
    type: string
    claims: WikibaseClaims
}

interface WikibaseClaims {
    [property: string]: [{
        mainsnak: {
            datavalue: {
                value: {
                    id: string
                }
            }
        }
    }]
}

// Store all of the site data in an object so that it can be redefined if the script needs to be used on a different site
class SiteData {
    sparqlEndpoint: string

    // Store entity ids used by the script in a labeled object so that they are easily understood in the codebase
    entities: {
        items: {
            release_group: string
            release: string
            various_artists: string
            musical_work_composition: string
            song: string
        }
        properties: {
            instance_of: string
            subclass_of: string
            title: string
            genre: string
            performer: string
            record_label: string
            publication_date: string
            number_of_parts_of_this_work: string
            tracklist: string
            release_of: string
            form_of_creative_work: string
        }
    }
}

var siteData = new SiteData

switch (window.location.hostname) {
    case 'www.wikidata.org':
        siteData = {
            sparqlEndpoint: 'https://query.wikidata.org/sparql?format=json',
            entities: {
                items: {
                    release_group: 'Q108346082',
                    release: 'Q2031291',
                    various_artists: 'Q3108914',
                    musical_work_composition: 'Q105543609',
                    song: 'Q7366'
                },
                properties: {
                    instance_of: 'P31',
                    subclass_of: 'P279',
                    title: 'P1476',
                    genre: 'P136',
                    performer: 'P175',
                    record_label: 'P264',
                    publication_date: 'P577',
                    number_of_parts_of_this_work: 'P2635',
                    tracklist: 'P658',
                    release_of: 'P9831',
                    form_of_creative_work: 'P7937'
                }
            }
        }
}

var siteEntities = siteData.entities

interface BoolResponse {
    boolean: boolean
    head: {}
}

class Entity {
    id: string
    type: {
        id: string
        label: string
        link: string
    }
}

var api = new mw.Api();

mw.hook("wikibase.entityPage.entityLoaded").add(async function (thisEntityPageData: WikibaseItem) {
    if (thisEntityPageData.type !== "item")
        return;

    if (!thisEntityPageData.claims.hasOwnProperty(siteEntities.properties.instance_of))
        return;

    var thisEntity = new Entity

    thisEntity.id = thisEntityPageData.title

    thisEntity.type.id = thisEntityPageData.claims.P31[0].mainsnak.datavalue.value.id

    const instanceOfClass = `wdt:${siteEntities.properties.instance_of}/wdt:${siteEntities.properties.subclass_of}*`

    var releaseGroupQuery = `ASK {
        wd:${thisEntity.id} ${instanceOfClass} wd:${siteEntities.items.release_group};
                            wdt:${siteEntities.properties.performer} [].
      }`

    sparqlAsk(releaseGroupQuery, releaseGroupFunction(thisEntity, thisEntityPageData))

    var songQuery = `ASK {
        wd:${thisEntity.id} wdt:${siteEntities.properties.instance_of} wd:${siteEntities.items.musical_work_composition};
                            wdt:${siteEntities.properties.form_of_creative_work} wd:${siteEntities.items.song}.
    }`

    sparqlAsk(songQuery, songFunction())
})

function releaseGroupFunction(thisEntity: Entity, thisEntityPageData: WikibaseItem) {
    createRelease(thisEntity)
    createChronologicalData(thisEntity, thisEntityPageData)
}

function createRelease(thisEntity: Entity) {
    $('#toc').after(`<div><a id="createRelease">Create a release for this release group</a></div>`)

    // Create release button
    $('#createRelease').on('click', async function () {

        const releaseGroupReleaseQuery = `SELECT ?release WHERE {
                    ?release wdt:${siteEntities.properties.release_of} wd:${thisEntity.type.id};
                             wdt:${siteEntities.properties.subclass_of}* wd:${siteEntities.items.release}.
                  }`

        interface ReleaseGroupRelease {
            release: SelectResult
        }

        var releaseGroupReleaseResponse = await sparqlQuery(releaseGroupReleaseQuery) as SelectResponse

        var propertiesToKeep = [
            siteEntities.properties.performer,
            siteEntities.properties.genre,
            siteEntities.properties.number_of_parts_of_this_work,
            siteEntities.properties.publication_date,
            siteEntities.properties.record_label,
            siteEntities.properties.title,
            siteEntities.properties.tracklist
        ]

        var releaseTypeID = linkToID((releaseGroupReleaseResponse.results.bindings as Array<ReleaseGroupRelease>)[0].release.value)

        var claimsToAdd = {
            ...addItemStatement(siteEntities.properties.release_of, thisEntity.id),
            ...addItemStatement(siteEntities.properties.instance_of, releaseTypeID)
        }

        await copyItem(thisEntity, true, propertiesToKeep, claimsToAdd)
    })
}

async function createChronologicalData(thisEntity: Entity, thisEntityPageData: WikibaseItem) {
    // Prevent chronological data from running on releases whose artists are "various artists"
    if (entityHasStatementValues(siteEntities.properties.performer, thisEntityPageData.claims, [siteEntities.items.various_artists]))
        return;

    // Show loading label while data is retrieved
    $('#createRelease').after(`<div id="chronologicalDataLabel">Loading chronological data...</div>`)

    // Get a list of strings of the ids of the performers we need to query
    var performerList = '';
    for (let performer of thisEntityPageData.claims[siteEntities.properties.performer]) {
        performerList += `wd:${performer.mainsnak.datavalue.value.id} `
    }

    // Get all the releases by the performers
    const performerReleasesQuery = `SELECT ?release ?releaseLabel ?type ?typeLabel ?performer ?performerLabel ?date WHERE {
            SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
            VALUES ?performer {${performerList}}
            ?release wdt:${siteEntities.properties.performer} ?performer.
            ?type wdt:${siteEntities.properties.subclass_of}* wd:${siteEntities.items.release_group}.
            ?release wdt:${siteEntities.properties.instance_of} ?type.
            OPTIONAL { ?release wdt:${siteEntities.properties.publication_date} ?date }
          }`

    interface PerformerReleasesQueryResponse {
        release: SelectResult,
        releaseLabel: SelectResult,
        type: SelectResult,
        typeLabel: SelectResult,
        performer: SelectResult,
        performerLabel: SelectResult,
        date?: SelectResult
    }

    interface ResultField {
        id: string
        label: string
        link: string
    }

    class ParsedResult {
        type: ResultField
        date: string
        performer: ResultField
        release: ResultField
    }

    class ReleaseLists {
        dated: ParsedResult[]
        noDate: ParsedResult[]
    }

    const releaseDataResponse = await sparqlQuery(performerReleasesQuery) as SelectResponse

    const adjacentData = { 'Last': -1, 'Next': 1 }

    $(`#chronologicalDataLabel`).html(`<a id="mainChronologicalDataLink">Show chronological data</a>`)
    $(`#chronologicalDataLabel`).after(`<div id="mainChronologicalData" style="display: none"></div>`)
    $('#mainChronologicalDataLink').on('click', function () {
        $('#mainChronologicalData').slideToggle('fast');
    });

    // Make list for each perfomer
    for (let performer of thisEntityPageData.claims[siteEntities.properties.performer]) {
        const performerID = performer.mainsnak.datavalue.value.id

        var releases = {
            releaseGroup: new ReleaseLists,
            releaseGroupType: new ReleaseLists
        }

        for (var queryResult of releaseDataResponse.results.bindings as Array<PerformerReleasesQueryResponse>) {
            var parsedResult = new ParsedResult

            var hasDate: boolean = false

            // Move results data to simplified parsed list
            Object.keys(queryResult).forEach((key) => {
                if (queryResult[key]) {
                    // Move date value to just "date" property
                    if (key == 'date') {
                        parsedResult.date = queryResult.date!.value
                        hasDate = true
                    }
                    else if (key.includes('Label')) parsedResult[key.slice(0, -5)].label = queryResult[key].value
                    else {
                        // Rename "value" key to "link"
                        parsedResult[key].link = queryResult[key].value
                        // Pre-parse QID of release
                        parsedResult[key].id = linkToID(parsedResult[key].link)
                    }
                }
            })

            if (parsedResult!.performer.id == performerID) {

                pushResult(releases.releaseGroup, parsedResult)

                if (parsedResult!.type.id == thisEntity.type.id) {

                    pushResult(releases.releaseGroupType, parsedResult)

                }
            }

            function pushResult(releaseList: ReleaseLists, result: ParsedResult) {
                hasDate ? releaseList.dated.push(result) : releaseList.noDate.push(result)
            }
        }

        var queryPerformer = releases.releaseGroup[0].performer
        $('#mainChronologicalData').append(
            `<h2><a href="${queryPerformer.link}">${queryPerformer.label}</a></h2>`
        )

        var entityLinkHTML = (label, link) => `<a href="${link}">${label}</a>`

        function releaseListsCreate(releaseLists: ReleaseLists, releaseListHeader: string, instanceOfValueToAdd: string, addedListItemHTML: string) {
            
            releaseLists.dated.sort((a, b) => +new Date(a.date) - +new Date(b.date))

            var thisReleaseIndex
            var releaseListHTML = ''

            // type releases publication
            // type releases
            // release gorup publicatin
            // release group 

            generateList(releaseLists.dated, [addedListItemHTML, ])
            if (releaseLists.noDate.length > 0) {
                releaseListHTML += `<h4>Without publication date</h4>`)
                generateList(releaseLists.noDate, ` - ${releaseDateHTML(result)}`)
            }

            function generateList(releaseList: ParsedResult[], parts: string[]) {
            $.each(releaseList, (i, result) => {

                var resultHTML = entityLinkHTML(result.release.label, result.release.link)

                for (var part of parts) {

                }

                var releaseHTML = (result) => entityLinkHTML(result.release.label, result.release.link)
                var releaseDateHTML = (result) => result.date ? new Date(result.date).toISOString().split('T')[0] : 'No publication date!'

                if (result.release.id == thisEntity.id) {
                    thisReleaseIndex = i
                    releaseListHTML += `<b>${resultHTML}</b>`
                }
                releaseListHTML += `<li>${resultHTML}</li>`

            })
            }

            $('#mainChronologicalData').append(`<h3>${releaseListHeader}</h3>`)

            $('#mainChronologicalData').append(`<div>Series ordinal: ${thisReleaseIndex + 1} of ${releaseList.length}`)

            // Releases before and after this one
            Object.keys(adjacentData).forEach((offset) => {

                var adjacentRelease = releaseList[thisReleaseIndex + adjacentData[offset]];

                var adjacentValue;

                if (adjacentRelease) adjacentValue = entityLinkHTML(adjacentRelease.release.label, adjacentRelease.release.link)
                else {
                    var createNewID = `createNew-${performerID}-${instanceOfValueToAdd}`
                    adjacentValue = `<a id="${createNewID}">Create new</a>`

                    $(`#${createNewID}`).on('click', async () => await copyItem(
                        thisEntity,
                        false,
                        [siteEntities.properties.performer],
                        addItemStatement(siteEntities.properties.instance_of, instanceOfValueToAdd)
                    ))
                }

                $('#mainChronologicalData').append(`<div>${offset}: ${adjacentValue}</div>`)

            })

            thisEntity.type.label = releases.releaseGroupType[0].type.label
        thisEntity.type.link = releases.releaseGroupType[0].type.link

        

        // Create this entity release group type list
        releaseListsCreate(
            releases.releaseGroupType,
            entityLinkHTML(thisEntity.type.label, thisEntity.type.link),
            thisEntity.type.id,
            (result) => `${releaseHTML(result)}`
        )

        var entityIDToLink = (id) => `https://www.wikidata.org/wiki/${id}`

        // Create this entity release group list
        releaseListsCreate(
            releases.releaseGroup,
            entityLinkHTML('release group', entityIDToLink(siteEntities.items.release_group)),
            siteEntities.items.release_group,
            (result) => {
                var releaseTypeHTML = entityLinkHTML(result.type.label, result.type.link)

                return `${releaseHTML(result)} - ${releaseTypeHTML}`
            }
        )

            var releaseListHTMLID = `${performerID}-${instanceOfValueToAdd}`

            $('#mainChronologicalData').append(`<a id="${releaseListHTMLID}-link">Show list</a>`)
            $(`#${releaseListHTMLID}-link`).on('click', function () {
                $(`#${releaseListHTMLID}`).slideToggle('fast');
            });
            $('#mainChronologicalData').append(`<ol id="${releaseListHTMLID}" style="display: none"></ol>`)
            $(`#${releaseListHTMLID}`).append(releaseListHTML)

        }

        
    }

}

interface SelectResponse {
    results: {
        bindings: []
    }
}

interface SelectResult {
    value: string,
}

function songFunction() {
    
}

// Utility functions

var addItemStatement = (propID, valueID) => ({
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

var linkToID = (link) => link.replace(/.*\//, "")

function entityHasStatementValues(property: string, claims: WikibaseClaims, values: Array<string>) {
    for (let claim of claims[property]) {
        if (values.includes(claim.mainsnak.datavalue.value.id))
            return true;
    }
    return false;
}

async function getEditToken(callback) {
    const d = await api.get({
        action: 'query',
        meta: 'tokens',
        format: 'json'
    })
    var token = d.query.tokens.csrftoken;
    if (typeof token == 'undefined') {
        alert("Problem getting edit token");
        return;
    }
    console.log(d)
    await callback(token);
}

async function createNewItem(q, data) {
    await getEditToken(async function (token) {
        console.log(data)
        const d = await $.post('/w/api.php', {
            action: 'wbeditentity',
            new: 'item',
            data: JSON.stringify(data),
            token: token,
            summary: 'Item release created from ' + q,
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

async function copyItem(item: Entity, askLabels: boolean, propertiesToKeep: string[], claimsToAdd: Object) {
    const d = await api.get({
        action: 'wbgetentities',
        ids: thisEntity.id,
        format: 'json'
    })
    var eNow = d.entities[thisEntity.id];

    $.each(eNow.claims, function (p, v) {
        if (propertiesToKeep.includes(String(p))) $.each(v, (i, c) => {
            delete c.id
        });
        else delete eNow.claims[p]
    });

    var data = {
        // descriptions : e.descriptions || {} ,
        // labels : e.labels || {} ,
        // aliases : e.aliases || {} ,
        labels: Object,
        aliases: Object,
        claims: {
            ...eNow.claims,
            ...claimsToAdd
        }
    };

    console.log(data)

    if (askLabels && window.confirm("Duplicate all labels and aliases? You will need to fix them in all languages!")) {
        data.labels = eNow.labels || {};
        data.aliases = eNow.aliases || {};
    }
    await createNewItem(thisEntity.id, data);

}

async function sparqlQuery(query: string) {
    return await $.post(siteData.sparqlEndpoint, { query: query })
}

async function sparqlAsk(query: string, callback) {
    (await sparqlQuery(query) as BoolResponse).boolean ? callback() : {}
}