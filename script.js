/**
 * Name: discographies.js
 * Descriptions: Shows useful discography data and functions on 
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

function addInfo(e) {
    if (e.type !== "item")
        return;

    if (!e.claims.hasOwnProperty("P31"))
        return;

    // Data about release groups and releases
    var releaseData = []

    // Properties to copy from release group to release
    let releaseProps = {
        instance_of: 'P31',
        title: 'P1476',
        genre: 'P136',
        performer: 'P175',
        record_label: 'P264',
        publication_date: 'P577',
        number_of_parts_of_this_work: 'P2635',
        tracklist: 'P658',
        release_of: 'P9831',
    }

    var linkToID = (link) => link.replace(/.*\//, "")

    var releaseQuery = `SELECT ?release_group ?release_groupLabel ?release ?releaseLabel WHERE {
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
        ?release_group wdt:P279 wd:Q108346082.
        ?release wdt:P9831 ?release_group.
      }`

    $.post("https://query.wikidata.org/sparql?format=json", { query: releaseQuery }, function (data) {
        if (!data.results.bindings.length)
            return;

        for (queryResult of data.results.bindings) {
            releaseData.push({
                label: queryResult.release_groupLabel.value,
                id: linkToID(queryResult.release_group.value),
                link: queryResult.release_group.value,
                release: {
                    label: queryResult.releaseLabel.value,
                    id: linkToID(queryResult.release.value),
                    link: queryResult.release.value,
                }
            })
        }
    })


    function hasp31(claims, list) {
        for (let i = 0; i < claims.P31.length; i++) {
            if (list.includes(claims.P31[i].mainsnak.datavalue.value.id))
                return true;
        }
        return false;
    }


    // If release group

    let releaseGroupIDs = [] 
    
    $.each(releaseData, (index, type) =>{
        releaseGroupIDs.push(type.id)
    })

    if (hasp31(e.claims, releaseGroupIDs) && e.claims.hasOwnProperty(releaseProps.performer)) {

        const qID = e.title;

        var api = '/w/api.php'

        function getEditToken(callback) {
            $.post(api, {
                action: 'query',
                meta: 'tokens',
                format: 'json'
            }, function (d) {
                var token = d.query.tokens.csrftoken;
                if (typeof token == 'undefined') {
                    alert("Problem getting edit token");
                    return;
                }
                callback(token);
            });
        }

        function createNewItem(q, data) {
            getEditToken(function (token) {
                $.post(api, {
                    action: 'wbeditentity',
                    'new': 'item',
                    data: JSON.stringify(data),
                    token: token,
                    summary: 'Item release created from ' + q,
                    format: 'json'
                }, function (d) {
                    if (d.success == 1) {
                        var nq = d.entity.id
                        var url = "/wiki/" + nq;
                        window.open(url, '_blank');
                    } else {
                        console.log(d);
                        alert("A problem occurred, check JavaScript console for errors");
                    }
                }, 'json');
            });
        }

        function runNewItem(askLabels, propertiesToKeep, claimsToAdd, claimFormatting) {
            $.get(api, {
                action: 'wbgetentities',
                ids: qID,
                format: 'json'
            }, function (d) {
                var eNow = d.entities[q];
                var data = {
                    // descriptions : e.descriptions || {} ,
                    // labels : e.labels || {} ,
                    // aliases : e.aliases || {} ,
                    claims: {
                        ...eNow.claims,
                        ...claimsToAdd
                    }
                };
                if (askLabels && window.confirm("Duplicate all labels and aliases? You will need to fix them in all languages!")) {
                    data.labels = eNow.labels || {};
                    data.aliases = eNow.aliases || {};
                }
                $.each(data.claims, function (p, v) {
                    if (propertiesToKeep.includes(p)) $.each(v, (i, c) => {
                        delete c.id
                        claimFormatting(data, p, v, i, c)
                    });
                    else delete data.claims[p]
                });
                createNewItem(q, data);
            }, 'json');

        }


        $('#toc').after(`<div><a id="createRelease">Create release for this release group</a></div>`)
        $('#createRelease').on('click', function () {

            var releaseOf = {
                "P9831": [
                    {
                        "mainsnak": {
                            "snaktype": "value",
                            "property": "P9831",
                            "datavalue": {
                                "value": {
                                    "entity-type": "item",
                                    "id": qID
                                },
                                "type": "wikibase-entityid"
                            },
                            "datatype": "wikibase-item"
                        },
                        "type": "statement",
                        "rank": "normal"
                    }
                ],
            }
            
            runNewItem(true, releaseProps, releaseOf, (data, p, v, i, c) => {
                if (p == 'P31') {
                    data.claims[p][i].mainsnak.datavalue.value.id = p31values[c.mainsnak.datavalue.value.id]
                }
            })

        });



        $('#createRelease').after(`<div id="chronologicalDataLabel">Loading chronological data...</div>`)

        // Get a list of strings of the ids of the performers we need to query
        var performerList = '';
        for (performer of e.claims.P175) {
            performerList += `wd:${performer.mainsnak.datavalue.value.id} `
        }

        // Get all the releases by the performers
        const query = `SELECT ?release ?releaseLabel ?type ?typeLabel ?performer ?performerLabel ?date WHERE {
            SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
            VALUES ?performer {${performerList}}
            ?release wdt:P175 ?performer.
            ?type wdt:P279* wd:Q108346082.
            ?release wdt:P31 ?type.
            OPTIONAL { ?release wdt:P577 ?date }
          }`


        $.post("https://query.wikidata.org/sparql?format=json", { query: query }, function (data) {

            const typeID = e.claims.P31[0].mainsnak.datavalue.value.id

            const adjacentData = { 'Last': -1, 'Next': 1 }

            $(`#chronologicalDataLabel`).html(`<a id="mainChronologicalDataLink">Show chronological data</a>`)
            $(`#chronologicalDataLabel`).after(`<div id="mainChronologicalData" style="display: none"></div>`)
            $('#mainChronologicalDataLink').on('click', function () {
                $('#mainChronologicalData').slideToggle('fast');
            });

            for (performer of e.claims.P175) {
                const performerID = performer.mainsnak.datavalue.value.id

                var releases = {
                    type: {
                        results: [],
                        heading: (type) => `<a href="${type.link}"> ${type.label} (${type.id})</a>`
                    },
                    all: {
                        results: [],
                        heading: (type) => `<a href="https://www.wikidata.org/wiki/Q108346082"> release group (Q108346082)</a>`
                    }
                }

                for (result of data.results.bindings) {
                    // Remove the .values thing part of every result and just make it the value
                    Object.keys(result).forEach((key) => {
                        // Move date value to just "date" property
                        if (key == 'date') result.date = result.date.value
                        else if (key.includes('Label')) result[key.slice(0, -5)].label = result[key].value
                        else {
                            // Rename "value" key to "link"
                            result[key].link = result[key].value
                            // Pre-parse QID of release
                            result[key].id = result[key].link.replace(/.*\//, "")
                        }

                    })

                    if (result.performer.id == performerID) {

                        releases.all.results.push(result)

                        if (result.type.id == typeID) {

                            releases.type.results.push(result)

                        }
                    }
                }

                var performerData = releases.all.results[0].performer
                $('#mainChronologicalData').append(
                    `<h2><a href="${performerData.link}">${performerData.label}</a></h2>`
                )

                Object.keys(releases).forEach((group) => {
                    var releaseGroup = releases[group];
                    var releaseGroupResults = releaseGroup.results
                    releaseGroupResults.sort((a, b) => new Date(a.date) - new Date(b.date))

                    var thisReleasePosition
                    var releaseGroupList = ''
                    $.each(releaseGroupResults, (i, result) => {
                        var releaseItem = `<a href="${result.release.link}">${result.release.label}</a> - ${new Date(result.date).toLocaleDateString()}`

                        if (result.release.id == qID) {
                            thisReleasePosition = i
                            releaseGroupList += `<li><b>${releaseItem}</b></li>`
                        }
                        else releaseGroupList += `<li>${releaseItem}</li>`

                    })


                    $('#mainChronologicalData').append(
                        `<h3>${releaseGroup.heading(releaseGroupResults[0].type)}</h3>`
                    )

                    $('#mainChronologicalData').append(`<div>Series ordinal: ${thisReleasePosition + 1} of ${releaseGroupResults.length}`)

                    // Types before and after
                    Object.keys(adjacentData).forEach((offset) => {

                        var adjacentRelease = releaseGroupResults[thisReleasePosition + adjacentData[offset]];

                        var adjacentValue = adjacentRelease
                            ? `<a href="${adjacentRelease.release.link}"> ${adjacentRelease.release.label}</a>`
                            : `<a id="newReleaseGroup">Create new</a>`


                        $('#mainChronologicalData').append(`<div>${offset}: ${adjacentValue}</div>`)

                    })

                    $(`#newReleaseGroup`).on('click', () => {
                        runNewItem(false, ['P175'],  

                    })

                    $('#mainChronologicalData').append(`<a id="${performerID}-${group}-link">Show list</a><div id="${performerID}-${group}" style="display: none"></div>`)
                    $(`#${performerID}-${group}`).append('<ol></ol>')
                    $(`#${performerID}-${group} > ol`).append(releaseGroupList)
                    $(`#${performerID}-${group}-link`).on('click', function () {
                        $(`#${performerID}-${group}`).slideToggle('fast');
                    });
                })
            }
        })
    }
}

mw.hook("wikibase.entityPage.entityLoaded").add(function (e) {
    addInfo(e);
})