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
var siteEntities;
var sparqlEndpoint = "https://query.wikidata.org/sparql?format=json";
switch (window.location.hostname) {
    case 'www.wikidata.org':
        siteEntities = {
            items: {
                release_group: 'Q108346082',
                release: 'Q2031291',
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
                release_of: 'P9831'
            }
        };
}
function addInfo(thisEntityPageData) {
    return __awaiter(this, void 0, void 0, function () {
        function sparqlQuery(query) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, $.post(sparqlEndpoint, { query: query }).promise()];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        }
        function entityHasItemValues(property, claims, values) {
            for (var _i = 0, _a = claims[property]; _i < _a.length; _i++) {
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
                        case 0: return [4 /*yield*/, api.get({
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
        function runNewItem(askLabels, propertiesToKeep, claimsToAdd) {
            return __awaiter(this, void 0, void 0, function () {
                var d, eNow, data;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, api.get({
                                action: 'wbgetentities',
                                ids: thisEntity.id,
                                format: 'json'
                            })];
                        case 1:
                            d = _a.sent();
                            eNow = d.entities[thisEntity.id];
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
                            return [4 /*yield*/, createNewItem(thisEntity.id, data)];
                        case 2:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
        var thisEntity, excludedPerformers, instanceOrSubclassOf, releaseGroupQuery, instanceOfReleaseGroupResponse, linkToID, api, addItemStatement, performerList, _i, _a, performer, performerReleasesQuery, releaseDataResponse, adjacentData_1, _loop_1, releaseGroupList, releaseGroupTypeList, parsedResult, queryPerformer, entityLinkHTML, releaseHTML, releaseDateHTML, entityIDToLink, _b, _c, performer;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (thisEntityPageData.type !== "item")
                        return [2 /*return*/];
                    if (!thisEntityPageData.claims.hasOwnProperty(siteEntities.properties.instance_of))
                        return [2 /*return*/];
                    thisEntity = {
                        id: '',
                        type: {
                            id: '',
                            label: '',
                            link: ''
                        }
                    };
                    excludedPerformers = [
                        siteEntities.items.various_artists
                    ];
                    thisEntity.id = thisEntityPageData.title;
                    thisEntity.type.id = thisEntityPageData.claims.P31[0].mainsnak.datavalue.value.id;
                    instanceOrSubclassOf = "wdt:".concat(siteEntities.properties.instance_of, "/wdt:").concat(siteEntities.properties.subclass_of, "*");
                    releaseGroupQuery = "ASK {\n        wd:".concat(thisEntity.id, " ").concat(instanceOrSubclassOf, " wd:").concat(siteEntities.items.release_group, ".\n      }");
                    return [4 /*yield*/, sparqlQuery(releaseGroupQuery)];
                case 1:
                    instanceOfReleaseGroupResponse = (_d.sent()).boolean;
                    if (!(instanceOfReleaseGroupResponse && thisEntityPageData.claims.hasOwnProperty(siteEntities.properties.performer))) return [3 /*break*/, 3];
                    linkToID = function (link) { return link.replace(/.*\//, ""); };
                    api = new mw.Api();
                    $('#toc').after("<div><a id=\"createRelease\">Create a release for this release group</a></div>");
                    addItemStatement = function (propID, valueID) {
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
                    // Create release button
                    $('#createRelease').on('click', function () {
                        return __awaiter(this, void 0, void 0, function () {
                            var releaseGroupReleaseQuery, releaseGroupReleaseResponse, propertiesToKeep, releaseTypeID, claimsToAdd;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        releaseGroupReleaseQuery = "SELECT ?release WHERE {\n                    ?release wdt:".concat(siteEntities.properties.release_of, " wd:").concat(thisEntity.type.id, ";\n                             wdt:").concat(siteEntities.properties.subclass_of, "* wd:").concat(siteEntities.items.release, ".\n                  }");
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
                                        claimsToAdd = __assign(__assign({}, addItemStatement(siteEntities.properties.release_of, thisEntity.id)), addItemStatement(siteEntities.properties.instance_of, releaseTypeID));
                                        return [4 /*yield*/, runNewItem(true, propertiesToKeep, claimsToAdd)];
                                    case 2:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        });
                    });
                    if (!!entityHasItemValues(siteEntities.properties.performer, thisEntityPageData.claims, excludedPerformers)) return [3 /*break*/, 3];
                    // Load chronological data
                    $('#createRelease').after("<div id=\"chronologicalDataLabel\">Loading chronological data...</div>");
                    performerList = '';
                    for (_i = 0, _a = thisEntityPageData.claims[siteEntities.properties.performer]; _i < _a.length; _i++) {
                        performer = _a[_i];
                        performerList += "wd:".concat(performer.mainsnak.datavalue.value.id, " ");
                    }
                    performerReleasesQuery = "SELECT ?release ?releaseLabel ?type ?typeLabel ?performer ?performerLabel ?date WHERE {\n            SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }\n            VALUES ?performer {".concat(performerList, "}\n            ?release wdt:").concat(siteEntities.properties.performer, " ?performer.\n            ?type wdt:").concat(siteEntities.properties.subclass_of, "* wd:").concat(siteEntities.items.release_group, ".\n            ?release wdt:").concat(siteEntities.properties.instance_of, " ?type.\n            OPTIONAL { ?release wdt:").concat(siteEntities.properties.publication_date, " ?date }\n          }");
                    return [4 /*yield*/, sparqlQuery(performerReleasesQuery)];
                case 2:
                    releaseDataResponse = _d.sent();
                    adjacentData_1 = { 'Last': -1, 'Next': 1 };
                    $("#chronologicalDataLabel").html("<a id=\"mainChronologicalDataLink\">Show chronological data</a>");
                    $("#chronologicalDataLabel").after("<div id=\"mainChronologicalData\" style=\"display: none\"></div>");
                    $('#mainChronologicalDataLink').on('click', function () {
                        $('#mainChronologicalData').slideToggle('fast');
                    });
                    _loop_1 = function (performer) {
                        var performerID = performer.mainsnak.datavalue.value.id;
                        releaseGroupList = [];
                        releaseGroupTypeList = [];
                        for (var _e = 0, _f = releaseDataResponse.results.bindings; _e < _f.length; _e++) {
                            var queryResult = _f[_e];
                            parsedResult = {
                                type: {
                                    id: '',
                                    label: '',
                                    link: ''
                                },
                                date: '',
                                performer: {
                                    id: '',
                                    label: '',
                                    link: ''
                                },
                                release: {
                                    id: '',
                                    label: '',
                                    link: ''
                                }
                            };
                            // Remove the .values thing part of every result and just make it the value
                            Object.keys(queryResult).forEach(function (key) {
                                if (queryResult[key]) {
                                    // Move date value to just "date" property
                                    if (key == 'date')
                                        parsedResult.date = queryResult.date.value;
                                    else if (key.includes('Label'))
                                        parsedResult[key.slice(0, -5)].label = queryResult[key].value;
                                    else {
                                        // Rename "value" key to "link"
                                        parsedResult[key].link = queryResult[key].value;
                                        // Pre-parse QID of release
                                        parsedResult[key].id = linkToID(parsedResult[key].link);
                                    }
                                }
                            });
                            if (parsedResult.performer.id == performerID) {
                                releaseGroupList.push(parsedResult);
                                if (parsedResult.type.id == thisEntity.type.id) {
                                    releaseGroupTypeList.push(parsedResult);
                                }
                            }
                        }
                        queryPerformer = releaseGroupList[0].performer;
                        $('#mainChronologicalData').append("<h2><a href=\"".concat(queryPerformer.link, "\">").concat(queryPerformer.label, "</a></h2>"));
                        entityLinkHTML = function (label, link) { return "<a href=\"".concat(link, "\">").concat(label, "</a>"); };
                        function releaseListCreate(releaseList, releaseListHeader, instanceOfValueToAdd, generateReleaseListItemHTML) {
                            var _this = this;
                            releaseList.sort(function (a, b) { return (a.date && b.date) ? (+new Date(a.date) - +new Date(b.date)) : 0; });
                            var thisReleaseIndex;
                            var releaseListHTML = '';
                            $.each(releaseList, function (i, result) {
                                if (result.release.id == thisEntity.id) {
                                    thisReleaseIndex = i;
                                    releaseListHTML += "<li><b>".concat(generateReleaseListItemHTML(result), "</b></li>");
                                }
                                else
                                    releaseListHTML += "<li>".concat(generateReleaseListItemHTML(result), "</li>");
                            });
                            $('#mainChronologicalData').append("<h3>".concat(releaseListHeader, "</h3>"));
                            $('#mainChronologicalData').append("<div>Series ordinal: ".concat(thisReleaseIndex + 1, " of ").concat(releaseList.length));
                            // Releases before and after this one
                            Object.keys(adjacentData_1).forEach(function (offset) {
                                var adjacentRelease = releaseList[thisReleaseIndex + adjacentData_1[offset]];
                                var adjacentValue;
                                if (adjacentRelease)
                                    adjacentValue = entityLinkHTML(adjacentRelease.release.label, adjacentRelease.release.link);
                                else {
                                    var createNewID = "createNew-".concat(performerID, "-").concat(instanceOfValueToAdd);
                                    adjacentValue = "<a id=\"".concat(createNewID, "\">Create new</a>");
                                    $("#".concat(createNewID)).on('click', function () { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, runNewItem(false, [siteEntities.properties.performer], addItemStatement(siteEntities.properties.instance_of, instanceOfValueToAdd))];
                                                case 1: return [2 /*return*/, _a.sent()];
                                            }
                                        });
                                    }); });
                                }
                                $('#mainChronologicalData').append("<div>".concat(offset, ": ").concat(adjacentValue, "</div>"));
                            });
                            var releaseListHTMLID = "".concat(performerID, "-").concat(instanceOfValueToAdd);
                            $('#mainChronologicalData').append("<a id=\"".concat(releaseListHTMLID, "-link\">Show list</a>"));
                            $("#".concat(releaseListHTMLID, "-link")).on('click', function () {
                                $("#".concat(releaseListHTMLID)).slideToggle('fast');
                            });
                            $('#mainChronologicalData').append("<ol id=\"".concat(releaseListHTMLID, "\" style=\"display: none\"></ol>"));
                            $("#".concat(releaseListHTMLID)).append(releaseListHTML);
                        }
                        thisEntity.type.label = releaseGroupTypeList[0].type.label;
                        thisEntity.type.link = releaseGroupTypeList[0].type.link;
                        releaseHTML = function (result) { return entityLinkHTML(result.release.label, result.release.link); };
                        releaseDateHTML = function (result) { return result.date ? new Date(result.date).toISOString().split('T')[0] : 'No publication date!'; };
                        releaseListCreate(releaseGroupTypeList, entityLinkHTML(thisEntity.type.label, thisEntity.type.link), thisEntity.type.id, function (result) { return "".concat(releaseHTML(result), " - ").concat(releaseDateHTML(result)); });
                        entityIDToLink = function (id) { return "https://www.wikidata.org/wiki/".concat(id); };
                        releaseListCreate(releaseGroupList, entityLinkHTML('release group', entityIDToLink(siteEntities.items.release_group)), siteEntities.items.release_group, function (result) {
                            var releaseTypeHTML = entityLinkHTML(result.type.label, result.type.link);
                            return "".concat(releaseHTML(result), " - ").concat(releaseTypeHTML, " - ").concat(releaseDateHTML(result));
                        });
                    };
                    for (_b = 0, _c = thisEntityPageData.claims[siteEntities.properties.performer]; _b < _c.length; _b++) {
                        performer = _c[_b];
                        _loop_1(performer);
                    }
                    _d.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
;
mw.hook("wikibase.entityPage.entityLoaded").add(function (e) {
    addInfo(e);
});
