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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// Load site-specific data for the script to use
var siteData;
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
        };
}
var siteEntities = siteData.entities;
var instanceOfClass = "wdt:".concat(siteEntities.properties.instance_of, "/wdt:").concat(siteEntities.properties.subclass_of, "*");
var api = new mw.Api;
mw.hook("wikibase.entityPage.entityLoaded").add(function (thisEntityPageData) {
    return __awaiter(this, void 0, void 0, function () {
        var ifReleaseGroupQuery;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Script run conditions
                    if (thisEntityPageData.type !== "item")
                        return [2 /*return*/];
                    if (!thisEntityPageData.claims.hasOwnProperty(siteEntities.properties.instance_of))
                        return [2 /*return*/];
                    ifReleaseGroupQuery = "ASK {\n        wd:".concat(thisEntityPageData.title, " ").concat(instanceOfClass, " wd:").concat(siteEntities.items.release_group, ";\n        wdt:").concat(siteEntities.properties.performer, " [].\n    }");
                    return [4 /*yield*/, sparqlQuery(ifReleaseGroupQuery)];
                case 1:
                    // Run 
                    (_a.sent()).boolean ? releaseGroupFeature(thisEntityPageData) : {};
                    return [2 /*return*/];
            }
        });
    });
});
function releaseGroupFeature(thisEntityPageData) {
    createReleaseFeature(thisEntityPageData);
    chronologicalDataFeature(thisEntityPageData);
}
function createReleaseFeature(thisEntityPageData) {
    $('body').append("<link rel=\"stylesheet\" type=\"text/css\" href=\"https://cdn.datatables.net/1.12.1/css/jquery.dataTables.css\">\n  \n    <script type=\"text/javascript\" charset=\"utf8\" src=\"https://cdn.datatables.net/1.12.1/js/jquery.dataTables.js\"></script>");
    // Create release button
    $('#toc').after("<div><a id=\"createRelease\">Create a release for this release group</a></div>");
    $('#createRelease').on('click', function () {
        return __awaiter(this, void 0, void 0, function () {
            var releaseGroupReleaseQuery, releaseGroupReleaseResponse, propertiesToKeep, releaseTypeID, claimsToAdd;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        releaseGroupReleaseQuery = "SELECT ?release WHERE {\n                    ?release wdt:".concat(siteEntities.properties.release_of, " wd:").concat(thisEntityPageData.claims.P31[0].mainsnak.datavalue.value.id, ";\n                             wdt:").concat(siteEntities.properties.subclass_of, "* wd:").concat(siteEntities.items.release, ".\n                  }");
                        return [4 /*yield*/, sparqlQuery(releaseGroupReleaseQuery)];
                    case 1:
                        releaseGroupReleaseResponse = _a.sent();
                        propertiesToKeep = [
                            siteEntities.properties.performer,
                            siteEntities.properties.genre,
                            siteEntities.properties.number_of_parts_of_this_work,
                            siteEntities.properties.publication_date,
                            siteEntities.properties.record_label,
                            siteEntities.properties.title,
                            siteEntities.properties.tracklist
                        ];
                        releaseTypeID = linkToID(releaseGroupReleaseResponse.results.bindings[0].release.value);
                        claimsToAdd = __assign(__assign({}, addItemStatement(siteEntities.properties.release_of, thisEntityPageData.title)), addItemStatement(siteEntities.properties.instance_of, releaseTypeID));
                        return [4 /*yield*/, copyItem(thisEntityPageData, true, propertiesToKeep, claimsToAdd)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
}
var linkToID = function (link) { return link.replace(/.*\//, ""); };
function chronologicalDataFeature(thisEntityPageData) {
    return __awaiter(this, void 0, void 0, function () {
        function joinedResultsHTML(links, labels) {
            if (links.value === '')
                return '';
            var splitLinks = links.value.split('|');
            var splitLabels = labels.value.split('|');
            return splitLinks.map(function (link, index) { return entityHTML(link, splitLabels[index]); }).join(', ');
        }
        function titlesHTML(titles, languages) {
            if (titles.value === '')
                return '';
            var splitTitles = titles.value.split('|');
            var splitLanguages = languages ? languages.value.split('|') : [];
            var titlesWithLang = splitTitles.map(function (title, index) { return "".concat(title, " (").concat(splitLanguages[index], ")"); });
            return titlesWithLang.join(', ');
        }
        function joinedDates(dates) {
            if (dates.value === '')
                return '';
            var splitDates = dates.value.split('|');
            var prettyDates = splitDates.map(function (date) { return new Date(date).toISOString().split('T')[0]; });
            return prettyDates.join(', ');
        }
        var performersResults, performerQueryList, _i, _a, performer, performerID_1, userLang, chronologicalDataQuery, chronologicalDataResponse, entityHTML, entityResultHTML, _b, _c, queryResult, performerID, _d, _e, _f, performerID_2, performerResults, performerLabel, performerTableID, performerTableBodyID, _g, _h, release;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    // Prevent chronological data from running on releases whose artists are "various artists"
                    if (entityHasStatement(siteEntities.properties.performer, [siteEntities.items.various_artists], thisEntityPageData.claims))
                        return [2 /*return*/];
                    // Show loading label while data is retrieved
                    $('#createRelease').after("<div id=\"chronologicalDataLabel\">Loading chronological data...</div>");
                    performersResults = {};
                    performerQueryList = '';
                    // Compile list of ids of the performers we need to query data for and initialize performer results objects in performerResults object
                    for (_i = 0, _a = thisEntityPageData.claims[siteEntities.properties.performer]; _i < _a.length; _i++) {
                        performer = _a[_i];
                        performerID_1 = performer.mainsnak.datavalue.value.id;
                        performersResults[performerID_1] = [];
                        performerQueryList += "wd:".concat(performerID_1, " ");
                    }
                    userLang = mw.config.get('wgContentLanguage');
                    chronologicalDataQuery = "SELECT DISTINCT ?release ?releaseLabel ?performer\n    (group_concat(DISTINCT ?type;separator=\"|\") as ?types) \n    (group_concat(DISTINCT ?typeLabel;separator=\"|\") as ?typeLabels)\n    (group_concat(DISTINCT ?date;separator=\"|\") as ?dates) \n    (group_concat(DISTINCT ?title;separator=\"|\") as ?titles)\n    (group_concat(DISTINCT ?titleLanguage;separator=\"|\") as ?titleLanguages) \n    (group_concat(DISTINCT ?language;separator=\"|\") as ?languages) \n    (group_concat(DISTINCT ?languageLabel;separator=\"|\") as ?languageLabels) \n    WHERE {\n                SERVICE wikibase:label { bd:serviceParam wikibase:language \"".concat(userLang, "\". }\n                VALUES ?performer {").concat(performerQueryList, "}\n                ?release wdt:").concat(siteEntities.properties.performer, " ?performer;\n                         wdt:").concat(siteEntities.properties.instance_of, " ?type.\n                ?type wdt:").concat(siteEntities.properties.subclass_of, "* wd:").concat(siteEntities.items.release_group, ".\n                ?type rdfs:label ?typeLabel.\n                FILTER (lang(?typeLabel) = '").concat(userLang, "')\n                OPTIONAL { \n                    ?release wdt:").concat(siteEntities.properties.publication_date, " ?date.\n                }\n                OPTIONAL {\n                    ?release wdt:").concat(siteEntities.properties.title, " ?title\n                    BIND ( lang(?title) AS ?titleLanguage )\n                }\n                OPTIONAL {\n                    ?release wdt:").concat(siteEntities.properties.language_of_work_or_name, " ?language.\n                    ?language rdfs:label ?languageLabel.\n                    FILTER (lang(?languageLabel) = '").concat(userLang, "')\n                }\n              }\n    GROUP BY ?release ?releaseLabel ?performer");
                    return [4 /*yield*/, sparqlQuery(chronologicalDataQuery)];
                case 1:
                    chronologicalDataResponse = _j.sent();
                    entityHTML = function (link, label) { return "<a href=\"".concat(link, "\">").concat(label, "</a>"); };
                    entityResultHTML = function (link, label) { return entityHTML(link.value, label.value); };
                    // Parse the release data so that it is easily usable and move it to appropriate performers 
                    for (_b = 0, _c = chronologicalDataResponse.results.bindings; _b < _c.length; _b++) {
                        queryResult = _c[_b];
                        performerID = linkToID(queryResult.performer.value);
                        // Move results data to simplified parsed list and add it to its performer list
                        performersResults[performerID].push({
                            release: entityResultHTML(queryResult.release, queryResult.releaseLabel),
                            types: joinedResultsHTML(queryResult.types, queryResult.typeLabels),
                            titles: titlesHTML(queryResult.titles, queryResult.titleLanguages),
                            dates: joinedDates(queryResult.dates),
                            languages: joinedResultsHTML(queryResult.languages, queryResult.languageLabels)
                        });
                    }
                    // Create chronological data storage element
                    $("#chronologicalDataLabel").after("<div id=\"mainChronologicalData\" style=\"display: none\"></div>");
                    // Make list for each perfomer
                    for (_d = 0, _e = Object.entries(performersResults); _d < _e.length; _d++) {
                        _f = _e[_d], performerID_2 = _f[0], performerResults = _f[1];
                        performerLabel = $("#".concat(siteEntities.properties.performer)).find("a[href='/wiki/".concat(performerID_2, "']")).html();
                        $('#mainChronologicalData').append("<h2>".concat(performerLabel, "</h2>"));
                        performerTableID = "".concat(performerID_2, "-chronological-data");
                        performerTableBodyID = "".concat(performerID_2, "-chronological-data-body");
                        $('#mainChronologicalData').append("<table id=\"".concat(performerTableID, "\">\n            <thead>\n            <tr>\n                <th>release</th>\n                <th>").concat(entityLinkNameIDHTML('instance of', siteEntities.properties.instance_of), "</th>\n                <th>").concat(entityLinkNameIDHTML('title', siteEntities.properties.title), "</th>\n                <th>").concat(entityLinkNameIDHTML('publication date', siteEntities.properties.publication_date), "</th>\n                <th>").concat(entityLinkNameIDHTML('language of work or name', siteEntities.properties.language_of_work_or_name), "</th>\n            </tr>\n            </thead>\n            <tbody id=\"").concat(performerTableBodyID, "\">\n            </tbody>\n        </table>"));
                        // Add data to table
                        for (_g = 0, _h = Object.values(performerResults); _g < _h.length; _g++) {
                            release = _h[_g];
                            $("#".concat(performerTableBodyID)).append("<tr>\n                <td>".concat(release.release, "</td>\n                <td>").concat(release.types, "</td>\n                <td>").concat(release.titles, "</td>\n                <td>").concat(release.dates, "</td>\n                <td>").concat(release.languages, "</td>\n            </tr>"));
                        }
                        $("#".concat(performerTableID)).DataTable();
                    }
                    // Add button to show data
                    $("#chronologicalDataLabel").html("<a id=\"mainChronologicalDataLink\">Show chronological data</a>");
                    $('#mainChronologicalDataLink').on('click', function () {
                        $('#mainChronologicalData').slideToggle('fast');
                    });
                    return [2 /*return*/];
            }
        });
    });
}
// Utility functions
var addItemStatement = function (propID, valueID) {
    var _a;
    return (_a = {},
        _a[propID] = [
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
        ],
        _a);
};
function entityHasStatement(property, values, entityClaims) {
    for (var _i = 0, _a = entityClaims[property]; _i < _a.length; _i++) {
        var claim = _a[_i];
        if (values.includes(claim.mainsnak.datavalue.value.id))
            return true;
    }
    return false;
}
function getEditToken(callback) {
    return __awaiter(this, void 0, void 0, function () {
        var d, token;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, $.get('/w/api.php', {
                        action: 'query',
                        meta: 'tokens',
                        format: 'json'
                    })];
                case 1:
                    d = _a.sent();
                    token = d.query.tokens.csrftoken;
                    if (typeof token == 'undefined') {
                        alert("Problem getting edit token");
                        return [2 /*return*/];
                    }
                    console.log(d);
                    return [4 /*yield*/, callback(token)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function createNewItem(q, data) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getEditToken(function (token) {
                        return __awaiter(this, void 0, void 0, function () {
                            var d, nq, url;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        console.log(data);
                                        return [4 /*yield*/, $.post('/w/api.php', {
                                                action: 'wbeditentity',
                                                "new": 'item',
                                                data: JSON.stringify(data),
                                                token: token,
                                                summary: 'Item release created from ' + q,
                                                format: 'json'
                                            })];
                                    case 1:
                                        d = _a.sent();
                                        if (d.success == 1) {
                                            nq = d.entity.id;
                                            url = "/wiki/" + nq;
                                            window.open(url, '_blank');
                                        }
                                        else {
                                            console.log(d);
                                            alert("A problem occurred, check JavaScript console for errors");
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        });
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function copyItem(thisEntityPageData, askLabels, propertiesToKeep, claimsToAdd) {
    return __awaiter(this, void 0, void 0, function () {
        var d, eNow, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, $.get('/w/api.php', {
                        action: 'wbgetentities',
                        ids: thisEntityPageData.title,
                        format: 'json'
                    })];
                case 1:
                    d = _a.sent();
                    eNow = d.entities[thisEntityPageData.title];
                    $.each(eNow.claims, function (p, v) {
                        if (propertiesToKeep.includes(String(p)))
                            $.each(v, function (i, c) {
                                delete c.id;
                            });
                        else
                            delete eNow.claims[p];
                    });
                    data = {
                        // descriptions : e.descriptions || {} ,
                        // labels : e.labels || {} ,
                        // aliases : e.aliases || {} ,
                        labels: Object,
                        aliases: Object,
                        claims: __assign(__assign({}, eNow.claims), claimsToAdd)
                    };
                    console.log(data);
                    if (askLabels && window.confirm("Duplicate all labels and aliases? You will need to fix them in all languages!")) {
                        data.labels = eNow.labels || {};
                        data.aliases = eNow.aliases || {};
                    }
                    return [4 /*yield*/, createNewItem(thisEntityPageData.title, data)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function sparqlQuery(query) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, $.post(siteData.sparqlEndpoint, { query: query })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function sparqlAsk(query, callback) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sparqlQuery(query)];
                case 1:
                    (_a.sent()).boolean ? callback() : {};
                    return [2 /*return*/];
            }
        });
    });
}
var entityLinkHTML = function (label, link) { return "<a href=\"".concat(link, "\">").concat(label, "</a>"); };
var entityLinkNameIDHTML = function (name, id) { return "<a href=\"https://www.wikidata.org/wiki/Special:EntityData/".concat(id, "\">").concat(name, "</a>"); };
