jQuery(function () {
    setTimeout(
        addStatment('P69', 10, 'en'), 2000)
});

function addStatment(propertyID, value, unit = '') {
    // If property is already on page
    if ($(`#${propertyID}`).length) {
        $(`#${propertyID} > .wikibase-statementlistview`).statementlistview('enterNewItem').then(() => {
            // Observe snakview value since this element exists before value input is loaded
            const targetNodes = $('.wikibase-snakview-value');

            // Options for the observer (which mutations to observe)
            const config = { attributes: false, childList: true, subtree: true };

            // Callback function to execute when mutations are observed
            const callback = function (mutationList, observer) {
                // Use traditional 'for loops' for IE 11
                for (const mutation of mutationList) {

                    if (mutation.type === 'childList' && $('.valueview-input').length) {

                        observer.disconnect()
                        var valueInput = $('.valueview-input').eq(0)

                        valueInput.val(value)

                        if ($('.valueview-expert-wikibaseitem-input').length) {
                            valueInput.entityselector('search').then(() => {

                                var valueSearchList = $('.ui-ooMenu').eq(1);
                                var valueTopResult = valueSearchList.children('.ui-ooMenu-item').eq(0)

                                $('.valueview').on('valueviewchange', () => {
                                    $('.wikibase-toolbar-button-save > a').trigger('click')
                                })

                                valueSearchList.ooMenu('activate', valueTopResult)
                                valueSearchList.ooMenu('select')

                            })
                        }
                        else if ($('.valueview-expert-MonolingualText-input').length) {
                            $('.valueview-input').eq(0).trigger('focus')
                            setTimeout(() => {
                                var unitInput = $('.ui-inputextender-extension > .ui-suggester-input')
                                unitInput.val(unit)
                                setTimeout(() => {
                                    unitInput.trigger({ type: 'keydown.suggester', keyCode: $.ui.keyCode.SPACE })
                                }, 500)
                                $('.valueview').on('valueviewchange', () => {
                                    $('.wikibase-toolbar-button-save > a').trigger('click')
                                })

                            }, 1500)

                        }
                        else if ($('.valueview-expert-QuantityInput-input').length) {
                            $('.valueview-input').eq(0).trigger('focus')
                            setTimeout(() => {
                            var unitInput = $('.ui-inputextender-extension > .ui-suggester-input')
                                unitInput.val(unit)
                                setTimeout(() => {
                                    unitInput.unitsuggester('search')
                                }, 500)
                                $('.valueview').on('valueviewchange', () => {
                                    $('.wikibase-toolbar-button-save > a').trigger('click')
                                })
                            }, 1000)
                        }


                    }
                }
            };

            // Create an observer instance linked to the callback function
            const observer = new MutationObserver(callback);

            // Start observing the target node for configured mutations
            targetNodes.each(function () {
                observer.observe(this, config);
            });
        })
    }
    else {
        $('.wikibase-statementgrouplistview').eq(0).statementgrouplistview('enterNewItem').then(() => {
            var propertyInput = $('.wikibase-snakview-property > .ui-suggester-input');

            propertyInput.val(propertyID)

            propertyInput.entityselector('search').then(() => {
                var propertySearchList = $('.ui-ooMenu:not(.wikibase-entitysearch-list)');
                var propertyTopResult = $('.ui-ooMenu:not(.wikibase-entitysearch-list) > .ui-ooMenu-item').eq(0)

                propertySearchList.ooMenu('activate', propertyTopResult)
                propertySearchList.ooMenu('select')

                // Observe snakview value since this element exists before value input is loaded
                const targetNodes = $('.wikibase-snakview-value');

                // Options for the observer (which mutations to observe)
                const config = { attributes: false, childList: true, subtree: true };

                // Callback function to execute when mutations are observed
                const callback = function (mutationList, observer) {
                    // Use traditional 'for loops' for IE 11
                    for (const mutation of mutationList) {

                        if (mutation.type === 'childList' && $('.valueview-expert-wikibaseitem-input').length) {

                            observer.disconnect()
                            var valueInput = $('.valueview-expert-wikibaseitem-input').eq(0)

                            valueInput.val(valueID)

                            valueInput.entityselector('search').then(() => {

                                var valueSearchList = $('.ui-ooMenu:not(.wikibase-entitysearch-list)').eq(1);
                                var valueTopResult = $('.ui-ooMenu:not(.wikibase-entitysearch-list)').eq(1).children('.ui-ooMenu-item').eq(0)

                                $('.valueview').on('valueviewchange', () => {
                                    $('.wikibase-toolbar-button-save > a').trigger('click')
                                })

                                valueSearchList.ooMenu('activate', valueTopResult)
                                valueSearchList.ooMenu('select')

                            })

                        }
                    }
                };

                // Create an observer instance linked to the callback function
                const observer = new MutationObserver(callback);

                // Start observing the target node for configured mutations
                targetNodes.each(function () {
                    observer.observe(this, config);
                });


            })
        })
    }
}