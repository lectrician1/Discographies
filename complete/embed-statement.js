jQuery(function () {
    $('#P175').find('.wikibase-statementview').each(function () {
        let statementIdToAppend = $.escapeSelector($(this).attr('id'))
        let statementIDToGet = 'Q67202667$3f0d0068-4d59-ca7a-d30c-893fe64d9e27'
        let itemToGet = statementIDToGet.split('$')[0]
        let statementIDToGetEscaped = $.escapeSelector(statementIDToGet)

        let propertyID = 'P361'

        let exampleDivID = `${statementIDToGet}-example`
        let exampleDivName = `${exampleDivID}-name`
        let exampleDivIDEscaped = $.escapeSelector(exampleDivID)
        let exampleDivNameEscaped = $.escapeSelector(exampleDivName)

        $(`#${statementIdToAppend}`).find('.wikibase-statementview-mainsnak').append(`<div><div id="${exampleDivName}"></div><div id="${exampleDivID}"></div></div>`)

        $(`#${exampleDivNameEscaped}`).load(`https://www.wikidata.org/wiki/${itemToGet} .wikibase-title-label`)

        $(`#${exampleDivIDEscaped}`).load(`https://www.wikidata.org/wiki/${itemToGet} #${propertyID}`, function () {
            $(`#${exampleDivIDEscaped}`).find('.wikibase-statementlistview-listview').children(`:not(#${statementIDToGetEscaped})`).remove()
            $('.wikibase-snakview-property-container').css('display', 'block')
        });

    })
})