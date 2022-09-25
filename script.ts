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

// Load site-specific data for the script to use
var siteData: SiteData

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
                    form_of_creative_work: 'P7937',
                    language_of_work_or_name: 'P407'
                }
            }
        }
}

var siteEntities = siteData!.entities

const instanceOfClass = `wdt:${siteEntities.properties.instance_of}/wdt:${siteEntities.properties.subclass_of}*`

const api = new mw.Api

mw.hook("wikibase.entityPage.entityLoaded").add(async function (thisEntityPageData: WikibaseUIItem) {

    // Script run conditions
    if (thisEntityPageData.type !== "item")
        return;

    if (!thisEntityPageData.claims.hasOwnProperty(siteEntities.properties.instance_of))
        return;

    const ifReleaseGroupQuery = `ASK {
        wd:${thisEntityPageData.title} ${instanceOfClass} wd:${siteEntities.items.release_group};
        wdt:${siteEntities.properties.performer} [].
    }`;

    // Run 
    (await sparqlQuery(ifReleaseGroupQuery) as BoolResponse).boolean ? releaseGroupFeature(thisEntityPageData) : {}
})

function releaseGroupFeature(thisEntityPageData: WikibaseUIItem) {
    createReleaseFeature(thisEntityPageData)
    chronologicalDataFeature(thisEntityPageData)
}

function createReleaseFeature(thisEntityPageData: WikibaseUIItem) {
    $('body').append(`<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.12.1/css/jquery.dataTables.css">
  
    <script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.12.1/js/jquery.dataTables.js"></script>`)

    // Create release button
    $('#toc').after(`<div><a id="createRelease">Create a release for this release group</a></div>`)

    $('#createRelease').on('click', async function () {

        // Get release item of this release group
        const releaseGroupReleaseQuery = `SELECT ?release WHERE {
                    ?release wdt:${siteEntities.properties.release_of} wd:${thisEntityPageData.claims.P31[0].mainsnak.datavalue.value.id};
                             wdt:${siteEntities.properties.subclass_of}* wd:${siteEntities.items.release}.
                  }`

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
            ...addItemStatement(siteEntities.properties.release_of, thisEntityPageData.title),
            ...addItemStatement(siteEntities.properties.instance_of, releaseTypeID)
        }

        await copyItem(thisEntityPageData, true, propertiesToKeep, claimsToAdd)
    })
}


var linkToID = (link) => link.replace(/.*\//, "")

async function chronologicalDataFeature(thisEntityPageData: WikibaseUIItem) {
    // Prevent chronological data from running on releases whose artists are "various artists"
    if (entityHasStatement(
        siteEntities.properties.performer,
        [siteEntities.items.various_artists],
        thisEntityPageData.claims
    )) return;

    // Show loading label while data is retrieved
    $('#createRelease').after(`<div id="chronologicalDataLabel">Loading chronological data...</div>`)

    var performersResults: PerformerResults = {}

    var performerQueryList = '';

    // Compile list of ids of the performers we need to query data for and initialize performer results objects in performerResults object
    for (let performer of thisEntityPageData.claims[siteEntities.properties.performer]) {
        const performerID = performer.mainsnak.datavalue.value.id

        performersResults[performerID] = []

        performerQueryList += `wd:${performerID} `
    }

    const userLang = mw.config.get('wgContentLanguage')

    // Get all the releases by the performers
    const chronologicalDataQuery = `SELECT DISTINCT ?release ?releaseLabel ?performer
    (group_concat(DISTINCT ?type;separator="|") as ?types) 
    (group_concat(DISTINCT ?typeLabel;separator="|") as ?typeLabels)
    (group_concat(DISTINCT ?date;separator="|") as ?dates) 
    (group_concat(DISTINCT ?title;separator="|") as ?titles)
    (group_concat(DISTINCT ?titleLanguage;separator="|") as ?titleLanguages) 
    (group_concat(DISTINCT ?language;separator="|") as ?languages) 
    (group_concat(DISTINCT ?languageLabel;separator="|") as ?languageLabels) 
    WHERE {
                SERVICE wikibase:label { bd:serviceParam wikibase:language "${userLang}". }
                VALUES ?performer {${performerQueryList}}
                ?release wdt:${siteEntities.properties.performer} ?performer;
                         wdt:${siteEntities.properties.instance_of} ?type.
                ?type wdt:${siteEntities.properties.subclass_of}* wd:${siteEntities.items.release_group}.
                ?type rdfs:label ?typeLabel.
                FILTER (lang(?typeLabel) = '${userLang}')
                OPTIONAL { 
                    ?release wdt:${siteEntities.properties.publication_date} ?date.
                }
                OPTIONAL {
                    ?release wdt:${siteEntities.properties.title} ?title
                    BIND ( lang(?title) AS ?titleLanguage )
                }
                OPTIONAL {
                    ?release wdt:${siteEntities.properties.language_of_work_or_name} ?language.
                    ?language rdfs:label ?languageLabel.
                    FILTER (lang(?languageLabel) = '${userLang}')
                }
              }
    GROUP BY ?release ?releaseLabel ?performer`

    const chronologicalDataResponse = await sparqlQuery(chronologicalDataQuery) as SelectResponse

    
    var entityHTML = (link: string, label: string) => `<a href="${link}">${label}</a>` 

    var entityResultHTML = (link: SelectResult, label: SelectResult) => entityHTML(link.value, label.value)

    function joinedResultsHTML(links: SelectResult, labels: SelectResult) {
        if (links.value === '') return ''
        const splitLinks = links.value.split('|')
        const splitLabels = labels.value.split('|')
        return splitLinks.map((link, index) => entityHTML(link, splitLabels[index])).join(', ')
    }

    function titlesHTML(titles: SelectResult, languages: SelectResult) {
        if (titles.value === '') return ''
        const splitTitles = titles.value.split('|')
        const splitLanguages = languages ? languages.value.split('|') : []
        const titlesWithLang = splitTitles.map((title, index) => `${title} (${splitLanguages[index]})`)
        return titlesWithLang.join(', ')
    }

    function joinedDates(dates: SelectResult) {
        if (dates.value === '') return ''
        const splitDates = dates.value.split('|')
        const prettyDates = splitDates.map((date) => new Date(date).toISOString().split('T')[0])
        return prettyDates.join(', ')
    }


    // Parse the release data so that it is easily usable and move it to appropriate performers 
    for (var queryResult of chronologicalDataResponse.results.bindings as Array<PerformerReleasesQueryResult>) {
        var performerID = linkToID(queryResult.performer.value)

        // Move results data to simplified parsed list and add it to its performer list
        performersResults[performerID].push(
            {
                release: entityResultHTML(queryResult.release, queryResult.releaseLabel),
                types: joinedResultsHTML(queryResult.types, queryResult.typeLabels),
                titles: titlesHTML(queryResult.titles, queryResult.titleLanguages),
                dates: joinedDates(queryResult.dates),
                languages: joinedResultsHTML(queryResult.languages, queryResult.languageLabels)
            }
        )
    }

    // Create chronological data storage element
    $(`#chronologicalDataLabel`).after(`<div id="mainChronologicalData" style="display: none"></div>`)

    // Make list for each perfomer
    for (const [performerID, performerResults] of Object.entries(performersResults)) {
        // Add performer heading
        const performerLabel = $(`#${siteEntities.properties.performer}`).find(`a[href='/wiki/${performerID}']`).html()
        $('#mainChronologicalData').append(`<h2>${performerLabel}</h2>`)

        // Add table
        const performerTableID = `${performerID}-chronological-data`
        const performerTableBodyID = `${performerID}-chronological-data-body`
        $('#mainChronologicalData').append(`<table id="${performerTableID}">
            <thead>
            <tr>
                <th>release</th>
                <th>${entityLinkNameIDHTML('instance of', siteEntities.properties.instance_of)}</th>
                <th>${entityLinkNameIDHTML('title', siteEntities.properties.title)}</th>
                <th>${entityLinkNameIDHTML('publication date', siteEntities.properties.publication_date)}</th>
                <th>${entityLinkNameIDHTML('language of work or name', siteEntities.properties.language_of_work_or_name)}</th>
            </tr>
            </thead>
            <tbody id="${performerTableBodyID}">
            </tbody>
        </table>`)

        // Add data to table
        for (const release of Object.values(performerResults)) {
            $(`#${performerTableBodyID}`).append(`<tr>
                <td>${release.release}</td>
                <td>${release.types}</td>
                <td>${release.titles}</td>
                <td>${release.dates}</td>
                <td>${release.languages}</td>
            </tr>`)
        }

        $(`#${performerTableID}`).DataTable();
    }

    // Add button to show data
    $(`#chronologicalDataLabel`).html(`<a id="mainChronologicalDataLink">Show chronological data</a>`)
    $('#mainChronologicalDataLink').on('click', function () {
        $('#mainChronologicalData').slideToggle('fast');
    });
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

function entityHasStatement(property: string, values: Array<string>, entityClaims: WikibaseUIClaims,) {
    for (let claim of entityClaims[property]) {
        if (values.includes(claim.mainsnak.datavalue.value.id))
            return true;
    }
    return false;
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

async function copyItem(thisEntityPageData: WikibaseUIItem, askLabels: boolean, propertiesToKeep: string[], claimsToAdd: Object) {
    const d = await $.get('/w/api.php', {
        action: 'wbgetentities',
        ids: thisEntityPageData.title,
        format: 'json'
    })
    var eNow = d.entities[thisEntityPageData.title];

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
    await createNewItem(thisEntityPageData.title, data);

}

async function sparqlQuery(query: string) {
    return await $.post(siteData.sparqlEndpoint, { query: query })
}

async function sparqlAsk(query: string, callback: () => void) {
    (await sparqlQuery(query) as BoolResponse).boolean ? callback() : {}
}

var entityLinkHTML = (label, link) => `<a href="${link}">${label}</a>`

var entityLinkNameIDHTML = (name: string, id: string) => `<a href="https://www.wikidata.org/wiki/Special:EntityData/${id}">${name}</a>`

// Store all of the site data in an object so that it can be redefined if the script needs to be used on a different site
interface SiteData {
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
            language_of_work_or_name: string
        }
    }
}

interface ReleaseGroupRelease {
    release: SelectResult
}

// Wikibase API interfaces
interface WikibaseUIItem {
    title: string
    type: string
    claims: WikibaseUIClaims
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

interface BoolResponse {
    boolean: boolean
    head: {}
}

// Non-parsed query data structure

interface SelectResult {
    value: string,
}

interface PerformerReleasesQueryResult {
    release: SelectResult,
    releaseLabel: SelectResult,
    performer: SelectResult,
    types: SelectResult,
    typeLabels: SelectResult,
    dates: SelectResult,
    titles: SelectResult,
    titleLanguages: SelectResult,
    languages: SelectResult,
    languageLabels: SelectResult
}

interface ParsedResult {
    release: string,
    types: string,
    dates: string,
    titles: string,
    languages: string
}

interface SelectResponse {
    results: {
        bindings: []
    }
}

// Parsed query data structure

interface PerformerResults {
    [performerID: string]: ParsedResult[]
}