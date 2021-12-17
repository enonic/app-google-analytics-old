const portalLib = require('/lib/xp/portal');

exports.responseProcessor = function (req, res) {
    if (req.mode !== 'live') {
        return res;
    }

    const siteConfig = portalLib.getSiteConfig();
    if (!siteConfig) {
        return res;
    }

    const trackingID = siteConfig['trackingId'] || '';
    const enableTracking = siteConfig['enableTracking'] || false;
    const enableAnonymization = siteConfig['enableAnonymization'] || false;

    if (!trackingID || !enableTracking) {
        return res;
    }

    let snippet = '<!-- Google Analytics -->';
    snippet += '<script>';
    snippet += '(function(i,s,o,g,r,a,m){i[\'GoogleAnalyticsObject\']=r;i[r]=i[r]||function(){';
    snippet += '(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),';
    snippet += 'm=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)';
    snippet += '})(window,document,\'script\',\'//www.google-analytics.com/analytics.js\',\'ga\');';
    snippet += 'ga(\'create\', \'' + trackingID + '\', \'auto\');';
    snippet += 'ga(\'send\', \'pageview\'' + (enableAnonymization ? ', {\'anonymizeIp\': true}' : '') + ');';
    snippet += '</script>';
    snippet += '<!-- End Google Analytics -->';

    const headEnd = res.pageContributions.headEnd;
    if (!headEnd) {
        res.pageContributions.headEnd = [];
    }
    else if (typeof(headEnd) == 'string') {
        res.pageContributions.headEnd = [headEnd];
    }

    res.pageContributions.headEnd.push(snippet);

    return res;
};
