async function run(e) {
    if (e.type !== "item")
        return;

    $('.wikibase-entitytermsview-heading').append(`
        <div id="showSenses"><a>Get senses for this item</a></div>
        `)

    await $('#showSenses').one('click', async function () {

        var results = await $.post("https://query.wikidata.org/sparql?format=json", {
            query: `SELECT ?lexeme ?sense ?gloss ?lemma ?language ?languageLabel ?category ?categoryLabel WHERE {
            SERVICE wikibase:label { bd:serviceParam wikibase:language "${mw.config.get('wgContentLanguage')}". }
            ?sense wdt:P5137 wd:${e.title}.
            ?lexeme ontolex:sense ?sense;
                   wikibase:lemma ?lemma;
                   dct:language ?language;
                   wikibase:lexicalCategory ?category.
            OPTIONAL {
              ?sense skos:definition ?gloss.
              FILTER(LANG(?gloss) = "${mw.config.get('wgContentLanguage')}")
            }
          } ` }).then()

        if (results.results.bindings.length != 0) {

            $('#showSenses').after(`<table id="senses">
        <tr>
            <th>Gloss (link to sense)</th>
            <th>Leema</th>
            <th>Language</th>
            <th>Category</th>
        <tr>
    </table>`)

            results.results.bindings.sort(function (x, y) { return x.gloss ? -1 : y.gloss ? 1 : 0; });

            for (result of results.results.bindings) {
                $('#senses').append(`
            <tr>
                <td style="text-align:center"><a href="${result.sense.value}">${result.gloss ? result.gloss.value : 'None'}</a></td>
                <td style="text-align:center"><a href="${result.lexeme.value}">${result.lemma.value}</a></td>
                <td style="text-align:center"><a href="${result.language.value}">${result.languageLabel.value}</a></td>
                <td style="text-align:center"><a href="${result.category.value}">${result.categoryLabel.value}</a></td>
            <tr>
            `)
            }
        }
        else $('#showSenses').after('<div id="senses">There are no senses linked to this item.')

        $('#showSenses').on('click', function () {
            $('#senses').toggle();
        });
    });
}

mw.hook("wikibase.entityPage.entityLoaded").add(function (e) {
    run(e)
})