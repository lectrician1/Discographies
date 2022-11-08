jQuery(() => {
	const urlParams = new URLSearchParams(window.location.search)

	if (urlParams.has('diff')) {
		const preloadPage = 'User:Lectrician1/new_revision_discussion'

		const talkPagePath = $('#ca-talk > a').attr('href')

		const revisionUsername = $('#mw-diff-ntitle2 > a > bdi').html()
		const possibleRevisionDescription = $('#mw-diff-ntitle3 > span').html()
		// if possibleRevisionDescription starts with '(' then slice the ends. otherwise return ''
		const revisionDescription = possibleRevisionDescription.startsWith('(') ? possibleRevisionDescription.slice(1, -1) + ' ' : ''

		const preloadParams = [
			location.host,
			urlParams.get('diff'),
			urlParams.get('oldid'),
			urlParams.get('title'),
			revisionUsername
		]

		const preloadTitle = `Revision ${revisionDescription}by ${revisionUsername}`

		const preloadParamsText = preloadParams.map((param) => `&preloadparams[]=${param}`).join('')

		const newTopicURL = encodeURI(`${location.origin}${talkPagePath}?action=edit&section=new&preloadtitle=${preloadTitle}&preload=${preloadPage}${preloadParamsText}`)

		$('#mw-diff-ntitle1 > strong').append(`
			<span>(<a href="${newTopicURL}">discuss</a>)</span>
		`)
	}
});