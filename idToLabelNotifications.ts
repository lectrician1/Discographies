jQuery(() => {
    $('.mw-echo-ui-notificationBadgeButtonPopupWidget-notice a').on('click', () => {
        var entities: string[] = [];

        $('.mw-echo-ui-notificationBadgeButtonPopupWidget-popup strong').each((index, element) => {
            if (element.innerText.includes('Q') || element.innerText.includes('L') || element.innerText.includes('P')) {
                entities.push(element.innerText)
            }
        })

        var api = new mw.Api();

        const d = await api.get({
            action: 'wbgetentities',
            ids: entities,
            format: 'json'
        }).promise()

        const userLanguages = OO.ui.getUserLanguages();

        $.each(d.entities, function (entityID, entity) {
            entityID = String(entityID)
            for (let language of userLanguages) {
                if (entity.labels[language]) {
                    $(`.mw-echo-ui-notificationBadgeButtonPopupWidget-popup strong:contains('${entityID}')`).val(`${entity.labels[language].value} (${entityID})`)
                    break;
                }
            }
        });
    })
})