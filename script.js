jQuery(function () {
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('diff')) {
        var preloadPage = 'User:Lectrician1/new_revision_discussion';
        var talkPagePath = $('#ca-talk > a').attr('href');
        var revisionUsername = $('#mw-diff-ntitle2 > a > bdi').html();
        var possibleRevisionDescription = $('#mw-diff-ntitle3 > span').html();
        // if possibleRevisionDescription starts with '(' then slice the ends. otherwise return ''
        var revisionDescription = possibleRevisionDescription.startsWith('(') ? possibleRevisionDescription.slice(1, -1) + ' ' : '';
        var preloadParams = [
            location.host,
            urlParams.get('diff'),
            urlParams.get('oldid'),
            urlParams.get('title'),
            revisionUsername
        ];
        var preloadTitle = "Revision ".concat(revisionDescription, "by ").concat(revisionUsername);
        var preloadParamsText = preloadParams.map(function (param) { return "&preloadparams[]=".concat(param); }).join('');
        var newTopicURL = encodeURI("".concat(location.origin).concat(talkPagePath, "?action=edit&section=new&preloadtitle=").concat(preloadTitle, "&preload=").concat(preloadPage).concat(preloadParamsText));
        $('#mw-diff-ntitle1 > strong').append("\n\t\t\t<span>(<a href=\"".concat(newTopicURL, "\">discuss</a>)</span>\n\t\t"));
    }
});
