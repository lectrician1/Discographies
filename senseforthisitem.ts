const il8n: {
    [lang: string]: {
        get: string,
        notLinked: string
    }
} = {
    en: {
        get: 'Get senses for this item',
        notLinked: 'There are no senses linked to this item.'
    }
}

interface SparqlResponse {
    results: {
        bindings: any
    }
}

async function run(e) {
    if (e.type !== "item")
        return;
    
    var userLang = mw.config.get('wgContentLanguage')

    var userIl8n = il8n[userLang]

    $('.wikibase-entitytermsview-heading').append(`
        <div id="showSenses"><a>${userIl8n.get}</a></div>
        `)

    await $('#showSenses').one('click', async function () {

        var results: SparqlResponse = await $.post("https://query.wikidata.org/sparql?format=json", {
            query: `SELECT ?lexeme ?sense ?gloss ?lemma ?language ?languageLabel ?category ?categoryLabel WHERE {
            SERVICE wikibase:label { bd:serviceParam wikibase:language "${userLang}". }
            ?sense wdt:P5137 wd:${e.title}.
            ?lexeme ontolex:sense ?sense;
                   wikibase:lemma ?lemma;
                   dct:language ?language;
                   wikibase:lexicalCategory ?category.
            OPTIONAL {
              ?sense skos:definition ?gloss.
              FILTER(LANG(?gloss) = "${userLang}")
            }
          } ` })

        if (results.results.bindings.length != 0) {

            var api = new mw.Api();

            const itemIds = {
                gloss: 'Q1132324', 
                lemma: 'Q18514', 
                language: 'Q34770', 
                grammatical_category: 'Q980357'
            }

            var headings: {
                query: {
                    pages: {
                        [pageid: string]: {
                            pageid: string,
                            entityterms: {
                                title: string
                                label: string[]
                            }
                        }
                    }
                }
            } = await api.get({
                "action": "query",
                "format": "json",
                "prop": "entityterms",
                "titles": Object.values(itemIds).join('|'),
                "wbetterms": "label"
            }).promise()

            var labels: {
                [title: string]: string
            } = {}

            Object.values(headings.query.pages).forEach((page) => {
                labels[page.entityterms.title] = page.entityterms.label[0]
            })

            $('#showSenses').after(`<table id="senses">
                <tr>
                    <th>${labels[itemIds.gloss]}</th>
                    <th>${labels[itemIds.lemma]}</th>
                    <th>${labels[itemIds.language]}</th>
                    <th>${labels[itemIds.grammatical_category]}</th>
                </tr>
            </table>`)

            results.results.bindings.sort(function (x, y) { return x.gloss ? -1 : y.gloss ? 1 : 0; });

            for (var result of results.results.bindings) {
                $('#senses').append(`
            <tr>
                <td style="text-align:center"><a href="${result.sense.value}">${result.gloss ? result.gloss.value : ''}</a></td>
                <td style="text-align:center"><a href="${result.lexeme.value}">${result.lemma.value}</a></td>
                <td style="text-align:center"><a href="${result.language.value}">${result.languageLabel.value}</a></td>
                <td style="text-align:center"><a href="${result.category.value}">${result.categoryLabel.value}</a></td>
            <tr>
            `)
            }
        }
        else $('#showSenses').after(`<div id="senses">${userIl8n.notLinked}</div>`)

        $('#showSenses').on('click', function () {
            $('#senses').toggle();
        });
    });
}

mw.hook("wikibase.entityPage.entityLoaded").add(function (e) {
    run(e)
})