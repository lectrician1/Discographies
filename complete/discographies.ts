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

interface SiteEntities {
    items: {
        release_group: string
        various_artists: string
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
    }
}

interface WikibaseUIClaims {
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

var siteEntities: SiteEntities

const sparqlEndpoint = "https://query.wikidata.org/sparql?format=json"

switch (window.location.hostname) {
    case 'www.wikidata.org':
        siteEntities = {
            items: {
                release_group: 'Q108346082',
                various_artists: 'Q3108914'
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
            }
        }
}



async function addInfo(thisEntityPageData) {
    if (thisEntityPageData.type !== "item")
        return;

    if (!thisEntityPageData.claims.hasOwnProperty(siteEntities.properties.instance_of))
        return;

    var thisEntity = {
        id: '',
        type: {
            id: '',
            label: '',
            link: ''
        }
    }

    var excludedPerformers = [
        siteEntities.items.various_artists
    ]

    thisEntity.id = thisEntityPageData.title;

    thisEntity.type.id = thisEntityPageData.claims.P31[0].mainsnak.datavalue.value.id

    const instanceOrSubclassOf = `wdt:${siteEntities.properties.instance_of}/wdt:${siteEntities.properties.subclass_of}*`


    async function sparqlQuery(query: string) {
        await $.post(sparqlEndpoint, { query: query }).promise()
    }

    var releaseGroupQuery = `ASK {
        wd:${thisEntity.id} ${instanceOrSubclassOf} wd:${siteEntities.items.release_group}.
      }`

    const instanceOfReleaseGroupResponse = await sparqlQuery(releaseGroupQuery)

    console.log(instanceOfReleaseGroupResponse)

    if (instanceOfReleaseGroupResponse && thisEntityPageData.claims.hasOwnProperty(siteEntities.properties.performer)) {

        var linkToID = (link) => link.replace(/.*\//, "")

        function entityHasItemValues(property: string, claims: WikibaseUIClaims, values: Array<string>) {
            for (let claim of claims[property]) {
                if (values.includes(claim.mainsnak.datavalue.value.id))
                    return true;
            }
            return false;
        }

        var api = new mw.Api();

        async function getEditToken(callback) {
            const d = await api.get({
                action: 'query',
                meta: 'tokens',
                format: 'json'
            }).promise()
            var token = d.query.tokens.csrftoken;
            if (typeof token == 'undefined') {
                alert("Problem getting edit token");
                return;
            }
            callback(token);
        }

        async function createNewItem(q, data) {
            await getEditToken(async function (token) {
                const d = await api.postWithToken('csrf', {
                    action: 'wbeditentity',
                    'new': 'item',
                    data: JSON.stringify(data),
                    token: token,
                    summary: 'Item release created from ' + q,
                    format: 'json'
                }).promise()
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

        async function runNewItem(askLabels, propertiesToKeep, claimsToAdd) {
            const d = await api.get({
                action: 'wbgetentities',
                ids: thisEntity.id,
                format: 'json'
            }).promise()
            var eNow = d.entities[thisEntity.id];

            $.each(eNow.claims, function (p, v) {
                if (propertiesToKeep.includes(p)) $.each(v, (i, c) => {
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
            if (askLabels && window.confirm("Duplicate all labels and aliases? You will need to fix them in all languages!")) {
                data.labels = eNow.labels || {};
                data.aliases = eNow.aliases || {};
            }
            await createNewItem(thisEntity.id, data);

        }



        $('#toc').after(`<div><a id="createRelease">Create a release for this release group</a></div>`)

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

        $('#createRelease').on('click', async function () {

            var releaseGroupReleaseTypeID;

            const releaseGroupReleaseQuery = `SELECT ?release ?releaseLabel WHERE {
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
                    ?release wdt:${siteEntities.properties.release_of} wd:${thisEntity.type.id}.
                  }`

            var propertiesToKeep = [
                siteEntities.properties.genre,
                siteEntities.properties.number_of_parts_of_this_work,
                siteEntities.properties.publication_date,
                siteEntities.properties.record_label,
                siteEntities.properties.title,
                siteEntities.properties.tracklist
            ]

            var claimsToAdd = {
                ...addItemStatement(siteEntities.properties.release_of, thisEntity.id),
                ...addItemStatement(siteEntities.properties.instance_of, releaseGroupReleaseTypeID)
            }

            await runNewItem(true, propertiesToKeep, claimsToAdd)
        })


        if (!entityHasItemValues(siteEntities.properties.performer, thisEntityPageData.claims, excludedPerformers)) {
            $('#createRelease').after(`<div id="chronologicalDataLabel">Loading chronological data...</div>`)

            // Get a list of strings of the ids of the performers we need to query
            var performerList = '';
            for (let performer of thisEntityPageData.claims[siteEntities.properties.performer]) {
                performerList += `wd:${performer.mainsnak.datavalue.value.id} `
            }

            // Get all the releases by the performers
            const query = `SELECT ?release ?releaseLabel ?type ?typeLabel ?performer ?performerLabel ?date WHERE {
            SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
            VALUES ?performer {${performerList}}
            ?release wdt:${siteEntities.properties.performer} ?performer.
            ?type wdt:${siteEntities.properties.subclass_of}* wd:${siteEntities.items.release_group}.
            ?release wdt:${siteEntities.properties.instance_of} ?type.
            OPTIONAL { ?release wdt:${siteEntities.properties.publication_date} ?date }
          }`

            interface ResultField {
                id: string
                label: string
                link: string
            }

            interface Result {
                type: ResultField
                date: string
                performer: ResultField
                release: ResultField
            }

            const releaseDataResponse = await $.post(sparqlEndpoint, { query: query }).promise()

            const adjacentData = { 'Last': -1, 'Next': 1 }

            $(`#chronologicalDataLabel`).html(`<a id="mainChronologicalDataLink">Show chronological data</a>`)
            $(`#chronologicalDataLabel`).after(`<div id="mainChronologicalData" style="display: none"></div>`)
            $('#mainChronologicalDataLink').on('click', function () {
                $('#mainChronologicalData').slideToggle('fast');
            });

            for (let performer of thisEntityPageData.claims[siteEntities.properties.performer]) {
                const performerID = performer.mainsnak.datavalue.value.id

                var releaseGroupList: Result[] = []
                var releaseGroupTypeList: Result[] = []

                for (var result of releaseDataResponse.results.bindings) {
                    // Remove the .values thing part of every result and just make it the value
                    Object.keys(result).forEach((key) => {
                        if (result[key]) {
                            // Move date value to just "date" property
                            if (key == 'date') result.date = result.date.value
                            else if (key.includes('Label')) result[key.slice(0, -5)].label = result[key].value
                            else {
                                // Rename "value" key to "link"
                                result[key].link = result[key].value
                                // Pre-parse QID of release
                                result[key].id = linkToID(result[key].link)
                            }
                        }
                    })

                    if (result.performer.id == performerID) {

                        releaseGroupList.push(result)

                        if (result.type.id == thisEntity.type.id) {

                            releaseGroupTypeList.push(result)

                        }
                    }
                }

                var queryPerformer = releaseGroupList[0].performer
                $('#mainChronologicalData').append(
                    `<h2><a href="${queryPerformer.link}">${queryPerformer.label}</a></h2>`
                )

                var entityLinkHTML = (label, link) => `<a href="${link}">${label}</a>`

                function releaseListCreate(releaseList: Result[], releaseListHeader, instanceOfValueToAdd, generateReleaseListItemHTML) {
                    releaseList.sort((a, b) => (a.date && b.date) ? (+new Date(a.date) - +new Date(b.date)) : 0)

                    var thisReleaseIndex
                    var releaseListHTML = ''
                    $.each(releaseList, (i, result) => {

                        if (result.release.id == thisEntity.id) {
                            thisReleaseIndex = i
                            releaseListHTML += `<li><b>${generateReleaseListItemHTML(result)}</b></li>`
                        }
                        else releaseListHTML += `<li>${generateReleaseListItemHTML(result)}</li>`

                    })

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

                            $(`#${createNewID}`).on('click', async () => await runNewItem(
                                false,
                                [siteEntities.properties.performer],
                                addItemStatement(siteEntities.properties.instance_of, instanceOfValueToAdd)
                            ))
                        }

                        $('#mainChronologicalData').append(`<div>${offset}: ${adjacentValue}</div>`)

                    })

                    var releaseListHTMLID = `${performerID}-${instanceOfValueToAdd}`

                    $('#mainChronologicalData').append(`<a id="${releaseListHTMLID}-link">Show list</a>`)
                    $(`#${releaseListHTMLID}-link`).on('click', function () {
                        $(`#${releaseListHTMLID}`).slideToggle('fast');
                    });
                    $('#mainChronologicalData').append(`<ol id="${releaseListHTMLID}" style="display: none"></ol>`)
                    $(`#${releaseListHTMLID}`).append(releaseListHTML)

                }

                thisEntity.type.label = releaseGroupTypeList[0].type.label
                thisEntity.type.link = releaseGroupTypeList[0].type.link

                var releaseHTML = (result) => entityLinkHTML(result.release.label, result.release.link)
                var releaseDateHTML = (result) => result.date ? new Date(result.date).toISOString().split('T')[0] : 'No publication date!'

                releaseListCreate(
                    releaseGroupTypeList,
                    entityLinkHTML(thisEntity.type.label, thisEntity.type.link),
                    thisEntity.type.id,
                    (result) => `${releaseHTML(result)} - ${releaseDateHTML(result)}`
                )

                var entityIDToLink = (id) => `https://www.wikidata.org/wiki/${id}`

                releaseListCreate(
                    releaseGroupList,
                    entityLinkHTML('release group', entityIDToLink(siteEntities.items.release_group)),
                    siteEntities.items.release_group,
                    (result) => {
                        var releaseTypeHTML = entityLinkHTML(result.type.label, result.type.link)

                        return `${releaseHTML(result)} - ${releaseTypeHTML} - ${releaseDateHTML(result)}`
                    }
                )
            }
        }
    }

};

mw.hook("wikibase.entityPage.entityLoaded").add(function (e: any) {
    addInfo(e);
})